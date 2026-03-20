import api from '../../api/axios';
import {
  TASK_LIST_REQUEST,
  TASK_LIST_SUCCESS,
  TASK_LIST_FAIL,
  TASK_CREATE_REQUEST,
  TASK_CREATE_SUCCESS,
  TASK_CREATE_FAIL,
  TASK_COMPLETE_REQUEST,
  TASK_COMPLETE_SUCCESS,
  TASK_COMPLETE_FAIL,
} from '../constants/taskConstants';
import { fetchCurrentUser } from './authActions';
import { updatePoints } from './pointsActions';
import {
    TASK_SCAN_REQUEST, TASK_SCAN_SUCCESS, TASK_SCAN_FAIL,
    TASK_BULK_CREATE_REQUEST, TASK_BULK_CREATE_SUCCESS, TASK_BULK_CREATE_FAIL
} from '../constants/taskConstants'

export const fetchTasks = () => async (dispatch) => {
  try {
    dispatch({ type: TASK_LIST_REQUEST });
    const res = await api.get('/tasks/');
    dispatch({ type: TASK_LIST_SUCCESS, payload: res.data });
  } catch (err) {
    dispatch({ type: TASK_LIST_FAIL, payload: err.response?.data || err.message });
  }
};

export const createTask = (task) => async (dispatch) => {
  try {
    dispatch({ type: TASK_CREATE_REQUEST });
    const res = await api.post('/tasks/', task);
    dispatch({ type: TASK_CREATE_SUCCESS, payload: res.data });
    return res.data;
  } catch (err) {
    dispatch({ type: TASK_CREATE_FAIL, payload: err.response?.data || err.message });
    throw err;
  }
};

export const completeTask = (taskId) => async (dispatch) => {
  try {
    dispatch({ type: TASK_COMPLETE_REQUEST });
    const res = await api.patch(`/tasks/${taskId}/complete/`);
    dispatch({ type: TASK_COMPLETE_SUCCESS, payload: res.data });
    
    // Update Redux points immediately from the response
    if (res.data.total_points !== undefined) {
      dispatch(updatePoints({
        total_points: res.data.total_points,
        points_earned_this_week: res.data.points_earned_this_week,
        points_needed_for_limit: res.data.points_needed_for_limit,
      }));
    }
    
    // Refresh user info to pick up new points
    dispatch(fetchCurrentUser());
    // Return the response data so it can be used in .then()
    return res.data;
  } catch (err) {
    dispatch({ type: TASK_COMPLETE_FAIL, payload: err.response?.data || err.message });
    throw err;
  }
};

export const scanImage = (imageFile) => async (dispatch) => {
    try {
        dispatch({ type: TASK_SCAN_REQUEST })

        const formData = new FormData()
        formData.append('image', imageFile)

        const { data } = await api.post('/tasks/scan-image/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        // data.extracted comes as a string from Gemini; we parse it to JSON
        const parsedTasks = JSON.parse(data.extracted)
        dispatch({ type: TASK_SCAN_SUCCESS, payload: parsedTasks })
    } catch (error) {
        dispatch({ type: TASK_SCAN_FAIL, payload: error.message })
    }
}

export const bulkCreateTasks = (tasks) => async (dispatch) => {
    try {
        dispatch({ type: TASK_BULK_CREATE_REQUEST })

        await api.post('/tasks/bulk-create/', { tasks })

        dispatch({ type: TASK_BULK_CREATE_SUCCESS })
    } catch (error) {
        dispatch({ type: TASK_BULK_CREATE_FAIL, payload: error.message })
    }
}