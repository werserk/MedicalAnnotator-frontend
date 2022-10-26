import { Navigate } from "react-router-dom";
import PropTypes from "prop-types"
import { connect } from 'react-redux'
import { login } from "../actions/auth"
import { useState } from "react";

const SignIn = ({login, isAuthenticated}) => {

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const {username, password} = formData

    const onChange = e => setFormData({...formData, [e.target.name]: e.target.value})

    const onSubmit = e => {
        e.preventDefault()

        login(username, password)
    }

    return (
        <div className="signin">
            {isAuthenticated ?
                <Navigate to="/dashboard/" replace={true} />
            :
                <form onSubmit={onSubmit} className="singin_form">
                    <div className="singin_form__item">
                        <label>Логин</label>
                        <input onChange={(e) => onChange(e)} type="text" name="username" />
                    </div>
                    <div className="singin_form__item">
                        <label>Пароль</label>
                        <input onChange={(e) => onChange(e)} type="password" name="password" />
                    </div>
                    <button type="submit" className="singin_form__button">Войти</button>
                </form>
            }
        </div>
    )
}

SignIn.propTypes = {
    login: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
})

export default connect(mapStateToProps, {login})(SignIn)