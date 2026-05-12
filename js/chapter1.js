document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const layerSun = document.getElementById('layer-sun');
    const layerCloudsBg = document.getElementById('layer-clouds-bg');
    const layerCloudsFg = document.getElementById('layer-clouds-fg');
    const layerCaveMid = document.getElementById('layer-cave-mid');
    const layerCaveFront = document.getElementById('layer-cave-front');
    const layerDeer = document.getElementById('layer-deer');
    const layerBird = document.getElementById('layer-bird');

    const blackOverlay = document.getElementById('black-overlay');

    const prologueTexts = [
        document.getElementById('prologue-1'),
        document.getElementById('prologue-2'),
        document.getElementById('prologue-3'),
        document.getElementById('prologue-4')
    ];

    const savannaTextContainer = document.getElementById('savanna-text-container');
    const savannaText = document.getElementById('savanna-text');

    const langToggleBtn = document.getElementById('lang-toggle');
    const langTextSpan = document.getElementById('lang-text');

    // State
    let currentLang = localStorage.getItem('lang') || 'th';
    let chapterData = null;
    let ticking = false;

    // Initialize
    initApp();

    async function initApp() {
        try {
            const response = await fetch('assets/data/chapter1.json');
            if (!response.ok) throw new Error("Failed to fetch chapter1.json");
            chapterData = await response.json();

            applyLang(currentLang);

            // Lock scrolling initially
            document.body.style.overflow = 'hidden';

            // Set up scroll listener
            window.addEventListener('scroll', onScroll, { passive: true });

            // Start Prologue auto-play sequence
            playPrologueSequence();

        } catch (error) {
            console.error('Error loading chapter data:', error);
        }

        // Language toggle listener
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'th' ? 'en' : 'th';
            localStorage.setItem('lang', currentLang);
            applyLang(currentLang);
        });

        // Click to reveal translated shadows
        const shadowHabilis = document.getElementById('layer-shadow-habilis');
        const shadowErectus = document.getElementById('layer-shadow-erectus');
        const popupHabilis = document.getElementById('popup-habilis');
        const popupErectus = document.getElementById('popup-erectus');

        if (shadowHabilis) {
            shadowHabilis.addEventListener('click', () => {
                const progress = window.scrollY / (3 * window.innerHeight);
                if (progress < 1.8) return;
                if (shadowHabilis.src.includes('Shadow_hibilis.PNG')) {
                    shadowHabilis.src = 'assets/img/Translation_Habilis.PNG';
                    if (popupHabilis) popupHabilis.classList.add('show');
                } else {
                    shadowHabilis.src = 'assets/img/Shadow_hibilis.PNG';
                    if (popupHabilis) popupHabilis.classList.remove('show');
                }
            });
        }
        if (shadowErectus) {
            shadowErectus.addEventListener('click', () => {
                const progress = window.scrollY / (3 * window.innerHeight);
                if (progress < 1.8) return;
                if (shadowErectus.src.includes('Shadow_erectus.PNG')) {
                    shadowErectus.src = 'assets/img/Translation_Erectus.PNG';
                    if (popupErectus) popupErectus.classList.add('show');
                } else {
                    shadowErectus.src = 'assets/img/Shadow_erectus.PNG';
                    if (popupErectus) popupErectus.classList.remove('show');
                }
            });
        }
    }

    function applyLang(lang) {
        document.documentElement.lang = lang;
        if (lang === 'th') {
            langTextSpan.textContent = 'EN';
        } else {
            langTextSpan.textContent = 'TH';
        }

        if (!chapterData) return;

        // Apply text to prologue
        const scene1 = chapterData.scenes.find(s => s.scene_id === "1.1");
        if (scene1) {
            prologueTexts.forEach((el, index) => {
                el.textContent = scene1.main_text[lang][index];
            });
        }

        // Apply text to savanna
        const scene2 = chapterData.scenes.find(s => s.scene_id === "1.2");
        if (scene2) {
            savannaText.textContent = scene2.main_text[lang][0];
        }

        // Apply text to scene 3
        const scene3 = chapterData.scenes.find(s => s.scene_id === "1.3");
        if (scene3) {
            document.getElementById('scene3-text').textContent = scene3.main_text[lang];
            if (scene3.additional_info && scene3.additional_info.length >= 2) {
                document.getElementById('text-popup-habilis').textContent = scene3.additional_info[0].text[lang];
                document.getElementById('text-popup-erectus').textContent = scene3.additional_info[1].text[lang];
            }
        }
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }

        // Hide popups when user scrolls
        const popupHabilis = document.getElementById('popup-habilis');
        const popupErectus = document.getElementById('popup-erectus');
        const shadowHabilis = document.getElementById('layer-shadow-habilis');
        const shadowErectus = document.getElementById('layer-shadow-erectus');

        if (popupHabilis && popupHabilis.classList.contains('show')) {
            popupHabilis.classList.remove('show');
            if (shadowHabilis) shadowHabilis.src = 'assets/img/Shadow_hibilis.PNG';
        }
        if (popupErectus && popupErectus.classList.contains('show')) {
            popupErectus.classList.remove('show');
            if (shadowErectus) shadowErectus.src = 'assets/img/Shadow_erectus.PNG';
        }
    }

    // Auto-play Prologue Sequence
    async function playPrologueSequence() {
        const delay = ms => new Promise(res => setTimeout(res, ms));

        // Wait a little before starting the first text
        await delay(500);

        for (let i = 0; i < prologueTexts.length; i++) {
            // Fade in and slide up to center
            prologueTexts[i].classList.add('active');

            // Wait for reading time
            await delay(2500);

            // Fade out and slide up further
            prologueTexts[i].classList.remove('active');
            prologueTexts[i].classList.add('exit');

            // Small gap before the next sentence appears
            await delay(800);
        }

        // Prologue finished, unlock scrolling
        document.body.style.overflow = 'auto';

        // Force an initial update for the parallax engine
        requestAnimationFrame(updateParallax);
    }

    // Helper: Map a value from one range to another, clamped to [0, 1] usually
    function mapRange(value, inMin, inMax, outMin, outMax) {
        const clamped = Math.max(inMin, Math.min(value, inMax));
        return outMin + (outMax - outMin) * ((clamped - inMin) / (inMax - inMin));
    }

    function updateParallax() {
        const scrollY = window.scrollY;
        // Old scale was 400vh total, maxScroll 300vh (3 * vh). We keep progress 0-1 mapped to the first 300vh.
        const vh = window.innerHeight;
        const progress = scrollY / (3 * vh);

        // Phase 1: Waking Up (0% - 10%)
        // Black overlay fades out
        if (blackOverlay) {
            blackOverlay.style.opacity = mapRange(progress, 0.0, 0.10, 1, 0);
        }

        // Blur (Starts blurry, resolves at 10%)
        const blurVal = mapRange(progress, 0.0, 0.10, 20, 0);
        const filterStr = `blur(${blurVal}px)`;

        layerCaveFront.style.filter = filterStr;
        layerCaveMid.style.filter = filterStr;

        // Phase 2: First Step Forward (Cave Front Scale 10% - 30%)
        const frontScale = mapRange(progress, 0.10, 0.30, 1, 6);
        const frontOpacity = mapRange(progress, 0.20, 0.30, 1, 0);
        layerCaveFront.style.transform = `scale(${frontScale})`;
        layerCaveFront.style.opacity = frontOpacity;

        // Phase 3: Exiting Cave (Cave Mid Scale 25% - 70%)
        const midScale = mapRange(progress, 0.25, 0.70, 1, 8);
        const midOpacity = mapRange(progress, 0.60, 0.70, 1, 0);
        layerCaveMid.style.transform = `scale(${midScale})`;
        layerCaveMid.style.opacity = midOpacity;

        // Phase 4: Dawn (Sunrise 70% - 100%)
        const sunY = mapRange(progress, 0.70, 1.0, 100, -5);
        // ทำให้พระอาทิตย์เล็กลงโดยเพิ่ม scale(0.6)
        layerSun.style.transform = `translateY(${sunY}%) translateX(-5%) scale(0.6)`;

        // กวางเดินเข้ามาจากด้านซ้าย (เชื่อมกับช่วงพระอาทิตย์ขึ้น 70% - 100%)
        // เริ่มที่ -60vw (ซ่อนอยู่ซ้ายสุด) แล้วค่อยๆ เลื่อนมาที่ 0 พร้อมกับที่พระอาทิตย์ขึ้นสุด
        const deerX = mapRange(progress, 0.70, 1.0, -60, 0);
        layerDeer.style.transform = `translateX(${deerX}vw)`;

        // นกบินเข้ามาจากด้านขวา (เชื่อมกับช่วงพระอาทิตย์ขึ้น 70% - 100%)
        // เริ่มที่ 60vw (ซ่อนอยู่ขวาสุด) แล้วค่อยๆ เลื่อนมาที่ 0 พร้อมกับกวางและพระอาทิตย์
        const birdX = mapRange(progress, 0.70, 1.0, 60, 0);
        layerBird.style.transform = `translateX(${birdX}vw)`;

        // Savanna Text (80% - 95%)
        const savannaOpacity = mapRange(progress, 0.80, 0.95, 0, 1);
        const savannaY = mapRange(progress, 0.80, 0.95, 20, 0);
        savannaTextContainer.style.opacity = savannaOpacity;
        savannaTextContainer.style.transform = `translateY(${savannaY}px)`;

        // Phase 5: Story Continuation
        // Phase 5: Story Continuation
        // Fade in Phase 5 layers while screen is black (1.25 - 1.35)
        const phase5Opacity = mapRange(progress, 1.25, 1.35, 0, 1);
        document.querySelectorAll('.layer-phase5').forEach(el => {
            el.style.opacity = phase5Opacity;
        });

        // Sun4 moves up
        const layerSun4 = document.getElementById('layer-sun4');
        const sun4Y_phase5 = mapRange(progress, 1.4, 1.8, 60, 4);
        if (layerSun4) layerSun4.style.transform = `translateY(${sun4Y_phase5}%)`;

        // Shadows start near the center and separate outwards to the edges
        const layerShadowHabilis = document.getElementById('layer-shadow-habilis');
        const layerShadowErectus = document.getElementById('layer-shadow-erectus');

        // Starts at 0 (center) and moves to -30vw (left) and 30vw (right)
        const habilisX = mapRange(progress, 1.4, 1.7, 0, -30);
        const erectusX = mapRange(progress, 1.4, 1.7, 0, 30);

        if (layerShadowHabilis) {
            layerShadowHabilis.style.transform = `translateX(${habilisX}vw)`;
            if (progress >= 1.8) {
                layerShadowHabilis.classList.add('clickable');
            } else {
                layerShadowHabilis.classList.remove('clickable');
            }
        }
        if (layerShadowErectus) {
            layerShadowErectus.style.transform = `translateX(${erectusX}vw)`;
            if (progress >= 1.8) {
                layerShadowErectus.classList.add('clickable');
            } else {
                layerShadowErectus.classList.remove('clickable');
            }
        }

        // Story Text slides up to center
        const scene3TextContainer = document.getElementById('scene3-text-container');
        const text3Y = mapRange(progress, 1.5, 1.8, 150, -50);
        const text3Opacity = mapRange(progress, 1.5, 1.7, 0, 1);
        if (scene3TextContainer) {
            scene3TextContainer.style.transform = `translate(-50%, ${text3Y}%)`;
            scene3TextContainer.style.opacity = text3Opacity;
        }

        // Section Transition: Full-frame black silhouette mask
        const sectionTransitionMask = document.getElementById('section-transition-mask');
        if (sectionTransitionMask) {
            let maskOpacity = 0;
            // Hold Savanna scene until progress 1.15, then fade to black
            if (progress >= 1.15 && progress < 1.25) {
                maskOpacity = mapRange(progress, 1.15, 1.25, 0, 1);
            } else if (progress >= 1.25 && progress <= 1.35) {
                // Hold solid pitch black
                maskOpacity = 1;
            } else if (progress > 1.35 && progress <= 1.55) {
                // Fade out slower to reveal Phase 5
                maskOpacity = mapRange(progress, 1.35, 1.55, 1, 0);
            }
            sectionTransitionMask.style.opacity = maskOpacity;
        }

        // Footprints slide in from left to right as user scrolls (1.8 - 3.5)
        const footprintsContainer = document.getElementById('footprints-container');
        if (footprintsContainer) {
            const footX = mapRange(progress, 1.8, 3.5, 0, 220); // Move entirely off screen to the right
            footprintsContainer.style.transform = `translateX(${footX}vw)`;

            // Wiggle individual footprints left and right to look like walking
            const footprints = document.querySelectorAll('.footprint');
            footprints.forEach((foot, index) => {
                const isEven = index % 2 === 1; // nth-child is 1-indexed, index is 0-indexed
                const baseRotate = isEven ? 15 : -10;
                const baseY = isEven ? 30 : -15;

                // Sine wave based on progress to create back-and-forth movement
                const wiggleX = Math.sin(progress * 20 + index) * 20;
                const wiggleRotate = Math.sin(progress * 20 + index) * 45; // Tilt by +/- 45 degrees dynamically

                foot.style.transform = `translate(${wiggleX}px, ${baseY}px) rotate(${baseRotate + wiggleRotate}deg)`;
            });
        }
    }
});
