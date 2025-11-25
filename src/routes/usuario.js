const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getPaginationParams, getSearchParams, getSortParams, getPaginationInfo, buildSearchConditions } = require('../utils/pagination');

const prisma = new PrismaClient();

// Listar usuários (apenas admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req, 10);
    const searchParams = getSearchParams(req, ['username', 'name', 'email']);
    const sortParams = getSortParams(req, { name: 'asc' }, ['username', 'name', 'email', 'role', 'active', 'createdAt']);
    
    const where = {
      ...buildSearchConditions(searchParams)
    };

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: sortParams,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    const pagination = getPaginationInfo(page, limit, total);
    
    res.render('usuario/index', {
      title: 'Gerenciamento de Usuários',
      usuarios,
      pagination,
      search: req.query.search || '',
      sort: Object.keys(sortParams)[0],
      order: Object.values(sortParams)[0],
      activeMenu: 'usuarios',
      baseUrl: '/admin/usuarios'
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.redirect('/admin/usuarios?error=' + encodeURIComponent('Erro ao carregar usuários. Tente novamente mais tarde'));
  }
});

// Formulário de novo usuário (apenas admin)
router.get('/novo', authenticateToken, requireAdmin, (req, res) => {
  res.render('usuario/form', {
    title: 'Novo Usuário',
    usuario: null,
    activeMenu: 'usuarios'
  });
});

// Formulário de edição (apenas admin)
router.get('/editar/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        active: true
      }
    });

    if (!usuario) {
      return res.redirect('/admin/usuarios?error=' + encodeURIComponent('Usuário não encontrado'));
    }

    res.render('usuario/form', {
      title: 'Editar Usuário',
      usuario,
      activeMenu: 'admin'
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.redirect('/admin/usuarios?error=' + encodeURIComponent('Erro ao buscar usuário. Tente novamente'));
  }
});

// Criar usuário (apenas admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, name, email, role, active } = req.body;
    
    // Validações
    if (!username || username.trim().length === 0) {
      return res.redirect('/admin/usuarios/novo?error=' + encodeURIComponent('O nome de usuário é obrigatório'));
    }

    if (username.trim().length < 3) {
      return res.redirect('/admin/usuarios/novo?error=' + encodeURIComponent('O nome de usuário deve ter pelo menos 3 caracteres'));
    }

    if (!password || password.trim().length === 0) {
      return res.redirect('/admin/usuarios/novo?error=' + encodeURIComponent('A senha é obrigatória'));
    }

    if (password.trim().length < 6) {
      return res.redirect('/admin/usuarios/novo?error=' + encodeURIComponent('A senha deve ter pelo menos 6 caracteres'));
    }

    if (!name || name.trim().length === 0) {
      return res.redirect('/admin/usuarios/novo?error=' + encodeURIComponent('O nome é obrigatório'));
    }

    if (!role || !['ADMIN', 'DIRETOR', 'ANALISTA', 'INSPETOR'].includes(role)) {
      return res.redirect('/admin/usuarios/novo?error=' + encodeURIComponent('Nível de acesso inválido'));
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    
    await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        name: name.trim(),
        email: email ? email.trim() : null,
        role: role,
        active: active === 'on' || active === true
      }
    });

    res.redirect('/admin/usuarios?success=' + encodeURIComponent('Usuário criado com sucesso!'));
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/usuarios/novo?error=' + encodeURIComponent('Já existe um usuário com este nome de usuário'));
    }
    
    res.redirect('/admin/usuarios/novo?error=' + encodeURIComponent('Erro ao criar usuário. Tente novamente'));
  }
});

// Atualizar usuário (apenas admin)
router.post('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, name, email, role, active } = req.body;
    
    // Validações
    if (!username || username.trim().length === 0) {
      return res.redirect('/admin/usuarios/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome de usuário é obrigatório'));
    }

    if (username.trim().length < 3) {
      return res.redirect('/admin/usuarios/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome de usuário deve ter pelo menos 3 caracteres'));
    }

    if (!name || name.trim().length === 0) {
      return res.redirect('/admin/usuarios/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome é obrigatório'));
    }

    if (!role || !['ADMIN', 'DIRETOR', 'ANALISTA', 'INSPETOR'].includes(role)) {
      return res.redirect('/admin/usuarios/editar/' + req.params.id + '?error=' + encodeURIComponent('Nível de acesso inválido'));
    }

    // Prepara dados para atualização
    const updateData = {
      username: username.trim(),
      name: name.trim(),
      email: email ? email.trim() : null,
      role: role,
      active: active === 'on' || active === true
    };

    // Se uma nova senha foi fornecida, atualiza
    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return res.redirect('/admin/usuarios/editar/' + req.params.id + '?error=' + encodeURIComponent('A senha deve ter pelo menos 6 caracteres'));
      }
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }
    
    await prisma.user.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.redirect('/admin/usuarios?success=' + encodeURIComponent('Usuário atualizado com sucesso!'));
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/usuarios?error=' + encodeURIComponent('Usuário não encontrado'));
    }
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/usuarios/editar/' + req.params.id + '?error=' + encodeURIComponent('Já existe um usuário com este nome de usuário'));
    }
    
    res.redirect('/admin/usuarios/editar/' + req.params.id + '?error=' + encodeURIComponent('Erro ao atualizar usuário. Tente novamente'));
  }
});

// Deletar usuário (apenas admin)
router.post('/deletar/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Não permite deletar o próprio usuário
    if (req.user.id === req.params.id) {
      return res.redirect('/admin/usuarios?error=' + encodeURIComponent('Você não pode deletar seu próprio usuário'));
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.redirect('/admin/usuarios?success=' + encodeURIComponent('Usuário deletado com sucesso!'));
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/usuarios?error=' + encodeURIComponent('Usuário não encontrado'));
    }
    
    // Erro de violação de chave estrangeira
    if (error.code === 'P2003') {
      return res.redirect('/admin/usuarios?error=' + encodeURIComponent('Não é possível deletar este usuário pois ele possui sessões ativas'));
    }
    
    res.redirect('/admin/usuarios?error=' + encodeURIComponent('Erro ao deletar usuário. Tente novamente'));
  }
});

module.exports = router;

