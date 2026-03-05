import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    teamName: string;
    leaderName: string;
    email: string;
    image: string;
    status: 'idle' | 'authenticated' | 'unauthenticated';
}

const initialState: AuthState = {
    teamName: '',
    leaderName: '',
    email: '',
    image: '',
    status: 'idle',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<Omit<AuthState, 'status'>>) {
            state.teamName = action.payload.teamName;
            state.leaderName = action.payload.leaderName;
            state.email = action.payload.email;
            state.image = action.payload.image;
            state.status = 'authenticated';
        },
        clearUser(state) {
            state.teamName = '';
            state.leaderName = '';
            state.email = '';
            state.image = '';
            state.status = 'unauthenticated';
        },
    },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
