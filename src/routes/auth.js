const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken, createSession } = require('../utils/jwt');
const { redirectIfAuthenticated } = require('../middleware/auth');

const prisma = new PrismaClient();

// Página de login
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', {
    layout: 'auth',
    title: 'Login',
    error: req.query.error,
    expired: req.query.expired === 'true'
  });
});

// Processar login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validação de campos obrigatórios
    if (!username || !password) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Por favor, preencha todos os campos'));
    }

    // Validação de formato básico
    if (username.trim().length === 0) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('O usuário não pode estar vazio'));
    }

    if (password.trim().length === 0) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('A senha não pode estar vazia'));
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (!user) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Usuário não encontrado'));
    }

    if (!user.active) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Usuário inativo. Entre em contato com o administrador'));
    }

    // Verifica senha
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.redirect('/auth/login?error=' + encodeURIComponent('Senha incorreta'));
    }

    // Gera token e cria sessão
    const token = generateToken(user.id);
    await createSession(user.id, token);

    // Define cookie com token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000 // 15 minutos
    });

    res.redirect('/dashboard?success=' + encodeURIComponent('Login realizado com sucesso! Bem-vindo, ' + user.name));
  } catch (error) {
    console.error('Erro no login:', error);
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Erro ao processar login. Tente novamente mais tarde';
    if (error.code === 'P2002') {
      errorMessage = 'Erro de duplicação no banco de dados';
    }
    
    return res.redirect('/auth/login?error=' + encodeURIComponent(errorMessage));
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (token) {
      const { deleteSession } = require('../utils/jwt');
      await deleteSession(token);
    }
    
    res.clearCookie('token');
    
    // Verifica se está em rota admin para redirecionar corretamente
    const isAdminRoute = req.originalUrl.startsWith('/admin') || 
                         req.baseUrl.startsWith('/admin') || 
                         req.url.startsWith('/admin') ||
                         (req.path && req.path !== '/' && (req.baseUrl + req.path).startsWith('/admin')) ||
                         req.body.fromAdmin === 'true'; // Flag do formulário
    
    if (isAdminRoute) {
      return res.redirect('/admin/auth/login?info=' + encodeURIComponent('Logout realizado com sucesso. Até logo!'));
    }
    
    res.redirect('/auth/login?info=' + encodeURIComponent('Logout realizado com sucesso. Até logo!'));
  } catch (error) {
    console.error('Erro no logout:', error);
    res.clearCookie('token');
    
    // Verifica se está em rota admin para redirecionar corretamente
    const isAdminRoute = req.originalUrl.startsWith('/admin') || 
                         req.baseUrl.startsWith('/admin') || 
                         req.url.startsWith('/admin') ||
                         (req.path && req.path !== '/' && (req.baseUrl + req.path).startsWith('/admin')) ||
                         req.body.fromAdmin === 'true';
    
    if (isAdminRoute) {
      return res.redirect('/admin/auth/login?warning=' + encodeURIComponent('Sessão encerrada, mas ocorreu um erro ao processar o logout'));
    }
    
    res.redirect('/auth/login?warning=' + encodeURIComponent('Sessão encerrada, mas ocorreu um erro ao processar o logout'));
  }
});

module.exports = router;

