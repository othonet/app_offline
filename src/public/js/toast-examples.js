/**
 * Exemplos de uso do Sistema de Toasts
 * 
 * Este arquivo contém exemplos de como usar o sistema de toasts.
 * Você pode usar este arquivo como referência ou removê-lo em produção.
 */

// Exemplos básicos
document.addEventListener('DOMContentLoaded', function() {
    // Descomente as linhas abaixo para testar os toasts
    
    // Toast de sucesso
    // toast.success('Operação realizada com sucesso!');
    
    // Toast de erro
    // toast.error('Ocorreu um erro ao processar a solicitação.');
    
    // Toast de aviso
    // toast.warning('Atenção: Esta ação pode ter consequências.');
    
    // Toast de informação
    // toast.info('Informação importante para o usuário.');
    
    // Toast customizado com duração
    // toast.show('Mensagem customizada', 'info', 10000); // 10 segundos
    
    // Exemplo: Usar após uma ação assíncrona
    /*
    fetch('/api/endpoint')
        .then(response => response.json())
        .then(data => {
            toast.success('Dados carregados com sucesso!');
        })
        .catch(error => {
            toast.error('Erro ao carregar dados: ' + error.message);
        });
    */
    
    // Exemplo: Usar em um formulário
    /*
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        // ... processar formulário ...
        toast.success('Formulário enviado com sucesso!');
    });
    */
});

/**
 * Como usar em rotas do servidor:
 * 
 * // Erro
 * res.redirect('/rota?error=Mensagem de erro');
 * 
 * // Sucesso
 * res.redirect('/rota?success=Mensagem de sucesso');
 * 
 * // Aviso
 * res.redirect('/rota?warning=Mensagem de aviso');
 * 
 * // Informação
 * res.redirect('/rota?info=Mensagem informativa');
 */

