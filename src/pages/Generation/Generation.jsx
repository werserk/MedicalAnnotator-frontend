import "./Generation.css";
import Dropzone from "../../elements/Dropzone/Dropzone";
import GenerationForm from "../../elements/GenerationForm/GenerationForm";
import { useState } from "react";

function Generation({ isGenerated, onSubmit, generateStudies }) {
  const [newFile, setNewFile] = useState("");

  function handleGenerate() {
    generateStudies(newFile);
    onSubmit();
  }
  
  return (
    <div className="generation">
      <h1 className="generation__title">Генерация патологий</h1>
      <div className="generation__container">
        <div className="generation__dropzone">
          <Dropzone setNewFile={setNewFile} />
          {isGenerated && (
            <div className="generation__buttons">
              <button type="button" className="generation__export">
                Экспорт
              </button>
              <button type="button" className="generation__save">
                Сохранить
              </button>
            </div>
          )}
        </div>
        <div className="generation__data">
          <GenerationForm onSubmit={handleGenerate} />
        </div>
      </div>
    </div>
  );
}

export default Generation;
