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
import {
    TASK_SCAN_REQUEST, TASK_SCAN_SUCCESS, TASK_SCAN_FAIL, TASK_SCAN_RESET
} from '../constants/taskConstants'

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

export default function tasksReducer(state = initialState, action) {
  switch (action.type) {
    case TASK_LIST_REQUEST:
      return { ...state, loading: true };
    case TASK_LIST_SUCCESS:
      return { ...state, loading: false, tasks: action.payload };
    case TASK_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };

    case TASK_CREATE_REQUEST:
      return { ...state, loading: true };
    case TASK_CREATE_SUCCESS:
      return { ...state, loading: false, tasks: [ ...state.tasks, action.payload ] };
    case TASK_CREATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    case TASK_COMPLETE_REQUEST:
      return { ...state, loading: true };
    case TASK_COMPLETE_SUCCESS:
      return {
        ...state,
        loading: false,
        tasks: state.tasks.map(t => t.id === action.payload.task.id ? action.payload.task : t)
      };
    case TASK_COMPLETE_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

export const taskScanReducer = (state = { extractedTasks: [] }, action) => {
    switch (action.type) {
        case TASK_SCAN_REQUEST:
            return { loading: true, extractedTasks: [] }
        case TASK_SCAN_SUCCESS:
            return { loading: false, extractedTasks: action.payload }
        case TASK_SCAN_FAIL:
            return { loading: false, error: action.payload }
        case TASK_SCAN_RESET:
            return { extractedTasks: [] }
        default:
            return state
    }
}