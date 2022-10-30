import { useContext, useState } from "react"
import { BASE_URL } from "../constans"
import context from "../context"
import Slider from "../elements/Slider"
import { useParams } from "react-router"
import { useEffect } from "react"
import dwv from 'dwv'
import cv from '@techstark/opencv-js'
import nj from "@d4c/numjs/build/module/numjs.min.js"
import { normalize, arrayMinMax, apply_windowing } from '../cv/utils/transforms'
import ReactCursorPosition from 'react-cursor-position';
import ReactSlider from 'react-slider'
import Viewport from "../elements/Viewport"
import "./Marker.css"

function Marker() {
    const {authRequestHeader} = useContext(context)
    const [wc, setWC] = useState(1000)
    const [ww, setWW] = useState(1000) // значение слайдера
    const [tags, setTags] = useState(0)
    const [mousePosition, setMousePosition] = useState({}) // x, y курсора
    const {study, instance} = useParams()
    const [CVMat, setCVMat] = useState()
    const [currentImage, setCurrentImage] = useState(0)
    var dicomParser = new dwv.dicom.DicomParser()


    // DWV setup ///////////
    dwv.image.decoderScripts = {
        "jpeg2000": "/node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
        "jpeg-lossless": "/node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
        "jpeg-baseline": "/node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
    };

    var requestHeaders = { // заголовки авторизации
        name: "Authorization",
        value: authRequestHeader["Authorization"]
    }

    const app = new dwv.App(); // настраиваем вьюпорт
    app.init({
        dataViewConfigs: {'*': []}
    });

    
    const getInstance = (url) => { // получаем DICOM с сервера
        app.loadURLs([url], {"requestHeaders": [requestHeaders]})
        app.addEventListener('loadend', () => {
            console.log(app)
            const CV_NJLoadingHandle = setInterval(() => {
                if (cv && nj) {
                    clearInterval(CV_NJLoadingHandle)
                    createMat()
                }
            }, 100)

        });
    }

    const createMat = () => {
        const image = app.getImage(0)
        setCurrentImage(image)
        const geometry = image.getGeometry()
        const size = geometry.getSize().getValues() // width, height, deep
        const buffer = image.getBuffer() 
        let float32Normalized = apply_windowing(new Float32Array(buffer), wc, ww)
        let mat = new cv.matFromArray(size[1], size[0], cv.CV_32F, float32Normalized.tolist())
        setCVMat(mat)
    }

    const parseInstance = (url) => { // парсит DICOM тэги
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.setRequestHeader("Authorization", authRequestHeader["Authorization"])
        request.responseType = 'arraybuffer';
        request.onload = (event) => {
            dicomParser.parse(event.target.response)
            const rawTags  = dicomParser.getRawDicomElements()
            parseTags(rawTags)
        };
        request.send();
    }

    const parseTags = (rawTags) => { // выводит нужные DICOM теги
        if ("x00281050" in rawTags) {
            var windowCenter = parseInt(rawTags.x00281050.value[0], 10)
        }
        if ("x00281051" in rawTags) {
            var windowWidth = parseInt(rawTags.x00281051.value[0], 10)
        }
        if ("x00281052" in rawTags) {
            var rescaleIntercept = parseInt(rawTags.x00281052.value[0], 10)
        }
        if ("x00281053" in rawTags) {
            var slope = parseInt(rawTags.x00281053.value[0], 10)
        }
        if ("x00280004" in rawTags) {
            var photometricInterpretation = parseInt(rawTags.x00280004.value[0], 10)
        }
        if ("x00280030" in rawTags) {
            var pixelSpacing = parseInt(rawTags.x00280030.value[0], 10)
        }

        console.log("windowCenter", windowCenter)
        console.log("windowWidth", windowWidth)
        console.log("rescaleIntercept", rescaleIntercept)
        console.log("slope", slope)
        console.log("photometricInterpretation", photometricInterpretation)
        console.log("pixelSpacing", pixelSpacing)
        
        setWC(windowCenter)
        setWW(windowWidth)
        setTags({windowCenter, windowWidth, rescaleIntercept, slope, photometricInterpretation, pixelSpacing})
        return windowCenter, windowWidth, rescaleIntercept, slope, photometricInterpretation, pixelSpacing
    }

    useEffect(() => { // выполняется при каждом обновлении один раз
        const url = BASE_URL + `api/instance/${study}/${instance}/`
        if (currentImage === 0) {
            getInstance(url)
        }
        if (tags === 0){
            parseInstance(url)
        }
    }, [wc, ww])

    const initTool = () => {
        // инициализируем экземпляр класса, производим какие-либо операции
    }

    const changeWindowing = (wc, ww) => {
        setWC(wc)
        setWW(ww)
        const geometry = currentImage.getGeometry()
        const size = geometry.getSize().getValues() // width, height, deep
        const buffer = currentImage.getBuffer() 
        let float32Normalized = apply_windowing(new Float32Array(buffer), wc, ww)
        let mat = new cv.matFromArray(size[1], size[0], cv.CV_32F, float32Normalized.tolist())
        setCVMat(mat)
    }

    useEffect(() => {
        if (currentImage) {
            changeWindowing(wc, ww)
        }
    }, [ww, wc])

    return ( // возвращает наполение старницы
        <div className="marker">
            <button onClick={initTool}>Инструмент</button> {/* так добавляется инструмент, функция initTool - calback, который выполняется при нажатии */}
            <h3>То что отобразили мы</h3>
            <ReactCursorPosition className="viewport" style={{width: "fit-content", margin: "0 auto"}}>
                <Viewport mat={CVMat} setMousePosition={setMousePosition}/>
            </ReactCursorPosition>
            <p>Window Center</p>
            <ReactSlider className="customSlider" thumbClassName="customSlider-thumb" trackClassName="customSlider-track" max={2048} value={wc} onChange={(value) => setWC(value)}/>
            <p>Window Width</p>
            <ReactSlider className="customSlider" thumbClassName="customSlider-thumb" trackClassName="customSlider-track" max={2048} value={ww} onChange={(value) => setWW(value)}/>
            <hr />
        </div>
    )
}

export default Marker