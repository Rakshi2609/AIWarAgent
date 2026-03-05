import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LeaderboardEntry } from '../../types';

export const fetchLeaderboard = createAsyncThunk('leaderboard/fetch', async () => {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json() as Promise<LeaderboardEntry[]>;
});

interface LeaderboardState {
    entries: LeaderboardEntry[];
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
}

const initialState: LeaderboardState = {
    entries: [],
    status: 'idle',
    error: null,
};

const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaderboard.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => {
                state.status = 'success';
                state.entries = action.payload;
            })
            .addCase(fetchLeaderboard.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.error.message ?? 'Unknown error';
            });
    },
});

export default leaderboardSlice.reducer;
