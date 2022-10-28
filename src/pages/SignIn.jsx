import { Navigate } from "react-router-dom";
import { useState } from "react";

const SignIn = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const {username, password} = formData

    const onChange = e => setFormData({...formData, [e.target.name]: e.target.value})

    const onSubmit = e => {
        e.preventDefault()

        setIsAuthenticated(true)
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

export default SignIn;