const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin, requireCreate, requireEdit, requireDelete } = require('../middleware/auth');
const { getPaginationParams, getSearchParams, getSortParams, getPaginationInfo, buildSearchConditions } = require('../utils/pagination');

const prisma = new PrismaClient();

// Listar setores (apenas admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req, 10);
    const searchParams = getSearchParams(req, ['nome', 'descricao']);
    const sortParams = getSortParams(req, { nome: 'asc' }, ['nome', 'descricao', 'ativo', 'createdAt']);
    
    const where = {
      ...buildSearchConditions(searchParams)
    };

    const [setores, total] = await Promise.all([
      prisma.setor.findMany({
        where,
        orderBy: sortParams,
        skip,
        take: limit
      }),
      prisma.setor.count({ where })
    ]);

    const pagination = getPaginationInfo(page, limit, total);
    
    res.render('setor/index', {
      title: 'Cadastro de Setores',
      setores,
      pagination,
      search: req.query.search || '',
      sort: Object.keys(sortParams)[0],
      order: Object.values(sortParams)[0],
      activeMenu: 'setores',
      baseUrl: '/admin/setores'
    });
  } catch (error) {
    console.error('Erro ao listar setores:', error);
    console.error('Stack:', error.stack);
    res.redirect('/admin/setores?error=' + encodeURIComponent('Erro ao carregar setores: ' + (error.message || 'Erro desconhecido')));
  }
});

// Formulário de novo setor
router.get('/novo', authenticateToken, requireCreate, (req, res) => {
  res.render('setor/form', {
    title: 'Novo Setor',
    setor: null,
    activeMenu: 'setores'
  });
});

// Formulário de edição
router.get('/editar/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const setor = await prisma.setor.findUnique({
      where: { id: req.params.id }
    });

    if (!setor) {
      return res.redirect('/admin/setores?error=' + encodeURIComponent('Setor não encontrado'));
    }

    res.render('setor/form', {
      title: 'Editar Setor',
      setor,
      activeMenu: 'setores'
    });
  } catch (error) {
    console.error('Erro ao buscar setor:', error);
    res.redirect('/admin/setores?error=' + encodeURIComponent('Erro ao buscar setor. Tente novamente'));
  }
});

// Criar setor
router.post('/', authenticateToken, requireCreate, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/setores/novo?error=' + encodeURIComponent('O nome do setor é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/setores/novo?error=' + encodeURIComponent('O nome do setor deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.setor.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/setores?success=' + encodeURIComponent('Setor criado com sucesso!'));
  } catch (error) {
    console.error('Erro ao criar setor:', error);
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/setores/novo?error=' + encodeURIComponent('Já existe um setor com este nome'));
    }
    
    res.redirect('/admin/setores/novo?error=' + encodeURIComponent('Erro ao criar setor. Tente novamente'));
  }
});

// Atualizar setor
router.post('/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/setores/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome do setor é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/setores/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome do setor deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.setor.update({
      where: { id: req.params.id },
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/setores?success=' + encodeURIComponent('Setor atualizado com sucesso!'));
  } catch (error) {
    console.error('Erro ao atualizar setor:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/setores?error=' + encodeURIComponent('Setor não encontrado'));
    }
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/setores/editar/' + req.params.id + '?error=' + encodeURIComponent('Já existe um setor com este nome'));
    }
    
    res.redirect('/admin/setores?error=' + encodeURIComponent('Erro ao atualizar setor. Tente novamente'));
  }
});

// Deletar setor
router.post('/deletar/:id', authenticateToken, requireDelete, async (req, res) => {
  try {
    await prisma.setor.delete({
      where: { id: req.params.id }
    });

    res.redirect('/admin/setores?success=' + encodeURIComponent('Setor deletado com sucesso!'));
  } catch (error) {
    console.error('Erro ao deletar setor:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/setores?error=' + encodeURIComponent('Setor não encontrado'));
    }
    
    // Erro de violação de chave estrangeira
    if (error.code === 'P2003') {
      return res.redirect('/admin/setores?error=' + encodeURIComponent('Não é possível deletar este setor pois ele está sendo utilizado em outros registros'));
    }
    
    res.redirect('/admin/setores?error=' + encodeURIComponent('Erro ao deletar setor. Tente novamente'));
  }
});

module.exports = router;

