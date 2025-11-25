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

    const [tipos, total] = await Promise.all([
      prisma.tipoCaixa.findMany({
        where,
        orderBy: sortParams,
        skip,
        take: limit
      }),
      prisma.tipoCaixa.count({ where })
    ]);

    const pagination = getPaginationInfo(page, limit, total);
    
    res.render('tipoCaixa/index', {
      title: 'Cadastro de Tipos de Caixas',
      tipos,
      pagination,
      search: req.query.search || '',
      sort: Object.keys(sortParams)[0],
      order: Object.values(sortParams)[0],
      activeMenu: 'tipos-caixa',
      baseUrl: '/admin/tipos-caixa'
    });
  } catch (error) {
    console.error('Erro ao listar tipos:', error);
    res.redirect('/admin/tipos-caixa?error=' + encodeURIComponent('Erro ao carregar tipos de caixas. Tente novamente mais tarde'));
  }
});

router.get('/novo', authenticateToken, requireCreate, (req, res) => {
  res.render('tipoCaixa/form', {
    title: 'Novo Tipo de Caixa',
    tipo: null,
    activeMenu: 'tipos-caixa'
  });
});

router.get('/editar/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const tipo = await prisma.tipoCaixa.findUnique({
      where: { id: req.params.id }
    });

    if (!tipo) {
      return res.redirect('/admin/tipos-caixa?error=' + encodeURIComponent('Tipo de caixa não encontrado'));
    }

    res.render('tipoCaixa/form', {
      title: 'Editar Tipo de Caixa',
      tipo,
      activeMenu: 'tipos-caixa'
    });
  } catch (error) {
    console.error('Erro ao buscar tipo:', error);
    res.redirect('/admin/tipos-caixa?error=' + encodeURIComponent('Erro ao buscar tipo de caixa. Tente novamente'));
  }
});

router.post('/', authenticateToken, requireCreate, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/tipos-caixa/novo?error=' + encodeURIComponent('O nome do tipo de caixa é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/tipos-caixa/novo?error=' + encodeURIComponent('O nome do tipo de caixa deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.tipoCaixa.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/tipos-caixa?success=' + encodeURIComponent('Tipo de caixa criado com sucesso!'));
  } catch (error) {
    console.error('Erro ao criar tipo:', error);
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/tipos-caixa/novo?error=' + encodeURIComponent('Já existe um tipo de caixa com este nome'));
    }
    
    res.redirect('/admin/tipos-caixa/novo?error=' + encodeURIComponent('Erro ao criar tipo de caixa. Tente novamente'));
  }
});

router.post('/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/tipos-caixa/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome do tipo de caixa é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/tipos-caixa/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome do tipo de caixa deve ter pelo menos 2 caracteres'));
    }
    
    await prisma.tipoCaixa.update({
      where: { id: req.params.id },
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/tipos-caixa?success=' + encodeURIComponent('Tipo de caixa atualizado com sucesso!'));
  } catch (error) {
    console.error('Erro ao atualizar tipo:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/tipos-caixa?error=' + encodeURIComponent('Tipo de caixa não encontrado'));
    }
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/tipos-caixa/editar/' + req.params.id + '?error=' + encodeURIComponent('Já existe um tipo de caixa com este nome'));
    }
    
    res.redirect('/admin/tipos-caixa?error=' + encodeURIComponent('Erro ao atualizar tipo de caixa. Tente novamente'));
  }
});

router.post('/deletar/:id', authenticateToken, requireDelete, async (req, res) => {
  try {
    await prisma.tipoCaixa.delete({
      where: { id: req.params.id }
    });

    res.redirect('/admin/tipos-caixa?success=' + encodeURIComponent('Tipo de caixa deletado com sucesso!'));
  } catch (error) {
    console.error('Erro ao deletar tipo:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/tipos-caixa?error=' + encodeURIComponent('Tipo de caixa não encontrado'));
    }
    
    // Erro de violação de chave estrangeira
    if (error.code === 'P2003') {
      return res.redirect('/admin/tipos-caixa?error=' + encodeURIComponent('Não é possível deletar este tipo de caixa pois ele está sendo utilizado em outros registros'));
    }
    
    res.redirect('/admin/tipos-caixa?error=' + encodeURIComponent('Erro ao deletar tipo de caixa. Tente novamente'));
  }
});

module.exports = router;

