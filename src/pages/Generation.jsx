import "./Generation.css";
import Dropzone from "../elements/Dropzone";
import GenerationForm from "../elements/GenerationForm";

function Generation({ isGenerated, onSubmit }) {
  return (
    <div className="generation">
      <h1 className="generation__title">Генерация патологий</h1>
      <div className="generation__container">
        <div className="generation__dropzone">
          <Dropzone />
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
          <GenerationForm onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
}

export default Generation;
