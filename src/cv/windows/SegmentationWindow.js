import Slider from "../elements/Slider"
import { apply_windowing } from "../utils/transforms"
import cv from "@techstark/opencv-js"
import nj from "@d4c/numjs"

class SegmentationWindow {
    constructor (survey, tags) {
        this.survey = survey
        this.tags = tags
        this.windowing = [tags[0], tags[1]]

        // init image
        this.image = dicom2image(this.survey)
        this.image = apply_windowing(this.image, this.windowing[0], this.windowing[1])
        this.image = cv2.cvtColor(this.image, cv2.COLOR_GRAY2BGR)

        this.image_shape = this.image.shape().slice(0, 2)
        this.mask = nj.zeros(this.image_shape, dtype=nj.uint8)  // маска с разметкой
        this.brush_size = 5  // толщина кисти
        this._draw_flag = False  // рисуем ли
        this._erase_flag = False  // стираем ли
        this._sub_tool = 0  // Если 0, то ластик. Если 1, то анти-кисть
        this._contour_fill_type = 0  // Если 0, то контур не заполняется. Если 1, заполняется
        this.x, this.y = 0, 0
    }

    _update_windowing() {
        this.image = dicom2image(this.survey)
        this.image = apply_windowing(this.image, this.windowing[0], this.windowing[1])
        this.image = cv2.cvtColor(this.image, cv2.COLOR_GRAY2BGR)
    }

    _update_image() {
        let mat = cv.matFromArray(this.shape[1], this.shape[0], cv.CV_8U, this.image)
        cv.imshow("canvas", mat)
    }

    _wc_callback(pos) {
        this.windowing[0] = pos
        this._update_windowing()
        this._update_image()
    }

    _ww_callback(pos) {
        this.windowing[1] = pos
        this._update_windowing()
        this._update_image()
    }

    _brush_size_callback(pos) {
        this.brush_size = pos
    }

    show() {
        return (
            <div className="SegmentationWindow">
                <canvas id="canvas"></canvas>
                <img id="image" alt="" />
                <p>Window center</p>
                <Slider max={2048} value={this.windowing[0]} changeValue={this._wc_callback}/>
                <p>Window width</p>
                <Slider max={4096} value={this.windowing[1]} changeValue={this._ww_callback}/>
                <p>Brush size</p>
                <Slider max={20} value={this.brush_size} changeValue={this._brush_size_callback}/>
                <hr />
                <div className="" id="layerGroup0"></div>
            </div>
        )
    }
}   