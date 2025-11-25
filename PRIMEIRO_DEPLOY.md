# 🚀 Primeiro Deploy - Checklist e Passos

Este guia ajuda você a fazer o primeiro deploy da aplicação na VPS.

## ✅ Checklist Antes do Deploy

Certifique-se de que tudo está configurado:

### Na VPS:
- [x] Node.js instalado (`node --version`)
- [x] MySQL instalado e rodando
- [x] Banco de dados `app_offline` criado
- [x] Usuário MySQL criado (`app_offline_user`)
- [x] Diretório criado (`~/app_offline`)
- [x] Arquivo `.env` configurado com `DATABASE_URL`
- [x] Chave SSH gerada para GitHub Actions

### No GitHub:
- [ ] Secret `VPS_HOST` configurado
- [ ] Secret `VPS_USER` configurado
- [ ] Secret `VPS_SSH_KEY` configurado
- [ ] Secret `VPS_PORT` configurado (opcional, padrão 22)
- [ ] Secret `VPS_DEPLOY_PATH` configurado (`~/app_offline`)

## 🔐 Verificar Secrets no GitHub

1. Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`
2. Verifique se todos os secrets estão configurados:

| Secret | Valor Esperado |
|--------|----------------|
| `VPS_HOST` | IP ou domínio da VPS |
| `VPS_USER` | Seu usuário SSH |
| `VPS_SSH_KEY` | Chave privada SSH completa |
| `VPS_PORT` | `22` (ou porta customizada) |
| `VPS_DEPLOY_PATH` | `~/app_offline` ou `/home/usuario/app_offline` |

## 🚀 Fazer o Primeiro Deploy

### Opção 1: Deploy Automático (Push)

Faça um pequeno commit e push:

```bash
# No seu computador local
cd "C:\Users\Othon Felipe\Desktop\apps\app-offline"

# Fazer um commit vazio para acionar o deploy
git commit --allow-empty -m "Trigger first deployment"

# Fazer push
git push origin master
```

### Opção 2: Deploy Manual via GitHub Actions

1. Acesse: `https://github.com/othonet/app_offline/actions`
2. Clique em **"Deploy to VPS"** no menu lateral
3. Clique em **"Run workflow"**
4. Selecione a branch `master`
5. Clique em **"Run workflow"**

## 📊 Acompanhar o Deploy

1. Acesse: `https://github.com/othonet/app_offline/actions`
2. Clique no workflow em execução
3. Acompanhe os logs em tempo real

### O que o workflow faz:

1. ✅ Checkout do código
2. ✅ Build (instala dependências, gera Prisma, compila CSS)
3. ✅ Envia arquivos para VPS via SCP
4. ✅ Executa comandos na VPS:
   - Instala dependências
   - Gera Prisma Client
   - Executa migrações
   - Compila CSS
   - Inicia/reinicia aplicação

## ✅ Verificar se Funcionou

### Na VPS:

```bash
# Conectar à VPS
ssh usuario@seu-ip-vps

# Verificar se a aplicação está rodando
pm2 list

# Ver logs
pm2 logs app-offline

# Ou verificar diretamente
curl http://localhost:3000
```

### Verificar Banco de Dados:

```bash
# Conectar ao MySQL
sudo mysql -u root -p

# Verificar tabelas
USE app_offline;
SHOW TABLES;

# Você deve ver: users, sessions, setores, linhas, valvulas, etc.
EXIT;
```

## 🛠️ Troubleshooting

### Erro: "Permission denied (publickey)"

- Verifique se a chave SSH está correta no secret `VPS_SSH_KEY`
- Teste a conexão: `ssh -i ~/.ssh/github_actions usuario@vps-host`

### Erro: "Directory does not exist"

- Verifique o caminho no secret `VPS_DEPLOY_PATH`
- Certifique-se de que o diretório existe: `mkdir -p ~/app_offline`

### Erro: "Cannot find module"

- O workflow instalará as dependências automaticamente
- Verifique se Node.js está instalado: `node --version`

### Erro: "Access denied for user"

- Verifique se o `.env` tem a `DATABASE_URL` correta
- Verifique se o usuário MySQL existe e tem permissões

### Aplicação não inicia

- Verifique os logs: `pm2 logs app-offline`
- Verifique o arquivo `.env`
- Verifique se a porta 3000 está disponível

## 📝 Próximos Passos

Depois do primeiro deploy bem-sucedido:

1. ✅ Configure um domínio (se necessário)
2. ✅ Configure HTTPS/SSL (se necessário)
3. ✅ Configure firewall
4. ✅ Faça backup do banco de dados

## 🎉 Deploy Automático

A partir de agora, **toda vez que você fizer push na branch `master`**, o deploy será automático!

```bash
git add .
git commit -m "Sua mensagem"
git push origin master
```

O GitHub Actions fará tudo automaticamente! 🚀

