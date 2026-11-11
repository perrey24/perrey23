import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  Printer, 
  Save, 
  Plus, 
  Minus, 
  Check, 
  ArrowRight, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ZoomIn,
  ZoomOut,
  Stamp,
  Sliders,
  Type
} from 'lucide-react';
import { LegalCase, DraftTemplateType } from '../types';
import { api } from '../services/api';

interface DraftsViewProps {
  cases: LegalCase[];
  onDraftSaved?: () => void;
  initialContent?: string;
}

export const DraftsView: React.FC<DraftsViewProps> = ({ cases, onDraftSaved, initialContent }) => {
  const [activeTab, setActiveTab] = useState<'word_canvas' | 'structured_wizard'>('word_canvas');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  useEffect(() => {
    if (initialContent) {
      setDocumentBody(prev => prev + '\n' + initialContent);
    }
  }, [initialContent]);

  // Estilos del Documento Word
  const [fontFamily, setFontFamily] = useState<'Times New Roman' | 'Arial' | 'Calibri' | 'Georgia'>('Times New Roman');
  const [fontSize, setFontSize] = useState<'11pt' | '12pt' | '14pt' | '16pt'>('12pt');
  const [lineHeight, setLineHeight] = useState<'1.15' | '1.5' | '2.0'>('1.5');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('justify');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Contenido de la Hoja de Documento Word
  const [documentTitle, setDocumentTitle] = useState('ACCIÓN DE TUTELA PARA LA PROTECCIÓN DEL DERECHO FUNDAMENTAL A LA SALUD Y AL DEBIDO PROCESO');
  const [documentBody, setDocumentBody] = useState(`SEÑOR(A)
JUEZ CIVIL DEL CIRCUITO DE BOGOTÁ D.C. (REPARTO)
E. S. D.

REF: ACCIÓN DE TUTELA
ACCIONANTE: JORGE ELIÉCER GÓMEZ POVEDA
ACCIONADO: EPS SANITAS Y SECRETARÍA DISTRITAL DE SALUD

Dra. LAURA CAMILA SOTO, mayor de edad, domiciliada en Bogotá D.C., identificada con la Cédula de Ciudadanía No. 52.890.114 expedida en Bogotá, y portadora de la Tarjeta Profesional de Abogada No. 284.990 del Consejo Superior de la Judicatura, actuando en calidad de apoderada judicial del señor JORGE ELIÉCER GÓMEZ POVEDA, según poder especial que se adjunta, acudo respetuosamente ante su Despacho para interponer ACCIÓN DE TUTELA de conformidad con el artículo 86 de la Constitución Política y el Decreto Reglamentario 2591 de 1991, con fundamento en los siguientes:

I. HECHOS

PRIMERO: Mi poderdante se encuentra formalmente afiliado al Sistema General de Seguridad Social en Salud en calidad de cotizante principal en la EPS SANITAS.

SEGUNDO: Con fecha 15 de enero de 2026, el médico tratante adscrito a la red prestadora prescribió con carácter prioritario el suministro del procedimiento quirúrgico y el medicamento especializado requerido para su patología.

TERCERO: A pesar de las reiteradas solicitudes y del vencimiento de los términos legales establecidos en la Ley Estatutaria de Salud (Ley 1751 de 2015), la entidad accionada ha omitido autorizar y programar la atención médica, generándole un perjuicio irremediable y vulnerando sus derechos fundamentales.

II. PETICIONES / PRETENSIONES

PRIMERA: TUTELAR de manera inmediata los derechos fundamentales a la SALUD, a la VIDA EN CONDICIONES DIGNAS y al DEBIDO PROCESO ADMINISTRATIVO de mi representado.

SEGUNDA: ORDENAR a la EPS SANITAS que en el término perentorio de cuarenta y ocho (48) horas siguientes a la notificación del fallo, autorice y programe de manera integral el procedimiento quirúrgico prescrito.

TERCERA: PREVENIR a la entidad accionada para que garantice el tratamiento integral continuo que se derive de la condición médica del accionante.

III. JURAMENTO Y PROCEDIBILIDAD

Bajo la gravedad del juramento, manifiesto que no se ha interpuesto otra acción de tutela ante ninguna autoridad judicial por los mismos hechos y derechos aquí reclamados, en cumplimiento del artículo 37 del Decreto 2591 de 1991.

IV. NOTIFICACIONES (ART. 8 LEY 2213 DE 2022)

Para efectos procesales y de conformidad con la Ley 2213 de 2022, las partes recibirán notificaciones judiciales en los siguientes buzones electrónicos:
- Apoderada del Accionante: abogada.soto@consultorio.edu.co | Tel: +57 310 889 0011
- Entidad Accionada (EPS): notificacionesjudiciales@epssanitas.com.co

Atentamente,



_____________________________________________
Dra. LAURA CAMILA SOTO
C.C. No. 52.890.114 de Bogotá D.C.
T.P. No. 284.990 del C. S. de la J.`);

  // Form Fields para el Asistente Guiado
  const [templateType, setTemplateType] = useState<DraftTemplateType>('accion_tutela');
  const [city, setCity] = useState('Bogotá D.C.');
  const [date, setDate] = useState('2026-11-11');
  const [recipientName, setRecipientName] = useState('Juzgado Civil del Circuito (Reparto)');
  const [recipientEntity, setRecipientEntity] = useState('Rama Judicial de Colombia');
  const [recipientEmail, setRecipientEmail] = useState('notificaciones@tribunalbogota.gov.co');
  const [authorName, setAuthorName] = useState('Dra. Laura Camila Soto');
  const [authorIdNumber, setAuthorIdNumber] = useState('52.890.114');
  const [authorProfessionalCard, setAuthorProfessionalCard] = useState('284.990');
  const [representedName, setRepresentedName] = useState('Jorge Eliécer Gómez Poveda');
  const [representedIdNumber, setRepresentedIdNumber] = useState('79.482.119');
  const [subject, setSubject] = useState('Acción de Tutela para la protección de derechos fundamentales');
  const [facts, setFacts] = useState<string[]>([
    'El accionante fue notificado de una decisión administrativa desfavorable sin observar las garantías del debido proceso.',
    'Se interpusieron los recursos de ley sin obtener respuesta oportuna dentro de los plazos del CPACA.'
  ]);
  const [claims, setClaims] = useState<string[]>([
    'Se ampare el derecho fundamental vulnerado.',
    'Se ordene a la entidad demandada retrotraer la actuación al estado inicial.'
  ]);

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cláusulas Jurídicas Rápidas para Inserción en 1 Clic
  const insertClause = (clauseType: string) => {
    let snippet = '';
    switch (clauseType) {
      case 'notificaciones_ley2213':
        snippet = `\n\nCANAL DE NOTIFICACIONES ELECTRÓNICAS (LEY 2213 DE 2022):\nDe conformidad con lo dispuesto en el artículo 8 de la Ley 2213 de 2022, manifiesto bajo la gravedad del juramento que el buzón electrónico informado para notificaciones judiciales de la contraparte corresponde al publicado en el registro mercantil o utilizado en los trámites previos con el despacho.\n- Buzón del Apoderado: notificaciones@globallegal.co\n- Buzón de la Contraparte: notificacionesjudiciales@entidad.gov.co\n`;
        break;
      case 'juramento_estimatorio':
        snippet = `\n\nJURAMENTO ESTIMATORIO (ARTÍCULO 206 CGP):\nEn cumplimiento del artículo 206 del Código General del Proceso, estimo bajo juramento el valor de los perjuicios materiales causados en la suma de CINCUENTA MILLONES DE PESOS M/CTE ($50.000.000 COP), discriminados en daño emergente y lucro cesante debidamente acreditados en el acervo probatorio.\n`;
        break;
      case 'medidas_cautelares':
        snippet = `\n\nSOLICITUD DE MEDIDA CAUTELAR (ARTÍCULO 590 CGP):\nSolicito respetuosamente al señor Juez decretar la medida cautelar innominada consistente en la suspensión provisional de los efectos del acto administrativo impugnado, con el fin de evitar un perjuicio irremediable mientras se dicta sentencia de fondo.\n`;
        break;
      case 'subsidiariedad_tutela':
        snippet = `\n\nCUMPLIMIENTO DEL PRINCIPIO DE SUBSIDIARIEDAD E INMEDIATEZ:\nLa presente acción satisface plenamente el requisito de subsidiariedad por cuanto el medio ordinario carece de idoneidad y eficacia para conjurar la inminente vulneración a derechos fundamentales, de conformidad con la doctrina reiterada de la Corte Constitucional en sentencias T-002 de 1992 y SU-016 de 2020.\n`;
        break;
      case 'espacio_firma':
        snippet = `\n\nAtentamente,\n\n\n_____________________________________________\n${authorName}\nC.C. No. ${authorIdNumber}\nT.P. No. ${authorProfessionalCard} del C.S. de la J.\nBuzón: notificaciones@globallegal.co\n`;
        break;
      case 'jurisprudencia':
        snippet = `\n\nFUNDAMENTO JURISPRUDENCIAL APLICABLE:\nSobre la materia, la Sala de Casación Civil de la Corte Suprema de Justicia ha reiterado de manera pacífica: "La carga de la prueba no puede interpretarse como una barrera de acceso a la administración de justicia cuando la contraparte se encuentra en mejor posición técnica o fáctica para aportarla" (Sentencia SC-1234 de 2023, M.P. Dr. Aroldo Wilson Quiroz).\n`;
        break;
      default:
        break;
    }

    setDocumentBody(prev => prev + snippet);
  };

  // Cargar datos de caso seleccionado
  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    const found = cases.find(c => c.id === caseId);
    if (found) {
      setDocumentTitle(`MEMORIAL JUDICIAL - PROCESO ${found.caseNumber}`);
      setSubject(found.title);
      setRepresentedName(found.plaintiff.name);
      setRepresentedIdNumber(found.plaintiff.idNumber);
      setRecipientName(found.authority || 'Despacho Judicial de Conocimiento');
      setAuthorName(found.assignee || 'Dra. Laura Camila Soto');
      if (found.facts) {
        setFacts(found.facts.split('. ').filter(f => f.trim().length > 0));
      }
      if (found.claims) {
        setClaims(found.claims.split('. ').filter(c => c.trim().length > 0));
      }
    }
  };

  // Transferir contenido del Asistente a la Hoja Word
  const transferWizardToWordCanvas = () => {
    const formatted = `SEÑOR(A)
${recipientName.toUpperCase()}
${recipientEntity.toUpperCase()}
E. S. D.

REF: ${subject.toUpperCase()}
PETICIONARIO / ACCIONANTE: ${representedName.toUpperCase()} (C.C. ${representedIdNumber})
APODERADO: ${authorName.toUpperCase()} (T.P. ${authorProfessionalCard})

${authorName}, mayor de edad y domiciliado en ${city}, identificado como aparece al pie de mi firma, actuando en representación de ${representedName}, acudo respetuosamente ante su despacho para presentar el siguiente documento con fundamento en los siguientes:

I. HECHOS

${facts.map((f, i) => `${['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO'][i] || `${i+1}°`}: ${f}`).join('\n\n')}

II. PETICIONES

${claims.map((c, i) => `${['PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA'][i] || `${i+1}°`}: ${c}`).join('\n\n')}

III. NOTIFICACIONES (ART. 8 LEY 2213 DE 2022)

Para todos los efectos legales, recibiré notificaciones en el buzón:
- Dirección electrónica: notificaciones@globallegal.co
- Canal electrónico contraparte: ${recipientEmail}

Atentamente,



_____________________________________________
${authorName}
C.C. No. ${authorIdNumber}
T.P. No. ${authorProfessionalCard} del Consejo Superior de la Judicatura`;

    setDocumentBody(formatted);
    setActiveTab('word_canvas');
  };

  // Copiar al portapapeles
  const handleCopy = () => {
    navigator.clipboard.writeText(`${documentTitle}\n\n${documentBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Descarga en formato Microsoft Word (.doc nativo con cabeceras HTML/XML de Word)
  const handleDownloadWord = () => {
    const fullContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${documentTitle}</title>
<style>
  body {
    font-family: '${fontFamily}', serif;
    font-size: ${fontSize};
    line-height: ${lineHeight};
    text-align: ${alignment};
    margin: 3cm 2.5cm 2.5cm 3cm;
  }
  h1 {
    font-size: 14pt;
    text-align: center;
    font-weight: bold;
    margin-bottom: 24pt;
  }
  p {
    margin-bottom: 12pt;
    text-indent: 1.25cm;
  }
  .header-legal {
    text-align: center;
    font-size: 10pt;
    font-weight: bold;
    color: #4a5568;
    border-bottom: 1px solid #cbd5e0;
    padding-bottom: 6pt;
    margin-bottom: 24pt;
  }
  .footer-legal {
    text-align: right;
    font-size: 9pt;
    color: #718096;
    margin-top: 36pt;
  }
</style>
</head>
<body>
<div class='header-legal'>
  REPÚBLICA DE COLOMBIA · RAMA JUDICIAL · RADICACIÓN ELECTRÓNICA LEY 2213 DE 2022
</div>
<h1>${documentTitle}</h1>
${documentBody.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
<div class='footer-legal'>
  GlobalLegal CO · Documento generado para radicación judicial
</div>
</body>
</html>`;

    const blob = new Blob(['\ufeff', fullContent], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.slice(0, 35).replace(/[^a-zA-Z0-9]/g, '_')}_GlobalLegal.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Guardar en la base de datos
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await api.saveDraft({
        caseId: selectedCaseId || undefined,
        templateType,
        title: documentTitle,
        generatedContent: documentBody,
        formData: {
          city,
          date,
          recipientName,
          authorName,
          representedName
        },
        disclaimer: 'Borrador editable en formato Word sujeto a revisión profesional.'
      });
      setSaveSuccess(true);
      if (onDraftSaved) onDraftSaved();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Error al guardar el borrador: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Conteo de palabras y caracteres
  const wordCount = documentBody.trim().split(/\s+/).filter(Boolean).length;
  const charCount = documentBody.length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 350));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      
      {/* Selector de Modo Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              Generador y Editor Legal Tipo Word
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-300">
              Sin Límites de Redacción
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Redacte memoriales, tutelas y recursos en un lienzo con la estética y herramientas de Microsoft Word, adaptado al derecho procesal colombiano.
          </p>
        </div>

        {/* Toggle de Modos */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('word_canvas')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'word_canvas' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Lienzo Hoja Word</span>
            </button>
            <button
              onClick={() => setActiveTab('structured_wizard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'structured_wizard' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Asistente Guiado</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO MODO 1: HOJA DE DOCUMENTO WORD PROFESIONAL */}
      {activeTab === 'word_canvas' && (
        <div className="space-y-4">
          
          {/* BARRA DE HERRAMIENTAS WORD (RIBBON TOOLBAR) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-3 sticky top-16 z-30 space-y-2.5">
            
            {/* Fila 1: Tipografía, Formato, Alineación e Interlineado */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-2 border-b border-slate-100">
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Selector de Fuente */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                  <Type className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={fontFamily}
                    onChange={e => setFontFamily(e.target.value as any)}
                    className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="Times New Roman">Times New Roman (Judicial)</option>
                    <option value="Arial">Arial (Corte Constitucional)</option>
                    <option value="Calibri">Calibri (Estándar)</option>
                    <option value="Georgia">Georgia (Elegante)</option>
                  </select>
                </div>

                {/* Selector de Tamaño */}
                <select
                  value={fontSize}
                  onChange={e => setFontSize(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="11pt">11 pt</option>
                  <option value="12pt">12 pt (Estándar CGP)</option>
                  <option value="14pt">14 pt (Títulos)</option>
                  <option value="16pt">16 pt (Encabezado)</option>
                </select>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {/* Alineación */}
                <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setAlignment('left')}
                    className={`p-1.5 rounded ${alignment === 'left' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                    title="Alinear a la izquierda"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAlignment('center')}
                    className={`p-1.5 rounded ${alignment === 'center' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                    title="Centrar"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAlignment('right')}
                    className={`p-1.5 rounded ${alignment === 'right' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                    title="Alinear a la derecha"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAlignment('justify')}
                    className={`p-1.5 rounded ${alignment === 'justify' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                    title="Justificar texto legal"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {/* Interlineado */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <span>Espacio:</span>
                  <select
                    value={lineHeight}
                    onChange={e => setLineHeight(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="1.15">1.15 Sencillo</option>
                    <option value="1.5">1.5 Procesal</option>
                    <option value="2.0">2.0 Doble</option>
                  </select>
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {/* Zoom */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-600">
                  <button onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))} title="Alejar">
                    <ZoomOut className="w-3 h-3 text-slate-500" />
                  </button>
                  <span className="font-mono text-[10px] w-8 text-center">{zoomLevel}%</span>
                  <button onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))} title="Acercar">
                    <ZoomIn className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Botones de Acción: Guardar, Descargar Word (.doc), Imprimir */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  title="Copiar texto"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleDownloadWord}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  title="Descargar como archivo de Microsoft Word (.doc)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Word (.doc)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  title="Imprimir o exportar PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>

                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Guardando...' : saveSuccess ? '¡Guardado!' : 'Guardar'}</span>
                </button>
              </div>

            </div>

            {/* Fila 2: Inserción Rápida de Cláusulas Procesales de 1-Clic */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mr-1">
                Insertar Cláusula:
              </span>
              <button
                onClick={() => insertClause('notificaciones_ley2213')}
                className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Notificaciones Ley 2213
              </button>
              <button
                onClick={() => insertClause('juramento_estimatorio')}
                className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Juramento Estimatorio (Art. 206 CGP)
              </button>
              <button
                onClick={() => insertClause('medidas_cautelares')}
                className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Medidas Cautelares (Art. 590 CGP)
              </button>
              <button
                onClick={() => insertClause('subsidiariedad_tutela')}
                className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Subsidiariedad Tutela
              </button>
              <button
                onClick={() => insertClause('jurisprudencia')}
                className="px-2.5 py-1 rounded-md bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Cita Jurisprudencial
              </button>
              <button
                onClick={() => insertClause('espacio_firma')}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Firma & T.P.
              </button>
            </div>

          </div>

          {/* LIENZO DE HOJA WORD (CANVAS) */}
          <div className="bg-slate-200/90 rounded-2xl p-6 md:p-10 flex justify-center overflow-x-auto min-h-[900px] border border-slate-300 shadow-inner">
            
            {/* Hoja de Papel en Pantalla */}
            <div 
              style={{ 
                fontFamily: fontFamily, 
                fontSize: fontSize, 
                lineHeight: lineHeight,
                textAlign: alignment,
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center'
              }}
              className="bg-white w-full max-w-[850px] min-h-[1100px] p-12 sm:p-16 rounded-sm shadow-2xl shadow-slate-400/50 border border-slate-300 flex flex-col justify-between transition-all relative"
            >
              
              {/* Encabezado Judicial Superior de la Hoja */}
              <div className="border-b border-slate-200 pb-3 mb-8 flex items-center justify-between text-[11px] text-slate-500 font-sans tracking-wider uppercase">
                <span className="font-bold flex items-center gap-1.5 text-slate-700">
                  <Stamp className="w-3.5 h-3.5 text-blue-600" />
                  REPÚBLICA DE COLOMBIA · RAMA JUDICIAL
                </span>
                <span className="font-mono text-[10px]">RADICACIÓN ELECTRÓNICA LEY 2213 DE 2022</span>
              </div>

              {/* Título Editable del Documento */}
              <div className="mb-6">
                <input
                  type="text"
                  value={documentTitle}
                  onChange={e => setDocumentTitle(e.target.value)}
                  className="w-full text-center font-bold text-base sm:text-lg border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent text-slate-900"
                  placeholder="TÍTULO DEL MEMORIAL O ACCIÓN JUDICIAL..."
                />
              </div>

              {/* Cuerpo del Documento (Editable Directamente en la Hoja) */}
              <div className="flex-1">
                <textarea
                  value={documentBody}
                  onChange={e => setDocumentBody(e.target.value)}
                  rows={32}
                  style={{
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    lineHeight: lineHeight,
                    textAlign: alignment
                  }}
                  className="w-full h-full p-2 bg-transparent focus:outline-none border-none resize-none text-slate-900 leading-relaxed focus:ring-0"
                  placeholder="Escriba libremente el contenido del memorial, tutela o petición legal..."
                />
              </div>

              {/* Pie de Página de la Hoja Word */}
              <div className="border-t border-slate-200 pt-3 mt-10 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                <span>GlobalLegal CO · Documento Oficial para Radicación</span>
                <span>Página 1 de {estimatedPages}</span>
              </div>

            </div>

          </div>

          {/* BARRA DE ESTADO WORD INFERIOR */}
          <div className="bg-slate-900 text-slate-300 px-4 py-2 rounded-xl text-xs flex flex-wrap items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-4">
              <span>Página 1 de {estimatedPages}</span>
              <span>{wordCount} palabras</span>
              <span>{charCount} caracteres</span>
              <span className="text-emerald-400 flex items-center gap-1 font-sans">
                <Check className="w-3 h-3" /> Español (Colombia) · Ley 2213
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span>Vista: Diseño de Impresión</span>
              <span className="text-blue-400">Zoom: {zoomLevel}%</span>
            </div>
          </div>

        </div>
      )}

      {/* CONTENIDO MODO 2: ASISTENTE ESTRUCTURADO (PLANTILLAS GUIADAS) */}
      {activeTab === 'structured_wizard' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Asistente de Estructuración Legal
              </h3>
              <p className="text-xs text-slate-500">
                Complete el formulario guiado y luego transfiera el texto generado a la Hoja Word para su edición final.
              </p>
            </div>

            {/* Selector de Caso Existente */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Vincular Caso:</span>
              <select
                value={selectedCaseId}
                onChange={e => handleCaseSelect(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-lg text-xs font-medium max-w-xs truncate"
              >
                <option value="">-- Redacción Independiente --</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} - {c.title.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tipo de Trámite Legal</label>
              <select
                value={templateType}
                onChange={e => setTemplateType(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="accion_tutela">Acción de Tutela (Art. 86 C.P. & Dec. 2591)</option>
                <option value="derecho_peticion">Derecho de Petición (Art. 23 C.P. & Ley 1755)</option>
                <option value="solicitud_conciliacion">Solicitud de Conciliación (Ley 2220)</option>
                <option value="memorial_impulso">Memorial de Impulso Procesal</option>
                <option value="solicitud_informacion">Solicitud de Información Pública (Ley 1712)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Asunto o Referencia</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Autoridad o Despacho Destinatario</label>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Correo Notificaciones Destinatario (Ley 2213)</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre del Apoderado / Abogado</label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tarjeta Profesional No.</label>
              <input
                type="text"
                value={authorProfessionalCard}
                onChange={e => setAuthorProfessionalCard(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Hechos y Pretensiones */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-xs uppercase">Hechos Jurídicos</span>
                <button
                  type="button"
                  onClick={() => setFacts([...facts, ''])}
                  className="text-blue-600 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Añadir Hecho
                </button>
              </div>
              <div className="space-y-2">
                {facts.map((fact, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{idx + 1}.</span>
                    <input
                      type="text"
                      value={fact}
                      onChange={e => {
                        const copy = [...facts];
                        copy[idx] = e.target.value;
                        setFacts(copy);
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      placeholder={`Hecho procesal ${idx + 1}...`}
                    />
                    {facts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFacts(facts.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-xs uppercase">Pretensiones o Peticiones</span>
                <button
                  type="button"
                  onClick={() => setClaims([...claims, ''])}
                  className="text-blue-600 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Añadir Pretensión
                </button>
              </div>
              <div className="space-y-2">
                {claims.map((claim, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{idx + 1}.</span>
                    <input
                      type="text"
                      value={claim}
                      onChange={e => {
                        const copy = [...claims];
                        copy[idx] = e.target.value;
                        setClaims(copy);
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      placeholder={`Pretensión procesal ${idx + 1}...`}
                    />
                    {claims.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setClaims(claims.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={transferWizardToWordCanvas}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generar y Transferir a Hoja Word</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
