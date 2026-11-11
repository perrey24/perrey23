// Script de pruebas funcionales automatizadas E2E contra la API de LexFlow Colombia
const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('--- INICIANDO PRUEBAS FUNCIONALES E2E LEXFLOW COLOMBIA ---');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASÓ] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FALLÓ] ${name}:`, err.message);
    }
  }

  let sessionCookie = '';

  // 1. Health check
  await test('1. Health check responde con salvaguardas y motor de IA', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok' || !data.app) throw new Error('Respuesta inválida');
    if (!Array.isArray(data.safeguards) || data.safeguards.length === 0) throw new Error('Faltan salvaguardas');
  });

  // 2. Gobernanza institucional
  await test('2. Endpoint de Gobernanza e Integraciones Institucionales (/api/governance)', async () => {
    const res = await fetch(`${BASE_URL}/governance`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.integrations) || !Array.isArray(data.safeguards)) {
      throw new Error('Estructura de gobernanza incompleta');
    }
    const hasSuin = data.integrations.some(i => i.name.includes('SUIN-JURISCOL'));
    if (!hasSuin) throw new Error('No se reporta integración con SUIN-JURISCOL');
  });

  // 3. Autenticación y control de acceso RBAC
  await test('3. Autenticación con scrypt para Docente Supervisor (/api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'supervision@demo.local',
        password: 'Demo123!'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.user || data.user.role !== 'SUPERVISOR') throw new Error('Usuario o rol incorrecto');
    const cookieHeader = res.headers.get('set-cookie');
    if (cookieHeader) sessionCookie = cookieHeader.split(';')[0];
  });

  // 4. Repositorio de Fuentes Oficiales & Relatorías
  let createdSourceId = null;
  await test('4. Registro y convalidación de fuente oficial con HTTPS (/api/sources)', async () => {
    const payload = {
      title: 'Decreto 2591 de 1991 — Reglamentación de la Acción de Tutela',
      entity: 'Presidencia de la República / SUIN-JURISCOL',
      url: 'https://suin-juriscol.gov.co/viewDocument.asp?id=1384022',
      area: 'constitucional',
      note: 'Vigente. Término improrrogable de 10 días para fallo de primera instancia.'
    };

    const headers = { 'Content-Type': 'application/json' };
    if (sessionCookie) headers['Cookie'] = sessionCookie;

    const res = await fetch(`${BASE_URL}/sources`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id || data.status !== 'PENDING_REVIEW') throw new Error('Fuente no registrada como pendiente');
    createdSourceId = data.id;

    // Convalidar
    const verifyRes = await fetch(`${BASE_URL}/sources/${createdSourceId}/verify`, {
      method: 'POST',
      headers
    });
    if (!verifyRes.ok) throw new Error(`HTTP ${verifyRes.status} al convalidar`);
    const verified = await verifyRes.json();
    if (verified.status !== 'VERIFIED') throw new Error('No se convalidó la fuente');
  });

  // 5. Bitácora de Auditoría Inmutable
  await test('5. Consulta de bitácora de auditoría inmutable (/api/audit)', async () => {
    const res = await fetch(`${BASE_URL}/audit?limit=10`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const logs = await res.json();
    if (!Array.isArray(logs) || logs.length === 0) throw new Error('Bitácora vacía');
    const hasLoginOrSource = logs.some(l => l.event === 'LOGIN' || l.event === 'SOURCE_RECORDED' || l.event === 'SOURCE_VERIFIED');
    if (!hasLoginOrSource) throw new Error('No se encontró el evento auditado');
  });

  // 6. Metrics
  await test('6. Indicadores del Dashboard calculados con precisión (/api/metrics)', async () => {
    const res = await fetch(`${BASE_URL}/metrics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data.totalCases !== 'number' || data.totalCases < 1) throw new Error('Métricas vacías');
    if (!Array.isArray(data.casesByArea)) throw new Error('Distribución por área inválida');
  });

  // 7. Crear caso con Habeas Data
  let createdCaseId = null;
  await test('7. Creación de caso con consentimiento de datos personales (Ley 1581)', async () => {
    const payload = {
      caseNumber: 'RAD-2026-E2E-TEST',
      title: 'Proceso Verbal de Responsabilidad Civil Contractual E2E',
      legalArea: 'civil',
      procedureType: 'Verbal de Mayor Cuantía',
      facts: 'Incumplimiento de entrega de obra comercial pactada para entrega en agosto de 2026.',
      claims: '1. Declarar incumplimiento contractual. 2. Condenar al pago de cláusula penal por $25.000.000 COP.',
      plaintiff: {
        name: 'Inmobiliaria del Centro S.A.S.',
        idType: 'NIT',
        idNumber: '900.555.123-1',
        role: 'Demandante / Contratante',
        consent: true,
        consentDate: '2026-10-23',
        confidential: true
      },
      defendant: {
        name: 'Constructores Asociados Ltda.',
        idType: 'NIT',
        idNumber: '800.777.444-2',
        role: 'Demandado / Contratista'
      },
      authority: 'Juzgado 1 Civil del Circuito de Bogotá',
      status: 'activo',
      assignee: 'Dra. Laura Camila Soto (Abogada Senior)',
      nextAction: 'Notificación del mandamiento de pago',
      deadlineDate: '2026-10-31',
      estimatedValue: 25000000,
      consent: true,
      confidential: true
    };

    const res = await fetch(`${BASE_URL}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id || data.caseNumber !== 'RAD-2026-E2E-TEST') throw new Error('Caso no creado');
    createdCaseId = data.id;
  });

  // 8. Consultar y verificar persistencia
  await test('8. Verificación de persistencia del caso creado', async () => {
    const res = await fetch(`${BASE_URL}/cases/${createdCaseId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.title !== 'Proceso Verbal de Responsabilidad Civil Contractual E2E') throw new Error('Datos no coinciden');
  });

  // 9. Registrar actuación procesal
  let createdActionId = null;
  await test('9. Registro de actuación y cómputo de términos con reglas hábiles', async () => {
    const payload = {
      caseId: createdCaseId,
      title: 'Audiencia Inicial Art. 372 CGP',
      type: 'audiencia',
      date: '2026-10-25',
      time: '10:00',
      description: 'Diligencia virtual de conciliación, resolución de excepciones previas y fijación del litigio.',
      proceduralTermType: 'termino_procesal',
      legalVerificationStatus: 'pendiente_verificacion',
      legalVerificationNotes: 'Pendiente auto ejecutoriado'
    };

    const res = await fetch(`${BASE_URL}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id || typeof data.daysDiff !== 'number') throw new Error('Actuación no calculada');
    createdActionId = data.id;
  });

  // 10. Marcar actuación como cumplida
  await test('10. Toggle de actuación completada / cumplida', async () => {
    const res = await fetch(`${BASE_URL}/actions/${createdActionId}/toggle`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.isCompleted || data.urgency !== 'cumplido') throw new Error('Estado no cambió a cumplido');
  });

  // 11. Generador de Documentos
  await test('11. Generación de borrador de Derecho de Petición (Ley 1755 / Art. 23 CP)', async () => {
    const payload = {
      templateType: 'derecho_peticion',
      city: 'Barranquilla',
      date: '2026-10-19',
      recipientName: 'Superintendencia de Servicios Públicos Domiciliarios',
      authorName: 'María Fernanda Gómez',
      authorIdType: 'CC',
      authorIdNumber: '1.045.890.123',
      authorEmail: 'maria.gomez@correo.com',
      authorPhone: '+57 301 223 4455',
      authorAddress: 'Carrera 53 # 74-12',
      subject: 'Solicitud de investigación administrativa por cobro tarifario indebido',
      facts: [
        'La empresa de energía incrementó la tarifa en un 40% sin previo aviso ni fundamentación técnica.',
        'Se radicó reclamo ante la empresa prestadora el 10 de septiembre de 2026 sin obtener respuesta de fondo.'
      ],
      claims: [
        'Se ordene la reliquidación de las facturas objetadas.',
        'Se aplique el silencio administrativo positivo de conformidad con el Art. 158 de la Ley 142 de 1994.'
      ],
      annexes: [
        'Copia de las últimas 3 facturas de energía.',
        'Copia del radicado de reclamación con sello de recibido.'
      ]
    };

    const res = await fetch(`${BASE_URL}/drafts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.content.includes('DERECHO DE PETICIÓN') || !data.disclaimer) throw new Error('Borrador no generado');
    if (!data.content.includes('Artículo 23 de la Constitución Política')) throw new Error('Faltan fundamentos normativos');
  });

  // 12. Asistente Jurídico de IA con prospecto estratégico y minimización de PII
  await test('12. Asistente de IA con prospecto estratégico, audiencias y desacato (Ley 1581 / Dec. 2591)', async () => {
    const payload = {
      caseTitle: 'Acción de tutela por negación de cirugía vitrectomía',
      facts: 'El paciente Pedro Gómez, CC 70.123.456, tel 300 123 4567, correo pedro@test.com, requiere vitrectomía urgente y la EPS no autoriza.',
      legalArea: 'constitucional',
      currentDoubtOrNeed: 'Estructurar desacato, recursos y preparación de audiencia'
    };

    const res = await fetch(`${BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.timeline || !data.documentChecklist || !data.executiveSummary) {
      throw new Error('Respuesta del analizador incompleta');
    }
    if (data.piiMinimized !== true) {
      throw new Error('No se reportó la minimización de PII');
    }
    if (!data.strategicProspectus || !data.hearingPreparation || !data.remediesAndIncidentsStrategy) {
      throw new Error('Faltan módulos de prospecto estratégico o preparación de audiencias');
    }
    if (!data.remediesAndIncidentsStrategy.incidenteDesacatoGuide) {
      throw new Error('Falta guía específica de Incidente de Desacato');
    }
  });

  // 13. Chat conversacional con análisis de desacato y recursos
  await test('13. Chat conversacional con orientación sobre Incidente de Desacato y Consulta', async () => {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '¿Qué recursos proceden en un incidente de desacato según el Decreto 2591 de 1991?' }]
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.reply || !data.reply.includes('Consulta') || !data.reply.includes('Decreto 2591')) {
      throw new Error('Respuesta del chat no contiene orientación sobre Consulta y Decreto 2591');
    }
  });

  // 14. Eliminar caso de prueba
  await test('14. Eliminación del caso de prueba y limpieza en cascada', async () => {
    const res = await fetch(`${BASE_URL}/cases/${createdCaseId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('No se eliminó');
  });

  // 15. Comprobar que el frontend HTML se entrega en la raíz
  await test('15. Servidor web entrega la interfaz SPA de LexFlow en la raíz', async () => {
    const res = await fetch('http://localhost:3001/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes('LexFlow Colombia') && !html.includes('root')) {
      throw new Error('HTML no contiene el contenedor de la aplicación');
    }
  });

  console.log(`\n====================================================`);
  console.log(`RESULTADO FINAL DE PRUEBAS E2E: ${passed} / ${total} PRUEBAS PASADAS`);
  console.log(`====================================================`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
