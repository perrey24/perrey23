import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Bot, 
  CalendarClock, 
  FileText, 
  BarChart3, 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Lock, 
  Building2, 
  ChevronRight, 
  Kanban,
  FileCheck, 
  Zap, 
  Layers,
  Globe,
  Monitor,
  Laptop
} from 'lucide-react';

interface LandingViewProps {
  onEnterApp: (targetView?: string) => void;
  onOpenLoginModal?: () => void;
  urgentActionsCount?: number;
}

export const LandingView: React.FC<LandingViewProps> = ({ 
  onEnterApp, 
  onOpenLoginModal,
  urgentActionsCount = 0 
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'vigilancia' | 'lemonsuite' | 'word_drafts' | 'copilot'>('vigilancia');

  const features = [
    {
      id: 'vigilancia',
      icon: Radio,
      title: 'Muro de Estados & Vigilancia',
      badge: 'En tiempo real',
      description: 'Monitoreo diario y automatizado de traslados, autos y providencias en la Rama Judicial (SAMAI, TYBA, Justicia XXI).',
      target: 'litiga_wall',
      highlights: ['Integración con portales judiciales', 'Alertas tempranas de notificación', 'Seguimiento por expediente o NIT']
    },
    {
      id: 'lemonsuite',
      icon: Kanban,
      title: 'Proyectos & Tareas (LemonSuite)',
      badge: 'Metodología Ágil',
      description: 'Gestión de litigios por fases procesales, tablero Kanban interactivo, control de horas (time-tracking) y prevención de caducidades.',
      target: 'projects',
      highlights: ['Tablero Kanban por etapas', 'Control de tiempo legal por abogado', 'Presupuestos de horas por caso']
    },
    {
      id: 'borradores',
      icon: FileText,
      title: 'Generador de Borradores Tipo Word',
      badge: 'Lienzo Libre',
      description: 'Redacción sin restricciones en una hoja con la estética de Microsoft Word, inserción de cláusulas en 1 clic y exportación .doc / PDF.',
      target: 'drafts',
      highlights: ['Hoja de papel Word en pantalla', 'Descarga .doc compatible con Word', 'Cláusulas procesales preconfiguradas']
    },
    {
      id: 'asistente',
      icon: Bot,
      title: 'Asistente Jurídico IA Copilot',
      badge: 'IA Especializada',
      description: 'Estrategia procesal predictiva basada en normatividad colombiana, análisis de hechos, identificación de riesgos y precedentes.',
      target: 'ai_assistant',
      highlights: ['Soporte en CGP, CPACA y Tutela', 'Cuestionarios para audiencias', 'Catálogo normativo verificado']
    },
    {
      id: 'terminos',
      icon: CalendarClock,
      title: 'Control de Términos Procesales',
      badge: 'Cálculo Riguroso',
      description: 'Diferenciación estricta entre días calendario y términos procesales en días hábiles judiciales con suspensión de términos y festivos.',
      target: 'calendar',
      highlights: ['Alertas por semáforo de criticidad', 'Cálculo auditado y verificable', 'Prevención de caducidades']
    },
    {
      id: 'documental',
      icon: FileCheck,
      title: 'Expedientes & Cadena Documental',
      badge: 'Trazabilidad',
      description: 'Archivo digital organizado por radicado único, partes procesales, estados de revisión y validación estricta de documentos.',
      target: 'documents',
      highlights: ['Búsqueda instantánea de piezas procesales', 'Clasificación probatoria', 'Respaldo seguro']
    },
    {
      id: 'analitica',
      icon: BarChart3,
      title: 'Analítica Jurídica & Gobierno',
      badge: 'KPIs en Vivo',
      description: 'Indicadores de carga de trabajo, distribución de casos por rama del derecho, tiempos de respuesta y registro inmutable de auditoría.',
      target: 'analytics',
      highlights: ['Reportes ejecutivos de gestión', 'Auditoría por usuario y rol', 'Visión gerencial del despacho']
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Luces y Efectos de Fondo Ambientales estilo Apple XDR Pro */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Glow Superior Central con gradiente estelar XDR */}
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-blue-600/30 via-cyan-500/10 to-transparent blur-[140px] rounded-full" />
        {/* Resplandor lateral azabache */}
        <div className="absolute top-[25%] -left-80 w-[700px] h-[700px] bg-indigo-900/15 blur-[160px] rounded-full" />
        <div className="absolute top-[55%] -right-80 w-[750px] h-[750px] bg-blue-700/15 blur-[160px] rounded-full" />
        {/* Malla de cuadrícula técnica micro-nítida */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* HEADER / BARRA DE NAVEGACIÓN SUPERIOR (Glassmorphism XDR) */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#000000]/75 border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo con efecto metálico */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onEnterApp('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#2563EB] p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <div className="w-full h-full bg-[#05070D] rounded-[15px] flex items-center justify-center border border-white/[0.08]">
                <Scale className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">GlobalLegal</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/40 font-semibold tracking-wider">
                  CO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Plataforma LegalTech</span>
            </div>
          </div>

          {/* Menú de Enlaces */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#soluciones" className="hover:text-blue-400 transition-colors">Soluciones</a>
            <a href="#lemonsuite" className="hover:text-blue-400 transition-colors">LemonSuite</a>
            <a href="#macbook" className="hover:text-blue-400 transition-colors">Entorno XDR</a>
            <a href="#normativa" className="hover:text-blue-400 transition-colors">Seguridad & Ley 2213</a>
          </nav>

          {/* CTAs de Entrada */}
          <div className="flex items-center gap-3">
            {onOpenLoginModal && (
              <button 
                onClick={onOpenLoginModal}
                className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-all border border-white/[0.08]"
              >
                Ingresar con Contraseña
              </button>
            )}
            <button
              onClick={() => onEnterApp('dashboard')}
              className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white text-xs font-bold shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 border border-blue-400/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                Acceder a la Suite
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Estilo Apple MacBook Pro Liquid Retina XDR) */}
      <section className="relative z-10 pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Badge Flotante Superior Estilo Apple XDR */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] text-slate-200 text-xs font-medium mb-8 backdrop-blur-xl shadow-inner shadow-white/5 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pantalla LegalTech XDR · Precisión Procesal Colombia</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
        </div>

        {/* Titular Monumental Estilo Apple */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl leading-[1.08] mb-6">
          Potencia judicial pro.{' '}
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Control de litigio sin límites.
          </span>
        </h1>

        {/* Subtítulo Descriptivo */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl font-normal leading-relaxed mb-10">
          Diseñado para abogados, firmas y consultorios jurídicos de alto rendimiento en Colombia. Vigilancia judicial en tiempo real, gestión de proyectos LemonSuite y redacción libre en lienzo Word.
        </p>

        {/* Botones de Acción Primarios */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20">
          <button
            onClick={() => onEnterApp('dashboard')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-bold text-sm shadow-2xl shadow-blue-600/40 hover:shadow-blue-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group border border-blue-400/40"
          >
            <span>Iniciar Sesión en la Plataforma</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => onEnterApp('projects')}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm border border-white/[0.12] hover:border-white/[0.2] transition-all flex items-center justify-center gap-2 group backdrop-blur-xl"
          >
            <Kanban className="w-4 h-4 text-purple-400" />
            <span>Ver Tablero LemonSuite</span>
          </button>

          <button
            onClick={() => onEnterApp('drafts')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white font-semibold text-sm border border-white/[0.08] hover:border-white/[0.15] transition-all flex items-center justify-center gap-2 group"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Lienzo Word Legal</span>
          </button>
        </div>

        {/* MOCKUP MACBOOK PRO CON PANTALLA LIQUID RETINA XDR */}
        <div id="macbook" className="w-full max-w-5xl relative group">
          
          {/* Resplandor ambiental de la pantalla XDR hacia afuera */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-purple-600/20 blur-3xl opacity-75 group-hover:opacity-100 transition-opacity rounded-[40px] pointer-events-none" />

          {/* Carcasa Superior de la Pantalla MacBook Pro (Chasis Aluminio Negro Espacial) */}
          <div className="relative rounded-[28px] p-3 sm:p-4 bg-[#14161D] border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
            
            {/* Notch / Cámara Superior del MacBook Pro */}
            <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-b-xl border-x border-b border-white/[0.08] z-30 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>

            {/* Pantalla Liquid Retina XDR (Bordes ultrafinos) */}
            <div className="rounded-[18px] bg-[#07090F] border border-white/[0.06] overflow-hidden text-left shadow-inner">
              
              {/* Barra de Ventana XDR */}
              <div className="px-4 py-3 bg-[#0B0D16] border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/90" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/90" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
                  <span className="ml-3 text-[11px] font-mono text-slate-400 hidden sm:inline">
                    globallegal.co · Retina XDR 1600 nits
                  </span>
                </div>
                
                {/* Selector de pestañas interactivas dentro del mockup */}
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.08] text-[11px]">
                  <button
                    onClick={() => setActivePreviewTab('vigilancia')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      activePreviewTab === 'vigilancia' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vigilancia SAMAI
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('lemonsuite')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      activePreviewTab === 'lemonsuite' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    LemonSuite Kanban
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('word_drafts')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      activePreviewTab === 'word_drafts' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hoja Word
                  </button>
                </div>
              </div>

              {/* Vista Dinámica dentro del MacBook Pro */}
              <div className="p-6 min-h-[320px] flex flex-col justify-between">
                {activePreviewTab === 'vigilancia' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Radar Judicial Activo
                      </span>
                      <h4 className="text-sm font-bold text-white">Centauros S.A.</h4>
                      <p className="text-xs text-slate-400 font-mono">NIT 900.841.230-1</p>
                      <p className="text-[11px] text-slate-300">12 procesos sincronizados con SAMAI y TYBA.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-amber-500/30 space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Traslado Notificado
                      </span>
                      <h4 className="text-sm font-bold text-white">Juzgado 15 Civil Circuito</h4>
                      <p className="text-[11px] text-slate-300">Auto corre traslado de excepciones. Vencimiento en 3 días hábiles.</p>
                      <span className="text-[10px] font-mono text-blue-400">Rad. 11001-31-03-015-2024-00412-00</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-purple-950/40 border border-blue-500/30 space-y-2">
                      <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Recomendación IA
                      </span>
                      <h4 className="text-sm font-bold text-white">Estrategia Probatoria</h4>
                      <p className="text-[11px] text-slate-300">Borrador con Sentencia SC-1234 de la Corte Suprema disponible en 1 clic.</p>
                      <button 
                        onClick={() => onEnterApp('drafts')}
                        className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
                      >
                        Abrir en Lienzo Word →
                      </button>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'lemonsuite' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Por Iniciar (3)</span>
                      <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-white/[0.06] text-xs">
                        <p className="font-bold text-white">Poder Especial & Anexos</p>
                        <p className="text-[10px] text-slate-400 mt-1">Expediente EXP-2026-004</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">En Trámite (5)</span>
                      <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-blue-400/30 text-xs">
                        <p className="font-bold text-white">Contestación de Demanda</p>
                        <p className="text-[10px] text-slate-400 mt-1">⏱ 3.5h registradas / 6h</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
                      <span className="text-[10px] font-bold text-purple-400 uppercase">En Revisión (2)</span>
                      <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-purple-400/30 text-xs">
                        <p className="font-bold text-white">Memorial de Apelación</p>
                        <p className="text-[10px] text-slate-400 mt-1">Revisor: Dr. Andrés Gómez</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Cumplido (14)</span>
                      <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-emerald-400/30 text-xs">
                        <p className="font-bold text-white">Radicación Vía TYBA</p>
                        <p className="text-[10px] text-emerald-400 mt-1">✓ Radicado con Acuse</p>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'word_drafts' && (
                  <div className="p-4 rounded-xl bg-white text-slate-900 border border-slate-300 shadow-xl max-w-xl mx-auto font-serif text-xs leading-relaxed space-y-2">
                    <div className="text-center border-b border-slate-200 pb-1 text-[9px] text-slate-500 uppercase tracking-widest font-sans">
                      REPÚBLICA DE COLOMBIA · RAMA JUDICIAL
                    </div>
                    <p className="font-bold text-center text-xs">ACCIÓN DE TUTELA - DERECHO FUNDAMENTAL A LA SALUD</p>
                    <p className="indent-4 text-[11px] text-slate-700">
                      SEÑOR JUEZ CONSTITUCIONAL: Dra. LAURA CAMILA SOTO, identificada con T.P. No. 284.990, actuando en representación de JORGE ELIÉCER GÓMEZ, acudo ante su despacho con fundamento en el artículo 86 de la Constitución Política...
                    </p>
                    <div className="pt-2 text-right">
                      <button 
                        onClick={() => onEnterApp('drafts')}
                        className="px-3 py-1 bg-blue-600 text-white rounded font-sans text-[10px] font-bold"
                      >
                        Abrir Editor Completo en la Suite
                      </button>
                    </div>
                  </div>
                )}

                {/* Barra de Estado inferior del Mockup */}
                <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Conexión Cifrada SSL · TLS 1.3</span>
                  <button 
                    onClick={() => onEnterApp('dashboard')}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 font-sans"
                  >
                    Entrar a la Plataforma Completa <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Base / Teclado del MacBook Pro (Chasis Inferior con Muesca de Apertura) */}
          <div className="relative mx-auto w-[103%] -mt-1 h-3.5 sm:h-4 bg-gradient-to-b from-[#1C1E26] to-[#0E1015] rounded-b-2xl border-t border-white/[0.1] shadow-2xl flex items-center justify-center">
            {/* Muesca de apertura central del MacBook Pro */}
            <div className="w-24 h-1.5 bg-[#0B0C10] rounded-b-md border-b border-white/[0.08]" />
          </div>

        </div>

      </section>

      {/* BARRA DE CIFRAS Y PRUEBA DE CONFIANZA */}
      <section className="relative z-10 border-y border-white/[0.08] bg-[#000000] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent font-mono tracking-tight">
              +3,900
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Despachos y Juzgados Monitoreados</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-b from-blue-400 to-indigo-300 bg-clip-text text-transparent font-mono tracking-tight">
              100%
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Cómputo Verificable (CGP & CPACA)</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-b from-cyan-400 to-emerald-300 bg-clip-text text-transparent font-mono tracking-tight">
              Ley 2213
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Conforme con Justicia Digital 2022</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-b from-purple-400 to-indigo-300 bg-clip-text text-transparent font-mono tracking-tight">
              LemonSuite
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Gestión de Proyectos & Time-Tracking</p>
          </div>

        </div>
      </section>

      {/* SECCIÓN DE PILARES DE LA SUITE (SOLUCIONES) */}
      <section id="soluciones" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Ecosistema Integral</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
            Tecnología diseñada para la exigencia del litigio colombiano
          </h2>
          <p className="text-slate-400 mt-4 text-base">
            Cada módulo ha sido construido para resolver fricciones procesales reales, reduciendo el riesgo de caducidades y elevando la calidad argumentativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                onClick={() => onEnterApp(item.target)}
                className="group relative rounded-3xl p-7 bg-[#0A0D16]/90 border border-white/[0.08] hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600/25 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800/50">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                  <span>Abrir módulo en la plataforma</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECCIÓN DE SEGURIDAD Y CUMPLIMIENTO NORMATIVO */}
      <section id="normativa" className="relative z-10 py-16 bg-[#04060A] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#0A0D16] border border-blue-800/40 relative overflow-hidden">
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-300 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Seguridad de Datos & Secreto Profesional</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Conformidad con el marco jurídico colombiano
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  GlobalLegal CO incorpora principios de privacidad desde el diseño (Privacy by Design), cumpliendo estrictamente con la <strong>Ley 1581 de 2012</strong> (Habeas Data), la <strong>Ley 527 de 1999</strong> (equivalencia funcional de mensajes de datos) y las directrices de la <strong>Ley 2213 de 2022</strong> para actuaciones y notificaciones procesales válidas.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/[0.1]">
                    <Lock className="w-3.5 h-3.5 text-blue-400" /> Cifrado en tránsito y reposo
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/[0.1]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Trazabilidad inmutable de auditoría
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/[0.1]">
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" /> Acreditación de términos y traslados
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
                <button
                  onClick={() => onEnterApp('dashboard')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group"
                >
                  <span>Entrar al Ecosistema</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[11px] text-slate-400 mt-2 text-center lg:text-right">
                  Autenticación con contraseña requerida
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER CORPORATIVO */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#000000] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Scale className="w-4 h-4 text-blue-100" />
            </div>
            <div>
              <span className="font-bold text-base text-white">GlobalLegal <span className="text-blue-400 font-mono text-xs">CO</span></span>
              <p className="text-xs text-slate-500">Tecnología LegalTech para Abogados en Colombia</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <button onClick={() => onEnterApp('sources')} className="hover:text-blue-400 transition-colors">
              Fuentes Oficiales SUIN
            </button>
            <button onClick={() => onEnterApp('governance')} className="hover:text-blue-400 transition-colors">
              Gobierno & Auditoría
            </button>
            <button onClick={() => onEnterApp('dashboard')} className="hover:text-blue-400 transition-colors font-semibold text-blue-400">
              Ir al Panel de Control →
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            © {new Date().getFullYear()} GlobalLegal CO. Todos los derechos reservados.
          </div>

        </div>
      </footer>

    </div>
  );
};
