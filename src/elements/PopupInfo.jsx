import "./Popup.css";

function PopupInfo({ title, info, isOpen, onClose }) {
  function closePopupBackground(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className={`popup ${isOpen ? "popup_opened" : ""}`}
      onClick={closePopupBackground}
    >
      <div className="popup__container">
        <button
          type="button"
          className={`popup__close-btn`}
          aria-label="Закрыть"
          onClick={onClose}
        ></button>
        <h3 className="popup__title">{title}</h3>
        <p className="popup__info">{info}</p>
      </div>
    </div>
  );
}

export default PopupInfo;
