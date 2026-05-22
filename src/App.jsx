import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Componentes y Contexto
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
import Asistencia from './pages/Asistencia';
import Historial from './pages/Historial';
import RegistrarPagos from './pages/RegistrarPagos';
import VerPagos from './pages/VerPagos';
import DetalleAlumno from './pages/DetalleAlumno';
import GestionUsuarios from './pages/GestionUsuarios';
import PerformanceStats from './pages/PerformanceStats'; 
import PizarraTactiva from './pages/PizarraTactiva';
import ScoutingPartidos from './pages/ScoutingPartidos';
import PortalJugador from './pages/PortalJugador';
import Convocatoria from './pages/Convocatoria';
const AppContent = () => {
  const location = useLocation();
  
  // === CORRECCIÓN V2: Ocultar Navbar en Login y en el Portal Público ===
  const mostrarNavbar = location.pathname !== '/login' && !location.pathname.startsWith('/jugador');

  return (
    <div className="bg-light min-vh-100">
      {mostrarNavbar && <Navbar />}
      
      <Routes>
        {/* === RUTAS PÚBLICAS === */}
        <Route path="/login" element={<Login />} />
        <Route path="/jugador/:id" element={<PortalJugador />} /> {/* <-- RUTA PÚBLICA PERFECTAMENTE UBICADA */}

        {/* === RUTAS COMPARTIDAS (Staff completo) === */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['admin', 'entrenador', 'tesorero']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/alumnos" element={
          <ProtectedRoute allowedRoles={['admin', 'entrenador', 'tesorero']}>
            <Alumnos />
          </ProtectedRoute>
        } />

        <Route path="/perfil-alumno" element={
          <ProtectedRoute allowedRoles={['admin', 'entrenador', 'tesorero']}>
            <DetalleAlumno />
          </ProtectedRoute>
        } />

        {/* === RUTAS DEPORTIVAS (Admin y Entrenadores) === */}
        <Route path="/asistencia" element={
          <ProtectedRoute allowedRoles={['admin', 'entrenador']}>
            <Asistencia />
          </ProtectedRoute>
        } />

        <Route path="/performance" element={
          <ProtectedRoute allowedRoles={['admin', 'entrenador']}>
            <PerformanceStats />
          </ProtectedRoute>
        } />

        <Route path="/pizarra" element={
          <ProtectedRoute allowedRoles={['admin', 'entrenador']}>
            <PizarraTactiva />
          </ProtectedRoute>
        } />

        <Route path="/scouting" element={
          <ProtectedRoute allowedRoles={['admin', 'entrenador']}>
            <ScoutingPartidos />
          </ProtectedRoute>
        } />

        {/* === RUTAS ADMINISTRATIVAS / CONTABLES (Admin y Tesorero) === */}
        <Route path="/historial" element={
          <ProtectedRoute allowedRoles={['admin', 'tesorero']}>
            <Historial />
          </ProtectedRoute>
        } />

        <Route path="/registrar-pago" element={
          <ProtectedRoute allowedRoles={['admin', 'tesorero']}>
            <RegistrarPagos />
          </ProtectedRoute>
        } />

        <Route path="/ver-pagos" element={
          <ProtectedRoute allowedRoles={['admin', 'tesorero']}>
            <VerPagos />
          </ProtectedRoute>
        } />
        
        {/* === RUTA MAESTRA (Solo Tú) === */}
        <Route path="/usuarios" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <GestionUsuarios />
          </ProtectedRoute>
        } />
        <Route path="/convocatoria" element={
  <ProtectedRoute allowedRoles={['admin', 'entrenador']}>
    <Convocatoria />
  </ProtectedRoute>
} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;