import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { DashboardOverview } from '../features/dashboard/DashboardOverview';
import { LeadsPage } from '../features/leads/LeadsPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { TeamPage } from '../features/team/TeamPage';
import { LoginForm } from '../features/auth/LoginForm';
import { RegisterForm } from '../features/auth/RegisterForm';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
        </Route>
      </Route>
      
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
