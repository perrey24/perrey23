import React, { useState, useMemo } from 'react';
import { 
  FolderArchive, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  FileCheck2,
  HardDrive
} from 'lucide-react';
import { LegalDocumentRecord, LegalCase, DocType, DocReviewStatus } from '../types';

interface DocumentsViewProps {
  documents: LegalDocumentRecord[];
  cases: LegalCase[];
  loading: boolean;
  onOpenUpload: () => void;
  onDeleteDocument: (id: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  cases,
  loading,
  onOpenUpload,
  onDeleteDocument,
  onSelectCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docToDelete, setDocToDelete] = useState<LegalDocumentRecord | null>(null);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = 
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.originalFilename.toLowerCase().includes(q) ||
        doc.caseNumber.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q);

      const matchType = typeFilter === 'all' || doc.documentType === typeFilter;
      const matchStatus = statusFilter === 'all' || doc.reviewStatus === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [documents, searchTerm, typeFilter, statusFilter]);

  const typeLabels: Record<DocType, string> = {
    demanda_peticion: 'Demanda / Petición',
    contestacion: 'Contestación',
    poder: 'Poder Judicial',
    prueba_documental: 'Prueba Documental',
    auto_resolucion: 'Auto / Resolución',
    sentencia: 'Sentencia',
    memorial: 'Memorial',
    notificacion: 'Notificación',
    otro: 'Otro'
  };

  const statusBadges: Record<DocReviewStatus, { label: string; class: string }> = {
    pendiente_cotejo: { label: 'Pendiente Cotejo', class: 'bg-amber-100 text-amber-800 border-amber-200' },
    cotejado_aprobado: { label: 'Cotejado y Aprobado', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    observado: { label: 'Con Observaciones', class: 'bg-rose-100 text-rose-800 border-rose-200' }
  };

  const totalSizeMB = (documents.reduce((acc, d) => acc + (d.sizeBytes || 0), 0) / (1024 * 1024)).toFixed(2);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">
              Archivo Digital y Gestión Documental
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
              Ley 2213 de 2022
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Custodia, cotejo, clasificación y validación de piezas procesales digitales
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hidden sm:flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <span>Almacenamiento: <strong>{totalSizeMB} MB</strong> ({documents.length} archivos)</span>
          </div>

          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Incorporar Documento</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por título, nombre de archivo original, radicado o descripción..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="all">Todos los Tipos Documentales</option>
            <option value="demanda_peticion">Demanda / Petición</option>
            <option value="contestacion">Contestación</option>
            <option value="poder">Poder Judicial</option>
            <option value="prueba_documental">Prueba Documental</option>
            <option value="auto_resolucion">Auto / Resolución</option>
            <option value="sentencia">Sentencia</option>
            <option value="memorial">Memorial</option>
            <option value="notificacion">Notificación</option>
            <option value="otro">Otro</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="all">Todos los Estados de Cotejo</option>
            <option value="pendiente_cotejo">Pendiente de Cotejo</option>
            <option value="cotejado_aprobado">Cotejado y Aprobado</option>
            <option value="observado">Con Observaciones</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p>Cargando piezas documentales...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No se encontraron piezas documentales</p>
            <p className="text-slate-400">Incorpore archivos escaneados o digitales al expediente respectivo.</p>
            <button
              onClick={onOpenUpload}
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Incorporar Documento</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Pieza / Archivo</th>
                  <th className="py-3 px-4">Tipo Documental</th>
                  <th className="py-3 px-4">Expediente Vinculado</th>
                  <th className="py-3 px-4">Incorporación y Peso</th>
                  <th className="py-3 px-4">Estado de Cotejo</th>
                  <th className="py-3 px-4 text-right">Descarga / Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map(doc => {
                  const statusInfo = statusBadges[doc.reviewStatus] || {
                    label: doc.reviewStatus,
                    class: 'bg-slate-100 text-slate-700'
                  };

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Título y archivo */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate" title={doc.title}>
                              {doc.title}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono truncate" title={doc.originalFilename}>
                              {doc.originalFilename}
                            </p>
                            {doc.description && (
                              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tipo Documental */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">
                          {typeLabels[doc.documentType] || doc.documentType}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {doc.mimeType}
                        </span>
                      </td>

                      {/* Expediente */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <button
                          onClick={() => onSelectCase(doc.caseId)}
                          className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 hover:underline cursor-pointer block truncate"
                        >
                          {doc.caseNumber}
                        </button>
                        <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                          {doc.caseTitle}
                        </span>
                      </td>

                      {/* Fecha y Peso */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <span className="font-semibold block">{doc.uploadDate}</span>
                        <span className="text-[11px] text-slate-400">
                          {(doc.sizeBytes / 1024).toFixed(1)} KB
                        </span>
                      </td>

                      {/* Estado Cotejo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                        {doc.reviewNotes && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-[150px] mt-0.5" title={doc.reviewNotes}>
                            {doc.reviewNotes}
                          </span>
                        )}
                      </td>

                      {/* Descarga y Acciones */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/api/documents/${doc.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                            title="Descargar archivo auténtico"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Descargar</span>
                          </a>

                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar registro documental"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Confirmación Eliminación */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-md w-full space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  ¿Eliminar pieza documental?
                </h4>
                <p className="text-xs text-slate-600">
                  Se removerá el archivo <strong>{docToDelete.originalFilename}</strong> del expediente <strong>{docToDelete.caseNumber}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDocToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteDocument(docToDelete.id);
                  setDocToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                Eliminar Archivo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
