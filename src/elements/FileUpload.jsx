import { useState } from "react"
import { BASE_URL } from "../constans"
import axios from "axios"
import PropTypes from "prop-types"
import { success, errorMsg } from "./Notifications"
import { useContext } from "react"
import context from "../context"
import JSZip from 'jszip'

const FileUpload = ({ getStudies }) => {
    const [file, setFile] = useState(0)
    const [zipFile, setZipFile] = useState(0)
    const {authRequestHeader} = useContext(context)

    function handleChange(event) {
        const zip = new JSZip()
        const files = event.target.files;
        if (files.length === 1) {
            setFile(files[0])
            setZipFile(0)
        } else {
            for (let i = 0; i < event.target.files.length; i++) {
                if (files[i].name.split(".")[files[i].name.split(".").length - 1] === "dcm") {
                    zip.file(files[i].name, files[i]);
                } else {
                    errorMsg("Unsupported file format")
                }
            }
            setZipFile(zip)
            setFile(0)
        }
    }
    
    function handleSubmit(event) {
        event.preventDefault()

        const url = BASE_URL + 'api/upload/'

        const config = {
            headers: authRequestHeader
        }

        if (!file && !zipFile) {
            return errorMsg("File does not exist")
        } else if (!file) {
            zipFile.generateAsync({type: "blob"}).then(content => {
                const formData = new FormData();
                formData.append('file', content);
                try {
                    axios.put(url, formData, config).then((response) => {
                        success(response.data["success"]);
                    });
                } catch (e) {
                    error(e.response.data["error"])
                }
            });
        } else {
            const formData = new FormData();
            formData.append('file', file);
            if (file.name.split(".")[file.name.split(".").length - 1] === "dcm" || file.name.split(".")[file.name.split(".").length - 1] === "zip") {
                try {
                    axios.put(url, formData, config).then((response) => {
                        success(response.data["success"]);
                    });
                } catch (e) {
                    error(e.response.data["error"])
                }
            
            } else {
                errorMsg("Unsupported file format")
            }
        }
        getStudies()
    }

    return (
        <>
        <form onSubmit={handleSubmit}>
            <input multiple onChange={handleChange} type="file" name="file" id="file" />
            <button type="submit">Upload</button>
        </form>
        </>
    )
}

FileUpload.propTypes = {
    getStudies: PropTypes.func,
}

export default FileUpload