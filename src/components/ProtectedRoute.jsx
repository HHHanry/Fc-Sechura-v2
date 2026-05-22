import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PROTECTED ROUTE V2 - FC SECHURA
 * @param {children} - El componente que queremos proteger
 * @param {allowedRoles} - Array de roles permitidos (ej: ['admin', 'entrenador'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // 1. Mientras el Context está verificando el rol en Firestore, mostramos el spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Cargando permisos...</span>
        </div>
      </div>
    );
  }

  // 2. Si no hay usuario logueado en absoluto, fuera al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si el usuario existe pero su rol no está en la lista de permitidos para esta página
  // Ejemplo: Un entrenador intentando entrar a /caja
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return (
      <div className="container py-5 text-center shadow-sm rounded-4 bg-white mt-5 border border-danger border-opacity-25" style={{maxWidth: '500px'}}>
        <i className="fas fa-user-shield fa-4x text-danger mb-4 opacity-75"></i>
        <h2 className="fw-black text-dark">Acceso Denegado</h2>
        <p className="text-muted fs-5">Tu perfil de <strong>{user.rol}</strong> no tiene permisos para esta sección administrativa.</p>
        <button className="btn btn-turquesa text-white fw-bold px-5 rounded-pill mt-3 shadow" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left me-2"></i> Volver atrás
        </button>
      </div>
    );
  }

  // 4. Si todo está en orden, mostramos la página solicitada
  return children;
};

export default ProtectedRoute;