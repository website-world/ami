/* ==========================================
   TV NAVIGATION - Dzikr Al Ma'tsurat AMI
   Shared across all pages for TV remote control
   ========================================== */

class TVNavigation {
    constructor() {
        this.isTV = this.detectTV();
        this.focusableElements = [];
        this.focusHistory = [];
        
        if (this.isTV) {
            this.init();
        }
    }

    detectTV() {
        const userAgent = navigator.userAgent.toLowerCase();
        const tvKeywords = [
            'smart-tv', 'smarttv', 'tizen', 'webos', 'viera', 
            'firetv', 'android tv', 'googletv', 'roku', 'appletv'
        ];
        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('tv') === 'true') return true;
        
        if (localStorage.getItem('tvMode') === 'true') return true;
        
        const isTVResolution = (window.innerWidth >= 1280 && window.innerHeight >= 720) 
            && (window.innerWidth / window.innerHeight >= 1.5);
        
        const isTVUA = tvKeywords.some(keyword => userAgent.includes(keyword));
        
        const isTVPlatform = window.navigator.platform === 'Linux armv7l' 
            || window.navigator.platform === 'Linux aarch64';
        
        return isTVUA || isTVResolution || isTVPlatform;
    }

    init() {
        console.log('TV Navigation initialized');
        
        document.body.classList.add('tv-navigation');
        localStorage.setItem('tvMode', 'true');
        
        this.collectFocusableElements();
        this.setupTVControls();
        this.addKeyboardNavigation();
        this.optimizeForTV();
        this.setupBackButton();
        this.addTVIndicators();
    }

    collectFocusableElements() {
        this.focusableElements = Array.from(
            document.querySelectorAll(
                '[tabindex]:not([tabindex="-1"]), ' +
                'a[href]:not([tabindex="-1"]), ' +
                'button:not([disabled]), ' +
                'input:not([disabled]), ' +
                'select:not([disabled]), ' +
                '.dzikir-section, ' +
                '.card, ' +
                '.main-card, ' +
                '.submit-btn, ' +
                '.logo'
            )
        );
        
        this.focusableElements.forEach((el) => {
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
        });
    }

    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.keyCode) {
                case 19: // Up
                case 20: // Down
                case 21: // Left
                case 22: // Right
                    e.preventDefault();
                    this.handleDirectionalNavigation(e.keyCode);
                    break;
                
                case 13: // Enter
                case 23: // TV OK/Select
                    e.preventDefault();
                    if (document.activeElement && document.activeElement !== document.body) {
                        document.activeElement.click();
                    }
                    break;
                
                case 8:   // Backspace
                case 4:   // Android Back
                case 461: // Samsung Back
                case 10009: // LG Back
                case 27:  // Escape
                    e.preventDefault();
                    this.handleBackButton();
                    break;
                
                case 82:  // Menu
                case 272: // Settings
                    e.preventDefault();
                    this.openSettings();
                    break;
            }
        });
    }

    handleDirectionalNavigation(keyCode) {
        this.collectFocusableElements();
        
        if (this.focusableElements.length === 0) return;
        
        const currentElement = document.activeElement;
        let currentIndex = this.focusableElements.indexOf(currentElement);
        
        if (currentIndex === -1) {
            this.focusElement(this.focusableElements[0]);
            return;
        }

        const rect = currentElement.getBoundingClientRect();
        let bestElement = null;
        let bestScore = Infinity;

        this.focusableElements.forEach((element, index) => {
            if (index === currentIndex) return;
            
            const elementRect = element.getBoundingClientRect();
            let score = Infinity;

            switch(keyCode) {
                case 19: // Up
                    if (elementRect.bottom <= rect.top) {
                        const verticalDist = rect.top - elementRect.bottom;
                        const horizontalDist = Math.abs(
                            (rect.left + rect.width / 2) - 
                            (elementRect.left + elementRect.width / 2)
                        );
                        score = verticalDist + horizontalDist * 2;
                    }
                    break;
                    
                case 20: // Down
                    if (elementRect.top >= rect.bottom) {
                        const verticalDist = elementRect.top - rect.bottom;
                        const horizontalDist = Math.abs(
                            (rect.left + rect.width / 2) - 
                            (elementRect.left + elementRect.width / 2)
                        );
                        score = verticalDist + horizontalDist * 2;
                    }
                    break;
                    
                case 21: // Left
                    if (elementRect.right <= rect.left) {
                        const horizontalDist = rect.left - elementRect.right;
                        const verticalDist = Math.abs(
                            (rect.top + rect.height / 2) - 
                            (elementRect.top + elementRect.height / 2)
                        );
                        score = horizontalDist + verticalDist * 2;
                    }
                    break;
                    
                case 22: // Right
                    if (elementRect.left >= rect.right) {
                        const horizontalDist = elementRect.left - rect.right;
                        const verticalDist = Math.abs(
                            (rect.top + rect.height / 2) - 
                            (elementRect.top + elementRect.height / 2)
                        );
                        score = horizontalDist + verticalDist * 2;
                    }
                    break;
            }

            if (score < bestScore) {
                bestScore = score;
                bestElement = element;
            }
        });

        if (bestElement) {
            this.focusElement(bestElement);
        }
    }

    focusElement(element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        element.focus();
        
        this.focusHistory.push(element);
        if (this.focusHistory.length > 10) {
            this.focusHistory.shift();
        }
    }

    handleBackButton() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const closeEvent = new Event('tv-close-modal');
            activeModal.dispatchEvent(closeEvent);
            
            const backBtns = activeModal.querySelectorAll('.submit-btn');
            if (backBtns.length > 0) {
                const closeBtn = backBtns[backBtns.length - 1];
                if (closeBtn && !closeBtn.disabled) {
                    closeBtn.click();
                }
            }
            return;
        }
        
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.showExitConfirm();
        }
    }

    showExitConfirm() {
        const confirmExit = confirm('Keluar dari aplikasi?');
        if (confirmExit) {
            window.close();
        }
    }

    setupTVControls() {
        document.querySelectorAll('.dzikir-section, .card, .main-card').forEach(el => {
            el.setAttribute('tabindex', '0');
            el.setAttribute('role', 'button');
            el.setAttribute('aria-label', el.querySelector('h2, h3')?.textContent || 'Menu');
            
            el.addEventListener('keydown', (e) => {
                if (e.keyCode === 13 || e.keyCode === 23) {
                    e.preventDefault();
                    el.click();
                }
            });
        });
        
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('.dzikir-section, .card, .main-card, button, a, .submit-btn')) {
                e.target.classList.add('tv-focused');
                
                const parent = e.target.closest('.cards, .container');
                if (parent) {
                    e.target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target.matches('.dzikir-section, .card, .main-card, button, a, .submit-btn')) {
                e.target.classList.remove('tv-focused');
            }
        });
    }

    setupBackButton() {
        if (!document.querySelector('.tv-back-btn') && !document.querySelector('.back-btn')) {
            const backBtn = document.createElement('span');
            backBtn.className = 'material-icons tv-back-btn';
            backBtn.textContent = 'arrow_back';
            backBtn.setAttribute('tabindex', '0');
            backBtn.setAttribute('role', 'button');
            backBtn.setAttribute('aria-label', 'Kembali');
            
            backBtn.addEventListener('click', () => this.handleBackButton());
            backBtn.addEventListener('keydown', (e) => {
                if (e.keyCode === 13 || e.keyCode === 23) {
                    this.handleBackButton();
                }
            });
            
            const header = document.querySelector('header');
            if (header) {
                header.insertBefore(backBtn, header.firstChild);
            }
        }
    }

    openSettings() {
        const settingsBtn = document.getElementById('menuBtn');
        if (settingsBtn) {
            settingsBtn.click();
        } else {
            const event = new CustomEvent('tv-open-settings');
            document.dispatchEvent(event);
        }
    }

    optimizeForTV() {
        const isHD = window.innerWidth >= 1920;
        
        if (isHD) {
            document.documentElement.style.setProperty('--arabic-size', '3.2rem');
            document.documentElement.style.setProperty('--latin-size', '2.2rem');
            document.documentElement.style.setProperty('--trans-size', '1.8rem');
        }
        
        if ('wakeLock' in navigator) {
            navigator.wakeLock.request('screen').catch(() => {});
        }
    }

    addTVIndicators() {
        const navHint = document.createElement('div');
        navHint.className = 'tv-nav-hint';
        navHint.innerHTML = `
            <span>↑↓←→ Navigasi</span>
            <span>● Pilih</span>
            <span>↩ Kembali</span>
        `;
        
        document.body.appendChild(navHint);
        setTimeout(() => {
            navHint.style.transition = 'opacity 1s';
            navHint.style.opacity = '0';
            setTimeout(() => navHint.remove(), 1000);
        }, 10000);
    }

    focusModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const firstFocusable = modal.querySelector('button, input, select, [tabindex]');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 300);
            }
        }
    }

    refresh() {
        this.collectFocusableElements();
        if (this.focusableElements.length > 0 && 
            (!document.activeElement || document.activeElement === document.body)) {
            this.focusElement(this.focusableElements[0]);
        }
    }
}

// Initialize
let tvNav;

document.addEventListener('DOMContentLoaded', () => {
    tvNav = new TVNavigation();
    
    const observer = new MutationObserver(() => {
        if (tvNav) {
            tvNav.refresh();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Global reference
window.tvNav = tvNav;
