import { Navigate } from "react-router-dom";
import { useState } from "react";
import AuthForm from "../../components/AuthForm/AuthForm";
import { connect } from 'react-redux'
import { login } from "../../actions/auth";

const SignIn = ({login, isAuthenticated, isSuperUser}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();

    login(username, password)
  };

  return (
    <div className="auth">
      {isAuthenticated ? (
        <>
        {isSuperUser ? 
          <Navigate to="/users" replace={true} />
        :
          <Navigate to="/study" replace={true} />
        }
        </>
      ) : (
        <AuthForm
          title="Авторизация"
          buttonText="Войти"
          link="/signup"
          linkText="Зарегистрироваться"
          textWithLink="Еще не зарегистрированы?"
          onSubmit={onSubmit}
        >
          <div className="auth__item">
            <label className="auth__label">Логин</label>
            <input
              className="auth__input"
              onChange={(e) => onChange(e)}
              type="text"
              name="username"
              value={username}
            />
          </div>
          <div className="auth__item">
            <label className="auth__label">Пароль</label>
            <input
              className="auth__input"
              onChange={(e) => onChange(e)}
              type="password"
              name="password"
              value={password}
            />
          </div>
        </AuthForm>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  isSuperUser: state.auth.isSuperUser
})

export default connect(mapStateToProps, {login})(SignIn)
