/**
 * Sistema de Toasts/Alertas Customizado
 * Substitui os alerts nativos do navegador
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Cria o container de toasts se não existir
        if (!document.getElementById('toast-container')) {
            // Garante que o body existe
            if (document.body) {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full';
                document.body.appendChild(this.container);
            } else {
                // Se o body ainda não existe, tenta novamente quando estiver disponível
                const checkBody = setInterval(() => {
                    if (document.body) {
                        this.container = document.createElement('div');
                        this.container.id = 'toast-container';
                        this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full';
                        document.body.appendChild(this.container);
                        clearInterval(checkBody);
                    }
                }, 10);
            }
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    /**
     * Exibe um toast
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duração em milissegundos (padrão: 5000)
     */
    show(message, type = 'info', duration = 5000) {
        // Garante que o container existe
        if (!this.container || !document.getElementById('toast-container')) {
            this.init();
        }
        
        if (!this.container) {
            console.error('ToastManager: Não foi possível criar o container de toasts');
            return null;
        }
        
        const toast = this.createToast(message, type, duration);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Anima entrada
        // IMPORTANTE: Aplicamos estilos inline além da classe CSS porque:
        // 1. Classes Tailwind podem ter problemas de especificidade
        // 2. Garante que o toast seja visível mesmo se o CSS não compilar corretamente
        // 3. Evita problemas de timing entre aplicação de classe e renderização
        setTimeout(() => {
            toast.classList.add('toast-enter');
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Remove após duração
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * Cria o elemento do toast
     */
    createToast(message, type, duration) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-start gap-3 transform transition-all duration-300 opacity-0 translate-x-full`;
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        
        // Ícones por tipo
        const icons = {
            success: `<svg class="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
            error: `<svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
            warning: `<svg class="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>`,
            info: `<svg class="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        };

        // Cores de borda por tipo
        const borderColors = {
            success: 'border-l-4 border-green-500',
            error: 'border-l-4 border-red-500',
            warning: 'border-l-4 border-yellow-500',
            info: 'border-l-4 border-blue-500'
        };

        toast.className += ` ${borderColors[type] || borderColors.info}`;
        
        toast.innerHTML = `
            ${icons[type] || icons.info}
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">${this.escapeHtml(message)}</p>
            </div>
            <button class="toast-close text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0" onclick="toastManager.remove(this.closest('.toast'))">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        return toast;
    }

    /**
     * Remove um toast
     */
    remove(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    /**
     * Remove todos os toasts
     */
    clear() {
        this.toasts.forEach(toast => this.remove(toast));
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Métodos de conveniência
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Instância global
const toastManager = new ToastManager();

// Funções globais para facilitar o uso
window.toast = {
    success: (message, duration) => toastManager.success(message, duration),
    error: (message, duration) => toastManager.error(message, duration),
    warning: (message, duration) => toastManager.warning(message, duration),
    info: (message, duration) => toastManager.info(message, duration),
    show: (message, type, duration) => toastManager.show(message, type, duration),
    clear: () => toastManager.clear()
};

// Substitui alert nativo (opcional - pode ser desabilitado se necessário)
const originalAlert = window.alert;
window.alert = function(message) {
    toastManager.info(message, 4000);
    // Mantém comportamento original se necessário para compatibilidade
    // return originalAlert(message);
};

// Flag para evitar processamento duplicado
let messagesProcessed = false;
let processingMessages = false;

// Função para processar mensagens da URL
function processUrlMessages() {
    // Evita processamento duplicado
    if (processingMessages || messagesProcessed) {
        return;
    }
    
    try {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Se não há mensagens, não precisa processar
        if (!urlParams.has('error') && !urlParams.has('success') && !urlParams.has('warning') && !urlParams.has('info') && !urlParams.has('expired')) {
            return;
        }
        
        // Marca como processando
        processingMessages = true;
        
        // Processa mensagens de erro
        if (urlParams.has('error')) {
            const errorMsg = decodeURIComponent(urlParams.get('error'));
            
            // Função para exibir o erro
            const showError = () => {
                // Garante que o container existe
                if (!toastManager.container || !document.getElementById('toast-container')) {
                    toastManager.init();
                }
                
                if (toastManager && toastManager.container) {
                    try {
                        toastManager.error(errorMsg);
                        // Remove da URL APÓS exibir com sucesso (com delay para garantir que o toast apareceu)
                        setTimeout(() => {
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, '', newUrl);
                        }, 1000);
                    } catch (err) {
                        console.error('Erro ao exibir toast:', err);
                        alert('Erro: ' + errorMsg);
                    }
                } else {
                    // Se o toastManager ainda não estiver pronto, tenta novamente
                    setTimeout(() => {
                        if (toastManager && toastManager.container) {
                            toastManager.error(errorMsg);
                            setTimeout(() => {
                                const newUrl = window.location.pathname;
                                window.history.replaceState({}, '', newUrl);
                            }, 1000);
                        } else {
                            // Última tentativa após mais tempo
                            setTimeout(() => {
                                if (toastManager) {
                                    toastManager.init();
                                    toastManager.error(errorMsg);
                                    setTimeout(() => {
                                        const newUrl = window.location.pathname;
                                        window.history.replaceState({}, '', newUrl);
                                    }, 1000);
                                } else {
                                    console.error('ToastManager não disponível após múltiplas tentativas');
                                    // Fallback: alert nativo se o toast não funcionar
                                    alert('Erro: ' + errorMsg);
                                    setTimeout(() => {
                                        const newUrl = window.location.pathname;
                                        window.history.replaceState({}, '', newUrl);
                                    }, 500);
                                }
                            }, 500);
                        }
                    }, 200);
                }
            };
            
            // Tenta exibir imediatamente
            showError();
            // Marca como processado após iniciar o processo
            messagesProcessed = true;
        }
        
        // Processa mensagens de sucesso
        if (urlParams.has('success')) {
            const successMsg = decodeURIComponent(urlParams.get('success'));
            
            const showSuccess = () => {
                if (toastManager && toastManager.container) {
                    toastManager.success(successMsg);
                    // Remove da URL APÓS exibir com sucesso
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                } else {
                    setTimeout(() => {
                        if (toastManager && toastManager.container) {
                            toastManager.success(successMsg);
                            // Remove da URL APÓS exibir com sucesso
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, '', newUrl);
                        } else {
                            setTimeout(() => {
                                if (toastManager) {
                                    toastManager.init();
                                    toastManager.success(successMsg);
                                    // Remove da URL APÓS exibir com sucesso
                                    const newUrl = window.location.pathname;
                                    window.history.replaceState({}, '', newUrl);
                                }
                            }, 500);
                        }
                    }, 200);
                }
            };
            
            showSuccess();
            // Marca como processado após iniciar o processo
            if (!messagesProcessed) messagesProcessed = true;
        }
        
        // Processa mensagens de aviso
        if (urlParams.has('warning')) {
            const warningMsg = decodeURIComponent(urlParams.get('warning'));
            
            const showWarning = () => {
                if (toastManager && toastManager.container) {
                    toastManager.warning(warningMsg);
                    // Remove da URL APÓS exibir com sucesso
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                } else {
                    setTimeout(() => {
                        if (toastManager && toastManager.container) {
                            toastManager.warning(warningMsg);
                            // Remove da URL APÓS exibir com sucesso
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, '', newUrl);
                        } else {
                            setTimeout(() => {
                                if (toastManager) {
                                    toastManager.init();
                                    toastManager.warning(warningMsg);
                                    // Remove da URL APÓS exibir com sucesso
                                    const newUrl = window.location.pathname;
                                    window.history.replaceState({}, '', newUrl);
                                }
                            }, 500);
                        }
                    }, 200);
                }
            };
            
            showWarning();
            // Marca como processado após iniciar o processo
            if (!messagesProcessed) messagesProcessed = true;
        }
        
        // Processa mensagens de info
        if (urlParams.has('info')) {
            const infoMsg = decodeURIComponent(urlParams.get('info'));
            
            const showInfo = () => {
                if (toastManager && toastManager.container) {
                    toastManager.info(infoMsg);
                    // Remove da URL APÓS exibir com sucesso
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                } else {
                    setTimeout(() => {
                        if (toastManager && toastManager.container) {
                            toastManager.info(infoMsg);
                            // Remove da URL APÓS exibir com sucesso
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, '', newUrl);
                        } else {
                            setTimeout(() => {
                                if (toastManager) {
                                    toastManager.init();
                                    toastManager.info(infoMsg);
                                    // Remove da URL APÓS exibir com sucesso
                                    const newUrl = window.location.pathname;
                                    window.history.replaceState({}, '', newUrl);
                                }
                            }, 500);
                        }
                    }, 200);
                }
            };
            
            showInfo();
            // Marca como processado após iniciar o processo
            if (!messagesProcessed) messagesProcessed = true;
        }
        
        // Processa sessão expirada
        if (urlParams.has('expired')) {
            const expiredMsg = 'Sua sessão expirou. Por favor, faça login novamente.';
            
            const showExpired = () => {
                if (toastManager && toastManager.container) {
                    toastManager.warning(expiredMsg, 6000);
                    // Remove da URL APÓS exibir com sucesso
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                } else {
                    setTimeout(() => {
                        if (toastManager && toastManager.container) {
                            toastManager.warning(expiredMsg, 6000);
                            // Remove da URL APÓS exibir com sucesso
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, '', newUrl);
                        } else {
                            setTimeout(() => {
                                if (toastManager) {
                                    toastManager.init();
                                    toastManager.warning(expiredMsg, 6000);
                                    // Remove da URL APÓS exibir com sucesso
                                    const newUrl = window.location.pathname;
                                    window.history.replaceState({}, '', newUrl);
                                }
                            }, 500);
                        }
                    }, 200);
                }
            };
            
            showExpired();
            // Marca como processado após iniciar o processo
            if (!messagesProcessed) messagesProcessed = true;
        }
        
        // Libera o flag de processamento após um pequeno delay
        setTimeout(() => {
            processingMessages = false;
        }, 100);
    } catch (error) {
        console.error('Erro ao processar mensagens da URL:', error);
        processingMessages = false;
    }
}

// Processa mensagens quando o DOM estiver pronto
// Como o script é carregado com defer, o DOM já estará pronto quando executar
// Mas precisamos garantir que o toastManager esteja totalmente inicializado
(function() {
    function initAndProcess() {
        // Garante que o container foi criado
        if (!toastManager.container || !document.getElementById('toast-container')) {
            toastManager.init();
        }
        
        // Aguarda um pouco mais para garantir que o container está no DOM
        setTimeout(() => {
            processUrlMessages();
        }, 100);
    }
    
    // Processa imediatamente se o DOM já estiver pronto
    if (document.readyState === 'loading') {
        // DOM ainda está carregando, aguarda o evento DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initAndProcess, 100);
        });
    } else {
        // DOM já está pronto, processa imediatamente
        setTimeout(initAndProcess, 100);
    }
    
    // Também processa quando a página terminar de carregar completamente
    window.addEventListener('load', function() {
        setTimeout(initAndProcess, 50);
    });
})();

