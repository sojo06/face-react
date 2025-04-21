// ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[]; // An array of roles allowed to access this route (e.g., ['student'])
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('role');

  React.useEffect(() => {
    if (!token) {
      navigate('/login'); // Redirect to login if no token is found
    } else if (!allowedRoles.includes(userRole!)) {
      navigate('/'); // Redirect to home if user role is not allowed
    }
  }, [token, userRole, allowedRoles, navigate]);

  return <>{children}</>; // Render children if the user is authenticated and has the correct role
};

export default ProtectedRoute;
