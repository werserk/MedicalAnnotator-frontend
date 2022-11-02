import React from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../constans";
import dwv from 'dwv'
import cv, { CV_32F, InputArrayOfArrays, MatVector } from "@techstark/opencv-js"
import nj from "@d4c/numjs/build/module/numjs.min.js"
import ReactSlider from 'react-slider'
import { apply_windowing } from "../cv/utils/transforms";
import Draggable from "react-draggable";

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
        this.isMove = false
        this.polygons = [[]]
        this.polygonIndex = undefined
        this.scaleFactor = 1

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
        this.isMoving = this.isMoving.bind(this)
        this.canvasSizeChange = this.canvasSizeChange.bind(this)

        this.canvas = undefined
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

    drawPolylines(image) {
        for (let i=0; i < this.polygons.length; i++) {
            let polygon = this.polygons[i]
            // Если отрезок ещё не установлен, то вторая координата - мышь
            if (polygon.length === 0) {
                continue
            }
            if (i === this.polygons.length) {
                polygon.push([(self.x, self.y)])
            }
            // Если на отрезок наведён курсор, то её цвет - белый, иначе - зелёный
            let prev_point = {}, point = {}
            Object.assign(prev_point, polygon[0]);
            let color
            if ((i !== this.polygonIndex) || (this.pointIndex !== 0)) {
                color = this.currentColor
            }
            else {
                color = [255, 255, 255, 0]
            }
                
            cv.circle(image, prev_point, this.brushSize, color, 1, cv.LINE_AA)
            for (let j=1; j < polygon.length; j++) {
                Object.assign(point, polygon[j]);

                if ((i !== this.polygonIndex) || (j + 1 !== this.pointIndex)) {
                    color = this.currentColor
                }
                else {
                    color = [255, 255, 255, 0]
                }
                cv.line(image, prev_point, point, this.currentColor, 1, cv.LINE_AA)
                cv.circle(image, point, this.brushSize, color, 1, cv.LINE_AA)
                Object.assign(prev_point, point);
            }
            cv.line(image, prev_point, polygon[0], this.currentColor, 1, cv.LINE_AA)
        }
        return image
    }

    distanceBetweenPoints(p1, p2, spacing=[1, 1]) {
        return (((p1[0] - p2[0]) * spacing[1]) ** 2 + ((p1[1] - p2[1]) * spacing[0]) ** 2) ** 0.5
    }

    findClosestPoint() {
        let closestPolygon, closestPoint
        let minDistance = 99999
        for (let i=0; i < this.polygons.length; i++) {
            let polygon = this.polygons[i]
            if (polygon.length === 0) {
                continue
            }
            for (let j=0; j < polygon.length; j++) {
                let point = polygon[j]
                let distance = this.distanceBetweenPoints(point, this.mousePosition)
                if (distance < minDistance) {
                    minDistance = distance
                    closestPolygon = i
                    closestPoint = j
                }
            }
        }
        if (minDistance < this.objectCorrectionDistance) {
            closestPoint = undefined
            closestPolygon = undefined
        }
        return [closestPolygon, closestPoint]
    }

    findClosestLine() {
        let closestPolygon, closestPoint
        let minDistance = 99999
        for (let i=0; i < this.polygons.length; i++) {
            let polygon = this.polygons[i]
            if (polygon.length === 0) {
                continue
            }
            for (let j=1; j < this.polygons.length; j++) {
                let [x1, y1] = this.polygons[j - 1]
                let [x2, y2] = this.polygons[j]
                let b = undefined
                if (x1 - x2 !== 0) {
                    b = (y1 - y2) / (x1 - x2)
                }
                if (b === 0) {
                    continue
                }
                let distance
                if (b !== undefined) {
                    let c = y1 - b * x1
                    distance = (Math.abs(this.mousePosition.y - b * this.mousePosition.x - c) / (b ** 2 + 1)) ** 0.5
                }
                else {
                    distance = Math.abs(this.mousePosition.x - x1)
                }
                if (distance < minDistance) {
                    minDistance = distance
                    closestPoint = [j, j + 1]
                    closestPolygon = i
                }
            }
        }
        if (minDistance < this.objectCorrectionDistance) {
            closestPoint = undefined
            closestPolygon = undefined
        }
        return [closestPolygon, closestPoint]
    }

    isPointInPolygon(point, vs) {
        let x = point[0]
        let y = point[1]
        let inside = false
        for (let i=0, j=vs.length - 1; i < vs.length; j=i++) {
            let xi = vs[i][0]
            let yi = vs[i][1]
            let xj = vs[j][0]
            let yj = vs[j][1]
            let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
            if (intersect) {
                inside = true
            }
        }
        return inside
    }

    findClosestPolygon() {
        for (let i=0; i < this.polygons.length; i++) {
            let polygon = this.polygons[i]
            if (polygon.length === 0) {
                continue
            }
            if (polygon.length > 2) {
                if (this.isPointInPolygon(this.mousePosition, polygon)) {
                    return [i, undefined]
                }
            }
        }
        return [undefined, undefined]
    }

    drawPolygons(mask) {
        if (!this.mouseDown) {
            [this.polygonIndex, this.pointIndex] = this.findClosestPoint()
        
            if (this.pointIndex === undefined) {
                [this.polygonIndex, this.pointIndex] = this.findClosestLine()
            }
            if (this.polygonIndex === undefined) {
                [this.polygonIndex, this.pointIndex] = this.findClosestPolygon()
            }
        }
        for (let i=0; i < this.polygons.length; i++) {
            let polygon = [...this.polygons[i]]
            if (i === this.polygons.length - 1) {
                polygon.push(this.mousePosition)
            }
            // console.log('polygon', this.polygons[i])
            let color
            if ((i == this.polygonIndex) && (this.pointIndex === undefined)) {
                color = [255, 255, 255, 0]
            }
            else {
                color = this.currentColor
            }
            if (polygon.length === 2) {
                cv.line(mask, polygon[0], polygon[1], color, 1, cv.LINE_AA)
            }
            else {
                if (polygon.length > 2) {
                    cv.fillPoly(mask, [polygon], color, cv.LINE_AA)
                }
            }
        }
        return mask 
    }

    
    updateImage() {
        // Combine mask and image
        console.time('updateImage')

        // SEGMENTATION
        let viz = new cv.Mat();
        this.allContours = this.getContours(this.maskVisual, this.currentColor) // Получим контуры разметки кистью
        let maskVisualTemp = this.maskVisual.clone()
        
        cv.drawContours(maskVisualTemp, this.allContours, -1, this.currentColor, -1, cv.LINE_AA)
        let finalMask = maskVisualTemp.clone()
        // finalMask = this.drawPolygons(finalMask) // Добавление полигонов на изображение
        cv.addWeighted(this.mat, 0.75, finalMask, 0.25, 0, viz) // Добавление растровой маски на изображения
        cv.drawContours(viz, this.allContours, -1, this.currentColor, 1, cv.LINE_AA) // Отрисовка контуров разметки кистью
        viz = this.drawPolylines(viz) // Отрисовка линий в полигонах
        
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
        this.floodMask = this.emptyMask.clone()

        this.points = []
        this.pointIndex = undefined
        this.isMove = false
        this.polygons = [[]]
        this.polygonIndex = undefined
        this.scaleFactor = 1

        this.allContours = new cv.MatVector()
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

    putPoint() {
        if (this.tool === "Polygons") {
            console.log(this.polygons)
            let polygon = this.polygons[this.polygons.length - 1]
            console.log('polygon', polygon)
            if (this.polygonIndex !== undefined) {
                if (this.pointIndex === 0) {
                    if (polygon.length !== 0) {
                        polygon.push(polygon[0])
                        this.pointIndex = undefined
                        this.polygons.push([])
                    }
                }
            }
            else {
                polygon.push(this.mousePosition)
            }
        }
    this.updateImage()
    }

    removePoint() {
        if (this.tool === "Polygons") {
            let polygon = this.polygons[this.polygons.length - 1]
            if (polygon.length === 0) {
                if (this.polygonIndex === undefined) {
                    return
                }
                if (this.pointIndex === undefined) {
                    this.polygons.splice(this.polygonIndex)
                }
                else {
                    this.polygons[this.polygonIndex].splice(this.pointIndex)
                }
            }
            else {
                polygon.push(polygon[0])
            }
        }
        this.updateImage()
    }
    

    mouseCallback() {       
        if (this.mouseDown) {
            if (this.isMove) {
                
            }
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
            // if (this.tool === "Polygon") {
            //     this.canvas.onmousemove = (e) => {
            //         this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
            //         this.drawCircle([0, 0, 0, 0], -1)
            //         this.updateImage()
            //     }
            // }
        }
        else {
            this.canvas.onmousemove = (e) => {
                this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                // this.updateImage()
            }
        }
    }

    canvasSizeChange(increase) {
        if (increase) {
            this.scaleFactor = this.scaleFactor + 0.025
            this.scaleFactor = Math.min(this.scaleFactor, 2)
        }
        else {
            this.scaleFactor = this.scaleFactor - 0.025
            this.scaleFactor = Math.max(this.scaleFactor, 0.5)
        }
        console.log(this.scaleFactor)
        this.canvas.style = `transform: translate(0px, 0px) scale(${this.scaleFactor})`
    }

    handleMouseEvents() {
        this.canvas.addEventListener("mousedown", (e) => {
            this.mouseDown = true
            if (e.button === 1) {
                this.isMove = true
            }
            else {
                this.isMove = false
            }
            if (this.tool === "Polygons") {
                if (this.pointIndex === undefined) {
                    console.log('putPoint')
                    this.putPoint()
                }
            }
        })
        this.canvas.addEventListener("mouseup", (e) => {
            this.mouseDown = false
        })
        this.canvas.addEventListener("wheel", (e) => {
            this.canvasSizeChange(e.deltaY < 0)
        })
    }

    isMoving() {
        return this.isMove
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
                <button onClick={() => this.setTool("Polygons")}>Polygons</button>
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