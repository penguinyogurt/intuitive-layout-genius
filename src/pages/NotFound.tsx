
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="animate-fade-in">
        <h1 className="text-8xl font-bold text-upload-blue mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-8">This page could not be found</p>
        <Link 
          to="/" 
          className="text-upload-blue hover:text-upload-lightblue transition-colors duration-300 border-b-2 border-upload-blue py-1 px-2 font-medium"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
