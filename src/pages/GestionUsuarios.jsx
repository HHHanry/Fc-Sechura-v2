import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el formulario de nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: '',
    nombre: '',
    rol: 'entrenador' // Rol por defecto
  });

  // 1. Cargar lista de usuarios del staff
  const fetchUsuarios = async () => {
    setCargando(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(lista);
    } catch (err) {
      setError("Error al cargar la lista de staff.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // 2. Manejar cambios en el formulario
  const handleChange = (e) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value.toLowerCase().trim() });
  };

  // 3. Registrar / Pre-asignar Rol
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoUsuario.email || !nuevoUsuario.nombre) return;

    try {
      // Usamos el email como ID de documento para evitar duplicados por correo
      const userRef = doc(db, 'usuarios', nuevoUsuario.email);
      await setDoc(userRef, {
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol,
        email: nuevoUsuario.email,
        fechaCreacion: serverTimestamp()
      });

      alert("Usuario de staff autorizado correctamente.");
      setNuevoUsuario({ email: '', nombre: '', rol: 'entrenador' });
      fetchUsuarios();
    } catch (err) {
      alert("Error al autorizar usuario.");
    }
  };

  // 4. Eliminar acceso
  const eliminarUsuario = async (id) => {
    if (window.confirm("¿Estás seguro de revocar el acceso a este miembro del staff?")) {
      try {
        await deleteDoc(doc(db, 'usuarios', id));
        fetchUsuarios();
      } catch (err) {
        alert("No se pudo eliminar el acceso.");
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-black text-dark text-uppercase"><i className="fas fa-users-cog me-2 text-primary"></i>Gestión de Staff</h2>
          <p className="text-muted">Autoriza correos electrónicos y asigna niveles de acceso al sistema.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* FORMULARIO DE REGISTRO */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '20px' }}>
            <h5 className="fw-bold mb-4">Autorizar Nuevo Miembro</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Nombre Completo</label>
                <input type="text" name="nombre" className="form-control border-2 shadow-none" value={nuevoUsuario.nombre} onChange={handleChange} required placeholder="Ej: Juan Pérez" />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Correo Electrónico</label>
                <input type="email" name="email" className="form-control border-2 shadow-none" value={nuevoUsuario.email} onChange={handleChange} required placeholder="profesor@fcsechura.com" />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted text-uppercase">Rol de Acceso</label>
                <select name="rol" className="form-select border-2 shadow-none" value={nuevoUsuario.rol} onChange={handleChange}>
                  <option value="entrenador">⚽ Entrenador (Asistencias)</option>
                  <option value="tesorero">💰 Tesorero (Caja y Pagos)</option>
                  <option value="admin">🔑 Administrador (Control Total)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill py-2 shadow">
                <i className="fas fa-user-plus me-2"></i> Autorizar Acceso
              </button>
            </form>
          </div>
        </div>

        {/* LISTADO DE STAFF */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3 text-muted small fw-bold text-uppercase">Miembro del Staff</th>
                    <th className="py-3 text-muted small fw-bold text-uppercase text-center">Rol asignado</th>
                    <th className="pe-4 py-3 text-muted small fw-bold text-uppercase text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan="3" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                  ) : usuarios.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-5 text-muted">No hay personal autorizado.</td></tr>
                  ) : (
                    usuarios.map((u) => (
                      <tr key={u.id}>
                        <td className="ps-4">
                          <div className="fw-bold text-dark">{u.nombre}</div>
                          <div className="small text-muted font-monospace">{u.email}</div>
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill px-3 py-2 ${
                            u.rol === 'admin' ? 'bg-dark text-white' : 
                            u.rol === 'tesorero' ? 'bg-success bg-opacity-10 text-success border border-success' : 
                            'bg-primary bg-opacity-10 text-primary border border-primary'
                          }`}>
                            {u.rol.toUpperCase()}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <button className="btn btn-sm btn-outline-danger border-2 rounded-circle" title="Revocar Acceso" onClick={() => eliminarUsuario(u.id)}>
                            <i className="fas fa-user-slash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;