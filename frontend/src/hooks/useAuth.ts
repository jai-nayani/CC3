import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  setUser,
} from '../store/authSlice';
import { authService, LoginCredentials, RegisterData } from '../services/authService';
import { showToast } from '../utils/toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        dispatch(loginStart());
        const response = await authService.login(credentials);
        dispatch(loginSuccess(response));
        showToast.success(`Welcome back, ${response.user.name}!`);
        navigate('/dashboard');
      } catch (err: any) {
        const errorMessage = err.message || 'Login failed';
        dispatch(loginFailure(errorMessage));
        showToast.error(errorMessage);
        throw err;
      }
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        dispatch(loginStart());
        const response = await authService.register(data);
        dispatch(loginSuccess(response));
        showToast.success(`Account created successfully! Welcome, ${response.user.name}!`);
        navigate('/dashboard');
      } catch (err: any) {
        const errorMessage = err.message || 'Registration failed';
        dispatch(loginFailure(errorMessage));
        showToast.error(errorMessage);
        throw err;
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      showToast.info('You have been logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      showToast.warning('Logged out (with errors)');
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  }, [dispatch, navigate]);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      dispatch(setUser(user));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };
};
