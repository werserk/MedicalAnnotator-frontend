import "./Instruments.css";

function Instrument({ img, alt, onClick }) {
  return (
    <button type="button" className="instrument" onClick={onClick}>
      <img src={img} alt={alt} className="instrument__img" />
      <span className="instrument__info">{alt}</span>
    </button>
  );
}

export default Instrument;
