// client/src/pages/ErrorPage.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ErrorPage = () => {
    const { code } = useParams();
    
    let title = "An Error Occurred";
    let message = "Something went wrong. Please try navigating back or logging in again.";
    let emoji = "⚠️";

    switch (code) {
        case '404':
            title = "404: Page Not Found";
            message = "The page you are looking for does not exist or has been moved.";
            emoji = "🔍";
            break;
        case '403':
            title = "403: Forbidden Access";
            message = "You do not have permission to view this page. Check your role.";
            emoji = "🚫";
            break;
        default:
            // Generic error handled above
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
            <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md space-y-6 border border-gray-100">
                <p className="text-7xl mb-4 animate-pulse">{emoji}</p>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">{title}</h1>
                <p className="text-gray-700 text-lg">{message}</p>
                <Link 
                    to="/login" 
                    className="inline-block px-8 py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md"
                >
                    Go to Login Page
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;