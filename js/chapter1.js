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
    }

    function applyLang(lang) {
        langTextSpan.textContent = lang.toUpperCase();

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
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
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
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

        // Phase 1: Waking Up (0% - 10%)
        // Black overlay fades out
        blackOverlay.style.opacity = mapRange(progress, 0.0, 0.10, 1, 0);

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
    }
});
