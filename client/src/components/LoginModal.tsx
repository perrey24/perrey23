import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  UserRole 
} from '../types';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Briefcase, 
  ClipboardList, 
  Mail, 
  LogOut, 
  Check, 
  X,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogoutSuccess: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEMO_ACCOUNTS: Array<{
  email: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  description: string;
  icon: any;
  color: string;
}> = [
  {
    email: 'estudiante@demo.local',
    name: 'Valeria Morales',
    role: 'STUDENT',
    roleLabel: 'Estudiante en Práctica',
    description: 'Casos asignados, actuaciones y redacción de borradores supervisados.',
    icon: GraduationCap,
    color: 'emerald'
  },
  {
    email: 'supervision@demo.local',
    name: 'Dr. Andrés Gómez',
    role: 'SUPERVISOR',
    roleLabel: 'Docente Supervisor',
    description: 'Aprobación de expedientes, convalidación procesal y términos.',
    icon: UserCheck,
    color: 'blue'
  },
  {
    email: 'coordinacion@demo.local',
    name: 'Dra. Camila Restrepo',
    role: 'DIRECTOR',
    roleLabel: 'Directora de Consultorio',
    description: 'Supervisión integral, gobernanza, bitácora y analítica del despacho.',
    icon: Briefcase,
    color: 'purple'
  },
  {
    email: 'recepcion@demo.local',
    name: 'Felipe Hernández',
    role: 'INTAKE',
    roleLabel: 'Recepción y Admisión',
    description: 'Registro inicial de usuarios y autorización de Habeas Data.',
    icon: ClipboardList,
    color: 'amber'
  }
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogoutSuccess,
  onShowToast
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAccountName, setSelectedAccountName] = useState<string | null>(null);
  
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (!email && DEMO_ACCOUNTS.length > 0) {
        setEmail(DEMO_ACCOUNTS[0].email);
        setSelectedAccountName(DEMO_ACCOUNTS[0].name);
      }
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setSelectedAccountName(acc.name);
    setPassword('');
    setErrorMessage(null);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor ingrese o seleccione su correo electrónico.');
      return;
    }

    if (!password) {
      setErrorMessage('La contraseña es obligatoria. Por seguridad, no se permite el acceso sin contraseña.');
      passwordInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const res = await api.login(email.trim(), password);
      onLoginSuccess(res.user);
      onShowToast(`Acceso concedido: Bienvenido(a), ${res.user.name} (${res.user.roleName || res.user.role})`);
      setPassword('');
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Contraseña incorrecta o credenciales inválidas.';
      setErrorMessage(msg);
      onShowToast(msg, 'error');
      setPassword('');
      passwordInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await api.logout();
      onLogoutSuccess();
      onShowToast('Sesión finalizada exitosamente.', 'info');
      onClose();
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0D111C] text-slate-100 rounded-3xl shadow-2xl border border-slate-800/90 max-w-xl w-full p-7 animate-in fade-in zoom-in-95 overflow-hidden relative">
        
        {/* Glow de fondo decorativo estilo Apple Pro */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Acceso Seguro a GlobalLegal CO
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  RBAC
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Identificación de usuario y contraseña obligatoria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estado actual de la sesión (si existe) */}
        {currentUser && (
          <div className="my-4 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Sesión activa actualmente:</p>
              <p className="text-sm font-bold text-white">{currentUser.name}</p>
              <p className="text-xs text-blue-400 font-medium">{currentUser.email} · {currentUser.roleName || currentUser.role}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* Selección de Cuenta o Perfil */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Seleccione Perfil o Ingrese su Correo
            </h4>
            <span className="text-[11px] text-blue-400 font-mono">Clave demo: Demo123!</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map(acc => {
              const Icon = acc.icon;
              const isSelected = email === acc.email;
              return (
                <button
                  type="button"
                  key={acc.email}
                  disabled={loading}
                  onClick={() => handleSelectAccount(acc)}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500 shadow-md shadow-blue-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded-lg ${
                        acc.color === 'purple' ? 'bg-purple-950 text-purple-400 border border-purple-800/50' :
                        acc.color === 'blue' ? 'bg-blue-950 text-blue-400 border border-blue-800/50' :
                        acc.color === 'emerald' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                        'bg-amber-950 text-amber-400 border border-amber-800/50'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-[11px] text-white truncate">{acc.roleLabel}</span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-200 truncate">{acc.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario de Autenticación con Contraseña Obligatoria */}
        <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico Institucional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="ejemplo@demo.local o usuario institucional"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-900/90 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Contraseña de Acceso <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Requerida para autorizar ingreso
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Introduzca su contraseña..."
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-900/90 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mensaje de error visible si la contraseña no fue ingresada o es incorrecta */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !password || !email}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verificando Credenciales...' : 'Validar Contraseña e Ingresar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Cifrado con Scrypt / AES-256
          </span>
          <span>Ley 1581 de 2012 & 2113 de 2021</span>
        </div>

      </div>
    </div>
  );
};
