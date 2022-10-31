import dwv from 'dwv'
import cv from "@techstark/opencv-js"
import nj from "@d4c/numjs/build/module/numjs.min.js"

dwv.image.decoderScripts = {
    "jpeg2000": "/node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "/node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "/node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
};

var requestHeaders = { // заголовки авторизации
    name: "Authorization",
    value: authRequestHeader["Authorization"]
}

const app = new dwv.App(); // настраиваем вьюпорт
app.init({
    dataViewConfigs: {'*': []}
});

function createMat() {
    const image = app.getImage(0)
    setCurrentImage(image)
    const geometry = image.getGeometry()
    const size = geometry.getSize().getValues() // width, height, deep
    const buffer = image.getBuffer() 
    let float32Normalized = apply_windowing(new Float32Array(buffer), wc, ww)
    let mat = new cv.matFromArray(size[1], size[0], cv.CV_32FC1, float32Normalized.tolist())
    cv.imshow("canvas", mat)
}

app.loadURLs([url], {"requestHeaders": [requestHeaders]})
app.addEventListener('loadend', () => {
    const CV_NJLoadingHandle = setInterval(() => {
        if (cv && nj) {
            clearInterval(CV_NJLoadingHandle)
            createMat()
        }
    }, 500)

});

window.addEventListener("load", () => {
    const canvas = document.getElementById("canvas")
    const mouseMove = canvas.addEventListener('mousemove', (e) => {
        const {
          clientX,
          clientY
        } = e
        console.log(clientX - e.currentTarget.offsetLeft, clientY - e.currentTarget.offsetTop)
      })
    canvas.addEventListener("mouseleave", removeEventListener(mouseMove))
})
