import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

    // Tenta gerar o relatório com a IA; fallback assegura resposta
    try {
      if (!genAI) {
        throw new Error("GOOGLE_API_KEY não configurada");
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = [
        "Analise os seguintes dados do sistema Scrum e gere um relatório executivo detalhado em português:",
  `Escopo do Relatório: ${reportData.scope ?? 'não informado'}`,
        `Dados do Cliente: ${JSON.stringify(reportData.cliente ?? {})}`,
  `Outros Clientes: ${JSON.stringify(reportData.clientes ?? [])}`,
        `Sprints: ${JSON.stringify(reportData.sprints ?? [])}`,
  `Sprint Base: ${JSON.stringify(reportData.baseSprintSummary ?? null)}`,
  `Sprints para Comparação: ${JSON.stringify(reportData.comparisonSummaries ?? [])}`,
        `Tarefas: ${JSON.stringify(reportData.tasks ?? [])}`,
        `Métricas: ${JSON.stringify(reportData.metrics ?? {})}`,
  `Totais: ${JSON.stringify(reportData.totals ?? {})}`,
        "",
        "O relatório deve incluir:",
        "1. Resumo geral do projeto",
        "2. Análise de performance da equipe",
        "3. Status atual da sprint ativa",
        "4. Recomendações para melhorias",
        "5. Previsões para próximos sprints",
        "",
        "Formate o relatório em Markdown com seções claras e títulos descritivos.",
        "Use português brasileiro para todo o conteúdo.",
        "Seja específico e use os dados fornecidos para fazer análises concretas.",
      ].join("\n");

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const report = response.text();

      if (report?.trim()) {
        return NextResponse.json({ report });
      }

      throw new Error("Resposta vazia da IA");
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
