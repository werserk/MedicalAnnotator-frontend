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
        this.blockColor = [1.0, 1.0, 1.0, 1.0]
        this.trueColor = [255, 255, 255, 255]
        this.contourFillFlag = cv.RETR_TREE
        this.tolerance = 5
        this.floodFillFlags = 4 | cv.FLOODFILL_FIXED_RANGE | cv.FLOODFILL_MASK_ONLY | 255 << 8

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

        this.mask = this.emptyMask3C.clone()
        this.floodMask = this.emptyMask.clone()

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

    findContours(img, flag) {
        // Variables
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let bin_img = new cv.Mat();

        // Transforms
        cv.cvtColor(img, bin_img, cv.COLOR_RGB2GRAY);
        cv.threshold(bin_img, bin_img, 1, 254, cv.THRESH_BINARY);
        cv.findContours(bin_img, contours, hierarchy, flag, cv.CHAIN_APPROX_SIMPLE)

        // Clear memory
        bin_img.delete()
        hierarchy.delete()

        return contours
    }

    getContours(mask, color) {
        let contours = this.findContours(mask, this.contourFillFlag)
        let viz = this.emptyMask3C.clone()
        cv.drawContours(viz, contours, -1, color, -1)
        return [viz, contours]
    }   

    applyPerPixel(src, mask, dst, func) {
        for (let i = 0; i < src.rows; i++) {
            for (let j = 0; j < src.cols; j++) {
                func(src.ucharPtr(i, j), mask.ucharPtr(i, j), dst.ucharPtr(i, j))
            }
        }
    }

    createBooleanMask(src, boolFunc) {
        let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1)
        for (let i = 0; i < src.rows; i++) {
            for (let j = 0; j < src.cols; j++) {
                if (boolFunc(src.ucharPtr(i, j))) {
                    dst.ucharPtr(i, j)[0] = this.trueColor[0]
                    dst.ucharPtr(i, j)[1] = this.trueColor[0]
                    dst.ucharPtr(i, j)[2] = this.trueColor[0]
                    dst.ucharPtr(i, j)[3] = this.trueColor[0]
                }
            }
        }
        return dst
    }

    dividePixelByValue3C(src, mask, dst, value) {
        dst[0] = src[0] / value
        dst[1] = src[1] / value
        dst[2] = src[2] / value
        dst[3] = src[3] / value
    }

    singleFloodFill(image, x, y, tolerance){
        // Создаём специальную временную пустую маску для заливки
        let floodMaskTemp = cv.Mat.zeros(image.rows + 2, image.cols + 2, cv.CV_8UC1)

        // Процесс заливки
        // console.log('flags', this.floodFillFlags)
        // console.log('floodMaskTemp', floodMaskTemp)
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
        this.allContours = this.findContours(this.mask, cv.RETR_TREE)

        const st = this.tolerance
        const tolerance = [st, st, st, st] // Максимальное отклонение пикселей при заливки

        this.imageTemp = cv.Mat.zeros(this.shape[1], this.shape[0], cv.CV_32FC3) // Изображение для заливки
        const funcDivideBy1000 = (src, mask, dst) => this.dividePixelByValue3C(src, mask, dst, 1000) // Функция для деления изображения на 1000
        this.blurredImage = this.mat.clone() // Изображение, по которому будем смотреть заливку
        this.applyPerPixel(this.blurredImage, this.blurredImage, this.imageTemp, funcDivideBy1000) // Теперь image = blurredImage / 1000
        this.imageTemp = this.mat.clone()

        // Создаём запретную зону для floodfill (красный цвет при разметке)
        const isBlockPixel = (pixel) => pixel !== this.blockColor
        this.criterionMask = this.createBooleanMask(this.blurredImage, isBlockPixel)
        const makeBlockColor = (src, mask, dst) => {
            if (mask === this.trueColor) {
                dst[0] = this.blockColor[0]
                dst[1] = this.blockColor[1]
                dst[2] = this.blockColor[2]
                dst[3] = this.blockColor[3]
            }
        }
        console.log('this.imageTemp_1', this.imageTemp)
        this.applyPerPixel(this.imageTemp, this.criterionMask, this.imageTemp, makeBlockColor) // <=> image[self.mask == 2] = 1.0
        console.log('this.imageTemp_2', this.imageTemp)

        for (let i=0; this.allContours.get(i) !== undefined; i++) {  // Итерируемся для каждого объекта
            let contours = this.allContours.get(i)
            for (let j=0; j < contours.rows; j++) { // Итерируемся для каждой пары координат
                let x = contours.data32S[j * 2]  // Нас интересуют только пары координат
                let y = contours.data32S[j * 2 + 1]
                this.floodMaskTemp = this.singleFloodFill(this.imageTemp, x, y, tolerance)  // Заливка
                cv.bitwise_or(this.floodMask, this.floodMaskTemp, this.floodMask)  // Объединяем с ранее созданными масками
            }
        }
        //     // Такую же процедуру сделаем для центра объекта
        //     centroid = contours.mean(axis=1).mean(axis=0)  // Находим примерный центр
        //     xc, yc = int(centroid[0]), int(centroid[1])  // Переводим в int
        //     if self.positive_mask[xc][yc] == 1:  // Если центр является размеченным (а то может быть кольцо)
        //         flood_mask = self._single_floodfill(image, xc, yc, tolerance)  // Заливка
        //         self.flood_mask = cv2.bitwise_or(self.flood_mask, flood_mask)  // Объединяем с ранее созданными масками
        // }
        // self.flood_mask = remove_small_dots(self.flood_mask)  // Убираем мелкие точки
        // self._update_image()

        // Clear memory
        // image.delete()
    }

    pickMax(src, mask, dst) {
        dst[0] = Math.max(src[0], mask[0])
        dst[1] = Math.max(src[1], mask[1])
        dst[2] = Math.max(src[2], mask[2])
        dst[3] = Math.max(src[3], mask[3])
    }

    updateImage() {
        // Combine mask and image
        let image = new cv.Mat();
        let mask = this.mask.clone()

        // НЕОБХОДИМО СКЛЕИТЬ 2 МАСКИ
        let floodMask = new cv.Mat()
        cv.cvtColor(this.floodMask, floodMask, cv.COLOR_GRAY2BGR)
        cv.bitwise_or(this.mask, floodMask, mask) 

        let [viz, contours] = this.getContours(mask, this.currentColor)
        cv.addWeighted(this.mat, 0.75, viz, 0.25, 0, image)
        cv.drawContours(image, contours, -1, this.currentColor, 1, cv.LINE_AA)
        
        // TODO: сохранение на оригинальной маске, а не только на визуализации!!
        // this.mask = viz.clone()

        // Update canvas
        cv.circle(image, this.mousePosition, this.brushSize, [255, 255, 255, 0], 1, cv.LINE_AA)
        cv.imshow("canvas", image)

        // Clear memory
        image.delete()
        viz.delete()
        mask.delete()
        contours.delete()
    }

    drawCircle(color, thickness) {
        // Draw on mask
        cv.circle(this.mask, this.mousePosition, this.brushSize, color, thickness, cv.LINE_AA)
    }

    clearMask() {
        this.mask = this.emptyMask3C.clone()
        this.updateImage()
    }

    setTool(tool) {
        this.tool = tool
    }

    floodFillActivate () {
        this.floodFill()
        this.updateImage()
    }

    mouseCallback() {       
        if (this.mouseDown) {
            if (this.tool === "Paint") {
                this.canvas.onmousemove = (e) => {
                    this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                    this.drawCircle(this.currentColor, -1)
                    this.contourFillFlag = cv.RETR_TREE
                    this.updateImage()
                }
            }
            if (this.tool === "Contour paint") {
                this.canvas.onmousemove = (e) => {
                    this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                    this.drawCircle(this.currentColor, -1)
                    this.contourFillFlag = cv.RETR_EXTERNAL
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
                <button onClick={() => this.setTool("Contour paint")}>Contour paint</button>
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