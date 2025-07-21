import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0ySDEweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')] opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16 items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1 group"
          >
            <div className="relative">
              <span className="logo-text text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-blue-100 group-hover:to-white transition-all duration-300">
                Intelli<span className="logo-highlight">Note</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-white to-blue-200 group-hover:w-full transition-all duration-300"></div>
            </div>
            <div className="hidden sm:block bg-blue-500/30 px-2 py-1 rounded-md text-xs font-semibold text-blue-100">
              AI
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            {!user && (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-500/30 rounded-lg transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
                >
                  Register
                </Link>
              </>
            )}
            {user && (
              <>
                <Link
                  to="/"
                  className="px-4 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-500/30 rounded-lg transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  to="/notes"
                  className="px-4 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-500/30 rounded-lg transition-colors duration-200"
                >
                  Notes
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium border border-blue-400 text-blue-100 hover:text-white hover:bg-blue-500/30 rounded-lg transition-colors duration-200 ml-2"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
