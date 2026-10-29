import React from 'react';
import { useAuth } from '../context/AuthContext';
import HrDashboard from './HrDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

export default function DashboardDispatcher() {
  const { user } = useAuth();

  if (user?.role === 'hr' || user?.role === 'admin') {
    return <HrDashboard />;
  }

  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }

  return <EmployeeDashboard />;
}
