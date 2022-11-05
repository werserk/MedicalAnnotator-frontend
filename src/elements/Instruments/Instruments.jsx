import Instrument from "../Instrument/Instrument";
import InstrumentWithMenu from "../Instrument/InstrumentWithMenu";
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
import { useState } from "react";

function Instruments({ onClick }) {
  const [isOpenSizeMenu, setIsOpenSizeMenu] = useState(false);
  const [isOpenEraserMenu, setIsOpenEraserMenu] = useState(false);
  const [isOpenViewsMenu, setIsOpenViewsMenu] = useState(false);
  const [isOpenDeviationMenu, setIsOpenDeviationMenu] = useState(false);

  const [menuData, setMenuData] = useState({
    brushSize: 1,
    eraserSize: 1,
    deviationAmount: 0,
    topValue: 1,
    bottomValue: 1,
  });
  const [isActiveFilling2D, setIsActiveFilling2D] = useState(false);
  const [isActiveFillingValue, setIsActiveFillingValue] = useState(false);
  const [isActiveFilling, setIsActiveFilling] = useState(false);

  const { brushSize, eraserSize, deviationAmount, topValue, bottomValue } =
    menuData;

  const onChange = (e) =>
    setMenuData({ ...menuData, [e.target.name]: e.target.value });

  return (
    <div className="instruments">
      <ul className="instruments__list">
        {/* Основные инструменты */}
        <li className="instruments__item">
          <Instrument
            img={cursor}
            alt="Курсор"
            onClick={onClick}
            disabled={false}
          />
        </li>
        <li className="instruments__item">
          <Instrument
            img={shift}
            alt="Перемещение"
            onClick={onClick}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Инструменты ручной разметки */}
        <li className="instruments__item">
          <InstrumentWithMenu
            img={brush}
            alt="Кисть"
            onClick={onClick}
            disabled={false}
            setIsOpen={setIsOpenSizeMenu}
            isOpen={isOpenSizeMenu}
          >
            <label className="instrument-context__menu-label">
              Размер
              <span
                className="instrument-context__menu-circle"
                style={{ width: brushSize + "px", height: brushSize + "px" }}
              ></span>
            </label>
            <input
              className="instrument-context__menu-input"
              type="range"
              min="1"
              max="20"
              name="brushSize"
              value={brushSize}
              onChange={(e) => onChange(e)}
            />
          </InstrumentWithMenu>
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
          <InstrumentWithMenu
            img={eraser}
            alt="Ластик"
            onClick={onClick}
            disabled={false}
            setIsOpen={setIsOpenEraserMenu}
            isOpen={isOpenEraserMenu}
          >
            <label className="instrument-context__menu-label">
              Размер
              <span
                className="instrument-context__menu-circle"
                style={{ width: eraserSize + "px", height: eraserSize + "px" }}
              ></span>
            </label>
            <input
              className="instrument-context__menu-input"
              type="range"
              min="1"
              max="20"
              name="eraserSize"
              value={eraserSize}
              onChange={(e) => onChange(e)}
            />
          </InstrumentWithMenu>
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
          <Instrument
            img={point}
            alt="Точки"
            onClick={onClick}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Измерительные инструменты */}
        <li className="instruments__item">
          <Instrument
            img={ruler}
            alt="Линейка"
            onClick={onClick}
            disabled={false}
          />
        </li>
        <li className="instruments__item">
          <Instrument
            img={circle}
            alt="ROI"
            onClick={onClick}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Инструменты полу-автоматической разметки */}
        <li
          className={`instruments__item ${
            isActiveFilling2D && "instruments__item_active"
          }`}
          onClick={() => {
            setIsActiveFilling2D(!isActiveFilling2D);
          }}
        >
          <div className="instruments__label">
            <InstrumentWithMenu
              img={filling2D}
              alt="Заливка 2D"
              onClick={onClick}
              disabled={false}
              setIsOpen={setIsOpenDeviationMenu}
              isOpen={isOpenDeviationMenu}
            >
              <label className="instrument-context__menu-label">
                Макс. значение отклонений
              </label>
              <input
                className="instrument-context__menu-input"
                type="number"
                min="0"
                max="100"
                name="deviationAmount"
                value={deviationAmount}
                onChange={(e) => onChange(e)}
              />
            </InstrumentWithMenu>
          </div>
        </li>
        <li className="instruments__item">
          <Instrument
            img={filling3D}
            alt="Заливка 3D"
            onClick={onClick}
            disabled={true}
          />
        </li>
        <li 
          className={`instruments__item ${
            isActiveFillingValue && "instruments__item_active"
          }`}
          onClick={(e) => {
            setIsActiveFillingValue(!isActiveFillingValue);
          }}
        >
          <InstrumentWithMenu
            img={fillingValue}
            alt="Заливка по значениям"
            onClick={onClick}
            disabled={false}
            setIsOpen={setIsOpenViewsMenu}
            isOpen={isOpenViewsMenu}
          >
            <ul className="instrument-context__menu-list">
              <li className="instrument-context__menu-item">
                <label className="instrument-context__menu-label">
                  Верхнее
                </label>
                <input
                  className="instrument-context__menu-input"
                  type="number"
                  min="1"
                  max="100"
                  name="topValue"
                  value={topValue}
                  onChange={(e) => onChange(e)}
                />
              </li>
              <li className="instrument-context__menu-item">
                <label className="instrument-context__menu-label">Нижнее</label>
                <input
                  className="instrument-context__menu-input"
                  type="number"
                  min="1"
                  max="100"
                  name="bottomValue"
                  value={bottomValue}
                  onChange={(e) => onChange(e)}
                />
              </li>
            </ul>
          </InstrumentWithMenu>
        </li>
        <li 
          className={`instruments__item ${
            isActiveFilling && "instruments__item_active"
          }`}
          onClick={() => {
            setIsActiveFilling(!isActiveFilling);
          }}
        >
          <Instrument
            img={filling}
            alt="Заливка контуров"
            onClick={onClick}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>
      </ul>
    </div>
  );
}

export default Instruments;
