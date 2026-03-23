import api from '../../api/axios';
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

// Login action: posts to /token/ and then fetches current user
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    // Custom User model uses email as USERNAME_FIELD, so only send email and password
    const payload = { email, password };
    const res = await api.post('/token/', payload);
    const { access, refresh } = res.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    dispatch({ type: USER_LOGIN_SUCCESS, payload: { token: access } });

    // fetch user info
    dispatch({ type: USER_FETCH_REQUEST });
    const userRes = await api.get('/user/');
    dispatch({ type: USER_FETCH_SUCCESS, payload: userRes.data });
  } catch (err) {
    dispatch({ type: USER_LOGIN_FAIL, payload: err.response?.data || err.message });
  }
};

export const register = (username, email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    // create user
    await api.post('/register/', { username, email, password });
    // immediately login the new user - use only email and password
    const payload = { email, password };
    const res = await api.post('/token/', payload);
    const { access, refresh } = res.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    dispatch({ type: USER_LOGIN_SUCCESS, payload: { token: access } });

    // fetch user info
    dispatch({ type: USER_FETCH_REQUEST });
    const userRes = await api.get('/user/');
    dispatch({ type: USER_FETCH_SUCCESS, payload: userRes.data });
  } catch (err) {
    dispatch({ type: USER_LOGIN_FAIL, payload: err.response?.data || err.message });
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  dispatch({ type: USER_LOGOUT });
};

export const fetchCurrentUser = () => async (dispatch) => {
  try {
    dispatch({ type: USER_FETCH_REQUEST });
    const res = await api.get('/user/');
    dispatch({ type: USER_FETCH_SUCCESS, payload: res.data });
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      dispatch(logout());
      return;
    }
    dispatch({ type: USER_FETCH_FAIL, payload: err.response?.data || err.message });
  }
};

export const updatePreferences = (prefs) => async (dispatch) => {
  try {
    dispatch({ type: USER_PREFERENCES_UPDATE_REQUEST });
    await api.patch('/user/preferences/', prefs);
    // After updating preferences, backend marks is_onboarded = True
    // Refresh user info
    const userRes = await api.get('/user/');
    dispatch({ type: USER_PREFERENCES_UPDATE_SUCCESS, payload: userRes.data });
  } catch (err) {
    dispatch({ type: USER_PREFERENCES_UPDATE_FAIL, payload: err.response?.data || err.message });
  }
};
