import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  FileCheck, 
  MessageSquare, 
  Scale, 
  AlertTriangle, 
  FileText, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  BookOpen,
  Calendar,
  ExternalLink,
  Briefcase,
  AlertOctagon,
  Layers,
  Flame,
  Check,
  ChevronRight
} from 'lucide-react';
import { LegalCase, AICaseAnalysisResult } from '../types';
import { api } from '../services/api';

interface AiAssistantViewProps {
  cases: LegalCase[];
  isAiLive: boolean;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ cases, isAiLive }) => {
  const [activeTab, setActiveTab] = useState<'prospectus' | 'hearings' | 'remedies' | 'chat'>('prospectus');

  // Caso seleccionado
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const selectedCase = cases.find(c => c.id === selectedCaseId);

  // Form State para análisis
  const [caseTitle, setCaseTitle] = useState('');
  const [legalArea, setLegalArea] = useState('laboral');
  const [facts, setFacts] = useState(
    'El señor Pedro Martínez laboró como auxiliar de bodega desde el 1 de febrero de 2023 hasta el 10 de octubre de 2026 bajo órdenes de un supervisor. La empresa le pagaba en efectivo sin desprendibles formales y le exigía cuenta de cobro mensual. Fue retirado verbalmente sin carta de despido ni pago de cesantías ni prima de servicios.'
  );
  const [userDoubt, setUserDoubt] = useState(
    'Determinar si procede demanda de contrato realidad laboral, cuantía aproximada de acreencias y si se causó indemnización moratoria del Art. 65 CST.'
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AICaseAnalysisResult | null>(null);

  // Chat State
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Bienvenido a **LexFlow Copilot**, su asistente de inteligencia procesal y sustancial colombiana.

Estoy articulado con el **Catálogo Oficial de Fuentes Jurídicas de Colombia** (SUIN-JURISCOL, Relatorías de la Corte Constitucional, Corte Suprema de Justicia y Consejo de Estado).

**¿Cómo puedo apoyarle en este momento?**
- Seleccione un expediente arriba para obtener su **prospecto procesal y teoría del caso**.
- Consulte cómo preparar una **audiencia próxima y en qué materiales apoyarse** (expediente digital Ley 2213, alegatos de conclusión, interrogatorios, límites de conciliación).
- Revise la ruta paso a paso de su **actuación procesal pendiente**.
- Explore qué recursos ordinarios o extraordinarios agotar o cómo tramitar un **Incidente de Desacato** (Arts. 27 y 52 Dec. 2591/91) con su Grado de Consulta.`
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Al seleccionar un caso existente, auto-completar los datos
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    const found = cases.find(c => c.id === caseId);
    if (found) {
      setCaseTitle(found.title);
      setLegalArea(found.legalArea);
      setFacts(found.facts);
      setUserDoubt(`Estructurar estrategia procesal, preparar próxima actuación (${found.nextAction || 'Trámite en curso'}) y recursos aplicables para ${found.caseNumber}.`);
    }
  };

  // Cargar automáticamente el primer caso si no hay ninguno seleccionado
  useEffect(() => {
    if (cases.length > 0 && !selectedCaseId) {
      handleSelectCase(cases[0].id);
    }
  }, [cases]);

  const handleRunAnalysis = async () => {
    if (!facts.trim()) return;
    try {
      setAnalyzing(true);
      const res = await api.analyzeFacts({
        caseId: selectedCaseId || undefined,
        caseTitle: caseTitle || selectedCase?.title,
        legalArea: legalArea || selectedCase?.legalArea,
        procedureType: selectedCase?.procedureType,
        authority: selectedCase?.authority,
        currentStatus: selectedCase?.status,
        nextAction: selectedCase?.nextAction,
        deadlineDate: selectedCase?.deadlineDate,
        claims: selectedCase?.claims,
        facts,
        currentDoubtOrNeed: userDoubt
      });
      setAnalysisResult(res);
    } catch (err: any) {
      alert('Error en el análisis de IA: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const newMsgs = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMsgs);
    if (!textToSend) setInputMsg('');

    try {
      setChatLoading(true);
      const res = await api.chatAi(newMsgs, selectedCaseId || undefined);
      setMessages([...newMsgs, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setMessages([...newMsgs, { 
        role: 'assistant', 
        content: '⚠️ Ocurrió un error al procesar su solicitud. Verifique la conexión con el servidor.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Banner Principal de Inteligencia Jurídica */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-blue-400" /> Asistente de Estrategia Jurídica
            </span>
            <span className="text-xs text-slate-400">Ley 2113 de 2021 · SUIN-JURISCOL · Altas Cortes</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              isAiLive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
            }`}>
              {isAiLive ? 'Gemini 2.5 Live Oficial' : 'Motor Heurístico Colombiano'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            LexFlow Copilot — Análisis Prospectivo & Estrategia Procesal
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mt-1">
            Analice cualquier expediente contra el catálogo oficial de leyes, decretos y precedentes de relatoría.
            Genere el prospecto del caso, prepare audiencias con sus materiales de apoyo y conozca qué recursos agotar.
          </p>
        </div>

        {/* Selector Rápido de Caso Vinculado */}
        <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80 w-full lg:w-80 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Caso para Análisis Contextual:
          </label>
          <select
            value={selectedCaseId}
            onChange={e => handleSelectCase(e.target.value)}
            className="w-full text-xs p-2 rounded-lg bg-navy-900 border border-slate-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Redactar Asunto Libre --</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.title.substring(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjeta de Resumen del Caso Seleccionado */}
      {selectedCase && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">{selectedCase.caseNumber}: {selectedCase.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px] capitalize">
                {selectedCase.legalArea}
              </span>
            </div>
            <p className="text-slate-600">
              <strong>Despacho:</strong> {selectedCase.authority} | <strong>Procedimiento:</strong> {selectedCase.procedureType}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Próxima Actuación Registrada:</span>
              <span className="font-bold text-blue-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {selectedCase.nextAction}
              </span>
              <span className="text-[10px] text-rose-600 font-semibold block">Límite: {selectedCase.deadlineDate}</span>
            </div>
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>{analyzing ? 'Generando...' : 'Analizar este Caso'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Navegación por Pestañas Especializadas */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('prospectus')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'prospectus'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>1. Prospecto & Estrategia Integral</span>
        </button>

        <button
          onClick={() => setActiveTab('hearings')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'hearings'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>2. Preparación de Audiencias & Materiales</span>
        </button>

        <button
          onClick={() => setActiveTab('remedies')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'remedies'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. Recursos Agotables & Desacato</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'chat'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>4. Chat Jurídico Interactivo</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* PESTAÑA 1: PROSPECTO Y ESTRATEGIA INTEGRAL                     */}
      {/* ============================================================== */}
      {activeTab === 'prospectus' && (
        <div className="space-y-6">
          
          {/* Formulario Fáctico Desplegable o Editable */}
          <div className="bg-white p-5 rounded-b-xl border border-t-0 border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Hechos y Dudas del Caso a Evaluar
              </h3>
              <span className="text-slate-400 text-[11px]">Minimización de PII habilitada</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Título / Asunto</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={caseTitle}
                  onChange={e => setCaseTitle(e.target.value)}
                  placeholder="Título del asunto..."
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Área del Derecho</label>
                <select
                  value={legalArea}
                  onChange={e => setLegalArea(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white capitalize"
                >
                  <option value="laboral">Laboral y Seguridad Social</option>
                  <option value="civil">Civil y Contratos</option>
                  <option value="penal">Penal y Garantías</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="constitucional">Constitucional (Tutela)</option>
                  <option value="familia">Familia e Infancia</option>
                  <option value="comercial">Comercial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Narración de Hechos Fácticos *</label>
              <textarea
                rows={3}
                required
                className="w-full p-2.5 border border-slate-300 rounded-lg leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={facts}
                onChange={e => setFacts(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Duda o Enfoque Específico</label>
              <input
                type="text"
                className="w-full p-2 border border-slate-300 rounded-lg"
                value={userDoubt}
                onChange={e => setUserDoubt(e.target.value)}
                placeholder="¿Qué aspecto sustancial o procesal desea que el asistente analice prioritariamente?"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing || !facts.trim()}
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span>{analyzing ? 'Analizando a la luz de leyes y relatorías...' : 'Ejecutar Análisis Estratégico Completo'}</span>
              </button>
              <span className="text-[11px] text-slate-500 italic">
                Articulado con fuentes de SUIN-JURISCOL y Relatorías de Altas Cortes
              </span>
            </div>
          </div>

          {/* Resultados del Prospecto */}
          {analysisResult && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Teoría del Caso (Fáctica, Probatoria y Jurídica) */}
              {analysisResult.theoryOfTheCase && (
                <div className="bg-gradient-to-r from-navy-900 to-indigo-950 text-white p-5 rounded-2xl shadow-lg space-y-4">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-blue-800/60">
                    <span className="font-bold tracking-wider uppercase text-blue-300 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-gold-500" />
                      Teoría del Caso Recomendada (Estructura de Litigio)
                    </span>
                    <span className="text-slate-300 text-[11px]">Ley 2113 de 2021 · Consultorio Jurídico</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-white/10 rounded-xl space-y-1">
                      <h4 className="font-bold text-blue-300 uppercase text-[11px]">1. Teoría Fáctica (Hechos)</h4>
                      <p className="text-slate-200 leading-relaxed">{analysisResult.theoryOfTheCase.factualTheory}</p>
                    </div>

                    <div className="p-3 bg-white/10 rounded-xl space-y-1">
                      <h4 className="font-bold text-emerald-300 uppercase text-[11px]">2. Teoría Probatoria (Soportes)</h4>
                      <p className="text-slate-200 leading-relaxed">{analysisResult.theoryOfTheCase.probatoryTheory}</p>
                    </div>

                    <div className="p-3 bg-white/10 rounded-xl space-y-1">
                      <h4 className="font-bold text-amber-300 uppercase text-[11px]">3. Teoría Jurídica (Subsunción)</h4>
                      <p className="text-slate-200 leading-relaxed">{analysisResult.theoryOfTheCase.legalTheory}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnóstico y Prospecto Inmediato */}
              {analysisResult.strategicProspectus && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Diagnóstico Procesal & Prospecto: ¿Qué Debería Hacer con este Caso?
                    </h3>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {analysisResult.strategicProspectus.caseDiagnosis}
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Pasos Inmediatos Sugeridos:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {analysisResult.strategicProspectus.recommendedNextSteps.map((step, idx) => (
                        <div key={idx} className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span className="text-slate-800 font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Normas y Precedentes del Catálogo Oficial */}
              {analysisResult.strategicProspectus && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Normas Legales Aplicables */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Normas y Artículos Aplicables (SUIN-JURISCOL)
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {analysisResult.strategicProspectus.applicableNormsAndSources.map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-blue-900">{item.norm}</span>
                            <a
                              href={item.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                            >
                              <span>Ver en SUIN</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="font-semibold text-slate-700">{item.article}</p>
                          <p className="text-[11px] text-slate-600 leading-snug">{item.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Precedentes Jurisprudenciales de Altas Cortes */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Scale className="w-4 h-4 text-purple-600" />
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Precedentes Jurisprudenciales (Relatorías Oficiales)
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {analysisResult.strategicProspectus.jurisprudencePrecedents.map((prec, idx) => (
                        <div key={idx} className="p-3 bg-purple-50/40 rounded-xl border border-purple-200/60 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-purple-900">{prec.court}</span>
                            {prec.relatoriaUrl && (
                              <a
                                href={prec.relatoriaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-purple-700 hover:text-purple-900 flex items-center gap-1 font-semibold"
                              >
                                <span>Relatoría Oficial</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="font-bold text-slate-800">{prec.precedentRef}</p>
                          <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2 rounded-lg border border-purple-100">
                            "{prec.keyHolding}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Cronología y Checklist Documental */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Línea de tiempo */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                      Cronología Fáctica
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {analysisResult.timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800">{item.dateOrPeriod}</span>
                          <p className="text-slate-600">{item.description}</p>
                          <p className="text-[10px] text-slate-400 italic">{item.relevance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist Documental Probatorio */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                      Checklist Probatorio Requerido
                    </h4>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {analysisResult.documentChecklist.map((doc, idx) => (
                      <div key={idx} className="py-2.5 flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{doc.documentName}</p>
                          <p className="text-[11px] text-slate-500">{doc.purpose}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                          doc.necessity === 'Obligatorio'
                            ? 'bg-rose-100 text-rose-800'
                            : doc.necessity === 'Recomendable'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {doc.necessity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 2: PREPARACIÓN DE AUDIENCIAS Y ACTUACIONES PENDIENTES   */}
      {/* ============================================================== */}
      {activeTab === 'hearings' && (
        <div className="space-y-6">
          
          {/* Guía de la Actuación Pendiente */}
          {analysisResult?.pendingActionGuidance ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Cómo Desarrollar la Actuación Pendiente: "{analysisResult.pendingActionGuidance.actionTitle}"
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Urgencia procesal: <strong>{analysisResult.pendingActionGuidance.urgencyLevel}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Reglas de Términos */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 leading-relaxed">
                <strong>Regla de Cómputo de Términos:</strong> {analysisResult.pendingActionGuidance.proceduralRulesNotice}
              </div>

              {/* Paso a paso */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                  Ruta Paso a Paso de Redacción y Radicación:
                </h4>
                <div className="space-y-2">
                  {analysisResult.pendingActionGuidance.howToDevelopStepByStep.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 font-medium leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errores fatales a evitar */}
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                <h4 className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  Errores Graves a Evitar (Riesgo de Nulidad o Preclusión):
                </h4>
                <ul className="space-y-1 list-disc list-inside text-rose-800 text-[11px]">
                  {analysisResult.pendingActionGuidance.pitfallsToAvoid.map((pitfall, idx) => (
                    <li key={idx}>{pitfall}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              Haga clic en <strong>"Ejecutar Análisis Estratégico Completo"</strong> en la primera pestaña para derivar la guía de la actuación pendiente.
            </div>
          )}

          {/* Protocolo de Audiencia y Materiales de Apoyo */}
          {analysisResult?.hearingPreparation && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Preparación de Audiencia: {analysisResult.hearingPreparation.hearingType}
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Materiales indispensables, técnicas probatorias y advertencias de comparecencia
                    </p>
                  </div>
                </div>
              </div>

              {/* Alerta de Inasistencia */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {analysisResult.hearingPreparation.inattendanceConsequencesNotice}
                </p>
              </div>

              {/* Materiales en los que debe apoyarse */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                  Materiales de Apoyo en los que Debe Sustentarse Obligatoriamente:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.hearingPreparation.suggestedSupportMaterials.map((mat, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800">{mat.materialName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            mat.urgency === 'Indispensable' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {mat.urgency}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed mt-1">
                          {mat.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tácticas y Conciliación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-blue-600" /> Tácticas de Interrogatorio y Práctica de Pruebas:
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-slate-700">
                    {analysisResult.hearingPreparation.interrogationAndEvidenceTactics.map((tactic, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{tactic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <h5 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Directriz para Etapa Conciliatoria:
                  </h5>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {analysisResult.hearingPreparation.settlementFormulasAdvice}
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 3: RECURSOS AGOTABLES & INCIDENTE DE DESACATO          */}
      {/* ============================================================== */}
      {activeTab === 'remedies' && (
        <div className="space-y-6">
          
          {/* Especial: Incidente de Desacato */}
          {analysisResult?.remediesAndIncidentsStrategy?.incidenteDesacatoGuide && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Estrategia de Incidente de Desacato (Decreto 2591 de 1991)
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Fundamento: <strong>{analysisResult.remediesAndIncidentsStrategy.incidenteDesacatoGuide.legalBasis}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Diferencia con cumplimiento */}
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 leading-relaxed">
                <strong>Diferenciación Conceptual Indispensable:</strong>
                <p className="mt-1 text-[11px]">{analysisResult.remediesAndIncidentsStrategy.incidenteDesacatoGuide.differencesWithCumplimiento}</p>
              </div>

              {/* Trámite paso a paso */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                  Trámite Procesal del Desacato Paso a Paso:
                </h4>
                <div className="space-y-2">
                  {analysisResult.remediesAndIncidentsStrategy.incidenteDesacatoGuide.stepByStepProcedure.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 font-medium leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recursos y Grado de Consulta */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
                <h5 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  ¿Qué Recursos Proceden Contra la Sanción de Desacato?
                </h5>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  {analysisResult.remediesAndIncidentsStrategy.incidenteDesacatoGuide.remediesAndConsulta}
                </p>
              </div>
            </div>
          )}

          {/* Matriz de Recursos Ordinarios y Extraordinarios */}
          {analysisResult?.remediesAndIncidentsStrategy ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 text-xs">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Matriz de Recursos Ordinarios Agotables
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Conforme al Código General del Proceso, CPACA y Código Sustantivo del Trabajo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResult.remediesAndIncidentsStrategy.availableOrdinaryRemedies.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-blue-900 text-xs">{rec.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{rec.legalBasis}</p>
                      <p className="text-slate-700 text-[11px] mt-2 leading-relaxed">
                        <strong>Objeto:</strong> {rec.purpose}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                      <strong>Término y Oportunidad:</strong> {rec.deadlineAndFiling}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recursos Extraordinarios */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                  Vías Extraordinarias y Constitucionales:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.remediesAndIncidentsStrategy.extraordinaryAndConstitutionalRemedies.map((ext, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 space-y-1">
                      <span className="font-bold text-purple-900 text-xs">{ext.name}</span>
                      <p className="text-[10px] text-slate-500 font-mono">{ext.legalBasis}</p>
                      <p className="text-[11px] text-slate-700 leading-relaxed mt-1">
                        <strong>Requisitos:</strong> {ext.requirements}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              Haga clic en <strong>"Ejecutar Análisis Estratégico Completo"</strong> en la primera pestaña para derivar la matriz de recursos aplicables.
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 4: CHAT JURÍDICO INTERACTIVO                           */}
      {/* ============================================================== */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          
          {/* Quick Prompts Contextuales */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            <span className="font-semibold text-slate-500 shrink-0 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Consultas Estratégicas:
            </span>
            <button
              onClick={() => handleSendMessage('Tengo una audiencia en pocos días para este caso. ¿En qué materiales de apoyo debo apoyarme y qué advertencias debo tener presentes?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 shrink-0 transition-colors font-medium"
            >
              ⚖️ Preparar Audiencia & Materiales
            </button>
            <button
              onClick={() => handleSendMessage('¿Cómo radico el Incidente de Desacato de tutela y qué recursos o grado de consulta proceden según el Decreto 2591?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 shrink-0 transition-colors font-medium"
            >
              📜 Incidente de Desacato & Consulta
            </button>
            <button
              onClick={() => handleSendMessage('¿Cuál es la teoría del caso y la estrategia jurídica integral recomendada para este expediente?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 shrink-0 transition-colors font-medium"
            >
              🎯 Teoría del Caso & Estrategia
            </button>
            <button
              onClick={() => handleSendMessage('¿Cómo se computan los términos de notificación personal electrónica según el artículo 8 de la Ley 2213 de 2022?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 shrink-0 transition-colors font-medium"
            >
              ⏱️ Notificación Ley 2213
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-navy-900 text-white flex items-center justify-center shrink-0 shadow-sm border border-slate-700">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-3xl leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/90 rounded-tl-none shadow-sm font-sans'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic p-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Analizando jurisprudencia de Altas Cortes y catálogo oficial de leyes...</span>
              </div>
            )}
          </div>

          {/* Input Chat Box */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Pregúntele al asistente sobre estrategia, recursos, audiencias o desacato..."
                className="flex-1 p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !inputMsg.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
