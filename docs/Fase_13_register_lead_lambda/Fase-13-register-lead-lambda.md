
# Fase 13 — Register Lead Lambda

## 🎯 Objetivo

Criar uma função AWS Lambda responsável por registrar usuários antes do download dos materiais do portal.

---

## 🏗️ O que foi criado

* Lambda de captura de leads
* Validação de nome e e-mail
* Registro de consentimento LGPD
* Integração com DynamoDB
* Retorno automático do link do PDF

---

## 🧠 Conceitos importantes

### AWS Lambda
Serviço serverless utilizado para execução sob demanda.

### Evento HTTP
Payload enviado pelo API Gateway contendo os dados do formulário.

### Variáveis de ambiente
Permitem parametrizar a Lambda sem alterar código-fonte.

### LGPD
Consentimento explícito do usuário antes da coleta dos dados.

---

## ⚙️ Como funciona

Quando a Lambda é invocada:

1. Os dados enviados pelo frontend são recebidos
2. Nome e e-mail são validados
3. O consentimento LGPD é verificado
4. O usuário é registrado no DynamoDB
5. O link do PDF é retornado ao frontend
6. O download é iniciado automaticamente

---

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission
* https://docs.aws.amazon.com/lambda/latest/dg/welcome.html

---

## 🧪 Como testar

### Validar logs da Lambda

Acessar:

CloudWatch → Log Groups

Abrir:

```text
/aws/lambda/Terraform-Serverless-dev-register-lead