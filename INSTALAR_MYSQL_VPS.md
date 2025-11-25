# 🗄️ Instalar e Configurar MySQL na VPS Hostinger

Este guia mostra como instalar e configurar o MySQL para sua aplicação na VPS Hostinger.

## 📋 Passo 1: Instalar MySQL

Conecte-se à VPS e execute:

```bash
# Atualizar pacotes
sudo apt update

# Instalar MySQL Server
sudo apt install mysql-server -y

# Verificar instalação
mysql --version
```

## 🔐 Passo 2: Configurar Segurança do MySQL

```bash
# Executar script de segurança
sudo mysql_secure_installation
```

Durante a configuração:
- **Senha root**: Defina uma senha forte e anote
- **Remover usuários anônimos**: Y
- **Desabilitar login root remotamente**: Y
- **Remover banco de teste**: Y
- **Recarregar privilégios**: Y

## 🗄️ Passo 3: Criar Banco de Dados e Usuário

```bash
# Conectar ao MySQL como root
sudo mysql -u root -p
```

No prompt do MySQL, execute:

```sql
-- Criar banco de dados
CREATE DATABASE app_offline CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário para a aplicação
CREATE USER 'app_offline_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';

-- Dar permissões ao usuário
GRANT ALL PRIVILEGES ON app_offline.* TO 'app_offline_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;

-- Sair
EXIT;
```

**⚠️ IMPORTANTE:** 
- Substitua `'senha_forte_aqui'` por uma senha segura
- Anote o nome do usuário e senha - você precisará para o `.env`

## 📝 Passo 4: Configurar DATABASE_URL no .env

No diretório do projeto (`~/app_offline`), edite o arquivo `.env`:

```bash
cd ~/app_offline
nano .env
```

Adicione ou atualize a linha `DATABASE_URL`:

```env
# Configurações do Servidor
NODE_ENV=production
PORT=3000

# Configurações de Autenticação JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-altere-este-valor
JWT_EXPIRES_IN=15m

# Configurações do Banco de Dados MySQL
DATABASE_URL="mysql://app_offline_user:senha_forte_aqui@localhost:3306/app_offline"
```

**Formato da DATABASE_URL:**
```
mysql://[usuário]:[senha]@[host]:[porta]/[nome_do_banco]
```

Exemplo:
```
mysql://app_offline_user:MinhaSenh@123@localhost:3306/app_offline
```

**⚠️ IMPORTANTE:** 
- Substitua `senha_forte_aqui` pela senha que você criou no MySQL
- Se a senha tiver caracteres especiais, pode ser necessário codificar na URL

## ✅ Passo 5: Verificar Conexão

```bash
# No diretório do projeto
cd ~/app_offline

# Testar conexão com Prisma
npx prisma db pull
```

Se não houver erros, a conexão está funcionando!

## 🚀 Passo 6: Executar Migrações

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrações (cria as tabelas)
npm run prisma:migrate deploy
```

## 🔍 Verificar se Funcionou

```bash
# Conectar ao MySQL
sudo mysql -u root -p

# Verificar se as tabelas foram criadas
USE app_offline;
SHOW TABLES;

# Você deve ver tabelas como: users, sessions, setores, linhas, etc.
EXIT;
```

## 🛠️ Comandos Úteis do MySQL

```bash
# Conectar ao MySQL
sudo mysql -u root -p

# Conectar com o usuário da aplicação
mysql -u app_offline_user -p app_offline

# Ver bancos de dados
SHOW DATABASES;

# Usar um banco
USE app_offline;

# Ver tabelas
SHOW TABLES;

# Ver estrutura de uma tabela
DESCRIBE users;

# Ver dados de uma tabela
SELECT * FROM users LIMIT 10;
```

## 🔒 Segurança Adicional

### Configurar Firewall (se necessário)

```bash
# Verificar se o MySQL está escutando apenas localhost
sudo netstat -tlnp | grep mysql

# Deve mostrar: 127.0.0.1:3306 (apenas localhost)
```

### Backup do Banco de Dados

```bash
# Fazer backup
mysqldump -u app_offline_user -p app_offline > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u app_offline_user -p app_offline < backup_20250121.sql
```

## ⚠️ Troubleshooting

### Erro: "Access denied for user"

- Verifique se o usuário e senha estão corretos no `.env`
- Verifique se o usuário tem permissões: `GRANT ALL PRIVILEGES ON app_offline.* TO 'app_offline_user'@'localhost';`

### Erro: "Can't connect to MySQL server"

- Verifique se o MySQL está rodando: `sudo systemctl status mysql`
- Inicie o MySQL: `sudo systemctl start mysql`
- Configure para iniciar no boot: `sudo systemctl enable mysql`

### Erro: "Unknown database"

- Verifique se o banco foi criado: `SHOW DATABASES;`
- Crie o banco se não existir: `CREATE DATABASE app_offline;`

### Senha com caracteres especiais na URL

Se sua senha tiver caracteres especiais (como `@`, `#`, `$`, etc.), você precisa codificá-los na URL:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `&` → `%26`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`

Ou use uma senha sem caracteres especiais para facilitar.

## 📝 Resumo Rápido

```bash
# 1. Instalar
sudo apt update && sudo apt install mysql-server -y

# 2. Configurar segurança
sudo mysql_secure_installation

# 3. Criar banco e usuário
sudo mysql -u root -p
# (executar comandos SQL acima)

# 4. Configurar .env
nano ~/app_offline/.env
# Adicionar: DATABASE_URL="mysql://usuario:senha@localhost:3306/app_offline"

# 5. Executar migrações
cd ~/app_offline
npm run prisma:generate
npm run prisma:migrate deploy
```

## ✅ Próximos Passos

Depois de configurar o MySQL:

1. ✅ Verifique se o `.env` está correto
2. ✅ Teste a conexão: `npx prisma db pull`
3. ✅ Execute as migrações: `npm run prisma:migrate deploy`
4. ✅ O CI/CD fará o resto automaticamente no próximo deploy!

