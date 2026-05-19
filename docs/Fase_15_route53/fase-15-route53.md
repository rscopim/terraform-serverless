# Fase 15 — Route 53

## 🎯 Objetivo

Criar e configurar uma Hosted Zone no Amazon Route 53 para gerenciamento do domínio personalizado do portal CloudTrilhas.

## 🏗️ O que foi criado

* Hosted Zone pública
* Nameservers gerenciados pela AWS
* Integração com domínio registrado
* Gerenciamento DNS centralizado

## 🧠 Conceitos importantes

* Route 53: serviço de DNS gerenciado da AWS utilizado para gerenciamento de domínios e resolução de nomes
* Hosted Zone: zona DNS responsável pelos registros do domínio
* Nameservers: servidores DNS responsáveis por responder consultas do domínio
* DNS: sistema responsável pela resolução de nomes na internet

## ⚙️ Como funciona

O Terraform cria uma Hosted Zone pública no Route 53 para o domínio `cloudtrilhas.com.br`.

Após a criação da Hosted Zone, a AWS gera os Nameservers que devem ser configurados no Registro.br.

Depois da alteração dos Nameservers, o Route 53 passa a controlar a resolução DNS do domínio.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_zone
* https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html

## 🧪 Como testar

1. Executar `terraform apply`
2. Obter os Nameservers com `terraform output route53_name_servers`
3. Configurar os Nameservers no Registro.br
4. Executar `nslookup cloudtrilhas.com.br`
5. Validar se o domínio está resolvendo corretamente