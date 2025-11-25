# 📢 Sistema de Mensagens e Alertas - Explicação

## 🎯 Visão Geral

O sistema possui **2 métodos diferentes** para exibir mensagens:

---

## 🔴 MÉTODO 1: Mensagens via Variável do Servidor (Renderização Direta)

### Quando é usado:
- **Login com credenciais erradas** (sem redirect)
- Quando você quer manter o usuário na mesma página

### Como funciona:

#### 1️⃣ Backend (src/routes/auth.js)
```javascript
// Quando há erro, renderiza a página COM a variável 'error'
if (!user) {
  return res.render('auth/login', {
    layout: 'auth',
    title: 'Login',
    error: 'Usuário não encontrado',  // ← Mensagem passada aqui
    username: username || ''
  });
}
```

#### 2️⃣ Frontend (src/views/auth/login.hbs)
```handlebars
{{#if error}}
<script>
  // Quando a página carrega, verifica se existe 'error'
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      // Chama o toast para exibir a mensagem
      if (window.toast) {
        window.toast.error('{{error}}');  // ← Exibe o erro
      }
    }, 300);
  });
</script>
{{/if}}
```

### Fluxo:
```
1. Usuário envia formulário → POST /auth/login
2. Servidor valida e encontra erro
3. Servidor renderiza a página COM variável 'error'
4. Página HTML carrega com script embutido
5. Script detecta variável 'error' e chama toast.error()
6. Toast aparece na tela
```

---

## 🟢 MÉTODO 2: Mensagens via Query String na URL (Redirect)

### Quando é usado:
- **Login com sucesso** (redirect para dashboard)
- **Logout** (redirect para login)
- **Todas as rotas CRUD** (criar, editar, deletar)
- Quando você faz redirect para outra página

### Como funciona:

#### 1️⃣ Backend (src/routes/auth.js)
```javascript
// Quando há sucesso, faz redirect COM query string
res.redirect('/dashboard?success=' + encodeURIComponent('Login realizado com sucesso!'));
//                                                      ↑
//                                    Mensagem na URL como parâmetro
```

#### 2️⃣ Frontend (src/public/js/toast.js)
```javascript
// Função que processa mensagens da URL quando a página carrega
function processUrlMessages() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Verifica se há parâmetro 'success' na URL
  if (urlParams.has('success')) {
    const successMsg = decodeURIComponent(urlParams.get('success'));
    // Remove da URL e exibe toast
    window.history.replaceState({}, '', window.location.pathname);
    toastManager.success(successMsg);  // ← Exibe o sucesso
  }
}
```

### Fluxo:
```
1. Usuário faz ação → POST /setores
2. Servidor processa com sucesso
3. Servidor faz redirect: /setores?success=Mensagem
4. Navegador carrega nova página COM query string
5. toast.js detecta parâmetro na URL
6. Remove parâmetro da URL (limpa)
7. Toast aparece na tela
```

---

## 🎨 Componentes do Sistema

### 1. ToastManager (src/public/js/toast.js)
- Classe JavaScript que gerencia os toasts
- Cria elementos HTML dinamicamente
- Controla animações e remoção automática
- Tipos: `success`, `error`, `warning`, `info`

### 2. Funções Globais
```javascript
window.toast = {
  success: (msg) => toastManager.success(msg),
  error: (msg) => toastManager.error(msg),
  warning: (msg) => toastManager.warning(msg),
  info: (msg) => toastManager.info(msg)
};
```

### 3. Processamento Automático
- O `toast.js` é carregado em TODOS os layouts
- Processa mensagens da URL automaticamente ao carregar a página
- Funciona em: `auth.hbs` e `main.hbs`

---

## 📋 Resumo dos Tipos de Mensagem

| Tipo | Cor | Quando Usar | Exemplo |
|------|-----|-------------|---------|
| `success` | Verde | Operação bem-sucedida | "Item criado com sucesso!" |
| `error` | Vermelho | Erro na operação | "Usuário não encontrado" |
| `warning` | Amarelo | Aviso importante | "Sessão expirou" |
| `info` | Azul | Informação geral | "Logout realizado" |

---

## 🔍 Exemplos Práticos

### Exemplo 1: Login com Erro (Método 1)
```javascript
// Backend
res.render('auth/login', { error: 'Senha incorreta' });

// Frontend (automático via script no HTML)
window.toast.error('Senha incorreta');
```

### Exemplo 2: Criar Setor com Sucesso (Método 2)
```javascript
// Backend
res.redirect('/setores?success=' + encodeURIComponent('Setor criado com sucesso!'));

// Frontend (automático via toast.js)
// URL: /setores?success=Setor%20criado%20com%20sucesso!
// toast.js detecta e exibe automaticamente
```

### Exemplo 3: Deletar com Erro (Método 2)
```javascript
// Backend
res.redirect('/setores?error=' + encodeURIComponent('Não é possível deletar'));

// Frontend (automático via toast.js)
// URL: /setores?error=Não%20é%20possível%20deletar
// toast.js detecta e exibe automaticamente
```

---

## ⚠️ Pontos Importantes

1. **Método 1** (variável): Usado apenas no login com erro
2. **Método 2** (URL): Usado em todas as outras rotas
3. **toast.js** processa automaticamente mensagens da URL
4. **Script inline** no login.hbs processa variável do servidor
5. Mensagens são removidas da URL após processamento (limpeza)

---

## 🛠️ Como Adicionar Nova Mensagem

### Para rotas com redirect:
```javascript
res.redirect('/rota?success=' + encodeURIComponent('Mensagem de sucesso'));
res.redirect('/rota?error=' + encodeURIComponent('Mensagem de erro'));
res.redirect('/rota?warning=' + encodeURIComponent('Mensagem de aviso'));
res.redirect('/rota?info=' + encodeURIComponent('Mensagem informativa'));
```

### Para renderização direta (como login):
```javascript
res.render('view', {
  error: 'Mensagem de erro',
  // ... outras variáveis
});
```

E no template:
```handlebars
{{#if error}}
<script>
  document.addEventListener('DOMContentLoaded', function() {
    window.toast.error('{{error}}');
  });
</script>
{{/if}}
```

