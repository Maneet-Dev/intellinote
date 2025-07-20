import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto mt-20 p-6 text-center">
      <h1 className="text-4xl font-extrabold mb-4">Welcome to IntelliNote</h1>
      <p className="mb-8 text-lg text-gray-700">
        An AI-powered notes app to create, edit, and manage your notes efficiently.
      </p>
      <div className="space-x-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
