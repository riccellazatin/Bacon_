// redux/actions/scheduleActions.js
import axios from '../../api/axios';
import { 
  SCHEDULE_UPLOAD_REQUEST, SCHEDULE_UPLOAD_SUCCESS, SCHEDULE_UPLOAD_FAIL,
  SCHEDULE_LIST_SUCCESS, SCHEDULE_LIST_REQUEST, SCHEDULE_LIST_FAIL
} from '../constants/scheduleConstants';


export const uploadSchedule = (imageFile) => async (dispatch) => {
  try {
    dispatch({ type: SCHEDULE_UPLOAD_REQUEST });

    const formData = new FormData();
    formData.append('image', imageFile);

    // Using your axios instance
    const { data } = await axios.post('tasks/upload-schedule/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    dispatch({ type: SCHEDULE_UPLOAD_SUCCESS, payload: data.blocks });
    
    // Also update the list of blocks in the state immediately
    dispatch({ type: SCHEDULE_LIST_SUCCESS, payload: data.blocks });

  } catch (error) {
    dispatch({
      type: SCHEDULE_UPLOAD_FAIL,
      payload: error.response?.data.detail || error.message
    });
  }
};

export const listScheduleBlocks = () => async (dispatch) => {
  try {
    dispatch({ type: SCHEDULE_LIST_REQUEST });

    // Use your axios instance
    const { data } = await axios.get('tasks/schedule-blocks/'); 

    dispatch({
      type: SCHEDULE_LIST_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: SCHEDULE_LIST_FAIL,
      payload: error.response?.data.detail || error.message
    });
  }
};