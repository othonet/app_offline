/**
 * Sistema de Confirmação Moderno
 * Substitui o confirm() nativo do navegador
 */

class ConfirmManager {
    constructor() {
        this.modal = null;
        this.resolveCallback = null;
        this.init();
    }

    init() {
        // Cria o modal se não existir
        if (!document.getElementById('confirm-modal')) {
            this.modal = document.createElement('div');
            this.modal.id = 'confirm-modal';
            this.modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden';
            this.modal.innerHTML = `
                <div class="confirm-modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            <div class="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                            </div>
                            <h3 class="ml-3 text-lg font-medium text-gray-900 dark:text-gray-100">Confirmar ação</h3>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6" id="confirm-message">Tem certeza que deseja realizar esta ação?</p>
                        <div class="flex justify-end space-x-3">
                            <button type="button" class="btn-secondary confirm-cancel">Cancelar</button>
                            <button type="button" class="btn-danger confirm-ok">Confirmar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(this.modal);

            // Event listeners
            const cancelBtn = this.modal.querySelector('.confirm-cancel');
            const okBtn = this.modal.querySelector('.confirm-ok');
            const overlay = this.modal;

            cancelBtn.addEventListener('click', () => this.hide(false));
            okBtn.addEventListener('click', () => this.hide(true));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hide(false);
                }
            });

            // Fechar com ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                    this.hide(false);
                }
            });
        } else {
            this.modal = document.getElementById('confirm-modal');
        }
    }

    /**
     * Exibe o modal de confirmação
     * @param {string} message - Mensagem a ser exibida
     * @returns {Promise<boolean>} - Promise que resolve com true se confirmado, false se cancelado
     */
    show(message = 'Tem certeza que deseja realizar esta ação?') {
        return new Promise((resolve) => {
            this.resolveCallback = resolve;
            const messageEl = this.modal.querySelector('#confirm-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
            
            this.modal.classList.remove('hidden');
            // Anima entrada
            setTimeout(() => {
                const content = this.modal.querySelector('.confirm-modal-content');
                if (content) {
                    content.classList.add('confirm-enter');
                }
            }, 10);
        });
    }

    /**
     * Esconde o modal
     * @param {boolean} confirmed - Se foi confirmado ou cancelado
     */
    hide(confirmed) {
        const content = this.modal.querySelector('.confirm-modal-content');
        if (content) {
            content.classList.remove('confirm-enter');
            content.classList.add('confirm-exit');
        }

        setTimeout(() => {
            this.modal.classList.add('hidden');
            if (content) {
                content.classList.remove('confirm-exit');
            }
            if (this.resolveCallback) {
                this.resolveCallback(confirmed);
                this.resolveCallback = null;
            }
        }, 200);
    }
}

// Instância global
const confirmManager = new ConfirmManager();

// Substitui confirm() nativo
window.confirm = function(message) {
    return confirmManager.show(message);
};

// Função helper para uso em formulários
window.confirmDelete = function(form, message = 'Tem certeza que deseja deletar este item?') {
    // Previne o submit padrão
    if (window.event) {
        window.event.preventDefault();
    }
    
    confirmManager.show(message).then((confirmed) => {
        if (confirmed) {
            form.submit();
        }
    });
    
    return false;
};

