import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAlumnos } from '../hooks/useAlumnos';
import { useAuth } from '../context/useAuth';
import { useMisionesDeAlumno, mutarMisiones } from '../hooks/useMisiones';
import { toast } from '../hooks/useToast';
import {
  Card, CardBody, Button, Badge, EmptyState, Modal, Skeleton,
} from '../components/ui';
import {
  MISION_AREAS_LIST, MISION_ESTADOS, MISION_ESTADOS_LIST, MISIONES_SUGERIDAS,
} from '../config/businessRules';

/* ========================================================
   FASE 2 — Plan vivo del jugador
   Página completa de misiones por alumno.
   Ruta: /misiones (?alumno=<id> opcional)
   ======================================================== */

const FILTROS_ESTADO = [
  { value: 'todos', label: 'Todos' },
  ...MISION_ESTADOS_LIST.map((e) => ({ value: e.value, label: e.label })),
];

const FILTROS_AREA = [
  { value: 'todas', label: 'Todas las áreas' },
  ...MISION_AREAS_LIST.map((a) => ({ value: a.value, label: a.label })),
];

const fechaHoyISO = () => new Date().toISOString().slice(0, 10);

const MisionesJugador = () => {
  const { user } = useAuth();
  const { alumnos, loading: loadingAlumnos } = useAlumnos();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const alumnoState = location.state?.alumno;

  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [alumnoId, setAlumnoId]             = useState(searchParams.get('alumno') ?? alumnoState?.id ?? '');
  const [filtroArea, setFiltroArea]         = useState('todas');
  const [filtroEstado, setFiltroEstado]     = useState('todos');
  const [modalOpen, setModalOpen]           = useState(false);
  const [edicion, setEdicion]               = useState(null); // null o objeto misión

  const { misiones, loading: loadingMisiones } = useMisionesDeAlumno(alumnoId || null);

  const alumno = useMemo(
    () => alumnos.find((a) => a.id === alumnoId) ?? null,
    [alumnos, alumnoId],
  );

  // Sincroniza URL cuando cambia el alumno
  useEffect(() => {
    if (alumnoId) setSearchParams({ alumno: alumnoId }, { replace: true });
    else setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumnoId]);

  const alumnosFiltrados = useMemo(() => {
    const term = busquedaAlumno.trim().toLowerCase();
    if (!term) return [];
    return alumnos
      .filter((a) => `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(term))
      .slice(0, 12);
  }, [alumnos, busquedaAlumno]);

  const misionesVisibles = useMemo(() => {
    return misiones
      .filter((m) => filtroArea === 'todas' || m.area === filtroArea)
      .filter((m) => filtroEstado === 'todos' || m.estado === filtroEstado);
  }, [misiones, filtroArea, filtroEstado]);

  const resumen = useMemo(() => {
    const activas = misiones.filter((m) =>
      m.estado === MISION_ESTADOS.NO_LOGRADO || m.estado === MISION_ESTADOS.EN_PROCESO);
    const ultimaLograda = misiones.find((m) =>
      m.estado === MISION_ESTADOS.LOGRADO || m.estado === MISION_ESTADOS.DESTACADO);
    const conteoArea = {};
    misiones.forEach((m) => { if (m.area) conteoArea[m.area] = (conteoArea[m.area] ?? 0) + 1; });
    const areaTop = Object.entries(conteoArea).sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      total:      misiones.length,
      activas:    activas.length,
      logradas:   misiones.filter((m) => m.estado === MISION_ESTADOS.LOGRADO).length,
      destacadas: misiones.filter((m) => m.estado === MISION_ESTADOS.DESTACADO).length,
      ultimaLogradaDesc: ultimaLograda?.descripcion ?? null,
      areaTop,
    };
  }, [misiones]);

  const abrirNueva = () => { setEdicion(null); setModalOpen(true); };
  const abrirEdicion = (m) => { setEdicion(m); setModalOpen(true); };

  const handleSubmit = async (datos) => {
    try {
      if (edicion) {
        await mutarMisiones.actualizar(edicion.id, datos);
        toast.success('Misión actualizada.');
      } else {
        await mutarMisiones.crear({
          ...datos,
          alumnoId,
          alumnoNombre: alumno ? `${alumno.nombre} ${alumno.apellido}` : null,
          categoria:    alumno?.categoria ?? null,
          createdBy:    user?.nombre ?? user?.email ?? null,
        });
        toast.success('Misión asignada al jugador.');
      }
      setModalOpen(false);
      setEdicion(null);
    } catch {
      toast.error('No se pudo guardar la misión.');
    }
  };

  const cambiarEstado = async (m, nuevoEstado) => {
    try {
      await mutarMisiones.actualizar(m.id, { estado: nuevoEstado });
    } catch {
      toast.error('No se pudo actualizar el estado.');
    }
  };

  const eliminar = async (m) => {
    if (!window.confirm(`¿Eliminar la misión "${m.descripcion}"?`)) return;
    try {
      await mutarMisiones.eliminar(m.id);
      toast.success('Misión eliminada.');
    } catch {
      toast.error('No se pudo eliminar la misión.');
    }
  };

  return (
    <div style={pageBg}>
      <div style={contentWrap}>
        <header style={headerStyle}>
          <div>
            <span style={eyebrowStyle}>DESARROLLO INDIVIDUAL · PLAN VIVO</span>
            <h1 style={titleStyle}>Misiones del jugador</h1>
            <p style={leadStyle}>
              Define objetivos concretos por entrenamiento o semana y dale seguimiento real al crecimiento de cada futbolista.
            </p>
          </div>
          {alumno && (
            <Button variant="primary" size="lg" icon={<PlusIcon />} onClick={abrirNueva}>
              Nueva misión
            </Button>
          )}
        </header>

        {/* === SELECTOR DE ALUMNO === */}
        <Card style={{ marginBottom: 'var(--sn-space-5)' }}>
          <CardBody>
            <span style={subLabelStyle}>Jugador</span>
            {alumno ? (
              <div style={alumnoChipStyle}>
                <Avatar alumno={alumno} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: 'var(--sn-font-display)', fontWeight: 800, color: 'var(--sn-text-primary)' }}>
                    {alumno.nombre} {alumno.apellido}
                  </div>
                  <div style={{ fontSize: 'var(--sn-fs-xs)', color: 'var(--sn-text-muted)' }}>
                    Cat. {alumno.categoria ?? '—'} · DNI {alumno.dni ?? '—'}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setAlumnoId(''); setBusquedaAlumno(''); }}>
                  Cambiar
                </Button>
              </div>
            ) : (
              <>
                <div style={{ ...searchWrapStyle, marginTop: 8 }}>
                  <SearchIcon />
                  <input
                    className="sn-focusable"
                    type="text"
                    autoFocus
                    value={busquedaAlumno}
                    onChange={(e) => setBusquedaAlumno(e.target.value)}
                    placeholder={loadingAlumnos ? 'Cargando alumnos…' : 'Buscar por nombre, apellido o DNI…'}
                    style={searchInputStyle}
                  />
                </div>

                {busquedaAlumno && (
                  <div style={resultsListStyle}>
                    {alumnosFiltrados.length === 0 ? (
                      <div style={{ padding: '0.6rem', color: 'var(--sn-text-muted)', fontSize: 'var(--sn-fs-sm)' }}>
                        Sin coincidencias.
                      </div>
                    ) : (
                      alumnosFiltrados.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => { setAlumnoId(a.id); setBusquedaAlumno(''); }}
                          className="sn-focusable"
                          style={resultsItemStyle}
                        >
                          <Avatar alumno={a} small />
                          <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                            <div style={{ fontWeight: 700, color: 'var(--sn-text-primary)' }}>
                              {a.nombre} {a.apellido}
                            </div>
                            <div style={{ fontSize: 'var(--sn-fs-xs)', color: 'var(--sn-text-muted)' }}>
                              Cat. {a.categoria ?? '—'}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* === RESUMEN + FILTROS + LISTA === */}
        {alumnoId && (
          <>
            <div style={resumenGridStyle} className="sn-misiones-resumen">
              <ResumenChip label="Total" value={resumen.total} tone="neutral" />
              <ResumenChip label="Activas" value={resumen.activas} tone="warn" />
              <ResumenChip label="Logradas" value={resumen.logradas} tone="success" />
              <ResumenChip label="Destacadas" value={resumen.destacadas} tone="elite" />
            </div>

            {(resumen.ultimaLogradaDesc || resumen.areaTop) && (
              <Card style={{ marginTop: 'var(--sn-space-4)' }}>
                <CardBody style={{ display: 'flex', gap: 'var(--sn-space-4)', flexWrap: 'wrap' }}>
                  {resumen.ultimaLogradaDesc && (
                    <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                      <span style={subLabelStyle}>Última lograda</span>
                      <div style={{ marginTop: 4, color: 'var(--sn-text-primary)', fontWeight: 700 }}>
                        “{resumen.ultimaLogradaDesc}”
                      </div>
                    </div>
                  )}
                  {resumen.areaTop && (
                    <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                      <span style={subLabelStyle}>Área más trabajada</span>
                      <div style={{ marginTop: 6 }}>
                        <Badge tone="brand">{MISION_AREAS_LIST.find((a) => a.value === resumen.areaTop)?.label}</Badge>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            <Card style={{ marginTop: 'var(--sn-space-4)' }}>
              <CardBody>
                <div style={filtrosBarStyle}>
                  <SelectFilter label="Área"   value={filtroArea}   onChange={setFiltroArea}   options={FILTROS_AREA} />
                  <SelectFilter label="Estado" value={filtroEstado} onChange={setFiltroEstado} options={FILTROS_ESTADO} />
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--sn-fs-xs)', color: 'var(--sn-text-muted)' }}>
                    {loadingMisiones ? 'Cargando…' : `${misionesVisibles.length} misión(es)`}
                  </div>
                </div>
              </CardBody>
            </Card>

            <div style={{ marginTop: 'var(--sn-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sn-space-3)' }}>
              {loadingMisiones ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={108} />)
              ) : misionesVisibles.length === 0 ? (
                <Card>
                  <CardBody>
                    <EmptyState
                      title="Sin misiones para este jugador"
                      description="Crea la primera con el botón “Nueva misión”."
                    />
                  </CardBody>
                </Card>
              ) : (
                misionesVisibles.map((m) => (
                  <MisionRow
                    key={m.id}
                    mision={m}
                    onCambiarEstado={cambiarEstado}
                    onEditar={abrirEdicion}
                    onEliminar={eliminar}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      <MisionFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEdicion(null); }}
        onSubmit={handleSubmit}
        misionInicial={edicion}
        alumno={alumno}
      />

      <style>{`
        @media (max-width: 640px) {
          .sn-misiones-resumen { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

/* ========================================================
   Sub-componentes
   ======================================================== */

const Avatar = ({ alumno, small }) => {
  const size = small ? 32 : 44;
  const inicial = (alumno.nombre?.[0] ?? '?').toUpperCase();
  return alumno.foto ? (
    <img src={alumno.foto} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--sn-brand-gradient)', color: '#06121A',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: small ? 13 : 16, flexShrink: 0,
    }}>{inicial}</div>
  );
};

const ResumenChip = ({ label, value, tone }) => {
  const colors = {
    neutral: 'var(--sn-text-muted)',
    warn:    'var(--sn-warn)',
    success: 'var(--sn-success)',
    elite:   'var(--sn-tier-elite)',
  };
  return (
    <Card>
      <CardBody style={{ padding: 'var(--sn-space-3) var(--sn-space-4)' }}>
        <div style={{ fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: colors[tone], textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--sn-font-display)', fontWeight: 800, fontSize: 'var(--sn-fs-2xl)', color: 'var(--sn-text-primary)', lineHeight: 1 }}>
          {value}
        </div>
      </CardBody>
    </Card>
  );
};

const MisionRow = ({ mision: m, onCambiarEstado, onEditar, onEliminar }) => {
  const area   = MISION_AREAS_LIST.find((a) => a.value === m.area);
  const estado = MISION_ESTADOS_LIST.find((e) => e.value === m.estado);

  const estadoTone = {
    [MISION_ESTADOS.NO_LOGRADO]: 'neutral',
    [MISION_ESTADOS.EN_PROCESO]: 'warn',
    [MISION_ESTADOS.LOGRADO]:    'success',
    [MISION_ESTADOS.DESTACADO]:  'elite',
  }[m.estado] ?? 'neutral';

  return (
    <Card>
      <CardBody>
        <div style={{ display: 'flex', gap: 'var(--sn-space-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {area   && <Badge tone="brand">{area.label}</Badge>}
              {estado && <Badge tone={estadoTone}>{estado.label}</Badge>}
              {m.fecha && <span style={{ fontFamily: 'var(--sn-font-mono)', fontSize: 'var(--sn-fs-xs)', color: 'var(--sn-text-muted)' }}>{m.fecha}</span>}
            </div>
            <div style={{ fontWeight: 700, color: 'var(--sn-text-primary)', fontSize: 'var(--sn-fs-md)' }}>
              {m.descripcion}
            </div>
            {m.comentario && (
              <div style={comentarioStyle}>
                <span style={{ fontWeight: 800, color: 'var(--sn-brand-glow)', letterSpacing: 'var(--sn-tracking-wide)', fontSize: 'var(--sn-fs-xs)' }}>
                  COMENTARIO
                </span>
                <div style={{ marginTop: 2 }}>{m.comentario}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
            <div style={subLabelStyle}>Cambiar estado</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {MISION_ESTADOS_LIST.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => onCambiarEstado(m, e.value)}
                  className="sn-focusable"
                  style={estadoBtnStyle(m.estado === e.value, e.color)}
                  title={e.label}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <Button size="sm" variant="ghost" onClick={() => onEditar(m)} icon={<EditIcon />}>Editar</Button>
              <Button size="sm" variant="danger" onClick={() => onEliminar(m)} icon={<TrashIcon />}>Eliminar</Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const SelectFilter = ({ label, value, onChange, options }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
    <span style={{ fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-wide)', color: 'var(--sn-text-muted)', textTransform: 'uppercase' }}>{label}</span>
    <select className="sn-focusable" value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
);

const MisionFormModal = ({ open, onClose, onSubmit, misionInicial, alumno }) => {
  const [datos, setDatos] = useState({
    descripcion: '',
    area:        MISION_AREAS_LIST[0].value,
    estado:      MISION_ESTADOS.NO_LOGRADO,
    comentario:  '',
    fecha:       fechaHoyISO(),
  });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDatos(misionInicial ? {
      descripcion: misionInicial.descripcion ?? '',
      area:        misionInicial.area ?? MISION_AREAS_LIST[0].value,
      estado:      misionInicial.estado ?? MISION_ESTADOS.NO_LOGRADO,
      comentario:  misionInicial.comentario ?? '',
      fecha:       misionInicial.fecha ?? fechaHoyISO(),
    } : {
      descripcion: '', area: MISION_AREAS_LIST[0].value,
      estado: MISION_ESTADOS.NO_LOGRADO, comentario: '', fecha: fechaHoyISO(),
    });
  }, [open, misionInicial]);

  const handle = async (e) => {
    e?.preventDefault?.();
    if (!datos.descripcion.trim()) return toast.error('Describe la misión.');
    setEnviando(true);
    try { await onSubmit(datos); }
    finally { setEnviando(false); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={misionInicial ? 'Editar misión' : 'Nueva misión'}
      description={alumno ? `Para ${alumno.nombre} ${alumno.apellido}` : ''}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={enviando}>Cancelar</Button>
          <Button variant="primary" onClick={handle} loading={enviando}>
            {misionInicial ? 'Guardar cambios' : 'Asignar misión'}
          </Button>
        </>
      }
    >
      <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sn-space-3)' }}>
        <FormField label="Descripción">
          <textarea
            value={datos.descripcion}
            onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
            rows={3}
            placeholder="Ej: Levantar la cabeza antes del pase"
            className="sn-focusable"
            style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            autoFocus
          />
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {MISIONES_SUGERIDAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDatos({ ...datos, descripcion: s })}
                className="sn-focusable"
                style={chipSugStyle}
              >
                {s}
              </button>
            ))}
          </div>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sn-space-3)' }}>
          <FormField label="Área">
            <select
              value={datos.area}
              onChange={(e) => setDatos({ ...datos, area: e.target.value })}
              className="sn-focusable" style={selectStyle}
            >
              {MISION_AREAS_LIST.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </FormField>
          <FormField label="Estado">
            <select
              value={datos.estado}
              onChange={(e) => setDatos({ ...datos, estado: e.target.value })}
              className="sn-focusable" style={selectStyle}
            >
              {MISION_ESTADOS_LIST.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Fecha">
          <input
            type="date"
            value={datos.fecha}
            onChange={(e) => setDatos({ ...datos, fecha: e.target.value })}
            className="sn-focusable" style={inputStyle}
          />
        </FormField>

        <FormField label="Comentario del entrenador">
          <textarea
            value={datos.comentario}
            onChange={(e) => setDatos({ ...datos, comentario: e.target.value })}
            rows={2}
            placeholder="Ej: Mostró buena actitud en el rondo."
            className="sn-focusable"
            style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
          />
        </FormField>
      </form>
    </Modal>
  );
};

const FormField = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-wide)', color: 'var(--sn-text-muted)', textTransform: 'uppercase' }}>{label}</span>
    {children}
  </label>
);

/* ========================================================
   Iconos
   ======================================================== */
const PlusIcon   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>);
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>);
const EditIcon   = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>);
const TrashIcon  = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>);

