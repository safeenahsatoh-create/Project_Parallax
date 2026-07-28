// Shared chapter navbar. Usage: <div id="navbar-root" data-era="0"></div> + <script src="js/navbar.js"></script>
(function () {
    const root = document.getElementById('navbar-root');
    if (!root) return;

    const era = root.dataset.era || '0';

    root.innerHTML = `
        <nav class="navbar">
            <div class="nav-left">
                <a href="index.html" class="logo" id="nav-logo">CHRONOS</a>
            </div>
            <div class="nav-right">
                <ul class="nav-links">
                    <li><a href="index.html?era=${era}" id="nav-back">Back to Eras</a></li>
                </ul>
                <!-- Language Switcher -->
                <button id="lang-toggle" class="control-btn" aria-label="Toggle Language">
                    <span id="lang-text">TH</span>
                </button>
            </div>
        </nav>
    `;

    const langTextSpan = document.getElementById('lang-text');
    let currentLang = localStorage.getItem('lang') || 'th';
    langTextSpan.textContent = currentLang === 'th' ? 'EN' : 'TH';

    // Same flash-of-light effect as the Chapter 1 prototype, shared by every navbar control.
    function flash(onFlashed) {
        const lightImg = document.createElement('img');
        lightImg.src = 'assets/img/hero/Light.png';
        lightImg.style.position = 'fixed';
        lightImg.style.top = '25%';
        lightImg.style.right = '27%';
        lightImg.style.width = '300px';
        lightImg.style.height = '300px';
        lightImg.style.objectFit = 'contain';
        lightImg.style.mixBlendMode = 'screen';
        lightImg.style.transform = 'translate(50%, -50%) scale(40)';
        lightImg.style.opacity = '0';
        lightImg.style.zIndex = '9999';
        lightImg.style.transition = 'opacity 0.3s ease';
        lightImg.style.pointerEvents = 'none';
        document.body.appendChild(lightImg);

        void lightImg.offsetWidth;
        lightImg.style.opacity = '1';

        if (onFlashed) {
            setTimeout(onFlashed, 350);
        } else {
            setTimeout(() => {
                lightImg.style.opacity = '0';
                setTimeout(() => lightImg.remove(), 300);
            }, 350);
        }
    }

    document.getElementById('nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        flash(() => window.location.href = 'index.html?return=true');
    });

    document.getElementById('nav-back').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `index.html?era=${era}`;
    });

    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'th' ? 'en' : 'th';
        localStorage.setItem('lang', currentLang);
        langTextSpan.textContent = currentLang === 'th' ? 'EN' : 'TH';
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
    });
})();