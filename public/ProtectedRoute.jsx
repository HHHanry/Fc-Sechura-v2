import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Asumiendo un Context de Auth

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner-border text-primary"></div>;

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.rol)) {
    return (
      <div className="container text-center py-5">
        <i className="fas fa-lock fa-4x text-danger mb-4"></i>
        <h2 className="fw-black">Acceso Restringido</h2>
        <p className="text-muted">No tienes permisos para visualizar esta sección financiera.</p>
        <button className="btn btn-primary rounded-pill px-4" onClick={() => window.history.back()}>Regresar</button>
      </div>
    );
  }

  return children;
};