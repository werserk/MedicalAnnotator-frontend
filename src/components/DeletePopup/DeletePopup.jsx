import PopupWithForm from "../../elements/Popup/PopupWithForm";

function DeletePopup({ study, isOpenDeletePopup, closeAllPopups, deleteStudy }) {

    function handleSubmit(e) {
        e.preventDefault();
    
        deleteStudy(study.unique_id);
      }

  return (
    <PopupWithForm
      name="delete"
      title="Удалить исследование"
      buttonText="Да"
      isOpen={isOpenDeletePopup}
      onClose={closeAllPopups}
      onSubmit={handleSubmit}
    >
      <p className="popup__info">Вы уверены?</p>
    </PopupWithForm>
  );
}

export default DeletePopup;
