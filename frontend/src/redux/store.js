import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import authReducer from './reducers/authReducer';
import tasksReducer from './reducers/tasksReducer';

const reducer = combineReducers({
  auth: authReducer,
  tasks: tasksReducer,
});

const middleware = [thunk];

// Use Redux DevTools extension if available
const composeEnhancers = 
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(reducer, composeEnhancers(applyMiddleware(...middleware)));

export default store;
export { store };
