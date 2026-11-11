import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { LegalCase, DocType, DocReviewStatus } from '../types';
import { api } from '../services/api';

interface UploadDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: LegalCase[];
  defaultCaseId?: string;
  onUploadSuccess: () => void;
}

export const UploadDocModal: React.FC<UploadDocModalProps> = ({
  isOpen,
  onClose,
  cases,
  defaultCaseId,
  onUploadSuccess
}) => {
  const [caseId, setCaseId] = useState(defaultCaseId || (cases[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocType>('prueba_documental');
  const [description, setDescription] = useState('');
  const [reviewStatus, setReviewStatus] = useState<DocReviewStatus>('pendiente_cotejo');
  const [reviewNotes, setReviewNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      // Validar tamaño (10MB)
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMsg('El archivo supera el límite de 10 MB permitido.');
        return;
      }
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Debe seleccionar un archivo para cargar.');
      return;
    }
    if (!caseId) {
      setErrorMsg('Debe asociar el archivo a un expediente.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('El título del documento es obligatorio.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseId);
      formData.append('title', title.trim());
      formData.append('documentType', documentType);
      formData.append('description', description.trim());
      formData.append('reviewStatus', reviewStatus);
      if (reviewNotes) formData.append('reviewNotes', reviewNotes.trim());

      await api.uploadDocument(formData);
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Incorporar Documento al Expediente
              </h3>
              <p className="text-xs text-slate-500">
                Almacenamiento seguro, cotejo y clasificación procesal
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="m-5 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* File Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Archivo a Incorporar (PDF, DOCX, TXT, PNG, JPG - Máx 10MB) *</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 bg-slate-50/50 cursor-pointer">
              <input
                type="file"
                required
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="text-xs text-emerald-700 font-semibold mt-2">
                  Seleccionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Expediente Asociado *</label>
            <select
              required
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
            >
              <option value="">-- Seleccionar Expediente --</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title.substring(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Título Descriptivo de la Pieza *</label>
            <input
              type="text"
              required
              placeholder="Ej. Poder especial autenticado / Demanda con sello de reparto"
              className="w-full p-2 border border-slate-300 rounded-lg"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo Documental *</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg bg-white capitalize"
                value={documentType}
                onChange={e => setDocumentType(e.target.value as DocType)}
              >
                <option value="demanda_peticion">Demanda o Petición</option>
                <option value="contestacion">Contestación o Excepciones</option>
                <option value="poder">Poder Judicial</option>
                <option value="prueba_documental">Prueba Documental</option>
                <option value="auto_resolucion">Auto o Resolución</option>
                <option value="sentencia">Sentencia o Fallo</option>
                <option value="memorial">Memorial de Trámite</option>
                <option value="notificacion">Notificación Procesal</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estado de Cotejo / Revisión</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                value={reviewStatus}
                onChange={e => setReviewStatus(e.target.value as DocReviewStatus)}
              >
                <option value="pendiente_cotejo">Pendiente de Cotejo</option>
                <option value="cotejado_aprobado">Cotejado y Aprobado</option>
                <option value="observado">Con Observaciones</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descripción / Notas Probatorias</label>
            <textarea
              rows={2}
              placeholder="Breve reseña sobre el contenido y pertinencia de la prueba..."
              className="w-full p-2 border border-slate-300 rounded-lg"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Incorporando al Archivo...' : 'Incorporar Documento'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
