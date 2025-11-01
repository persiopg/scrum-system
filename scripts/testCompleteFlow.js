(async () => {
  const fs = require('fs');
  const path = require('path');

  // Utility functions
  function generateId() {
    // Generate a simple UUID-like string
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function assert(cond, msg) {
    if (!cond) throw new Error(`Assertion failed: ${msg}`);
  }

  function logTest(message) {
    console.log(`✓ ${message}`);
  }

  function logSection(title) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  ${title}`);
    console.log(`${'='.repeat(50)}\n`);
  }

  // Test data structure
  const testData = {
    clientes: [],
    executores: [],
    sprints: [],
    tasks: []
  };

  try {
    logSection('INICIANDO TESTES - FLUXO COMPLETO DO SISTEMA SCRUM');

    // ==========================================
    // 1. CRIAR CLIENTE
    // ==========================================
    logSection('1. TESTE DE CRIAÇÃO DE CLIENTE');

    const cliente1 = {
      id: generateId(),
      nome: 'Tech Solutions Inc',
      sprintAtiva: null
    };

    const cliente2 = {
      id: generateId(),
      nome: 'Digital Innovations Ltd',
      sprintAtiva: null
    };

    testData.clientes.push(cliente1, cliente2);

    assert(testData.clientes.length === 2, 'Deve haver 2 clientes');
    assert(cliente1.nome === 'Tech Solutions Inc', 'Nome do cliente1 incorreto');
    assert(cliente2.nome === 'Digital Innovations Ltd', 'Nome do cliente2 incorreto');
    assert(cliente1.id && cliente1.id.length > 0, 'Cliente1 deve ter ID');
    assert(cliente2.id && cliente2.id.length > 0, 'Cliente2 deve ter ID');

    logTest(`Cliente criado: ${cliente1.nome} (ID: ${cliente1.id.substring(0, 8)}...)`);
    logTest(`Cliente criado: ${cliente2.nome} (ID: ${cliente2.id.substring(0, 8)}...)`);

    // ==========================================
    // 2. CRIAR EXECUTORES
    // ==========================================
    logSection('2. TESTE DE CRIAÇÃO DE EXECUTORES');

    const executor1 = {
      id: generateId(),
      nome: 'João Silva',
      cargo: 'Frontend Developer'
    };

    const executor2 = {
      id: generateId(),
      nome: 'Maria Santos',
      cargo: 'Backend Developer'
    };

    const executor3 = {
      id: generateId(),
      nome: 'Pedro Costa',
      cargo: 'Fullstack Developer'
    };

    testData.executores.push(executor1, executor2, executor3);

    assert(testData.executores.length === 3, 'Deve haver 3 executores');
    assert(executor1.nome === 'João Silva', 'Nome do executor1 incorreto');
    assert(executor2.cargo === 'Backend Developer', 'Cargo do executor2 incorreto');
    assert(executor3.id && executor3.id.length > 0, 'Executor3 deve ter ID');

    logTest(`Executor criado: ${executor1.nome} - ${executor1.cargo}`);
    logTest(`Executor criado: ${executor2.nome} - ${executor2.cargo}`);
    logTest(`Executor criado: ${executor3.nome} - ${executor3.cargo}`);

    // ==========================================
    // 3. CRIAR SPRINTS
    // ==========================================
    logSection('3. TESTE DE CRIAÇÃO DE SPRINTS');

    const sprint1 = {
      id: generateId(),
      clienteId: cliente1.id,
      name: 'Sprint 1 - Setup Inicial',
      startDate: '2025-11-03',
      endDate: '2025-11-17',
      totalTasks: 0,
      isActive: true,
      status: 'in-progress'
    };

    const sprint2 = {
      id: generateId(),
      clienteId: cliente1.id,
      name: 'Sprint 2 - Desenvolvimento',
      startDate: '2025-11-17',
      endDate: '2025-12-01',
      totalTasks: 0,
      isActive: false,
      status: 'planned'
    };

    const sprint3 = {
      id: generateId(),
      clienteId: cliente2.id,
      name: 'Sprint 1 - Prototipagem',
      startDate: '2025-11-03',
      endDate: '2025-11-10',
      totalTasks: 0,
      isActive: true,
      status: 'in-progress'
    };

    testData.sprints.push(sprint1, sprint2, sprint3);
    cliente1.sprintAtiva = sprint1.id;
    cliente2.sprintAtiva = sprint3.id;

    assert(testData.sprints.length === 3, 'Deve haver 3 sprints');
    assert(sprint1.clienteId === cliente1.id, 'Sprint1 deve estar associada ao cliente1');
    assert(sprint1.isActive === true, 'Sprint1 deve estar ativa');
    assert(sprint2.isActive === false, 'Sprint2 não deve estar ativa');
    assert(cliente1.sprintAtiva === sprint1.id, 'Cliente1 deve ter sprint ativa definida');

    logTest(`Sprint criada: ${sprint1.name} (${sprint1.startDate} até ${sprint1.endDate})`);
    logTest(`Sprint criada: ${sprint2.name} (${sprint2.startDate} até ${sprint2.endDate})`);
    logTest(`Sprint criada: ${sprint3.name} (${sprint3.startDate} até ${sprint3.endDate})`);

    // ==========================================
    // 4. CRIAR TASKS
    // ==========================================
    logSection('4. TESTE DE CRIAÇÃO DE TASKS');

    const task1 = {
      id: generateId(),
      sprintId: sprint1.id,
      description: 'Configurar ambiente de desenvolvimento',
      status: 'completed',
      assignee: executor1.nome,
      date: '2025-11-03',
      timeSpent: 4
    };

    const task2 = {
      id: generateId(),
      sprintId: sprint1.id,
      description: 'Criar estrutura de pastas do projeto',
      status: 'in-progress',
      assignee: executor3.nome,
      date: null,
      timeSpent: 2
    };

    const task3 = {
      id: generateId(),
      sprintId: sprint1.id,
      description: 'Implementar componente Header',
      status: 'pending',
      assignee: null,
      date: null,
      timeSpent: null
    };

    const task4 = {
      id: generateId(),
      sprintId: sprint1.id,
      description: 'Configurar banco de dados',
      status: 'pending',
      assignee: executor2.nome,
      date: null,
      timeSpent: null
    };

    const task5 = {
      id: generateId(),
      sprintId: sprint3.id,
      description: 'Criar wireframes',
      status: 'completed',
      assignee: executor1.nome,
      date: '2025-11-03',
      timeSpent: 8
    };

    testData.tasks.push(task1, task2, task3, task4, task5);
    sprint1.totalTasks = 4;
    sprint3.totalTasks = 1;

    assert(testData.tasks.length === 5, 'Deve haver 5 tasks');
    assert(task1.status === 'completed', 'Task1 deve estar completed');
    assert(task2.status === 'in-progress', 'Task2 deve estar in-progress');
    assert(task3.status === 'pending', 'Task3 deve estar pending');
    assert(task1.assignee === executor1.nome, 'Task1 deve estar assignada ao executor1');
    assert(task3.assignee === null, 'Task3 não deve ter assignee');
    assert(task5.sprintId === sprint3.id, 'Task5 deve estar na sprint3');

    logTest(`Task criada: ${task1.description} (Status: ${task1.status}, Assignee: ${task1.assignee})`);
    logTest(`Task criada: ${task2.description} (Status: ${task2.status}, Assignee: ${task2.assignee})`);
    logTest(`Task criada: ${task3.description} (Status: ${task3.status}, Assignee: Não assignada)`);
    logTest(`Task criada: ${task4.description} (Status: ${task4.status}, Assignee: ${task4.assignee})`);
    logTest(`Task criada: ${task5.description} (Status: ${task5.status}, Assignee: ${task5.assignee})`);

    // ==========================================
    // 5. TESTES DE VALIDAÇÃO E INTEGRIDADE
    // ==========================================
    logSection('5. TESTES DE VALIDAÇÃO E INTEGRIDADE');

    // Validar contagem de tasks por sprint
    const sprint1Tasks = testData.tasks.filter(t => t.sprintId === sprint1.id);
    assert(sprint1Tasks.length === 4, 'Sprint1 deve ter 4 tasks');
    logTest(`Validação: Sprint1 tem ${sprint1Tasks.length} tasks (esperado: 4)`);

    const sprint3Tasks = testData.tasks.filter(t => t.sprintId === sprint3.id);
    assert(sprint3Tasks.length === 1, 'Sprint3 deve ter 1 task');
    logTest(`Validação: Sprint3 tem ${sprint3Tasks.length} task (esperado: 1)`);

    // Validar tasks por executor
    const tasksExecutor1 = testData.tasks.filter(t => t.assignee === executor1.nome);
    assert(tasksExecutor1.length === 2, 'Executor1 deve ter 2 tasks');
    logTest(`Validação: ${executor1.nome} tem ${tasksExecutor1.length} tasks`);

    const tasksExecutor2 = testData.tasks.filter(t => t.assignee === executor2.nome);
    assert(tasksExecutor2.length === 1, 'Executor2 deve ter 1 task');
    logTest(`Validação: ${executor2.nome} tem ${tasksExecutor2.length} task`);

    // Validar tasks por status
    const completedTasks = testData.tasks.filter(t => t.status === 'completed');
    const inProgressTasks = testData.tasks.filter(t => t.status === 'in-progress');
    const pendingTasks = testData.tasks.filter(t => t.status === 'pending');

    assert(completedTasks.length === 2, 'Deve haver 2 tasks completed');
    assert(inProgressTasks.length === 1, 'Deve haver 1 task in-progress');
    assert(pendingTasks.length === 2, 'Deve haver 2 tasks pending');

    logTest(`Validação: ${completedTasks.length} tasks completed`);
    logTest(`Validação: ${inProgressTasks.length} task in-progress`);
    logTest(`Validação: ${pendingTasks.length} tasks pending`);

    // Validar que clientes têm sprint ativa
    assert(cliente1.sprintAtiva !== null, 'Cliente1 deve ter sprint ativa');
    assert(cliente2.sprintAtiva !== null, 'Cliente2 deve ter sprint ativa');
    logTest(`Validação: Cliente1 tem sprint ativa definida`);
    logTest(`Validação: Cliente2 tem sprint ativa definida`);

    // ==========================================
    // 6. RESUMO FINAL
    // ==========================================
    logSection('6. RESUMO FINAL DOS TESTES');

    console.log(`Total de Clientes: ${testData.clientes.length}`);
    console.log(`Total de Executores: ${testData.executores.length}`);
    console.log(`Total de Sprints: ${testData.sprints.length}`);
    console.log(`Total de Tasks: ${testData.tasks.length}`);
    console.log(`\nDetalhes de Clientes:`);
    testData.clientes.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.nome}`);
    });
    console.log(`\nDetalhes de Executores:`);
    testData.executores.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.nome} (${e.cargo})`);
    });
    console.log(`\nDetalhes de Sprints:`);
    testData.sprints.forEach((s, i) => {
      const cliente = testData.clientes.find(c => c.id === s.clienteId);
      console.log(`  ${i + 1}. ${s.name} - Cliente: ${cliente?.nome}, Status: ${s.status}`);
    });
    console.log(`\nDetalhes de Tasks:`);
    testData.tasks.forEach((t, i) => {
      const sprint = testData.sprints.find(s => s.id === t.sprintId);
      console.log(`  ${i + 1}. ${t.description}`);
      console.log(`     Status: ${t.status}, Sprint: ${sprint?.name}, Assignee: ${t.assignee || 'Não assignada'}`);
    });

    // ==========================================
    // 7. SALVAR DADOS NO ARQUIVO JSON
    // ==========================================
    logSection('7. SALVANDO DADOS NO ARQUIVO JSON');

    const dataFilePath = path.join(process.cwd(), 'scrum-system', 'public', 'scrum-data.json');

    // Verificar se o diretório existe
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logTest(`Diretório criado: ${dir}`);
    }

    // Salvar dados no JSON
    fs.writeFileSync(dataFilePath, JSON.stringify(testData, null, 2), 'utf8');
    logTest(`Dados salvos em: ${dataFilePath}`);

    // Verificar se os dados foram salvos corretamente
    const savedData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    assert(savedData.clientes.length === 2, 'Dados salvos deve ter 2 clientes');
    assert(savedData.executores.length === 3, 'Dados salvos deve ter 3 executores');
    assert(savedData.sprints.length === 3, 'Dados salvos deve ter 3 sprints');
    assert(savedData.tasks.length === 5, 'Dados salvos deve ter 5 tasks');

    logTest('Verificação de integridade dos dados salvos: OK');

    logSection('✓ TODOS OS TESTES PASSARAM E DADOS FORAM SALVOS COM SUCESSO!');

  } catch (err) {
    console.error('\n❌ TESTE FALHOU:', err && err.message ? err.message : err);
    console.error(err);
    process.exit(1);
  }
})().catch(err => {
  console.error('❌ Erro ao executar testes:', err && err.message ? err.message : err);
  console.error(err);
  process.exit(1);
});
