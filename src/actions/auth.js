import axios from "axios";
import { LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, REFRESH_TOKEN, REFRESH_TOKEN_FAILED, LOADING } from "./types"
import { BASE_URL } from '../constans'

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