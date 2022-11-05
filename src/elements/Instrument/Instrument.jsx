import "./Instruments.css";

function Instrument({ img, alt, onClick, disabled }) {
  function handleContextMenu(e) {
    e.preventDefault();
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
    </button>
  );
}

export default Instrument;
