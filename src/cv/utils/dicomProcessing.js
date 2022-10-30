export function parseTags (rawTags) {
    if ("x00281050" in rawTags) {
        var windowCenter = parseInt(rawTags.x00281050.value[0], 10)
    }
    if ("x00281051" in rawTags) {
        var windowWidth = parseInt(rawTags.x00281051.value[0], 10)
    }
    if ("x00281052" in rawTags) {
        var rescaleIntercept = parseInt(rawTags.x00281052.value[0], 10)
    }
    if ("x00281053" in rawTags) {
        var slope = parseInt(rawTags.x00281053.value[0], 10)
    }
    if ("x00280004" in rawTags) {
        var photometricInterpretation = parseInt(rawTags.x00280004.value[0], 10)
    }
    if ("x00280030" in rawTags) {
        var pixelSpacing = parseInt(rawTags.x00280030.value[0], 10)
    }

    const tags = [windowCenter, windowWidth, rescaleIntercept, slope, photometricInterpretation, pixelSpacing]
    return tags
}