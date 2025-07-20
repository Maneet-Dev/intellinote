import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import NotesPage from './NotesPage'; // import your notes component

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>
      <p className="text-lg mb-4">
        This is your dashboard. Here you can manage your notes.
      </p>
      <NotesPage />
    </div>
  );
}
