import { useEffect } from "react"
import cv from '@techstark/opencv-js'
import '../cv/base'

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

    function displayMat(mat) {
        if (mat) {
            cv.imshow("canvas", mat)
        }
    }

    // useEffect(() => {
    //     displayMat(props.mat)
    // }, [props.mat])


    // useEffect(() => {
    //     props.setMousePosition(props.position)
    //     props.setIsActive(props.isActive)
    //     console.log(props.isActive)
    // }, [props.position, props.isActive])



    return (
        <canvas id="canvas"/>
    )
}

export default Viewport