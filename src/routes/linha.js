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

    const [linhas, total] = await Promise.all([
      prisma.linha.findMany({
        where,
        orderBy: sortParams,
        skip,
        take: limit
      }),
      prisma.linha.count({ where })
    ]);

    const pagination = getPaginationInfo(page, limit, total);
    
    res.render('linha/index', {
      title: 'Cadastro de Linhas',
      linhas,
      pagination,
      search: req.query.search || '',
      sort: Object.keys(sortParams)[0],
      order: Object.values(sortParams)[0],
      activeMenu: 'linhas',
      baseUrl: '/admin/linhas'
    });
  } catch (error) {
    console.error('Erro ao listar linhas:', error);
    res.redirect('/admin/linhas?error=' + encodeURIComponent('Erro ao carregar linhas. Tente novamente mais tarde'));
  }
});

router.get('/novo', authenticateToken, requireCreate, (req, res) => {
  res.render('linha/form', {
    title: 'Nova Linha',
    linha: null,
    activeMenu: 'linhas'
  });
});

router.get('/editar/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const linha = await prisma.linha.findUnique({
      where: { id: req.params.id }
    });

    if (!linha) {
      return res.redirect('/admin/linhas?error=' + encodeURIComponent('Linha não encontrada'));
    }

    res.render('linha/form', {
      title: 'Editar Linha',
      linha,
      activeMenu: 'linhas'
    });
  } catch (error) {
    console.error('Erro ao buscar linha:', error);
    res.redirect('/admin/linhas?error=' + encodeURIComponent('Erro ao buscar linha. Tente novamente'));
  }
});

router.post('/', authenticateToken, requireCreate, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/linhas/novo?error=' + encodeURIComponent('O nome da linha é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/linhas/novo?error=' + encodeURIComponent('O nome da linha deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.linha.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/linhas?success=' + encodeURIComponent('Linha criada com sucesso!'));
  } catch (error) {
    console.error('Erro ao criar linha:', error);
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/linhas/novo?error=' + encodeURIComponent('Já existe uma linha com este nome'));
    }
    
    res.redirect('/admin/linhas/novo?error=' + encodeURIComponent('Erro ao criar linha. Tente novamente'));
  }
});

router.post('/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/linhas/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da linha é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/linhas/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da linha deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.linha.update({
      where: { id: req.params.id },
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/linhas?success=' + encodeURIComponent('Linha atualizada com sucesso!'));
  } catch (error) {
    console.error('Erro ao atualizar linha:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/linhas?error=' + encodeURIComponent('Linha não encontrada'));
    }
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/linhas/editar/' + req.params.id + '?error=' + encodeURIComponent('Já existe uma linha com este nome'));
    }
    
    res.redirect('/admin/linhas?error=' + encodeURIComponent('Erro ao atualizar linha. Tente novamente'));
  }
});

router.post('/deletar/:id', authenticateToken, requireDelete, async (req, res) => {
  try {
    await prisma.linha.delete({
      where: { id: req.params.id }
    });

    res.redirect('/admin/linhas?success=' + encodeURIComponent('Linha deletada com sucesso!'));
  } catch (error) {
    console.error('Erro ao deletar linha:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/linhas?error=' + encodeURIComponent('Linha não encontrada'));
    }
    
    // Erro de violação de chave estrangeira
    if (error.code === 'P2003') {
      return res.redirect('/admin/linhas?error=' + encodeURIComponent('Não é possível deletar esta linha pois ela está sendo utilizada em outros registros'));
    }
    
    res.redirect('/admin/linhas?error=' + encodeURIComponent('Erro ao deletar linha. Tente novamente'));
  }
});

module.exports = router;

