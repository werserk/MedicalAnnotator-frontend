import { useContext, useState } from "react"
import { BASE_URL } from "../constans"
import axios from "axios"
import { errorMsg } from "../elements/Notifications"
import context from "../context"
import Slider from "../elements/Slider"
import { useParams } from "react-router"
import { useEffect } from "react"
import cv from "@techstark/opencv-js"

function Marker() {
    const {authRequestHeader} = useContext(context)

    const [value_1, changeValue1] = useState(1024)
    const [value_2, changeValue2] = useState(1024)
    const {study, instance} = useParams()

    const getInstance = () => {
        const url = BASE_URL + `api/instance/${study}/${instance}/`

        const config = {
            headers: authRequestHeader
        }

        try {
            axios.get(url, config).then((response) => {
            })
        } catch (e) {
            console.error(e)
            errorMsg("Не смогли получить экземпляр исследования")
        }
    }
    
    const cvProcessing = async (image) => {
        const mat = cv.matFromImageData({image, width: 1000, height: 1000})
        cv.imshow("canvas", mat)
        clearInterval(cvLoadingWait)
        
    }

    useEffect(() => {
        getInstance()
    }, [])
    

    return (
        <div className="marker">
            <canvas id="canvas"></canvas>
            <img id="image" alt="" />
            <p>first</p>
            <Slider max={2048} value={value_1} changeValue={changeValue1}/>
            <p>second</p>
            <Slider max={4096} value={value_2} changeValue={changeValue2}/>
            <hr />
            <input onChange={handleFileSelect} type="file" />
            <div className="" id="results"></div>
        </div>
    )
}

export default Marker
