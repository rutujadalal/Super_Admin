import React, { useEffect } from "react";
import { Menu, X, Home, Calendar, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoLarge from "../../Assets/Images/logo.png";

export const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();

  const menuItems = [
    { icon: <Home size={18} />, label: "Dashboard", path: "/Dashboard" },
    { icon: <Calendar size={18} />, label: "Admin Management", path: "/User" },
    { icon: <Users size={18} />, label: "Vendor Management", path: "/Vendor" },
  ];

  // Auto-close sidebar on mobile after route change
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, setIsSidebarOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-50
        ${isSidebarOpen ? "w-64" : "w-20"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 border-b px-4">
          {isSidebarOpen && (
            <img src={logoLarge} alt="Logo" className="h-10 w-auto" />
          )}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 space-y-1">
          {menuItems.map(({ icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link to={path} key={label} className="block">
                <div
                  className={`flex items-center px-6 py-3 rounded-lg cursor-pointer
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-200 text-black font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {icon}
                  {isSidebarOpen && <span className="ml-4">{label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};
