import { OpenCvProvider, useOpenCv } from "opencv-react"
import { useContext, useState } from "react"
import { BASE_URL } from "../constans"
import axios from "axios"
import { errorMsg } from "../elements/Notifications"
import context from "../context"
import Slider from "../elements/Slider"
import { useParams } from "react-router"
import { useEffect } from "react"
import * as a from 'tiff.js'


function Marker() {
    const {cv, authRequestHeader} = useContext(context)

    const [value_1, changeValue1] = useState(1024)
    const [value_2, changeValue2] = useState(1024)
    const [imgUrl, setImgUrl] = useState()
    const {study, instance} = useParams()

    const getInstance = () => {
        const url = BASE_URL + `api/instance/${study}/${instance}/`

        const config = {
            headers: authRequestHeader
        }

        try {
            axios.get(url, config).then((response) => {
                setImgUrl(response.data["data"]["file"])
                cvProcessing()
            })
        } catch (e) {
            console.error(e)
            errorMsg("Не смогли получить список экземпляр исследования")
        }
    }
    
    const cvProcessing = async () => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open('GET', imgUrl);
        xhr.onload = function (e) {
            var tiff = new Tiff({buffer: xhr.response});
            var canvas = tiff.toCanvas();
            document.body.append(canvas);
        };
        xhr.send();
        // let imgElement = document.getElementById('image');
        // let mat = cv.imread(imgElement);
        // cv.imshow("canvas", mat)
    }

    useEffect(() => {
        getInstance()
    }, [])

    return (
        <div className="marker">
            <canvas id="canvas"></canvas>
            <img src={imgUrl} id="image" alt="" />
            <p>first</p>
            <Slider max={2048} value={value_1} changeValue={changeValue1}/>
            <p>second</p>
            <Slider max={4096} value={value_2} changeValue={changeValue2}/>
        </div>
    )
}

export default Marker
