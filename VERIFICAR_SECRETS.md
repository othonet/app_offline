# ✅ Verificar Secrets do GitHub Actions

O erro "missing server host" significa que o secret `VPS_HOST` não está configurado.

## 🔍 Secrets Obrigatórios

Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`

Verifique se TODOS estes secrets estão configurados:

### 1. VPS_HOST (OBRIGATÓRIO - está faltando!)

- **Nome:** `VPS_HOST`
- **Valor:** IP ou domínio da sua VPS
- **Exemplo:** `123.456.789.0` ou `vps.exemplo.com`

### 2. VPS_USER

- **Nome:** `VPS_USER`
- **Valor:** Usuário SSH da VPS
- **Exemplo:** `root` ou seu usuário

### 3. VPS_SSH_KEY

- **Nome:** `VPS_SSH_KEY`
- **Valor:** Chave privada SSH completa (já configurada ✅)

### 4. VPS_PORT (Opcional, mas recomendado)

- **Nome:** `VPS_PORT`
- **Valor:** `22` (porta padrão SSH)

### 5. VPS_DEPLOY_PATH

- **Nome:** `VPS_DEPLOY_PATH`
- **Valor:** Caminho do projeto na VPS
- **Exemplo:** `~/app_offline` ou `/root/app_offline`

## 📋 Como Descobrir o IP da VPS

Na VPS, execute:

```bash
# Ver IP público
curl ifconfig.me

# Ou ver IPs da interface
ip addr show

# Ou
hostname -I
```

## 🔧 Configurar o Secret VPS_HOST

1. Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. **Nome:** `VPS_HOST`
4. **Valor:** Cole o IP ou domínio da sua VPS
5. Clique em **"Add secret"**

## ✅ Checklist Completo

- [ ] `VPS_HOST` - IP ou domínio da VPS ⚠️ **FALTANDO**
- [ ] `VPS_USER` - Usuário SSH (ex: `root`)
- [ ] `VPS_SSH_KEY` - Chave privada SSH ✅
- [ ] `VPS_PORT` - Porta SSH (ex: `22`)
- [ ] `VPS_DEPLOY_PATH` - Caminho do projeto (ex: `~/app_offline`)

## 🚀 Após Configurar

Depois de adicionar o `VPS_HOST`:

1. Execute o workflow manualmente novamente, OU
2. Faça um novo commit e push

O deploy deve funcionar!

