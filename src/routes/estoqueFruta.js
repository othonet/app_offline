const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { getPaginationParams, getSearchParams, getSortParams, getPaginationInfo, buildSearchConditions } = require('../utils/pagination');

const prisma = new PrismaClient();

// Listar estoque
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req, 10);
    const searchParams = getSearchParams(req, ['variedade']);
    const sortParams = getSortParams(req, { variedade: 'asc' }, ['variedade', 'quantidadeContentores', 'updatedAt']);
    
    // Para busca com relacionamentos, precisamos fazer diferente
    let where = {};
    if (searchParams && searchParams.search) {
      where = {
        variedade: {
          contains: searchParams.search
        }
      };
    }

    const [estoques, total] = await Promise.all([
      prisma.estoqueFruta.findMany({
        where,
        include: {
          cabeca: {
            select: {
              id: true,
              nome: true
            }
          },
          valvula: {
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
      prisma.estoqueFruta.count({ where })
    ]);

    // Calcular totais (de todos os registros, não apenas da página)
    const [allEstoques] = await Promise.all([
      prisma.estoqueFruta.findMany({
        select: {
          quantidadeContentores: true,
          variedade: true
        }
      })
    ]);

    const totalContentores = allEstoques.reduce((sum, estoque) => sum + estoque.quantidadeContentores, 0);
    const totalVariedades = new Set(allEstoques.map(e => e.variedade)).size;

    const pagination = getPaginationInfo(page, limit, total);

    res.render('estoqueFruta/index', {
      title: 'Estoque de Fruta',
      estoques,
      pagination,
      search: req.query.search || '',
      sort: Object.keys(sortParams)[0],
      order: Object.values(sortParams)[0],
      totalContentores,
      totalVariedades,
      activeMenu: 'estoque-fruta',
      baseUrl: '/estoque-fruta'
    });
  } catch (error) {
    console.error('Erro ao listar estoque:', error);
    console.error('Stack trace:', error.stack);
    
    // Verifica se é erro de modelo não encontrado
    const errorMessage = error.message || '';
    if (errorMessage.includes('estoqueFruta') || errorMessage.includes('does not exist') || errorMessage.includes('Unknown model')) {
      console.error('⚠️  Modelo estoqueFruta não encontrado no Prisma Client.');
      console.error('📝 Solução: Pare o servidor e execute: npm run prisma:generate');
      return res.redirect('/dashboard?error=' + encodeURIComponent('Erro: Prisma Client precisa ser regenerado. Pare o servidor e execute: npm run prisma:generate'));
    }
    
    res.redirect('/dashboard?error=' + encodeURIComponent('Erro ao carregar estoque: ' + (error.message || 'Erro desconhecido')));
  }
});

module.exports = router;

