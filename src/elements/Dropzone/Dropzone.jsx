import "./Dropzone.css";
import { useDropzone } from "react-dropzone";
import { useEffect } from "react";

function Dropzone({ setNewFile }) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  
  useEffect(() => {
    setNewFile(acceptedFiles);
  }, [acceptedFiles]);

  return (
    <>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p className="dropzone__text">Перетащите файл сюда</p>
        <button type="button" className="dropzone__btn">
          Выберите файл
        </button>
        <div className="dropzone__files">
          {acceptedFiles.map((file, i) => (
            <span key={i}>
              {file.path} - {file.size} bytes
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dropzone;
