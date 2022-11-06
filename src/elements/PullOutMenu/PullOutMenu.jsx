import "./PullOutMenu.css";

function PullOutMenu({ onChange, data }) {
  return (
    <div className="pull-out-menu">
      <ul className="pull-out-menu__list">
        <li className="pull-out-menu__item">
          <label className="pull-out-menu__label">Window Center</label>
          <input
            className="pull-out-menu__input"
            type="number"
            name="center"
            min="1"
            max="10"
            value={data.center}
            onChange={(e) => onChange(e)}
          />
        </li>
        <li className="pull-out-menu__item">
          <label className="pull-out-menu__label">Window Width</label>
          <input
            className="pull-out-menu__input"
            type="number"
            name="width"
            min="1"
            max="10"
            value={data.width}
            onChange={(e) => onChange(e)}
          />
        </li>
        <li className="pull-out-menu__item">
          <select
            className="pull-out-menu__select"
            name="base"
            onChange={(e) => onChange(e)}
            defaultValue="Базовые значения"
          >
            <option value="Базовые значения" disabled>
              Базовые значения
            </option>
            <option value="brain">Brain</option>
            <option value="lungs">Lungs</option>
            <option value="liver">Liver</option>
            <option value="bone">Bone</option>
          </select>
        </li>
      </ul>

      <ul className="pull-out-menu__list">
        <li className="pull-out-menu__item">
          <label className="pull-out-menu__label">Яркость</label>
          <input
            className="pull-out-menu__input pull-out-menu__input_type_range"
            type="range"
            name="bright"
            min="-50"
            max="50"
            value={data.bright}
            onChange={(e) => onChange(e)}
          />
          <span className="pull-out-menu__value">{data.bright}</span>
        </li>
        <li className="pull-out-menu__item">
          <label className="pull-out-menu__label">Контрастность</label>
          <input
            className="pull-out-menu__input pull-out-menu__input_type_range"
            type="range"
            name="contrast"
            min="-50"
            max="50"
            value={data.contrast}
            onChange={(e) => onChange(e)}
          />
          <span className="pull-out-menu__value">{data.contrast}</span>
        </li>
      </ul>
    </div>
  );
}

export default PullOutMenu;
