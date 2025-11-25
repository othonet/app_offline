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

    const [valvulas, total] = await Promise.all([
      prisma.valvula.findMany({
        where,
        include: {
          cabeca: {
            select: {
              id: true,
              nome: true
            }
          }
        },
        orderBy: sortParams,
        skip,
        take: limit
      }),
      prisma.valvula.count({ where })
    ]);

    const pagination = getPaginationInfo(page, limit, total);
    
    res.render('valvula/index', {
      title: 'Cadastro de Válvulas',
      valvulas,
      pagination,
      search: req.query.search || '',
      sort: Object.keys(sortParams)[0],
      order: Object.values(sortParams)[0],
      activeMenu: 'valvulas',
      baseUrl: '/admin/valvulas'
    });
  } catch (error) {
    console.error('Erro ao listar válvulas:', error);
    res.redirect('/admin/valvulas?error=' + encodeURIComponent('Erro ao carregar válvulas. Tente novamente mais tarde'));
  }
});

router.get('/novo', authenticateToken, requireCreate, async (req, res) => {
  try {
    const cabecas = await prisma.cabeca.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true
      }
    });

    if (cabecas.length === 0) {
      return res.redirect('/admin/valvulas?error=' + encodeURIComponent('É necessário cadastrar pelo menos uma cabeça antes de criar válvulas'));
    }
    
    res.render('valvula/form', {
      title: 'Nova Válvula',
      valvula: null,
      cabecas,
      activeMenu: 'valvulas'
    });
  } catch (error) {
    console.error('Erro ao carregar formulário:', error);
    res.redirect('/admin/valvulas?error=' + encodeURIComponent('Erro ao carregar formulário. Tente novamente'));
  }
});

router.get('/editar/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const valvula = await prisma.valvula.findUnique({
      where: { id: req.params.id },
      include: {
        cabeca: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    if (!valvula) {
      return res.redirect('/admin/valvulas?error=' + encodeURIComponent('Válvula não encontrada'));
    }

    const cabecas = await prisma.cabeca.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true
      }
    });

    res.render('valvula/form', {
      title: 'Editar Válvula',
      valvula,
      cabecas,
      activeMenu: 'valvulas'
    });
  } catch (error) {
    console.error('Erro ao buscar válvula:', error);
    res.redirect('/admin/valvulas?error=' + encodeURIComponent('Erro ao buscar válvula. Tente novamente'));
  }
});

router.post('/', authenticateToken, requireCreate, async (req, res) => {
  try {
    const { nome, descricao, cabecaId, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/valvulas/novo?error=' + encodeURIComponent('O nome da válvula é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/valvulas/novo?error=' + encodeURIComponent('O nome da válvula deve ter pelo menos 2 caracteres'));
    }

    if (!cabecaId || cabecaId.trim().length === 0) {
      return res.redirect('/admin/valvulas/novo?error=' + encodeURIComponent('A cabeça é obrigatória'));
    }

    // Verifica se a cabeça existe
    const cabeca = await prisma.cabeca.findUnique({
      where: { id: cabecaId }
    });

    if (!cabeca) {
      return res.redirect('/admin/valvulas/novo?error=' + encodeURIComponent('Cabeça não encontrada'));
    }
    
    await prisma.valvula.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        cabecaId: cabecaId.trim(),
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/valvulas?success=' + encodeURIComponent('Válvula criada com sucesso!'));
  } catch (error) {
    console.error('Erro ao criar válvula:', error);
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/valvulas/novo?error=' + encodeURIComponent('Já existe uma válvula com este nome'));
    }
    
    res.redirect('/admin/valvulas/novo?error=' + encodeURIComponent('Erro ao criar válvula. Tente novamente'));
  }
});

router.post('/:id', authenticateToken, requireEdit, async (req, res) => {
  try {
    const { nome, descricao, cabecaId, ativo } = req.body;
    
    // Validações
    if (!nome || nome.trim().length === 0) {
      return res.redirect('/admin/valvulas/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da válvula é obrigatório'));
    }

    if (nome.trim().length < 2) {
      return res.redirect('/admin/valvulas/editar/' + req.params.id + '?error=' + encodeURIComponent('O nome da válvula deve ter pelo menos 2 caracteres'));
    }

    if (!cabecaId || cabecaId.trim().length === 0) {
      return res.redirect('/admin/valvulas/editar/' + req.params.id + '?error=' + encodeURIComponent('A cabeça é obrigatória'));
    }

    // Verifica se a cabeça existe
    const cabeca = await prisma.cabeca.findUnique({
      where: { id: cabecaId }
    });

    if (!cabeca) {
      return res.redirect('/admin/valvulas/editar/' + req.params.id + '?error=' + encodeURIComponent('Cabeça não encontrada'));
    }
    
    await prisma.valvula.update({
      where: { id: req.params.id },
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        cabecaId: cabecaId.trim(),
        ativo: ativo === 'on' || ativo === true
      }
    });

    res.redirect('/admin/valvulas?success=' + encodeURIComponent('Válvula atualizada com sucesso!'));
  } catch (error) {
    console.error('Erro ao atualizar válvula:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/valvulas?error=' + encodeURIComponent('Válvula não encontrada'));
    }
    
    // Erro de duplicação
    if (error.code === 'P2002') {
      return res.redirect('/admin/valvulas/editar/' + req.params.id + '?error=' + encodeURIComponent('Já existe uma válvula com este nome'));
    }
    
    res.redirect('/admin/valvulas?error=' + encodeURIComponent('Erro ao atualizar válvula. Tente novamente'));
  }
});

router.post('/deletar/:id', authenticateToken, requireDelete, async (req, res) => {
  try {
    await prisma.valvula.delete({
      where: { id: req.params.id }
    });

    res.redirect('/admin/valvulas?success=' + encodeURIComponent('Válvula deletada com sucesso!'));
  } catch (error) {
    console.error('Erro ao deletar válvula:', error);
    
    // Erro de registro não encontrado
    if (error.code === 'P2025') {
      return res.redirect('/admin/valvulas?error=' + encodeURIComponent('Válvula não encontrada'));
    }
    
    // Erro de violação de chave estrangeira
    if (error.code === 'P2003') {
      return res.redirect('/admin/valvulas?error=' + encodeURIComponent('Não é possível deletar esta válvula pois ela está sendo utilizada em outros registros'));
    }
    
    res.redirect('/admin/valvulas?error=' + encodeURIComponent('Erro ao deletar válvula. Tente novamente'));
  }
});

module.exports = router;

