import React, { useEffect, useState } from 'react';
import { usuariosService } from '../services/usuariosService';
import { serverTimestamp } from '../services/firestoreClient';
import { toast } from '../hooks/useToast';
import { Button, Modal } from '../components/ui';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: '',
    nombre: '',
    rol: 'entrenador',
  });

  const fetchUsuarios = async () => {
    setCargando(true);
    setError(null);
    try {
      const lista = await usuariosService.listar();
      setUsuarios(lista);
    } catch {
      setError('Error al cargar la lista de staff.');
      toast.error('No se pudo cargar la lista de staff.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario((prev) => ({
      ...prev,
      [name]: name === 'email' ? value.toLowerCase().trim() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = nuevoUsuario.email.toLowerCase().trim();
    const nombre = nuevoUsuario.nombre.trim();
    if (!email || !nombre) return;

    try {
      // El email como ID permite preautorizar staff antes de conocer su UID de Auth.
      await usuariosService.upsert(email, {
        nombre,
        rol: nuevoUsuario.rol,
        email,
        fechaCreacion: serverTimestamp(),
      });

      toast.success('Usuario de staff autorizado correctamente.');
      setNuevoUsuario({ email: '', nombre: '', rol: 'entrenador' });
      fetchUsuarios();
    } catch {
      toast.error('Error al autorizar usuario.');
    }
  };

  const confirmarEliminacion = async () => {
    if (!usuarioAEliminar) return;
    setEliminando(true);
    try {
      await usuariosService.eliminar(usuarioAEliminar.id);
      toast.success('Acceso revocado.');
      setUsuarioAEliminar(null);
      fetchUsuarios();
    } catch {
      toast.error('No se pudo eliminar el acceso.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-black text-uppercase" style={{ color: 'var(--sn-text-primary)' }}>
            <i className="fas fa-users-cog me-2 text-primary"></i>Gestion de Staff
          </h2>
          <p style={{ color: 'var(--sn-text-muted)' }}>Autoriza correos electronicos y asigna niveles de acceso al sistema.</p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: 88, background: 'var(--sn-bg-surface)', color: 'var(--sn-text-primary)' }}>
            <h5 className="fw-bold mb-4">Autorizar Nuevo Miembro</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Nombre Completo</label>
                <input type="text" name="nombre" className="form-control border-2 shadow-none" value={nuevoUsuario.nombre} onChange={handleChange} required placeholder="Ej: Juan Perez" />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Correo Electronico</label>
                <input type="email" name="email" className="form-control border-2 shadow-none" value={nuevoUsuario.email} onChange={handleChange} required placeholder="profesor@fcsechura.com" />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted text-uppercase">Rol de Acceso</label>
                <select name="rol" className="form-select border-2 shadow-none" value={nuevoUsuario.rol} onChange={handleChange}>
                  <option value="entrenador">Entrenador (Asistencias)</option>
                  <option value="tesorero">Tesorero (Caja y Pagos)</option>
                  <option value="admin">Administrador (Control Total)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill py-2 shadow">
                <i className="fas fa-user-plus me-2"></i> Autorizar Acceso
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ background: 'var(--sn-bg-surface)', color: 'var(--sn-text-primary)' }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
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
                          <div className="fw-bold" style={{ color: 'var(--sn-text-primary)' }}>{u.nombre}</div>
                          <div className="small text-muted font-monospace">{u.email}</div>
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill px-3 py-2 ${
                            u.rol === 'admin' ? 'bg-dark text-white'
                              : u.rol === 'tesorero' ? 'bg-success bg-opacity-10 text-success border border-success'
                                : 'bg-primary bg-opacity-10 text-primary border border-primary'
                          }`}>
                            {(u.rol ?? 'invitado').toUpperCase()}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <button className="btn btn-sm btn-outline-danger border-2 rounded-circle" title="Revocar Acceso" onClick={() => setUsuarioAEliminar(u)}>
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

      <Modal
        open={!!usuarioAEliminar}
        onClose={() => setUsuarioAEliminar(null)}
        size="sm"
        title="Revocar acceso"
        description={usuarioAEliminar ? `Se quitara el acceso de ${usuarioAEliminar.email}.` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setUsuarioAEliminar(null)} disabled={eliminando}>Cancelar</Button>
            <Button variant="danger" onClick={confirmarEliminacion} loading={eliminando}>Revocar</Button>
          </>
        }
      >
        <p style={{ color: 'var(--sn-text-muted)', margin: 0 }}>
          Esta accion conserva los datos historicos del sistema, pero bloquea el rol autorizado de este miembro.
        </p>
      </Modal>
    </div>
  );
};

export default GestionUsuarios;
