# Fase 17 — CloudFront

## 🎯 Objetivo

Criar uma distribuição Amazon CloudFront para entregar o portal CloudTrilhas com melhor performance, cache global e acesso seguro via HTTPS.

---

## 🏗️ O que foi criado

* Distribuição CloudFront
* Origem apontando para o site estático no S3
* Configuração de domínio personalizado
* Alias para `cloudtrilhas.com.br`
* Alias para `www.cloudtrilhas.com.br`
* Integração com certificado ACM
* Redirecionamento HTTP para HTTPS
* Registros DNS no Route 53 apontando para o CloudFront

---

## 🧠 Conceitos importantes

### CloudFront
Serviço de CDN da AWS utilizado para distribuir conteúdo com baixa latência e alta disponibilidade.

### CDN
Rede de distribuição de conteúdo que entrega arquivos a partir de pontos de presença próximos ao usuário.

### Origin
Origem do conteúdo entregue pelo CloudFront. Neste projeto, a origem é o site estático hospedado no Amazon S3.

### Alias
Nome de domínio personalizado associado à distribuição CloudFront.

### Viewer Certificate
Certificado SSL/TLS utilizado pelo CloudFront para permitir acesso HTTPS.

### Redirect to HTTPS
Configuração que redireciona automaticamente requisições HTTP para HTTPS.

---

## ⚙️ Como funciona

Quando o usuário acessa o portal pelo domínio:

1. O domínio `cloudtrilhas.com.br` é resolvido pelo Route 53
2. O Route 53 direciona a requisição para o CloudFront
3. O CloudFront verifica o cache nos edge locations
4. Caso o conteúdo não esteja em cache, o CloudFront busca o conteúdo no S3
5. O conteúdo é entregue ao usuário com HTTPS
6. O acesso ao portal ocorre pelo domínio personalizado

---

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution
* https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html
* https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record

---

## 🧪 Como testar

### Aplicar infraestrutura

Executar `terraform apply`.

### Obter domínio do CloudFront

Executar `terraform output cloudfront_domain_name`.

### Validar URL principal

Acessar `https://cloudtrilhas.com.br`.

### Validar URL com www

Acessar `https://www.cloudtrilhas.com.br`.

### Validar DNS

Executar `nslookup cloudtrilhas.com.br`.

Executar `nslookup www.cloudtrilhas.com.br`.

### Invalidar cache após alterações no site

Executar `aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"`.

---

## 📈 Resultado esperado

Ao final da fase:

* portal acessível por `https://cloudtrilhas.com.br`
* portal acessível por `https://www.cloudtrilhas.com.br`
* distribuição CloudFront ativa
* HTTPS funcionando corretamente
* conteúdo do S3 entregue pela CDN

---

## 🔐 Segurança aplicada

* Acesso HTTPS com certificado SSL/TLS
* Redirecionamento automático de HTTP para HTTPS
* Certificado gerenciado pelo ACM
* DNS gerenciado pelo Route 53
* Entrega de conteúdo por CDN gerenciada

---
