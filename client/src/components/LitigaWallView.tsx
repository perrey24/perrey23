import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  Building2, 
  Scale, 
  FileCheck, 
  ChevronRight,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import { JudicialStateItem } from '../types';
import { INITIAL_JUDICIAL_STATES, PORTFOLIOS } from '../services/judicialStates';

interface LitigaWallViewProps {
  onNavigateToDrafts?: (caseNumber?: string, caseTitle?: string) => void;
  onSelectCase?: (caseId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LitigaWallView: React.FC<LitigaWallViewProps> = ({
  onNavigateToDrafts,
  onSelectCase,
  onShowToast
}) => {
  const [states, setStates] = useState<JudicialStateItem[]>(INITIAL_JUDICIAL_STATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'today' | 'starred'>('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState('centauros');
  const [selectedStateModal, setSelectedStateModal] = useState<JudicialStateItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filtrado reactivo
  const filteredStates = useMemo(() => {
    return states.filter(st => {
      const matchesSearch = 
        !searchTerm.trim() ||
        st.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.processTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.actType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.summary.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'critical') return st.urgency === 'critico' || st.daysRemaining <= 5;
      if (activeFilter === 'today') return st.stateDate === '2026-10-30';
      if (activeFilter === 'starred') return !!st.starred;

      return true;
    });
  }, [states, searchTerm, activeFilter]);

  // Copiar radicado al portapapeles
  const handleCopyRadicado = (radicado: string, id: string) => {
    navigator.clipboard.writeText(radicado);
    setCopiedId(id);
    onShowToast(`Radicado copiado: ${radicado}`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Simular sincronización en tiempo real con Rama Judicial
  const handleSyncStates = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onShowToast('Sincronización completada: 14 despachos judiciales consultados. Todos los estados al día.', 'success');
    }, 1200);
  };

  // Alternar favorito/estrella
  const toggleStar = (id: string) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, starred: !s.starred } : s));
  };

  // Alternar leído
  const toggleRead = (id: string) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, isRead: !s.isRead } : s));
  };

  const criticalCount = states.filter(s => s.urgency === 'critico' || s.daysRemaining <= 5).length;
  const todayCount = states.filter(s => s.stateDate === '2026-10-30').length;
  const starredCount = states.filter(s => !!s.starred).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Litiga Header Card & Portfolio Indicator */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-navy-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Vigilancia Judicial Activa · Litiga Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Rama Judicial · SAMAI · TYBA
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Muro de Estados & Novedades Procesales
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Monitoreo y extracción automatizada de Estados Electrónicos, providencias y traslados de lista publicados a las 8:00 AM en los despachos judiciales de Colombia.
            </p>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Portfolio Selector */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
              <Building2 className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Portafolio en Monitoreo:</p>
                <select 
                  value={selectedPortfolio}
                  onChange={e => setSelectedPortfolio(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {PORTFOLIOS.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} ({p.nit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSyncStates}
              disabled={isSyncing}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center gap-2 transition-all ${
                isSyncing 
                  ? 'bg-blue-700 opacity-80 cursor-wait' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Estados'}</span>
            </button>

            {/* Direct Official Portal */}
            <a
              href="https://consultaprocesos.ramajudicial.gov.co/Procesos/NumeroRadicacion"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Abrir Consulta Procesos oficial de la Rama Judicial"
            >
              <span>Rama Judicial</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Sync Info Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cómputo hábil CGP Art. 118 / Ley Emiliani 51 de 1983</span>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">Última captura: Hoy, 08:00:15 AM</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] border border-blue-500/30">
              5 Estados Registrados
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[11px] border border-rose-500/30">
              {criticalCount} en Término Crítico
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por radicado de 23 dígitos, título del caso, despacho o actuación..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 font-sans"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({states.length})
          </button>

          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              activeFilter === 'critical'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Términos Críticos ({criticalCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'today'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Estados de Hoy ({todayCount})
          </button>

          <button
            onClick={() => setActiveFilter('starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              activeFilter === 'starred'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Destacados ({starredCount})</span>
          </button>
        </div>
      </div>

      {/* State Items Feed */}
      <div className="space-y-4">
        {filteredStates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">No se encontraron estados judiciales</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Intente ajustar el criterio de búsqueda o cambie la pestaña de filtros.
            </p>
          </div>
        ) : (
          filteredStates.map(item => {
            const isCritical = item.urgency === 'critico' || item.daysRemaining <= 5;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-all p-5 hover:shadow-md ${
                  !item.isRead ? 'border-l-4 border-l-blue-600' : 'border-slate-200'
                } ${isCritical ? 'border-rose-300 bg-gradient-to-r from-rose-50/20 via-white to-white' : ''}`}
              >
                {/* Header row: Radicado + Badges + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Radicado 23 dígitos */}
                    <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 font-mono text-xs font-bold text-slate-800 transition-colors">
                      <Scale className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.caseNumber}</span>
                      <button
                        onClick={() => handleCopyRadicado(item.caseNumber, item.id)}
                        className="ml-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Copiar radicado de 23 dígitos"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Source Badge */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {item.source}
                    </span>

                    {/* State Number */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {item.stateNumber}
                    </span>

                    {/* Company Tag */}
                    {item.company && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{item.company}</span>
                      </span>
                    )}
                  </div>

                  {/* Actions & Star */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => toggleStar(item.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.starred 
                          ? 'bg-amber-50 text-amber-600 border-amber-200' 
                          : 'text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-100'
                      }`}
                      title={item.starred ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => toggleRead(item.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                    >
                      {item.isRead ? 'Marcar no leído' : 'Marcar leído'}
                    </button>
                  </div>
                </div>

                {/* Body: Despacho + Process Title + Act Type */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">
                  {/* Left Column: Process & Despacho */}
                  <div className="lg:col-span-2 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" />
                      </div>
                      <div>
                        <h3 
                          onClick={() => onSelectCase && onSelectCase(item.caseId)}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {item.processTitle}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.authority}</span>
                        </p>
                      </div>
                    </div>

                    {/* Act Type Banner */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.actType}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.notebook}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Term Computation Box (Litiga Engine) */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isCritical 
                      ? 'bg-rose-50/70 border-rose-200' 
                      : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Cómputo Procesal</span>
                        </span>
                        {isCritical && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                            <Flame className="w-3 h-3" />
                            <span>¡Crítico!</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Publicación Estado:</span>
                          <span className="font-semibold text-slate-800">{item.stateDate} (08:00 AM)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Inicio de Término:</span>
                          <span className="font-semibold text-slate-800">{item.termStartDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Fecha Límite:</span>
                          <span className="font-bold text-rose-700">{item.termEndDate}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200/80">
                          <span className="text-slate-600 font-medium">Días Hábiles:</span>
                          <span className={`font-extrabold ${isCritical ? 'text-rose-700' : 'text-slate-800'}`}>
                            {item.daysRemaining} {item.daysRemaining === 1 ? 'día hábil' : 'días hábiles'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Term Rule note */}
                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{item.termType}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedStateModal(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ver Providencia Completa</span>
                    </button>

                    {onNavigateToDrafts && (
                      <button
                        onClick={() => onNavigateToDrafts(item.caseNumber, item.processTitle)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Generar Memorial en Respuesta</span>
                      </button>
                    )}
                  </div>

                  <a
                    href="https://consultaprocesos.ramajudicial.gov.co/Procesos/NumeroRadicacion"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <span>Consultar en Portal Judicial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Detalle de Providencia Oficial */}
      {selectedStateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedStateModal.stateNumber} · Rama Judicial
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {selectedStateModal.actType}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Radicado: {selectedStateModal.caseNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedStateModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-800">{selectedStateModal.authority}</p>
                <p className="text-slate-600">{selectedStateModal.processTitle}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cuaderno: <strong>{selectedStateModal.notebook}</strong> | Fecha Fijación: <strong>{selectedStateModal.stateDate} (08:00 AM)</strong>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Texto Resolutivo / Decisión Judicial:
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-300 font-serif text-slate-800 leading-relaxed text-sm shadow-inner whitespace-pre-line">
                  {selectedStateModal.fullDecision || selectedStateModal.summary}
                </div>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900">
                <h5 className="font-bold flex items-center gap-1.5 text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Control de Términos (Código General del Proceso Art. 118)</span>
                </h5>
                <p className="text-[11px] text-amber-800">
                  La providencia notificada por estado empieza a correr a partir del día hábil siguiente a la fijación ({selectedStateModal.termStartDate}). 
                  Fecha de vencimiento: <strong>{selectedStateModal.termEndDate}</strong>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
              <button
                onClick={() => handleCopyRadicado(selectedStateModal.caseNumber, selectedStateModal.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Radicado</span>
              </button>

              <div className="flex items-center gap-2">
                {onNavigateToDrafts && (
                  <button
                    onClick={() => {
                      const st = selectedStateModal;
                      setSelectedStateModal(null);
                      onNavigateToDrafts(st.caseNumber, st.processTitle);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Redactar Memorial</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedStateModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
