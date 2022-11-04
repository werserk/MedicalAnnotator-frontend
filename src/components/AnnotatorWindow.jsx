import React from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../constans";
import dwv from 'dwv'
import cv, { CV_32F, CV_XADD, InputArrayOfArrays, MatVector } from "@techstark/opencv-js"
import nj from "@d4c/numjs/build/module/numjs.min.js"
import ReactSlider from 'react-slider'
import { apply_windowing } from "../cv/utils/transforms";
import Draggable from "react-draggable";
import { array } from "prop-types";

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
        this.leftButtonDown = false
        this.middleButtonDown = false
        this.rightButtonDown = false
        this.mousePosition = {x: 0, y: 0}
        this.currentColor = [0, 255, 0, 0]

        this.blockColor = [1, 1, 1, 1]
        this.trueColor = [255, 255, 255, 255]
        this.contourFillFlag = cv.RETR_TREE
        this.tolerance = 5
        this.floodFillFlags = 4 | cv.FLOODFILL_FIXED_RANGE | cv.FLOODFILL_MASK_ONLY | 255 << 8

        this.points = []
        this.pointIndex = undefined
        this.polygons = [[]]
        this.polygonIndex = undefined
        this.rulers = []
        this.rulerIndex = []

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
        // var size = this.image.getGeometry().getSize().get(2)
        // console.log('size', size)
        // var lg = this.app.getLayerGroupById(0);
        // console.log('lg', lg)
        // var vc = lg.getActiveViewLayer().getViewController();
        // var index = vc.getCurrentIndex();
        // var values = index.getValues();
        // console.log('values', values)
        // vc.setCurrentIndex(new dwv.math.Index(values));
        // console.log('vc', vc)

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
            let polygon = [...this.polygons[i]]
            // Если отрезок ещё не установлен, то вторая координата - мышь
            if (polygon.length === 0) {
                continue
            }
            if (i === this.polygons.length - 1) {
                polygon.push(this.mousePosition)
            }
            // Если на отрезок наведён курсор, то её цвет - белый, иначе - зелёный
            let prev_point = {}, point = {}
            Object.assign(prev_point, polygon[0]);
            let color
            color = this.currentColor
            if (this.pointIndex !== undefined) {
                if (this.pointIndex[0] === 0) {
                    color = [255, 255, 255, 0]
                }
            }
            cv.circle(image, prev_point, this.brushSize, color, 1, cv.LINE_AA)
            for (let j=1; j < polygon.length; j++) {
                Object.assign(point, polygon[j]);
                color = this.currentColor
                if (this.pointIndex !== undefined) {
                    if (this.pointIndex[0] === j) {
                        color = [255, 255, 255, 0]
                    }
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
        return (((p1.x - p2.x) * spacing[1]) ** 2 + ((p1.y - p2.y) * spacing[0]) ** 2) ** 0.5
    }

    findClosestPoint() {
        let closestPolygon, closestPoint, closestRuler
        let minDistance = 99999
        if (this.tool === "Polygons") {
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
                        closestPoint = [j]
                    }
                }
            }
            if (minDistance > this.brushSize * 2) {
                closestPoint = undefined
                closestPolygon = undefined
            }
            return [closestPolygon, closestPoint]
        }
        if (this.tool === "Points") {
            for (let j=0; j < this.points.length; j++) {
                let point = this.points[j]
                let distance = this.distanceBetweenPoints(point, this.mousePosition)
                if (distance < minDistance) {
                    minDistance = distance
                    closestPoint = j
                }
            }
            if (minDistance > this.brushSize * 2) {
                closestPoint = undefined
            }
        return closestPoint    
        } 
        if (this.tool === "Ruler") {
            for (let i=0; i < this.rulers.length; i++) {
                let ruler = this.rulers[i]
                for (let j=0; j < ruler.length; j++) {
                    let point = ruler[j]
                    let distance = this.distanceBetweenPoints(point, this.mousePosition)
                    if (distance < minDistance) {
                        minDistance = distance
                        closestRuler = i
                        closestPoint = j
                    }
                }
            }
            if (minDistance > this.brushSize * 2) {
                closestPoint = undefined
                closestRuler = undefined
            }
        return [closestRuler, closestPoint]    
        } 
    }

    findClosestLine() {
        let closestPolygon, closestPoint
        let minDistance = 99999
        if (this.tool === "Polygons") {
            for (let i=0; i < this.polygons.length; i++) {
                let polygon = this.polygons[i]
                if (polygon.length === 0) {
                    continue
                }
                for (let j=1; j < this.polygons.length; j++) {
                    let [x1, y1] = [this.polygons[j - 1].x, this.polygons[j - 1].y]
                    let [x2, y2] = [this.polygons[j].x, this.polygons[j].y]
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
        }
        if (minDistance > this.brushSize) {
            closestPoint = undefined
            closestPolygon = undefined
        }
        return [closestPolygon, closestPoint]
    }

    isPointInPolygon(point, vs) {
        let x = point.x
        let y = point.y
        let inside = false
        for (let i=0, j=vs.length - 1; i < vs.length; j=i++) {
            let xi = vs[i].x
            let yi = vs[i].y
            let xj = vs[j].x
            let yj = vs[j].y
            let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
            if (intersect) {
                inside = !inside
            }
        }
        return inside
    }

    findClosestPolygon() {
        if (this.tool === "Polygons") {
            for (let i=0; i < this.polygons.length; i++) {
                let polygon = this.polygons[i]
                if (polygon.length === 0) {
                    continue
                }
                if ((polygon.length > 2) && (polygon[polygon.length - 1] !== this.mousePosition)) {
                    if (this.isPointInPolygon(this.mousePosition, polygon)) {
                        return [i, undefined]
                    }
                }
            }
        }
        return [undefined, undefined]
    }

    drawPolygons(mask) {
        for (let i=0; i < this.polygons.length; i++) {
            let polygon = [...this.polygons[i]]
            if (i === this.polygons.length - 1) {
                polygon.push(this.mousePosition)
            }
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
                    let array_polygon = []
                    for (let j=0; j < polygon.length; j++) {
                        array_polygon.push(polygon[j].x)
                        array_polygon.push(polygon[j].y)
                    }
                    let square_point_data = new Int32Array(array_polygon)
                    let npts = polygon.length
                    let square_points = cv.matFromArray(npts, 1, cv.CV_32SC2, square_point_data)
                    let pts = new cv.MatVector()
                    pts.push_back(square_points)
                    cv.fillPoly(mask, pts, color)
                }
            }
        }
        return mask 
    }

    drawPoints(viz) {
        for (let j=0; j < this.points.length; j++) {
            let point = this.points[j]
            let color = this.currentColor
            if (this.pointIndex === j) {
                    color = [255, 255, 255, 0]
            }
            cv.circle(viz, point, this.brushSize, color, 1, cv.LINE_AA)
        }
        return viz
    }

    updateClosestObjects() {
        if (this.tool === "Polygons") {
            if (!this.leftButtonDown && (this.polygons[this.polygons.length - 1].length === 0)) {
                [this.polygonIndex, this.pointIndex] = this.findClosestPoint()
                if (this.pointIndex === undefined) {
                    [this.polygonIndex, this.pointIndex] = this.findClosestLine()
                }
                if (this.polygonIndex === undefined) {
                    [this.polygonIndex, this.pointIndex] = this.findClosestPolygon()
                }
            }
        }
        if (this.tool === "Points") {
            this.pointIndex = this.findClosestPoint()
        }
        if (this.tool === "Ruler") {
            [this.rulerIndex, this.pointIndex] = this.findClosestPoint()
        }
    }

    drawRulers(viz) {
        const font = cv.FONT_HERSHEY_PLAIN
        const fontScale = 1
        const fontThickness = 1

        for (let i=0; i < this.rulers.length; i++) {
            let ruler = [...this.rulers[i]]
            if (ruler.length === 1) {
                ruler.push(this.mousePosition)
            }
            let color = this.currentColor
            console.log('ruler', ruler)
            cv.line(viz, ruler[0], ruler[1], color, 1, cv.LINE_AA)
            if ((this.rulerIndex === i) && (this.pointIndex === 0)) { color = [255, 255, 255, 0] }
            cv.circle(viz, ruler[0], this.brushSize, color, 1, cv.LINE_AA)
            color = this.currentColor
            if ((this.rulerIndex === i) && (this.pointIndex === 1)) { color = [255, 255, 255, 0] }
            cv.circle(viz, ruler[1], this.brushSize, color, 1, cv.LINE_AA)

            let distance = this.distanceBetweenPoints(ruler[0], ruler[1], [1.5, 1.5])
            console.log(distance)
            
            let pos = ruler[1]
            let text = (Math.round(distance * 10) / 10).toString()

            // const textSize = cv.getTextSize(text, font, fontScale, fontThickness, 0)
            // const text_w = textSize.width
            // const text_h = textSize.height
            // cv.rectangle(viz, pos, (pos[0] + text_w, pos[1] + text_h), this.currentColor, -1)
            cv.putText(viz, text, pos, font, fontScale, [255, 255, 255, 0], fontThickness, cv.LINE_AA)
        }
        return viz
    }

    
    updateImage() {
        // Combine mask and image
        // SEGMENTATION
        let viz = new cv.Mat();
        this.allContours = this.getContours(this.maskVisual, this.currentColor) // Получим контуры разметки кистью
        let maskVisualTemp = this.maskVisual.clone()
        
        cv.drawContours(maskVisualTemp, this.allContours, -1, this.currentColor, -1, cv.LINE_AA)
        let finalMask = maskVisualTemp.clone()
        this.updateClosestObjects()
        finalMask = this.drawPolygons(finalMask) // Добавление полигонов на изображение
        cv.addWeighted(this.mat, 0.75, finalMask, 0.25, 0, viz) // Добавление растровой маски на изображения
        cv.drawContours(viz, this.allContours, -1, this.currentColor, 1, cv.LINE_AA) // Отрисовка контуров разметки кистью
        viz = this.drawPolylines(viz) // Отрисовка линий в полигонах
        viz = this.drawPoints(viz) // Отрисовка единичных точек
        viz = this.drawRulers(viz) // Отрисовка линеек
        // Update canvas
        cv.circle(viz, this.mousePosition, this.brushSize, [255, 255, 255, 0], 1, cv.LINE_AA)
        cv.imshow("canvas", viz)

        // Clear memory
        viz.delete()
        maskVisualTemp.delete()
        finalMask.delete()
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
        this.middleButtonDown = false
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
            let polygon = this.polygons[this.polygons.length - 1]
            if ((this.polygonIndex === undefined) && (polygon[polygon.length - 1] !== this.mousePosition)) {
                polygon.push(this.mousePosition)
            }
        }
        if (this.tool === "Points") {
            this.points.push(this.mousePosition)
        }
        if (this.tool === "Ruler") {
            if (this.rulers.length === 0) {
                this.rulers.push([this.mousePosition])
            }
            else {
                if (this.rulers[this.rulers.length - 1].length == 2) {
                    this.rulers.push([this.mousePosition])
                }
                else {
                    this.rulers[this.rulers.length - 1].push(this.mousePosition)
                }
            }
            console.log(this.rulers)
        }
    this.updateImage()
    }

    removePoint() {
        if (this.tool === "Polygons") {
            let polygon = this.polygons[this.polygons.length - 1]
            if (polygon.length === 0) {
                if ((this.polygonIndex !== undefined) && (this.pointIndex === undefined)) {
                    this.polygons.splice(this.polygonIndex, 1)
                    if (this.polygons.length === 0) {
                        this.polygons.push([])
                    }
                }
                if ((this.polygonIndex !== undefined) && (this.pointIndex !== undefined)) {
                    this.polygons[this.polygonIndex].splice(this.pointIndex[0], 1)
                    if (this.polygons[this.polygonIndex].length < 3) {
                        this.polygons.splice(this.polygonIndex, 1)
                        if (this.polygons.length === 0) {
                            this.polygons.push([])
                        }
                    }
                }
            }
            else {
                if (this.polygons[this.polygons.length - 1].length < 3) {
                    this.polygons.splice(this.polygons.length - 1, 1)
                    if (this.polygons.length === 0) {
                        this.polygons.push([])
                    }
                }
                else {
                    this.polygons.push([])
                }
            }
            this.pointIndex = undefined
            this.polygonIndex = undefined
        }
        if (this.tool === "Points") {
            if (this.pointIndex !== undefined) {
                this.points.splice(this.pointIndex, 1)
                this.pointIndex = undefined
            }
        }
        if (this.tool === "Ruler") {
            console.log('indexs', this.rulerIndex, this.pointIndex)
            if (this.rulers.length !== 0) {
                let last_ruler = this.rulers[this.rulers.length - 1]
                if (last_ruler.length === 1) {
                    this.rulers.splice(this.rulers.length - 1, 1)
                }
                else {
                    if (this.rulerIndex !== undefined) {
                        if (this.pointIndex !== undefined) {
                            this.rulers.push([this.rulers[this.rulerIndex][1 - this.pointIndex]])
                        }
                        this.rulers.splice(this.rulerIndex, 1)
                    }
                }
            }
        }
        this.updateImage()
    }

    movePoint(prev, current) {
        if (this.tool === "Polygons") {
            if (this.pointIndex !== undefined) {
                let point = this.polygons[this.polygonIndex][this.pointIndex[0]]
                point.x = point.x - (prev.x - current.x)
                point.y = point.y - (prev.y - current.y)
                if (this.pointIndex[1] !== undefined) {
                    let point = this.polygons[this.polygonIndex][this.pointIndex[1]]
                    point.x = point.x - (prev.x - current.x)
                    point.y = point.y - (prev.y - current.y)
                }
            }
            else {
                for (let i=0; i < this.polygons[this.polygonIndex].length; i++) {
                    let point = this.polygons[this.polygonIndex][i]
                    point.x = point.x - (prev.x - current.x)
                    point.y = point.y - (prev.y - current.y)
                }
            }
        }
        if (this.tool === "Points") {
            let point = this.points[this.pointIndex]
            point.x = point.x - (prev.x - current.x)
            point.y = point.y - (prev.y - current.y)
        }
        if (this.tool === "Ruler") {
            if (this.pointIndex === undefined) {
                let ruler = this.rulers[this.rulerIndex]
                let p1 = ruler[0]
                let p2 = ruler[1]
                p1.x = p1.x - (prev.x - current.x)
                p1.y = p1.y - (prev.y - current.y)
                p2.x = p2.x - (prev.x - current.x)
                p2.y = p2.y - (prev.y - current.y)
            }
            else {
                let point = this.rulers[this.rulerIndex][this.pointIndex]
                point.x = point.x - (prev.x - current.x)
                point.y = point.y - (prev.y - current.y)
            }
        }
        
    }
    
    tryToMovePoint() {
        if (this.tool === "Polygons") {
            if (this.leftButtonDown && (this.polygonIndex !== undefined)) {
                if (this.pointIndex !== undefined) {
                    this.movePoint(this.prevMousePosition, this.mousePosition)
                }
            }
        }
        if (this.tool === "Points") {
            this.movePoint(this.prevMousePosition, this.mousePosition)
        }
        if (this.tool === "Ruler") {
            this.movePoint(this.prevMousePosition, this.mousePosition)
        }
    }

    mouseCallback() {       
        if (this.leftButtonDown) {
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
            if ((this.tool === "Polygons") || (this.tool === "Points") || (this.tool === "Ruler")){
                this.canvas.onmousemove = (e) => {
                    this.prevMousePosition = {}
                    Object.assign(this.prevMousePosition, this.mousePosition);
                    this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                    this.tryToMovePoint()
                    this.updateImage()
                }
            }
        }
        else {
            this.canvas.onmousemove = (e) => {
                this.mousePosition = {x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop} // mouse position
                this.updateImage()
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
            if (e.button === 0) {
                this.leftButtonDown = true
            }
            if (e.button === 1) {
                this.middleButtonDown = true
            }
            if (e.button === 2) {
                this.rightButtonDown = true
            }

            if ((this.tool === "Polygons") || (this.tool === "Points") || (this.tool === "Ruler")) {
                if (this.leftButtonDown) {
                    console.log(this.pointIndex)
                    if (this.pointIndex === undefined) {
                        this.putPoint()
                    }
                }
                if (this.rightButtonDown) {
                    this.removePoint()
                }
            }
        })

        this.canvas.addEventListener("mouseup", (e) => {
            if (e.button === 0) {
                this.leftButtonDown = false
            }
            if (e.button === 1) {
                this.middleButtonDown = false
            }
            if (e.button === 2) {
                this.rightButtonDown = false
            }
        })
        this.canvas.addEventListener("wheel", (e) => {
            this.canvasSizeChange(e.deltaY < 0)
        })
    }

    isMoving() {
        return this.middleButtonDown
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
                <button onClick={() => this.setTool("Ruler")}>Ruler</button>
                <br />
                <br />
                <button onClick={() => this.setTool("Points")}>Points</button>
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