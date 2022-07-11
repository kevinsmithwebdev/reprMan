import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {NAMESPACE} from './user.constants';

export const selectUser = createSelector(
  (state: RootState) => state[NAMESPACE],
  data => {console.log('asdf data', data); return data;},
);

export const dummy = 127
