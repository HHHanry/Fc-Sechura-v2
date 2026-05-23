import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useAlumnos } from '../hooks/useAlumnos';
import { useUltimosPagos, usePagosDelMes } from '../hooks/usePagos';
import { useAsistenciaHoy } from '../hooks/useAsistencia';
import { useDeudores } from '../hooks/useDeudores';
import { ROLES_FINANCIEROS, formatMoney, formatDateLima } from '../config/businessRules';
import { Card, CardBody, KpiCard, Badge, DataTable, EmptyState, Skeleton } from '../components/ui';
import imagenPortada from '../assets/dashboard-cover.jpg';

const puedeVerFinanzas = (rol) => ROLES_FINANCIEROS.includes(rol);

const Dashboard = () => {
  const { user } = useAuth();

  const { iso: hoyIso, dmy: hoyDmy } = useMemo(() => formatDateLima(), []);
  const yyyymm = hoyIso.slice(0, 7);

  const { alumnos, loading: loadingAlumnos } = useAlumnos();
  const { pagos: ultimosPagos, loading: loadingPagos } = useUltimosPagos(8);
  const { pagos: pagosDelMes } = usePagosDelMes(yyyymm);
  const { asistencias, loading: loadingAsist } = useAsistenciaHoy(hoyDmy);
  const { resumen: resumenDeudas, loading: loadingDeudas } = useDeudores();

  const verFinanzas = puedeVerFinanzas(user?.rol);

  // === Métricas derivadas ===
  const totalAlumnos = alumnos.length;
  const presentesHoy = asistencias.filter((a) => a.estado !== 'Faltó').length;
  const porcentajeAsistencia = totalAlumnos > 0 ? Math.round((presentesHoy / totalAlumnos) * 100) : 0;

  const distribucion = useMemo(() => {
    const map = {};
    alumnos.forEach((a) => {
      const cat = a.categoria || 'Sin Cat';
      map[cat] = (map[cat] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => Number(b[1]) - Number(a[1]));
  }, [alumnos]);

  const cumpleanieros = useMemo(() => {
    const mes = hoyIso.slice(5, 7);
    return alumnos.filter((a) => a.fechaNacimiento?.split('-')[1] === mes);
  }, [alumnos, hoyIso]);

  const ingresosMes = useMemo(
    () => pagosDelMes.reduce((sum, p) => sum + (Number(p.total) || 0), 0),
    [pagosDelMes],
  );

  const totalCategorias = distribucion.length || 7;
  const maxAlumnosPorCat = Math.max(...distribucion.map(([, c]) => c), 1);

  return (
    <div style={pageBg}>
      <BackgroundFx />
      <div style={contentWrap}>
        {/* === HERO === */}
        <Hero user={user} hoyDmy={hoyDmy} />

        {/* === KPIs === */}
        <section style={{ marginTop: 'var(--sn-space-7)' }}>
          <SectionHeader eyebrow="Vista rápida" title="Hoy en la academia" />
          <div style={kpiGrid}>
            <KpiCard
              label="Alumnos"
              value={totalAlumnos}
              loading={loadingAlumnos}
              icon={<UsersIcon />}
              hint="Registros activos"
              accent="brand"
            />
            <KpiCard
              label="Asistencia hoy"
              value={porcentajeAsistencia}
              suffix="%"
              loading={loadingAsist || loadingAlumnos}
              icon={<CheckIcon />}
              hint={`${presentesHoy} / ${totalAlumnos} presentes`}
              accent="success"
            />
            <KpiCard
              label="Deudas activas"
              value={resumenDeudas?.facturas ?? 0}
              loading={loadingDeudas}
              icon={<AlertIcon />}
              hint={resumenDeudas ? formatMoney(resumenDeudas.total) : '—'}
              accent="crit"
            />
            <KpiCard
              label="Categorías"
              value={totalCategorias}
              loading={loadingAlumnos}
              icon={<TrophyIcon />}
              hint="Activas en sistema"
              accent="elite"
            />
          </div>
        </section>

        {/* === GRID PRINCIPAL === */}
        <section style={{ marginTop: 'var(--sn-space-7)' }}>
          <SectionHeader eyebrow="Inteligencia operativa" title="Pulso del club" />
          <div style={mainGridStyle} className="sn-dashboard-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sn-space-5)' }}>
              <CategoriaPanel distribucion={distribucion} maxAlumnos={maxAlumnosPorCat} loading={loadingAlumnos} />

              {verFinanzas && (
                <Card>
                  <CardBody style={{ padding: 0 }}>
                    <div style={panelHeaderStyle}>
                      <div>
                        <h3 style={panelTitleStyle}>Últimos ingresos a caja</h3>
                        <p style={panelSubtitleStyle}>Movimientos recientes registrados en el libro mayor.</p>
                      </div>
                      <Badge tone="success" size="lg">Mes: {formatMoney(ingresosMes)}</Badge>
                    </div>

                    <DataTable
                      loading={loadingPagos}
                      rows={ultimosPagos}
                      columns={[
                        { key: 'fecha', header: 'Fecha', muted: true, width: 120, render: (r) => r.fecha ?? '—' },
                        { key: 'alumno', header: 'Alumno', render: (r) => (
                          <span style={{ fontWeight: 700 }}>{r.alumnoNombre}</span>
                        ) },
                        { key: 'monto', header: 'Monto', align: 'right', width: 140, render: (r) => (
                          <span style={{ fontFamily: 'var(--sn-font-mono)', color: 'var(--sn-success)', fontWeight: 800 }}>
                            {formatMoney(r.total)}
                          </span>
                        ) },
                        { key: 'estado', header: 'Estado', align: 'center', width: 130, render: (r) => (
                          <Badge tone={r.estado === 'Completado' ? 'success' : r.estado === 'Anulado' ? 'crit' : 'warn'}>
                            {r.estado}
                          </Badge>
                        ) },
                      ]}
                      empty={<EmptyState title="Sin transacciones" description="Aún no se ha registrado ningún ingreso." />}
                    />

                    <div style={panelFooterStyle}>
                      <Link to="/ver-pagos" style={panelLinkStyle}>
                        Ir al libro mayor
                        <ArrowRightIcon />
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* === SIDEBAR === */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sn-space-5)' }}>
              <CumpleaniosPanel lista={cumpleanieros} loading={loadingAlumnos} />
              {verFinanzas && (
                <DeudoresPanel resumen={resumenDeudas} loading={loadingDeudas} />
              )}
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ===========================================================
   Sub-componentes
   =========================================================== */

const SectionHeader = ({ eyebrow, title }) => (
  <header style={{ marginBottom: 'var(--sn-space-5)' }}>
    <span style={{ fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-brand-glow)' }}>
      {eyebrow}
    </span>
    <h2 style={{ margin: '0.3rem 0 0', fontFamily: 'var(--sn-font-display)', fontSize: 'var(--sn-fs-xl)', fontWeight: 700, color: 'var(--sn-text-primary)' }}>
      {title}
    </h2>
  </header>
);

const Hero = ({ user, hoyDmy }) => (
  <div className="sn-dashboard-hero" style={heroStyle}>
    <div style={heroBgStyle} aria-hidden />
    <div style={heroOverlayStyle} aria-hidden />
    <div className="sn-dashboard-hero-content" style={heroContentStyle}>
      <span style={{ fontSize: 'var(--sn-fs-xs)', fontWeight: 800, letterSpacing: 'var(--sn-tracking-mega)', color: 'var(--sn-brand-glow)' }}>
        CENTRO DE MANDO · {hoyDmy}
      </span>
      <h1 style={heroTitleStyle}>
        {greet()},<br /><span style={{ color: 'var(--sn-brand-glow)' }}>{user?.nombre ?? 'Staff'}</span>.
      </h1>
      <p style={heroLeadStyle}>
        Esta es la radiografía operativa de la academia: alumnos, asistencia, finanzas y rendimiento. Un solo lugar para tomar decisiones rápidas.
      </p>
    </div>
    <div className="sn-dashboard-hero-quote" style={heroQuoteStyle}>
      "Nuestra pasión marca la diferencia."
      <span style={heroQuoteAuthorStyle}>— FC Sechura</span>
    </div>
  </div>
);

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const CategoriaPanel = ({ distribucion, maxAlumnos, loading }) => (
  <Card>
    <CardBody style={{ padding: 0 }}>
      <div style={panelHeaderStyle}>
        <div>
          <h3 style={panelTitleStyle}>Población por categoría</h3>
          <p style={panelSubtitleStyle}>Distribución de alumnos según rango etario.</p>
        </div>
      </div>
      <div style={{ padding: 'var(--sn-space-5)' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sn-space-4)' }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={48} />)}
          </div>
        ) : distribucion.length === 0 ? (
          <EmptyState title="Sin alumnos" description="No hay alumnos asignados a categorías todavía." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sn-space-5) var(--sn-space-6)' }}>
            {distribucion.map(([cat, count]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 'var(--sn-fs-sm)', fontWeight: 700, color: 'var(--sn-text-secondary)' }}>
                    Cat. {cat}
                  </span>
                  <span style={{ fontFamily: 'var(--sn-font-mono)', fontSize: 'var(--sn-fs-sm)', fontWeight: 800, color: 'var(--sn-text-primary)' }}>
                    {count} <span style={{ color: 'var(--sn-text-muted)', fontWeight: 600 }}>alum.</span>
                  </span>
                </div>
                <div style={progressTrackStyle}>
                  <div style={{ ...progressBarStyle, width: `${(count / maxAlumnos) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardBody>
  </Card>
);

const CumpleaniosPanel = ({ lista, loading }) => (
  <Card>
    <CardBody style={{ padding: 0 }}>
      <div style={panelHeaderStyle}>
        <div>
          <h3 style={panelTitleStyle}>Cumpleaños del mes</h3>
          <p style={panelSubtitleStyle}>{loading ? 'Calculando...' : `${lista.length} festejados`}</p>
        </div>
        <CakeIcon />
      </div>
      <div style={{ padding: 'var(--sn-space-3) var(--sn-space-5) var(--sn-space-5)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={36} />)}
          </div>
        ) : lista.length === 0 ? (
          <EmptyState title="Sin festejados" description="Ningún alumno cumple años este mes." />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sn-space-2)' }}>
            {lista.slice(0, 6).map((c) => {
              const [_, mes, dia] = (c.fechaNacimiento ?? '').split('-');
              return (
                <li key={c.id} style={listRowStyle}>
                  <span style={listDateChipStyle}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--sn-text-muted)', lineHeight: 1 }}>{mes ?? '--'}</span>
                    <span style={{ fontSize: 'var(--sn-fs-sm)', fontWeight: 800, lineHeight: 1, color: 'var(--sn-text-primary)' }}>{dia ?? '--'}</span>
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--sn-text-primary)' }}>
                    {c.nombre} {c.apellido}
                  </span>
                </li>
              );
            })}
            {lista.length > 6 && (
              <li style={{ marginTop: 4, fontSize: 'var(--sn-fs-xs)', color: 'var(--sn-text-muted)', textAlign: 'center' }}>
                + {lista.length - 6} más
              </li>
            )}
          </ul>
        )}
      </div>
    </CardBody>
  </Card>
);

const DeudoresPanel = ({ resumen, loading }) => (
  <Card variant="surface">
    <CardBody style={{ padding: 0 }}>
      <div style={panelHeaderStyle}>
        <div>
          <h3 style={panelTitleStyle}>Deudores críticos</h3>
          <p style={panelSubtitleStyle}>{loading ? 'Calculando...' : `${resumen?.facturas ?? 0} facturas vencidas`}</p>
        </div>
        <Badge tone="crit" size="lg">{resumen ? formatMoney(resumen.total) : '—'}</Badge>
      </div>
      <div style={{ padding: 'var(--sn-space-3) var(--sn-space-5) var(--sn-space-5)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={36} />)}
          </div>
        ) : !resumen || resumen.top5.length === 0 ? (
          <EmptyState title="Todo en orden" description="No hay deudas en el sistema." />
        ) : (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sn-space-2)' }}>
            {resumen.top5.map((d, i) => (
              <li key={d.nombre} style={{ ...listRowStyle, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={rankBadgeStyle}>{i + 1}</span>
                  <span style={{ fontWeight: 700, color: 'var(--sn-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.nombre}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--sn-font-mono)', fontWeight: 800, color: 'var(--sn-crit)' }}>
                  {formatMoney(d.monto)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </CardBody>
  </Card>
);

/* === Iconos === */
const UsersIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 19a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 19a5.5 5.5 0 0 1 5.5-5.5"/></svg>);
const CheckIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m8 15 3 3 5-5"/></svg>);
const AlertIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.3 3.7a2 2 0 0 1 3.4 0l8.4 14.6A2 2 0 0 1 20.4 21H3.6a2 2 0 0 1-1.7-2.7L10.3 3.7Z"/></svg>);
const TrophyIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M5 4H3v3a3 3 0 0 0 3 3M19 4h2v3a3 3 0 0 1-3 3"/></svg>);
const CakeIcon   = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--sn-tier-elite)" strokeWidth="2"><path d="M12 6V3M9 6h6"/><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M4 14c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2"/></svg>);
const ArrowRightIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>);

/* === Estilos compartidos === */
const pageBg = {
  minHeight: 'calc(100vh - 73px)',
  background: 'var(--sn-bg-base)',
  color: 'var(--sn-text-primary)',
  fontFamily: 'var(--sn-font-ui)',
  position: 'relative',
};

const BackgroundFx = () => (
  <div aria-hidden style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `
      radial-gradient(800px 500px at 0% 0%, color-mix(in srgb, var(--sn-brand-glow) 10%, transparent), transparent 60%),
      radial-gradient(700px 600px at 100% 30%, rgba(30,58,138,0.20), transparent 55%)
    `,
  }} />
);

const contentWrap = {
  position: 'relative',
  maxWidth: 1280,
  margin: '0 auto',
  padding: 'var(--sn-space-6) var(--sn-space-5) var(--sn-space-8)',
};

const heroStyle = {
  position: 'relative',
  borderRadius: 'var(--sn-radius-xl)',
  overflow: 'hidden',
  border: '1px solid var(--sn-border-soft)',
  boxShadow: 'var(--sn-shadow-lg)',
  minHeight: 320,
  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
};

const heroBgStyle = {
  position: 'absolute', inset: 0,
  backgroundImage: `url(${imagenPortada})`,
  backgroundSize: 'cover', backgroundPosition: 'center',
  filter: 'saturate(0.85)',
};

const heroOverlayStyle = {
  position: 'absolute', inset: 0,
  background: `
    linear-gradient(135deg, rgba(7,9,15,0.92) 0%, rgba(15,20,34,0.65) 60%, color-mix(in srgb, var(--sn-brand-glow) 12%, transparent) 100%)
  `,
};

const heroContentStyle = {
  position: 'relative',
  padding: 'var(--sn-space-7) var(--sn-space-6)',
  maxWidth: 720,
};

const heroTitleStyle = {
  margin: '0.6rem 0 0.6rem',
  fontFamily: 'var(--sn-font-display)',
  fontSize: 'clamp(1.8rem, 3.6vw, 3.2rem)',
  fontWeight: 800,
  letterSpacing: 'var(--sn-tracking-tight)',
  color: 'var(--sn-text-primary)',
  textShadow: '0 6px 30px rgba(0,0,0,0.55)',
  lineHeight: 1.05,
};

const heroLeadStyle = {
  margin: 0,
  color: 'var(--sn-text-secondary)',
  fontSize: 'var(--sn-fs-md)',
  maxWidth: 600,
  lineHeight: 1.5,
};

const heroQuoteStyle = {
  position: 'relative',
  alignSelf: 'flex-end',
  margin: 'var(--sn-space-5)',
  padding: '0.75rem 1.1rem',
  background: 'var(--sn-overlay-strong)',
  border: '1px solid var(--sn-border-glow)',
  borderRadius: 'var(--sn-radius-md)',
  backdropFilter: 'blur(8px)',
  fontStyle: 'italic',
  color: 'var(--sn-text-secondary)',
  fontSize: 'var(--sn-fs-sm)',
  maxWidth: 360,
  display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4,
};

const heroQuoteAuthorStyle = {
  fontStyle: 'normal', fontWeight: 800,
  fontSize: 'var(--sn-fs-xs)',
  letterSpacing: 'var(--sn-tracking-wide)',
  color: 'var(--sn-brand-glow)',
};

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 'var(--sn-space-4)',
};

const mainGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
  gap: 'var(--sn-space-5)',
};

const panelHeaderStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sn-space-4)',
  padding: 'var(--sn-space-5)',
  borderBottom: '1px solid var(--sn-border-faint)',
};

const panelTitleStyle = {
  margin: 0, fontFamily: 'var(--sn-font-display)',
  fontSize: 'var(--sn-fs-md)', fontWeight: 700, color: 'var(--sn-text-primary)',
  letterSpacing: 'var(--sn-tracking-tight)',
};

const panelSubtitleStyle = {
  margin: '0.2rem 0 0',
  fontSize: 'var(--sn-fs-sm)', color: 'var(--sn-text-muted)',
};

const panelFooterStyle = {
  display: 'flex', justifyContent: 'flex-end',
  padding: 'var(--sn-space-4) var(--sn-space-5)',
  borderTop: '1px solid var(--sn-border-faint)',
};

const panelLinkStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '0.5rem 0.9rem',
  borderRadius: 'var(--sn-radius-pill)',
  background: 'color-mix(in srgb, var(--sn-brand-glow) 12%, transparent)',
  border: '1px solid var(--sn-border-glow)',
  color: 'var(--sn-brand-glow)',
  fontSize: 'var(--sn-fs-sm)', fontWeight: 700,
  textDecoration: 'none',
  letterSpacing: 'var(--sn-tracking-wide)',
};

const progressTrackStyle = {
  height: 8,
  borderRadius: 'var(--sn-radius-pill)',
  background: 'var(--sn-track-bg)',
  overflow: 'hidden',
};

const progressBarStyle = {
  height: '100%',
  background: 'var(--sn-brand-gradient)',
  borderRadius: 'var(--sn-radius-pill)',
  boxShadow: '0 0 12px var(--sn-border-glow)',
  transition: 'width var(--sn-dur-slow) var(--sn-ease)',
};

const listRowStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '0.55rem 0.7rem',
  borderRadius: 'var(--sn-radius-md)',
  background: 'var(--sn-row-soft)',
  border: '1px solid var(--sn-border-faint)',
  fontSize: 'var(--sn-fs-sm)',
};

const listDateChipStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  width: 38, height: 38, borderRadius: 'var(--sn-radius-sm)',
  background: 'rgba(251,191,36,0.10)',
  border: '1px solid rgba(251,191,36,0.30)',
  justifyContent: 'center',
};

const rankBadgeStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 24, height: 24, borderRadius: '50%',
  background: 'var(--sn-crit)', color: 'white',
  fontSize: 'var(--sn-fs-xs)', fontWeight: 800,
  flexShrink: 0,
};

/* Responsive: colapsar grid en móvil */
const styleSheet = `
  @media (max-width: 991.98px) {
    .sn-dashboard-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 640px) {
    .sn-dashboard-hero { min-height: 240px !important; }
    .sn-dashboard-hero-content { padding: var(--sn-space-5) var(--sn-space-4) !important; }
    .sn-dashboard-hero-quote {
      max-width: calc(100% - 1rem) !important;
      margin: var(--sn-space-3) !important;
      font-size: var(--sn-fs-xs) !important;
    }
  }
`;

export default function DashboardWrapper() {
  return (
    <>
      <style>{styleSheet}</style>
      <Dashboard />
    </>
  );
}
