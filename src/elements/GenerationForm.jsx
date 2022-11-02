import { useState } from "react";
import "./GenerationForm.css";

function GenerationForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    size: "",
  });
  const [formCheckboxes, setFormCheckboxes] = useState({
    lungLeftTop: false,
    lungLeftCenter: false,
    lungLeftBottom: false,
    lungRightTop: false,
    lungRightCenter: false,
    lungRightBottom: false,
  });

  const { name, amount, size } = formData;
  const {
    lungLeftTop,
    lungLeftCenter,
    lungLeftBottom,
    lungRightTop,
    lungRightCenter,
    lungRightBottom,
  } = formCheckboxes;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    //setIsAuthenticated(true);
    onSubmit();
    console.log(`${name} ${amount}  ${size}`);
  };

  const onChangeCheckbox = (e) => {
    setFormCheckboxes({ ...formCheckboxes, [e.target.name]: e.target.checked });
  };

  return (
    <form className="generation-form" onSubmit={handleSubmit}>
      <div>
        <div className="generation-form__header">
          <h2 className="generation-form__title">Данные патологии</h2>
          <button type="button" className="generation-form__clean"></button>
        </div>
        <ul className="generation-form__list">
          <li className="generation-form__item">
            <label className="generation-form__label">
              Наименование патологии
            </label>
            <select
              className="generation-form__select"
              name="name"
              onChange={(e) => onChange(e)}
              defaultValue="Не выбрано"
            >
              <option value="Не выбрано" disabled>
                Не выбрано
              </option>
              <option value="COVID-19">COVID-19</option>
              <option value="cancer">Рак лёгких</option>
            </select>
          </li>

          <li className="generation-form__item">
            <ul className="generation-form__lungs">
              <li className="generation-form__lung">
                <p className="generation-form__lung-title">Левое легкое</p>
                <label className="generation-form__lung-label">
                  <input
                    type="checkbox"
                    name="lungLeftTop"
                    onChange={onChangeCheckbox}
                  />
                  <span className="generation-form__lung-text">
                    Верхняя доля
                  </span>
                </label>
                <label className="generation-form__lung-label">
                  <input
                    type="checkbox"
                    name="lungLeftCenter"
                    onChange={onChangeCheckbox}
                  />
                  <span className="generation-form__lung-text">
                    Средняя доля
                  </span>
                </label>
                <label className="generation-form__lung-label">
                  <input
                    type="checkbox"
                    name="lungLeftBottom"
                    onChange={onChangeCheckbox}
                  />
                  <span className="generation-form__lung-text">
                    Нижняя доля
                  </span>
                </label>
              </li>
              <li className="generation-form__lung">
                <p className="generation-form__lung-title">Левое легкое</p>
                <label className="generation-form__lung-label">
                  <input
                    type="checkbox"
                    name="lungRightTop"
                    onChange={onChangeCheckbox}
                  />
                  <span className="generation-form__lung-text">
                    Верхняя доля
                  </span>
                </label>
                <label className="generation-form__lung-label">
                  <input
                    type="checkbox"
                    name="lungRightCenter"
                    onChange={onChangeCheckbox}
                  />
                  <span className="generation-form__lung-text">
                    Средняя доля
                  </span>
                </label>
                <label className="generation-form__lung-label">
                  <input
                    type="checkbox"
                    name="lungRightBottom"
                    onChange={onChangeCheckbox}
                  />
                  <span className="generation-form__lung-text">
                    Нижняя доля
                  </span>
                </label>
              </li>
            </ul>
          </li>

          <li className="generation-form__item">
            <label className="generation-form__label">
              Количество очагов патологии
            </label>
            <select
              className="generation-form__select"
              name="amount"
              onChange={(e) => onChange(e)}
              defaultValue="Не выбрано"
            >
              <option value="Не выбрано" disabled>
                Не выбрано
              </option>
              <option value="single">Единичное</option>
              <option value="numerous">Многочисленное</option>
            </select>
          </li>

          <li className="generation-form__item">
            <label className="generation-form__label">Размер патологии</label>
            <select
              className="generation-form__select"
              name="size"
              onChange={(e) => onChange(e)}
              defaultValue="Не выбрано"
            >
              <option value="Не выбрано" disabled>
                Не выбрано
              </option>
              <option value="small">5 - 10 мм</option>
              <option value="medium">10 - 20 мм</option>
              <option value="large">{">"} 20 мм</option>
            </select>
          </li>
        </ul>
      </div>

      <button type="submit" className="generation-form__btn">
        Сгенерировать
      </button>
    </form>
  );
}

export default GenerationForm;
