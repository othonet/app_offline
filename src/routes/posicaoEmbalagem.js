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

    const [posicoes, total] = await Promise.all([
      prisma.posicaoEmbalagem.findMany({
        where,
        orderBy: sortParams,
        skip,
        take: limit
      }),
      prisma.posicaoEmbalagem.count({ where })
    ]);

    const pagination = getPaginationInfo(page, limit, total);
    
    res.render('posicaoEmbalagem/index', {
      title: 'Cadastro de Posições de Embalagem',
      posicoes,
      pagination,
      search: req.query.search || '',
      sort: Object.keys(sortParams)[0],
      order: Object.values(sortParams)[0],
      activeMenu: 'posicoes-embalagem',
      baseUrl: '/admin/posicoes-embalagem'
    });
  } catch (error) {
    console.error('Erro ao listar posições:', error);
    res.redirect('/admin/posicoes-embalagem?error=' + encodeURIComponent('Erro ao carregar posições de embalagem. Tente novamente mais tarde'));
  }
});

router.get('/novo', authenticateToken, requireCreate, (req, res) => {
  res.render('posicaoEmbalagem/form', {
    title: 'Nova Posição de Embalagem',
    posicao: null,
    activeMenu: 'posicoes-embalagem'
  });
});

router.get('/editar/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const posicao = await prisma.posicaoEmbalagem.findUnique({
      where: { id: req.params.id }
    });

    if (!posicao) {
      return res.redirect('/admin/posicoes-embalagem?error=' + encodeURIComponent('Posição de embalagem não encontrada'));
    }

    res.render('posicaoEmbalagem/form', {
      title: 'Editar Posição de Embalagem',
      posicao,
      activeMenu: 'posicoes-embalagem'
    });
  } catch (error) {
    console.error('Erro ao buscar posição:', error);
    res.redirect('/admin/posicoes-embalagem?error=' + encodeURIComponent('Erro ao buscar posição de embalagem. Tente novamente'));
  }
});

router.post('/', authenticateToken, requireCreate, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/posicoes-embalagem/novo?error=' + encodeURIComponent('O nome da posição de embalagem é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/posicoes-embalagem/novo?error=' + encodeURIComponent('O nome da posição de embalagem deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.posicaoEmbalagem.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/posicoes-embalagem?success=' + encodeURIComponent('Posição de embalagem criada com sucesso!'));
  } catch (error) {
    console.error('Erro ao criar posição:', error);
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/posicoes-embalagem/novo?error=' + encodeURIComponent('Já existe uma posição de embalagem com este nome'));
    }
    
    res.redirect('/admin/posicoes-embalagem/novo?error=' + encodeURIComponent('Erro ao criar posição de embalagem. Tente novamente'));
  }
});

router.post('/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/posicoes-embalagem/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da posição de embalagem é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/posicoes-embalagem/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da posição de embalagem deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.posicaoEmbalagem.update({
      where: { id: req.params.id },
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/posicoes-embalagem?success=' + encodeURIComponent('Posição de embalagem atualizada com sucesso!'));
  } catch (error) {
    console.error('Erro ao atualizar posição:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/posicoes-embalagem?error=' + encodeURIComponent('Posição de embalagem não encontrada'));
    }
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/posicoes-embalagem/editar/' + req.params.id + '?error=' + encodeURIComponent('Já existe uma posição de embalagem com este nome'));
    }
    
    res.redirect('/admin/posicoes-embalagem?error=' + encodeURIComponent('Erro ao atualizar posição de embalagem. Tente novamente'));
  }
});

router.post('/deletar/:id', authenticateToken, requireDelete, async (req, res) => {
  try {
    await prisma.posicaoEmbalagem.delete({
      where: { id: req.params.id }
    });

    res.redirect('/admin/posicoes-embalagem?success=' + encodeURIComponent('Posição de embalagem deletada com sucesso!'));
  } catch (error) {
    console.error('Erro ao deletar posição:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/posicoes-embalagem?error=' + encodeURIComponent('Posição de embalagem não encontrada'));
    }
    
    // Erro de violação de chave estrangeira
    if (error.code === 'P2003') {
      return res.redirect('/admin/posicoes-embalagem?error=' + encodeURIComponent('Não é possível deletar esta posição de embalagem pois ela está sendo utilizada em outros registros'));
    }
    
    res.redirect('/admin/posicoes-embalagem?error=' + encodeURIComponent('Erro ao deletar posição de embalagem. Tente novamente'));
  }
});

module.exports = router;

