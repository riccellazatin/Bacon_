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
