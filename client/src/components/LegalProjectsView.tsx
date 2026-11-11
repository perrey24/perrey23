import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowRight, 
  Kanban, 
  Layers, 
  Timer, 
  TrendingUp, 
  FileText, 
  Scale, 
  Flag,
  MoreVertical,
  Check,
  Building2,
  DollarSign
} from 'lucide-react';
import { LegalCase, LegalAction, User as AppUser } from '../types';

interface LegalProjectsViewProps {
  cases: LegalCase[];
  actions: LegalAction[];
  currentUser: AppUser | null;
  onOpenNewAction: (defaultCaseId?: string) => void;
  onToggleAction: (actionId: string) => void;
  onSelectCase: (caseId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type TaskStatus = 'por_iniciar' | 'en_tramite' | 'en_revision' | 'radicado' | 'cumplido';

interface LemonTask {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  title: string;
  stage: string;
  status: TaskStatus;
  assignee: string;
  priority: 'alta' | 'media' | 'normal';
  deadlineDate: string;
  estimatedHours: number;
  loggedHours: number;
  daysRemaining: number;
}

export const LegalProjectsView: React.FC<LegalProjectsViewProps> = ({
  cases,
  actions,
  currentUser,
  onOpenNewAction,
  onToggleAction,
  onSelectCase,
  onShowToast
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'kanban' | 'etapas' | 'tiempos'>('kanban');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal para registrar horas (Time Tracking Legal)
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTaskForTime, setSelectedTaskForTime] = useState<LemonTask | null>(null);
  const [timeToAdd, setTimeToAdd] = useState('1.5');
  const [timeNotes, setTimeNotes] = useState('Revisión de jurisprudencia y redacción de memorial');

  // Inicializar tareas derivadas de las actuaciones con atributos ampliados de LemonSuite
  const [tasks, setTasks] = useState<LemonTask[]>(() => {
    return actions.map((act, index) => {
      let status: TaskStatus = act.isCompleted ? 'cumplido' : 'en_tramite';
      if (!act.isCompleted) {
        if (index % 4 === 0) status = 'por_iniciar';
        else if (index % 4 === 1) status = 'en_tramite';
        else if (index % 4 === 2) status = 'en_revision';
        else status = 'radicado';
      }

      const parentCase = cases.find(c => c.id === act.caseId);
      const estH = [2, 4, 6, 8, 12][index % 5];
      const logH = act.isCompleted ? estH : Math.max(0.5, (estH * ((index % 3) + 1)) / 4);

      return {
        id: act.id,
        caseId: act.caseId,
        caseNumber: act.caseNumber || (parentCase?.caseNumber || 'EXP-2026'),
        caseTitle: act.caseTitle || (parentCase?.title || 'Asunto Judicial'),
        title: act.title,
        stage: index % 2 === 0 ? 'Fijación de Litigio & Pruebas' : 'Audiencia & Alegatos',
        status,
        assignee: act.responsible || (parentCase?.assignee || 'Abogado Asignado'),
        priority: index % 3 === 0 ? 'alta' : index % 3 === 1 ? 'media' : 'normal',
        deadlineDate: act.date,
        estimatedHours: estH,
        loggedHours: Number(logH.toFixed(1)),
        daysRemaining: act.daysDiff !== undefined ? act.daysDiff : 5
      };
    });
  });

  // Mover de columna en Kanban
  const handleMoveStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (newStatus === 'cumplido' && t.status !== 'cumplido') {
          onToggleAction(taskId);
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
    onShowToast(`Tarea actualizada a "${getStatusLabel(newStatus)}"`, 'success');
  };

  const handleLogHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForTime) return;
    const hours = parseFloat(timeToAdd);
    if (isNaN(hours) || hours <= 0) {
      onShowToast('Ingrese un número de horas válido.', 'error');
      return;
    }

    setTasks(prev => prev.map(t => {
      if (t.id === selectedTaskForTime.id) {
        return { ...t, loggedHours: Number((t.loggedHours + hours).toFixed(1)) };
      }
      return t;
    }));

    onShowToast(`Registradas ${hours}h de trabajo en "${selectedTaskForTime.title}".`, 'success');
    setIsTimeModalOpen(false);
  };

  // Filtrado de tareas
  const filteredTasks = tasks.filter(t => {
    if (selectedCaseId !== 'all' && t.caseId !== selectedCaseId) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterAssignee !== 'all' && t.assignee !== filterAssignee) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.caseNumber.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Métricas generales estilo LemonSuite
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'en_tramite' || t.status === 'en_revision').length;
  const completedTasks = tasks.filter(t => t.status === 'cumplido').length;
  const totalEstimatedHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const totalLoggedHours = tasks.reduce((sum, t) => sum + t.loggedHours, 0);

