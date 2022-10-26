export function find_exterior_contours(img, cv2) {
    // Находим контуры объектов разметки
    const ret = cv2.findContours(img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    if (ret.lenght === 2) {
        return ret[0]
    }
    if (ret.lenght === 3) {
        return ret[1]
    }
    throw "Check the signature for `cv.findContours()`."
}

export function distance_between_points(p1, p2, spacing=(1, 1)) {
    return (((p1[0] - p2[0]) * spacing[1]) ** 2 + ((p1[1] - p2[1]) * spacing[0]) ** 2) ** 0.5
}