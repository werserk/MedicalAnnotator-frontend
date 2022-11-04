import { useEffect } from "react";
import { useState } from "react";
import PopupWithForm from "../../elements/Popup/PopupWithForm";

function EditPopup({ study, isOpen, onClose, onEdit }) {

  const [comment, setComment] = useState("");

  useEffect(() => {
    setComment(study.comment);
}, [study]);

  function handleChangeComment(e) {
    setComment(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();

    onEdit(study.unique_id, comment);
  }
  return (
    <PopupWithForm
      name="edit"
      title="Редактировать исследование"
      buttonText="Сохранить"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {/* <div className="popup__item">
          <label className="popup__label">ФИО пациента</label>
          <input
            className="popup__input"
            onChange={(e) => onChange(e)}
            type="text"
            name="name"
          />
        </div> */}
      <div className="popup__item">
        <label className="popup__label">Комментарий</label>
        <textarea
          className="popup__textarea"
          onChange={(e) => handleChangeComment(e)}
          name="comment"
          value={comment}
          maxLength="255"
        ></textarea>
      </div>
    </PopupWithForm>
  );
}

export default EditPopup;
