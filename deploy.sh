#!/bin/bash

# Script de deploy para VPS Hostinger
# Este script pode ser executado manualmente na VPS ou chamado pelo GitHub Actions

set -e  # Para a execução em caso de erro

echo "🚀 Iniciando deploy..."

# Diretório do projeto (ajuste conforme necessário)
PROJECT_DIR="/var/www/app-offline"
cd "$PROJECT_DIR"

# Carrega variáveis de ambiente
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "📦 Instalando dependências..."
npm ci --production=false

echo "🔧 Gerando Prisma Client..."
npm run prisma:generate

echo "🗄️ Executando migrações do banco de dados..."
npm run prisma:migrate deploy

echo "🎨 Compilando CSS..."
npx tailwindcss -i ./src/public/css/input.css -o ./src/public/css/output.css --minify

echo "🔄 Reiniciando aplicação..."

# Verifica qual gerenciador de processos está disponível
if command -v pm2 &> /dev/null; then
    echo "Usando PM2..."
    pm2 restart app-offline || pm2 start server.js --name app-offline
elif systemctl is-active --quiet app-offline.service 2>/dev/null; then
    echo "Usando systemd..."
    sudo systemctl restart app-offline
else
    echo "⚠️ Nenhum gerenciador de processos encontrado. Reinicie manualmente."
    echo "Para usar PM2: pm2 start server.js --name app-offline"
    echo "Para usar systemd: sudo systemctl restart app-offline"
fi

echo "✅ Deploy concluído com sucesso!"

