import React, { useEffect, useRef, useState } from 'react';
import { useTacticas, mutarTacticas } from '../hooks/useTacticas';
import { toast } from '../hooks/useToast';
import { Card, CardBody, Button, Badge, EmptyState } from '../components/ui';

const FORMACIONES = {
  '4-3-3': [
    { id: 1,  x: 50, y: 90, label: 'POR', color: 'var(--sn-tier-elite)' },
    { id: 2,  x: 20, y: 70, label: 'LI',  color: 'var(--sn-crit)' },
    { id: 3,  x: 40, y: 75, label: 'DFC', color: 'var(--sn-crit)' },
    { id: 4,  x: 60, y: 75, label: 'DFC', color: 'var(--sn-crit)' },
    { id: 5,  x: 80, y: 70, label: 'LD',  color: 'var(--sn-crit)' },
    { id: 6,  x: 30, y: 50, label: 'MC',  color: 'var(--sn-brand-glow)' },
    { id: 7,  x: 50, y: 60, label: 'MCD', color: 'var(--sn-brand-glow)' },
    { id: 8,  x: 70, y: 50, label: 'MC',  color: 'var(--sn-brand-glow)' },
    { id: 9,  x: 25, y: 25, label: 'EI',  color: 'var(--sn-success)' },
    { id: 10, x: 50, y: 15, label: 'DC',  color: 'var(--sn-success)' },
    { id: 11, x: 75, y: 25, label: 'ED',  color: 'var(--sn-success)' },
    { id: 12, x: 50, y: 50, label: '⚽',  color: '#ffffff', isBall: true },
  ],
  '4-4-2': [
    { id: 1,  x: 50, y: 90, label: 'POR', color: 'var(--sn-tier-elite)' },
    { id: 2,  x: 20, y: 70, label: 'LI',  color: 'var(--sn-crit)' },
    { id: 3,  x: 40, y: 75, label: 'DFC', color: 'var(--sn-crit)' },
    { id: 4,  x: 60, y: 75, label: 'DFC', color: 'var(--sn-crit)' },
    { id: 5,  x: 80, y: 70, label: 'LD',  color: 'var(--sn-crit)' },
    { id: 6,  x: 20, y: 45, label: 'MI',  color: 'var(--sn-brand-glow)' },
    { id: 7,  x: 40, y: 50, label: 'MC',  color: 'var(--sn-brand-glow)' },
    { id: 8,  x: 60, y: 50, label: 'MC',  color: 'var(--sn-brand-glow)' },
    { id: 9,  x: 80, y: 45, label: 'MD',  color: 'var(--sn-brand-glow)' },
    { id: 10, x: 35, y: 20, label: 'DC',  color: 'var(--sn-success)' },
    { id: 11, x: 65, y: 20, label: 'DC',  color: 'var(--sn-success)' },
    { id: 12, x: 50, y: 50, label: '⚽',  color: '#ffffff', isBall: true },
  ],
};

