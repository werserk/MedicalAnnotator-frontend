import "./Header.css";
import { useLocation } from "react-router-dom";
import Navigation from "../components/Navigation";

function Header({ isSuperUser }) {
  const { pathname } = useLocation();

  if (
    pathname !== "/" &&
    pathname !== "/users" &&
    pathname !== "/dashboard" &&
    pathname !== "/study" &&
    pathname !== "/generation"
  ) {
    return <></>;
  }

  return (
    <header className="header">
      {/* <img src="" className="header__logo" /> */}
      <div className="header__logo_block">Лого</div>

      <Navigation isSuperUser={isSuperUser} />

      <div className="header__account">
        <button type="button" className="header__link">
          Предоставить доступ
        </button>
        <button type="button" className="header__button">
          Выйти
        </button>
      </div>
    </header>
  );
}

export default Header;
