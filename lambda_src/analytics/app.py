"""
Lambda Analytics - CloudTrilhas
Função que lê dados do DynamoDB e gera métricas agregadas para o dashboard.

Handlers:
  - lambda_handler: responde a requisições GET /analytics via API Gateway (HTTP API v2)
  - report_handler: gera relatório em texto e publica no SNS (EventBridge scheduled)
"""

import json
import os
import boto3
from datetime import datetime, timedelta, timezone
from collections import defaultdict


# ============================================================================
# Configuração
# ============================================================================

dynamodb = boto3.resource("dynamodb")
sns = boto3.client("sns")
ce = boto3.client("ce", region_name="us-east-1")  # Cost Explorer só funciona em us-east-1

TABLE_NAME = os.environ.get("LEADS_TABLE_NAME", "leads")
SNS_TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN", "")

# Headers CORS padrão para respostas HTTP
CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


# ============================================================================
# Funções auxiliares
# ============================================================================


def mask_email(email: str) -> str:
    """
    Mascara o email para privacidade.
    Exibe os 2 primeiros caracteres + *** + domínio.
    Exemplo: ricardo@gmail.com -> ri***@gmail.com
    """
    if not email or "@" not in email:
        return "***@***"
    local, domain = email.split("@", 1)
    masked_local = local[:2] + "***" if len(local) >= 2 else "***"
    return f"{masked_local}@{domain}"


def scan_all_items(table) -> list:
    """
    Realiza scan completo da tabela DynamoDB.
    Lida com paginação automática caso a tabela exceda 1MB por scan.
    """
    items = []
    response = table.scan()
    items.extend(response.get("Items", []))

    # Paginação: continua enquanto houver LastEvaluatedKey
    while "LastEvaluatedKey" in response:
        response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
        items.extend(response.get("Items", []))

    return items


def parse_date(created_at: str) -> datetime | None:
    """
    Faz parse de uma string ISO 8601 para datetime.
    Retorna None se não conseguir fazer o parse.
    """
    if not created_at:
        return None
    try:
        # Suporta formatos com e sem timezone
        if created_at.endswith("Z"):
            created_at = created_at[:-1] + "+00:00"
        return datetime.fromisoformat(created_at)
    except (ValueError, TypeError):
        return None


