import React, { useState, useEffect } from 'react';
import { X, Save, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { LegalAction, LegalCase, ActionType, ProceduralTermType, LegalVerificationStatus } from '../types';

interface ActionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (actionData: Partial<LegalAction>) => Promise<void>;
  cases: LegalCase[];
  defaultCaseId?: string;
  initialData?: LegalAction | null;
}

export const ActionFormModal: React.FC<ActionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cases,
  defaultCaseId,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<LegalAction>>({
    caseId: defaultCaseId || (cases[0]?.id || ''),
    title: '',
    type: 'audiencia',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    description: '',
    isCompleted: false,
    proceduralTermType: 'termino_procesal',
    legalVerificationStatus: 'pendiente_verificacion',
    legalVerificationNotes: '',
    responsible: 'Dra. Laura Camila Soto (Abogada Senior)'
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
    } else {
      setFormData({
        caseId: defaultCaseId || (cases[0]?.id || ''),
        title: '',
        type: 'audiencia',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        description: '',
        isCompleted: false,
        proceduralTermType: 'termino_procesal',
        legalVerificationStatus: 'pendiente_verificacion',
        legalVerificationNotes: '',
        responsible: cases.find(c => c.id === defaultCaseId)?.assignee || 'Dra. Laura Camila Soto (Abogada Senior)'
      });
    }
    setErrorMsg('');
  }, [initialData, defaultCaseId, cases, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseId) {
      setErrorMsg('Debe seleccionar el expediente asociado.');
      return;
    }
    if (!formData.title?.trim()) {
      setErrorMsg('El título de la actuación es obligatorio.');
      return;
    }
    if (!formData.date) {
      setErrorMsg('La fecha límite o de audiencia es obligatoria.');
      return;
    }

    try {
      setSaving(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la actuación');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {initialData ? 'Editar Actuación Procesal' : 'Registrar Actuación / Vencimiento'}
              </h3>
              <p className="text-xs text-slate-500">
                Control de términos procesales y calendario judicial
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="m-5 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Expediente Asociado *</label>
            <select
              required
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              value={formData.caseId}
              onChange={e => {
                const c = cases.find(item => item.id === e.target.value);
                setFormData({
                  ...formData,
                  caseId: e.target.value,
                  responsible: c?.assignee || formData.responsible
                });
              }}
            >
              <option value="">-- Seleccione Expediente --</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Actuación *</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as ActionType })}
              >
                <option value="audiencia">Audiencia Judicial</option>
                <option value="vencimiento_termino">Vencimiento de Término Procesal</option>
                <option value="radicacion">Radicación de Memorial / Demanda</option>
                <option value="entrega_documentos">Entrega de Documentos / Subsanación</option>
                <option value="reunion">Reunión con Cliente / Testigos</option>
                <option value="recordatorio">Recordatorio General</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Responsable</label>
              <input
                type="text"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.responsible || ''}
                onChange={e => setFormData({ ...formData, responsible: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Título de la Actuación *</label>
            <input
              type="text"
              required
              placeholder="Ej. Audiencia Inicial Art. 372 CGP / Vencimiento traslado de excepciones"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha Límite o del Evento *</label>
              <input
                type="date"
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.date || ''}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hora (Opcional)</label>
              <input
                type="time"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.time || ''}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          {/* Calificación Jurídica del Término */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Cómputo Jurídico Procesal
              </span>
              <span className="text-[10px] text-blue-700">Régimen Procesal Colombiano</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Naturaleza del Cómputo</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  value={formData.proceduralTermType}
                  onChange={e => setFormData({ ...formData, proceduralTermType: e.target.value as ProceduralTermType })}
                >
                  <option value="termino_procesal">Término Procesal (Días Hábiles Judiciales)</option>
                  <option value="dias_calendario">Días Calendario Corridos</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estado de Verificación Jurídica</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  value={formData.legalVerificationStatus}
                  onChange={e => setFormData({ ...formData, legalVerificationStatus: e.target.value as LegalVerificationStatus })}
                >
                  <option value="pendiente_verificacion">⚠️ Pendiente de verificación jurídica</option>
                  <option value="verificado">✅ Término verificado por el profesional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notas de Verificación Procesal</label>
              <input
                type="text"
                placeholder="Ej. Constancia de notificación personal por correo electrónico N° radicado..."
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                value={formData.legalVerificationNotes || ''}
                onChange={e => setFormData({ ...formData, legalVerificationNotes: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descripción / Instrucciones de la Actuación</label>
            <textarea
              rows={2}
              placeholder="Instrucciones para la diligencia, enlace de audiencia virtual, memoriales a anexar..."
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
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
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : initialData ? 'Actualizar Actuación' : 'Registrar Actuación'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
