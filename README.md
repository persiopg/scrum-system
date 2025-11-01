## Scrum System (Next.js)

Aplicação Next.js para gestão simples de sprints, tarefas e geração de relatório com IA.

### Como rodar (dev)

```powershell
npm install
npm run dev
```

Acesse http://localhost:3000.

---

## Usando IA local com Ollama

Esta app já está preparada para usar o Ollama local no endpoint `/api/report` (o botão "Gerar Relatório com IA" no dashboard chama essa rota).

- Endpoint do Ollama esperado: `http://localhost:11434`
- Modelo padrão: `llama3.1`

Você pode personalizar via variáveis de ambiente. Copie o arquivo `.env.local.example` para `.env.local` e ajuste se desejar:

```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

### Passo a passo no Windows (PowerShell)

1) Instale o Ollama para Windows se ainda não tiver: https://ollama.com/download

2) Baixe/rode um modelo (exemplo `llama3.1`):

```powershell
ollama run llama3.1
```

Isso fará o pull do modelo (primeira vez) e abrirá um REPL. Você pode fechar o REPL; o serviço continuará disponível em `http://localhost:11434` quando chamado pela API do app.

3) (Opcional) Verifique conectividade com o script de teste:

```powershell
$env:OLLAMA_BASE_URL="http://localhost:11434"; $env:OLLAMA_MODEL="llama3.1"; npm run test:ollama
```

Se tudo certo, verá a lista de modelos instalados e uma resposta simples da IA.

4) Rode a aplicação e gere o relatório no dashboard:

```powershell
npm run dev
```

Abra o dashboard, selecione cliente/sprints e clique em "Gerar Relatório com IA".

### Como funciona por baixo dos panos

A rota `src/app/api/report/route.ts`:

- Monta um prompt com dados de sprints/tarefas e faz `POST` para `OLLAMA_BASE_URL/api/generate`.
- Usa `stream: false` para resposta única (mais simples).
- Se a IA falhar, retorna um relatório mock para não quebrar a UI.

---

## Scripts úteis

- `npm run test:utils` – testa utilitários de tarefas.
- `npm run test:ollama` – valida acesso ao Ollama local e faz uma geração curta.

---

## Deploy

Para produção, garanta que as variáveis de ambiente do servidor estejam configuradas se for usar Ollama acessível pela rede. Caso contrário, o relatório cairá no fallback (mock).