  // Lista única de responsables para filtro
  const assignees = Array.from(new Set(tasks.map(t => t.assignee)));

  const columns: Array<{ id: TaskStatus; label: string; color: string; border: string }> = [
    { id: 'por_iniciar', label: 'Por Iniciar', color: 'bg-slate-100 text-slate-700', border: 'border-slate-300' },
    { id: 'en_tramite', label: 'En Trámite Judicial', color: 'bg-blue-50 text-blue-800', border: 'border-blue-300' },
    { id: 'en_revision', label: 'En Revisión Senior', color: 'bg-purple-50 text-purple-800', border: 'border-purple-300' },
    { id: 'radicado', label: 'Radicado en Despacho', color: 'bg-cyan-50 text-cyan-800', border: 'border-cyan-300' },
    { id: 'cumplido', label: 'Cumplido / Aprobado', color: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-300' }
  ];

  function getStatusLabel(s: TaskStatus) {
    return columns.find(c => c.id === s)?.label || s;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Cabecera del Módulo LemonSuite */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              Gestión de Proyectos y Tareas Legales
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              LemonSuite Pattern
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Administración ágil de asuntos por fases procesales, tablero Kanban interactivo y control de horas de trabajo legal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenNewAction(selectedCaseId !== 'all' ? selectedCaseId : undefined)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea Procesal</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Productividad LemonSuite */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Asuntos / Casos</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">
            {cases.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Expedientes activos gestionados</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Tareas en Curso</span>
            <Kanban className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700 font-mono">
            {inProgressTasks}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">En redacción o revisión docente</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Horas Invertidas</span>
            <Timer className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {totalLoggedHours}h <span className="text-xs font-normal text-slate-400">/ {totalEstimatedHours}h est.</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Time tracking legal registrado</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Tasa de Avance</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono">
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{completedTasks} de {totalTasks} tareas cumplidas</p>
        </div>

      </div>

      {/* Barra de Filtros y Selector de Vistas */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Selector de Pestañas: Kanban vs Etapas Procesales vs Time Tracking */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'kanban' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Tablero Kanban</span>
          </button>
          <button
            onClick={() => setActiveTab('etapas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'etapas' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fases del Litigio</span>
          </button>
          <button
            onClick={() => setActiveTab('tiempos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'tiempos' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Control de Horas</span>
          </button>
        </div>

        {/* Filtros de Expediente, Prioridad y Búsqueda */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Selector de Asunto */}
          <select
            value={selectedCaseId}
            onChange={e => setSelectedCaseId(e.target.value)}
            className="p-1.5 text-xs border border-slate-300 rounded-lg bg-white max-w-[200px] truncate"
          >
            <option value="all">-- Todos los Asuntos --</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.title.slice(0, 25)}...
              </option>
            ))}
          </select>

          {/* Filtro Prioridad */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="p-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">Prioridad: Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="normal">Normal</option>
          </select>

          {/* Filtro Responsable */}
          <select
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
            className="p-1.5 text-xs border border-slate-300 rounded-lg bg-white max-w-[150px] truncate"
          >
            <option value="all">Responsable: Todos</option>
            {assignees.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Buscador */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tarea o radicado..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

        </div>

      </div>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200 flex flex-col min-h-[500px]"
              >
                {/* Encabezado de Columna */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-800">{col.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.color}`}>
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tarjetas de Tareas */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map(task => {
                    const isUrgent = task.daysRemaining <= 2 && task.status !== 'cumplido';
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${
                          isUrgent ? 'border-amber-400 ring-1 ring-amber-400/20' : 'border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {/* Radicado y Prioridad */}
                        <div className="flex items-center justify-between text-[10px] mb-1.5">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {task.caseNumber}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded font-semibold uppercase ${
                            task.priority === 'alta' ? 'bg-rose-100 text-rose-700' :
                            task.priority === 'media' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Título de la Tarea */}
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-1">
                          {task.title}
                        </h4>

                        {/* Asunto o Caso Padre */}
                        <p className="text-[11px] text-slate-500 truncate mb-2">
                          {task.caseTitle}
                        </p>

                        {/* Responsable & Plazo */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 truncate max-w-[100px]" title={task.assignee}>
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{task.assignee}</span>
                          </span>
                          <span className={`flex items-center gap-1 font-mono text-[10px] font-semibold ${
                            isUrgent ? 'text-amber-700 font-bold' : 'text-slate-500'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {task.deadlineDate}
                          </span>
                        </div>

                        {/* Barra de Horas LemonSuite (Logged vs Estimated) */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-medium">
                            ⏱ {task.loggedHours}h / {task.estimatedHours}h
                          </span>
                          <button
                            onClick={() => {
                              setSelectedTaskForTime(task);
                              setIsTimeModalOpen(true);
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            + Horas
                          </button>
                        </div>

                        {/* Selector Rápido de Movimiento de Estado */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Mover a:</span>
                          <select
                            value={task.status}
                            onChange={e => handleMoveStatus(task.id, e.target.value as TaskStatus)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1 text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="por_iniciar">Por Iniciar</option>
                            <option value="en_tramite">En Trámite</option>
                            <option value="en_revision">En Revisión</option>
                            <option value="radicado">Radicado</option>
                            <option value="cumplido">Cumplido</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      Sin tareas en esta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PESTAÑA: FASES PROCESALES DEL LITIGIO (MILESTONES) */}
      {activeTab === 'etapas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Evolución por Fases Procesales (Código General del Proceso & CPACA)
            </h3>
            <p className="text-xs text-slate-500">
              Control de avance secuencial del litigio para evitar preclusiones y caducidades.
            </p>
          </div>

          <div className="space-y-4">
            {cases.map((c, i) => {
              const caseTasks = tasks.filter(t => t.caseId === c.id);
              const doneCount = caseTasks.filter(t => t.status === 'cumplido').length;
              const progressPct = caseTasks.length > 0 ? Math.round((doneCount / caseTasks.length) * 100) : 40;

              return (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mr-2">
                        {c.caseNumber}
                      </span>
                      <strong className="text-xs font-bold text-slate-800">{c.title}</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {c.authority} · Responsable: {c.assignee}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {progressPct}% completado
                      </span>
                      <button
                        onClick={() => onSelectCase(c.id)}
                        className="px-2.5 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold flex items-center gap-1"
                      >
                        <span>Ver Expediente</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progreso del Litigio */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Fases Secuenciales */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] text-center pt-2">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      ✓ 1. Admisión & Traslado
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                      ● 2. Excepciones & Fijación
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                      3. Audiencia Art. 372 CGP
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                      4. Instrucción y Pruebas
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                      5. Sentencia y Fallo
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA: CONTROL DE TIEMPO (TIME TRACKING LEGAL) */}
      {activeTab === 'tiempos' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Liquidación y Registro de Horas por Caso (Time Tracking)
              </h3>
              <p className="text-xs text-slate-500">
                Seguimiento de rentabilidad y dedicación horaria por abogado conforme a los estándares de Lemontech.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200">
              Total Horas Registradas: {totalLoggedHours}h
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="p-3">Expediente / Asunto</th>
                  <th className="p-3">Tarea / Actuación</th>
                  <th className="p-3">Responsable</th>
                  <th className="p-3">Presupuesto</th>
                  <th className="p-3">Horas Reales</th>
                  <th className="p-3">Diferencial</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map(task => {
                  const diff = task.estimatedHours - task.loggedHours;
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-medium text-slate-800">
                        <span className="font-mono text-blue-600 font-bold block">{task.caseNumber}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">{task.caseTitle}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{task.title}</td>
                      <td className="p-3 text-slate-600">{task.assignee}</td>
                      <td className="p-3 font-mono text-slate-500">{task.estimatedHours}h</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{task.loggedHours}h</td>
                      <td className="p-3 font-mono font-semibold">
                        {diff >= 0 ? (
                          <span className="text-emerald-600">+{diff.toFixed(1)}h a favor</span>
                        ) : (
                          <span className="text-rose-600">{diff.toFixed(1)}h exceso</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTaskForTime(task);
                            setIsTimeModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                        >
                          + Añadir Horas
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para Registrar Horas de Trabajo */}
      {isTimeModalOpen && selectedTaskForTime && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Registrar Horas de Trabajo Legal</h3>
              </div>
              <button 
                onClick={() => setIsTimeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogHours} className="space-y-3.5 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">Tarea:</span>
                <p className="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
                  {selectedTaskForTime.title} ({selectedTaskForTime.caseNumber})
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Horas dedicadas a registrar *</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  required
                  value={timeToAdd}
                  onChange={e => setTimeToAdd(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-sm"
                  placeholder="Ej: 1.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción de la actividad realizada</label>
                <textarea
                  rows={2}
                  value={timeNotes}
                  onChange={e => setTimeNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  placeholder="Ej: Redacción de memorial de excepciones previas..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20"
                >
                  Guardar Horas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
