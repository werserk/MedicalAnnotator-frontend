import {
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    SIGNUP_SUCCESS,
    SIGNUP_FAILED,
    LOGOUT,
    REFRESH_TOKEN,
    REFRESH_TOKEN_FAILED,
    LOADING
} from "../actions/types"

const initialState = {
    token: localStorage.getItem("token"),
    refresh: localStorage.getItem("refresh"),
    isAuthenticated: false,
    loading: false,
    isSuperUser: false,
    user: {}
}

export default function(state=initialState, action) {
    const {type, payload} = action

    switch(type) {
        case LOGIN_SUCCESS:
            localStorage.setItem('token', payload.access)
            localStorage.setItem('refresh', payload.refresh)
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                token: payload.access,
                refresh: payload.refresh,
                isSuperUser: payload.isSuperUser,
            }
        case SIGNUP_SUCCESS:
            return {
                ...state,
                isAuthenticated: false,
                loading: true,
            }
        case SIGNUP_FAILED:
        case LOGIN_FAILED:
        case LOGOUT:
            localStorage.removeItem("token")
            localStorage.removeItem("refresh")
            return {
                ...state,
                isAuthenticated: false,
                loading: false,
                token: null,
                refresh: null,
                isSuperUser: false,
                user: {},
            }
        case REFRESH_TOKEN:
            localStorage.setItem("token", payload.access)
            localStorage.setItem("refresh", payload.refresh)
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                token: payload.access,
                isSuperUser: payload.isSuperUser
            }
        case REFRESH_TOKEN_FAILED:
            localStorage.removeItem("token")
            localStorage.removeItem("refresh")
            return {
                ...state,
                isAuthenticated: false,
                loading: false,
                token: null,
                refresh: null,
                isSuperUser: false
            }
        case LOADING:
            return {
                ...state,
                loading: true
            }
        default:
            return state
    }
}