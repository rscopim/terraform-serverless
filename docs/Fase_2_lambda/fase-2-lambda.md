# Fase 2 — Lambda

## 🎯 Objetivo

Criar a primeira função AWS Lambda utilizando Terraform, preparando a base para uma arquitetura serverless orientada a eventos.

## 🏗️ O que foi criado

* AWS Lambda
* IAM Role para execução da Lambda
* Política básica de execução da Lambda
* Empacotamento do código Python em arquivo ZIP

## 🧠 Conceitos importantes

* Lambda: serviço serverless para execução de código sob demanda
* Runtime: ambiente responsável por executar o código da função
* Handler: ponto de entrada da função
* IAM Role: permissões assumidas pela Lambda
* Archive provider: usado para empacotar o código em ZIP

## ⚙️ Como funciona

O Terraform empacota o arquivo Python da Lambda em um arquivo ZIP utilizando o provider `archive`.

Em seguida, cria uma IAM Role que permite que o serviço AWS Lambda assuma essa função.

A Lambda é criada com runtime Python e utiliza o handler `app.lambda_handler`.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
* https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file
* https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html


## 🧪 Como testar

1. Acessar a pasta `environments/dev`
2. Executar `terraform init`
3. Executar `terraform validate`
4. Executar `terraform plan`
5. Executar `terraform apply`
6. Invocar a Lambda via AWS CLI
7. Validar o retorno no arquivo `response.json`