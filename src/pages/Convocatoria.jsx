import React, { useMemo, useState } from 'react';
import { useAlumnos } from '../hooks/useAlumnos';
import { mutarConvocatorias } from '../hooks/useConvocatorias';
import { toast } from '../hooks/useToast';
import { CATEGORIAS, formatDateLima } from '../config/businessRules';
import { Card, CardBody, Button, Badge, EmptyState } from '../components/ui';

const UNIFORMES = ['Titular (Azul)', 'Alterna (Blanco)', 'Chalecos'];

const Convocatoria = () => {
  const { alumnos, loading } = useAlumnos();
  const { iso: hoyIso } = formatDateLima();

  const [detalles, setDetalles] = useState({
    rival: '',
    categoria: '6',
    fecha: hoyIso,
    hora: '09:00',
    lugar: 'Estadio Municipal',
    uniforme: UNIFORMES[0],
  });
  const [seleccionados, setSeleccionados] = useState([]);
  const [capitanId, setCapitanId]         = useState(null);
  const [enviando, setEnviando]           = useState(false);

  const alumnosCategoria = useMemo(
    () => alumnos
      .filter((a) => a.categoria === detalles.categoria)
      .sort((a, b) => (a.apellido ?? '').localeCompare(b.apellido ?? '')),
    [alumnos, detalles.categoria],
  );

  const toggleJugador = (alumno) => {
    const yaEsta = seleccionados.find((j) => j.id === alumno.id);
    if (yaEsta) {
      setSeleccionados((prev) => prev.filter((j) => j.id !== alumno.id));
      if (capitanId === alumno.id) setCapitanId(null);
    } else {
      setSeleccionados((prev) => [...prev, alumno]);
    }
  };

  const cambiarCategoria = (cat) => {
    setDetalles((prev) => ({ ...prev, categoria: cat }));
    setSeleccionados([]);
    setCapitanId(null);
  };

  const publicar = async () => {
    if (!detalles.rival.trim()) return toast.error('Ingresa el equipo rival.');
    if (seleccionados.length === 0) return toast.error('Convoca al menos un jugador.');
    setEnviando(true);
    try {
      await mutarConvocatorias.crear({
        ...detalles,
        capitanId,
        jugadoresConvocados: seleccionados.map((j) => ({ id: j.id, nombre: j.nombre, apellido: j.apellido })),
        estado: 'Pendiente',
      });

      let msg = `🏆 *CONVOCATORIA OFICIAL · FC SECHURA* 🏆\n\n`;
      msg += `⚽ *VS:* ${detalles.rival.toUpperCase()}\n`;
      msg += `👦 *Cat:* ${detalles.categoria}  ·  👕 *Kit:* ${detalles.uniforme}\n`;
      msg += `📅 *Fecha:* ${detalles.fecha.split('-').reverse().join('/')}  ·  ⏰ *Hora:* ${detalles.hora}\n`;
      msg += `🏟️ *Cancha:* ${detalles.lugar}\n\n`;
      msg += `📋 *LISTA DE CONVOCADOS (${seleccionados.length}):*\n`;
      seleccionados.forEach((j, i) => {
        const esCap = j.id === capitanId ? ' *(C)* 🎖️' : '';
        msg += `${i + 1}. ${j.apellido}, ${j.nombre}${esCap}\n`;
      });
      msg += `\n🔥 ¡A dejarlo todo en la cancha! Se exige puntualidad.`;

      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');

      toast.success('Convocatoria guardada y enviada.');
      setSeleccionados([]);
      setCapitanId(null);
      setDetalles((prev) => ({ ...prev, rival: '' }));
    } catch (e) {
      console.error(e);
      toast.error('No se pudo guardar la convocatoria.');
    } finally { setEnviando(false); }
  };

  return (
    <div style={pageBg}>
      <div style={contentWrap}>
        <header style={headerStyle}>
          <div>
            <span style={eyebrowStyle}>DEPORTIVO · LOGÍSTICA</span>
            <h1 style={titleStyle}>Convocatoria</h1>
            <p style={leadStyle}>Planificación del próximo encuentro y selección oficial del equipo.</p>
          </div>
        </header>

        <div style={mainGridStyle} className="sn-conv-grid">
          {/* === DETALLES DEL PARTIDO === */}
          <Card>
            <CardBody>
              <Section title="1. Detalles del partido">
                <Field label="Equipo rival">
                  <input value={detalles.rival} onChange={(e) => setDetalles({ ...detalles, rival: e.target.value })}
                    placeholder="Ej. ACADEMIA CANTOLAO" className="sn-focusable"
                    style={{ ...inputStyle, fontSize: 'var(--sn-fs-md)', textTransform: 'uppercase', fontWeight: 700 }} />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sn-space-3)', marginTop: 'var(--sn-space-3)' }}>
                  <Field label="Categoría">
                    <select value={detalles.categoria} onChange={(e) => cambiarCategoria(e.target.value)} className="sn-focusable" style={inputStyle}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>Cat. {c}</option>)}
                    </select>
                  </Field>
                  <Field label="Indumentaria">
                    <select value={detalles.uniforme} onChange={(e) => setDetalles({ ...detalles, uniforme: e.target.value })} className="sn-focusable" style={inputStyle}>
                      {UNIFORMES.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sn-space-3)', marginTop: 'var(--sn-space-3)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Field label="Fecha">
                      <input type="date" value={detalles.fecha} onChange={(e) => setDetalles({ ...detalles, fecha: e.target.value })} className="sn-focusable" style={inputStyle} />
                    </Field>
                    <Field label="Hora">
                      <input type="time" value={detalles.hora} onChange={(e) => setDetalles({ ...detalles, hora: e.target.value })} className="sn-focusable" style={inputStyle} />
                    </Field>
                  </div>
                  <Field label="Estadio / cancha">
                    <textarea rows={5} value={detalles.lugar} onChange={(e) => setDetalles({ ...detalles, lugar: e.target.value })}
                      className="sn-focusable" style={{ ...inputStyle, resize: 'none', fontFamily: 'var(--sn-font-ui)' }} />
                  </Field>
                </div>
              </Section>

              {/* Preview */}
              <div style={previewStyle}>
                <Badge tone="brand">PREVIEW</Badge>
                <h4 style={{ margin: 'var(--sn-space-2) 0 4px', fontFamily: 'var(--sn-font-display)', color: 'var(--sn-text-primary)', fontWeight: 800 }}>
                  FC Sechura <span style={{ color: 'var(--sn-text-muted)', fontWeight: 600, margin: '0 8px' }}>vs</span> {detalles.rival || 'RIVAL'}
                </h4>
                <div style={{ fontSize: 'var(--sn-fs-sm)', color: 'var(--sn-text-muted)', fontWeight: 600 }}>
                  📍 {detalles.lugar} · ⏰ {detalles.hora}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* === PLANTILLA === */}
          <Card>
            <CardBody style={{ padding: 0 }}>
              <div style={{ padding: 'var(--sn-space-4) var(--sn-space-5)', borderBottom: '1px solid var(--sn-border-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sn-space-3)' }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--sn-font-display)', fontSize: 'var(--sn-fs-md)', fontWeight: 700, color: 'var(--sn-text-primary)' }}>2. Plantilla disponible</h3>
                  <span style={subLabelStyle}>{alumnosCategoria.length} jugadores en Cat. {detalles.categoria}</span>
                </div>
                <Badge tone="brand" size="lg">{seleccionados.length} convocados</Badge>
              </div>

              <div className="sn-scroll" style={{ padding: 'var(--sn-space-3)', maxHeight: 460, overflow: 'auto' }}>
                {loading ? (
                  <EmptyState title="Cargando plantilla..." description="Sincronizando con la base de datos." />
                ) : alumnosCategoria.length === 0 ? (
                  <EmptyState title={`Sin alumnos en Cat. ${detalles.categoria}`} description="Cambia de categoría o registra alumnos en esa categoría." />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sn-space-2)' }}>
                    {alumnosCategoria.map((al) => {
                      const sel = seleccionados.some((j) => j.id === al.id);
                      const cap = capitanId === al.id;
                      return (
                        <div key={al.id} style={pillStyle(sel)}>
                          <div onClick={() => toggleJugador(al)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                            {al.foto ? (
                              <img src={al.foto} alt="" style={pillAvatarStyle} />
                            ) : (
                              <div style={{ ...pillAvatarStyle, background: 'var(--sn-brand-gradient)', color: '#06121A', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                                {(al.nombre ?? '?').charAt(0)}{(al.apellido ?? '?').charAt(0)}
                              </div>
                            )}
                          </div>
                          <div onClick={() => toggleJugador(al)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                            <div style={{ fontWeight: 800, color: 'var(--sn-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{al.apellido}</div>
                            <div style={{ fontSize: 'var(--sn-fs-xs)', color: 'var(--sn-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{al.nombre}</div>
                          </div>
                          {sel && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setCapitanId(cap ? null : al.id); }}
                              style={captainBtnStyle(cap)}
                              className="sn-focusable"
                              title={cap ? 'Quitar capitanía' : 'Asignar capitán'}
                            >C</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ padding: 'var(--sn-space-4) var(--sn-space-5)', borderTop: '1px solid var(--sn-border-faint)' }}>
                <Button variant="success" size="lg" loading={enviando}
                  disabled={seleccionados.length === 0 || !detalles.rival.trim()}
                  icon={<WhatsappIcon />}
                  onClick={publicar}
                  style={{ width: '100%' }}
                >
                  Guardar y enviar al grupo
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 991.98px) {
          .sn-conv-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 'var(--sn-space-5)' }}>
    <h4 style={{ margin: '0 0 var(--sn-space-3)', fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-text-muted)' }}>
      {title}
    </h4>
    {children}
  </section>
);

const Field = ({ label, children }) => (
  <label style={{ display: 'block' }}>
    <span style={fieldLabelStyle}>{label}</span>
    {children}
  </label>
);

const WhatsappIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01ZM12.05 20.15h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.41 8.16 8.16 0 0 1 2.41 5.83 8.25 8.25 0 0 1-8.25 8.24Z"/></svg>);

const pageBg = { minHeight: 'calc(100vh - 73px)', background: 'var(--sn-bg-base)', color: 'var(--sn-text-primary)', fontFamily: 'var(--sn-font-ui)' };
const contentWrap = { maxWidth: 1280, margin: '0 auto', padding: 'var(--sn-space-6) var(--sn-space-5) var(--sn-space-8)' };
const headerStyle = { marginBottom: 'var(--sn-space-5)' };
const eyebrowStyle = { fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-brand-glow)' };
const titleStyle = { margin: '0.3rem 0 0', fontFamily: 'var(--sn-font-display)', fontSize: 'var(--sn-fs-2xl)', fontWeight: 700, color: 'var(--sn-text-primary)', letterSpacing: 'var(--sn-tracking-tight)' };
const leadStyle = { margin: '0.3rem 0 0', color: 'var(--sn-text-muted)', fontSize: 'var(--sn-fs-sm)' };

const mainGridStyle = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: 'var(--sn-space-5)', alignItems: 'start' };

const subLabelStyle = { fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-text-muted)', textTransform: 'uppercase' };

const fieldLabelStyle = {
  display: 'block', marginBottom: 6,
  fontSize: 'var(--sn-fs-xs)', fontWeight: 700,
  letterSpacing: 'var(--sn-tracking-wide)',
  color: 'var(--sn-text-secondary)',
  textTransform: 'uppercase',
};

const inputStyle = {
  width: '100%', background: 'var(--sn-input-bg)',
  border: '1px solid var(--sn-border-soft)',
  borderRadius: 'var(--sn-radius-md)',
  color: 'var(--sn-text-primary)',
  fontFamily: 'var(--sn-font-ui)', fontSize: 'var(--sn-fs-sm)',
  padding: '0.6rem 0.85rem', outline: 'none',
};

const previewStyle = {
  marginTop: 'var(--sn-space-4)',
  padding: 'var(--sn-space-4)',
  background: 'linear-gradient(135deg, color-mix(in srgb, var(--sn-brand-glow) 10%, transparent) 0%, rgba(30,58,138,0.10) 100%)',
  border: '1px solid var(--sn-border-glow)',
  borderRadius: 'var(--sn-radius-md)',
};

const pillStyle = (sel) => ({
  display: 'flex', alignItems: 'center', gap: 'var(--sn-space-3)',
  padding: '0.65rem 0.75rem',
  background: sel ? 'color-mix(in srgb, var(--sn-brand-glow) 12%, transparent)' : 'var(--sn-row-soft)',
  border: `1px solid ${sel ? 'var(--sn-border-glow)' : 'var(--sn-border-faint)'}`,
  borderRadius: 'var(--sn-radius-md)',
  transition: 'all var(--sn-dur-fast) var(--sn-ease)',
  boxShadow: sel ? '0 0 12px color-mix(in srgb, var(--sn-brand-glow) 22%, transparent)' : 'none',
});

const pillAvatarStyle = {
  width: 42, height: 42, borderRadius: '50%',
  objectFit: 'cover', flexShrink: 0,
  border: '1px solid var(--sn-border-faint)',
};

const captainBtnStyle = (cap) => ({
  width: 30, height: 30, borderRadius: '50%',
  background: cap ? 'var(--sn-tier-elite)' : 'var(--sn-track-bg)',
  color: cap ? '#06121A' : 'var(--sn-text-muted)',
  border: cap ? 'none' : '1px solid var(--sn-border-soft)',
  fontWeight: 900, fontSize: 12,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: cap ? '0 4px 14px rgba(251,191,36,0.45)' : 'none',
  transform: cap ? 'scale(1.1)' : 'scale(1)',
  transition: 'all var(--sn-dur-fast) var(--sn-ease)',
  flexShrink: 0,
});

export default Convocatoria;
