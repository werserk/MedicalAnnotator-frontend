import { useContext, useState } from "react"
import { BASE_URL } from "../constans"
import { errorMsg } from "../elements/Notifications"
import context from "../context"
import Slider from "../elements/Slider"
import { useParams } from "react-router"
import { useEffect } from "react"
import dwv from 'dwv'
import cv from "../libs/openCv"
import nj from "@d4c/numjs/build/module/numjs.min.js"
import { apply_windowing } from "../cv/utils/transforms"

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
        const bufferint16 = new Int16Array(buffer)
        float32 = nj.array(float32)
        float32 = apply_windowing(float32, 40, 400, 0, 1, false, nj)
        const mat = new cv.matFromArray(size[1], size[0], cv.CV_32F, float32.tolist())
        console.log(mat)
        cv.imshow("canvas", mat)
        removeUnnecessaryLayers("layerGroup0")
    }

    const arrayMinMax = (arr) =>
        arr.reduce(([min, max], val) => [Math.min(min, val), Math.max(max, val)], [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
    ]);

    const normalize = (buf, [bufmin, bufmax]) => {
        const delta = bufmax - bufmin
        const new_array = new Float32Array(buf)
        for (var i=0;i < buf.length; i++) {
            new_array[i] = (new_array[i] - bufmin) / delta
        }
        return new_array
    }

    const createImageData = (uint8Buffer, size) => {
        console.log(size)
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        var imgData = ctx.createImageData(size[0], size[1])
        for (var i=0;i < uint8Buffer.length; i+=4) {
            imgData.data[i]   = uint8Buffer[i];   //red
            imgData.data[i+2] = uint8Buffer[i+2]; //blue
            imgData.data[i+1] = uint8Buffer[i+1]; //green
            imgData.data[i+3] = uint8Buffer[i+3]; //alpha
        }
        ctx.putImageData(imgData,0,0,0,0, size[0], size[0]);
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

    const parseTags = (rawTags) => {
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
            {/* <p>first</p>
            <Slider max={2048} value={value_1} changeValue={changeValue1}/>
            <p>second</p>
            <Slider max={4096} value={value_2} changeValue={changeValue2}/>
            <hr /> */}
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