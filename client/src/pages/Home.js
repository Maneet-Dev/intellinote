import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Edit, Sparkles, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome to IntelliNote
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your note-taking experience with AI-powered intelligence
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered Insights</h3>
            <p className="text-gray-600">Get intelligent suggestions and improvements for your notes automatically.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart Editing</h3>
            <p className="text-gray-600">Create and edit notes with a beautiful, intuitive interface designed for productivity.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Instant Enhancement</h3>
            <p className="text-gray-600">Transform your notes with one click using advanced AI suggestions.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-flex gap-4 p-2 bg-white rounded-2xl shadow-md">
            <Link
              to="/login"
              className="px-8 py-3 text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
