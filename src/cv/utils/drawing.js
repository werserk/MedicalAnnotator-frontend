import { COLOR_GREEN } from "../constants"

export function draw_dot(image, coordinates, color=COLOR_GREEN) {
    image = cv2.circle(image, coordinates, CURSOR_SIZE, color, thickness=-1)
    return image
}

export function distance_between_points(p1, p2, spacing=(1, 1)) {
    return (((p1[0] - p2[0]) * spacing[1]) ** 2 + ((p1[1] - p2[1]) * spacing[0]) ** 2) ** 0.5
}

export function draw_text(image, text, pos,
                            font=cv2.FONT_HERSHEY_PLAIN,
                            font_scale=1,
                            font_thickness=1,
                            text_color=COLOR_BLACK,
                            text_color_bg=COLOR_GREEN) {
    let x, y = pos
    let [text_size, _ ] = cv2.getTextSize(text, font, font_scale, font_thickness)
    let [text_w, text_h] = text_size
    let image = cv2.rectangle(image, pos, (x + text_w, y + text_h), text_color_bg, -1)
    image = cv2.putText(image, text, (x, y + text_h + font_scale - 1), font, font_scale, text_color, font_thickness)
    return image
}