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
        <div className="flex items-center justify-center min-h-[60vh] bg-gray-100 p-4">
            <div className="text-center bg-white p-10 rounded-xl shadow-2xl max-w-md space-y-6">
                <p className="text-6xl mb-4">{emoji}</p>
                <h1 className="text-4xl font-extrabold text-red-600">{title}</h1>
                <p className="text-gray-700">{message}</p>
                <Link 
                    to="/login" 
                    className="inline-block px-6 py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                >
                    Go to Login Page
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;