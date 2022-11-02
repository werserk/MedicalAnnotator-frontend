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
        this.mousePosition = {x: 0, y: 0}
        this.currentColor = [0, 255, 0, 0]
        this.blockColor = [1, 1, 1, 1]
        this.trueColor = [255, 255, 255, 255]
        this.contourFillFlag = cv.RETR_TREE
        this.tolerance = 5
        this.floodFillFlags = 4 | cv.FLOODFILL_FIXED_RANGE | cv.FLOODFILL_MASK_ONLY | 255 << 8
        this.points = []
        this.pointIndex = undefined

        this.authRequestHeader = { // заголовки авторизации
            name: "Authorization",
            value: this.props.authToken["Authorization"]
        }
        this.app = new dwv.App();
        this.createMat = this.createMat.bind(this);
        this.mouseCallback = this.mouseCallback.bind(this);
        this.clearMask = this.clearMask.bind(this);
        this.setTool = this.setTool.bind(this);
        this.updateImage = this.updateImage.bind(this);
        this.handleMouseEvents = this.handleMouseEvents.bind(this);
        this.floodFill = this.floodFill.bind(this)
        this.singleFloodFill = this.singleFloodFill.bind(this)
        this.floodFillActivate = this.floodFillActivate.bind(this)
        this.fillContoursActivate = this.fillContoursActivate.bind(this)

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

        this.emptyMask = cv.Mat.zeros(this.shape[1], this.shape[0], cv.CV_8UC1)
        this.emptyMask3C = cv.Mat.zeros(this.shape[1], this.shape[0], cv.CV_8UC3)
        
        this.mat = new cv.matFromArray(this.shape[1], this.shape[0], cv.CV_8UC1, this.Uint8Image.tolist())
        cv.cvtColor(this.mat, this.mat, cv.COLOR_GRAY2BGR)

        this.blurredImage = new cv.Mat();
        let ksize = new cv.Size(3, 3);
        cv.GaussianBlur(this.mat, this.blurredImage, ksize, 0, 0, cv.BORDER_DEFAULT);

        this.maskVisual = this.emptyMask3C.clone()
        this.mask = this.emptyMask3C.clone()
        this.floodMask = this.emptyMask.clone()

        this.allContours = new cv.MatVector()

        cv.imshow("canvas", this.mat)
    }

    componentDidMount() {
        this.initApp()
        this.handleMouseEvents()
    }

    shouldComponentUpdate() {
        return true
    }

    //////////////////////
    // OPENCV FUNCTIONS //
    //////////////////////

    findContours(mask, flag) {
        // Variables
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let binMask = new cv.Mat();

        // Transforms
        cv.cvtColor(mask, binMask, cv.COLOR_RGB2GRAY);
        cv.threshold(binMask, binMask, 2, 255, cv.THRESH_BINARY);
        cv.findContours(binMask, contours, hierarchy, flag, cv.CHAIN_APPROX_SIMPLE)

        // Clear memory
        binMask.delete()
        hierarchy.delete()

        return contours
    }

    getContours(mask) {
        // let contours = this.findContours(mask, this.contourFillFlag
        let contours = this.findContours(mask, cv.RETR_TREE)
        return contours
    }   

    singleFloodFill(image, x, y, tolerance){
        // Создаём специальную временную пустую маску для заливки
        let floodMaskTemp = cv.Mat.zeros(image.rows + 2, image.cols + 2, cv.CV_8UC1)

        // Процесс заливки
        cv.floodFill(image, floodMaskTemp, new cv.Point(x, y), this.currentColor, image, tolerance, tolerance, this.floodFillFlags)

        // Обрезаем специальную маску (такова специфика функции)
        let rect = new cv.Rect(1, 1, image.rows, image.cols);
        floodMaskTemp = floodMaskTemp.roi(rect);
        return floodMaskTemp
    }

    floodFill() {
        // Обнуляем маску с заливкой
        this.floodMask = this.emptyMask.clone()

        // Получаем контуры всех объектов
        const st = this.tolerance
        const tolerance = [st, st, st, st] // Максимальное отклонение пикселей при заливки

        // Необходимо создать запретную зону для floodfill
        this.imageTemp = this.blurredImage.clone()

        for (let i=0; this.allContours.get(i) !== undefined; i++) {  // Итерируемся для каждого объекта
            let contours = this.allContours.get(i)
            for (let j=0; j < contours.rows; j+=5) { // Итерируемся для каждой пары координат
                let x = contours.data32S[j * 2]  // Нас интересуют только пары координат
                let y = contours.data32S[j * 2 + 1]
                this.floodMaskTemp = this.singleFloodFill(this.imageTemp, x, y, tolerance)  // Заливка
                cv.bitwise_or(this.floodMask, this.floodMaskTemp, this.floodMask)  // Объединяем с ранее созданными масками
            }
        }

        let floodMask = new cv.Mat()
        cv.cvtColor(this.floodMask, floodMask, cv.COLOR_GRAY2BGR)
        cv.bitwise_or(this.mask, floodMask, this.maskVisual) 
    }

    pickMax(src, mask, dst) {
        dst[0] = Math.max(src[0], mask[0])
        dst[1] = Math.max(src[1], mask[1])
        dst[2] = Math.max(src[2], mask[2])
        dst[3] = Math.max(src[3], mask[3])
    }

    updateImage() {
        // Combine mask and image
        console.time('updateImage')

        let viz = new cv.Mat();
        this.allContours = this.getContours(this.maskVisual, this.currentColor)
        let maskVisualTemp = this.maskVisual.clone()
       
        cv.drawContours(maskVisualTemp, this.allContours, -1, this.currentColor, -1, cv.LINE_AA)
        cv.addWeighted(this.mat, 0.75, maskVisualTemp, 0.25, 0, viz)
        cv.drawContours(viz, this.allContours, -1, this.currentColor, 1, cv.LINE_AA)

        // Update canvas
        cv.circle(viz, this.mousePosition, this.brushSize, [255, 255, 255, 0], 1, cv.LINE_AA)
        cv.imshow("canvas", viz)

        // Clear memory
        viz.delete()
        maskVisualTemp.delete()
        console.timeEnd('updateImage')
    }

    drawCircle(color, thickness) {
        cv.circle(this.mask, this.mousePosition, this.brushSize, color, thickness, cv.LINE_AA)
        cv.circle(this.maskVisual, this.mousePosition, this.brushSize, color, thickness, cv.LINE_AA)
    }

    clearMask() {
        this.mask = this.emptyMask3C.clone()
        this.maskVisual = this.emptyMask3C.clone()
        this.updateImage()
    }

    setTool(tool) {
        this.tool = tool
    }

    floodFillActivate () {
        this.floodFill()
        this.updateImage()
    }

    fillContoursActivate() {
        if (this.contourFillFlag === cv.RETR_EXTERNAL) {
            this.contourFillFlag = cv.RETR_TREE
        }
        else {
            this.contourFillFlag = cv.RETR_EXTERNAL
        }
        this.updateImage()
    }

    mouseCallback() {       
        if (this.mouseDown) {
            if (this.tool === "Paint") {
                this.canvas.onmousemove = (e) => {
                    this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                    this.drawCircle(this.currentColor, -1)
                    this.updateImage()
                }
            }
            if (this.tool === "Eraser") {
                this.canvas.onmousemove = (e) => {
                    this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                    this.drawCircle([0, 0, 0, 0], -1)
                    this.updateImage()
                }
            }
        }
        else {
            this.canvas.onmousemove = (e) => {
                this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                // this.updateImage()
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
                <button onClick={this.fillContoursActivate}>Fill contours</button>
                <br />
                <br />
                <button onClick={() => this.setTool("Eraser")}>Eraser</button>
                <br />
                <br />
                <button onClick={this.floodFillActivate}>floodFill</button>
                <br />
                <br />
                <button onClick={this.clearMask}>Clear canvas</button>
            </div>
        )
    }
}

export default withParams(AnnotatorWindow)