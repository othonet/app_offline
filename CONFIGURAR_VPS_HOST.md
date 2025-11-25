# 🌐 Configurar VPS_HOST

Você tem algumas opções para configurar o `VPS_HOST`:

## Opção 1: Usar o Hostname (Recomendado)

A Hostinger geralmente fornece um hostname para a VPS. Baseado no seu prompt, você pode usar:

**Valor para `VPS_HOST`:** `srv1150760.hostinger.com`

Ou apenas:
**Valor para `VPS_HOST`:** `srv1150760`

## Opção 2: Usar IPv4

Para descobrir o IPv4, execute na VPS:

```bash
# Ver todos os IPs
ip addr show | grep inet

# Ou apenas IPv4
hostname -I | awk '{print $1}'

# Ou
curl -4 ifconfig.me
```

## Opção 3: Usar IPv6 (se sua rede suportar)

Se você tiver certeza de que o GitHub Actions consegue acessar via IPv6:

**Valor para `VPS_HOST`:** `2a02:4780:66:ca81::1`

⚠️ **Nota:** IPv6 pode não funcionar em todos os ambientes. Prefira hostname ou IPv4.

## 📋 Como Descobrir o IP Correto

Na VPS, execute:

```bash
# Ver IPv4
curl -4 ifconfig.me

# Ver hostname
hostname

# Ver todos os IPs
ip addr show
```

## ✅ Recomendação

**Use o hostname da Hostinger:**
- `srv1150760.hostinger.com` ou
- `srv1150760`

Isso é mais confiável porque:
- Funciona mesmo se o IP mudar
- É mais fácil de lembrar
- A Hostinger gerencia isso automaticamente

## 🔧 Configurar no GitHub

1. Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. **Nome:** `VPS_HOST`
4. **Valor:** `srv1150760.hostinger.com` (ou o que você descobrir)
5. Clique em **"Add secret"**

