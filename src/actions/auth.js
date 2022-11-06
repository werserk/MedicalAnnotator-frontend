import axios from "axios";
import { LOGIN_SUCCESS, SIGNUP_FAILED, SIGNUP_SUCCESS, LOGIN_FAILED, LOGOUT, REFRESH_TOKEN, REFRESH_TOKEN_FAILED, LOADING } from "./types"
import { BASE_URL } from '../constans'
import jwt_decode from "jwt-decode";

export const login = (username, password) => async dispatch => {
    const config = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    const body = JSON.stringify({username, password})

    try {
        dispatch({
            type: LOADING,
        })
        const res = await axios.post(BASE_URL + "api/token/", body, config)
        const decoded = jwt_decode(res.data.access)
        res.data.isSuperUser = decoded.is_superuser
        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        })
    } catch (e) {
        dispatch({
            type: LOGIN_FAILED
        })
    }
}

export const signup = ({username, fullName, password, password2}) => async dispatch => {
    const config = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    const body = JSON.stringify({username, fullName, password, password2})
    console.log(body)

    try {
        const res = await axios.post("http://127.0.0.1:8000/api/user/signup/", body, config)

        dispatch({
            type: SIGNUP_SUCCESS,
            payload: res.data
        })

        dispatch(login(username, password))
    } catch {
        dispatch({
            type: SIGNUP_FAILED
        })
    }
}

export const logout = () => dispatch => {
    dispatch({type: LOGOUT})
}

export const refreshToken = (refresh) => async dispatch => {
    const config = {
        headers: {
            "Content-Type": "application/json",
        }
    }

    const body = JSON.stringify({refresh})

    try {
        dispatch({
            type: LOADING,
        })
        const res = await axios.post(BASE_URL + "api/token/refresh/", body, config)
        const decoded = jwt_decode(res.data.access)
        res.data.isSuperUser = decoded.is_superuser
        dispatch({
            type: REFRESH_TOKEN,
            payload: res.data
        })
    }
    catch (e) {
        dispatch({
            type: REFRESH_TOKEN_FAILED,
        })
    }
}