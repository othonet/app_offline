const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Buscando usuários ativos...\n');

    // Busca todos os usuários ativos
    const users = await prisma.user.findMany({
      where: { active: true },
      orderBy: { username: 'asc' }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário ativo encontrado no banco de dados.');
      process.exit(1);
    }

    console.log(`📋 Encontrados ${users.length} usuário(s) ativo(s):\n`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.name}) - Role atual: ${user.role}`);
    });

    // Atualiza todos os usuários ativos para ADMIN
    const updateResult = await prisma.user.updateMany({
      where: { active: true },
      data: { role: 'ADMIN' }
    });

    console.log(`\n✅ ${updateResult.count} usuário(s) atualizado(s) para ADMIN com sucesso!`);
    console.log('\n⚠️  IMPORTANTE: Faça logout e login novamente para que as mudanças tenham efeito!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuários:', error.message);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

