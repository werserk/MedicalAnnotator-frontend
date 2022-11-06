import { NavLink, useNavigate } from "react-router-dom";
import "./PageNotFound.css";

function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="error">
      <h1 className="error__title">404</h1>
      <p className="error__subtitle">Страница не найдена</p>
      <NavLink onClick={() => navigate(-1)} className="error__link">
        Назад
      </NavLink>
    </div>
  );
}

export default PageNotFound;
