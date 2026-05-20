# Fase 18 — OAC + Geo Restriction

## 🎯 Objetivo

Elevar a segurança do portal CloudTrilhas utilizando boas práticas recomendadas pela AWS, impedindo acesso direto ao bucket S3 e restringindo o acesso ao portal para regiões específicas.

Nesta fase foram implementados:

* Origin Access Control (OAC)
* Bucket S3 privado
* Restrição geográfica via CloudFront (Geo Restriction)

---

## 🏗️ O que foi criado

* Bucket S3 privado
* CloudFront utilizando Origin Access Control (OAC)
* Remoção de acesso público direto ao S3
* Política de acesso restrita ao CloudFront
* Bloqueio total de acesso público no bucket
* Restrição geográfica permitindo somente:
  * América do Sul
  * Portugal

---

## 🧠 Conceitos importantes

### Origin Access Control (OAC)

Mecanismo do CloudFront utilizado para acessar buckets S3 privados de forma segura.

O OAC substitui abordagens antigas de acesso público ou Origin Access Identity (OAI), utilizando assinatura SigV4 para autenticação.

---

### Bucket Privado

Bucket S3 configurado sem acesso público.

Todo o acesso ao conteúdo passa obrigatoriamente pelo CloudFront.

---

### Block Public Access

Configuração de segurança do S3 utilizada para impedir exposição pública acidental.

Foram habilitadas:

* Block Public ACLs
* Ignore Public ACLs
* Block Public Bucket Policies
* Restrict Public Bucket Policies

---

### Geo Restriction

Recurso nativo do CloudFront utilizado para restringir acesso por localização geográfica.

Permissões aplicadas:

* Brasil
* Argentina
* Bolívia
* Chile
* Colômbia
* Equador
* Guiana
* Paraguai
* Peru
* Suriname
* Uruguai
* Venezuela
* Portugal

Todo o restante permanece bloqueado.

---

### SigV4

Mecanismo de assinatura segura utilizado pelo CloudFront para autenticação junto ao bucket S3.

---

## ⚙️ Como funciona

Fluxo atual do portal:

1. O usuário acessa:

```text
https://cloudtrilhas.com.br
```

2. O CloudFront valida a origem geográfica

3. Caso permitido:

```text
América do Sul
Portugal
```

4. O CloudFront utiliza OAC para autenticar no bucket S3

5. O bucket S3 entrega o conteúdo

6. O portal é exibido ao usuário

Fluxo final:

```text
Usuário
   ↓
CloudFront
(Geo Restriction)
   ↓
Origin Access Control (OAC)
   ↓
Bucket S3 Privado
```

---

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_origin_access_control

* https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html

* https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/georestrictions.html

* https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html

---

## 🧪 Como testar

### Validar bucket privado

Acessar URL direta do bucket:

```text
https://bucket.s3.amazonaws.com/index.html
```

Resultado esperado:

```text
403 Forbidden
```

ou:

```text
Access Denied
```

---

### Validar portal

Acessar:

```text
https://cloudtrilhas.com.br
```

Resultado esperado:

Portal funcionando normalmente.

---

### Validar Block Public Access

Abrir:

```text
Amazon S3
→ Bucket
→ Permissions
→ Block Public Access
```

Validar:

* ✅ Block Public ACLs
* ✅ Ignore Public ACLs
* ✅ Block Public Policies
* ✅ Restrict Public Buckets

---

### Validar Geo Restriction

Abrir:

```text
CloudFront
→ Distribution
→ Security
→ Geographic Restrictions
```

Validar:

```text
Allow List
```

Países permitidos:

* América do Sul
* Portugal

---

## 📈 Resultado esperado

Ao final da fase:

* Bucket privado
* CloudFront como único ponto de entrada
* Bloqueio de acesso direto ao S3
* Restrição geográfica ativa
* Menor superfície de exposição
* Melhor alinhamento com AWS Well-Architected Framework

---

## 🔐 Segurança aplicada

* Origin Access Control (OAC)
* Bucket privado
* Block Public Access
* HTTPS obrigatório
* TLS 1.2+
* Geo Restriction
* CloudFront como camada de proteção

---

## 🚀 Evolução futura

Próximas melhorias previstas:

* AWS WAF
* Rate Limiting
* AWS Managed Rules
* Proteção contra SQL Injection
* Proteção contra XSS
* CloudWatch Security Monitoring
* Well-Architected Review