import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SprintData = {
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
};

type TaskData = {
  status?: string;
};

type MetricsData = {
  teamVelocity?: number;
  avgCompletionTime?: number;
  completionRate?: number;
  totalHoursSpent?: number;
};

type SprintSummaryData = {
  id?: string;
  clienteId?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  totalTasks?: number;
  completedTasks?: number;
  inProgressTasks?: number;
  pendingTasks?: number;
  totalHoursSpent?: number;
};

type ReportData = {
  scope?: 'global' | 'cliente';
  cliente?: { nome?: string };
  clientes?: { nome?: string }[];
  baseSprintId?: string | null;
  baseSprintSummary?: SprintSummaryData | null;
  comparisonSprintIds?: string[];
  comparisonSummaries?: SprintSummaryData[];
  sprints?: SprintData[];
  tasks?: TaskData[];
  metrics?: MetricsData;
  totals?: {
    totalClientes?: number;
    totalSprints?: number;
    totalTasks?: number;
  };
};

export async function POST(request: NextRequest) {
  try {
    const { data } = (await request.json()) as { data?: ReportData };
    const reportData = data ?? {};

    // Tenta gerar o relatório com IA local (Ollama); fallback assegura resposta
    try {
      const baseUrl = process.env.OLLAMA_BASE_URL?.replace(/\/+$/, "") || "http://localhost:11434";
      const model = process.env.OLLAMA_MODEL || "llama3.2:1b";

      const prompt = [
        "Você é um especialista em Scrum e gestão ágil. Analise os dados fornecidos e gere um relatório executivo detalhado e profissional em português brasileiro.",
        "",
        "DADOS FORNECIDOS:",
        `Escopo do Relatório: ${reportData.scope ?? 'não informado'}`,
        `Cliente Principal: ${JSON.stringify(reportData.cliente ?? {})}`,
        `Outros Clientes: ${JSON.stringify(reportData.clientes ?? [])}`,
        `Sprints Ativas/Inativas: ${JSON.stringify(reportData.sprints ?? [])}`,
        `Sprint Base para Análise: ${JSON.stringify(reportData.baseSprintSummary ?? null)}`,
        `Sprints para Comparação: ${JSON.stringify(reportData.comparisonSummaries ?? [])}`,
        `Tarefas Detalhadas: ${JSON.stringify(reportData.tasks ?? [])}`,
        `Métricas de Performance: ${JSON.stringify(reportData.metrics ?? {})}`,
        `Totais Gerais: ${JSON.stringify(reportData.totals ?? {})}`,
        "",
        "ESTRUTURA OBRIGATÓRIA DO RELATÓRIO:",
        "",
        "## 📊 Resumo Executivo",
        "- Visão geral do projeto/cliente",
        "- Status atual e principais indicadores",
        "- Pontos críticos identificados",
        "",
        "## 👥 Análise de Performance da Equipe",
        "- Velocidade média (tarefas por sprint)",
        "- Tempo médio de conclusão",
        "- Taxa de conclusão geral",
        "- Distribuição de carga de trabalho",
        "- Comparativo com sprints anteriores (se disponível)",
        "",
        "## 🎯 Status da Sprint Ativa",
        "- Nome e período da sprint",
        "- Progresso atual (tarefas concluídas/pendentes/em andamento)",
        "- Riscos e impedimentos potenciais",
        "- Previsão de conclusão",
        "",
        "## 📈 Métricas e Indicadores",
        "- Apresentar gráficos ou tabelas conceituais dos dados",
        "- Tendências identificadas",
        "- Benchmarks de performance",
        "",
        "## 💡 Recomendações Estratégicas",
        "- Melhorias imediatas (próxima sprint)",
        "- Ajustes de médio prazo",
        "- Sugestões para otimização de processos",
        "",
        "## 🔮 Previsões e Próximos Passos",
        "- Capacidade para próximos sprints",
        "- Riscos futuros identificados",
        "- Recomendações de planejamento",
        "",
        "INSTRUÇÕES DE FORMATAÇÃO:",
        "- Use Markdown com títulos hierárquicos (# ## ###)",
        "- Seja conciso mas informativo",
        "- Use bullet points e listas para clareza",
        "- Inclua emojis relevantes para melhor visualização",
        "- Foque em insights acionáveis baseados nos dados",
        "- Mantenha tom profissional e objetivo",
        "- Use português brasileiro formal",
        "",
        "IMPORTANTE: Baseie todas as análises exclusivamente nos dados fornecidos. Não invente informações. Se algum dado estiver faltando, mencione isso explicitamente.",
      ].join("\n");
      // Chamada ao Ollama /api/generate (sem stream)
      const resp = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
          },
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Falha no Ollama: ${resp.status} ${resp.statusText} - ${text}`);
      }

      const json = (await resp.json()) as { response?: string };
      const reportText = json?.response?.trim();

      if (reportText) {
        return NextResponse.json({ report: reportText });
      }

      throw new Error("Resposta vazia da IA local");
    } catch (aiError) {
      console.error("Erro na IA, usando relatório mock:", aiError);

      // Fallback para relatório mock se a IA falhar
      const mockReport = `# Relatório Executivo do Sistema Scrum

## Resumo Geral do Projeto
Escopo: ${reportData.scope ?? "Não informado"}
Cliente: ${reportData.cliente?.nome ?? "Não especificado"}
Clientes considerados: ${reportData.totals?.totalClientes ?? reportData.clientes?.length ?? (reportData.cliente ? 1 : 0)}
Total de Sprints: ${reportData.sprints?.length ?? 0}
Total de Tarefas: ${reportData.tasks?.length ?? 0}

## Análise de Performance da Equipe
- Velocidade da Equipe: ${reportData.metrics?.teamVelocity ?? 0} tarefas por sprint
- Tempo Médio de Conclusão: ${reportData.metrics?.avgCompletionTime ?? 0} dias
- Taxa de Conclusão: ${reportData.metrics?.completionRate ?? 0}%
- Horas Totais Registradas: ${reportData.metrics?.totalHoursSpent ?? 0}h

## Status Atual da Sprint Ativa
${(() => {
  const activeSprint = reportData.sprints?.find((sprint) => sprint?.isActive);
  const pendingTasks = reportData.tasks?.filter((task) => task?.status === "pending").length ?? 0;
  const inProgressTasks = reportData.tasks?.filter((task) => task?.status === "in-progress").length ?? 0;
  const completedTasks = reportData.tasks?.filter((task) => task?.status === "completed").length ?? 0;

  if (!activeSprint) {
    return "Nenhuma sprint ativa no momento.";
  }

  return `Sprint ativa: ${activeSprint.name ?? "Sem nome"}
Período: ${activeSprint.startDate ?? "N/A"} - ${activeSprint.endDate ?? "N/A"}
Tarefas pendentes: ${pendingTasks}
Tarefas em andamento: ${inProgressTasks}
Tarefas concluídas: ${completedTasks}`;
})()}

${(() => {
  if (!reportData.baseSprintSummary && (!reportData.comparisonSummaries || reportData.comparisonSummaries.length === 0)) {
    return '';
  }
  const lines: string[] = [];
  if (reportData.baseSprintSummary) {
    lines.push(`## Sprint Base Considerada\n- Sprint: ${reportData.baseSprintSummary.name ?? 'Sem nome'}\n- Tarefas: ${reportData.baseSprintSummary.totalTasks ?? 0}\n- Concluídas: ${reportData.baseSprintSummary.completedTasks ?? 0}\n- Horas: ${reportData.baseSprintSummary.totalHoursSpent ?? 0}h`);
  }
  if (reportData.comparisonSummaries && reportData.comparisonSummaries.length > 0) {
    lines.push('## Comparativo de Sprints');
    reportData.comparisonSummaries.forEach((summary, index) => {
      lines.push(`- Sprint ${index + 1}: ${summary.name ?? 'Sem nome'} | Tarefas: ${summary.totalTasks ?? 0} | Concluídas: ${summary.completedTasks ?? 0} | Horas: ${summary.totalHoursSpent ?? 0}h`);
    });
  }
  return lines.join('\n\n');
})()}

## Recomendações para Melhorias
1. Manter o foco na conclusão das tarefas pendentes
2. Monitorar a velocidade da equipe regularmente
3. Implementar revisões de sprint para identificar melhorias

## Previsões para Próximos Sprints
Com base na performance atual, a equipe pode manter uma velocidade consistente de ${reportData.metrics?.teamVelocity ?? 0} tarefas por sprint.

${(() => {
  if (reportData.totals) {
    return `## Totais do Escopo
- Clientes: ${reportData.totals.totalClientes ?? 0}
- Sprints: ${reportData.totals.totalSprints ?? 0}
- Tarefas: ${reportData.totals.totalTasks ?? 0}`;
  }
  return '';
})()}

*Nota: Relatório gerado por IA não disponível no momento. Usando dados mock.*`;

      return NextResponse.json({ report: mockReport });
    }
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
