require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Configuração de arquivos estáticos com headers para evitar cache em desenvolvimento
app.use(express.static(path.join(__dirname, 'src/public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
  etag: false
}));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 15 * 60 * 1000 // 15 minutos
  }
}));

// Handlebars configuration
const hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src/views/layouts'),
  partialsDir: path.join(__dirname, 'src/views/partials'),
  extname: '.hbs',
  helpers: {
    eq: function(a, b) { 
      // Converte ambos para string para comparação mais robusta
      return String(a) === String(b); 
    },
    ne: function(a, b) {
      return String(a) !== String(b);
    },
    formatDate: function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('pt-BR');
    },
    formatDateTime: function(date) {
      if (!date) return '';
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      } catch (e) {
        return '';
      }
    },
    substring: function(str, start, end) {
      if (!str) return '';
      return str.substring(start, end || start + 1);
    },
    isAdmin: function(user) {
      if (!user || !user.role) return false;
      return String(user.role) === 'ADMIN';
    },
    gt: function(a, b) {
      return Number(a) > Number(b);
    },
    math: function(lvalue, operator, rvalue) {
      lvalue = parseFloat(lvalue) || 0;
      rvalue = parseFloat(rvalue) || 0;
      const result = {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": rvalue !== 0 ? lvalue / rvalue : 0,
        "%": lvalue % rvalue
      }[operator];
      return result !== undefined ? result : 0;
    },
    or: function(a, b) {
      return a || b;
    },
    and: function(a, b) {
      return a && b;
    }
  }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

// Routes
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const setorRoutes = require('./src/routes/setor');
const linhaRoutes = require('./src/routes/linha');
const valvulaRoutes = require('./src/routes/valvula');
const cabecaRoutes = require('./src/routes/cabeca');
const posicaoEmbalagemRoutes = require('./src/routes/posicaoEmbalagem');
const tipoCaixaRoutes = require('./src/routes/tipoCaixa');
const metaRoutes = require('./src/routes/meta');
const adminRoutes = require('./src/routes/admin');
const adminAuthRoutes = require('./src/routes/adminAuth');
const usuarioRoutes = require('./src/routes/usuario');
const apontamentoFrutaRoutes = require('./src/routes/apontamentoFruta');
const estoqueFrutaRoutes = require('./src/routes/estoqueFruta');

app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);
app.use('/apontamento-fruta', apontamentoFrutaRoutes);
app.use('/estoque-fruta', estoqueFrutaRoutes);
app.use('/admin/auth', adminAuthRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/setores', setorRoutes);
app.use('/admin/linhas', linhaRoutes);
app.use('/admin/valvulas', valvulaRoutes);
app.use('/admin/cabecas', cabecaRoutes);
app.use('/admin/posicoes-embalagem', posicaoEmbalagemRoutes);
app.use('/admin/tipos-caixa', tipoCaixaRoutes);
app.use('/admin/metas', metaRoutes);
app.use('/admin/usuarios', usuarioRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Página não encontrada',
    message: 'A página que você está procurando não existe.' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Erro interno',
    message: 'Ocorreu um erro no servidor.'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

