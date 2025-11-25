# 📍 Como Descobrir o Caminho da Aplicação na VPS Hostinger

Existem várias formas de descobrir onde sua aplicação está ou deve estar instalada na VPS Hostinger.

## 🔍 Método 1: Verificar se a Aplicação Já Está Instalada

### Conectar-se à VPS

```bash
ssh usuario@seu-ip-vps
# ou
ssh root@seu-ip-vps
```

### Procurar pela Aplicação

```bash
# Procurar por arquivos do projeto
find / -name "server.js" -type f 2>/dev/null
find / -name "package.json" -type f 2>/dev/null | grep app-offline

# Procurar em diretórios comuns
ls -la /var/www/
ls -la /home/usuario/
ls -la /opt/
ls -la ~/
```

### Verificar Processos em Execução

```bash
# Se estiver usando PM2
pm2 list
pm2 info app-offline  # Mostra o caminho do processo

# Se estiver usando systemd
systemctl status app-offline
# Ou verificar o arquivo de serviço
cat /etc/systemd/system/app-offline.service | grep WorkingDirectory

# Ver processos Node.js em execução
ps aux | grep node
ps aux | grep "server.js"
```

## 🔍 Método 2: Verificar Diretórios Comuns da Hostinger

A Hostinger geralmente usa estes caminhos:

### Para Sites/Aplicações Web:

```bash
# Verificar diretórios comuns
ls -la /home/usuario/domains/
ls -la /home/usuario/public_html/
ls -la /var/www/
ls -la /home/usuario/
```

### Estrutura Típica da Hostinger:

```
/home/usuario/
├── domains/
│   └── seudominio.com/
│       └── public_html/    # Site principal
├── public_html/            # Site padrão
└── app-offline/            # Sua aplicação pode estar aqui
```

## 🔍 Método 3: Verificar Configurações do Servidor Web

### Se estiver usando Nginx:

```bash
# Verificar configurações do Nginx
cat /etc/nginx/sites-enabled/*
cat /etc/nginx/nginx.conf | grep root

# Ou procurar por arquivos de configuração
find /etc/nginx -name "*.conf" -exec grep -l "app-offline\|server.js" {} \;
```

### Se estiver usando Apache:

```bash
# Verificar configurações do Apache
cat /etc/apache2/sites-enabled/*
cat /etc/httpd/conf/httpd.conf | grep DocumentRoot
```

## 🔍 Método 4: Verificar Variáveis de Ambiente

```bash
# Verificar processos Node.js e suas variáveis
ps eaux | grep node

# Ou se estiver usando PM2
pm2 env 0  # Mostra variáveis do processo 0
```

## 📋 Método 5: Criar um Novo Diretório (Se Não Existir)

Se a aplicação ainda não está instalada, você pode criar em um dos seguintes locais:

### Opção A: Em /var/www/ (Recomendado para aplicações)

```bash
sudo mkdir -p /var/www/app-offline
sudo chown $USER:$USER /var/www/app-offline
cd /var/www/app-offline
pwd  # Mostra o caminho completo: /var/www/app-offline
```

### Opção B: No diretório home do usuário

```bash
mkdir -p ~/app-offline
cd ~/app-offline
pwd  # Mostra o caminho completo: /home/usuario/app-offline
```

### Opção C: Em /opt/ (Para aplicações do sistema)

```bash
sudo mkdir -p /opt/app-offline
sudo chown $USER:$USER /opt/app-offline
cd /opt/app-offline
pwd  # Mostra o caminho completo: /opt/app-offline
```

## 🎯 Como Usar o Caminho no GitHub Secrets

Depois de descobrir o caminho, adicione como secret:

1. Acesse: `https://github.com/othonet/app_offline/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Nome: `VPS_DEPLOY_PATH`
4. Valor: Cole o caminho completo (ex: `/var/www/app-offline` ou `/home/usuario/app-offline`)
5. Clique em **"Add secret"**

## 🔧 Script para Descobrir Automaticamente

Execute este script na VPS para descobrir onde está a aplicação:

```bash
#!/bin/bash
echo "🔍 Procurando aplicação Node.js..."

# Verificar PM2
if command -v pm2 &> /dev/null; then
    echo "📦 Processos PM2:"
    pm2 list
    echo ""
    pm2 info app-offline 2>/dev/null | grep "script path" || echo "App não encontrado no PM2"
    echo ""
fi

# Verificar systemd
if systemctl list-units --type=service | grep -q app-offline; then
    echo "⚙️ Serviço systemd encontrado:"
    systemctl status app-offline --no-pager | grep "Main PID\|WorkingDirectory"
    echo ""
fi

# Procurar arquivos
echo "📁 Procurando server.js..."
find /home /var/www /opt -name "server.js" -type f 2>/dev/null | head -5

echo ""
echo "📁 Procurando package.json com app-offline..."
find /home /var/www /opt -name "package.json" -type f 2>/dev/null | xargs grep -l "app-offline" 2>/dev/null | head -5

echo ""
echo "✅ Verifique os caminhos acima e use o que corresponde à sua aplicação!"
```

## 📝 Exemplos de Caminhos Comuns

| Tipo de Instalação | Caminho Típico |
|-------------------|----------------|
| Hostinger padrão | `/home/usuario/app-offline` |
| Aplicação do sistema | `/var/www/app-offline` |
| Aplicação em /opt | `/opt/app-offline` |
| Site com domínio | `/home/usuario/domains/seudominio.com/app-offline` |

## ⚠️ Dica Importante

**Use o comando `pwd`** quando estiver no diretório da aplicação para ver o caminho exato:

```bash
cd /caminho/para/sua/aplicacao
pwd  # Mostra o caminho completo
```

## 🚀 Próximos Passos

Depois de descobrir o caminho:

1. ✅ Adicione como secret `VPS_DEPLOY_PATH` no GitHub
2. ✅ Certifique-se de que o diretório existe e tem permissões corretas
3. ✅ Se a aplicação não existir, crie o diretório e clone o repositório

