import "./Header.css";
import { useLocation } from "react-router-dom";
import Navigation from "../../components/Navigation/Navigation";
import { logout } from "../../actions/auth";
import { connect } from 'react-redux'
import axios from "axios";
import { BASE_URL } from "../../constans";
import { useState } from "react";

const Header = ({logout, isSuperUser}) => {
  const { pathname } = useLocation();
  const [userId, setUserId] = useState(0)

  if (
    pathname !== "/" &&
    !pathname.includes("/users") &&
    pathname !== "/dashboard" &&
    pathname !== "/study" &&
    pathname !== "/generation"
  ) {
    return <></>;
  }

  const logoutHendler = () => {
    window.location = "/signin"
    logout()
  }

  const getUserUniqueId = () => {
    const config = {
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    }

    console.log(config)
    return axios.get(BASE_URL + "api/" + 'user/unique_id', config)
  }

  const givePermissions = () => {
    if (!userId) {
      getUserUniqueId()
      .then((response) => {
        setUserId(response.data["unique_id"])
      })
    }
  }

  return (
    <header className="header">
      {/* <img src="" className="header__logo" /> */}
      <div className="header__logo_block">Лого</div>

      <Navigation isSuperUser={isSuperUser} />

      <div className="header__account">
        <button onClick={givePermissions} type="button" className="header__link">
          {!userId ? "Предоставить доступ" : BASE_URL + "api/" + 'user/' + userId}
        </button>
        <button onClick={logoutHendler} type="button" className="header__button">
          Выйти
        </button>
      </div>
    </header>
  );
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  isSuperUser: state.auth.isSuperUser
})

export default connect(mapStateToProps, {logout})(Header)
