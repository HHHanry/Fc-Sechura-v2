import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Badge, EmptyState, DataTable } from './ui';
import { PRECIO_MENSUALIDAD, formatMoney, formatDateLima, CATEGORIAS } from '../config/businessRules';

const ModalDeudores = ({ isOpen, onClose, alumnos, deudasExtras }) => {
  const navigate = useNavigate();
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroDistrito, setFiltroDistrito]   = useState('Todos');

  const { iso: hoyIso } = formatDateLima();

  const distritos = useMemo(
    () => ['Todos', ...new Set(alumnos.map((a) => a.distrito).filter((d) => d && d !== 'No aplica'))],
    [alumnos],
  );

  const deudores = useMemo(() => {
    const lista = alumnos.map((a) => {
      const venc = a.vencimientoMensualidad || '2000-01-01';
      const debeMes = hoyIso >= venc;
      const dext = deudasExtras.filter((d) => d.alumnoId === a.id);
      const totalExtras = dext.reduce((s, x) => s + (Number(x.monto) || 0), 0);
      if (!debeMes && totalExtras === 0) return null;

      let diasAtraso = 0;
      if (debeMes) {
        const v = new Date(venc);
        if (!isNaN(v.getTime())) diasAtraso = Math.ceil(Math.abs(new Date() - v) / (1000 * 60 * 60 * 24));
      }
      return { ...a, debeMes, vencimiento: venc, diasAtraso, deudasDelAlumno: dext, totalExtras, montoTotal: (debeMes ? PRECIO_MENSUALIDAD : 0) + totalExtras };
    }).filter(Boolean);
    return lista
      .filter((d) => filtroCategoria === 'Todas' || d.categoria === filtroCategoria)
      .filter((d) => filtroDistrito === 'Todos' || d.distrito === filtroDistrito)
      .sort((a, b) => b.montoTotal - a.montoTotal);
  }, [alumnos, deudasExtras, hoyIso, filtroCategoria, filtroDistrito]);

  const totalProyectado = deudores.reduce((s, d) => s + d.montoTotal, 0);

  const cobrar = (alumno) => { onClose(); navigate('/registrar-pago', { state: { prefilledAlumno: alumno } }); };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      title="Riesgo & cobranzas"
      description={`${deudores.length} deudores · Déficit estimado ${formatMoney(totalProyectado)}`}
    >
      <div style={{ display: 'flex', gap: 'var(--sn-space-3)', flexWrap: 'wrap', marginBottom: 'var(--sn-space-4)' }}>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="sn-focusable" style={selectStyle}>
          <option value="Todas">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>Cat. {c}</option>)}
        </select>
        <select value={filtroDistrito} onChange={(e) => setFiltroDistrito(e.target.value)} className="sn-focusable" style={selectStyle}>
          {distritos.map((d) => <option key={d} value={d}>{d === 'Todos' ? 'Todos los distritos' : d}</option>)}
        </select>
      </div>

      {deudores.length === 0 ? (
        <EmptyState
          icon="✓"
          title="Excelente — sin deudores"
          description="No hay deudas pendientes con los filtros aplicados."
        />
      ) : (
        <DataTable
          rows={deudores}
          columns={[
            {
              key: 'alumno', header: 'Alumno',
              render: (d) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--sn-text-primary)' }}>{d.nombre} {d.apellido}</div>
                  <div style={{ fontSize: 'var(--sn-fs-xs)', color: 'var(--sn-text-muted)' }}>
                    {d.distrito ?? 'N/R'} · Apoderado: {d.apoderado ?? 'N/R'}
                  </div>
                </div>
              ),
            },
            { key: 'categoria', header: 'Cat.', align: 'center', width: 80, render: (d) => <Badge tone="brand">{d.categoria}</Badge> },
            {
              key: 'conceptos', header: 'Conceptos pendientes',
              render: (d) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {d.debeMes && <Badge tone="crit">Mensualidad ({d.diasAtraso}d)</Badge>}
                  {d.deudasDelAlumno.map((x) => (
                    <Badge key={x.id} tone="warn">{x.concepto} · {formatMoney(x.monto)}</Badge>
                  ))}
                </div>
              ),
            },
            {
              key: 'monto', header: 'Total deuda', align: 'right', width: 130,
              render: (d) => <span style={{ fontFamily: 'var(--sn-font-mono)', fontWeight: 800, color: 'var(--sn-crit)' }}>{formatMoney(d.montoTotal)}</span>,
            },
            {
              key: 'acciones', header: 'Gestión', align: 'right', width: 200,
              render: (d) => {
                const num = (d.celular ?? '').replace(/\D/g, '');
                const wa = num.length >= 9
                  ? `https://wa.me/51${num}?text=${encodeURIComponent(`Hola, te escribimos de FC Sechura. Recordatorio amigable: el alumno ${d.nombre} ${d.apellido} presenta un saldo pendiente por ${formatMoney(d.montoTotal)}. Acércate a regularizarlo. ¡Gracias!`)}`
                  : null;
                return (
                  <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                    {wa ? (
                      <a href={wa} target="_blank" rel="noreferrer" className="sn-focusable" style={waBtnStyle} title="Notificar WhatsApp">📱</a>
                    ) : <span style={{ ...waBtnStyle, opacity: 0.4, cursor: 'not-allowed' }} title="Sin número">📱</span>}
                    <Button size="sm" variant="danger" onClick={() => cobrar(d)}>Cobrar</Button>
                  </div>
                );
              },
            },
          ]}
        />
      )}
    </Modal>
  );
};

const selectStyle = {
  background: 'var(--sn-input-bg)',
  border: '1px solid var(--sn-border-soft)',
  borderRadius: 'var(--sn-radius-md)',
  color: 'var(--sn-text-secondary)',
  fontFamily: 'var(--sn-font-ui)', fontSize: 'var(--sn-fs-sm)',
  padding: '0.5rem 0.85rem', outline: 'none',
};

const waBtnStyle = {
  width: 32, height: 32, borderRadius: 'var(--sn-radius-sm)',
  background: 'rgba(16,185,129,0.10)',
  border: '1px solid rgba(16,185,129,0.35)',
  color: 'var(--sn-success)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  textDecoration: 'none',
  fontSize: 16,
};

export default ModalDeudores;
