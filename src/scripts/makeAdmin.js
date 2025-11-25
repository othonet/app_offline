const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];

  if (!username) {
    console.log('❌ Erro: Username não fornecido');
    console.log('\n📝 Uso: node src/scripts/makeAdmin.js <username>');
    console.log('\n💡 Exemplo: node src/scripts/makeAdmin.js admin');
    
    // Lista todos os usuários disponíveis
    console.log('\n👥 Usuários disponíveis:');
    const users = await prisma.user.findMany({
      select: {
        username: true,
        name: true,
        role: true,
        active: true
      },
      orderBy: { username: 'asc' }
    });
    
    if (users.length === 0) {
      console.log('   Nenhum usuário encontrado no banco de dados.');
    } else {
      users.forEach(user => {
        const status = user.active ? '✅' : '❌';
        console.log(`   ${status} ${user.username} (${user.name}) - Role: ${user.role}`);
      });
    }
    
    process.exit(1);
  }

  try {
    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (!user) {
      console.log(`❌ Usuário "${username}" não encontrado no banco de dados.`);
      process.exit(1);
    }

    // Atualiza o role para ADMIN
    const updatedUser = await prisma.user.update({
      where: { username: username.trim() },
      data: { role: 'ADMIN' }
    });

    console.log('✅ Usuário atualizado com sucesso!');
    console.log(`\n📋 Detalhes:`);
    console.log(`   Username: ${updatedUser.username}`);
    console.log(`   Nome: ${updatedUser.name}`);
    console.log(`   Role: ${updatedUser.role} (atualizado)`);
    console.log(`   Email: ${updatedUser.email || 'Não informado'}`);
    console.log(`   Status: ${updatedUser.active ? 'Ativo' : 'Inativo'}`);
    console.log('\n⚠️  IMPORTANTE: Faça logout e login novamente para que as mudanças tenham efeito!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error.message);
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

