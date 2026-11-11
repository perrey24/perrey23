import React from 'react';
import { 
  Briefcase, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  Scale, 
  UserCheck, 
  Layers, 
  Flame,
  CheckCircle2,
  Radio,
  Building2,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { DashboardMetrics, LegalAction } from '../types';
import { INITIAL_JUDICIAL_STATES } from '../services/judicialStates';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  onNavigateToCases: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToLitigaWall?: () => void;
  onToggleAction: (id: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  loading,
  onNavigateToCases,
  onNavigateToCalendar,
  onNavigateToLitigaWall,
  onToggleAction,
  onSelectCase
}) => {
  if (loading || !metrics) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[500px] text-slate-500">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Cargando indicadores de LexFlow Colombia...</p>
      </div>
    );
  }

  // Colores por área jurídica
  const areaColors: Record<string, string> = {
    laboral: 'bg-blue-600',
    civil: 'bg-emerald-600',
    penal: 'bg-rose-600',
    administrativo: 'bg-amber-600',
    constitucional: 'bg-purple-600',
    familia: 'bg-pink-600',
    comercial: 'bg-cyan-600',
    tributario: 'bg-indigo-600'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Litiga Surveillance Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-slate-800 text-white p-4 rounded-xl shadow-md border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Centauros S.A. · Portafolio Corporativo
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Vigilancia Judicial Activa
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                NIT 900.841.230-1
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Extracción diaria de estados electrónicos en Rama Judicial, SAMAI y despachos del país (CGP Art. 118).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          {onNavigateToLitigaWall && (
            <button
              onClick={onNavigateToLitigaWall}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Muro de Estados (Litiga)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Banner de Alerta Crítica si hay vencimientos inminentes */}
      {metrics.upcomingDeadlinesCount > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                ¡Atención Procesal! {metrics.upcomingDeadlinesCount} actuación(es) vencida(s) o próximas a vencer
              </h4>
              <p className="text-xs text-rose-700">
                Revise el calendario para verificar los términos y radicar los memoriales correspondientes en término hábil.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToCalendar}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Ver Calendario</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Casos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total Expedientes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800">{metrics.totalCases}</span>
            <span className="text-xs font-medium text-slate-500">registrados</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Activos: <strong>{metrics.activeCases + metrics.inProgressCases}</strong></span>
            <span>Cerrados: <strong>{metrics.closedCases}</strong></span>
          </div>
        </div>

        {/* Casos en Trámite / Fallo */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">En Trámite o Fallo</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800">
              {metrics.inProgressCases + metrics.inRulingCases}
            </span>
            <span className="text-xs font-medium text-amber-600">con actuaciones vivas</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>En Despacho para Fallo: <strong>{metrics.inRulingCases}</strong></span>
            <span>Suspendidos: <strong>{metrics.suspendedCases}</strong></span>
          </div>
        </div>

        {/* Próximos Vencimientos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Términos Críticos</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">{metrics.upcomingDeadlinesCount}</span>
            <span className="text-xs font-medium text-rose-700">en &le; 3 días o vencidos</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Total tareas pendientes: <strong>{metrics.pendingActionsCount}</strong></span>
          </div>
        </div>

        {/* Actuaciones Cumplidas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Gestiones Cumplidas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{metrics.completedActionsCount}</span>
            <span className="text-xs font-medium text-slate-500">actuaciones</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Efectividad de trámite: <strong>{Math.round((metrics.completedActionsCount / (metrics.pendingActionsCount + metrics.completedActionsCount || 1)) * 100)}%</strong></span>
          </div>
        </div>
      </div>

      {/* Litiga Live Estados Procesales Widget */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                Muro de Estados Electrónicos & Notificaciones Judiciales
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Hoy (08:00 AM)
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Monitoreo activo sincronizado con Rama Judicial & SAMAI para Centauros S.A.
              </p>
            </div>
          </div>

          {onNavigateToLitigaWall && (
            <button
              onClick={onNavigateToLitigaWall}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Ver todos los estados ({INITIAL_JUDICIAL_STATES.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INITIAL_JUDICIAL_STATES.slice(0, 2).map(st => (
            <div 
              key={st.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {st.caseNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    st.urgency === 'critico' 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {st.daysRemaining} {st.daysRemaining === 1 ? 'día hábil' : 'días hábiles'}
                  </span>
                </div>

                <p className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {st.processTitle}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {st.authority}
                </p>

                <div className="mt-2 p-2 rounded bg-white border border-slate-200 text-xs text-slate-700">
                  <p className="font-semibold text-slate-800 text-[11px]">
                    {st.actType}
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {st.summary}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono text-[10px]">
                  Fijado: {st.stateDate} (08:00 AM)
                </span>
                {onNavigateToLitigaWall && (
                  <button
                    onClick={onNavigateToLitigaWall}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                  >
                    <span>Ver detalle</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de 2 columnas: Vencimientos urgentes y Distribución por Rama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2 spans): Lista de actuaciones y vencimientos urgentes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Vencimientos y Actuaciones Próximas
              </h3>
            </div>
            <button
              onClick={onNavigateToCalendar}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Ver calendario completo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {metrics.urgentActions.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No hay vencimientos críticos pendientes</p>
              <p className="text-slate-400">Todas las actuaciones prioritarias están en término.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-2">
              {metrics.urgentActions.slice(0, 5).map(action => {
                const isOverdue = action.urgency === 'vencido';
                const isToday = action.urgency === 'hoy';

                return (
                  <div key={action.id} className="pt-2 flex items-start justify-between gap-3 group">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleAction(action.id)}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          action.isCompleted 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-slate-300 hover:border-blue-600 text-transparent hover:text-slate-300'
                        }`}
                        title="Marcar como cumplido"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => onSelectCase(action.caseId)}
                            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            {action.caseNumber}
                          </button>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isOverdue 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                              : isToday 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {isOverdue ? 'Vencido' : isToday ? 'Vence HOY' : `${action.daysDiff} días restantes`}
                          </span>

                          {action.legalVerificationStatus === 'pendiente_verificacion' && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200" title="Pendiente de verificación de notificación y días hábiles">
                              ⚠️ Pendiente verificación
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
                          {action.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Fecha límite: <strong>{action.date}</strong> · Resp: {action.responsible}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha (1 span): Distribución por Rama del Derecho */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Casos por Rama del Derecho
              </h3>
            </div>
            <button
              onClick={onNavigateToCases}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {metrics.casesByArea
              .filter(a => a.count > 0)
              .sort((a, b) => b.count - a.count)
              .map(item => {
                const percentage = Math.round((item.count / (metrics.totalCases || 1)) * 100);
                const color = areaColors[item.area] || 'bg-slate-600';

                return (
                  <div key={item.area} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 capitalize">{item.label}</span>
                      <span className="font-semibold text-slate-800">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${color} rounded-full transition-all duration-500`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Ramas representadas: <strong>{metrics.casesByArea.filter(a => a.count > 0).length}</strong></span>
            <span className="text-blue-600 font-semibold cursor-pointer" onClick={onNavigateToCases}>Filtrar por rama &rarr;</span>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Carga de trabajo por Asignado y Evolución Mensual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carga de Trabajo por Responsable */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Carga de Trabajo por Abogado / Estudiante
              </h3>
            </div>
            <span className="text-xs text-slate-500">Expedientes Activos</span>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics.workloadByAssignee.map(item => (
              <div key={item.assignee} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{item.assignee}</p>
                  <p className="text-[11px] text-slate-500">Total asignados: {item.totalCount}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {item.activeCount} activos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evolución Mensual de Radicaciones vs Cierres */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Evolución Procesal (Aperturas vs Cierres)
              </h3>
            </div>
            <span className="text-xs text-slate-500">Semestre 2026</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {metrics.monthlyEvolution.map(m => {
              const maxVal = Math.max(...metrics.monthlyEvolution.map(x => Math.max(x.opened, x.closed)), 1);
              const openHeight = Math.max((m.opened / maxVal) * 110, 8);
              const closeHeight = Math.max((m.closed / maxVal) * 110, 8);

              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-32">
                    {/* Aperturas */}
                    <div 
                      className="w-3.5 bg-blue-600 rounded-t-sm transition-all group-hover:bg-blue-700" 
                      style={{ height: `${openHeight}px` }}
                      title={`Abiertos en ${m.month}: ${m.opened}`}
                    />
                    {/* Cierres */}
                    <div 
                      className="w-3.5 bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-600" 
                      style={{ height: `${closeHeight}px` }}
                      title={`Cerrados en ${m.month}: ${m.closed}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium truncate">{m.month.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-sm inline-block" />
              <span>Nuevos Radicados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" />
              <span>Casos Cerrados / Resueltos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
