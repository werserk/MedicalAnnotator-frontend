import { Navigate } from "react-router-dom";
import { useState } from "react";
import AuthForm from "../../components/AuthForm/AuthForm";

const SignIn = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();

    setIsAuthenticated(true);
  };

  return (
    <div className="auth">
      {isAuthenticated ? (
        <Navigate to="/dashboard" replace={true} />
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

export default SignIn;
