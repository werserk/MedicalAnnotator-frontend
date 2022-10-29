export function apply_windowing(img, window_center, window_width, intercept, slope, inverted=false, np) {
    let img = (img * slope + intercept)  // for translation adjustments given in the dicom file.
    let img_min = window_center - window_width // 2  # minimum HU level
    let img_max = window_center + window_width // 2  # maximum HU level
    img[img < img_min] = img_min  // set img_min for all HU levels less than minimum HU level
    img[img > img_max] = img_max  // set img_max for all HU levels higher than maximum HU level
    if (inverted) {
        img = -img
        img_min = Math.min(...img)
        img_max = Math.max(...img)
    }
    img = (img - img_min) / (img_max - img_min) * 255.0
    img = np.array(img, dtype=np.uint8)
    return img
}

export function denoise(image, power=13, temp_window_size=7, search_window_size=21, cv2) {
    const denoised = cv2.fastNlMeansDenoising(image, None, power, temp_window_size, search_window_size)
    return denoised
}

export function threshold(image, cv2) {
    const thresh = cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 3, 1)
    return thresh
}

export function transform_to_contours (image, cv2, np) {
    const [contours, hierarchy] = cv2.findContours(image, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    const mask = np.zeros(image.shape, np.uint8)
    cv2.drawContours(mask, contours, -1, (255, 255, 255), -1)
    return image
}

const criterion = (x, value) => {
    return x === value
}

export function apply_boolean_mask(array, array_criterion, value, inc) {
    array.copy()
    if (array.shape != array_criterion.shape) {
        print("Размеры не совпадают")
        return
    }

    for (let i = 1; i < array.lenght; i++) {

    }
    if (array.shape.lenght === 2) {
        for (let i = 1; i < array.lenght; i++) {
            for (let j = 1; j < array[i].lenght; j++) {
                if (criterion(array_criterion[i][j], inc)) {
                    array[i][j] = value
                }
            }
        }
    }
    else if (array.shape.lenght === 3) {
        for (let i = 1; i < array.lenght; i++) {
            for (let k = 1; k < array[i].lenght; k++) {
                for (let k = 1; k < array[i].lenght; k++) {
                    if (criterion(array_criterion[i][j][k], inc)) {
                        array[i][j][k] = value
                    }
                }
            }
        }
    }
    return array
}

export function remove_small_dots(image, cv2, np) {
    let binary_map = image.copy()
    binary_map = 255 - binary_map  // invert
    let [nlabels, labels, stats] = cv2.connectedComponentsWithStats(binary_map, None, None, None, 8, cv2.CV_32S)
    let areas = stats[stats.slice([1, null], [cv2.CC_STAT_AREA])]
    // let areas = stats[stats[1:, cv2.CC_STAT_AREA]]
    let result = np.zeros(labels.shape, np.uint8)
    for (let i = 0; i < nlabels.length - 1; i++) {
        if (areas[i] <= 10) {
            result = apply_boolean_mask(result, labels, 1, i + 1)
        }
    }

    result = cv2.bitwise_or(result, image)
    return result
}

export function erode(image, kernel_size, np, cv2) {
    const kernel = np.ones(kernel_size, np.uint8)
    const eroded = cv2.erode(image, kernel)
    return eroded
}

function get_windowing(data) {
    var dicom_fields, res;
  
    try {
      dicom_fields = [data[["0028", "1050"]].value, data[["0028", "1051"]].value];
  
      res = function () {
        var _pj_a = [],
            _pj_b = dicom_fields;
  
        for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
          var x = _pj_b[_pj_c];
  
          _pj_a.push(get_first_of_dicom_field_as_int(x));
        }
  
        return _pj_a;
      }.call(this);
    } catch (e) {
      if (e instanceof KeyError) {
        console.log("No window center or width");
        res = [2048, 4096];
      } else {
        throw e;
      }
    }
  
    try {
      dicom_fields = [data[["0028", "1052"]].value, data[["0028", "1053"]].value];
      res.extend(function () {
        var _pj_a = [],
            _pj_b = dicom_fields;
  
        for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
          var x = _pj_b[_pj_c];
  
          _pj_a.push(get_first_of_dicom_field_as_int(x));
        }
  
        return _pj_a;
      }.call(this));
    } catch (e) { 
      if (e instanceof KeyError) {
        res.extend([0, 1]);
      } else {
        throw e;
      }
    }
  
    try {
      res.append(data[["0028", "0004"]].value === "MONOCHROME1");
    } catch (e) {
      if (e instanceof KeyError) {
        res.append(false);
      } else {
        throw e;
      }
    }
  
    return res;
  }

function dicom2image(image, raw = false, equalize = false) {
    var image, windowing;
    windowing = get_windowing(scan);
    
    if (!raw) {
        image = apply_windowing(image, ...windowing);
    }
    
    if (equalize) {
        image = equalize_hist(image);
    }
    
    if (raw) {
        return [image, windowing];
    }
    
    return image;
    }


    