output "budget_name" {
  description = "Nome do AWS Budget criado"
  value       = aws_budgets_budget.this.name
}