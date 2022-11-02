import { Navigate } from "react-router-dom";
import { useState } from "react";
import AuthForm from "../components/AuthForm";

const SignUp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  const { name, username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();

    //setIsAuthenticated(true);
    console.log(
      `Регистрируемся с такими данными: ${name} ${username}  ${password}`
    );
  };

  return (
    <div className="auth">
      {isAuthenticated ? (
        <Navigate to="/dashboard" replace={true} />
      ) : (
        <AuthForm
          title="Регистрация"
          buttonText="Зарегистрироваться"
          link="/signin"
          linkText="Войти"
          textWithLink="Уже зарегистрированы?"
          onSubmit={onSubmit}
        >
          <div className="auth__item">
            <label className="auth__label">ФИО</label>
            <input
              className="auth__input"
              onChange={(e) => onChange(e)}
              type="text"
              name="name"
              value={name}
            />
          </div>
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

export default SignUp;
