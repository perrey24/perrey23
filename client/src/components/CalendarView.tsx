import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  BookOpen, 
  ShieldAlert, 
  ShieldCheck, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Info,
  Trash2,
  Edit3
} from 'lucide-react';
import { LegalAction, LegalCase } from '../types';

interface CalendarViewProps {
  actions: LegalAction[];
  cases: LegalCase[];
  loading: boolean;
  onOpenNewAction: () => void;
  onToggleAction: (id: string) => void;
  onEditAction: (action: LegalAction) => void;
  onDeleteAction: (id: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  actions,
  cases,
  loading,
  onOpenNewAction,
  onToggleAction,
  onEditAction,
  onDeleteAction,
  onSelectCase
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [showLegalGuide, setShowLegalGuide] = useState(false);

  // Fecha base para el calendario mensual (Octubre 2026)
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)); // 0 = Ene, 9 = Oct

  const filteredActions = useMemo(() => {
    return actions.filter(a => {
      const matchType = filterType === 'all' || a.type === filterType;
      const matchStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'pending' && !a.isCompleted) || 
        (filterStatus === 'completed' && a.isCompleted);

      return matchType && matchStatus;
    });
  }, [actions, filterType, filterStatus]);

  // Contadores rápidos
  const overdueCount = actions.filter(a => !a.isCompleted && (a.daysDiff || 0) < 0).length;
  const todayCount = actions.filter(a => !a.isCompleted && a.daysDiff === 0).length;
  const criticalCount = actions.filter(a => !a.isCompleted && (a.daysDiff || 0) > 0 && (a.daysDiff || 0) <= 3).length;

  // Lógica del calendario mensual
  const monthName = currentMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes = 0

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-base">
              Control de Términos Procesales y Audiencias
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
              Régimen Colombiano
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cómputo en días hábiles (CGP / CPACA) y diferenciación de días calendario
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Switch de Vistas */}
          <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lista de Actuaciones
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calendario Mensual
            </button>
          </div>

          {/* Guía Jurídica Toggle */}
          <button
            onClick={() => setShowLegalGuide(!showLegalGuide)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Guía de Términos</span>
          </button>

          {/* Nueva Actuación */}
          <button
            onClick={onOpenNewAction}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Actuación</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Alerta de Urgencia */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Vencidas</span>
            <span className="text-2xl font-black text-rose-900">{overdueCount}</span>
            <span className="text-xs text-rose-700 block mt-0.5">Requiere impulso o prórroga</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Vencen Hoy</span>
            <span className="text-2xl font-black text-amber-900">{todayCount}</span>
            <span className="text-xs text-amber-700 block mt-0.5">Radicación perentoria antes de cierre</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Próximas (&le; 3 Días)</span>
            <span className="text-2xl font-black text-blue-900">{criticalCount}</span>
            <span className="text-xs text-blue-700 block mt-0.5">En término de preparación</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Panel Desplegable: Guía de Términos Colombianos */}
      {showLegalGuide && (
        <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/70 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <h4 className="font-bold text-blue-950 text-sm">
                Reglas Procesales Colombianas para el Cómputo de Términos
              </h4>
            </div>
            <button
              onClick={() => setShowLegalGuide(false)}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              Cerrar Guía
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3 bg-white rounded-lg border border-blue-100 space-y-1">
              <strong className="text-blue-900 block">Días Hábiles Judiciales (CGP Art. 118)</strong>
              <p>
                En los términos procesales de días no se computan los días en que el despacho judicial permanezca cerrado ni sábados, domingos o festivos de la Ley Emiliani (Ley 51/1983).
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100 space-y-1">
              <strong className="text-blue-900 block">Notificación Electrónica (Ley 2213 de 2022, Art. 8)</strong>
              <p>
                La notificación personal se entiende surtida transcurridos <strong>dos (2) días hábiles</strong> siguientes al envío del mensaje de datos. Los términos procesales corren a partir del día siguiente al que se surtió la notificación.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100 space-y-1">
              <strong className="text-blue-900 block">Acción de Tutela (Decreto 2591 de 1991, Art. 29)</strong>
              <p>
                Término improrrogable de <strong>10 días hábiles judiciales</strong> contados desde la presentación o reparto para proferir fallo de primera instancia.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100 space-y-1">
              <strong className="text-blue-900 block">Derecho de Petición (Ley 1755 de 2015, Art. 14)</strong>
              <p>
                Regla general: 15 días hábiles. Solicitud de documentos e información: 10 días hábiles. Consultas o conceptos jurídicos: 30 días hábiles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filtros de Lista */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Mostrar:</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
              >
                <option value="pending">Solo Pendientes</option>
                <option value="completed">Solo Cumplidas</option>
                <option value="all">Todas las Actuaciones</option>
              </select>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 capitalize"
              >
                <option value="all">Todos los Tipos</option>
                <option value="audiencia">Audiencias</option>
                <option value="vencimiento_termino">Vencimientos</option>
                <option value="radicacion">Radicaciones</option>
                <option value="entrega_documentos">Entrega de Documentos</option>
                <option value="reunion">Reuniones</option>
                <option value="recordatorio">Recordatorios</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {filteredActions.length} actuación(es) mostrada(s)
            </div>
          </div>

          {/* Cards de Actuaciones */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Cargando actuaciones...</div>
          ) : filteredActions.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700">No hay actuaciones bajo este filtro</p>
              <p className="text-slate-400">Todas las tareas están al día o no existen registros con estos parámetros.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActions.map(action => {
                const isOverdue = !action.isCompleted && (action.daysDiff || 0) < 0;
                const isToday = !action.isCompleted && action.daysDiff === 0;
                const isCritical = !action.isCompleted && (action.daysDiff || 0) > 0 && (action.daysDiff || 0) <= 3;

                return (
                  <div
                    key={action.id}
                    className={`p-4 rounded-xl border transition-all ${
                      action.isCompleted
                        ? 'bg-slate-50/70 border-slate-200 opacity-80'
                        : isOverdue
                        ? 'bg-rose-50/40 border-rose-200 shadow-sm'
                        : isToday
                        ? 'bg-amber-50/40 border-amber-200 shadow-sm'
                        : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Checkbox de cumplimiento */}
                        <button
                          onClick={() => onToggleAction(action.id)}
                          className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            action.isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'border-slate-300 hover:border-blue-600 text-transparent hover:text-slate-400 bg-white'
                          }`}
                          title={action.isCompleted ? 'Desmarcar actuación' : 'Marcar actuación como cumplida'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-1 flex-1 min-w-0 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => onSelectCase(action.caseId)}
                              className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:underline cursor-pointer"
                            >
                              {action.caseNumber}
                            </button>
                            <span className="font-semibold text-slate-500 truncate max-w-[250px]">
                              {action.caseTitle}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-semibold">
                              {action.type}
                            </span>
                          </div>

                          <h4 className={`text-sm font-bold ${action.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {action.title}
                          </h4>

                          {action.description && (
                            <p className="text-slate-600 text-xs leading-relaxed">
                              {action.description}
                            </p>
                          )}

                          {/* Clasificación de días y advertencia de término procesal */}
                          <div className="pt-2 flex items-center gap-2 flex-wrap text-[11px]">
                            {/* Naturaleza */}
                            <span className={`px-2 py-0.5 rounded font-semibold ${
                              action.proceduralTermType === 'termino_procesal'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {action.proceduralTermType === 'termino_procesal' 
                                ? '⚖️ Término Procesal Hábil' 
                                : '📅 Días Calendario'}
                            </span>

                            {/* Estado de verificación jurídica */}
                            {action.legalVerificationStatus === 'pendiente_verificacion' ? (
                              <span 
                                className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1"
                                title={action.legalVerificationNotes}
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Pendiente de verificación jurídica</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Verificado</span>
                              </span>
                            )}

                            <span className="text-slate-500">
                              Responsable: <strong>{action.responsible}</strong>
                            </span>
                          </div>

                          {/* Nota explicativa de rigor jurídico */}
                          {action.legalVerificationNotes && (
                            <p className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded border border-slate-200/60">
                              {action.legalVerificationNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Lado derecho: Plazo y Botones */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center sm:justify-end gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{action.date}</span>
                            {action.time && <span className="text-slate-500">({action.time})</span>}
                          </div>

                          <span className={`inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                            action.isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isToday
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isCritical
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {action.isCompleted
                              ? 'Cumplido'
                              : isOverdue
                              ? `Vencido hace ${Math.abs(action.daysDiff || 0)} d`
                              : isToday
                              ? 'Vence HOY'
                              : `${action.daysDiff} días restantes`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditAction(action)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Editar Actuación"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteAction(action.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar Actuación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Vista de Calendario Mensual */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-base font-bold text-slate-800 capitalize">
              {monthName}
            </h4>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-1">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span className="text-rose-600">Sáb</span>
            <span className="text-rose-600">Dom</span>
          </div>

          {/* Celdas del mes */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espacios vacíos previos */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-28 bg-slate-50/50 rounded-lg border border-dashed border-slate-200" />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayActions = actions.filter(a => a.date === dayStr);
              const isToday = dayStr === '2026-10-19';

              return (
                <div
                  key={dayStr}
                  className={`h-28 p-1.5 rounded-lg border flex flex-col justify-between transition-all overflow-hidden ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/30 font-bold ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                    }`}>
                      {dayNum}
                    </span>
                    {dayActions.length > 0 && (
                      <span className="text-[10px] px-1 rounded-full bg-slate-200 text-slate-700 font-semibold">
                        {dayActions.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-20 text-[10px]">
                    {dayActions.map(act => (
                      <div
                        key={act.id}
                        onClick={() => onSelectCase(act.caseId)}
                        className={`px-1.5 py-0.5 rounded truncate cursor-pointer font-medium ${
                          act.isCompleted
                            ? 'bg-slate-100 text-slate-500 line-through'
                            : act.urgency === 'vencido'
                            ? 'bg-rose-100 text-rose-800'
                            : act.urgency === 'hoy'
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        title={`${act.caseNumber} - ${act.title}`}
                      >
                        {act.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
