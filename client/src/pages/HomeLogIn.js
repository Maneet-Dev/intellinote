import React from 'react';
import { useAuth } from '../context/AuthContext';
import Home from './Home';
import Dashboard from './Dashboard';

export default function HomeLogIn() {
  const { user } = useAuth();

  return user ? <Dashboard /> : <Home />;
}
