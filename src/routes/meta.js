const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin, requireCreate, requireEdit, requireDelete } = require('../middleware/auth');
const { getPaginationParams, getSearchParams, getSortParams, getPaginationInfo, buildSearchConditions } = require('../utils/pagination');

const prisma = new PrismaClient();

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req, 10);
    const searchParams = getSearchParams(req, ['nome', 'descricao', 'unidade']);
    const sortParams = getSortParams(req, { nome: 'asc' }, ['nome', 'descricao', 'valor', 'unidade', 'ativo', 'createdAt']);
    
    const where = {
      ...buildSearchConditions(searchParams)
    };

    const [metas, total] = await Promise.all([
      prisma.meta.findMany({
        where,
        orderBy: sortParams,
        skip,
        take: limit
      }),
      prisma.meta.count({ where })
    ]);

    const pagination = getPaginationInfo(page, limit, total);
    
    res.render('meta/index', {
      title: 'Cadastro de Metas',
      metas,
      pagination,
      search: req.query.search || '',
      sort: Object.keys(sortParams)[0],
      order: Object.values(sortParams)[0],
      activeMenu: 'metas',
      baseUrl: '/admin/metas'
    });
  } catch (error) {
    console.error('Erro ao listar metas:', error);
    res.redirect('/admin/metas?error=' + encodeURIComponent('Erro ao carregar metas. Tente novamente mais tarde'));
  }
});

router.get('/novo', authenticateToken, requireCreate, (req, res) => {
  res.render('meta/form', {
    title: 'Nova Meta',
    meta: null,
    activeMenu: 'metas'
  });
});

router.get('/editar/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const meta = await prisma.meta.findUnique({
      where: { id: req.params.id }
    });

    if (!meta) {
      return res.redirect('/admin/metas?error=' + encodeURIComponent('Meta não encontrada'));
    }

    res.render('meta/form', {
      title: 'Editar Meta',
      meta,
      activeMenu: 'metas'
    });
  } catch (error) {
    console.error('Erro ao buscar meta:', error);
    res.redirect('/admin/metas?error=' + encodeURIComponent('Erro ao buscar meta. Tente novamente'));
  }
});

router.post('/', authenticateToken, requireCreate, async (req, res) => {
  try {
    const { nome, descricao, valor, unidade, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/metas/novo?error=' + encodeURIComponent('O nome da meta é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/metas/novo?error=' + encodeURIComponent('O nome da meta deve ter pelo menos 2 caracteres'));
    }

    // Validação de valor numérico se fornecido
    if (valor && valor.trim().length > 0) {
      const valorNum = parseFloat(valor);
      if (isNaN(valorNum) || valorNum < 0) {
        return res.redirect('/admin/metas/novo?error=' + encodeURIComponent('O valor deve ser um número positivo'));
      }
    }
    
    await prisma.meta.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        valor: valor && valor.trim().length > 0 ? parseFloat(valor) : null,
        unidade: unidade ? unidade.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/metas?success=' + encodeURIComponent('Meta criada com sucesso!'));
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/metas/novo?error=' + encodeURIComponent('Já existe uma meta com este nome'));
    }
    
    res.redirect('/admin/metas/novo?error=' + encodeURIComponent('Erro ao criar meta. Tente novamente'));
  }
});

router.post('/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const { nome, descricao, valor, unidade, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/metas/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da meta é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/metas/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da meta deve ter pelo menos 2 caracteres'));
    }

    // Validação de valor numérico se fornecido
    if (valor && valor.trim().length > 0) {
      const valorNum = parseFloat(valor);
      if (isNaN(valorNum) || valorNum < 0) {
        return res.redirect('/admin/metas/editar/' + req.params.id + '?error=' + encodeURIComponent('O valor deve ser um número positivo'));
      }
    }
    
    await prisma.meta.update({
      where: { id: req.params.id },
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        valor: valor && valor.trim().length > 0 ? parseFloat(valor) : null,
        unidade: unidade ? unidade.trim() : null,
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/metas?success=' + encodeURIComponent('Meta atualizada com sucesso!'));
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/metas?error=' + encodeURIComponent('Meta não encontrada'));
    }
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/metas/editar/' + req.params.id + '?error=' + encodeURIComponent('Já existe uma meta com este nome'));
    }
    
    res.redirect('/admin/metas?error=' + encodeURIComponent('Erro ao atualizar meta. Tente novamente'));
  }
});

router.post('/deletar/:id', authenticateToken, requireDelete, async (req, res) => {
  try {
    await prisma.meta.delete({
      where: { id: req.params.id }
    });

    res.redirect('/admin/metas?success=' + encodeURIComponent('Meta deletada com sucesso!'));
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/metas?error=' + encodeURIComponent('Meta não encontrada'));
    }
    
    // Erro de violação de chave estrangeira
    if (error.code === 'P2003') {
      return res.redirect('/admin/metas?error=' + encodeURIComponent('Não é possível deletar esta meta pois ela está sendo utilizada em outros registros'));
    }
    
    res.redirect('/admin/metas?error=' + encodeURIComponent('Erro ao deletar meta. Tente novamente'));
  }
});

module.exports = router;

