import { useContext, useState } from "react"
import { BASE_URL } from "../constans"
import { errorMsg } from "../elements/Notifications"
import context from "../context"
import Slider from "../elements/Slider"
import { useParams } from "react-router"
import { useEffect } from "react"
import dwv from 'dwv'

import cv from "@techstark/opencv-js"

import { apply_windowing } from "../cv/utils/transforms"
import { parseTags } from "../cv/utils/dicomProcessing"

function Marker() {
    const {authRequestHeader} = useContext(context)
    const [value_1, changeValue1] = useState(1024)
    const [value_2, changeValue2] = useState(1024)
    const {study, instance} = useParams()
    var dicomParser = new dwv.dicom.DicomParser()


    // DWV setup ///////////
    dwv.image.decoderScripts = {
        "jpeg2000": "/node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
        "jpeg-lossless": "/node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
        "jpeg-baseline": "/node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
    };

    var requestHeaders = {
        name: "Authorization",
        value: authRequestHeader["Authorization"]
    }

    const app = new dwv.App();
    app.init({
        dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
        tools: {
            WindowLevel: {},
    },
    });

    app.addEventListener('load', function () {
        app.setTool('WindowLevel');
    });

    
    const getInstance = (url) => {
        app.loadURLs([url], {"requestHeaders": [requestHeaders]})
        app.addEventListener('loadend', createMat);   
    }

    const createMat = () => {
        const image = app.getImage(0)
        const geometry = image.getGeometry()
        const size = geometry.getSize().getValues() // width, height, deep
        const buffer = image.getBuffer()
        let Int16Survey = new Int16Array(buffer)
        console.log(Int16Survey)
        let Uint8Image = apply_windowing(survey_int16, 40, 400)
        console.log(Uint8Image)
        let mat = new cv.matFromArray(size[1], size[0], cv.CV_8U, Uint8Image)
        cv.imshow("canvas", mat)
        removeUnnecessaryLayers("layerGroup0") // ???
    }
 
    const parseInstance = (url) => {
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

    const removeUnnecessaryLayers = (containerId) => {
        const container =  document.getElementById(containerId)
        const mainLayer = container.firstChild
        container.innerHTML = ""
        container.appendChild(mainLayer)
    }

    useEffect(() => {
        const url = BASE_URL + `api/instance/${study}/${instance}/`
        getInstance(url)
        // parseInstance(url)
    }, [])
    

    return (
        <div className="marker">
            <canvas id="canvas"></canvas>
            <img id="image" alt="" />
            <p>first</p>
            <Slider max={2048} value={value_1} changeValue={changeValue1}/>
            <p>second</p>
            <Slider max={4096} value={value_2} changeValue={changeValue2}/>
            <hr />
            <div className="" id="layerGroup0"></div>
        </div>
    )
}

export default Marker


// const request = new XMLHttpRequest();
        // try {
        //     request.open('GET', url);
        //     request.responseType = 'arraybuffer';
        //     request.onload = parseDicom;
        //     request.setRequestHeader("Authorization", authRequestHeader["Authorization"])
        //     request.send();
        // } catch (e) {
        //     console.log(e.response.status)
        //     if (e.response.status == 401) {
        //         window.location = "/"
        //     } else {
        //         console.error(e)
        //         errorMsg("Не смогли получить экземпляр исследования")
        //     }
        // }
    
    // const cvProcessing = async (image, width, height) => {
    //     const mat = cv.matFromImageData(image, width, height)
    //     cv.imshow("canvas", mat)
        
    // }