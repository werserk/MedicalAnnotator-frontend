import "./Popup.css";

function PopupWithForm({
  name,
  title,
  children,
  buttonText,
  isOpen,
  onClose,
  onSubmit,
}) {

  function closePopupBackground(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className={`popup popup_name_${name} ${isOpen ? "popup_opened" : ""}`}
      onClick={closePopupBackground}
    >
      <div className="popup__container">
        <button
          type="button"
          className={`popup__close-btn popup__close-btn_name_${name}`}
          aria-label="Закрыть"
          onClick={onClose}
        ></button>
        <h3 className="popup__title">{title}</h3>
        <form
          className={`popup__form popup__form_${name}`}
          name={`${name}-form`}
          onSubmit={onSubmit}
        >
          {children}

          <div className="popup__footer">
            <button
              type="submit"
              className={`popup__btn popup__btn_type_${name}`}
              aria-label={buttonText}
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PopupWithForm;
