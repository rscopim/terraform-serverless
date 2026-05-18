# Fase 14 — DynamoDB

## 🎯 Objetivo

Criar uma tabela Amazon DynamoDB para armazenar informações dos usuários que realizam download dos materiais disponíveis no portal de estudos.

---

## 🏗️ O que foi criado

* Tabela DynamoDB
* Chave primária (`lead_id`)
* Armazenamento de nome, e-mail e material baixado
* Registro de consentimento LGPD
* Integração com Lambda

---

## 🧠 Conceitos importantes

### DynamoDB
Banco de dados NoSQL totalmente gerenciado pela AWS.

### PAY_PER_REQUEST
Modo serverless onde o custo ocorre apenas sob demanda.

### Item
Registro individual armazenado na tabela.

### Hash Key
Chave primária utilizada para identificar cada registro.

### NoSQL
Modelo de banco de dados não relacional utilizado para aplicações altamente escaláveis.

---

## ⚙️ Como funciona

Quando um usuário realiza o cadastro no portal:

1. O frontend envia os dados para o API Gateway
2. O API Gateway invoca a Lambda
3. A Lambda valida os dados recebidos
4. Um novo item é criado no DynamoDB contendo:
   * Nome
   * E-mail
   * Material baixado
   * Data/hora
   * Consentimento LGPD
5. O usuário recebe o link do PDF

---

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
* https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html

---

## 🧪 Como testar

### Acessar tabela

Abrir:

DynamoDB → Tables

Selecionar:

```text
Terraform-Serverless-dev-leads