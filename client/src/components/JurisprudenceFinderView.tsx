import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Search, 
  GitFork, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Building2, 
  Calendar, 
  User, 
  Copy, 
  FileText, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  Briefcase, 
  Check, 
  Filter,
  Layers,
  Milestone
} from 'lucide-react';
import { JurisprudenceLine, JurisprudenceRuling, LegalCase, PrecedentRole } from '../types';
import { JURISPRUDENCE_LINES } from '../data/jurisprudenceLinesData';

interface JurisprudenceFinderViewProps {
  cases: LegalCase[];
  onNavigateToDrafts?: (precedentText: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ROLE_BADGES: Record<PrecedentRole, { label: string; bg: string; text: string; border: string; iconBg: string }> = {
  HITO_FUNDADORA: {
    label: 'Sentencia Hito Fundadora',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    iconBg: 'bg-amber-600 text-white'
  },
  MODIFICADORA: {
    label: 'Giro Jurisprudencial (Modificadora)',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    iconBg: 'bg-indigo-600 text-white'
  },
  CONSOLIDADORA: {
    label: 'Sentencia Consolidadora',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    iconBg: 'bg-emerald-600 text-white'
  },
  VIGENTE_ARQUIMEDES: {
    label: 'Doctrina Vigente de la Corte',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-400',
    iconBg: 'bg-blue-600 text-white'
  }
};

export const JurisprudenceFinderView: React.FC<JurisprudenceFinderViewProps> = ({
  cases,
  onNavigateToDrafts,
  onShowToast
}) => {
  // Línea seleccionada por defecto
  const [selectedLineId, setSelectedLineId] = useState<string>(JURISPRUDENCE_LINES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<string>('ALL');

  // Providencia seleccionada para modal de detalle
  const [activeRuling, setActiveRuling] = useState<JurisprudenceRuling | null>(null);

  // Conector de Casos del Despacho
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [customFactualQuery, setCustomFactualQuery] = useState<string>('');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [linkedCaseFeedback, setLinkedCaseFeedback] = useState<boolean>(false);

  // Obtener línea activa
  const activeLine = useMemo(() => {
    return JURISPRUDENCE_LINES.find(l => l.id === selectedLineId) || JURISPRUDENCE_LINES[0];
  }, [selectedLineId]);

  // Filtrado de líneas
  const filteredLines = useMemo(() => {
    return JURISPRUDENCE_LINES.filter(line => {
      const matchesSearch = !searchQuery.trim() || (
        line.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.legalProblem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        line.rulings.some(r => 
          r.rulingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.magistrate.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.keyHolding.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

      const matchesCourt = selectedCourtFilter === 'ALL' || line.court.toLowerCase().includes(selectedCourtFilter.toLowerCase());

      return matchesSearch && matchesCourt;
    });
  }, [searchQuery, selectedCourtFilter]);

  // Caso actualmente seleccionado en el conector fáctico
  const selectedCase = useMemo(() => {
    return cases.find(c => c.id === selectedCaseId);
  }, [cases, selectedCaseId]);

  // Copiar cita al portapapeles
  const handleCopyRulingCitation = (ruling: JurisprudenceRuling) => {
    const citation = `${ruling.court}, ${ruling.rulingRef}, M.P. ${ruling.magistrate}, Fecha: ${ruling.date}. Extracto vinculante:\n«${ruling.extractExcerpt}»`;
    navigator.clipboard.writeText(citation);
    onShowToast(`Cita de ${ruling.rulingRef} copiada al portapapeles.`, 'success');
  };

  // Inyectar en borrador de Word
  const handleInjectInDraft = (ruling: JurisprudenceRuling, scenarioNote?: string) => {
    const textToInsert = `\n\nFUNDAMENTO JURISPRUDENCIAL VINCULANTE:\n\nConforme a la doctrina sentada por la ${ruling.court} en ${ruling.rulingRef} (M.P. ${ruling.magistrate}):\n\n«${ruling.extractExcerpt}»\n\n${
      scenarioNote ? `APLICACIÓN AL CASO CONCRETO:\n${scenarioNote}\n` : ''
    }`;

    if (onNavigateToDrafts) {
      onNavigateToDrafts(textToInsert);
      onShowToast(`Precedente ${ruling.rulingRef} transferido al redactor de Word.`, 'success');
    } else {
      navigator.clipboard.writeText(textToInsert);
      onShowToast(`Precedente ${ruling.rulingRef} copiado para insertar en memorial.`, 'success');
    }
  };

  // Vincular línea al caso activo
  const handleLinkLineToCase = () => {
    if (!selectedCase) {
      onShowToast('Seleccione un expediente activo para vincular el precedente.', 'error');
      return;
    }
    setLinkedCaseFeedback(true);
    onShowToast(`Línea "${activeLine.topic}" vinculada con éxito a la estrategia del caso ${selectedCase.caseNumber}.`, 'success');
    setTimeout(() => setLinkedCaseFeedback(false), 2500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* ===================================================================== */}
      {/* 1. HERO HEADER: METODOLOGÍA DE LÍNEA JURISPRUDENCIAL                  */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-400" /> Líneas Jurisprudenciales & Precedente Vinculante
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Doctrina de las Altas Cortes · Metodología Genealógica
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Buscador de Jurisprudencia: De la Sentencia Hito a tu Caso</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Rastree la evolución histórica y el balance constitucional del precedente judicial. 
            Conecte desde la <strong>Sentencia Hito Fundadora</strong>, pasando por los <strong>Giros Doctrinales</strong> y las 
            <strong> Sentencias Consolidadoras</strong>, hasta la <strong>Doctrina Vigente</strong> de la Corte, para conocer con exactitud 
            qué han resuelto los altos tribunales ante las situaciones fácticas específicas de sus casos.
          </p>
        </div>

        {/* Resumen de los 4 Eslabones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="font-semibold">Sentencia Hito Fundadora</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-300">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-[10px] font-bold">2</span>
            <span className="font-semibold">Giro / Modificadora</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[10px] font-bold">3</span>
            <span className="font-semibold">Consolidadora / Carga</span>
          </div>
          <div className="flex items-center gap-2 text-blue-300">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-[10px] font-bold">4</span>
            <span className="font-semibold">Doctrina Vigente Hoy</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. BARRA DE BÚSQUEDA Y SELECTOR DE LÍNEAS TEMÁTICAS                  */}
      {/* ===================================================================== */}
      <div className="space-y-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por problema jurídico, providencia (ej. C-590, SL-4112, desacato), magistrado o regla..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCourtFilter}
              onChange={(e) => setSelectedCourtFilter(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todas las Corporaciones</option>
              <option value="Corte Constitucional">Corte Constitucional</option>
              <option value="Corte Suprema">Corte Suprema de Justicia</option>
              <option value="Consejo de Estado">Consejo de Estado</option>
            </select>
          </div>
        </div>

        {/* Carrusel Horizontal de Líneas Disponibles */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {filteredLines.map(line => {
            const isSelected = line.id === selectedLineId;
            return (
              <button
                key={line.id}
                onClick={() => {
                  setSelectedLineId(line.id);
                  setSelectedScenarioIndex(0);
                }}
                className={`px-4 py-2.5 rounded-xl text-left transition-all shrink-0 border flex flex-col gap-1 max-w-[280px] ${
                  isSelected
                    ? 'bg-indigo-900 text-white border-indigo-700 shadow-md shadow-indigo-900/20 ring-2 ring-indigo-500/40'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className={isSelected ? 'text-indigo-300' : 'text-slate-500'}>
                    {line.legalArea}
                  </span>
                  <span className={isSelected ? 'text-indigo-200' : 'text-slate-400 font-mono'}>
                    {line.rulings.length} Hitos
                  </span>
                </div>
                <h4 className="text-xs font-bold line-clamp-1">
                  {line.topic}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. PROBLEMA JURÍDICO CENTRAL DE LA LÍNEA SELECCIONADA                */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-700 font-bold uppercase tracking-wider">
              <GitFork className="w-3.5 h-3.5" />
              <span>Línea Jurisprudencial en Estudio</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-normal">{activeLine.court}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {activeLine.topic}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLinkLineToCase}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300 flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Vincular al Caso Activo</span>
            </button>
          </div>
        </div>

        {/* El Problema Jurídico Central */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Problema Jurídico Constitucional / Legal</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 italic leading-relaxed">
            «{activeLine.legalProblem}»
          </p>
        </div>

        {/* Síntesis Doctrinal Vigente */}
        <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
            Doctrina y Balance Jurisprudencial Consolidado:
          </span>
          <p>{activeLine.summaryDoctrine}</p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. ÁRBOL GENEALÓGICO CONECTADO: DE LA SENTENCIA HITO A LA VIGENTE    */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Milestone className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Genealogía del Precedente: Cadena de Providencias Conectadas
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {activeLine.rulings[0].rulingRef} ➔ {activeLine.rulings[activeLine.rulings.length - 1].rulingRef}
          </span>
        </div>

        {/* Tarjetas Conectadas de la Línea en Secuencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {activeLine.rulings.map((ruling, idx) => {
            const roleStyle = ROLE_BADGES[ruling.role] || ROLE_BADGES.HITO_FUNDADORA;
            const isLast = idx === activeLine.rulings.length - 1;

            return (
              <div
                key={ruling.id}
                className={`bg-white rounded-2xl border ${roleStyle.border} p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group ${
                  ruling.role === 'VIGENTE_ARQUIMEDES' ? 'ring-2 ring-blue-500/30' : ''
                }`}
              >
                {/* Conector de flecha entre tarjetas en pantallas grandes */}
                {!isLast && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-100 border border-slate-300 items-center justify-center text-slate-500 shadow-sm">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="space-y-3">
                  {/* Badge de Rol en la Línea */}
                  <div className="flex items-start justify-between gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.iconBg}`} />
                      {roleStyle.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Referencia de la Sentencia y Fecha */}
                  <div>
                    <h4 
                      onClick={() => setActiveRuling(ruling)}
                      className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition-colors"
                      title={ruling.rulingRef}
                    >
                      {ruling.rulingRef}
                    </h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="font-mono">{ruling.date}</span>
                      <span className="text-slate-300">·</span>
                      <span className="truncate" title={ruling.magistrate}>{ruling.magistrate}</span>
                    </div>
                  </div>

                  {/* Descriptor / Giro */}
                  <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-snug">
                    <span className="font-semibold text-slate-800 block mb-0.5">Descriptor de Relatoría:</span>
                    <p className="line-clamp-3 text-slate-600">{ruling.thematicDescriptor}</p>
                  </div>

                  {/* Ratio Decidendi */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Regla Jurídica Sentada:</span>
                    <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                      {ruling.keyHolding}
                    </p>
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveRuling(ruling)}
                    className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-200 text-center"
                  >
                    Ver Cita Completa
                  </button>

                  <button
                    onClick={() => handleCopyRulingCitation(ruling)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
                    title="Copiar cita formal"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. MÓDULO CENTRAL: "¿QUÉ HA DICHO LA CORTE EN TU CASO?"              */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/40 rounded-2xl p-6 shadow-sm border border-indigo-200 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-400" /> Analizador Conector al Caso
              </span>
              <span className="text-xs text-indigo-900 font-semibold">
                Contrastación Fáctica Directa
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              ¿Qué ha dicho la Corte en determinado caso concreto?
            </h3>
            <p className="text-xs text-slate-600">
              Seleccione un expediente de su firma o elija la hipótesis procesal correspondiente para conocer la sub-regla vinculante de la Corte.
            </p>
          </div>

          {/* Selector de Casos del Despacho */}
          <div className="flex items-center gap-2 shrink-0">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="text-xs font-semibold border border-indigo-200 rounded-xl px-3 py-2 bg-white text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none max-w-xs"
            >
              <option value="">Seleccione expediente de su despacho...</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title.substring(0, 35)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen del Caso Seleccionado si existe */}
        {selectedCase && (
          <div className="bg-white p-3.5 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{selectedCase.caseNumber}</span>
                <span className="text-indigo-600 font-semibold">({selectedCase.procedureType})</span>
              </div>
              <p className="text-slate-600 line-clamp-1">{selectedCase.title}</p>
            </div>
            <button
              onClick={handleLinkLineToCase}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-xs flex items-center gap-1"
            >
              {linkedCaseFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Precedente Vinculado!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Vincular a Estrategia</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Selector de Situaciones Fácticas / Supuestos Procesales */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            1. Elija el Supuesto Fáctico o Hipótesis de su Caso:
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeLine.caseApplications.map((app, index) => {
              const isSelected = selectedScenarioIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedScenarioIndex(index)}
                  className={`p-4 rounded-xl text-left transition-all border text-xs flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white/80 border-slate-200 hover:bg-white text-slate-600'
                  }`}
                >
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      isSelected ? 'text-indigo-600' : 'text-slate-400'
                    }`}>
                      Escenario #{index + 1}
                    </span>
                    <p className="font-semibold text-slate-800 leading-snug">
                      {app.scenario}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                    <span>Ver qué resolvió la Corte</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Respuesta de la Corte para el Escenario Elegido */}
        {activeLine.caseApplications[selectedScenarioIndex] && (
          <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm space-y-5 animate-in fade-in">
            
            {/* Header del Escenario */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Dictamen de la Corte para el Escenario #{selectedScenarioIndex + 1}:
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeLine.caseApplications[selectedScenarioIndex].scenario}
                </h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleInjectInDraft(
                    activeLine.rulings[activeLine.rulings.length - 1],
                    activeLine.caseApplications[selectedScenarioIndex].courtHoldingForCase
                  )}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inyectar en Borrador Word</span>
                </button>
              </div>
            </div>

            {/* Qué ha dicho la Corte */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                <span>¿Qué dice la Corte para este caso concreto?</span>
              </h5>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs text-slate-800 leading-relaxed font-serif italic">
                {activeLine.caseApplications[selectedScenarioIndex].courtHoldingForCase}
              </div>
            </div>

            {/* Cuadrícula de Guía Litigiosa: Acción Recomendada, Precedentes y Alerta de Error */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Acción Litigiosa */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-[11px] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Vía Procesal Sugerida</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {activeLine.caseApplications[selectedScenarioIndex].recommendedLegalAction}
                </p>
              </div>

              {/* Precedentes a Citar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[11px] uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Precedentes Clave a Invocar</span>
                </div>
                <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
                  {activeLine.caseApplications[selectedScenarioIndex].precedentToCite}
                </p>
              </div>

              {/* Alerta de Error Fatal */}
              <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Error Fatal a Evitar (Pitfall)</span>
                </div>
                <p className="text-rose-900 leading-relaxed">
                  {activeLine.caseApplications[selectedScenarioIndex].pitfallWarning}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 6. MODAL DE PROVIDENCIA: DETALLE TEXTUAL Y RATIO DECIDENDI           */}
      {/* ===================================================================== */}
      {activeRuling && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header del Modal */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between gap-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    {activeRuling.court}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{activeRuling.date}</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {activeRuling.rulingRef}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Magistrado Ponente: {activeRuling.magistrate}
                </p>
              </div>
              <button
                onClick={() => setActiveRuling(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center font-bold text-sm shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1">
              
              {/* Contexto Fáctico */}
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Contexto Procesal:</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {activeRuling.factsContext}
                </p>
              </div>

              {/* Ratio Decidendi */}
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Ratio Decidendi / Regla Jurídica:</span>
                <p className="text-slate-800 font-semibold leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  {activeRuling.keyHolding}
                </p>
              </div>

              {/* Párrafo Textual para Citar */}
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Extracto Textual Oficial para Memoriales:</span>
                <div className="text-slate-700 font-serif italic leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 border-l-4 border-l-indigo-600">
                  {activeRuling.extractExcerpt}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <a
                href={activeRuling.relatoriaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <span>Ver en Relatoría Oficial</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyRulingCitation(activeRuling)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Cita</span>
                </button>

                <button
                  onClick={() => {
                    handleInjectInDraft(activeRuling);
                    setActiveRuling(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inyectar en Borrador (Word)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
