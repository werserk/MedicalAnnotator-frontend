import { useEffect } from "react"
import cv from '@techstark/opencv-js'

const Viewport = (props) => {
    // {
    //     detectedEnvironment: {
    //         isMouseDetected: false,
    //         isTouchDetected: false,
    //     },
    //     elementDimensions: {
    //         width: Number,
    //         height: Number
    //     },
    //     isActive: Boolean,
    //     isPositionOutside: Boolean,
    //     position: {
    //         x: Number,
    //         y: Number
    //     }
    // }

    const displayMat = (mat) => {
        if (mat) {
            cv.imshow("canvas", mat)
        }
    }

    useEffect(() => {
        displayMat(props.mat)
        props.setMousePosition(props.position)
    }, [props.mat, props.position])


    return (
        <canvas id="canvas"/>
    )
}

export default Viewport