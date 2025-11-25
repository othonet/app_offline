# 🔍 Verificar Secrets - Passo a Passo

O erro "missing server host" significa que o secret `VPS_HOST` não está configurado corretamente.

## 📋 Passo a Passo para Verificar

### 1. Acessar Secrets do GitHub

1. Acesse: `https://github.com/othonet/app_offline`
2. Clique em **Settings** (Configurações)
3. No menu lateral esquerdo, clique em **Secrets and variables** → **Actions**

OU acesse diretamente:
`https://github.com/othonet/app_offline/settings/secrets/actions`

### 2. Verificar se VPS_HOST Existe

Na lista de secrets, você deve ver:

- [ ] `VPS_HOST` - deve existir e ter um valor
- [ ] `VPS_USER` - deve existir
- [ ] `VPS_SSH_KEY` - deve existir
- [ ] `VPS_PORT` - pode existir (opcional)
- [ ] `VPS_DEPLOY_PATH` - deve existir

### 3. Se VPS_HOST NÃO Existe

1. Clique em **"New repository secret"** (Novo secret do repositório)
2. **Name** (Nome): `VPS_HOST`
3. **Secret** (Valor): `srv1150760.hstgr.cloud` (ou `72.61.42.147`)
4. Clique em **"Add secret"** (Adicionar secret)

### 4. Se VPS_HOST Existe mas Está Vazio

1. Clique no secret `VPS_HOST`
2. Clique em **"Update"** (Atualizar)
3. **Secret** (Valor): `srv1150760.hstgr.cloud` (ou `72.61.42.147`)
4. Clique em **"Update secret"** (Atualizar secret)

## ✅ Valores Corretos para os Secrets

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | `srv1150760.hstgr.cloud` ou `72.61.42.147` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Chave privada SSH completa (já configurada) |
| `VPS_PORT` | `22` (opcional) |
| `VPS_DEPLOY_PATH` | `~/app_offline` ou `/root/app_offline` |

## 🧪 Testar se Está Configurado

Depois de configurar, você pode:

1. **Verificar visualmente** na página de secrets
2. **Executar o workflow manualmente** para testar
3. **Fazer um novo commit** para acionar automaticamente

## ⚠️ Importante

- O nome do secret deve ser **exatamente** `VPS_HOST` (case-sensitive)
- Não pode ter espaços extras
- O valor não pode estar vazio
- Deve ser o hostname ou IP da VPS

## 🔄 Após Configurar

1. Vá para: `https://github.com/othonet/app_offline/actions`
2. Clique em **"Deploy to VPS"**
3. Clique em **"Run workflow"**
4. Selecione a branch `master` (ou `feature/ci-cd-setup`)
5. Clique em **"Run workflow"**

O deploy deve funcionar agora!

