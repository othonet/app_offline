const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin, requireCreate, requireEdit, requireDelete } = require('../middleware/auth');
const { getPaginationParams, getSearchParams, getSortParams, getPaginationInfo, buildSearchConditions } = require('../utils/pagination');

const prisma = new PrismaClient();

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req, 10);
    const searchParams = getSearchParams(req, ['nome', 'descricao']);
    const sortParams = getSortParams(req, { nome: 'asc' }, ['nome', 'descricao', 'ativo', 'createdAt']);
    
    const where = {
      ...buildSearchConditions(searchParams)
    };

    const [cabecas, total] = await Promise.all([
      prisma.cabeca.findMany({
        where,
        orderBy: sortParams,
        skip,
        take: limit
      }),
      prisma.cabeca.count({ where })
    ]);

    const pagination = getPaginationInfo(page, limit, total);
    
    res.render('cabeca/index', {
      title: 'Cadastro de Cabeças',
      cabecas,
      pagination,
      search: req.query.search || '',
      sort: Object.keys(sortParams)[0],
      order: Object.values(sortParams)[0],
      activeMenu: 'cabecas',
      baseUrl: '/admin/cabecas'
    });
  } catch (error) {
    console.error('Erro ao listar cabeças:', error);
    res.redirect('/admin/cabecas?error=' + encodeURIComponent('Erro ao carregar cabeças. Tente novamente mais tarde'));
  }
});

router.get('/novo', authenticateToken, requireCreate, (req, res) => {
  res.render('cabeca/form', {
    title: 'Nova Cabeça',
    cabeca: null,
    activeMenu: 'cabecas'
  });
});

router.get('/editar/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const cabeca = await prisma.cabeca.findUnique({
      where: { id: req.params.id }
    });

    if (!cabeca) {
      return res.redirect('/admin/cabecas?error=' + encodeURIComponent('Cabeça não encontrada'));
    }

    res.render('cabeca/form', {
      title: 'Editar Cabeça',
      cabeca,
      activeMenu: 'cabecas'
    });
  } catch (error) {
    console.error('Erro ao buscar cabeça:', error);
    res.redirect('/admin/cabecas?error=' + encodeURIComponent('Erro ao buscar cabeça. Tente novamente'));
  }
});

router.post('/', authenticateToken, requireCreate, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/cabecas/novo?error=' + encodeURIComponent('O nome da cabeça é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/cabecas/novo?error=' + encodeURIComponent('O nome da cabeça deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.cabeca.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/cabecas?success=' + encodeURIComponent('Cabeça criada com sucesso!'));
  } catch (error) {
    console.error('Erro ao criar cabeça:', error);
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/cabecas/novo?error=' + encodeURIComponent('Já existe uma cabeça com este nome'));
    }
    
    res.redirect('/admin/cabecas/novo?error=' + encodeURIComponent('Erro ao criar cabeça. Tente novamente'));
  }
});

router.post('/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/cabecas/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da cabeça é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/cabecas/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da cabeça deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.cabeca.update({
      where: { id: req.params.id },
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/cabecas?success=' + encodeURIComponent('Cabeça atualizada com sucesso!'));
  } catch (error) {
    console.error('Erro ao atualizar cabeça:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/cabecas?error=' + encodeURIComponent('Cabeça não encontrada'));
    }
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/cabecas/editar/' + req.params.id + '?error=' + encodeURIComponent('Já existe uma cabeça com este nome'));
    }
    
    res.redirect('/admin/cabecas?error=' + encodeURIComponent('Erro ao atualizar cabeça. Tente novamente'));
  }
});

router.post('/deletar/:id', authenticateToken, requireDelete, async (req, res) => {
  try {
    await prisma.cabeca.delete({
      where: { id: req.params.id }
    });

    res.redirect('/admin/cabecas?success=' + encodeURIComponent('Cabeça deletada com sucesso!'));
  } catch (error) {
    console.error('Erro ao deletar cabeça:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/cabecas?error=' + encodeURIComponent('Cabeça não encontrada'));
    }
    
    // Erro de violação de chave estrangeira
    if (error.code === 'P2003') {
      return res.redirect('/admin/cabecas?error=' + encodeURIComponent('Não é possível deletar esta cabeça pois ela está sendo utilizada em outros registros'));
    }
    
    res.redirect('/admin/cabecas?error=' + encodeURIComponent('Erro ao deletar cabeça. Tente novamente'));
  }
});

module.exports = router;

