import "./Workspace.css";
import Instrument from "../Instrument/Instrument";
import squere4 from "../../assets/images/instruments/squere4.svg";
import squere from "../../assets/images/instruments/squere.svg";

function Workspace({ fourImage, onClick, onClickView, mouseCallback }) {
  return (
    <div className="workspace">
      <div
        className={`workspace__img ${fourImage && "workspace__img_type_four"}`}
      >
        {fourImage ? (
          <>
            <div className="workspace__one-img"></div>
            <div className="workspace__one-img"></div>
            <div className="workspace__one-img"></div>
            <div className="workspace__one-img"></div>
          </>
        ) : (
          <canvas className="workspace__one-img" id="canvas" onMouseDownCapture={mouseCallback} onMouseUpCapture={mouseCallback} onMouseMove={mouseCallback}></canvas>
        )}
      </div>

      <div className="workspace__instruments">
        {fourImage ? (
          <Instrument img={squere} alt="Вид" onClick={onClickView} />
        ) : (
          <Instrument img={squere4} alt="Вид" onClick={onClickView} />
        )}

        <button
          className="workspace__next-img"
          type="button"
          onClick={onClick}
        ></button>
      </div>
    </div>
  );
}

export default Workspace;