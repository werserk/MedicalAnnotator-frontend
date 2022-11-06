import PopupWithForm from "../../elements/Popup/PopupWithForm";
import Dropzone from "../../elements/Dropzone/Dropzone";
import { useState } from "react";

function AddPopup({ isOpenAddPopup, closeAllPopups, addStudy, generateZip }) {

    const [newFile, setNewFile] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        const zip = generateZip(newFile)
        zip.generateAsync({type: "blob"}).then(content => {
          const formData = new FormData();
          formData.append('file', content);
          addStudy(formData);
        });
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
