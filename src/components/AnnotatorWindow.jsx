import React from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../constans";
import dwv from 'dwv'
import cv, { CV_32F, InputArrayOfArrays } from "@techstark/opencv-js"
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

        // Setup parameters
        this.wc = 40
        this.ww = 400
        this.brushSize = 5
        this.mouseDown = false
        this.toolActive = false
        this.mousePosition = {x: 0, y: 0}

        this.authRequestHeader = { // заголовки авторизации
            name: "Authorization",
            value: this.props.authToken["Authorization"]
        }
        this.app = new dwv.App();
        this.createMat = this.createMat.bind(this);
        this.mouseCallback = this.mouseCallback.bind(this);
        this.clearMask = this.clearMask.bind(this);
        this.setTool = this.setTool.bind(this);
        this.handleMouseEvents = this.handleMouseEvents.bind(this);

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
        this.shape = this.geometry.getSize().getValues() // width, height, deep'

        this.buffer = this.image.getBuffer() 
        this.Uint8Image = apply_windowing(new Float32Array(this.buffer), this.wc, this.ww)

        this.emptyMask = new cv.matFromArray(this.shape[1], this.shape[0], cv.CV_8UC1, nj.zeros(this.shape, "uint8").tolist())

        this.mat = new cv.matFromArray(this.shape[1], this.shape[0], cv.CV_8UC1, this.Uint8Image.tolist())
        cv.cvtColor(this.mat, this.mat, cv.COLOR_GRAY2BGR)

        this.mask = this.emptyMask.clone()
        cv.cvtColor(this.mask, this.mask, cv.COLOR_GRAY2BGR)

        cv.imshow("canvas", this.mat)
    }

    componentDidMount() {
        this.initApp()
        this.handleMouseEvents()
    }

    shouldComponentUpdate() {
        return true
    }

    // OPENCV FUNCTIONS
    find_contours(img, flag) {
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        console.log('image', img)
        cv.findContours(img, contours, hierarchy, flag, cv.CHAIN_APPROX_SIMPLE)
        return contours
    }

    apply_mask(mask, color) {
        let contours = this.find_contours(mask, cv.RETR_TREE)
        let viz = this.emptyMask.clone()
        cv.drawContours(viz, contours, -1, color, -1)
        return viz, contours
    }   

    updateImage() {
        // Combine mask and image
        let image = this.emptyMask.clone()
        // let mask, contours = this.apply_mask(this.mask, [0, 255, 0, 0])
        cv.cvtColor(image, image, cv.COLOR_GRAY2BGR)
        cv.addWeighted(this.mat, 0.75, this.mask, 0.25, 0, image)
        // cv.drawContours(image, contours, -1, [0, 255, 0, 0], 1, cv.LINE_AA)

        // Update canvas
        cv.circle(image, this.mousePosition, this.brushSize, [255, 255, 255, 0], 1, cv.LINE_AA)
        cv.imshow("canvas", image)

        // Clear memory
        image.delete();
        // mask.delete();
        // contours.delete()
    }

    drawCircle(color, thickness) {
        // Draw on mask
        cv.circle(this.mask, this.mousePosition, this.brushSize, color, thickness, cv.LINE_AA)
    }

    clearMask() {
        console.log('empty', this.emptyMask)
        this.mask = this.emptyMask.clone()
        cv.cvtColor(this.mask, this.mask, cv.COLOR_GRAY2BGR)
        
        this.updateImage()
    }

    setTool(tool) {
        this.tool = tool
    }

    mouseCallback() {       
        if (this.mouseDown) {
            if (this.tool === "Paint") {
                this.toolActive = true
                this.canvas.onmousemove = (e) => {
                    this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                    if (this.mouseDown) {
                        this.drawCircle([255, 0, 0, 0], -1)
                        this.updateImage()
                    }
                }
            }
            if (this.tool === "Eraser") {
                this.toolActive = true
                this.canvas.onmousemove = (e) => {
                    this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                    if (this.mouseDown) {
                        this.drawCircle([0, 0, 0, 0], -1)
                        this.updateImage()
                    }
                }
            }
        }
        else {
            this.toolActive = false
            this.canvas.onmousemove = (e) => {
                this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
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
                <canvas onMouseDownCapture={this.mouseCallback} onMouseUpCapture={this.mouseCallback} onMouseMove={this.mouseCallback} id="canvas"></canvas>
                <br />
                <br />
                <button onClick={() => this.setTool("Paint")}>Paint</button>
                <br />
                <br />
                <button onClick={() => this.setTool("Eraser")}>Eraser</button>
                <br />
                <br />
                <button onClick={this.clearMask}>Clear canvas</button>
            </div>
        )
    }
}

export default withParams(AnnotatorWindow)