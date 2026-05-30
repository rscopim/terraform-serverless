# Fase 16 — ACM (Certificado SSL/TLS)

## 🎯 Objetivo

Provisionar e validar automaticamente um certificado SSL/TLS via AWS Certificate Manager para habilitar HTTPS no domínio CloudTrilhas, com validação DNS integrada ao Route 53.

---

## 🏗️ O que foi criado

- Certificado ACM com Subject Alternative Names (SANs)
- Domínio principal: `cloudtrilhas.com.br` (ou `dev.cloudtrilhas.com.br`)
- SAN: `www.cloudtrilhas.com.br` (ou `www.dev.cloudtrilhas.com.br`)
- Registros DNS de validação criados automaticamente no Route 53
- Recurso `aws_acm_certificate_validation` para aguardar emissão
- Módulo Terraform (`modules/acm/`)

---

## 🧠 Conceitos importantes

### AWS Certificate Manager (ACM)

Serviço que provisiona, gerencia e renova certificados SSL/TLS gratuitamente. Certificados ACM são renovados automaticamente antes da expiração.

### Validação DNS

Método de validação onde o ACM gera registros CNAME que devem existir no DNS do domínio. O Terraform cria esses registros automaticamente no Route 53, tornando o processo totalmente automatizado.

### Região us-east-1 (Obrigatória)

Certificados utilizados pelo CloudFront **devem** ser criados na região `us-east-1` (N. Virginia). Por isso, o módulo ACM utiliza um provider com alias apontando para essa região.

```hcl
provider "aws" {
  alias  = "use1"
  region = "us-east-1"
}
```

### Subject Alternative Names (SANs)

Permite que um único certificado cubra múltiplos domínios. Neste projeto, o certificado cobre tanto o domínio raiz quanto o subdomínio `www`.

### Certificate Validation Resource

O recurso `aws_acm_certificate_validation` faz o Terraform aguardar até que o certificado seja emitido (status `ISSUED`) antes de prosseguir com recursos dependentes (CloudFront).

---

## ⚙️ Como funciona

```
Terraform solicita certificado ao ACM (us-east-1)
        ↓
ACM gera registros CNAME de validação
        ↓
Terraform cria registros no Route 53
        ↓
ACM verifica existência dos registros DNS
        ↓
Validação concluída → Status: ISSUED
        ↓
Certificado pronto para uso no CloudFront
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/acm/main.tf` | Certificate + Validation + DNS records |
| `modules/acm/variables.tf` | Domain name, Zone ID |
| `modules/acm/outputs.tf` | Certificate ARN |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate_validation
- https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html

---

## 🧪 Como testar

```bash
# Verificar status do certificado
aws acm describe-certificate \
  --certificate-arn <CERT_ARN> \
  --region us-east-1 \
  --query 'Certificate.Status'

# Resultado esperado: "ISSUED"

# Verificar domínios cobertos
aws acm describe-certificate \
  --certificate-arn <CERT_ARN> \
  --region us-east-1 \
  --query 'Certificate.SubjectAlternativeNames'
```

---

## ⚠️ Observações importantes

- A validação DNS pode levar de 2 a 30 minutos
- Se o `terraform apply` ficar aguardando, é normal — está esperando a validação
- O certificado é renovado automaticamente pela AWS (sem ação manual)
- Custo: **gratuito** para certificados públicos no ACM

---

## 📈 Resultado esperado

- Certificado emitido com status `ISSUED`
- Cobre domínio raiz e www
- Validação 100% automatizada via DNS
- Pronto para associação ao CloudFront (próxima fase)
- Renovação automática sem intervenção
