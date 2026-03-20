const POINTS_FETCH_REQUEST = 'POINTS_FETCH_REQUEST';
const POINTS_FETCH_SUCCESS = 'POINTS_FETCH_SUCCESS';
const POINTS_FETCH_FAIL = 'POINTS_FETCH_FAIL';
const POINTS_UPDATE = 'POINTS_UPDATE';

const initialState = {
  total_points: 0,
  points_earned_this_week: 0,
  weekly_limit: 15,
  points_needed_for_limit: 15,
  loading: false,
  error: null,
};

export default function pointsReducer(state = initialState, action) {
  switch (action.type) {
    case POINTS_FETCH_REQUEST:
      return { ...state, loading: true, error: null };
    case POINTS_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        total_points: action.payload.total_points || 0,
        points_earned_this_week: action.payload.points_earned_this_week || 0,
        weekly_limit: action.payload.weekly_limit || 15,
        points_needed_for_limit: action.payload.points_needed_for_limit || 15,
        error: null,
      };
    case POINTS_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };
    case POINTS_UPDATE:
      return {
        ...state,
        total_points: action.payload.total_points,
        points_earned_this_week: action.payload.points_earned_this_week,
        points_needed_for_limit: action.payload.points_needed_for_limit,
      };
    default:
      return state;
  }
}

export const POINTS_FETCH_REQUEST_CONST = POINTS_FETCH_REQUEST;
export const POINTS_FETCH_SUCCESS_CONST = POINTS_FETCH_SUCCESS;
export const POINTS_FETCH_FAIL_CONST = POINTS_FETCH_FAIL;
export const POINTS_UPDATE_CONST = POINTS_UPDATE;
