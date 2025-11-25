# 🚀 Guia de Deploy CI/CD - VPS Hostinger

Este guia explica como configurar o CI/CD para fazer deploy automático na VPS da Hostinger sempre que houver push na branch `master`.

## 📋 Pré-requisitos

1. **Acesso SSH à VPS Hostinger**
2. **Node.js instalado na VPS** (versão 18 ou superior)
3. **npm instalado**
4. **Prisma CLI instalado globalmente** (opcional, mas recomendado)
5. **Gerenciador de processos** (PM2 ou systemd) - recomendado

## 🔧 Configuração Inicial na VPS

### 1. Preparar o ambiente na VPS

Conecte-se à sua VPS via SSH e execute:

```bash
# Criar diretório do projeto (ajuste o caminho conforme necessário)
sudo mkdir -p /var/www/app-offline
sudo chown $USER:$USER /var/www/app-offline

# Clonar o repositório (primeira vez)
cd /var/www
git clone https://github.com/othonet/app_offline.git app-offline
cd app-offline

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas configurações

# Gerar Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate deploy

# Compilar CSS
npm run build-css

# Criar usuário admin (opcional)
npm run prisma:seed
```

### 2. Configurar gerenciador de processos

#### Opção A: PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação com PM2
cd /var/www/app-offline
pm2 start server.js --name app-offline

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save
```

#### Opção B: systemd

Crie o arquivo `/etc/systemd/system/app-offline.service`:

```ini
[Unit]
Description=App Offline - Sistema de Produção
After=network.target

[Service]
Type=simple
User=seu-usuario
WorkingDirectory=/var/www/app-offline
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node /var/www/app-offline/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Ative o serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl enable app-offline
sudo systemctl start app-offline
```

## 🔐 Configurar Secrets no GitHub

Para que o GitHub Actions possa fazer deploy na sua VPS, você precisa configurar os seguintes secrets:

1. Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Adicione os seguintes secrets:

### Secrets necessários:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `VPS_HOST` | IP ou domínio da VPS | `123.456.789.0` ou `vps.exemplo.com` |
| `VPS_USER` | Usuário SSH da VPS | `root` ou `usuario` |
| `VPS_SSH_KEY` | Chave privada SSH | Conteúdo completo da chave privada |
| `VPS_PORT` | Porta SSH (opcional) | `22` (padrão) |
| `VPS_DEPLOY_PATH` | Caminho do projeto na VPS | `/var/www/app-offline` |

### Gerar chave SSH para GitHub Actions

Na sua VPS, execute:

```bash
# Gerar par de chaves SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Adicionar chave pública ao authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Exibir chave privada (copie o conteúdo completo)
cat ~/.ssh/github_actions
```

**⚠️ IMPORTANTE:** Copie o conteúdo completo da chave privada (incluindo `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`) e cole no secret `VPS_SSH_KEY` do GitHub.

### Alternativa: Usar chave SSH existente

Se você já tem uma chave SSH configurada:

```bash
# Na sua máquina local, exibir a chave privada
cat ~/.ssh/id_rsa  # ou id_ed25519, dependendo da sua chave
```

Copie o conteúdo e adicione como secret `VPS_SSH_KEY`.

## 🎯 Como Funciona

1. **Push para `master`**: Quando você faz push na branch `master`, o GitHub Actions é acionado automaticamente.

2. **Build**: O workflow:
   - Faz checkout do código
   - Instala dependências
   - Gera Prisma Client
   - Compila CSS

3. **Deploy**: 
   - Envia os arquivos para a VPS via SCP
   - Executa comandos na VPS via SSH:
     - Instala dependências
     - Gera Prisma Client
     - Executa migrações
     - Compila CSS
     - Reinicia a aplicação

4. **Reinicialização**: A aplicação é reiniciada automaticamente usando PM2 ou systemd.

## 🔍 Verificar Deploy

Após um push, você pode:

1. Verificar o status do workflow em: `https://github.com/othonet/app_offline/actions`
2. Verificar logs na VPS:
   ```bash
   # Se usar PM2
   pm2 logs app-offline
   
   # Se usar systemd
   sudo journalctl -u app-offline -f
   ```

## 🛠️ Execução Manual

Você também pode executar o deploy manualmente:

1. **Via GitHub Actions**: Acesse `Actions` > `Deploy to VPS` > `Run workflow`
2. **Diretamente na VPS**: Execute o script `deploy.sh`:
   ```bash
   cd /var/www/app-offline
   chmod +x deploy.sh
   ./deploy.sh
   ```

## ⚠️ Troubleshooting

### Erro de permissão SSH
- Verifique se a chave SSH está correta
- Teste a conexão: `ssh -i ~/.ssh/github_actions usuario@vps-host`

### Erro ao executar migrações
- Verifique se o banco de dados existe
- Execute manualmente: `npm run prisma:migrate deploy`

### Aplicação não reinicia
- Verifique se PM2 ou systemd está configurado
- Reinicie manualmente: `pm2 restart app-offline` ou `sudo systemctl restart app-offline`

### Arquivos não são enviados
- Verifique o caminho `VPS_DEPLOY_PATH`
- Verifique permissões do diretório na VPS

## 📝 Notas Importantes

- O arquivo `.env` **não** é enviado pelo GitHub Actions (está no `.gitignore`)
- Certifique-se de ter o arquivo `.env` configurado na VPS
- O banco de dados (`database.db`) também não é enviado
- Migrações são executadas automaticamente, mas dados existentes são preservados

## 🔒 Segurança

- Nunca commite o arquivo `.env` no repositório
- Mantenha as chaves SSH seguras
- Use senhas fortes para o banco de dados
- Configure firewall na VPS para permitir apenas portas necessárias

