import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  User, 
  Building, 
  Plus, 
  ExternalLink,
  Download
} from 'lucide-react';
import { LegalCase, LegalAction, LegalDocumentRecord } from '../types';

interface CaseDetailModalProps {
  legalCase: LegalCase | null;
  onClose: () => void;
  onOpenNewAction: (caseId: string) => void;
  onOpenUploadDoc: (caseId: string) => void;
  onToggleAction: (actionId: string) => void;
  onEditCase: (legalCase: LegalCase) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  legalCase,
  onClose,
  onOpenNewAction,
  onOpenUploadDoc,
  onToggleAction,
  onEditCase
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'actions' | 'documents'>('info');

  if (!legalCase) return null;

  const statusColors: Record<string, string> = {
    activo: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    en_tramite: 'bg-blue-100 text-blue-800 border-blue-300',
    suspendido: 'bg-amber-100 text-amber-800 border-amber-300',
    en_fallo: 'bg-purple-100 text-purple-800 border-purple-300',
    cerrado: 'bg-slate-100 text-slate-800 border-slate-300'
  };

  const statusLabels: Record<string, string> = {
    activo: 'Activo / En Curso',
    en_tramite: 'En Trámite Procesal',
    suspendido: 'Suspendido Temporalmente',
    en_fallo: 'Para Fallo en Despacho',
    cerrado: 'Cerrado / Archivado'
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                {legalCase.caseNumber}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusColors[legalCase.status] || 'bg-slate-100'}`}>
                {statusLabels[legalCase.status] || legalCase.status}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 capitalize font-medium">
                {legalCase.legalArea}
              </span>
              {legalCase.isProBono && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                  Pro-Bono / Consultorio
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {legalCase.title}
            </h3>
            <p className="text-xs text-slate-500">
              Despacho: <strong>{legalCase.authority}</strong> · Responsable: <strong>{legalCase.assignee}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEditCase(legalCase)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'info' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Ficha del Expediente</span>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'actions' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Actuaciones y Términos ({legalCase.actions?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'documents' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Piezas Documentales ({legalCase.documents?.length || 0})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Partes procesales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Demandante / Accionante */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase">
                    <User className="w-4 h-4 text-blue-700" />
                    <span>Demandante / Accionante</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{legalCase.plaintiff.name}</p>
                  <p className="text-xs text-slate-600">
                    {legalCase.plaintiff.idType} N° {legalCase.plaintiff.idNumber} · {legalCase.plaintiff.role}
                  </p>
                  {legalCase.plaintiff.email && (
                    <p className="text-xs text-slate-600">Email: {legalCase.plaintiff.email}</p>
                  )}
                  {legalCase.plaintiff.phone && (
                    <p className="text-xs text-slate-600">Tel: {legalCase.plaintiff.phone}</p>
                  )}
                  {legalCase.plaintiff.address && (
                    <p className="text-xs text-slate-600">Dir: {legalCase.plaintiff.address}</p>
                  )}
                </div>

                {/* Demandado / Accionado */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
                    <Building className="w-4 h-4 text-slate-600" />
                    <span>Demandado / Accionado / Entidad</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{legalCase.defendant.name}</p>
                  <p className="text-xs text-slate-600">
                    {legalCase.defendant.idType} N° {legalCase.defendant.idNumber} · {legalCase.defendant.role}
                  </p>
                  {legalCase.defendant.email && (
                    <p className="text-xs text-slate-600">Canal Notif: {legalCase.defendant.email}</p>
                  )}
                  {legalCase.defendant.address && (
                    <p className="text-xs text-slate-600">Dir: {legalCase.defendant.address}</p>
                  )}
                </div>
              </div>

              {/* Hechos */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Hechos y Fundamentos Fácticos</h4>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {legalCase.facts}
                </div>
              </div>

              {/* Pretensiones */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pretensiones y Objetivos del Proceso</h4>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {legalCase.claims || 'No registradas'}
                </div>
              </div>

              {/* Datos procesales complementarios */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Tipo de Procedimiento</span>
                  <span className="font-semibold text-slate-800">{legalCase.procedureType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Fecha de Apertura / Radicado</span>
                  <span className="font-semibold text-slate-800">{legalCase.filingDate}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Próxima Actuación</span>
                  <span className="font-semibold text-slate-800">{legalCase.nextAction}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Cuantía Estimada</span>
                  <span className="font-semibold text-slate-800">
                    {legalCase.estimatedValue 
                      ? `$${legalCase.estimatedValue.toLocaleString('es-CO')} COP` 
                      : 'Sin cuantía / Indeterminada'}
                  </span>
                </div>
              </div>

              {legalCase.notes && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Observaciones del Equipo Legal</h4>
                  <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                    {legalCase.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider">Historial y Términos Procesales</h4>
                <button
                  onClick={() => onOpenNewAction(legalCase.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar Actuación</span>
                </button>
              </div>

              {!legalCase.actions || legalCase.actions.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p>No hay actuaciones procesales registradas para este expediente.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {legalCase.actions.map(action => (
                    <div 
                      key={action.id} 
                      className={`p-3.5 rounded-xl border transition-all ${
                        action.isCompleted 
                          ? 'bg-slate-50/60 border-slate-200 opacity-75' 
                          : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => onToggleAction(action.id)}
                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              action.isCompleted 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'border-slate-300 hover:border-blue-600 text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-800">{action.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-semibold">
                                {action.type}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                action.isCompleted 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {action.isCompleted ? 'Cumplido' : `Fecha límite: ${action.date}`}
                              </span>
                            </div>
                            {action.description && (
                              <p className="text-xs text-slate-600 mt-1">{action.description}</p>
                            )}
                            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                              <span>Resp: {action.responsible}</span>
                              {action.proceduralTermType === 'termino_procesal' && (
                                <span className="text-amber-700 font-medium">
                                  {action.legalVerificationNotes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider">Documentos y Expediente Digital</h4>
                <button
                  onClick={() => onOpenUploadDoc(legalCase.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Subir Documento</span>
                </button>
              </div>

              {!legalCase.documents || legalCase.documents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p>No se han asociado piezas documentales a este expediente.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {legalCase.documents.map(doc => (
                    <div key={doc.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{doc.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {doc.originalFilename} · {(doc.sizeBytes / 1024).toFixed(1)} KB · Tipo: {doc.documentType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          doc.reviewStatus === 'cotejado_aprobado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.reviewStatus === 'cotejado_aprobado' ? 'Cotejado' : 'Pendiente Cotejo'}
                        </span>
                        <a
                          href={`/api/documents/${doc.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Descargar o Ver Documento"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            ID: <span className="font-mono">{legalCase.id}</span> · Registrado: {new Date(legalCase.createdAt).toLocaleDateString('es-CO')}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
          >
            Cerrar Vista
          </button>
        </div>

      </div>
    </div>
  );
};
