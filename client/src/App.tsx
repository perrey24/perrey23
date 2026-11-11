import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LitigaWallView } from './components/LitigaWallView';
import { CasesView } from './components/CasesView';
import { CalendarView } from './components/CalendarView';
import { DraftsView } from './components/DraftsView';
import { AiAssistantView } from './components/AiAssistantView';
import { DocumentsView } from './components/DocumentsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SourcesView } from './components/SourcesView';
import { GovernanceView } from './components/GovernanceView';

import { CaseDetailModal } from './components/CaseDetailModal';
import { CaseFormModal } from './components/CaseFormModal';
import { ActionFormModal } from './components/ActionFormModal';
import { UploadDocModal } from './components/UploadDocModal';
import { LoginModal } from './components/LoginModal';
import { LandingView } from './components/LandingView';
import { LegalProjectsView } from './components/LegalProjectsView';
import { JurisprudenceFinderView } from './components/JurisprudenceFinderView';

import { api } from './services/api';
import { LegalCase, LegalAction, LegalDocumentRecord, DashboardMetrics, User } from './types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [pendingTargetView, setPendingTargetView] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const [cases, setCases] = useState<LegalCase[]>([]);
  const [actions, setActions] = useState<LegalAction[]>([]);
  const [documents, setDocuments] = useState<LegalDocumentRecord[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isAiLive, setIsAiLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Modales
  const [detailCase, setDetailCase] = useState<LegalCase | null>(null);
  const [isCaseFormOpen, setIsCaseFormOpen] = useState<boolean>(false);
  const [caseFormInitialData, setCaseFormInitialData] = useState<LegalCase | null>(null);

  const [isActionFormOpen, setIsActionFormOpen] = useState<boolean>(false);
  const [actionFormInitialData, setActionFormInitialData] = useState<LegalAction | null>(null);
  const [actionFormDefaultCaseId, setActionFormDefaultCaseId] = useState<string | undefined>(undefined);

  const [isUploadDocOpen, setIsUploadDocOpen] = useState<boolean>(false);
  const [uploadDocDefaultCaseId, setUploadDocDefaultCaseId] = useState<string | undefined>(undefined);

  // Redactor & Precedentes
  const [draftInitialContent, setDraftInitialContent] = useState<string>('');

  const handleNavigateToDraftsWithPrecedent = (precedentText: string) => {
    setDraftInitialContent(precedentText);
    setCurrentView('drafts');
  };

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Verificar sesión activa
      const sessionRes = await api.getSession();
      if (sessionRes.authenticated && sessionRes.user) {
        setCurrentUser(sessionRes.user);
      } else {
        // No auto-login: la sesión requiere validación explícita de contraseña
        setCurrentUser(null);
      }

      // 2. Cargar datos principales
      const [casesData, actionsData, docsData, metricsData, healthData] = await Promise.all([
        api.getCases(),
        api.getActions(),
        api.getDocuments(),
        api.getMetrics(),
        fetch('/api/health').then(r => r.json()).catch(() => ({ aiProvider: 'heuristic-mock-demo' }))
      ]);

      setCases(casesData);
      setActions(actionsData);
      setDocuments(docsData);
      setMetrics(metricsData);
      setIsAiLive(healthData.aiProvider === 'gemini-live');
    } catch (err: any) {
      showToast('Error al conectar con el servidor backend: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Control de Acceso y Navegación Segura
  const handleEnterApp = (targetView?: string) => {
    const view = targetView || 'dashboard';
    if (!currentUser) {
      setPendingTargetView(view);
      setIsLoginModalOpen(true);
      showToast('Por seguridad, introduzca su contraseña para acceder a la plataforma.', 'info');
      return;
    }
    setCurrentView(view);
  };

  const handleSelectView = (view: string) => {
    if (view === 'landing') {
      setCurrentView('landing');
      return;
    }
    if (!currentUser) {
      setPendingTargetView(view);
      setIsLoginModalOpen(true);
      showToast('Autenticación requerida: ingrese su contraseña para acceder.', 'info');
      return;
    }
    setCurrentView(view);
  };

  // Manejo de Casos
  const handleOpenNewCase = () => {
    setCaseFormInitialData(null);
    setIsCaseFormOpen(true);
  };

  const handleEditCase = (c: LegalCase) => {
    setCaseFormInitialData(c);
    setIsCaseFormOpen(true);
  };

  const handleSubmitCase = async (caseData: Partial<LegalCase>) => {
    if (caseFormInitialData) {
      await api.updateCase(caseFormInitialData.id, caseData);
      showToast('Expediente actualizado exitosamente.');
    } else {
      await api.createCase(caseData);
      showToast('Nuevo expediente registrado exitosamente.');
    }
    await loadData();
    if (detailCase) {
      const refreshed = await api.getCaseById(detailCase.id);
      setDetailCase(refreshed);
    }
  };

  const handleDeleteCase = async (id: string) => {
    try {
      await api.deleteCase(id);
      showToast('Expediente eliminado del sistema.', 'info');
      await loadData();
      if (detailCase?.id === id) setDetailCase(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSelectCase = async (caseId: string) => {
    try {
      const fullCase = await api.getCaseById(caseId);
      setDetailCase(fullCase);
    } catch (err) {
      const fallback = cases.find(c => c.id === caseId) || null;
      setDetailCase(fallback);
    }
  };

  // Manejo de Actuaciones
  const handleOpenNewAction = (caseId?: string) => {
    setActionFormInitialData(null);
    setActionFormDefaultCaseId(caseId || cases[0]?.id);
    setIsActionFormOpen(true);
  };

  const handleEditAction = (action: LegalAction) => {
    setActionFormInitialData(action);
    setActionFormDefaultCaseId(action.caseId);
    setIsActionFormOpen(true);
  };

  const handleSubmitAction = async (actionData: Partial<LegalAction>) => {
    if (actionFormInitialData) {
      await api.updateAction(actionFormInitialData.id, actionData);
      showToast('Actuación procesal actualizada.');
    } else {
      await api.createAction(actionData);
      showToast('Actuación registrada en el calendario.');
    }
    await loadData();
    if (detailCase) {
      const refreshed = await api.getCaseById(detailCase.id);
      setDetailCase(refreshed);
    }
  };

  const handleToggleAction = async (id: string) => {
    try {
      const updated = await api.toggleAction(id);
      showToast(
        updated.isCompleted 
          ? 'Actuación marcada como cumplida.' 
          : 'Actuación reabierta en calendario.',
        'info'
      );
      await loadData();
      if (detailCase) {
        const refreshed = await api.getCaseById(detailCase.id);
        setDetailCase(refreshed);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAction = async (id: string) => {
    try {
      await api.deleteAction(id);
      showToast('Actuación eliminada con éxito.', 'info');
      await loadData();
      if (detailCase) {
        const refreshed = await api.getCaseById(detailCase.id);
        setDetailCase(refreshed);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Manejo de Documentos
  const handleOpenUploadDoc = (caseId?: string) => {
    setUploadDocDefaultCaseId(caseId || cases[0]?.id);
    setIsUploadDocOpen(true);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await api.deleteDocument(id);
      showToast('Documento eliminado del archivo.', 'info');
      await loadData();
      if (detailCase) {
        const refreshed = await api.getCaseById(detailCase.id);
        setDetailCase(refreshed);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Restablecer Base de Datos Demo
  const handleResetDb = async () => {
    if (window.confirm('¿Desea restablecer todos los expedientes, términos y documentos a los datos ficticios iniciales?')) {
      try {
        await api.resetDatabase();
        showToast('Base de datos restablecida a los datos demostrativos iniciales.');
        await loadData();
        setDetailCase(null);
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
  };

  return (
    <div className={`font-sans ${currentView === 'landing' ? 'min-h-screen bg-[#050811] text-slate-100 overflow-y-auto' : 'flex h-screen bg-slate-100 overflow-hidden'}`}>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-3.5 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white border-emerald-500'
            : toast.type === 'error'
            ? 'bg-rose-600 text-white border-rose-500'
            : 'bg-slate-800 text-white border-slate-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {toast.type === 'info' && <Info className="w-4 h-4" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {currentView === 'landing' ? (
        <LandingView
          onEnterApp={handleEnterApp}
          onOpenLoginModal={() => {
            setPendingTargetView('dashboard');
            setIsLoginModalOpen(true);
          }}
          urgentActionsCount={metrics?.upcomingDeadlinesCount || 0}
        />
      ) : (
        <>
          {/* Barra Lateral Izquierda */}
          <Sidebar
            currentView={currentView}
            onSelectView={handleSelectView}
            onResetDb={handleResetDb}
            isAiLive={isAiLive}
            currentUser={currentUser}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />

          {/* Contenido Principal */}
          <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
            
            {/* Cabecera Superior */}
            <Header
              currentView={currentView}
              onOpenNewCase={handleOpenNewCase}
              onOpenNewAction={() => handleOpenNewAction()}
              urgentCount={metrics?.upcomingDeadlinesCount || 0}
              onNavigateToCalendar={() => setCurrentView('calendar')}
              currentUser={currentUser}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onReturnToLanding={() => setCurrentView('landing')}
            />

            {/* Vistas Dinámicas */}
            <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-12">
          {currentView === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              loading={loading}
              onNavigateToCases={() => setCurrentView('cases')}
              onNavigateToCalendar={() => setCurrentView('calendar')}
              onNavigateToLitigaWall={() => setCurrentView('litiga_wall')}
              onToggleAction={handleToggleAction}
              onSelectCase={handleSelectCase}
            />
          )}

          {currentView === 'litiga_wall' && (
            <LitigaWallView
              onNavigateToDrafts={(caseNumber) => {
                setCurrentView('drafts');
                if (caseNumber) {
                  showToast(`Iniciando redacción de memorial para radicado ${caseNumber}`, 'info');
                }
              }}
              onSelectCase={handleSelectCase}
              onShowToast={showToast}
            />
          )}

          {currentView === 'cases' && (
            <CasesView
              cases={cases}
              loading={loading}
              onOpenNewCase={handleOpenNewCase}
              onSelectCase={handleSelectCase}
              onEditCase={handleEditCase}
              onDeleteCase={handleDeleteCase}
            />
          )}

          {currentView === 'projects' && (
            <LegalProjectsView
              cases={cases}
              actions={actions}
              currentUser={currentUser}
              onOpenNewAction={(cid) => handleOpenNewAction(cid)}
              onToggleAction={handleToggleAction}
              onSelectCase={handleSelectCase}
              onShowToast={showToast}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              actions={actions}
              cases={cases}
              loading={loading}
              onOpenNewAction={() => handleOpenNewAction()}
              onToggleAction={handleToggleAction}
              onEditAction={handleEditAction}
              onDeleteAction={handleDeleteAction}
              onSelectCase={handleSelectCase}
            />
          )}

          {currentView === 'drafts' && (
            <DraftsView
              cases={cases}
              onDraftSaved={loadData}
              initialContent={draftInitialContent}
            />
          )}

          {currentView === 'sources' && (
            <SourcesView
              currentUser={currentUser}
              cases={cases}
              onShowToast={showToast}
              onNavigateToDrafts={handleNavigateToDraftsWithPrecedent}
            />
          )}

          {currentView === 'jurisprudence' && (
            <JurisprudenceFinderView
              cases={cases}
              onNavigateToDrafts={handleNavigateToDraftsWithPrecedent}
              onShowToast={showToast}
            />
          )}

          {currentView === 'ai_assistant' && (
            <AiAssistantView
              cases={cases}
              isAiLive={isAiLive}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsView
              documents={documents}
              cases={cases}
              loading={loading}
              onOpenUpload={() => handleOpenUploadDoc()}
              onDeleteDocument={handleDeleteDocument}
              onSelectCase={handleSelectCase}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              metrics={metrics}
              cases={cases}
              loading={loading}
            />
          )}

          {currentView === 'governance' && (
            <GovernanceView
              onShowToast={showToast}
            />
          )}
        </main>
      </div>
    </>
  )}

      {/* Modales Globales */}
      <CaseDetailModal
        legalCase={detailCase}
        onClose={() => setDetailCase(null)}
        onOpenNewAction={(cid) => handleOpenNewAction(cid)}
        onOpenUploadDoc={(cid) => handleOpenUploadDoc(cid)}
        onToggleAction={handleToggleAction}
        onEditCase={(c) => {
          setDetailCase(null);
          handleEditCase(c);
        }}
      />

      <CaseFormModal
        isOpen={isCaseFormOpen}
        onClose={() => setIsCaseFormOpen(false)}
        onSubmit={handleSubmitCase}
        initialData={caseFormInitialData}
      />

      <ActionFormModal
        isOpen={isActionFormOpen}
        onClose={() => setIsActionFormOpen(false)}
        onSubmit={handleSubmitAction}
        cases={cases}
        defaultCaseId={actionFormDefaultCaseId}
        initialData={actionFormInitialData}
      />

      <UploadDocModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        cases={cases}
        defaultCaseId={uploadDocDefaultCaseId}
        onUploadSuccess={() => {
          showToast('Pieza documental incorporada al expediente.');
          loadData();
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setCurrentView(pendingTargetView || 'dashboard');
          loadData();
        }}
        onLogoutSuccess={() => {
          setCurrentUser(null);
          setCurrentView('landing');
          loadData();
        }}
        onShowToast={showToast}
      />

    </div>
  );
};

export default App;
