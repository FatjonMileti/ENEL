import mainReducer from './reducers/index.js';
import { createLogger } from 'redux-logger';
// import { createBrowserHistory } from 'history'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'

// export const history = createBrowserHistory()
const DEBUG = process.env.LOG_LEVEL === 'debug';
const logger = createLogger({ collapsed: (getState, action, logEntry) => !logEntry.error });
let middleware = [
  // thunk,
  // createRouterMiddleware (history),
  DEBUG && logger
].filter(Boolean);

const store = configureStore({
  reducer: mainReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
export default store;
