(async () => {
  try {
    const baseUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
    const model = process.env.OLLAMA_MODEL || 'llama3.1';

    console.log(`▶ Verificando Ollama em: ${baseUrl}`);

    // 1) Listar modelos instalados
    const tagsRes = await fetch(`${baseUrl}/api/tags`).catch(err => ({ ok: false, statusText: String(err) }));
    if (!tagsRes || !tagsRes.ok) {
      throw new Error(`Não foi possível acessar ${baseUrl}/api/tags (${tagsRes && tagsRes.statusText})`);
    }
    const tags = await tagsRes.json();
    const names = Array.isArray(tags?.models) ? tags.models.map(m => m.name).join(', ') : 'formato inesperado';
    console.log(`✓ Modelos instalados: ${names}`);

    // 2) Gerar uma resposta curta
    console.log(`▶ Solicitando geração com modelo: ${model}`);
    const genRes = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: 'Responda apenas com: OK', stream: false })
    });
    if (!genRes.ok) {
      const text = await genRes.text().catch(() => '');
      throw new Error(`Falha ao gerar: ${genRes.status} ${genRes.statusText} - ${text}`);
    }
    const out = await genRes.json();
    console.log('✓ Resposta da IA:', out?.response?.trim());

    console.log('\nTudo certo! O Ollama local está acessível.');
  } catch (err) {
    console.error('\n✗ Erro ao testar o Ollama local:', err?.message || err);
    process.exit(1);
  }
})();
