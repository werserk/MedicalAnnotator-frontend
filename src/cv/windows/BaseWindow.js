import { func } from "prop-types"

class BaseWindow {
    constructor (image) {
        this.image = image
        this.windowing = applyWindowing()
        // this.base_windowing = (0028, 1050), (0028, 1051)
        if (typeOf(this) == BaseWindow) {
        }
    }

}

// сохранить мин макс