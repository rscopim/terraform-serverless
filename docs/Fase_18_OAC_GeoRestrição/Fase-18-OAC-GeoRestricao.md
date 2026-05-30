# Fase 18 — OAC + Geo Restriction (Segurança Avançada)

## 🎯 Objetivo

Elevar a segurança do portal CloudTrilhas implementando Origin Access Control (OAC) para impedir acesso direto ao S3 e Geo Restriction para limitar acesso geográfico, reduzindo a superfície de ataque da aplicação.

---

## 🏗️ O que foi criado

- Origin Access Control (OAC) no CloudFront
- Bucket S3 configurado como privado (Block Public Access total)
- Bucket Policy restrita exclusivamente ao CloudFront
- Geo Restriction com whitelist de países permitidos
- Remoção de qualquer acesso público ao S3

---

## 🧠 Conceitos importantes

### Origin Access Control (OAC)

Mecanismo moderno do CloudFront para acessar buckets S3 privados. Substitui o antigo OAI (Origin Access Identity) e utiliza assinatura SigV4 para autenticação segura.

Benefícios sobre OAI:
- Suporte a SSE-KMS
- Melhor integração com IAM
- Assinatura SigV4 (mais segura)
- Recomendado pela AWS para novos projetos

### Block Public Access

Configuração de segurança do S3 que impede qualquer forma de acesso público:
- ✅ Block Public ACLs
- ✅ Ignore Public ACLs
- ✅ Block Public Policies
- ✅ Restrict Public Buckets

Com todas as opções habilitadas, é impossível tornar o bucket público acidentalmente.

### Geo Restriction (Restrição Geográfica)

Recurso do CloudFront que permite ou bloqueia acesso com base na localização geográfica do usuário (determinada pelo IP).

Países permitidos neste projeto:
- 🇧🇷 Brasil e toda América do Sul
- 🇵🇹 Portugal

### Bucket Policy com Condition

A policy do bucket permite apenas requisições originadas do CloudFront, validando o ARN da distribuição:

```json
{
  "Condition": {
    "StringEquals": {
      "AWS:SourceArn": "<CLOUDFRONT_DISTRIBUTION_ARN>"
    }
  }
}
```

---

## ⚙️ Como funciona

```
Usuário acessa cloudtrilhas.com.br
        ↓
CloudFront verifica localização geográfica
        ↓
┌───────┴───────┐
↓               ↓
Permitido       Bloqueado
(América do     (403 Forbidden)
 Sul + PT)
        ↓
CloudFront autentica no S3 via OAC (SigV4)
        ↓
S3 valida Bucket Policy (SourceArn)
        ↓
Conteúdo entregue ao usuário
```

Acesso direto ao S3 (sem CloudFront):
```
Usuário → S3 URL direta → 403 Access Denied
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/cloudfront/main.tf` | OAC + Geo Restriction |
| `modules/s3_static_site/main.tf` | Block Public Access + Policy |

---

## 📚 Documentação oficial

- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_origin_access_control
- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/georestrictions.html
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html

---

## 🧪 Como testar

```bash
# Testar acesso direto ao S3 (deve falhar)
curl https://materiais-e-trilhas-dev.s3.us-west-2.amazonaws.com/index.html
# Resultado: 403 Forbidden / Access Denied

# Testar acesso via CloudFront (deve funcionar)
curl -I https://www.dev.cloudtrilhas.com.br
# Resultado: 200 OK

# Verificar Block Public Access
aws s3api get-public-access-block --bucket materiais-e-trilhas-dev
# Todas as opções devem ser true
```

---

## 🔐 Segurança aplicada nesta fase

| Controle | Proteção |
|----------|----------|
| OAC | Impede acesso direto ao S3 |
| Block Public Access | Impede exposição acidental |
| Geo Restriction | Limita acesso por região |
| HTTPS | Criptografia em trânsito |
| SigV4 | Autenticação segura CloudFront → S3 |

---

## 📈 Resultado esperado

- Bucket completamente privado (zero acesso público)
- CloudFront como único ponto de entrada
- Acesso restrito a América do Sul + Portugal
- Menor superfície de exposição
- Alinhamento com AWS Well-Architected Framework (pilar Segurança)
