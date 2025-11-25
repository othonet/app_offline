const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken, createSession } = require('../utils/jwt');
const { redirectIfAuthenticated } = require('../middleware/auth');

const prisma = new PrismaClient();

// Página de login admin
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', {
    layout: 'auth',
    title: 'Login - Administração',
    error: req.query.error,
    warning: req.query.warning,
    expired: req.query.expired === 'true',
    isAdminLogin: true
  });
});

// Processar login admin
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validação de campos obrigatórios
    if (!username || !password) {
      return res.redirect('/admin/auth/login?error=' + encodeURIComponent('Por favor, preencha todos os campos'));
    }

    // Validação de formato básico
    if (username.trim().length === 0) {
      return res.redirect('/admin/auth/login?error=' + encodeURIComponent('O usuário não pode estar vazio'));
    }

    if (password.trim().length === 0) {
      return res.redirect('/admin/auth/login?error=' + encodeURIComponent('A senha não pode estar vazia'));
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (!user) {
      return res.redirect('/admin/auth/login?error=' + encodeURIComponent('Usuário não encontrado'));
    }

    if (!user.active) {
      return res.redirect('/admin/auth/login?error=' + encodeURIComponent('Usuário inativo. Entre em contato com o administrador'));
    }

    // Verifica se é admin
    if (user.role !== 'ADMIN') {
      return res.redirect('/admin/auth/login?error=' + encodeURIComponent('Acesso negado. Apenas administradores podem acessar esta área'));
    }

    // Verifica senha
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.redirect('/admin/auth/login?error=' + encodeURIComponent('Senha incorreta'));
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

    res.redirect('/admin?success=' + encodeURIComponent('Login realizado com sucesso! Bem-vindo, ' + user.name));
  } catch (error) {
    console.error('Erro no login admin:', error);
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Erro ao processar login. Tente novamente mais tarde';
    if (error.code === 'P2002') {
      errorMessage = 'Erro de duplicação no banco de dados';
    }
    
    return res.redirect('/admin/auth/login?error=' + encodeURIComponent(errorMessage));
  }
});

module.exports = router;

