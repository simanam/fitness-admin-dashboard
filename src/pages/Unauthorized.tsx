// src/pages/Unauthorized.tsx
import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-6xl font-bold text-black mb-4">403</h1>
      <p className="text-xl text-gray-600 mb-8">
        You don't have permission to access this page
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default UnauthorizedPage;
