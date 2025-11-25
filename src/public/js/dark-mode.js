/**
 * Sistema de Dark Mode
 * Gerencia a alternância entre modo claro e escuro
 */

class DarkModeManager {
    constructor() {
        this.storageKey = 'darkMode';
        this.init();
    }

    init() {
        // Verifica preferência salva ou do sistema
        const savedPreference = localStorage.getItem(this.storageKey);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Se não há preferência salva, usa a do sistema
        const shouldBeDark = savedPreference !== null 
            ? savedPreference === 'true' 
            : prefersDark;

        if (shouldBeDark) {
            this.enable();
        } else {
            this.disable();
        }

        // Observa mudanças na preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Só aplica se não houver preferência salva
            if (localStorage.getItem(this.storageKey) === null) {
                if (e.matches) {
                    this.enable();
                } else {
                    this.disable();
                }
            }
        });
    }

    enable() {
        document.documentElement.classList.add('dark');
        localStorage.setItem(this.storageKey, 'true');
        this.updateToggleButton(true);
    }

    disable() {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(this.storageKey, 'false');
        this.updateToggleButton(false);
    }

    toggle() {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            this.disable();
        } else {
            this.enable();
        }
    }

    isDark() {
        return document.documentElement.classList.contains('dark');
    }

    updateToggleButton(isDark) {
        const toggleButtons = document.querySelectorAll('[data-dark-mode-toggle]');
        toggleButtons.forEach(button => {
            const sunIcon = button.querySelector('[data-sun-icon]');
            const moonIcon = button.querySelector('[data-moon-icon]');
            
            if (isDark) {
                sunIcon?.classList.remove('hidden');
                moonIcon?.classList.add('hidden');
            } else {
                sunIcon?.classList.add('hidden');
                moonIcon?.classList.remove('hidden');
            }
        });
    }
}

// Instância global
const darkModeManager = new DarkModeManager();

// Função global para toggle
window.toggleDarkMode = () => {
    darkModeManager.toggle();
};

// Atualiza botões quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    darkModeManager.updateToggleButton(darkModeManager.isDark());
});

