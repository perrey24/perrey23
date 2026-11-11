import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Scale, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  User,
  Copy,
  Check,
  ExternalLink,
  Radio,
  Building2
} from 'lucide-react';
import { LegalCase, LegalArea, CaseStatus } from '../types';

interface CasesViewProps {
  cases: LegalCase[];
  loading: boolean;
  onOpenNewCase: () => void;
  onSelectCase: (caseId: string) => void;
  onEditCase: (legalCase: LegalCase) => void;
  onDeleteCase: (caseId: string) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  loading,
  onOpenNewCase,
  onSelectCase,
  onEditCase,
  onDeleteCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [caseToDelete, setCaseToDelete] = useState<LegalCase | null>(null);
  const [copiedCaseId, setCopiedCaseId] = useState<string | null>(null);

  const handleCopyRadicado = (e: React.MouseEvent, radicado: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(radicado);
    setCopiedCaseId(id);
    setTimeout(() => setCopiedCaseId(null), 2000);
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        !searchTerm.trim() ||
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.plaintiff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.defendant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.authority.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesArea = selectedArea === 'all' || c.legalArea === selectedArea;
      const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

      return matchesSearch && matchesArea && matchesStatus;
    });
  }, [cases, searchTerm, selectedArea, selectedStatus]);

  const statusColors: Record<string, string> = {
    activo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    en_tramite: 'bg-blue-50 text-blue-700 border-blue-200',
    suspendido: 'bg-amber-50 text-amber-700 border-amber-200',
    en_fallo: 'bg-purple-50 text-purple-700 border-purple-200',
    cerrado: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const statusLabels: Record<string, string> = {
    activo: 'Activo',
    en_tramite: 'En Trámite',
    suspendido: 'Suspendido',
    en_fallo: 'Para Fallo',
    cerrado: 'Cerrado'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por radicado, título, demandante, demandado o despacho judicial..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedArea}
            onChange={e => setSelectedArea(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 capitalize focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las Ramas</option>
            <option value="laboral">Laboral</option>
            <option value="civil">Civil</option>
            <option value="penal">Penal</option>
            <option value="administrativo">Administrativo</option>
            <option value="constitucional">Constitucional</option>
            <option value="familia">Familia</option>
            <option value="comercial">Comercial</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="activo">Activo</option>
            <option value="en_tramite">En Trámite</option>
            <option value="suspendido">Suspendido</option>
            <option value="en_fallo">Para Fallo</option>
            <option value="cerrado">Cerrado</option>
          </select>

          <button
            onClick={onOpenNewCase}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Caso</span>
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p>Cargando expedientes jurídicos...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs space-y-2">
            <Scale className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No se encontraron expedientes</p>
            <p className="text-slate-400">Intente modificar los filtros o registre un nuevo caso.</p>
            <button
              onClick={onOpenNewCase}
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Caso</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Radicado / Asunto</th>
                  <th className="py-3 px-4">Rama y Trámite</th>
                  <th className="py-3 px-4">Partes Procesales</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Próxima Actuación</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Radicado y Título */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                          <Scale className="w-3 h-3 text-blue-600" />
                          <span>{c.caseNumber}</span>
                          <button
                            onClick={(e) => handleCopyRadicado(e, c.caseNumber, c.id)}
                            className="text-slate-400 hover:text-blue-600 ml-0.5"
                            title="Copiar radicado"
                          >
                            {copiedCaseId === c.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </span>

                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                          <Radio className="w-2.5 h-2.5 text-emerald-500" />
                          <span>Vigilado</span>
                        </span>

                        {c.isProBono && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1 rounded border border-amber-200">
                            ProBono
                          </span>
                        )}
                      </div>
                      <p 
                        className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer line-clamp-1"
                        onClick={() => onSelectCase(c.id)}
                        title={c.title}
                      >
                        {c.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[11px] text-slate-500 truncate">{c.authority}</p>
                        <a
                          href="https://consultaprocesos.ramajudicial.gov.co/Procesos/NumeroRadicacion"
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-blue-600 shrink-0"
                          title="Consultar radicado en Rama Judicial"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    {/* Rama y Trámite */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 capitalize block">
                        {c.legalArea}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                        {c.procedureType}
                      </span>
                    </td>

                    {/* Partes */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="truncate">
                        <span className="text-slate-400 font-medium">Dte: </span>
                        <strong className="text-slate-700">{c.plaintiff.name}</strong>
                      </div>
                      <div className="truncate text-slate-600">
                        <span className="text-slate-400 font-medium">Ddo: </span>
                        <span>{c.defendant.name}</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[c.status] || 'bg-slate-100 text-slate-700'}`}>
                        {statusLabels[c.status] || c.status}
                      </span>
                    </td>

                    {/* Próxima Actuación */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <p className="font-semibold text-slate-800 truncate" title={c.nextAction}>
                        {c.nextAction}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Límite: {c.deadlineDate}</span>
                      </p>
                    </td>

                    {/* Responsable */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                      <span className="truncate block max-w-[140px]" title={c.assignee}>
                        {c.assignee}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Apertura: {c.filingDate}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectCase(c.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Ver Ficha Completa del Caso"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditCase(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Editar Caso"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCaseToDelete(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar Expediente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar caso */}
      {caseToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  ¿Confirmar eliminación del expediente?
                </h4>
                <p className="text-xs text-slate-600">
                  Está a punto de eliminar el expediente <strong>{caseToDelete.caseNumber}</strong> ({caseToDelete.title}). Se eliminarán también las actuaciones procesales y vínculos asociados.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCaseToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteCase(caseToDelete.id);
                  setCaseToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                Sí, Eliminar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
