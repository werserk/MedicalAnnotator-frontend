import "./Navigation.css";
import { NavLink } from "react-router-dom";

function Navigation({ isSuperUser }) {
  return (
    <nav className="navigation">
      <ul className="navigation__list">
        {isSuperUser ? (
          <>
            <li className="navigation__item">
              <NavLink to="/users" className="navigation__link">
                Список врачей
              </NavLink>
            </li>
            <li className="navigation__item">
              <NavLink to="/study" className="navigation__link">
                Список исследований
              </NavLink>
            </li>
            <li className="navigation__item">
              <NavLink to="/generation" className="navigation__link">
                Генерация патологий
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li className="navigation__item">
              <NavLink to="/study" className="navigation__link">
                Список исследований
              </NavLink>
            </li>
            <li className="navigation__item">
              <NavLink to="/generation" className="navigation__link">
                Генерация патологий
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
