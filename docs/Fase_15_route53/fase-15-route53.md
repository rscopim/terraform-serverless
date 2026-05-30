# Fase 15 — Route 53 (DNS Gerenciado)

## 🎯 Objetivo

Criar e configurar uma Hosted Zone no Amazon Route 53 para gerenciamento completo do DNS do domínio `cloudtrilhas.com.br`, permitindo resolução de nomes e integração com CloudFront e ACM.

---

## 🏗️ O que foi criado

- Hosted Zone pública para `cloudtrilhas.com.br`
- Nameservers gerenciados pela AWS (NS records)
- SOA record automático
- Integração com registrador de domínio (Registro.br)
- Módulo Terraform (`modules/route53/`)

---

## 🧠 Conceitos importantes

### Amazon Route 53

Serviço de DNS gerenciado da AWS com 100% de SLA de disponibilidade. Oferece resolução de nomes, health checks e roteamento inteligente (latency-based, geolocation, failover).

### Hosted Zone

Container para registros DNS de um domínio. Uma Hosted Zone pública responde a consultas DNS da internet. Cada zona possui registros NS (nameservers) e SOA (start of authority).

### Nameservers

Servidores DNS responsáveis por responder consultas para o domínio. Após criar a Hosted Zone, os nameservers da AWS devem ser configurados no registrador do domínio (Registro.br).

### Propagação DNS

Após alterar nameservers no registrador, a propagação pode levar de minutos a 48 horas. Durante esse período, consultas DNS podem retornar resultados antigos.

### Registros DNS

| Tipo | Função |
|------|--------|
| A | Aponta domínio para IPv4 |
| AAAA | Aponta domínio para IPv6 |
| CNAME | Alias para outro domínio |
| ALIAS | Alias nativo AWS (Route 53) |
| MX | Servidores de email |
| TXT | Verificação e SPF |

---

## ⚙️ Como funciona

```
Terraform cria Hosted Zone
        ↓
AWS gera 4 Nameservers
        ↓
Nameservers configurados no Registro.br
        ↓
DNS propaga (minutos a horas)
        ↓
Route 53 controla resolução do domínio
        ↓
Registros A/ALIAS apontam para CloudFront
        ↓
Usuário acessa cloudtrilhas.com.br
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/route53/main.tf` | Hosted Zone + Records |
| `modules/route53/variables.tf` | Domain name, zone name |
| `modules/route53/outputs.tf` | Zone ID, Nameservers |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_zone
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record
- https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html

---

## 🧪 Como testar

```bash
# Obter nameservers
terraform output route53_name_servers

# Verificar resolução DNS
nslookup cloudtrilhas.com.br
nslookup www.cloudtrilhas.com.br
nslookup dev.cloudtrilhas.com.br

# Verificar registros da zona
aws route53 list-resource-record-sets \
  --hosted-zone-id <ZONE_ID>
```

---

## ⚠️ Passo manual necessário

Após o `terraform apply`, é necessário configurar os nameservers no Registro.br:

1. Acessar https://registro.br
2. Entrar no domínio `cloudtrilhas.com.br`
3. Alterar DNS para os 4 nameservers retornados pelo Terraform
4. Aguardar propagação

---

## 📈 Resultado esperado

- Hosted Zone criada e funcional
- Nameservers configurados no registrador
- Domínio resolvendo corretamente via Route 53
- Base pronta para certificado ACM e CloudFront (próximas fases)
