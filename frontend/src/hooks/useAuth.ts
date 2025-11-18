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
        navigate('/dashboard');
      } catch (err: any) {
        dispatch(loginFailure(err.message || 'Login failed'));
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
        navigate('/dashboard');
      } catch (err: any) {
        dispatch(loginFailure(err.message || 'Registration failed'));
        throw err;
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
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
