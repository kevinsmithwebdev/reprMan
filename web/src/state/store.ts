import { configureStore } from '@reduxjs/toolkit'

import modalReducer from './modal'
import reprsReducer from './reprs'
import settingsReducer from './settings'
import userReducer from './user'

const reducer = {
  modal: modalReducer,
  reprs: reprsReducer,
  settings: settingsReducer,
  user: userReducer,
}

const store = configureStore({ reducer })

export default store

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
