const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Gera token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Cria sessão no banco de dados
const createSession = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
  
  return await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });
};

// Remove sessão do banco
const deleteSession = async (token) => {
  return await prisma.session.deleteMany({
    where: { token }
  });
};

// Limpa sessões expiradas
const cleanExpiredSessions = async () => {
  return await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
};

module.exports = {
  generateToken,
  createSession,
  deleteSession,
  cleanExpiredSessions
};

