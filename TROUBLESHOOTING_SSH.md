# 🔧 Troubleshooting - Erro de Conexão SSH

## Erro: "can't connect without a private SSH key or password"

Este erro significa que a chave SSH não está sendo reconhecida. Siga estes passos:

## ✅ Verificar Secrets no GitHub

1. Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`
2. Verifique se o secret `VPS_SSH_KEY` existe e está configurado

## 🔑 Verificar Formato da Chave SSH

A chave privada SSH deve ter este formato:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
... (conteúdo da chave) ...
-----END OPENSSH PRIVATE KEY-----
```

OU (formato antigo):

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
... (conteúdo da chave) ...
-----END RSA PRIVATE KEY-----
```

## 🔍 Como Obter a Chave Correta

### Na VPS, execute:

```bash
# Verificar se a chave existe
ls -la ~/.ssh/

# Exibir a chave privada completa
cat ~/.ssh/github_actions
# ou
cat ~/.ssh/id_rsa
```

**⚠️ IMPORTANTE:** Copie TODO o conteúdo, incluindo:
- A linha `-----BEGIN`
- Todo o conteúdo do meio
- A linha `-----END`

## 📋 Checklist da Chave SSH

- [ ] A chave começa com `-----BEGIN`
- [ ] A chave termina com `-----END`
- [ ] Não há espaços extras no início/fim
- [ ] Não há quebras de linha incorretas
- [ ] A chave pública está em `~/.ssh/authorized_keys` na VPS

## 🔧 Verificar se a Chave Pública Está na VPS

Na VPS, execute:

```bash
# Verificar authorized_keys
cat ~/.ssh/authorized_keys

# Verificar se a chave pública está lá
cat ~/.ssh/github_actions.pub
```

Se a chave pública não estiver no `authorized_keys`:

```bash
# Adicionar chave pública
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Ajustar permissões
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## 🧪 Testar Conexão Manualmente

Na sua máquina local (ou via GitHub Actions), teste:

```bash
# Testar conexão SSH
ssh -i ~/.ssh/github_actions usuario@seu-ip-vps

# Ou se estiver usando a chave padrão
ssh usuario@seu-ip-vps
```

## 🔄 Regenerar Chave SSH (Se Necessário)

Se a chave não estiver funcionando, gere uma nova:

```bash
# Na VPS
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Quando pedir passphrase, deixe em branco (Enter)

# Adicionar ao authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Copiar chave privada
cat ~/.ssh/github_actions
```

Depois, atualize o secret `VPS_SSH_KEY` no GitHub com a nova chave.

## ⚠️ Problemas Comuns

### 1. Chave com espaços extras

Remova espaços no início e fim ao colar no GitHub Secrets.

### 2. Chave pública não autorizada

Certifique-se de que a chave pública está em `~/.ssh/authorized_keys`.

### 3. Permissões incorretas

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions
```

### 4. Usuário incorreto

Verifique se o secret `VPS_USER` está correto (ex: `root`, `usuario`, etc.).

### 5. Porta incorreta

Verifique se o secret `VPS_PORT` está correto (geralmente `22`).

## 📝 Verificar Secrets Configurados

No GitHub, verifique se todos os secrets estão configurados:

- `VPS_HOST` - IP ou domínio
- `VPS_USER` - Usuário SSH
- `VPS_SSH_KEY` - Chave privada completa
- `VPS_PORT` - Porta SSH (22)
- `VPS_DEPLOY_PATH` - Caminho do projeto

## ✅ Após Corrigir

Depois de corrigir a chave SSH:

1. Faça um novo commit e push
2. Ou execute o workflow manualmente
3. Verifique os logs do GitHub Actions

O workflow agora tem uma etapa de verificação SSH que testa a conexão antes do deploy.

