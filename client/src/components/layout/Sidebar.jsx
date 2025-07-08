import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ userType, collapsed }) => {
  const location = useLocation();
  const { user } = useAuth();

  const adminMenuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: "fas fa-tachometer-alt",
      exact: true,
    },
    {
      path: "/admin/employees",
      label: "Employees",
      icon: "fas fa-users",
    },
    {
      path: "/admin/leaves",
      label: "Leave Management",
      icon: "fas fa-calendar-alt",
    }
  ];

  const employeeMenuItems = [
    {
      path: "/employee",
      label: "Dashboard",
      icon: "fas fa-tachometer-alt",
      exact: true,
    },
    {
      path: "/employee/leaves",
      label: "My Leaves",
      icon: "fas fa-calendar-alt",
    },
    {
      path: "/employee/attendance",
      label: "My Attendance",
      icon: "fas fa-clock",
    },
    {
      path: "/employee/profile",
      label: "Profile",
      icon: "fas fa-user",
    },
  ];

  const menuItems = userType === "admin" ? adminMenuItems : employeeMenuItems;

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Logo/Brand */}
      <div className="p-3 border-bottom">
        <div className="d-flex align-items-center">
          <i className="fas fa-building text-white fs-4"></i>
          {!collapsed && (
            <span className="ms-2 text-white fw-bold">EMS Portal</span>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-3 border-bottom">
          <div className="d-flex align-items-center">
            <div
              className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px" }}
            >
              <i className="fas fa-user text-white"></i>
            </div>
            <div className="ms-2 text-white">
              <div className="small fw-bold">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="small text-muted">
                {userType === "admin" ? "Administrator" : user?.position}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <Nav className="flex-column p-2">
        {menuItems.map((item) => (
          <Nav.Item key={item.path}>
            <Nav.Link
              as={NavLink}
              to={item.path}
              className={`text-decoration-none rounded mb-1 ${
                isActiveRoute(item.path, item.exact) ? "active" : ""
              }`}
              title={collapsed ? item.label : ""}
            >
              <i className={`${item.icon} me-2`}></i>
              {!collapsed && <span>{item.label}</span>}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Quick Stats (for collapsed sidebar) */}
      {collapsed && (
        <div className="position-absolute bottom-0 w-100 p-2">
          <div className="text-center">
            <div
              className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto"
              style={{ width: "30px", height: "30px" }}
            >
              <i className="fas fa-chart-bar text-white small"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