/* ========================================================
   Estilos
   ======================================================== */
const pageBg = { minHeight: 'calc(100vh - 73px)', background: 'var(--sn-bg-base)', color: 'var(--sn-text-primary)', fontFamily: 'var(--sn-font-ui)' };
const contentWrap = { maxWidth: 1280, margin: '0 auto', padding: 'var(--sn-space-6) var(--sn-space-5) var(--sn-space-8)' };
const headerStyle = { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--sn-space-4)', flexWrap: 'wrap', marginBottom: 'var(--sn-space-5)' };
const eyebrowStyle = { fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-brand-glow)' };
const titleStyle = { margin: '0.3rem 0 0', fontFamily: 'var(--sn-font-display)', fontSize: 'var(--sn-fs-2xl)', fontWeight: 700, color: 'var(--sn-text-primary)', letterSpacing: 'var(--sn-tracking-tight)' };
const leadStyle = { margin: '0.3rem 0 0', color: 'var(--sn-text-muted)', fontSize: 'var(--sn-fs-sm)' };

const subLabelStyle = { fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-text-muted)', textTransform: 'uppercase' };

const inputStyle = {
  width: '100%', background: 'var(--sn-input-bg)',
  border: '1px solid var(--sn-border-soft)', borderRadius: 'var(--sn-radius-md)',
  color: 'var(--sn-text-primary)', fontFamily: 'var(--sn-font-ui)',
  fontSize: 'var(--sn-fs-sm)', padding: '0.6rem 0.85rem', outline: 'none',
  minHeight: 44,
};
const selectStyle = {
  ...inputStyle, appearance: 'none', minWidth: 0,
  backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2.5\'><path d=\'m6 9 6 6 6-6\'/></svg>")',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center',
  paddingRight: '2rem',
};

