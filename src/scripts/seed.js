const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin padrão
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      role: 'ADMIN' // Garante que o admin sempre tenha role ADMIN
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Administrador',
      email: 'admin@sistema.com',
      role: 'ADMIN',
      active: true
    }
  });

  console.log('✅ Usuário admin criado:', admin.username);
  console.log('   Usuário: admin');
  console.log('   Senha: admin123');
  console.log('   ⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
  
  console.log('\n✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

