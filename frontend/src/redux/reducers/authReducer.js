import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_FETCH_REQUEST,
  USER_FETCH_SUCCESS,
  USER_FETCH_FAIL,
  USER_PREFERENCES_UPDATE_REQUEST,
  USER_PREFERENCES_UPDATE_SUCCESS,
  USER_PREFERENCES_UPDATE_FAIL,
} from '../constants/authConstants';

const tokenFromStorage = localStorage.getItem('access_token') || null;

const initialState = {
  userInfo: null,
  token: tokenFromStorage,
  isOnboarded: false,
  loading: false,
  error: null,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return { ...state, loading: true, error: null };
    case USER_LOGIN_SUCCESS:
      return { ...state, loading: false, token: action.payload.token, error: null };
    case USER_LOGIN_FAIL:
      return { ...state, loading: false, error: action.payload };
    case USER_LOGOUT:
      return { ...initialState, token: null };

    case USER_FETCH_REQUEST:
      return { ...state, loading: true, error: null };
    case USER_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
        isOnboarded: !!action.payload.is_onboarded,
        error: null,
      };
    case USER_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };

    case USER_PREFERENCES_UPDATE_REQUEST:
      return { ...state, loading: true, error: null };
    case USER_PREFERENCES_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
        isOnboarded: !!action.payload.is_onboarded,
        error: null,
      };
    case USER_PREFERENCES_UPDATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
