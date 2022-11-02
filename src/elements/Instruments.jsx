import Instrument from "./Instrument";
import cursor from "../assets/images/instruments/cursor.svg";
import shift from "../assets/images/instruments/shift.svg";
import brush from "../assets/images/instruments/brush.svg";
import antiBrush from "../assets/images/instruments/anti-brush.svg";
import eraser from "../assets/images/instruments/eraser.svg";
import polygon from "../assets/images/instruments/polygon.svg";
import point from "../assets/images/instruments/point.svg";
import ruler from "../assets/images/instruments/ruler.svg";
import circle from "../assets/images/instruments/circle.svg";
import filling2D from "../assets/images/instruments/filling2D.svg";
import filling3D from "../assets/images/instruments/filling3D.svg";
import filling from "../assets/images/instruments/filling.svg";

function Instruments({ onClick }) {
  return (
    <div className="instruments">
      <ul className="instruments__list">
        {/* Основные инструменты */}
        <li className="instruments__item instruments__item_active">
          <Instrument img={cursor} alt="Курсор" onClick={onClick} />
        </li>
        <li className="instruments__item">
          <Instrument img={shift} alt="Перемещение" onClick={onClick} />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Инструменты ручной разметки */}
        <li className="instruments__item">
          <Instrument img={brush} alt="Кисть" onClick={onClick} />
        </li>
        <li className="instruments__item">
          <Instrument
            img={antiBrush}
            alt="Анти&#8209;кисть"
            onClick={onClick}
          />
        </li>
        <li className="instruments__item">
          <Instrument img={eraser} alt="Ластик" onClick={onClick} />
        </li>
        <li className="instruments__item">
          <Instrument
            img={polygon}
            alt="Построение полигонов"
            onClick={onClick}
          />
        </li>
        <li className="instruments__item">
          <Instrument img={point} alt="Точки" onClick={onClick} />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Измерительные инструменты */}
        <li className="instruments__item">
          <Instrument img={ruler} alt="Линейка" onClick={onClick} />
        </li>
        <li className="instruments__item">
          <Instrument img={circle} alt="ROI" onClick={onClick} />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Инструменты полу-автоматической разметки */}
        <li className="instruments__item">
          <Instrument img={filling2D} alt="Заливка 2D" onClick={onClick} />
        </li>
        <li className="instruments__item">
          <Instrument img={filling3D} alt="Заливка 3D" onClick={onClick} />
        </li>
        <li className="instruments__item">
          <Instrument
            img={filling}
            alt="Заливка по значениям"
            onClick={onClick}
          />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>
      </ul>
    </div>
  );
}

export default Instruments;
