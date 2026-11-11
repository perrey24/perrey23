import React, { useState, useEffect } from 'react';
import { X, Save, Scale, AlertCircle } from 'lucide-react';
import { LegalCase, LegalArea, CaseStatus } from '../types';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (caseData: Partial<LegalCase>) => Promise<void>;
  initialData?: LegalCase | null;
}

export const CaseFormModal: React.FC<CaseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<LegalCase>>({
    caseNumber: '',
    title: '',
    legalArea: 'laboral',
    procedureType: '',
    facts: '',
    claims: '',
    plaintiff: {
      name: '',
      idType: 'CC',
      idNumber: '',
      role: 'Demandante / Accionante',
      email: '',
      phone: '',
      address: ''
    },
    defendant: {
      name: '',
      idType: 'NIT',
      idNumber: '',
      role: 'Demandado / Accionado / Entidad',
      email: '',
      phone: '',
      address: ''
    },
    authority: '',
    status: 'activo',
    filingDate: new Date().toISOString().split('T')[0],
    assignee: 'Dra. Laura Camila Soto (Abogada Senior)',
    nextAction: 'Radicación y control de admisibilidad',
    deadlineDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    isProBono: false,
    estimatedValue: 0
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
    } else {
      setFormData({
        caseNumber: `RAD-2026-00${Math.floor(Math.random() * 900 + 100)}`,
        title: '',
        legalArea: 'laboral',
        procedureType: 'Ordinario Laboral de Primera Instancia',
        facts: '',
        claims: '',
        plaintiff: {
          name: '',
          idType: 'CC',
          idNumber: '',
          role: 'Demandante / Accionante',
          email: '',
          phone: '',
          address: ''
        },
        defendant: {
          name: '',
          idType: 'NIT',
          idNumber: '',
          role: 'Demandado / Accionado / Entidad',
          email: '',
          phone: '',
          address: ''
        },
        authority: 'Juzgado Laboral del Circuito',
        status: 'activo',
        filingDate: new Date().toISOString().split('T')[0],
        assignee: 'Dra. Laura Camila Soto (Abogada Senior)',
        nextAction: 'Radicación formal y control de admisibilidad',
        deadlineDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        isProBono: false,
        estimatedValue: 0
      });
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validaciones
    if (!formData.caseNumber?.trim()) {
      setErrorMsg('El número de expediente o radicado es obligatorio.');
      return;
    }
    if (!formData.title?.trim()) {
      setErrorMsg('El título o referencia del caso es obligatorio.');
      return;
    }
    if (!formData.facts?.trim()) {
      setErrorMsg('Debe registrar la narración de los hechos fácticos.');
      return;
    }
    if (!formData.plaintiff?.name?.trim()) {
      setErrorMsg('El nombre de la parte demandante/accionante es obligatorio.');
      return;
    }
    if (!formData.defendant?.name?.trim()) {
      setErrorMsg('El nombre de la parte demandada/accionada es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el expediente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {initialData ? 'Editar Expediente Jurídico' : 'Registrar Nuevo Expediente Jurídico'}
              </h3>
              <p className="text-xs text-slate-500">
                Información del caso, partes procesales y control de términos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="m-5 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Identificación del Proceso */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Radicado / Código *</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.caseNumber || ''}
                onChange={e => setFormData({ ...formData, caseNumber: e.target.value })}
                placeholder="Ej. RAD-2026-0045"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rama del Derecho *</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize"
                value={formData.legalArea}
                onChange={e => setFormData({ ...formData, legalArea: e.target.value as LegalArea })}
              >
                <option value="laboral">Laboral y Seguridad Social</option>
                <option value="civil">Civil y Contratos</option>
                <option value="penal">Penal y Garantías</option>
                <option value="administrativo">Administrativo y Contencioso</option>
                <option value="constitucional">Constitucional y Tutelas</option>
                <option value="familia">Familia e Infancia</option>
                <option value="comercial">Comercial y Societario</option>
                <option value="tributario">Tributario y Aduanero</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estado Procesal *</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as CaseStatus })}
              >
                <option value="activo">Activo</option>
                <option value="en_tramite">En Trámite</option>
                <option value="suspendido">Suspendido</option>
                <option value="en_fallo">En Despacho para Fallo</option>
                <option value="cerrado">Cerrado / Archivado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Título / Asunto del Expediente *</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej. Demanda Ordinaria Laboral - Indemnización Moratoria vs. Empresa X"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Procedimiento *</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.procedureType || ''}
                onChange={e => setFormData({ ...formData, procedureType: e.target.value })}
                placeholder="Ej. Ordinario de Primera Instancia / Acción de Tutela"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Despacho / Autoridad Competente</label>
              <input
                type="text"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.authority || ''}
                onChange={e => setFormData({ ...formData, authority: e.target.value })}
                placeholder="Ej. Juzgado 14 Laboral del Circuito de Bogotá"
              />
            </div>
          </div>

          {/* Partes Procesales */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Partes Procesales</h4>
            
            {/* Demandante */}
            <div className="space-y-2">
              <span className="font-semibold text-blue-700 block text-xs">Parte Demandante / Accionante / Peticionario</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre o Razón Social *"
                  className="p-2 border border-slate-300 rounded-lg bg-white"
                  value={formData.plaintiff?.name || ''}
                  onChange={e => setFormData({
                    ...formData,
                    plaintiff: { ...formData.plaintiff!, name: e.target.value }
                  })}
                />
                <div className="flex gap-1">
                  <select
                    className="p-2 border border-slate-300 rounded-lg bg-white w-20 shrink-0"
                    value={formData.plaintiff?.idType || 'CC'}
                    onChange={e => setFormData({
                      ...formData,
                      plaintiff: { ...formData.plaintiff!, idType: e.target.value as any }
                    })}
                  >
                    <option value="CC">CC</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">CE</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Número de Identificación"
                    className="p-2 border border-slate-300 rounded-lg bg-white flex-1"
                    value={formData.plaintiff?.idNumber || ''}
                    onChange={e => setFormData({
                      ...formData,
                      plaintiff: { ...formData.plaintiff!, idNumber: e.target.value }
                    })}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Correo de Notificación"
                  className="p-2 border border-slate-300 rounded-lg bg-white"
                  value={formData.plaintiff?.email || ''}
                  onChange={e => setFormData({
                    ...formData,
                    plaintiff: { ...formData.plaintiff!, email: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Demandado */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-700 block text-xs">Parte Demandada / Accionada / Entidad</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre o Entidad Demandada *"
                  className="p-2 border border-slate-300 rounded-lg bg-white"
                  value={formData.defendant?.name || ''}
                  onChange={e => setFormData({
                    ...formData,
                    defendant: { ...formData.defendant!, name: e.target.value }
                  })}
                />
                <div className="flex gap-1">
                  <select
                    className="p-2 border border-slate-300 rounded-lg bg-white w-20 shrink-0"
                    value={formData.defendant?.idType || 'NIT'}
                    onChange={e => setFormData({
                      ...formData,
                      defendant: { ...formData.defendant!, idType: e.target.value as any }
                    })}
                  >
                    <option value="NIT">NIT</option>
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                  </select>
                  <input
                    type="text"
                    placeholder="NIT / Cédula"
                    className="p-2 border border-slate-300 rounded-lg bg-white flex-1"
                    value={formData.defendant?.idNumber || ''}
                    onChange={e => setFormData({
                      ...formData,
                      defendant: { ...formData.defendant!, idNumber: e.target.value }
                    })}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Canal Notificación Electrónica"
                  className="p-2 border border-slate-300 rounded-lg bg-white"
                  value={formData.defendant?.email || ''}
                  onChange={e => setFormData({
                    ...formData,
                    defendant: { ...formData.defendant!, email: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Hechos y Pretensiones */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Narración de Hechos Fácticos *</label>
            <textarea
              required
              rows={3}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.facts || ''}
              onChange={e => setFormData({ ...formData, facts: e.target.value })}
              placeholder="Describa los antecedentes fácticos, fechas y circunstancias pertinentes..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pretensiones / Peticiones del Caso</label>
            <textarea
              rows={2}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.claims || ''}
              onChange={e => setFormData({ ...formData, claims: e.target.value })}
              placeholder="1. Declarar que... 2. Condenar a..."
            />
          </div>

          {/* Asignación y Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Abogado / Estudiante Asignado</label>
              <input
                type="text"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.assignee || ''}
                onChange={e => setFormData({ ...formData, assignee: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha de Apertura / Radicado</label>
              <input
                type="date"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.filingDate || ''}
                onChange={e => setFormData({ ...formData, filingDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cuantía Estimada (COP)</label>
              <input
                type="number"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.estimatedValue || 0}
                onChange={e => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Próxima Actuación Procesal</label>
              <input
                type="text"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.nextAction || ''}
                onChange={e => setFormData({ ...formData, nextAction: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha Límite Registrada</label>
              <input
                type="date"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.deadlineDate || ''}
                onChange={e => setFormData({ ...formData, deadlineDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isProBono"
                checked={formData.isProBono || false}
                onChange={e => setFormData({ ...formData, isProBono: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isProBono" className="font-semibold text-slate-700 cursor-pointer">
                Caso Pro-Bono / Asistencia en Consultorio Jurídico (Ley 2113 de 2021)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="consentHabeasData"
                checked={formData.consent !== false}
                onChange={e => setFormData({ 
                  ...formData, 
                  consent: e.target.checked,
                  plaintiff: { ...formData.plaintiff!, consent: e.target.checked, consentDate: new Date().toISOString() } 
                })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="consentHabeasData" className="font-semibold text-slate-700 cursor-pointer">
                Consentimiento de Tratamiento de Datos Personales firmado (Ley 1581 de 2012)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isConfidential"
                checked={formData.confidential || false}
                onChange={e => setFormData({ ...formData, confidential: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isConfidential" className="font-semibold text-slate-700 cursor-pointer">
                Reserva Legal y Secreto Profesional Estricto (Ley 1123 de 2007)
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
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
              <span>{saving ? 'Guardando...' : initialData ? 'Actualizar Expediente' : 'Crear Expediente'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
