import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar';
import DashboardContent from './Dashboard.jsx';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans">
      {/* Fixed Sider */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-[18vw] flex flex-col">
        <Navbar />

        {/* Main Content Area */}
        <main className="p-[1.5vw] flex-1 overflow-auto">
          {/* This component acts as the main page content */}
          {/* <DashboardContent /> */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;