const searchWrapStyle = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'var(--sn-input-bg)',
  border: '1px solid var(--sn-border-soft)',
  borderRadius: 'var(--sn-radius-md)',
  padding: '0 0.85rem', color: 'var(--sn-text-muted)',
};
const searchInputStyle = {
  flex: 1, background: 'transparent', border: 'none', outline: 'none',
  color: 'var(--sn-text-primary)', fontFamily: 'var(--sn-font-ui)',
  fontSize: 'var(--sn-fs-sm)', padding: '0.7rem 0', minHeight: 44,
};
const resultsListStyle = {
  marginTop: 8, border: '1px solid var(--sn-border-faint)',
  borderRadius: 'var(--sn-radius-md)', background: 'var(--sn-bg-surface)',
  maxHeight: 280, overflow: 'auto',
};
const resultsItemStyle = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
  padding: '0.6rem 0.8rem', background: 'transparent', border: 'none',
  borderBottom: '1px solid var(--sn-border-faint)', cursor: 'pointer',
  textAlign: 'left',
};

const alumnoChipStyle = {
  marginTop: 8, display: 'flex', alignItems: 'center', gap: 'var(--sn-space-3)',
  padding: 'var(--sn-space-3) var(--sn-space-4)',
  background: 'var(--sn-row-soft)',
  border: '1px solid var(--sn-border-faint)',
  borderRadius: 'var(--sn-radius-md)',
  flexWrap: 'wrap',
};

const resumenGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 'var(--sn-space-3)', marginTop: 'var(--sn-space-2)',
};

const filtrosBarStyle = {
  display: 'flex', alignItems: 'flex-end', gap: 'var(--sn-space-3)', flexWrap: 'wrap',
};

const comentarioStyle = {
  marginTop: 'var(--sn-space-3)',
  padding: '0.6rem 0.8rem',
  background: 'var(--sn-row-soft)',
  border: '1px solid var(--sn-border-faint)',
  borderRadius: 'var(--sn-radius-md)',
  color: 'var(--sn-text-secondary)',
  fontSize: 'var(--sn-fs-sm)',
};

const estadoBtnStyle = (active, color) => ({
  padding: '0.45rem 0.55rem',
  borderRadius: 'var(--sn-radius-sm)',
  border: active ? `1.5px solid ${color}` : '1px solid var(--sn-border-faint)',
  background: active ? `color-mix(in srgb, ${color} 14%, transparent)` : 'transparent',
  color: active ? 'var(--sn-text-primary)' : 'var(--sn-text-secondary)',
  fontWeight: 700, fontSize: '0.78rem',
  cursor: 'pointer',
  textAlign: 'center',
  whiteSpace: 'nowrap',
});

const chipSugStyle = {
  padding: '0.25rem 0.6rem',
  background: 'var(--sn-bg-soft)',
  border: '1px solid var(--sn-border-faint)',
  borderRadius: 'var(--sn-radius-pill)',
  color: 'var(--sn-text-secondary)',
  fontSize: '0.72rem', fontWeight: 600,
  cursor: 'pointer',
};

export default MisionesJugador;
