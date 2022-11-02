import "./Dropzone.css";
import { useDropzone } from "react-dropzone";

function Dropzone() {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  const files = acceptedFiles.map((file) => (
    <span key={file.path}>
      {file.path} - {file.size} bytes
    </span>
  ));

  return (
    <>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p className="dropzone__text">Перетащите файл сюда</p>
        <button type="button" className="dropzone__btn">
          Выберите файл
        </button>
        <div className="dropzone__files">{files}</div>
      </div>
    </>
  );
}

export default Dropzone;
