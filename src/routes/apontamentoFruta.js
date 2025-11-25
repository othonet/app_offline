const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Página de apontamento de fruta
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cabecas = await prisma.cabeca.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true
      }
    });

    res.render('apontamentoFruta/form', {
      title: 'Apontamento de Recepção da Fruta',
      cabecas,
      activeMenu: 'apontamento-fruta'
    });
  } catch (error) {
    console.error('Erro ao carregar formulário de apontamento:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent('Erro ao carregar formulário. Tente novamente'));
  }
});

// Endpoint para buscar válvulas por cabeça (AJAX)
router.get('/valvulas/:cabecaId', authenticateToken, async (req, res) => {
  try {
    const { cabecaId } = req.params;

    const valvulas = await prisma.valvula.findMany({
      where: {
        cabecaId: cabecaId,
        ativo: true
      },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true
      }
    });

    res.json(valvulas);
  } catch (error) {
    console.error('Erro ao buscar válvulas:', error);
    res.status(500).json({ error: 'Erro ao buscar válvulas' });
  }
});

// Processar apontamento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { numeroCarroca, cabecaId, valvulaId, variedade, numeroContentores } = req.body;

    // Validações
    if (!numeroCarroca || numeroCarroca.trim().length === 0) {
      return res.redirect('/apontamento-fruta?error=' + encodeURIComponent('O número da carroça é obrigatório'));
    }

    if (!cabecaId || cabecaId.trim().length === 0) {
      return res.redirect('/apontamento-fruta?error=' + encodeURIComponent('A cabeça é obrigatória'));
    }

    if (!valvulaId || valvulaId.trim().length === 0) {
      return res.redirect('/apontamento-fruta?error=' + encodeURIComponent('A válvula é obrigatória'));
    }

    if (!variedade || variedade.trim().length === 0) {
      return res.redirect('/apontamento-fruta?error=' + encodeURIComponent('A variedade da fruta é obrigatória'));
    }

    if (!numeroContentores || isNaN(numeroContentores) || parseInt(numeroContentores) <= 0) {
      return res.redirect('/apontamento-fruta?error=' + encodeURIComponent('O número de contentores deve ser um número positivo'));
    }

    // Verifica se a cabeça existe
    const cabeca = await prisma.cabeca.findUnique({
      where: { id: cabecaId }
    });

    if (!cabeca) {
      return res.redirect('/apontamento-fruta?error=' + encodeURIComponent('Cabeça não encontrada'));
    }

    // Verifica se a válvula existe e pertence à cabeça
    const valvula = await prisma.valvula.findUnique({
      where: { id: valvulaId }
    });

    if (!valvula) {
      return res.redirect('/apontamento-fruta?error=' + encodeURIComponent('Válvula não encontrada'));
    }

    if (valvula.cabecaId !== cabecaId) {
      return res.redirect('/apontamento-fruta?error=' + encodeURIComponent('A válvula selecionada não pertence à cabeça escolhida'));
    }

    // Cria o apontamento com timestamp explícito para garantir exclusividade
    const agora = new Date();
    await prisma.apontamentoFruta.create({
      data: {
        numeroCarroca: numeroCarroca.trim(),
        cabecaId: cabecaId.trim(),
        valvulaId: valvulaId.trim(),
        variedade: variedade.trim(),
        numeroContentores: parseInt(numeroContentores),
        userId: req.user.id,
        createdAt: agora // Timestamp explícito com data e hora
      }
    });

    // Atualiza ou cria o estoque
    const quantidadeContentores = parseInt(numeroContentores);
    await prisma.estoqueFruta.upsert({
      where: {
        cabecaId_valvulaId_variedade: {
          cabecaId: cabecaId.trim(),
          valvulaId: valvulaId.trim(),
          variedade: variedade.trim()
        }
      },
      update: {
        quantidadeContentores: {
          increment: quantidadeContentores
        }
      },
      create: {
        cabecaId: cabecaId.trim(),
        valvulaId: valvulaId.trim(),
        variedade: variedade.trim(),
        quantidadeContentores: quantidadeContentores
      }
    });

    res.redirect('/apontamento-fruta?success=' + encodeURIComponent('Apontamento registrado com sucesso! Estoque atualizado.'));
  } catch (error) {
    console.error('Erro ao criar apontamento:', error);
    
    // Erro de violação de chave estrangeira
    if (error.code === 'P2003') {
      return res.redirect('/apontamento-fruta?error=' + encodeURIComponent('Erro ao validar dados. Verifique se a cabeça e válvula estão corretas'));
    }
    
    res.redirect('/apontamento-fruta?error=' + encodeURIComponent('Erro ao registrar apontamento. Tente novamente'));
  }
});

module.exports = router;

