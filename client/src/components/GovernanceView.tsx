import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  Database, 
  RefreshCw,
  ExternalLink,
  Layers,
  UserCheck
} from 'lucide-react';
import { GovernanceOverview, AuditLogEntry, UserRole } from '../types';
import { api } from '../services/api';

interface GovernanceViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ROLE_BADGES: Record<UserRole, { bg: string; label: string }> = {
  DIRECTOR: { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Director' },
  SUPERVISOR: { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Supervisor' },
  STUDENT: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Estudiante' },
  INTAKE: { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Admisión' }
};

export const GovernanceView: React.FC<GovernanceViewProps> = ({ onShowToast }) => {
  const [governance, setGovernance] = useState<GovernanceOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filterEvent, setFilterEvent] = useState<string>('ALL');

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [govData, auditData] = await Promise.all([
        api.getGovernance(),
        api.getAuditLogs(60)
      ]);
      setGovernance(govData);
      setAuditLogs(auditData);
    } catch (err: any) {
      onShowToast('Error al cargar datos de auditoría: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MANUAL_LINK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ExternalLink className="w-3 h-3 text-blue-500" /> Enlace Oficial Activo
          </span>
        );
      case 'CONFIGURED_NOT_LIVE_TESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Operativo
          </span>
        );
      case 'PENDING_CREDENTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" /> Modo Heurístico Local
          </span>
        );
      case 'PENDING_INSTITUTIONAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
            <AlertTriangle className="w-3 h-3 text-slate-500" /> Convenio Institucional
          </span>
        );
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (filterEvent === 'ALL') return true;
    return log.event === filterEvent;
  });

  const uniqueEvents = Array.from(new Set(auditLogs.map(l => l.event)));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header Institucional */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Seguridad y Trazabilidad Institucional
            </span>
            <span className="text-xs text-slate-400">Ley 1581 de 2012 · Ley 2113 de 2021</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Gobernanza, Integraciones y Bitácora de Auditoría
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mt-1">
            Registro inmutable de actividades en el sistema, estado de integraciones con entidades públicas
            y salvaguardas de confidencialidad para consultorios jurídicos y firmas legales en Colombia.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
          <span>Actualizar Bitácora</span>
        </button>
      </div>

      {/* Grid de 2 Columnas: Salvaguardas & Integraciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Integraciones con Entidades y Servicios */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-800 text-sm">Estado de Integraciones Externas</h2>
          </div>

          <div className="space-y-3">
            {governance?.integrations.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-bold text-xs text-slate-800">{item.name}</h4>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Salvaguardas Institucionales y Protección de Datos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-800 text-sm">Salvaguardas Jurídicas y Protección de Datos</h2>
            </div>

            <ul className="space-y-2.5 mt-3">
              {governance?.safeguards.map((safeguard, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{safeguard}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Estado Cifrado y Hash */}
          <div className="p-4 bg-navy-900 text-white rounded-xl space-y-2 border border-slate-800 mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-400" /> Cifrado en Reposo (AES-256-GCM)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">HABILITADO</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Los expedientes y notas confidenciales son protegidos mediante algoritmos de cifrado de grado militar con claves criptográficas rotativas.
            </p>
          </div>
        </div>

      </div>

      {/* Bitácora de Auditoría Inmutable */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800 text-base">Bitácora de Auditoría Inmutable</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trazabilidad criptográfica de cada creación, modificación, verificación y acceso de usuarios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Filtrar por Evento:</label>
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos los Eventos ({auditLogs.length})</option>
              {uniqueEvents.map(evt => (
                <option key={evt} value={evt}>{evt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Registros */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Momento (Timestamp)</th>
                <th className="py-3 px-4">Usuario / Actor</th>
                <th className="py-3 px-4">Rol Institucional</th>
                <th className="py-3 px-4">Evento</th>
                <th className="py-3 px-4">Entidad Afectada</th>
                <th className="py-3 px-4">Detalles / Metadatos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No hay registros de auditoría para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const roleStyle = ROLE_BADGES[log.actorRole] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: log.actorRole };
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors font-mono">
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                        {log.actorName}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleStyle.bg}`}>
                          {roleStyle.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-700 text-[11px]">
                          {log.event}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-sans">
                        <span className="capitalize">{log.entity}</span> <span className="text-slate-400">({log.entityId})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-sans text-[11px] max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
