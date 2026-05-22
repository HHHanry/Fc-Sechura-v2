import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import logo from '../assets/logonegro.png';
import { toast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';

/**
 * Navbar Stadium Noir — glass dark, jerarquía por grupos.
 * - Items principales siempre visibles: Resumen, Alumnos.
 * - Grupos contextuales por rol con dropdown:
 *     • Operaciones (Scanner, Asistencias)
 *     • Finanzas    (Pago, Caja)
 *     • Deportivo   (Stats, Pizarra, Convo, Score)
 *     • Sistema     (Staff)
 */

const ROLES = {
  ADMIN: 'admin', ENTRENADOR: 'entrenador', TESORERO: 'tesorero',
};

const buildNavGroups = (rol) => {
  const grupos = [];

  if (rol === ROLES.ADMIN || rol === ROLES.ENTRENADOR) {
    grupos.push({
      label: 'Operaciones',
      items: [
        { to: '/asistencia', label: 'Scanner QR',  hint: 'Registrar asistencia en vivo' },
        { to: '/historial',  label: 'Asistencias', hint: 'Histórico y reportes' },
      ],
    });
  }
  if (rol === ROLES.ADMIN || rol === ROLES.TESORERO) {
    grupos.push({
      label: 'Finanzas',
      items: [
        { to: '/registrar-pago', label: 'Registrar pago', hint: 'Cobrar mensualidad' },
        { to: '/ver-pagos',      label: 'Caja',           hint: 'Libro mayor' },
      ],
    });
  }
  if (rol === ROLES.ADMIN || rol === ROLES.ENTRENADOR) {
    grupos.push({
      label: 'Deportivo',
      items: [
        { to: '/performance',  label: 'Stats',        hint: 'Evaluación FIFA' },
        { to: '/pizarra',      label: 'Pizarra',      hint: 'Tactica táctil' },
        { to: '/convocatoria', label: 'Convocatoria', hint: 'Alineación' },
        { to: '/scouting',     label: 'Scouting',     hint: 'Próximos partidos' },
      ],
    });
  }
  if (rol === ROLES.ADMIN) {
    grupos.push({
      label: 'Sistema',
      items: [
        { to: '/usuarios', label: 'Staff', hint: 'Gestión de usuarios' },
      ],
    });
  }
  return grupos;
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const [openMobile, setOpenMobile] = useState(false);
  const [openGroup, setOpenGroup] = useState(null); // label del grupo abierto
  const navRef = useRef(null);

  useEffect(() => {
    const onClickOut = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMobile(false);
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  // Cierra menús al cambiar de ruta
  useEffect(() => {
    setOpenMobile(false);
    setOpenGroup(null);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.info('Sesión cerrada.');
      navigate('/login');
    } catch (e) {
      toast.error('No se pudo cerrar la sesión.');
    }
  };

  if (!user) return null;

  const grupos = buildNavGroups(user.rol);
  const isActive = (path) => location.pathname === path;
  const groupHasActive = (g) => g.items.some((i) => isActive(i.to));

  return (
    <nav ref={navRef} className="hide-on-print" style={navStyle}>
      <div style={glowStripeStyle} aria-hidden />
      <div style={containerStyle}>
        {/* === BRAND === */}
        <Link to="/" style={brandStyle} aria-label="FC Sechura — inicio">
          <span style={logoBoxStyle}>
            <img src={logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          </span>
          <span style={brandTextStyle}>
            FC <span style={{ color: 'var(--sn-brand-glow)' }}>SECHURA</span>
          </span>
        </Link>

        {/* === DESKTOP NAV === */}
        <ul className="sn-nav-desktop" style={desktopUlStyle}>
          <NavPill to="/"        label="Resumen" isActive={isActive('/')} />
          <NavPill to="/alumnos" label="Alumnos" isActive={isActive('/alumnos')} />

          {grupos.map((g) => {
            const active = groupHasActive(g);
            const open = openGroup === g.label;
            return (
              <li key={g.label} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : g.label)}
                  className="sn-focusable"
                  aria-haspopup="true"
                  aria-expanded={open}
                  style={{ ...pillStyle(active || open), display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {g.label}
                  <Chevron open={open} />
                </button>
                {open && (
                  <div role="menu" style={menuStyle}>
                    {g.items.map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        role="menuitem"
                        className="sn-focusable"
                        style={{ ...menuItemStyle, ...(isActive(it.to) ? menuItemActiveStyle : null) }}
                      >
                        <span style={menuItemLabelStyle}>{it.label}</span>
                        <span style={menuItemHintStyle}>{it.hint}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* === USER + LOGOUT === */}
        <div style={rightSlotStyle} className="sn-nav-user">
          <UserChip user={user} />
          <button
            type="button"
            onClick={toggleTheme}
            className="sn-focusable"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar modo claro/oscuro"
            style={themeBtnStyle}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="sn-focusable"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            style={logoutBtnStyle}
          >
            <LogoutIcon />
          </button>
        </div>

        {/* === HAMBURGER (mobile) === */}
        <button
          type="button"
          onClick={() => setOpenMobile((v) => !v)}
          aria-label="Menú"
          aria-expanded={openMobile}
          className="sn-focusable sn-nav-burger"
          style={burgerStyle}
        >
          {openMobile ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* === MOBILE PANEL === */}
      {openMobile && (
        <div style={mobilePanelStyle} className="sn-scroll">
          <NavMobileLink to="/"        label="Resumen" active={isActive('/')} />
          <NavMobileLink to="/alumnos" label="Alumnos" active={isActive('/alumnos')} />
          {grupos.map((g) => (
            <div key={g.label} style={{ marginTop: 'var(--sn-space-4)' }}>
              <div style={mobileGroupHeaderStyle}>{g.label}</div>
              {g.items.map((it) => (
                <NavMobileLink key={it.to} to={it.to} label={it.label} hint={it.hint} active={isActive(it.to)} />
              ))}
            </div>
          ))}
          <div style={{ marginTop: 'var(--sn-space-5)', borderTop: '1px solid var(--sn-border-faint)', paddingTop: 'var(--sn-space-4)' }}>
            <UserChip user={user} />
            <button
              type="button"
              onClick={handleLogout}
              style={{ ...logoutBtnStyle, width: '100%', borderRadius: 'var(--sn-radius-md)', marginTop: 'var(--sn-space-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <LogoutIcon /> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 991.98px) {
          .sn-nav-desktop { display: none !important; }
          .sn-nav-user { display: none !important; }
          .sn-nav-burger { display: inline-flex !important; }
        }
        @media (min-width: 992px) {
          .sn-nav-burger { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

/* =============================
   Sub-componentes
   ============================= */

const NavPill = ({ to, label, isActive }) => (
  <li>
    <Link to={to} className="sn-focusable" style={pillStyle(isActive)}>
      {label}
    </Link>
  </li>
);

const NavMobileLink = ({ to, label, hint, active }) => (
  <Link
    to={to}
    style={{
      display: 'flex', flexDirection: 'column',
      padding: '0.7rem 0.9rem',
      borderRadius: 'var(--sn-radius-md)',
      color: active ? 'var(--sn-text-primary)' : 'var(--sn-text-secondary)',
      background: active ? 'color-mix(in srgb, var(--sn-brand-glow) 14%, transparent)' : 'transparent',
      border: active ? '1px solid var(--sn-border-glow)' : '1px solid transparent',
      textDecoration: 'none',
      marginTop: 4,
    }}
  >
    <span style={{ fontWeight: 700 }}>{label}</span>
    {hint && <span style={{ fontSize: 'var(--sn-fs-xs)', color: 'var(--sn-text-muted)' }}>{hint}</span>}
  </Link>
);

const UserChip = ({ user }) => (
  <div style={chipStyle}>
    <div style={chipAvatarStyle} aria-hidden>
      {(user.nombre?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <span style={chipNameStyle}>{user.nombre ?? user.email}</span>
      <span style={chipRoleStyle}>{user.rol}</span>
    </div>
  </div>
);

const Chevron = ({ open }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
       style={{ transition: 'transform var(--sn-dur-fast) var(--sn-ease)', transform: open ? 'rotate(180deg)' : 'none' }}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const MenuIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>);
const CloseIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6 18 18M18 6 6 18"/></svg>);
const LogoutIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>);
const SunIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>);
const MoonIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>);

/* =============================
   Estilos
   ============================= */

const navStyle = {
  position: 'sticky', top: 0, zIndex: 'var(--sn-z-navbar)',
  background: 'color-mix(in srgb, var(--sn-bg-base) 78%, transparent)',
  backdropFilter: 'blur(14px) saturate(160%)', WebkitBackdropFilter: 'blur(14px) saturate(160%)',
  borderBottom: '1px solid var(--sn-border-faint)',
  fontFamily: 'var(--sn-font-ui)',
};

const glowStripeStyle = {
  position: 'absolute', inset: '0 0 auto 0', height: 1,
  background: 'linear-gradient(90deg, transparent, var(--sn-border-glow), transparent)',
};

const containerStyle = {
  display: 'flex', alignItems: 'center', gap: 'var(--sn-space-4)',
  maxWidth: 1280, margin: '0 auto',
  padding: '0.75rem var(--sn-space-5)',
};

const brandStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 10,
  textDecoration: 'none', color: 'var(--sn-text-primary)',
  fontFamily: 'var(--sn-font-display)',
  fontWeight: 800, letterSpacing: '0.04em',
  fontSize: 'var(--sn-fs-md)',
};

const logoBoxStyle = {
  width: 36, height: 36, borderRadius: 'var(--sn-radius-md)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--sn-brand-deep)',
  border: '1px solid var(--sn-brand-deep)',
  boxShadow: 'var(--sn-shadow-sm)',
};

const brandTextStyle = { letterSpacing: '0.06em' };

const desktopUlStyle = {
  display: 'flex', alignItems: 'center', gap: 4,
  margin: 0, padding: 0, listStyle: 'none',
  flex: 1, justifyContent: 'center',
};

const pillStyle = (active) => ({
  display: 'inline-block',
  padding: '0.45rem 0.95rem',
  borderRadius: 'var(--sn-radius-pill)',
  textDecoration: 'none',
  fontSize: 'var(--sn-fs-sm)', fontWeight: 600,
  color: active ? 'var(--sn-text-primary)' : 'var(--sn-text-muted)',
  background: active ? 'color-mix(in srgb, var(--sn-brand-glow) 14%, transparent)' : 'transparent',
  border: active ? '1px solid var(--sn-border-glow)' : '1px solid transparent',
  boxShadow: active ? 'inset 0 0 0 1px color-mix(in srgb, var(--sn-brand-glow) 22%, transparent)' : 'none',
  transition: 'all var(--sn-dur-fast) var(--sn-ease)',
  cursor: 'pointer',
});

const menuStyle = {
  position: 'absolute', top: 'calc(100% + 8px)', left: 0,
  minWidth: 240,
  padding: 'var(--sn-space-2)',
  background: 'var(--sn-bg-elevated)',
  border: '1px solid var(--sn-border-soft)',
  borderRadius: 'var(--sn-radius-md)',
  boxShadow: 'var(--sn-shadow-md)',
  display: 'flex', flexDirection: 'column', gap: 2,
  animation: 'sn-slide-down var(--sn-dur-fast) var(--sn-ease-out)',
  zIndex: 'var(--sn-z-overlay)',
};

const menuItemStyle = {
  display: 'flex', flexDirection: 'column',
  padding: '0.55rem 0.75rem',
  borderRadius: 'var(--sn-radius-sm)',
  textDecoration: 'none',
  color: 'var(--sn-text-secondary)',
  border: '1px solid transparent',
  transition: 'background var(--sn-dur-fast) var(--sn-ease)',
};

const menuItemActiveStyle = {
  background: 'color-mix(in srgb, var(--sn-brand-glow) 14%, transparent)',
  border: '1px solid var(--sn-border-glow)',
  color: 'var(--sn-text-primary)',
};

const menuItemLabelStyle = { fontWeight: 700, fontSize: 'var(--sn-fs-sm)' };
const menuItemHintStyle  = { fontSize: 'var(--sn-fs-xs)', color: 'var(--sn-text-muted)' };

const rightSlotStyle = { display: 'flex', alignItems: 'center', gap: 'var(--sn-space-3)' };

const chipStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 10,
  padding: '0.35rem 0.65rem 0.35rem 0.4rem',
  borderRadius: 'var(--sn-radius-pill)',
  background: 'var(--sn-bg-surface)',
  border: '1px solid var(--sn-border-soft)',
  boxShadow: 'var(--sn-shadow-sm)',
};

const chipAvatarStyle = {
  width: 30, height: 30, borderRadius: '50%',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--sn-brand-gradient)',
  color: '#06121A', fontWeight: 900, fontSize: 13,
  boxShadow: '0 0 0 2px color-mix(in srgb, var(--sn-brand-glow) 22%, transparent)',
};

const chipNameStyle = {
  fontSize: 'var(--sn-fs-sm)', fontWeight: 700,
  color: 'var(--sn-text-primary)', lineHeight: 1.1,
  maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};

const chipRoleStyle = {
  fontSize: '0.62rem', fontWeight: 800,
  color: 'var(--sn-brand-deep)',
  textTransform: 'uppercase', letterSpacing: 'var(--sn-tracking-mega)',
  lineHeight: 1.2,
};

const logoutBtnStyle = {
  width: 38, height: 38, borderRadius: 'var(--sn-radius-md)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(220,38,38,0.08)',
  color: 'var(--sn-crit)',
  border: '1px solid rgba(220,38,38,0.30)',
  cursor: 'pointer',
  transition: 'background var(--sn-dur-fast) var(--sn-ease), color var(--sn-dur-fast) var(--sn-ease)',
};

const themeBtnStyle = {
  width: 38, height: 38, borderRadius: 'var(--sn-radius-md)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent',
  color: 'var(--sn-text-secondary)',
  border: '1px solid var(--sn-border-soft)',
  cursor: 'pointer',
  transition: 'background var(--sn-dur-fast) var(--sn-ease), color var(--sn-dur-fast) var(--sn-ease)',
};

const burgerStyle = {
  display: 'none',
  width: 48, height: 48, borderRadius: 'var(--sn-radius-md)',
  alignItems: 'center', justifyContent: 'center',
  background: 'var(--sn-bg-surface)',
  color: 'var(--sn-text-primary)',
  border: '1px solid var(--sn-border-soft)',
  cursor: 'pointer',
  boxShadow: 'var(--sn-shadow-sm)',
};

const mobilePanelStyle = {
  position: 'absolute', top: '100%', left: 'var(--sn-space-4)', right: 'var(--sn-space-4)',
  marginTop: 'var(--sn-space-2)',
  padding: 'var(--sn-space-4)',
  background: 'var(--sn-bg-elevated)',
  border: '1px solid var(--sn-border-soft)',
  borderRadius: 'var(--sn-radius-lg)',
  boxShadow: 'var(--sn-shadow-lg)',
  maxHeight: 'calc(100vh - 80px)', overflow: 'auto',
  zIndex: 'var(--sn-z-overlay)',
  animation: 'sn-slide-down var(--sn-dur-base) var(--sn-ease-out)',
};

const mobileGroupHeaderStyle = {
  fontSize: 'var(--sn-fs-xs)', fontWeight: 800,
  letterSpacing: 'var(--sn-tracking-mega)',
  color: 'var(--sn-brand-glow)',
  margin: '0 0.4rem 0.4rem',
};

export default Navbar;
