import api from '../../api/axios';
import {
  POINTS_FETCH_REQUEST_CONST as POINTS_FETCH_REQUEST,
  POINTS_FETCH_SUCCESS_CONST as POINTS_FETCH_SUCCESS,
  POINTS_FETCH_FAIL_CONST as POINTS_FETCH_FAIL,
  POINTS_UPDATE_CONST as POINTS_UPDATE,
} from '../reducers/pointsReducer';

export const fetchPoints = () => async (dispatch) => {
  try {
    dispatch({ type: POINTS_FETCH_REQUEST });
    const { data } = await api.get('/user/points/');
    dispatch({ type: POINTS_FETCH_SUCCESS, payload: data });
    return data;
  } catch (err) {
    dispatch({ type: POINTS_FETCH_FAIL, payload: err.response?.data || err.message });
  }
};

export const updatePoints = (pointsData) => (dispatch) => {
  dispatch({
    type: POINTS_UPDATE,
    payload: pointsData,
  });
};
