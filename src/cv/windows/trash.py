def get_windowing(data):
    # window center and width
    try:
        dicom_fields = [data[('0028', '1050')].value,  # window center
                        data[('0028', '1051')].value]  # window width
        res = [get_first_of_dicom_field_as_int(x) for x in dicom_fields]
    except KeyError:
        print('No window center or width')
        res = [2048, 4096]

    # intercept and slope
    try:
        dicom_fields = [data[('0028', '1052')].value,  # intercept
                        data[('0028', '1053')].value]  # slope
        res.extend([get_first_of_dicom_field_as_int(x) for x in dicom_fields])
    except KeyError:
        res.extend([0, 1])

    # is inverted
    try:
        res.append(data[('0028', '0004')].value == 'MONOCHROME1')
    except KeyError:
        res.append(False)
    return res