def filter_by_period(items: list, days: int) -> list:
    """
    Filtra itens pelo período especificado (últimos N dias).
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    filtered = []
    for item in items:
        created_at = item.get("created_at", "")
        dt = parse_date(created_at)
        if dt:
            # Garante que o datetime tenha timezone para comparação
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt >= cutoff:
                filtered.append(item)
        else:
            # Itens sem data válida são incluídos para não perder dados
            filtered.append(item)

    return filtered


def aggregate_metrics(items: list, days: int) -> dict:
    """
    Agrega os dados em métricas estruturadas.
    Retorna o dicionário completo de analytics.
    """
    now = datetime.now(timezone.utc)

    # Contadores principais
    total_records = len(items)
    unique_emails = set()
    total_trail_access = 0
    total_simulado_access = 0
    total_simulado_results = 0
    total_downloads = 0

    # Agregações por categoria
    trails_count = defaultdict(int)
    sources_count = defaultdict(int)
    institutions_count = defaultdict(int)
    simulados_data = defaultdict(lambda: {"access": 0, "results": 0, "scores": []})
    timeline_count = defaultdict(int)
    recent_records = []

    # Período para timeline (últimos N dias)
    cutoff_timeline = now - timedelta(days=days)

    for item in items:
        record_type = item.get("type", "")
        email = item.get("email", "")
        name = item.get("name", "")
        page = item.get("page", "")
        source = item.get("source", "")
        institution = item.get("institution", "")
        created_at = item.get("created_at", "")
        score = item.get("score")
        percent = item.get("percent")

        # Usuários únicos (por email)
        if email:
            unique_emails.add(email.lower().strip())

        # Contagem por tipo de registro
        if record_type == "trail-access":
            total_trail_access += 1
            if page:
                trails_count[page] += 1

        elif record_type == "simulado-access":
            total_simulado_access += 1
            if page:
                simulados_data[page]["access"] += 1

        elif record_type == "simulado-result":
            total_simulado_results += 1
            if page:
                simulados_data[page]["results"] += 1
                # Adiciona score para cálculo de média
                if percent is not None:
                    try:
                        simulados_data[page]["scores"].append(float(percent))
                    except (ValueError, TypeError):
                        pass

        elif record_type == "lead":
            # Leads são registros de captura (downloads/formulários)
            total_downloads += 1

        # Fonte (source) - conta para todos os tipos
        if source:
            sources_count[source] += 1

        # Instituição - conta para todos os tipos
        if institution:
            institutions_count[institution] += 1

        # Timeline - agrupa por data (YYYY-MM-DD)
        dt = parse_date(created_at)
        if dt:
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt >= cutoff_timeline:
                date_key = dt.strftime("%Y-%m-%d")
                timeline_count[date_key] += 1

        # Registros recentes (para lista de usuários)
        if name and created_at:
            recent_records.append({
                "name": name,
                "email": mask_email(email) if email else "",
                "page": page,
                "date": created_at[:10] if len(created_at) >= 10 else created_at,
                "created_at_raw": created_at,
            })

    # Ordena registros recentes por data (mais recente primeiro)
    recent_records.sort(key=lambda x: x.get("created_at_raw", ""), reverse=True)
    recent_users = [
        {
            "name": r["name"],
            "email": r["email"],
            "page": r["page"],
            "date": r["date"],
        }
        for r in recent_records[:20]  # Últimos 20
    ]

    # Ordena trails, sources e institutions por contagem (decrescente)
    trails_sorted = dict(
        sorted(trails_count.items(), key=lambda x: x[1], reverse=True)
    )
    sources_sorted = dict(
        sorted(sources_count.items(), key=lambda x: x[1], reverse=True)
    )
    institutions_sorted = dict(
        sorted(institutions_count.items(), key=lambda x: x[1], reverse=True)
    )

    # Timeline ordenada por data (crescente)
    timeline_sorted = dict(sorted(timeline_count.items()))

    # Simulados com média de score
    simulados_result = {}
    for page, data in sorted(simulados_data.items(), key=lambda x: x[1]["access"], reverse=True):
        avg_score = 0
        if data["scores"]:
            avg_score = round(sum(data["scores"]) / len(data["scores"]), 1)
        simulados_result[page] = {
            "access": data["access"],
            "results": data["results"],
            "avg_score": avg_score,
        }

    # Monta resposta final
    return {
        "generated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "summary": {
            "total_records": total_records,
            "unique_users": len(unique_emails),
            "total_trail_access": total_trail_access,
            "total_simulado_access": total_simulado_access,
            "total_simulado_results": total_simulado_results,
            "total_downloads": total_downloads,
        },
        "trails": trails_sorted,
        "sources": sources_sorted,
        "institutions": institutions_sorted,
        "simulados": simulados_result,
        "timeline": timeline_sorted,
        "recent_users": recent_users,
    }


def build_report_text(metrics: dict) -> str:
    """
    Gera relatório em texto plano para envio por email/SNS.
    """
    summary = metrics["summary"]
    lines = [
        "=" * 50,
        "📊 RELATÓRIO CLOUDTRILHAS - ANALYTICS",
        "=" * 50,
        f"Gerado em: {metrics['generated_at']}",
        "",
        "── RESUMO GERAL ──",
        f"  Total de registros: {summary['total_records']}",
        f"  Usuários únicos: {summary['unique_users']}",
        f"  Acessos a trilhas: {summary['total_trail_access']}",
        f"  Acessos a simulados: {summary['total_simulado_access']}",
        f"  Resultados de simulados: {summary['total_simulado_results']}",
        f"  Downloads/Leads: {summary['total_downloads']}",
        "",
    ]

    # Top 5 trilhas mais acessadas
    if metrics["trails"]:
        lines.append("── TOP 5 TRILHAS ──")
        for i, (trail, count) in enumerate(list(metrics["trails"].items())[:5], 1):
            lines.append(f"  {i}. {trail} ({count} acessos)")
        lines.append("")

    # Top 5 fontes
    if metrics["sources"]:
        lines.append("── TOP 5 FONTES ──")
        for i, (source, count) in enumerate(list(metrics["sources"].items())[:5], 1):
            lines.append(f"  {i}. {source} ({count})")
        lines.append("")

    # Top 5 instituições
    if metrics["institutions"]:
        lines.append("── TOP 5 INSTITUIÇÕES ──")
        for i, (inst, count) in enumerate(list(metrics["institutions"].items())[:5], 1):
            lines.append(f"  {i}. {inst} ({count})")
        lines.append("")

    # Simulados com resultados
    if metrics["simulados"]:
        lines.append("── SIMULADOS ──")
        for page, data in list(metrics["simulados"].items())[:5]:
            lines.append(
                f"  • {page}: {data['access']} acessos, "
                f"{data['results']} resultados, média {data['avg_score']}%"
            )
        lines.append("")

    # Timeline (últimos 7 dias)
    if metrics["timeline"]:
        lines.append("── ATIVIDADE RECENTE (últimos dias) ──")
        for date, count in list(metrics["timeline"].items())[-7:]:
            lines.append(f"  {date}: {'█' * min(count, 30)} ({count})")
        lines.append("")

    lines.append("=" * 50)
    lines.append("Relatório gerado automaticamente pelo CloudTrilhas Analytics")
    lines.append("=" * 50)

    return "\n".join(lines)


def get_aws_costs() -> dict:
    """
    Consulta Cost Explorer para custos do mês atual.
    Retorna total, breakdown por serviço e custos diários.
    """
    try:
        now = datetime.now(timezone.utc)
        start_of_month = now.strftime("%Y-%m-01")
        today = now.strftime("%Y-%m-%d")

        # Se estamos no dia 1, não há dados ainda
        if start_of_month == today:
            return None

        # Total por serviço
        response = ce.get_cost_and_usage(
            TimePeriod={"Start": start_of_month, "End": today},
            Granularity="MONTHLY",
            Metrics=["UnblendedCost"],
            GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}],
        )

        services = {}
        total = 0.0
        for group in response.get("ResultsByTime", [{}])[0].get("Groups", []):
            svc_name = group["Keys"][0]
            amount = float(group["Metrics"]["UnblendedCost"]["Amount"])
            if amount > 0.001:
                services[svc_name] = round(amount, 4)
                total += amount

        # Custos diários
        daily_response = ce.get_cost_and_usage(
            TimePeriod={"Start": start_of_month, "End": today},
            Granularity="DAILY",
            Metrics=["UnblendedCost"],
        )

        daily = {}
        for day in daily_response.get("ResultsByTime", []):
            date = day["TimePeriod"]["Start"]
            amount = float(day["Total"]["UnblendedCost"]["Amount"])
            daily[date] = round(amount, 4)

        return {
            "total": round(total, 2),
            "services": services,
            "daily": daily,
            "period": f"{start_of_month} a {today}",
        }

    except Exception as e:
        print(f"[AVISO] Erro ao consultar Cost Explorer: {e}")
        return None


# ============================================================================
# Handlers Lambda
# ============================================================================


def lambda_handler(event, context):
    """
    Handler principal - responde a GET /analytics via API Gateway HTTP API v2.
    Aceita query parameter ?period=7 ou ?period=30 (padrão: 30 dias).
    """
    try:
        # Extrai parâmetro de período da query string (formato API Gateway v2)
        query_params = event.get("queryStringParameters") or {}
        period = int(query_params.get("period", "30"))

        # Valida período (entre 1 e 365 dias)
        period = max(1, min(365, period))

        # Lê todos os itens da tabela
        table = dynamodb.Table(TABLE_NAME)
        all_items = scan_all_items(table)

        # Filtra por período
        filtered_items = filter_by_period(all_items, period)

        # Agrega métricas
        metrics = aggregate_metrics(filtered_items, period)

        # Busca custos AWS (apenas se período >= 7 dias)
        if period >= 7:
            metrics["costs"] = get_aws_costs()

        # Retorna resposta HTTP com CORS
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(metrics, ensure_ascii=False),
        }

    except Exception as e:
        print(f"[ERRO] Falha ao gerar analytics: {str(e)}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps(
                {"error": "Erro interno ao gerar analytics", "detail": str(e)},
                ensure_ascii=False,
            ),
        }


def report_handler(event, context):
    """
    Handler para relatório agendado - disparado pelo EventBridge.
    Gera métricas dos últimos 7 dias e publica no SNS como relatório em texto.
    """
    try:
        # Lê todos os itens da tabela
        table = dynamodb.Table(TABLE_NAME)
        all_items = scan_all_items(table)

        # Filtra últimos 7 dias para o relatório
        filtered_items = filter_by_period(all_items, days=7)

        # Agrega métricas
        metrics = aggregate_metrics(filtered_items, days=7)

        # Gera texto do relatório
        report_text = build_report_text(metrics)

        # Publica no SNS
        if SNS_TOPIC_ARN:
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject="📊 Relatório Semanal - CloudTrilhas Analytics",
                Message=report_text,
            )
            print(f"[INFO] Relatório publicado no SNS: {SNS_TOPIC_ARN}")
        else:
            print("[AVISO] SNS_TOPIC_ARN não configurado. Relatório não enviado.")
            print(report_text)

        return {
            "statusCode": 200,
            "body": json.dumps(
                {
                    "message": "Relatório gerado com sucesso",
                    "records_analyzed": metrics["summary"]["total_records"],
                    "published_to_sns": bool(SNS_TOPIC_ARN),
                },
                ensure_ascii=False,
            ),
        }

    except Exception as e:
        print(f"[ERRO] Falha ao gerar relatório: {str(e)}")
        raise e
