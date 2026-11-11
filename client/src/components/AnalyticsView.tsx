import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Printer, 
  Info,
  Building,
  Calendar
} from 'lucide-react';
import { DashboardMetrics, LegalCase } from '../types';

interface AnalyticsViewProps {
  metrics: DashboardMetrics | null;
  cases: LegalCase[];
  loading: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  metrics,
  cases,
  loading
}) => {
  if (loading || !metrics) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p>Cargando analítica jurídica...</p>
      </div>
    );
  }

  // Cálculos estadísticos derivados de datos reales
  const resolutionRate = Math.round((metrics.closedCases / (metrics.totalCases || 1)) * 100);
  const actionCompletionRate = Math.round(
    (metrics.completedActionsCount / (metrics.pendingActionsCount + metrics.completedActionsCount || 1)) * 100
  );

  // Cuantía total estimada en litigio
  const totalEstimatedValue = cases.reduce((acc, c) => acc + (c.estimatedValue || 0), 0);
  const proBonoCount = cases.filter(c => c.isProBono).length;

  const areaColors: Record<string, string> = {
    laboral: '#2563EB',
    civil: '#059669',
    penal: '#E11D48',
    administrativo: '#D97706',
    constitucional: '#7C3AED',
    familia: '#DB2777',
    comercial: '#0891B2',
    tributario: '#4F46E5'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">
              Analítica de Operaciones y Carga Jurídica
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
              Métricas Operativas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Indicadores de gestión derivados exclusivamente de los registros almacenados en el despacho
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 no-print"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir Informe</span>
        </button>
      </div>

      {/* Disclaimers de Rigor Estadístico */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Aviso sobre el origen de las métricas</strong>
          <span>
            Las estadísticas corresponden a la carga de trabajo de este consultorio o despacho. No representan datos agregados del Consejo Superior de la Judicatura ni del sistema judicial nacional colombiano.
          </span>
        </div>
      </div>

      {/* 4 KPIs Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Tasa de Resolución</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700">{resolutionRate}%</span>
            <span className="text-xs text-slate-500">cerrados vs total</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {metrics.closedCases} de {metrics.totalCases} expedientes archivados con decisión de fondo.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Efectividad en Términos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{actionCompletionRate}%</span>
            <span className="text-xs text-slate-500">cumplidas</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {metrics.completedActionsCount} actuaciones evacuadas exitosamente en término.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Cuantía Estimada en Litigio</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-800">
              ${(totalEstimatedValue / 1e6).toFixed(1)}M
            </span>
            <span className="text-xs text-slate-500">COP</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Valor de pretensiones patrimoniales reclamadas o defendidas.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Atención Pro-Bono</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700">{proBonoCount}</span>
            <span className="text-xs text-slate-500">expedientes</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Casos de consultorio jurídico o causas de interés público sin honorarios.
          </p>
        </div>
      </div>

      {/* Grid: Distribución por Rama & Desglose de Estados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribución por Rama */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              Distribución por Especialidad Jurídica
            </h4>
            <span className="text-xs text-slate-500">Porcentaje de Expedientes</span>
          </div>

          <div className="space-y-3">
            {metrics.casesByArea
              .filter(a => a.count > 0)
              .sort((a, b) => b.count - a.count)
              .map(item => {
                const percentage = Math.round((item.count / (metrics.totalCases || 1)) * 100);
                const color = areaColors[item.area] || '#64748B';

                return (
                  <div key={item.area} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="font-bold text-slate-800">{item.count} casos ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
            })}
          </div>
        </div>

        {/* Distribución por Estado Procesal */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Estado del Flujo Procesal
            </h4>
            <span className="text-xs text-slate-500">{metrics.totalCases} Total</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-emerald-800 font-bold block text-sm">{metrics.activeCases}</span>
              <span className="font-semibold text-emerald-950 block">Activos</span>
              <span className="text-[10px] text-emerald-700 block">En etapa de formulación o demanda</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
              <span className="text-blue-800 font-bold block text-sm">{metrics.inProgressCases}</span>
              <span className="font-semibold text-blue-950 block">En Trámite Procesal</span>
              <span className="text-[10px] text-blue-700 block">Traslados, excepciones o pruebas</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
              <span className="text-purple-800 font-bold block text-sm">{metrics.inRulingCases}</span>
              <span className="font-semibold text-purple-950 block">Para Fallo / Sentencia</span>
              <span className="text-[10px] text-purple-700 block">En el despacho del juzgador</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 space-y-1">
              <span className="text-slate-700 font-bold block text-sm">{metrics.closedCases}</span>
              <span className="font-semibold text-slate-900 block">Cerrados / Archivado</span>
              <span className="text-[10px] text-slate-600 block">Con sentencia ejecutoriada o acuerdo</span>
            </div>
          </div>
        </div>

      </div>

      {/* Carga por Asignado y Productividad */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Balance de Carga y Responsabilidades en el Equipo
          </h4>
          <span className="text-xs text-slate-500">Distribución de Litigio</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Profesional / Asignado</th>
                <th className="py-2.5 px-4 text-center">Expedientes Activos</th>
                <th className="py-2.5 px-4 text-center">Total Histórico</th>
                <th className="py-2.5 px-4">Porcentaje de Carga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.workloadByAssignee.map(item => {
                const totalActive = metrics.activeCases + metrics.inProgressCases + metrics.inRulingCases || 1;
                const loadPercent = Math.round((item.activeCount / totalActive) * 100);

                return (
                  <tr key={item.assignee} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-800">{item.assignee}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                        {item.activeCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-600">{item.totalCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${loadPercent}%` }} />
                        </div>
                        <span className="font-bold text-slate-700 text-[11px]">{loadPercent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
