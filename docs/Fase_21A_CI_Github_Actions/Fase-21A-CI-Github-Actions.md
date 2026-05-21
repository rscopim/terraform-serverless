# Fase 22A — CI Seguro com GitHub Actions

## 🎯 Objetivo

Criar pipeline CI (Continuous Integration) utilizando GitHub Actions para validação automática da infraestrutura Terraform antes da implantação.
Objetivo:
Automatizar validações e aumentar segurança operacional.

---

## 🏗️ O que foi criado

* GitHub Actions Workflow
* Integração GitHub + AWS
* OIDC Provider
* IAM Role temporária
* Terraform Validate automático
* Terraform Plan automático
* Terraform Format Check automático

---

## 🧠 Conceitos importantes

### Continuous Integration (CI)

Prática utilizada para validar automaticamente alterações enviadas ao repositório.
Objetivo:
* Reduzir erros
* Garantir qualidade
* Automatizar verificações

---

### GitHub Actions

Serviço utilizado para execução automática de pipelines CI/CD.
Permite:
* Build
* Testes
* Deploy
* Validação Terraform

---

### OIDC

OpenID Connect.
Permite autenticação segura entre GitHub e AWS.
Fluxo:
```text
GitHub
↓
OIDC
↓
IAM Role temporária
↓
AWS
```

Benefício:
```text
Sem Access Key
Sem Secret Key
```

---

### Terraform Validate

Executa validação sintática da infraestrutura.
Exemplo:
```text
terraform validate
```

---

### Terraform Plan

Executa comparação:
```text
Código Terraform
VS
Infraestrutura atual AWS
```

Resultado:
```text
O que será criado
O que será alterado
O que será removido
```

---

## ⚙️ Como funciona

Fluxo operacional:
```text
VSCode
↓
Git Add
↓
Git Commit
↓
Git Push
↓
GitHub Actions
↓
Terraform Format
↓
Terraform Init
↓
Terraform Validate
↓
Terraform Plan
```

Resultado:
```text
Validação automática
```

---

## 🔒 Modelo implementado

Pipeline segura.
Não executa:
```text
terraform apply
```

Objetivo:
Evitar alterações automáticas não aprovadas.

---

## 📚 Documentação oficial

* https://docs.github.com/actions
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs
* https://github.com/aws-actions/configure-aws-credentials
* https://github.com/hashicorp/setup-terraform

---

## 🧪 Como validar

Executar:
```powershell
git add .
git commit -m "teste pipeline"
git push origin main
```

Abrir:
```text
GitHub
↓
Actions
```

Validar execução:
```text
Terraform Format Check
Terraform Init
Terraform Validate
Terraform Plan
```

Resultado esperado:
```text
Success
```

---

## 📈 Resultado esperado

Ao final desta fase o CloudTrilhas deve possuir:
* CI automatizada
* Validação automática Terraform
* Integração segura GitHub + AWS
* Pipeline moderna
* Segurança operacional

---

## 📌 Observação operacional

Integração AWS realizada utilizando:
```text
OIDC + IAM Role temporária
```

Modelo moderno utilizado em ambientes corporativos.
Objetivo:
Eliminar uso de credenciais estáticas.
