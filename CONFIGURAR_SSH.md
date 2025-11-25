# 🔑 Como Obter a Chave SSH (VPS_SSH_KEY)

A chave SSH é necessária para que o GitHub Actions possa se conectar à sua VPS e fazer o deploy. Existem duas formas de obter essa chave:

## 📋 Opção 1: Gerar uma Nova Chave SSH (Recomendado)

Esta é a opção mais segura, pois cria uma chave dedicada apenas para o GitHub Actions.

### Passo 1: Conectar-se à VPS

Conecte-se à sua VPS via SSH usando sua chave atual ou senha:

```bash
ssh usuario@seu-ip-vps
# ou
ssh root@seu-ip-vps
```

### Passo 2: Gerar a Chave SSH

Na VPS, execute:

```bash
# Gerar uma nova chave SSH (tipo ed25519 é mais seguro)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

# Ou se ed25519 não estiver disponível, use RSA:
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions
```

**Quando solicitado:**
- **Passphrase**: Deixe em branco (pressione Enter) - necessário para automação
- Confirme pressionando Enter novamente

### Passo 3: Adicionar a Chave Pública ao authorized_keys

```bash
# Adicionar a chave pública ao authorized_keys para permitir acesso
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Ajustar permissões (importante para segurança)
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Passo 4: Obter a Chave Privada

```bash
# Exibir a chave privada completa
cat ~/.ssh/github_actions
```

**⚠️ IMPORTANTE:** Copie TODO o conteúdo exibido, incluindo:
- `-----BEGIN OPENSSH PRIVATE KEY-----` (ou `-----BEGIN RSA PRIVATE KEY-----`)
- Todo o conteúdo da chave
- `-----END OPENSSH PRIVATE KEY-----` (ou `-----END RSA PRIVATE KEY-----`)

### Passo 5: Adicionar ao GitHub Secrets

1. Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Nome: `VPS_SSH_KEY`
4. Valor: Cole o conteúdo completo da chave privada que você copiou
5. Clique em **"Add secret"**

## 📋 Opção 2: Usar uma Chave SSH Existente

Se você já tem uma chave SSH que funciona para acessar a VPS, pode usar ela.

### No Windows (PowerShell ou Git Bash):

```bash
# Se você usa a chave padrão do Windows
cat ~/.ssh/id_rsa

# Ou se você tem uma chave específica
cat ~/.ssh/sua-chave-privada
```

### No Linux/Mac:

```bash
# Chave padrão
cat ~/.ssh/id_rsa

# Ou chave específica
cat ~/.ssh/sua-chave-privada
```

**⚠️ IMPORTANTE:** 
- Copie TODO o conteúdo da chave privada
- Inclua as linhas `-----BEGIN` e `-----END`
- Não compartilhe esta chave publicamente

### Adicionar ao GitHub Secrets

1. Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Nome: `VPS_SSH_KEY`
4. Valor: Cole o conteúdo completo da chave privada
5. Clique em **"Add secret"**

## ✅ Testar a Conexão

Após configurar, você pode testar se a chave funciona:

### Se você gerou uma nova chave na VPS:

Na sua máquina local, você precisaria baixar a chave privada primeiro (não recomendado para produção).

### Testar via GitHub Actions:

1. Faça um pequeno commit e push
2. Vá em: `https://github.com/othonet/app_offline/actions`
3. Verifique se o workflow executa sem erros de autenticação

## 🔒 Segurança

- **Nunca** commite a chave privada no repositório
- A chave privada deve estar apenas nos GitHub Secrets
- Use chaves diferentes para diferentes propósitos
- Se suspeitar que a chave foi comprometida, gere uma nova

## 🛠️ Troubleshooting

### Erro: "Permission denied (publickey)"

- Verifique se a chave pública está em `~/.ssh/authorized_keys` na VPS
- Verifique as permissões: `chmod 600 ~/.ssh/authorized_keys`
- Verifique se o usuário SSH está correto no secret `VPS_USER`

### Erro: "Host key verification failed"

- Adicione a VPS aos known_hosts (o GitHub Actions faz isso automaticamente)
- Ou configure o workflow para aceitar automaticamente

### A chave não funciona

- Verifique se copiou a chave COMPLETA (incluindo BEGIN e END)
- Verifique se não há espaços extras ou quebras de linha incorretas
- Gere uma nova chave e tente novamente

## 📝 Resumo Rápido

1. **Conecte-se à VPS**: `ssh usuario@ip-vps`
2. **Gere a chave**: `ssh-keygen -t ed25519 -f ~/.ssh/github_actions`
3. **Adicione ao authorized_keys**: `cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys`
4. **Copie a chave privada**: `cat ~/.ssh/github_actions`
5. **Cole no GitHub Secrets** como `VPS_SSH_KEY`

