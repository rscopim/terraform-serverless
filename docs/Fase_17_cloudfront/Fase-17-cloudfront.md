# Fase 17 — CloudFront (CDN Global)

## 🎯 Objetivo

Criar uma distribuição Amazon CloudFront para entregar o portal CloudTrilhas com baixa latência global, cache em edge locations, HTTPS obrigatório e domínio personalizado.

---

## 🏗️ O que foi criado

- Distribuição CloudFront com origin no S3
- Domínios alternativos (aliases): `cloudtrilhas.com.br` e `www.cloudtrilhas.com.br`
- Certificado ACM associado (viewer certificate)
- Redirecionamento HTTP → HTTPS
- Cache policy otimizada para conteúdo estático
- Registros DNS ALIAS no Route 53 apontando para CloudFront
- Default root object: `index.html`
- Módulo Terraform (`modules/cloudfront/`)

---

## 🧠 Conceitos importantes

### Amazon CloudFront

CDN (Content Delivery Network) global da AWS com mais de 450 pontos de presença. Entrega conteúdo com latência mínima armazenando cópias em cache próximas ao usuário.

### Edge Locations

Pontos de presença distribuídos globalmente onde o CloudFront armazena cache do conteúdo. Quando um usuário acessa o site, o conteúdo é servido pela edge location mais próxima.

### Origin

Fonte do conteúdo original. Neste projeto, a origin é o bucket S3. O CloudFront busca conteúdo na origin apenas quando não está em cache (cache miss).

### Viewer Certificate

Certificado SSL/TLS apresentado ao usuário final. Utiliza o certificado ACM criado na Fase 16 para habilitar HTTPS no domínio personalizado.

### Cache Behavior

Define como o CloudFront trata requisições:
- **TTL**: Tempo que o conteúdo permanece em cache
- **Viewer Protocol Policy**: `redirect-to-https` força HTTPS
- **Compress**: Habilita compressão gzip/brotli automaticamente

### Invalidation

Processo de limpar o cache do CloudFront quando o conteúdo é atualizado no S3. Necessário após cada deploy de novas páginas.

---

## ⚙️ Como funciona

```
Usuário digita cloudtrilhas.com.br
        ↓
Route 53 resolve DNS → CloudFront
        ↓
CloudFront verifica cache na edge location
        ↓
┌───────┴───────┐
↓               ↓
Cache HIT       Cache MISS
(resposta       (busca no S3)
 imediata)           ↓
        ↓       Armazena em cache
        ↓           ↓
Conteúdo entregue via HTTPS
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/cloudfront/main.tf` | Distribution + DNS records |
| `modules/cloudfront/variables.tf` | Domain, S3 origin, ACM ARN |
| `modules/cloudfront/outputs.tf` | Distribution ID, domain name |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution
- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html
- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html

---

## 🧪 Como testar

```bash
# Verificar distribuição
terraform output cloudfront_domain_name

# Testar acesso HTTPS
curl -I https://www.cloudtrilhas.com.br
curl -I https://cloudtrilhas.com.br

# Verificar redirecionamento HTTP → HTTPS
curl -I http://cloudtrilhas.com.br
# Deve retornar 301 → https://

# Invalidar cache após alterações
aws cloudfront create-invalidation \
  --distribution-id <DIST_ID> \
  --paths "/*"
```

---

## 📈 Resultado esperado

- Portal acessível via `https://cloudtrilhas.com.br` e `https://www.cloudtrilhas.com.br`
- HTTPS funcionando com certificado válido
- Redirecionamento automático de HTTP para HTTPS
- Conteúdo servido com baixa latência via CDN
- Compressão automática reduzindo tamanho das respostas
- Cache otimizado para conteúdo estático
