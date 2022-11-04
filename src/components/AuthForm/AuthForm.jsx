import { NavLink } from "react-router-dom";
import "./AuthForm.css";

function AuthForm({
  title,
  buttonText,
  link,
  linkText,
  textWithLink,
  onSubmit,
  children,
}) {
  return (
    <form onSubmit={onSubmit} className="auth__form">
      <h1 className="auth__title">{title}</h1>

      {children}

      <button type="submit" className="auth__button">
        {buttonText}
      </button>

      <p className="auth__text">
        {textWithLink}
        <NavLink to={link} className="auth__link">
          {linkText}
        </NavLink>
      </p>
    </form>
  );
}

export default AuthForm;
