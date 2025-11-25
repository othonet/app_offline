# Sistema de Produção - App Offline

Sistema offline de gestão de produção com verificação de licença online.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **Express-handlebars** - Template engine
- **TailwindCSS** - Framework CSS
- **JWT** - Autenticação e autorização
- **SQLite** - Banco de dados (pode ser alterado)

## 📋 Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório ou extraia os arquivos
2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Execute o seed para criar usuário inicial:
```bash
npm run prisma:seed
```

5. Compile o CSS do Tailwind:
```bash
npm run build-css
```

**Ou execute tudo de uma vez:**
```bash
npm run setup
```

6. Configure o arquivo `.env` (copie do `.env.example`):
```bash
cp .env.example .env
```

Edite o `.env` e configure:
- `JWT_SECRET` - Chave secreta para JWT (use uma string aleatória forte)
- `PORT` - Porta do servidor (padrão: 3000)

## 🎯 Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

Acesse: `http://localhost:3000`

## 👤 Credenciais Padrão

Após executar o seed:
- **Usuário:** `admin`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

## 🔐 Autenticação

- Sistema utiliza JWT para autenticação
- Sessão expira após **15 minutos de inatividade**
- Timer de sessão visível no topo da página
- Sessão é renovada automaticamente com atividade do usuário

## 📁 Estrutura do Projeto

```
app-offline/
├── src/
│   ├── middleware/      # Middlewares (auth, etc)
│   ├── routes/          # Rotas da aplicação
│   ├── views/           # Templates Handlebars
│   │   ├── layouts/     # Layouts principais
│   │   └── ...          # Views das páginas
│   ├── public/          # Arquivos estáticos
│   │   └── css/         # CSS compilado
│   ├── utils/           # Utilitários
│   └── scripts/         # Scripts auxiliares
├── prisma/
│   └── schema.prisma    # Schema do banco de dados
├── server.js            # Arquivo principal
└── package.json
```

## 📝 Cadastros Disponíveis

- ✅ Setores
- ✅ Linhas
- ✅ Válvulas
- ✅ Cabeças
- ✅ Posições de Embalagem
- ✅ Tipos de Caixas
- ✅ Metas

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- Tokens JWT com expiração
- Sessões gerenciadas no banco de dados
- Proteção CSRF (via express-session)
- Cookies httpOnly

## 📄 Licença

Sistema proprietário - Todos os direitos reservados.

