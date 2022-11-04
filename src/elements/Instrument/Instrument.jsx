import "./Instruments.css";

function Instrument({ img, alt, onClick, onContextMenu, disabled }) {
  function handleContextMenu(e) {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu();
    }
  }

  return (
    <button
      type="button"
      className="instrument"
      onClick={onClick}
      onContextMenu={handleContextMenu}
      disabled={disabled}
    >
      <img src={img} alt={alt} className="instrument__img" />
      <span className="instrument__info">{alt}</span>
      {onContextMenu && <div className="instrument__menu">Меню</div>}
    </button>
  );
}

export default Instrument;
