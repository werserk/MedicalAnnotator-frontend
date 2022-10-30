import Slider from "../elements/Slider"
import { apply_windowing } from "../utils/transforms"
import cv from "@techstark/opencv-js"

class BaseWindow {
    constructor (survey, tags) {
        this.survey = survey
        this.tags = tags
        this.windowing = [tags[0], tags[1]]
        this.image = apply_windowing(this.survey, this.windowing[0], this.windowing[1])
        this.image = cv.cvtColor(this.image, cv.COLOR_GRAY2BGR)
        this.imageShape = this.image.shape().slice(0, 2)
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

    show() {
        return (
            <div className="BaseWindow">
                <canvas id="canvas"></canvas>
                <img id="image" alt="" />
                <p>Window center</p>
                <Slider max={2048} value={this.windowing[0]} changeValue={this.wc_callback}/>
                <p>Window width</p>
                <Slider max={4096} value={this.windowing[1]} changeValue={this.ww_callback}/>
                <hr />
                <div className="" id="layerGroup0"></div>
            </div>
        )
    }
}   