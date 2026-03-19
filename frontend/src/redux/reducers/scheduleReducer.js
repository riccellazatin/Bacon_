// redux/reducers/scheduleReducers.js
import {
    SCHEDULE_UPLOAD_REQUEST,
    SCHEDULE_UPLOAD_SUCCESS,
    SCHEDULE_UPLOAD_FAIL,
    SCHEDULE_LIST_REQUEST,
    SCHEDULE_LIST_SUCCESS,
    SCHEDULE_LIST_FAIL,
    SCHEDULE_UPLOAD_RESET
} from '../constants/scheduleConstants';

const initialState = {
    blocks: [],
    loading: false,     // CRITICAL: Must be false by default
    success: false,     // CRITICAL: Must be false by default
    hasSchedule: false,
    error: null
};

export const scheduleReducer = (state = initialState, action) => {
    switch (action.type) {
        // Start loading for both uploading and fetching
        case SCHEDULE_UPLOAD_REQUEST:
        case SCHEDULE_LIST_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };

        // When a list is fetched (e.g., on App load)
        case SCHEDULE_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                blocks: action.payload,
                hasSchedule: action.payload.length > 0,
                error: null
            };

        // When a new image is successfully scanned
        case SCHEDULE_UPLOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                blocks: action.payload,
                hasSchedule: true,
                error: null
            };
        case SCHEDULE_UPLOAD_RESET:
            return {
                ...state,
                success: false,
                error: null
            };
        // Handle errors
        case SCHEDULE_UPLOAD_FAIL:
        case SCHEDULE_LIST_FAIL:
            return {
                ...state,
                loading: false,
                success: false,
                error: action.payload
            };

        // Default state
        default:
            return state;
    }
};