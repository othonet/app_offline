# 🔍 Checklist de Debug - Processo Sistemático

## 📋 Ordem de Verificação para Problemas Visuais/Funcionais

### 1️⃣ **VERIFICAR O PROBLEMA REAL PRIMEIRO**
- [ ] O elemento está sendo criado no DOM? (Inspecionar elemento)
- [ ] O JavaScript está executando? (Console logs)
- [ ] Os estilos CSS estão sendo aplicados? (DevTools > Elements > Styles)
- [ ] Há erros no console? (Console > Errors)

### 2️⃣ **PARA PROBLEMAS VISUAIS (elementos não aparecem)**
- [ ] Verificar se o elemento existe no DOM (document.getElementById)
- [ ] Verificar se o CSS está sendo carregado (Network tab)
- [ ] Verificar especificidade CSS (qual regra está vencendo?)
- [ ] Verificar se há `!important` conflitando
- [ ] Verificar se classes do Tailwind estão sendo compiladas
- [ ] Verificar z-index (elemento pode estar atrás de outro)
- [ ] Verificar position (fixed/absolute pode estar fora da viewport)
- [ ] Verificar opacity/visibility/display

### 3️⃣ **PARA PROBLEMAS DE FUNCIONALIDADE**
- [ ] Verificar se a função está sendo chamada
- [ ] Verificar se os parâmetros estão corretos
- [ ] Verificar se há erros silenciosos (try/catch)
- [ ] Verificar ordem de execução (timing issues)
- [ ] Verificar se dependências estão carregadas

### 4️⃣ **VERIFICAÇÕES ESPECÍFICAS PARA TOASTS/ALERTAS**
- [ ] Container existe no DOM?
- [ ] Toast está sendo criado?
- [ ] Classes CSS estão sendo aplicadas?
- [ ] Animações CSS estão funcionando?
- [ ] z-index está correto?
- [ ] Position está correto (fixed/absolute)?

## 🎯 Regra de Ouro

**SEMPRE verificar CSS primeiro quando:**
- Elemento existe no DOM mas não aparece
- Elemento aparece mas não está visível
- Animações não funcionam
- Estilos não estão sendo aplicados

**SEMPRE verificar JavaScript primeiro quando:**
- Função não está sendo chamada
- Dados não estão sendo processados
- Eventos não estão disparando

## 📝 Template de Debug

Quando encontrar um problema:

1. **Descreva o problema**: O que deveria acontecer vs o que está acontecendo
2. **Verifique o básico**: DOM, Console, Network
3. **Isole o problema**: Teste em ambiente limpo
4. **Verifique CSS**: Se for visual, CSS primeiro!
5. **Verifique JS**: Se for funcional, JS primeiro!
6. **Teste a solução**: Antes de implementar, confirme a causa raiz

## ⚠️ Erros Comuns a Evitar

1. ❌ Assumir que o problema é JavaScript quando é CSS
2. ❌ Não verificar se o CSS está sendo compilado (Tailwind)
3. ❌ Não verificar especificidade CSS
4. ❌ Não inspecionar o elemento no DevTools
5. ❌ Não verificar ordem de carregamento de scripts
6. ❌ Não verificar se classes estão sendo aplicadas

## ✅ Boas Práticas

1. ✅ Sempre inspecionar elemento no DevTools primeiro
2. ✅ Verificar CSS antes de assumir problema em JS
3. ✅ Usar console.log estratégicos (não em excesso)
4. ✅ Testar em ambiente limpo (modo anônimo)
5. ✅ Verificar Network tab para recursos não carregados
6. ✅ Verificar se Tailwind recompilou após mudanças

