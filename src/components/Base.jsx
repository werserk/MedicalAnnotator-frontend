import dwv from 'dwv'
import cv from "@techstark/opencv-js"
import nj from "@d4c/numjs/build/module/numjs.min.js"
import { useContext, useState } from 'react'
import context from '../context'
import { useParams } from 'react-router-dom'
import { BASE_URL } from '../constans'
import ReactSlider from 'react-slider'
import { apply_windowing } from '../cv/utils/transforms'

const Base = () => {

    const {authRequestHeader} = useContext(context)
    const {study, instance} = useParams()
    const [wc, setWC] = useState(1000)
    const [ww, setWW] = useState(1000) // значение слайдера
    const url = BASE_URL + `api/instance/${study}/${instance}/`

    var mat, image, buffer, geometry, size, float32Normalized

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

    function updateImage(mousePositionX, mousePositionY) {
        const center = {x: mousePositionX, y: mousePositionY}
        const radius = 100
        const color = [0, 0, 255, 0]
        const thickness = -100
        cv.circle(mat, center, radius, color, thickness)
        cv.imshow("canvas", mat)
        
    }

    function createMat() {
        image = app.getImage(0)
        geometry = image.getGeometry()
        size = geometry.getSize().getValues() // width, height, deep
        buffer = image.getBuffer() 
        float32Normalized = apply_windowing(new Float32Array(buffer), wc, ww)
        mat = new cv.matFromArray(size[1], size[0], cv.CV_32FC1, float32Normalized.tolist())
        cv.imshow("canvas", mat)
    }

    // app.loadURLs([url], {"requestHeaders": [requestHeaders]})
    // app.addEventListener('loadend', () => {
    //     const CV_NJLoadingHandle = setInterval(() => {
    //         if (cv && nj) {
    //             clearInterval(CV_NJLoadingHandle)
    //             createMat(mat)
    //         }
    //     }, 500)

    // });

    return (
        <>
            <canvas onMouseMove={(e) => updateImage(e.clientX - e.target.offsetLeft, e.clientY - e.target.offsetTop, mat)} id="canvas"></canvas>
            <br />
            <ReactSlider className="customSlider" thumbClassName="customSlider-thumb" trackClassName="customSlider-track" max={2048} value={wc} onChange={(value) => setWC(value)}/>
            <br />
            <br />
            <ReactSlider className="customSlider" thumbClassName="customSlider-thumb" trackClassName="customSlider-track" max={2048} value={ww} onChange={(value) => setWW(value)}/>
            <br />
            <br />
        </>
    )
}

export default Base