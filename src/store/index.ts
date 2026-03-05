import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import teamReducer from './slices/teamSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        leaderboard: leaderboardReducer,
        team: teamReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
