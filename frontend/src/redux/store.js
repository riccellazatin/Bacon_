import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';

// Reducers
import authReducer from './reducers/authReducer';
import tasksReducer from './reducers/tasksReducer';
import { scheduleReducer } from './reducers/scheduleReducer';
import pointsReducer from './reducers/pointsReducer';

const reducer = combineReducers({
  auth: authReducer,
  tasks: tasksReducer,
  schedule: scheduleReducer,
  points: pointsReducer,
});

const initialState = {};
const middleware = [thunk];

// This one line replaces all the window.__REDUX_DEVTOOLS logic
const store = createStore(
  reducer, 
  initialState, 
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;