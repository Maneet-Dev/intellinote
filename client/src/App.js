import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import PrivateRoute from './components/PrivateRoute';
import HomeLogIn from './pages/HomeLogIn';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Show Home or Dashboard depending on login */}
        <Route path="/" element={<HomeLogIn />} />

        {/* Private route for notes */}
        <Route
          path="/notes"
          element={
            <PrivateRoute>
              <NotesPage />
            </PrivateRoute>
          }
        />

        {/* Optional: you can keep dashboard route or remove it */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
