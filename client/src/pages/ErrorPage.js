// client/src/pages/ErrorPage.js
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const ErrorPage = () => {
  const { code } = useParams(); 
  
  const title = code === '403' ? "Access Denied (403)" : "Page Not Found (404)";
  const message = code === '403' 
    ? "You do not have the required permissions (role) to view this page." 
    : "The page you are looking for does not exist.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center">
      <h1 className="text-6xl font-extrabold text-red-700 mb-4">{code || 'Error'}</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">{title}</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md">{message}</p>
      <Link 
        to="/" 
        className="bg-red-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-red-700 transition"
      >
        Go to Home Dashboard
      </Link>
    </div>
  );
};

export default ErrorPage;