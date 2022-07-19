import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

import modalReducer from './modal'
import reprsReducer from './reprs'
import settingsReducer from './settings'
import userReducer from './user'

import rootSaga from './sagas/rootSaga'

const reducer = {
  modal: modalReducer,
  reprs: reprsReducer,
  settings: settingsReducer,
  user: userReducer,
}

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false,
      thunk: false
    }).concat(sagaMiddleware)
})

sagaMiddleware.run(rootSaga)

export default store

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
