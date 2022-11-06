import PopupWithForm from "../../elements/Popup/PopupWithForm";
import Dropzone from "../../elements/Dropzone/Dropzone";
import { useState } from "react";

function AddPopup({ isOpenAddPopup, closeAllPopups, addStudy }) {

    const [newFile, setNewFile] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
    
        addStudy(`Добавляем исследование ${String(newFile)}`);
      }

  return (
    <PopupWithForm
      name="add"
      title="Добавить исследование"
      buttonText="Добавить"
      isOpen={isOpenAddPopup}
      onClose={closeAllPopups}
      onSubmit={handleSubmit}
    >
      <Dropzone setNewFile={setNewFile} />
    </PopupWithForm>
  );
}

export default AddPopup;
