import React from 'react';
import { Plus, Bell, Calendar, Scale, ShieldCheck, Globe } from 'lucide-react';
import { User, UserRole } from '../types';

interface HeaderProps {
  currentView: string;
  onOpenNewCase: () => void;
  onOpenNewAction: () => void;
  urgentCount: number;
  onNavigateToCalendar: () => void;
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onReturnToLanding?: () => void;
}

const ROLE_BADGE_STYLE: Record<UserRole, { bg: string; label: string }> = {
  DIRECTOR: { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Director' },
  SUPERVISOR: { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Supervisor' },
  STUDENT: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Estudiante' },
  INTAKE: { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Admisión' }
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenNewCase,
  onOpenNewAction,
  urgentCount,
  onNavigateToCalendar,
  currentUser,
  onOpenLoginModal,
  onReturnToLanding
}) => {
  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Panel de Control Jurídico',
      subtitle: 'Visión consolidada de expedientes, términos procesales y carga de trabajo'
    },
    litiga_wall: {
      title: 'Muro de Estados & Vigilancia Judicial',
      subtitle: 'Monitoreo diario de estados electrónicos, traslados y providencias (Rama Judicial · SAMAI · TYBA)'
    },
    cases: {
      title: 'Gestión de Expedientes y Casos',
      subtitle: 'Creación, seguimiento procesal, partes y control de actuaciones'
    },
    projects: {
      title: 'Gestión de Proyectos y Tareas Legales',
      subtitle: 'Flujos por fases procesales, tablero Kanban y time-tracking legal (LemonSuite Pattern)'
    },
    calendar: {
      title: 'Control de Términos y Calendario Judicial',
      subtitle: 'Cómputo de términos, audiencias, vencimientos y verificación de reglas procesales'
    },
    drafts: {
      title: 'Generador de Documentos y Borradores',
      subtitle: 'Elaboración asistida de tutelas, peticiones, memoriales y conciliaciones'
    },
    sources: {
      title: 'Repositorio de Fuentes Oficiales y Relatorías',
      subtitle: 'Normativa vigente, enlaces a SUIN-JURISCOL y buscadores jurisprudenciales oficiales'
    },
    jurisprudence: {
      title: 'Buscador de Jurisprudencia & Líneas Hito',
      subtitle: 'Rastreo genealógico del precedente: desde la Sentencia Hito Fundadora hasta la doctrina actual de las Altas Cortes'
    },
    ai_assistant: {
      title: 'Asistente Jurídico GlobalLegal Copilot',
      subtitle: 'Análisis cronológico de hechos, riesgos, cuestionarios y orientación legal'
    },
    documents: {
      title: 'Archivo y Gestión Documental',
      subtitle: 'Clasificación de piezas procesales, validación de formatos y control de cotejo'
    },
    analytics: {
      title: 'Analítica y Carga de Trabajo',
      subtitle: 'Métricas de productividad, tasas de resolución y distribución por ramas'
    },
    governance: {
      title: 'Gobernanza Institucional & Auditoría',
      subtitle: 'Trazabilidad inmutable, estado de integraciones y salvaguardas de protección de datos'
    }
  };

  const currentInfo = titles[currentView] || {
    title: 'GlobalLegal CO',
    subtitle: 'Plataforma Inteligente de Gestión Jurídica'
  };

  const roleStyle = currentUser 
    ? (ROLE_BADGE_STYLE[currentUser.role] || { bg: 'bg-slate-100 text-slate-800 border-slate-200', label: currentUser.role })
    : { bg: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Invitado' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-slate-800 leading-tight">
          {currentInfo.title}
        </h2>
        <p className="text-xs text-slate-500 hidden sm:block">
          {currentInfo.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Rama Judicial & SAMAI Live Surveillance Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-800">Rama Judicial & SAMAI:</span>
          <span className="text-emerald-700">En Línea</span>
        </div>

        {/* Urgent Deadlines Notification Bell */}
        <button
          onClick={onNavigateToCalendar}
          className="relative p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          title={`${urgentCount} actuaciones próximas a vencer`}
        >
          <Bell className="w-5 h-5" />
          {urgentCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {urgentCount}
            </span>
          )}
        </button>

        {/* Return to Landing Portal Button */}
        {onReturnToLanding && (
          <button
            onClick={onReturnToLanding}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            title="Ver la página de bienvenida y portal comercial"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Portal Web</span>
          </button>
        )}

        {/* Quick Action Buttons */}
        <button
          onClick={onOpenNewAction}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>+ Actuación</span>
        </button>

        <button
          onClick={onOpenNewCase}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Caso</span>
        </button>

        {/* User Badge - Click to switch role / login */}
        <button
          onClick={onOpenLoginModal}
          className="pl-2 border-l border-slate-200 flex items-center gap-2 hover:opacity-85 transition-opacity text-left cursor-pointer"
          title="Haga clic para cambiar de usuario o ver credenciales"
        >
          <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs border border-slate-300 shadow-inner">
            {currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CJ'}
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-800 leading-none">
                {currentUser?.name || 'Consultorio Jurídico'}
              </p>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border ${roleStyle.bg}`}>
                {roleStyle.label}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              {currentUser?.email || 'Haga clic para cambiar'}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};
