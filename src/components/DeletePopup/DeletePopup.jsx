import PopupWithForm from "../../elements/Popup/PopupWithForm";

function DeletePopup({ study, isOpenDeletePopup, closeAllPopups, deleteStudy }) {

    function handleSubmit(e) {
        e.preventDefault();

        console.log(study.unique_id)
    
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
