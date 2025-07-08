import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ userType }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="d-flex">
      <Sidebar
        userType={userType}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <div className={`main-content ${sidebarCollapsed ? "expanded" : ""}`}>
        <Navbar userType={userType} onToggleSidebar={toggleSidebar} />

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
