import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Reports from '../pages/Reports';
import Analytics from '../pages/Analytics';
import Admin from '../pages/Admin';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';

const Routes: React.FC = () => {
  return (
    <RouterRoutes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </RouterRoutes>
  );
};

export default Routes;
