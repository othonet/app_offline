# 🚀 Setup Inicial da VPS para CI/CD

Você **NÃO precisa** fazer o deploy completo manualmente! O CI/CD pode fazer isso automaticamente. Porém, você precisa fazer uma **configuração inicial mínima** na VPS.

## ✅ O que você PRECISA fazer na VPS (Setup Mínimo)

### 1. Conectar-se à VPS

```bash
ssh usuario@seu-ip-vps
# ou
ssh root@seu-ip-vps
```

### 2. Instalar Node.js (se não estiver instalado)

```bash
# Verificar se Node.js está instalado
node --version
npm --version

# Se não estiver instalado, instale:
# Opção A: Usando NVM (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Opção B: Usando o gerenciador de pacotes
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL:
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 3. Criar o Diretório do Projeto

```bash
# Criar diretório (escolha um dos caminhos abaixo)
mkdir -p ~/app-offline
# OU
sudo mkdir -p /var/www/app-offline
sudo chown $USER:$USER /var/www/app-offline

# Anotar o caminho completo
cd ~/app-offline  # ou /var/www/app-offline
pwd  # Copie este caminho - você precisará para o secret VPS_DEPLOY_PATH
```

### 4. Criar o Arquivo .env (Obrigatório)

```bash
# No diretório criado acima
cd ~/app-offline  # ou o caminho que você escolheu

# Criar arquivo .env
nano .env
```

Cole o seguinte conteúdo no `.env` (ajuste os valores):

```env
# Configurações do Servidor
NODE_ENV=production
PORT=3000

# Configurações de Autenticação JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-altere-este-valor
JWT_EXPIRES_IN=15m
```

**⚠️ IMPORTANTE:** 
- Altere o `JWT_SECRET` para uma string aleatória forte
- Salve o arquivo (Ctrl+X, depois Y, depois Enter no nano)

### 5. Instalar PM2 (Opcional, mas Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# PM2 será usado para gerenciar a aplicação automaticamente
```

### 6. Configurar Chave SSH para GitHub Actions

```bash
# Gerar chave SSH para GitHub Actions
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Quando pedir passphrase, deixe em branco (pressione Enter)

# Adicionar chave pública ao authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Exibir chave privada (copie TODO o conteúdo)
cat ~/.ssh/github_actions
```

## 🎯 O que o CI/CD fará automaticamente

Depois que você configurar os secrets no GitHub, o CI/CD fará automaticamente:

1. ✅ Clonar o código (na primeira execução)
2. ✅ Instalar dependências (`npm install`)
3. ✅ Gerar Prisma Client (`npm run prisma:generate`)
4. ✅ Executar migrações do banco (`npm run prisma:migrate deploy`)
5. ✅ Compilar CSS (`tailwindcss`)
6. ✅ Iniciar/reiniciar a aplicação com PM2 ou systemd

## 📋 Checklist de Setup

Antes de ativar o CI/CD, certifique-se de ter:

- [ ] Node.js 18+ instalado na VPS
- [ ] Diretório criado (ex: `~/app-offline` ou `/var/www/app-offline`)
- [ ] Arquivo `.env` criado no diretório com `JWT_SECRET` configurado
- [ ] PM2 instalado (opcional, mas recomendado)
- [ ] Chave SSH gerada e adicionada ao `authorized_keys`
- [ ] Caminho do diretório anotado (para o secret `VPS_DEPLOY_PATH`)

## 🔐 Configurar Secrets no GitHub

Depois do setup inicial, configure os secrets:

1. Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`

2. Adicione os seguintes secrets:

| Secret | Valor | Como Obter |
|--------|-------|------------|
| `VPS_HOST` | IP ou domínio da VPS | Ex: `123.456.789.0` |
| `VPS_USER` | Usuário SSH | Ex: `root` ou seu usuário |
| `VPS_SSH_KEY` | Chave privada SSH | `cat ~/.ssh/github_actions` na VPS |
| `VPS_PORT` | Porta SSH | Geralmente `22` |
| `VPS_DEPLOY_PATH` | Caminho do projeto | Resultado de `pwd` no diretório criado |

## 🚀 Primeiro Deploy

Depois de configurar os secrets:

1. Faça um pequeno commit e push:
   ```bash
   git commit --allow-empty -m "Trigger first deployment"
   git push origin master
   ```

2. Acompanhe o deploy:
   - Acesse: `https://github.com/othonet/app_offline/actions`
   - Veja o workflow em execução

3. Verifique na VPS:
   ```bash
   # Se usar PM2
   pm2 list
   pm2 logs app-offline
   
   # Verificar se a aplicação está rodando
   curl http://localhost:3000
   ```

## ⚠️ Importante

- **NÃO** clone o repositório manualmente - o CI/CD fará isso
- **NÃO** execute `npm install` manualmente - o CI/CD fará isso
- **SIM**, crie o diretório e o arquivo `.env` antes
- O arquivo `.env` **não** será sobrescrito pelo CI/CD (está no `.gitignore`)

## 🛠️ Troubleshooting

### Erro: "Directory does not exist"
- Certifique-se de que o diretório foi criado
- Verifique o caminho no secret `VPS_DEPLOY_PATH`

### Erro: "Cannot find module"
- O CI/CD instalará as dependências automaticamente
- Verifique se Node.js está instalado corretamente

### Erro: "Database not found"
- O Prisma criará o banco automaticamente na primeira migração
- Certifique-se de que o diretório `prisma/` tem permissões de escrita

### Aplicação não inicia
- Verifique os logs: `pm2 logs app-offline`
- Verifique o arquivo `.env` está correto
- Verifique se a porta está disponível

