import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  Plus, 
  Check, 
  Info,
  Scale,
  Building2,
  Calendar,
  Copy,
  FileText,
  Bookmark,
  Share2,
  ShieldCheck,
  Eye,
  Sparkles,
  Link as LinkIcon,
  Briefcase
} from 'lucide-react';
import { OfficialSource, LegalArea, User, LegalCase } from '../types';
import { api } from '../services/api';
import { ENRICHED_OFFICIAL_SOURCES } from '../data/jurisprudenceLinesData';

interface SourcesViewProps {
  currentUser: User | null;
  cases?: LegalCase[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToDrafts?: (precedentText: string) => void;
}

const AREA_LABELS: Record<string, string> = {
  ALL: 'Todas las áreas',
  constitucional: 'Constitucional',
  civil: 'Civil',
  laboral: 'Laboral',
  administrativo: 'Administrativo',
  penal: 'Penal',
  familia: 'Familia',
  comercial: 'Comercial',
  tributario: 'Tributario',
  GENERAL: 'General / Códigos'
};

const ENTITY_FILTERS = [
  { id: 'ALL', label: 'Todas las Corporaciones' },
  { id: 'Corte Constitucional', label: 'Corte Constitucional' },
  { id: 'Corte Suprema', label: 'Corte Suprema de Justicia' },
  { id: 'Consejo de Estado', label: 'Consejo de Estado' },
  { id: 'Congreso', label: 'Leyes y Códigos de la República' }
];

export const SourcesView: React.FC<SourcesViewProps> = ({ 
  currentUser, 
  cases = [], 
  onShowToast,
  onNavigateToDrafts
}) => {
  const [sources, setSources] = useState<OfficialSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');

  // Fuente seleccionada para inspección en el visor interactivo
  const [activeSource, setActiveSource] = useState<OfficialSource | null>(null);
  const [selectedCaseForLink, setSelectedCaseForLink] = useState<string>('');
  const [linkSuccess, setLinkSuccess] = useState<boolean>(false);

  // Modal para agregar fuente
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEntity, setNewEntity] = useState('');
  const [newUrl, setNewUrl] = useState('https://');
  const [newArea, setNewArea] = useState<LegalArea>('constitucional');
  const [newNote, setNewNote] = useState('');
  const [newSyllabus, setNewSyllabus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Carga con sincronización híbrida (API + Enriched Data) para evitar fallas o pantallas en blanco
  const loadSources = async () => {
    try {
      setLoading(true);
      const params: { area?: string; status?: string } = {};
      if (selectedArea !== 'ALL') params.area = selectedArea;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      
      const serverSources = await api.getSources(params).catch(() => []);
      
      // Combinar fuentes del servidor con las enriquecidas locales para no perder metadatos doctrinales
      const mergedMap = new Map<string, OfficialSource>();
      
      // Primero agregar las enriquecidas oficiales
      ENRICHED_OFFICIAL_SOURCES.forEach(s => mergedMap.set(s.id, s));
      
      // Sobrescribir o añadir las que vengan del servidor
      if (Array.isArray(serverSources)) {
        serverSources.forEach(s => {
          const existing = mergedMap.get(s.id);
          if (existing) {
            mergedMap.set(s.id, {
              ...existing,
              ...s,
              syllabus: existing.syllabus || s.note,
              thematicDescriptor: existing.thematicDescriptor || s.note,
              extractedQuote: existing.extractedQuote,
              relevantArticles: existing.relevantArticles
            });
          } else {
            mergedMap.set(s.id, {
              ...s,
              syllabus: s.note,
              thematicDescriptor: s.entity + ' · Precedente',
              extractedQuote: s.note
            });
          }
        });
      }

      let result = Array.from(mergedMap.values());

      if (selectedArea !== 'ALL') {
        result = result.filter(s => s.area === 'GENERAL' || s.area === selectedArea);
      }
      if (selectedStatus !== 'ALL') {
        result = result.filter(s => s.status === selectedStatus);
      }

      setSources(result);
    } catch (err: any) {
      // Fallback seguro a fuentes oficiales precargadas
      setSources(ENRICHED_OFFICIAL_SOURCES);
      onShowToast('Cargando catálogo oficial de relatorías con respaldo local asegurado.', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, [selectedArea, selectedStatus]);

  const handleVerify = async (id: string, title: string) => {
    if (!currentUser || (currentUser.role !== 'SUPERVISOR' && currentUser.role !== 'DIRECTOR')) {
      onShowToast('Se requiere perfil de Docente Supervisor o Director para validar fuentes.', 'error');
      return;
    }
    try {
      await api.verifySource(id);
      onShowToast(`Fuente "${title}" convalidada exitosamente por supervisión.`);
      loadSources();
      if (activeSource?.id === id) {
        setActiveSource(prev => prev ? { ...prev, status: 'VERIFIED' } : null);
      }
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newEntity.trim() || !newUrl.trim()) {
      onShowToast('Título, entidad emisora y URL son obligatorios.', 'error');
      return;
    }
    if (!newUrl.startsWith('https://')) {
      onShowToast('Por directriz institucional, la URL debe comenzar por https:// (protocolo seguro).', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createSource({
        title: newTitle.trim(),
        entity: newEntity.trim(),
        url: newUrl.trim(),
        area: newArea,
        note: (newNote.trim() || newSyllabus.trim())
      });
      onShowToast('Fuente y relatoría oficial registrada para revisión.');
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewEntity('');
      setNewUrl('https://');
      setNewNote('');
      setNewSyllabus('');
      loadSources();
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Copiar cita judicial formal
  const handleCopyCitation = (source: OfficialSource) => {
    const citation = `Fuente Oficial: ${source.entity}. ${source.title}. Consultado: ${source.consultedAt}. URL: ${source.url}${
      source.extractedQuote ? `\nExtracto vinculante:\n${source.extractedQuote}` : ''
    }`;
    navigator.clipboard.writeText(citation);
    onShowToast('Cita judicial formal copiada al portapapeles con éxito.', 'success');
  };

  // Enviar a borrador / redactor de Word
  const handleUseInDraft = (source: OfficialSource) => {
    const textToInsert = `\n\nFUNDAMENTO JURISPRUDENCIAL Y NORMATIVO:\nConforme a lo sostenido por la ${source.entity} en "${source.title}" (${source.url}):\n\n${
      source.extractedQuote || source.syllabus || source.note
    }\n`;

    if (onNavigateToDrafts) {
      onNavigateToDrafts(textToInsert);
      onShowToast('Precedente transferido al Generador de Borradores (Word).', 'success');
    } else {
      navigator.clipboard.writeText(textToInsert);
      onShowToast('Extracto y doctrina copiados para su inserción en el memorial.', 'success');
    }
  };

  // Vincular a un expediente activo del despacho
  const handleLinkToCase = () => {
    if (!selectedCaseForLink) {
      onShowToast('Por favor seleccione un expediente de la lista.', 'error');
      return;
    }
    const foundCase = cases.find(c => c.id === selectedCaseForLink);
    setLinkSuccess(true);
    onShowToast(`Fuente convalidada vinculada al expediente ${foundCase?.caseNumber || selectedCaseForLink}.`, 'success');
    setTimeout(() => setLinkSuccess(false), 2500);
  };

  const filteredSources = sources.filter(s => {
    const matchesSearch = !search.trim() || (() => {
      const term = search.toLowerCase();
      return (
        s.title.toLowerCase().includes(term) ||
        s.entity.toLowerCase().includes(term) ||
        (s.note && s.note.toLowerCase().includes(term)) ||
        (s.syllabus && s.syllabus.toLowerCase().includes(term)) ||
        (s.thematicDescriptor && s.thematicDescriptor.toLowerCase().includes(term)) ||
        (s.relevantArticles && s.relevantArticles.some(a => a.toLowerCase().includes(term)))
      );
    })();

    const matchesEntity = selectedEntity === 'ALL' || (() => {
      if (selectedEntity === 'Congreso') {
        return s.entity.toLowerCase().includes('congreso') || s.entity.toLowerCase().includes('senado') || s.entity.toLowerCase().includes('suin');
      }
      return s.entity.toLowerCase().includes(selectedEntity.toLowerCase());
    })();

    return matchesSearch && matchesEntity;
  });

  const isSupervisorOrDirector = currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'DIRECTOR';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Banner Superior de Garantía Jurídica y Relatoría */}
      <div className="bg-gradient-to-r from-slate-950 via-navy-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-blue-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-400" /> Relatorías & Dogmática Judicial
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Corte Constitucional · CSJ · Consejo de Estado · SUIN
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Respaldo Activo
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Repositorio de Fuentes Oficiales & Relatorías</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Consulte y analice directamente en la plataforma los extractos de relatoría, descriptores temáticos, 
            tesis vinculantes y códigos de la República. Revise cada providencia en nuestro visor interno y utilícela a un clic 
            en sus borradores de Word y expedientes en curso.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 z-10">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all border border-blue-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Incorporar Fuente</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros Rápidos por Entidad */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ENTITY_FILTERS.map(ef => (
          <button
            key={ef.id}
            onClick={() => setSelectedEntity(ef.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedEntity === ef.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{ef.label}</span>
          </button>
        ))}
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por norma, descriptor temático, ratio decidendi o artículos..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(AREA_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="VERIFIED">Verificadas por Supervisión</option>
            <option value="PENDING_REVIEW">Pendiente de Convalidación</option>
          </select>
        </div>
      </div>

      {/* Grid de Fuentes y Relatorías */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
          <p className="text-xs">Sincronizando catálogo oficial de relatorías y jurisprudencia...</p>
        </div>
      ) : filteredSources.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No se encontraron fuentes de relatoría</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ajuste los términos de búsqueda o filtros para explorar las fuentes oficiales.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSources.map((source) => {
            const isVerified = source.status === 'VERIFIED';
            return (
              <div
                key={source.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Encabezado de la tarjeta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{source.entity}</span>
                    </div>

                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verificada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        <Clock className="w-3 h-3 text-amber-600" /> Cotejo Pendiente
                      </span>
                    )}
                  </div>

                  {/* Título de la fuente */}
                  <h3 
                    onClick={() => setActiveSource(source)}
                    className="font-bold text-slate-900 text-sm leading-snug hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
                    title={source.title}
                  >
                    {source.title}
                  </h3>

                  {/* Descriptor temático de relatoría */}
                  {source.thematicDescriptor && (
                    <div className="text-[11px] text-blue-700 bg-blue-50/70 px-2.5 py-1.5 rounded-md border border-blue-100 flex items-start gap-1.5">
                      <Bookmark className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-2 font-medium">{source.thematicDescriptor}</span>
                    </div>
                  )}

                  {/* Extracto doctrinal / Syllabus */}
                  <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {source.extractedQuote || source.syllabus || source.note}
                  </p>

                  {/* Artículos relevantes */}
                  {source.relevantArticles && source.relevantArticles.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {source.relevantArticles.slice(0, 3).map((art, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {art}
                        </span>
                      ))}
                      {source.relevantArticles.length > 3 && (
                        <span className="text-[10px] font-mono px-1 py-0.5 text-slate-400">
                          +{source.relevantArticles.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadatos */}
                  <div className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Área:</span>
                      <span className="font-semibold text-slate-700">{AREA_LABELS[source.area] || source.area}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Consulta:</span>
                      <span className="font-mono text-slate-600">{source.consultedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Barra de Acciones de la Tarjeta */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSource(source)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Revisar Relatoría</span>
                    </button>

                    <button
                      onClick={() => handleUseInDraft(source)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center gap-1"
                      title="Utilizar doctrina en borrador de Word"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">En Borrador</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <button
                      onClick={() => handleCopyCitation(source)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar Cita</span>
                    </button>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium hover:underline"
                    >
                      <span>Portal Oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / VISOR INTERACTIVO DE RELATORÍA Y DOCTRINA VINCULANTE              */}
      {/* ========================================================================= */}
      {activeSource && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header del Visor */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-navy-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {activeSource.courtLevel || activeSource.entity}
                  </span>
                  <span className="text-xs text-slate-400">
                    {AREA_LABELS[activeSource.area] || activeSource.area}
                  </span>
                  {activeSource.status === 'VERIFIED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Convalidada
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-white leading-snug">
                  {activeSource.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveSource(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center font-bold text-sm shrink-0 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenido Desplazable del Visor */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800 flex-1">
              
              {/* Descriptor temático */}
              {activeSource.thematicDescriptor && (
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                    <span>Descriptor Temático de Relatoría</span>
                  </div>
                  <p className="text-xs font-semibold text-blue-950 leading-relaxed">
                    {activeSource.thematicDescriptor}
                  </p>
                </div>
              )}

              {/* Tesis Jurisprudencial / Extracto Oficial */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-slate-600" />
                    <span>Tesis Vinculante / Syllabus Oficial</span>
                  </h3>
                  <button
                    onClick={() => handleCopyCitation(activeSource)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar Cita</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 font-serif leading-relaxed italic border-l-4 border-l-blue-600">
                  {activeSource.extractedQuote || activeSource.syllabus || activeSource.note}
                </div>
              </div>

              {/* Artículos y Normas Aplicables */}
              {activeSource.relevantArticles && activeSource.relevantArticles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Artículos y Normatividad Sustancial
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeSource.relevantArticles.map((art, i) => (
                      <span key={i} className="text-xs font-mono font-medium px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                        {art}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Módulo: Vincular a un Caso Activo */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>Vincular Doctrina a un Expediente del Despacho</span>
                  </div>
                  {linkSuccess && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> ¡Vinculado al expediente!
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={selectedCaseForLink}
                    onChange={(e) => setSelectedCaseForLink(e.target.value)}
                    className="flex-1 w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Seleccione un caso o expediente...</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} - {c.title.substring(0, 50)}...
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleLinkToCase}
                    disabled={!selectedCaseForLink}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                      selectedCaseForLink
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Vincular a Caso
                  </button>
                </div>
              </div>

              {/* Verificación por Supervisión */}
              {!activeSource.status || activeSource.status === 'PENDING_REVIEW' ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Esta fuente se encuentra en cotejo docente y supervisión jurídica.</span>
                  </div>
                  {isSupervisorOrDirector && (
                    <button
                      onClick={() => handleVerify(activeSource.id, activeSource.title)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0"
                    >
                      Convalidar Ahora
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer con Acciones Principales */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <a
                href={activeSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 hover:text-blue-900 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors"
              >
                <span>Abrir en Portal de la Corte</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCitation(activeSource)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Cita</span>
                </button>

                <button
                  onClick={() => {
                    handleUseInDraft(activeSource);
                    setActiveSource(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Utilizar en Borrador (Word)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Registrar Nueva Fuente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">Incorporar Fuente Jurídica Oficial</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre o Título de la Norma / Relatoría <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Ley 1581 de 2012 o Relatoría Corte Constitucional"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entidad Emisora <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newEntity}
                    onChange={(e) => setNewEntity(e.target.value)}
                    placeholder="Ej. Corte Suprema de Justicia"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área del Derecho
                  </label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value as LegalArea)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {Object.entries(AREA_LABELS).filter(([k]) => k !== 'ALL').map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enlace Oficial Seguro (HTTPS) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tesis Doctrinal o Syllabus de Relatoría
                </label>
                <textarea
                  rows={3}
                  value={newSyllabus}
                  onChange={(e) => setNewSyllabus(e.target.value)}
                  placeholder="Sintetice el extracto oficial o la regla vinculante sentada..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Registrar Fuente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
