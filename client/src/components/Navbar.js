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
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold hover:text-blue-200">IntelliNote</Link>
      <div className="space-x-4">
        {!user && (
          <>
            <Link to="/login" className="hover:text-blue-200">Login</Link>
            <Link to="/register" className="hover:text-blue-200">Register</Link>
          </>
        )}
        {user && (
          <>
            <Link to="/" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/notes" className="hover:text-blue-200">Notes</Link>
            <button onClick={handleLogout} className="hover:text-blue-200">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