const PizarraTactiva = () => {
  const { tacticas } = useTacticas();
  const [fichas, setFichas] = useState(FORMACIONES['4-3-3']);
  const [draggingId, setDraggingId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const fullscreenWrapperRef = useRef(null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenWrapperRef.current?.requestFullscreen?.()
        .catch((err) => toast.error(`No se pudo entrar a pantalla completa: ${err.message}`));
    } else {
      document.exitFullscreen();
    }
  };

  // === Drag pointer ===
  const onPointerDown = (e, id) => {
    e.target.setPointerCapture(e.pointerId);
    setDraggingId(id);
  };
  const onPointerMove = (e) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width)  * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top)  / rect.height) * 100));
    setFichas((prev) => prev.map((f) => f.id === draggingId ? { ...f, x, y } : f));
  };
  const onPointerUp = (e) => {
    try { e.target.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    setDraggingId(null);
  };

  const aplicarFormacion = (k) => setFichas(FORMACIONES[k]);
  const agregarRival = () => setFichas((prev) => [...prev, { id: Date.now(), x: 50, y: 50, label: 'RIV', color: 'var(--sn-text-on-light)' }]);
  const limpiar = () => setFichas([]);

  const guardar = async () => {
    if (!titulo.trim()) return toast.error('Pon un título a la táctica.');
    setGuardando(true);
    try {
      await mutarTacticas.guardar({ titulo: titulo.trim(), fichas });
      toast.success('Táctica guardada en el vestuario.');
      setTitulo('');
    } catch {
      toast.error('No se pudo guardar la táctica.');
    } finally { setGuardando(false); }
  };

  return (
    <div style={pageBg}>
      <div style={contentWrap}>
        <header style={headerStyle}>
          <div>
            <span style={eyebrowStyle}>DEPORTIVO · ESTRATEGIA</span>
            <h1 style={titleStyle}>Pizarra táctica</h1>
            <p style={leadStyle}>Arrastra los jugadores, diseña la jugada y guárdala en la nube.</p>
          </div>
          <Button variant="secondary" icon={<ExpandIcon />} onClick={toggleFullscreen}>
            {isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          </Button>
        </header>

        <div style={mainGridStyle} className="sn-pizarra-grid">
          {/* === HERRAMIENTAS === */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sn-space-4)' }}>
            <Card>
              <CardBody>
                <span style={subLabelStyle}>Formaciones</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  <Button variant="secondary" size="sm" onClick={() => aplicarFormacion('4-3-3')}>4-3-3</Button>
                  <Button variant="secondary" size="sm" onClick={() => aplicarFormacion('4-4-2')}>4-4-2</Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'var(--sn-space-3)' }}>
                  <Button variant="ghost" size="sm" onClick={agregarRival} icon={<PlusIcon />}>Añadir rival</Button>
                  <Button variant="danger" size="sm" onClick={limpiar} icon={<TrashIcon />}>Limpiar pizarra</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <span style={subLabelStyle}>Guardar jugada</span>
                <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Tiro libre ofensivo 1"
                  className="sn-focusable" style={{ ...inputStyle, marginTop: 8 }} />
                <Button variant="success" loading={guardando} onClick={guardar} style={{ width: '100%', marginTop: 8 }}>
                  Guardar en nube
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardBody style={{ padding: 0 }}>
                <div style={{ padding: 'var(--sn-space-4) var(--sn-space-5)', borderBottom: '1px solid var(--sn-border-faint)' }}>
                  <span style={subLabelStyle}>Archivo táctico</span>
                </div>
                <div className="sn-scroll" style={{ maxHeight: 240, overflow: 'auto', padding: 'var(--sn-space-3)' }}>
                  {tacticas.length === 0 ? (
                    <EmptyState title="Sin tácticas" description="Cuando guardes una jugada aparecerá aquí." />
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {tacticas.map((t) => (
                        <li key={t.id} style={tacticaRowStyle}>
                          <span style={{ fontWeight: 700, color: 'var(--sn-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }} title={t.titulo}>{t.titulo}</span>
                          <Button size="sm" variant="ghost" onClick={() => { setFichas(t.fichas); setTitulo(t.titulo); toast.info(`Cargada: ${t.titulo}`); }}>Cargar</Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* === CANCHA === */}
          <div ref={fullscreenWrapperRef} style={{
            ...lienzoWrapStyle,
            ...(isFullscreen ? { background: 'var(--sn-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 } : {}),
          }}>
            {isFullscreen && (
              <button onClick={toggleFullscreen} style={fsCloseBtnStyle} title="Salir (ESC)">×</button>
            )}
            {isFullscreen && (
              <div style={fsToolsStyle}>
                <Button size="sm" variant="secondary" onClick={() => aplicarFormacion('4-3-3')}>4-3-3</Button>
                <Button size="sm" variant="secondary" onClick={() => aplicarFormacion('4-4-2')}>4-4-2</Button>
                <Button size="sm" variant="ghost" onClick={agregarRival}>+ Rival</Button>
              </div>
            )}

            <div
              ref={containerRef}
              style={{
                width: '100%',
                maxWidth: isFullscreen ? 'min(100vh, 800px)' : '600px',
                aspectRatio: '2/3',
                background: 'linear-gradient(to bottom, #166534 0%, #14532d 100%)',
                border: '4px solid rgba(255,255,255,0.85)',
                borderRadius: 'var(--sn-radius-md)',
                position: 'relative',
                overflow: 'hidden',
                touchAction: 'none',
                boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6), inset 0 0 80px rgba(0,0,0,0.25)',
              }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              <CanchaLineas />
              {fichas.map((f) => (
                <div
                  key={f.id}
                  onPointerDown={(e) => onPointerDown(e, f.id)}
                  style={{
                    position: 'absolute',
                    left: `${f.x}%`,
                    top:  `${f.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width:  f.isBall ? (isFullscreen ? 38 : 25) : (isFullscreen ? 56 : 40),
                    height: f.isBall ? (isFullscreen ? 38 : 25) : (isFullscreen ? 56 : 40),
                    background: f.color,
                    color: f.isBall ? 'black' : 'white',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: f.isBall ? (isFullscreen ? 22 : 16) : (isFullscreen ? 14 : 11),
                    border: f.isBall ? '2px solid black' : '3px solid rgba(255,255,255,0.95)',
                    boxShadow: draggingId === f.id ? '0 18px 40px rgba(0,0,0,0.5)' : '0 8px 20px rgba(0,0,0,0.35)',
                    cursor: draggingId === f.id ? 'grabbing' : 'grab',
                    zIndex: draggingId === f.id ? 100 : 10,
                    userSelect: 'none',
                    transition: draggingId === f.id ? 'none' : 'transform var(--sn-dur-fast) var(--sn-ease)',
                  }}
                >
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ display: 'none', color: 'var(--sn-text-muted)', textAlign: 'center', marginTop: 'var(--sn-space-3)', fontSize: 'var(--sn-fs-xs)' }} className="sn-pizarra-tip">
          Toca y arrastra las fichas para moverlas.
        </p>
      </div>

      <style>{`
        @media (max-width: 991.98px) {
          .sn-pizarra-grid { grid-template-columns: 1fr !important; }
          .sn-pizarra-tip  { display: block !important; }
        }
      `}</style>
    </div>
  );
};

const CanchaLineas = () => (
  <>
    <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 2, background: 'rgba(255,255,255,0.6)' }} />
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20%', aspectRatio: '1/1', border: '2px solid rgba(255,255,255,0.6)', borderRadius: '50%' }} />
    <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: '15%', border: '2px solid rgba(255,255,255,0.6)', borderTop: 'none' }} />
    <div style={{ position: 'absolute', top: 0, left: '35%', width: '30%', height: '6%', border: '2px solid rgba(255,255,255,0.6)', borderTop: 'none' }} />
    <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '60%', height: '15%', border: '2px solid rgba(255,255,255,0.6)', borderBottom: 'none' }} />
    <div style={{ position: 'absolute', bottom: 0, left: '35%', width: '30%', height: '6%', border: '2px solid rgba(255,255,255,0.6)', borderBottom: 'none' }} />
  </>
);

const ExpandIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/></svg>);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>);
const TrashIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>);

const pageBg = { minHeight: 'calc(100vh - 73px)', background: 'var(--sn-bg-base)', color: 'var(--sn-text-primary)', fontFamily: 'var(--sn-font-ui)' };
const contentWrap = { maxWidth: 1280, margin: '0 auto', padding: 'var(--sn-space-6) var(--sn-space-5) var(--sn-space-8)' };
const headerStyle = { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--sn-space-4)', flexWrap: 'wrap', marginBottom: 'var(--sn-space-5)' };
const eyebrowStyle = { fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-brand-glow)' };
const titleStyle = { margin: '0.3rem 0 0', fontFamily: 'var(--sn-font-display)', fontSize: 'var(--sn-fs-2xl)', fontWeight: 700, color: 'var(--sn-text-primary)', letterSpacing: 'var(--sn-tracking-tight)' };
const leadStyle = { margin: '0.3rem 0 0', color: 'var(--sn-text-muted)', fontSize: 'var(--sn-fs-sm)' };

const mainGridStyle = { display: 'grid', gridTemplateColumns: 'minmax(0, 280px) minmax(0, 1fr)', gap: 'var(--sn-space-5)', alignItems: 'start' };

const subLabelStyle = { fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-text-muted)', textTransform: 'uppercase' };

const inputStyle = {
  width: '100%', background: 'var(--sn-input-bg)',
  border: '1px solid var(--sn-border-soft)',
  borderRadius: 'var(--sn-radius-md)',
  color: 'var(--sn-text-primary)',
  fontFamily: 'var(--sn-font-ui)', fontSize: 'var(--sn-fs-sm)',
  padding: '0.55rem 0.85rem', outline: 'none',
};

const lienzoWrapStyle = {
  position: 'relative',
  background: 'var(--sn-bg-surface)',
  border: '1px solid var(--sn-border-faint)',
  borderRadius: 'var(--sn-radius-lg)',
  padding: 'var(--sn-space-5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  boxShadow: 'var(--sn-shadow-md)',
};

const fsCloseBtnStyle = {
  position: 'absolute', top: 20, right: 20, zIndex: 9999,
  width: 44, height: 44, borderRadius: '50%',
  background: 'var(--sn-crit)', color: 'white',
  border: 'none', cursor: 'pointer',
  fontSize: 22, fontWeight: 900,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: 'var(--sn-shadow-md)',
};

const fsToolsStyle = {
  position: 'absolute', top: 20, left: 20, zIndex: 9999,
  display: 'flex', flexDirection: 'column', gap: 8,
};

const tacticaRowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: 'var(--sn-space-3)',
  padding: '0.5rem 0.7rem',
  background: 'var(--sn-row-soft)',
  border: '1px solid var(--sn-border-faint)',
  borderRadius: 'var(--sn-radius-sm)',
};

export default PizarraTactiva;
