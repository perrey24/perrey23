import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  CalendarClock, 
  FileText, 
  Bot, 
  FolderArchive, 
  BarChart3, 
  RotateCcw,
  Scale,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  UserCheck,
  GraduationCap,
  ClipboardList,
  Radio,
  Building2,
  Globe,
  Kanban
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onResetDb: () => void;
  isAiLive: boolean;
  currentUser: User | null;
  onOpenLoginModal: () => void;
}

const ROLE_ICONS: Record<UserRole, any> = {
  DIRECTOR: Scale,
  SUPERVISOR: UserCheck,
  STUDENT: GraduationCap,
  INTAKE: ClipboardList
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onResetDb,
  isAiLive,
  currentUser,
  onOpenLoginModal
}) => {
  const menuItems = [
    { id: 'landing', label: 'Portal Principal (Landing)', icon: Globe, badge: 'Web' },
    { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { id: 'litiga_wall', label: 'Muro de Estados (Litiga)', icon: Radio, badge: 'Hoy' },
    { id: 'cases', label: 'Casos y Expedientes', icon: Briefcase },
    { id: 'projects', label: 'Proyectos & Tareas (Lemon)', icon: Kanban, badge: 'Lemon' },
    { id: 'calendar', label: 'Términos y Calendario', icon: CalendarClock },
    { id: 'drafts', label: 'Generador de Borradores', icon: FileText },
    { id: 'sources', label: 'Fuentes Oficiales & Relatorías', icon: BookOpen },
    { id: 'jurisprudence', label: 'Buscador de Jurisprudencia', icon: Scale, badge: 'Líneas' },
    { id: 'ai_assistant', label: 'Asistente Jurídico IA', icon: Bot },
    { id: 'documents', label: 'Gestión Documental', icon: FolderArchive },
    { id: 'analytics', label: 'Analítica Jurídica', icon: BarChart3 },
    { id: 'governance', label: 'Gobierno & Auditoría', icon: ShieldCheck }
  ];

  const RoleIcon = currentUser ? (ROLE_ICONS[currentUser.role] || UserCheck) : UserCheck;

  return (
    <aside className="w-64 bg-navy-900 text-slate-200 flex flex-col h-screen border-r border-slate-800 shadow-xl shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-navy-900/90 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Scale className="w-5 h-5 text-gold-500" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              GlobalLegal <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-normal border border-blue-400/30">CO</span>
            </h1>
            <p className="text-[11px] text-slate-400">Plataforma LegalTech</p>
          </div>
        </div>

        {/* Litiga Portfolio Badge: Centauros S.A. */}
        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">Centauros S.A.</p>
              <p className="text-[9px] text-slate-400 font-mono">NIT 900.841.230-1</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Vigilancia Judicial Activa" />
        </div>
      </div>

      {/* Perfil del Usuario Activo (Click para cambiar rol) */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenLoginModal}
          className="w-full p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group flex items-center justify-between"
          title="Haga clic para cambiar de rol o usuario"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
              <RoleIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                {currentUser?.name || 'Invitado Demo'}
              </p>
              <p className="text-[10px] text-blue-400 font-medium truncate">
                {currentUser?.roleName || currentUser?.role || 'Seleccionar Rol'}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
            RBAC
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Módulos del Sistema
        </div>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                  : 'text-slate-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status & Quick Reset */}
      <div className="p-4 border-t border-slate-800 bg-navy-900/95 space-y-2.5">
        {/* IA Badge */}
        <div className="p-2.5 rounded-lg bg-navy-800/80 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 font-medium">Motor de IA:</span>
            {isAiLive ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Gemini Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                <ShieldCheck className="w-3 h-3" /> Heurístico Local
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {isAiLive 
              ? 'Conectado con minimización de PII.' 
              : 'Modo demostrativo con lógica procesal colombiana.'}
          </p>
        </div>

        {/* Reset Database Button */}
        <button
          onClick={onResetDb}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
          title="Restablece expedientes y actuaciones a los datos semilla ficticios"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Datos Demo</span>
        </button>

        <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-slate-400" />
          <span>Ley 1581 / Ley 2113 · Confidencialidad</span>
        </div>
      </div>
    </aside>
  );
};
