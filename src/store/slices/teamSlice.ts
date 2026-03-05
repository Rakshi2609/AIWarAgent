import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ScoreBreakdown, Submission } from '../../types';

export const fetchTeamData = createAsyncThunk('team/fetch', async () => {
    const res = await fetch('/api/team');
    if (!res.ok) throw new Error('Failed to fetch team data');
    return res.json() as Promise<{ scores: ScoreBreakdown; submissions: Record<string, string> }>;
});

interface TeamState {
    scores: ScoreBreakdown | null;
    submissions: Record<string, string>;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
}

const initialState: TeamState = {
    scores: null,
    submissions: {},
    status: 'idle',
    error: null,
};

const teamSlice = createSlice({
    name: 'team',
    initialState,
    reducers: {
        updateSubmission(state, action: { payload: Submission }) {
            state.submissions[action.payload.round] = action.payload.link;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeamData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTeamData.fulfilled, (state, action) => {
                state.status = 'success';
                state.scores = action.payload.scores;
                state.submissions = action.payload.submissions;
            })
            .addCase(fetchTeamData.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.error.message ?? 'Unknown error';
            });
    },
});

export const { updateSubmission } = teamSlice.actions;
export default teamSlice.reducer;
