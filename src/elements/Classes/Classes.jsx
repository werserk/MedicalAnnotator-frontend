import "./Classes.css";
import { classes } from "../../constans";

function Classes() {
  return (
    <div className="classes">
      <h3 className="classes__title">Классы</h3>
      <form className="classes__form">
        <div className="classes__value">
          <input className="classes__input" type="text" min="1" max="20" />
          <input className="classes__color" type="color" />
          <button className="classes__button">+</button>
        </div>
      </form>

      <ul className="classes__list">
        {classes.map((item) => {
          return (
            <li className="classes__item" key={item.id}>
              <p className="classes__name">{item.name}</p>
              <input
                className="classes__value-color"
                type="color"
                defaultValue={item.color}
              />
              {!item.default && (
                <button type="button" className="classes__delete"></button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Classes;
