import { createSlice } from '@reduxjs/toolkit';
import authService from '../services/authService';

const initialState = {
  user: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, clearUser, clearError } = userSlice.actions;

// Async thunks
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const userData = await authService.login(credentials);
    dispatch(setUser(userData.user));
    return userData;
  } catch (error) {
    dispatch(setError(error.message || 'Login failed'));
    throw error;
  }
};

export const register = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const newUser = await authService.register(userData);
    dispatch(setUser(newUser.user));
    return newUser;
  } catch (error) {
    dispatch(setError(error.message || 'Registration failed'));
    throw error;
  }
};

export const logout = () => (dispatch) => {
  authService.logout();
  dispatch(clearUser());
};

export const updateProfile = (userData) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const updatedUser = await authService.updateProfile(userData);
    dispatch(setUser(updatedUser));
    return updatedUser;
  } catch (error) {
    dispatch(setError(error.message || 'Profile update failed'));
    throw error;
  }
};

export default userSlice.reducer;
