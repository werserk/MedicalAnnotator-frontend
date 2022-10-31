import React from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../constans";
import dwv from 'dwv'
import cv from "@techstark/opencv-js"
import nj from "@d4c/numjs/build/module/numjs.min.js"
import ReactSlider from 'react-slider'
import { apply_windowing } from "../cv/utils/transforms";

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}

dwv.image.decoderScripts = {
    "jpeg2000": "/node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "/node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "/node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
};

class AnnotatorWindow extends React.Component {

    constructor (props) {
        super(props)
        this.fetchUrl = BASE_URL + `api/instance/${this.props.params.study}/${this.props.params.instance}/`
        this.ww = 1000
        this.wc = 1000
        this.authRequestHeader = { // заголовки авторизации
            name: "Authorization",
            value: this.props.authToken["Authorization"]
        }
        this.mat, this.image, this.buffer, this.geometry, this.size, this.float32Normalized
        this.app = new dwv.App();
        this.createMat = this.createMat.bind(this);
        this.activateTool = this.activateTool.bind(this);
        this.setTool = this.setTool.bind(this);
        this.handleMouseEvents = this.handleMouseEvents.bind(this);
        this.mouseDown = false
        this.toolActive = false
        this.canvas = undefined
        this.state = {"ww": this.ww, "wc": this.wc, "update": true}

    }

    initApp() {
        this.canvas = document.getElementById("canvas")
        this.app.init({
            dataViewConfigs: {'*': []}
        });

        this.app.loadURLs([this.fetchUrl], {"requestHeaders": [this.authRequestHeader]})
        this.app.addEventListener('loadend', () => {
            const CV_NJLoadingHandle = setInterval(() => {
                if (cv && nj) {
                    clearInterval(CV_NJLoadingHandle)
                    this.createMat()
                }
            }, 500)

        });
    }

    createMat() {
        this.image = this.app.getImage(0)
        this.geometry = this.image.getGeometry()
        this.size = this.geometry.getSize().getValues() // width, height, deep
        this.buffer = this.image.getBuffer() 
        this.float32Normalized = apply_windowing(new Float32Array(this.buffer), this.state["wc"], this.state["ww"])
        this.mat = new cv.matFromArray(this.size[1], this.size[0], cv.CV_32FC1, this.float32Normalized.tolist())
        cv.imshow("canvas", this.mat)
    }

    componentDidMount() {
        this.initApp()
        this.handleMouseEvents()
    }

    shouldComponentUpdate() {
        return true
    }

    segmentationTool(center, radius, color, thickness, mat) {
        cv.circle(mat, center, radius, color, thickness)
        cv.imshow("canvas", mat)
    }

    setTool(tool) {
        this.tool = tool
    }

    activateTool() {
        if (!this.toolActive) {
            if (this.tool === "Segmentation") {

                this.toolActive = true

                this.canvas.onmousemove = (e) => {
                    if (this.mouseDown) {
                        const center = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop}
                        const radius = 50
                        const color = [0, 0, 255, 0]
                        const thickness = -50
                        this.segmentationTool(center, radius, color, thickness, this.mat)
                    } else {
                        this.canvas.onmousemove = null
                        this.toolActive = false
                    }
                }
            }

            if (this.tool === "Other") {

                this.toolActive = true

                this.canvas.onmousemove = (e) => {
                    if (this.mouseDown) {
                        const center = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop}
                        const radius = 50
                        const color = [255, 255, 255, 0]
                        const thickness = -50
                        this.segmentationTool(center, radius, color, thickness, this.mat)
                    } else {
                        this.canvas.onmousemove = null
                        this.toolActive = false
                    }
                }
            }
        }
    }

    handleMouseEvents() {
        this.canvas.addEventListener("mousedown", () => {
            this.mouseDown = true
        })
        this.canvas.addEventListener("mouseup", () => {
            this.mouseDown = false
        })
    }

    render() {
        return (
            <div className="Annotator">
                <canvas onMouseDown={this.activateTool} id="canvas"></canvas>
                <br />
                <br />
                <button onClick={() => this.setTool("Segmentation")}>Segmentation Tool</button>
                <br />
                <br />
                <button onClick={() => this.setTool("Other")}>Other Tool</button>
            </div>
        )
    }
}

export default withParams(AnnotatorWindow)