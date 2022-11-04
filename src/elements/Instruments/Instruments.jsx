import Instrument from "../Instrument/Instrument";
import cursor from "../../assets/images/instruments/cursor.svg";
import shift from "../../assets/images/instruments/shift.svg";
import brush from "../../assets/images/instruments/brush.svg";
import antiBrush from "../../assets/images/instruments/anti-brush.svg";
import eraser from "../../assets/images/instruments/eraser.svg";
import polygon from "../../assets/images/instruments/polygon.svg";
import point from "../../assets/images/instruments/point.svg";
import ruler from "../../assets/images/instruments/ruler.svg";
import circle from "../../assets/images/instruments/circle.svg";
import filling2D from "../../assets/images/instruments/filling2D.svg";
import filling3D from "../../assets/images/instruments/filling3D.svg";
import fillingValue from "../../assets/images/instruments/filling-value.svg";
import filling from "../../assets/images/instruments/filling.svg";

function Instruments({ onClick, onClickSize }) {
  return (
    <div className="instruments">
      <ul className="instruments__list">
        {/* Основные инструменты */}
        <li className="instruments__item instruments__item_active">
          <Instrument img={cursor} alt="Курсор" onClick={onClick} disabled={false} />
        </li>
        <li className="instruments__item">
          <Instrument img={shift} alt="Перемещение" onClick={onClick} disabled={false} />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Инструменты ручной разметки */}
        <li className="instruments__item">
          <Instrument img={brush} alt="Кисть" onClick={onClick} onContextMenu={onClickSize} disabled={false} />
        </li>
        <li className="instruments__item">
          <Instrument
            img={antiBrush}
            alt="Анти&#8209;кисть"
            onClick={onClick}
            disabled={false}
          />
        </li>
        <li className="instruments__item">
          <Instrument img={eraser} alt="Ластик" onClick={onClick} onContextMenu={onClickSize} disabled={false} />
        </li>
        <li className="instruments__item">
          <Instrument
            img={polygon}
            alt="Построение полигонов"
            onClick={onClick}
            disabled={false}
          />
        </li>
        <li className="instruments__item">
          <Instrument img={point} alt="Точки" onClick={onClick} disabled={false} />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Измерительные инструменты */}
        <li className="instruments__item">
          <Instrument img={ruler} alt="Линейка" onClick={onClick} disabled={false} />
        </li>
        <li className="instruments__item">
          <Instrument img={circle} alt="ROI" onClick={onClick} disabled={false} />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Инструменты полу-автоматической разметки */}
        <li className="instruments__item">
          <Instrument img={filling2D} alt="Заливка 2D" onClick={onClick} onContextMenu={onClickSize} disabled={false} />
        </li>
        <li className="instruments__item">
          <Instrument img={filling3D} alt="Заливка 3D" onClick={onClick} onContextMenu={onClickSize} disabled={true} />
        </li>
        <li className="instruments__item">
          <Instrument
            img={fillingValue}
            alt="Заливка по значениям"
            onClick={onClick}
            onContextMenu={onClickSize}
            disabled={false}
          />
        </li>
        <li className="instruments__item">
          <Instrument
            img={filling}
            alt="Заливка контуров"
            onClick={onClick}
            onContextMenu={onClickSize}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>
      </ul>
    </div>
  );
}

export default Instruments;
