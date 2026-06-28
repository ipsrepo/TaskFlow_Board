import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loading from '../UI/Loading';

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading fullScreen text="Loading..." />;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
