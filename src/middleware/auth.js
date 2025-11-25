const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função auxiliar para verificar se é rota admin
const isAdminRoute = (req) => {
  return req.originalUrl.startsWith('/admin') || 
         req.baseUrl.startsWith('/admin') || 
         req.url.startsWith('/admin') ||
         (req.path && req.path !== '/' && (req.baseUrl + req.path).startsWith('/admin'));
};

// Middleware para verificar autenticação JWT
const authenticateToken = async (req, res, next) => {
  try {
    // Verifica token no cookie
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      // Se está tentando acessar rota admin, redireciona para login admin
      if (isAdminRoute(req)) {
        return res.redirect('/admin/auth/login?warning=' + encodeURIComponent('Sessão não encontrada. Por favor, faça login novamente'));
      }
      return res.redirect('/auth/login?warning=' + encodeURIComponent('Sessão não encontrada. Por favor, faça login novamente'));
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verifica se a sessão ainda existe no banco
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      // Sessão expirada ou inválida
      await prisma.session.deleteMany({
        where: { token }
      });
      res.clearCookie('token');
      // Se está tentando acessar rota admin, redireciona para login admin
      if (isAdminRoute(req)) {
        return res.redirect('/admin/auth/login?warning=Sua sessão expirou. Por favor, faça login novamente.');
      }
      return res.redirect('/auth/login?warning=Sua sessão expirou. Por favor, faça login novamente.');
    }

    // Atualiza última atividade (renova sessão por mais 15 minutos)
    await prisma.session.update({
      where: { id: session.id },
      data: { 
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // +15 minutos
      }
    });

    // Adiciona informações do usuário na requisição
    req.user = session.user;
    req.sessionId = session.id;
    
    // Passa o usuário para todas as views
    res.locals.user = session.user;
    // Adiciona flag para verificar se é admin (para facilitar uso nos templates)
    res.locals.isAdmin = session.user && session.user.role === 'ADMIN';
    // Adiciona flag para verificar se está em rota admin
    res.locals.isAdminRoute = isAdminRoute(req);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.clearCookie('token');
      // Se está tentando acessar rota admin, redireciona para login admin
      if (isAdminRoute(req)) {
        return res.redirect('/admin/auth/login?warning=Sua sessão expirou. Por favor, faça login novamente.');
      }
      return res.redirect('/auth/login?warning=Sua sessão expirou. Por favor, faça login novamente.');
    }
    
    console.error('Erro na autenticação:', error);
    res.clearCookie('token');
    
    // Mensagens específicas para diferentes tipos de erro
    if (error.name === 'JsonWebTokenError') {
      // Se está tentando acessar rota admin, redireciona para login admin
      if (isAdminRoute(req)) {
        return res.redirect('/admin/auth/login?error=' + encodeURIComponent('Token inválido. Por favor, faça login novamente'));
      }
      return res.redirect('/auth/login?error=' + encodeURIComponent('Token inválido. Por favor, faça login novamente'));
    }
    
    // Se está tentando acessar rota admin, redireciona para login admin
    if (req.originalUrl.startsWith('/admin') || req.baseUrl.startsWith('/admin')) {
      return res.redirect('/admin/auth/login?error=' + encodeURIComponent('Erro na autenticação. Por favor, faça login novamente'));
    }
    res.redirect('/auth/login?error=' + encodeURIComponent('Erro na autenticação. Por favor, faça login novamente'));
  }
};

// Middleware para verificar se usuário já está logado (redirecionar para dashboard)
const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      // Se está em rota de login admin, redireciona para /admin
      if (isAdminRoute(req) || req.originalUrl.startsWith('/admin/auth/login')) {
        return res.redirect('/admin');
      }
      // Caso contrário, redireciona para dashboard comum
      return res.redirect('/dashboard');
    } catch (error) {
      // Token inválido, continua para login
      res.clearCookie('token');
    }
  }
  
  next();
};

// Middleware genérico para verificar se o usuário tem um dos roles permitidos
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Se está tentando acessar rota admin, redireciona para login admin
      if (isAdminRoute(req)) {
        return res.redirect('/admin/auth/login?error=' + encodeURIComponent('Acesso negado. Faça login novamente'));
      }
      return res.redirect('/auth/login?error=' + encodeURIComponent('Acesso negado. Faça login novamente'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      const roleNames = {
        'ADMIN': 'Administrador',
        'DIRETOR': 'Diretor',
        'ANALISTA': 'Analista',
        'INSPETOR': 'Inspetor'
      };
      
      const requiredRolesText = allowedRoles.map(r => roleNames[r] || r).join(' ou ');
      
      // Se está tentando acessar rota admin, redireciona para dashboard comum
      if (isAdminRoute(req)) {
        return res.redirect('/dashboard?error=' + encodeURIComponent(`Acesso negado. Apenas ${requiredRolesText} podem acessar esta página`));
      }
      
      return res.redirect('/dashboard?error=' + encodeURIComponent(`Acesso negado. Apenas ${requiredRolesText} podem acessar esta página`));
    }

    next();
  };
};

// Middleware para verificar se o usuário é admin
const requireAdmin = requireRole('ADMIN');

// Middleware para verificar se o usuário é diretor ou superior
const requireDiretor = requireRole('ADMIN', 'DIRETOR');

// Middleware para verificar se o usuário é analista ou superior
const requireAnalista = requireRole('ADMIN', 'DIRETOR', 'ANALISTA');

// Middleware para verificar permissão de criação (ADMIN, DIRETOR, ANALISTA)
const requireCreate = requireRole('ADMIN', 'DIRETOR', 'ANALISTA');

// Middleware para verificar permissão de edição (ADMIN, DIRETOR)
const requireEdit = requireRole('ADMIN', 'DIRETOR');

// Middleware para verificar permissão de exclusão (apenas ADMIN)
const requireDelete = requireRole('ADMIN');

// Middleware combinado para rotas admin: autenticação + role ADMIN
const requireAdminAuth = [authenticateToken, requireAdmin];

module.exports = {
  authenticateToken,
  redirectIfAuthenticated,
  requireAdmin,
  requireDiretor,
  requireAnalista,
  requireCreate,
  requireEdit,
  requireDelete,
  requireRole,
  requireAdminAuth
};

