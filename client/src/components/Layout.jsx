import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="d-flex flex-grow-1">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        <main className="main-content flex-grow-1 p-3 p-md-4 bg-dashboard">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
