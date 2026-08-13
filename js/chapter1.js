document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const layerSun = document.getElementById('layer-sun');
    const layerCloudsBg = document.getElementById('layer-clouds-bg');
    const layerCloudsFg = document.getElementById('layer-clouds-fg');
    const layerCaveMid = document.getElementById('layer-cave-mid');
    const layerCaveFront = document.getElementById('layer-cave-front');
    const layerDeer = document.getElementById('layer-deer');
    const layerBird = document.getElementById('layer-bird');
    const layerLion = document.getElementById('layer-lion');
    const layerElephant = document.getElementById('layer-elephant');

    const blackOverlay = document.getElementById('black-overlay');

    const prologueTexts = [
        document.getElementById('prologue-1'),
        document.getElementById('prologue-2'),
        document.getElementById('prologue-3'),
        document.getElementById('prologue-4')
    ];

    const savannaTextContainer = document.getElementById('savanna-text-container');
    const savannaText = document.getElementById('savanna-text');

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

            // Start Prologue manual sequence
            initManualPrologue();

        } catch (error) {
            console.error('Error loading chapter data:', error);
        }

        // Navbar (logo flash, back-to-eras flash, language toggle) is owned by js/navbar.js
        window.addEventListener('langchange', (e) => {
            currentLang = e.detail.lang;
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
                if (progress < 1.5) return;
                if (shadowHabilis.src.includes('Shadow_hibilis.PNG')) {
                    shadowHabilis.src = 'assets/img/chapter1/Translation_Habilis.PNG';
                    if (popupHabilis) popupHabilis.classList.add('show');
                } else {
                    shadowHabilis.src = 'assets/img/chapter1/Shadow_hibilis.PNG';
                    if (popupHabilis) popupHabilis.classList.remove('show');
                }
            });
        }
        if (shadowErectus) {
            shadowErectus.addEventListener('click', () => {
                const progress = window.scrollY / (3 * window.innerHeight);
                if (progress < 1.5) return;
                if (shadowErectus.src.includes('Shadow_erectus.PNG')) {
                    shadowErectus.src = 'assets/img/chapter1/Translation_Erectus.PNG';
                    if (popupErectus) popupErectus.classList.add('show');
                } else {
                    shadowErectus.src = 'assets/img/chapter1/Shadow_erectus.PNG';
                    if (popupErectus) popupErectus.classList.remove('show');
                }
            });
        }

        // Click handlers for Tool and Fire cave props using hitboxes
        const hitboxTool = document.getElementById('hitbox-tool');
        const hitboxFire = document.getElementById('hitbox-fire');
        // Fallbacks if hitboxes aren't there
        const layerToolEl = hitboxTool || document.getElementById('layer-tool');
        const layerFireEl = hitboxFire || document.getElementById('layer-fire');

        const popupToolEl = document.getElementById('popup-tool');
        const popupTool2El = document.getElementById('popup-tool-2'); // Optional secondary popup
        const popupFireEl = document.getElementById('popup-fire');

        const closeAllCavePopups = () => {
            if (popupToolEl) popupToolEl.classList.remove('show');
            if (popupTool2El) popupTool2El.classList.remove('show');
            if (popupFireEl) popupFireEl.classList.remove('show');
        };

        if (layerToolEl) {
            layerToolEl.addEventListener('click', () => {
                const progress = window.scrollY / (3 * window.innerHeight);
                if (progress < 4.6) return;
                const isOpen = popupToolEl && popupToolEl.classList.contains('show');
                closeAllCavePopups();
                if (!isOpen && popupToolEl) popupToolEl.classList.add('show');
                if (!isOpen && popupTool2El) popupTool2El.classList.add('show');
            });
        }
        if (layerFireEl) {
            layerFireEl.addEventListener('click', () => {
                const progress = window.scrollY / (3 * window.innerHeight);
                if (progress < 4.6) return;
                const isOpen = popupFireEl && popupFireEl.classList.contains('show');
                closeAllCavePopups();
                if (!isOpen && popupFireEl) popupFireEl.classList.add('show');
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

        // Apply text to scene 4
        const scene4 = chapterData.scenes.find(s => s.scene_id === "1.4");
        if (scene4) {
            document.getElementById('scene4-text').textContent = scene4.main_text[lang];
            // Load cave prop popup texts from scene 1.4 additional_info
            if (scene4.additional_info && scene4.additional_info.length >= 2) {
                const toolEl = document.getElementById('text-popup-tool');
                const tool2El = document.getElementById('text-popup-tool-2');
                const fireEl = document.getElementById('text-popup-fire');
                if (toolEl) toolEl.textContent = scene4.additional_info[0].text[lang];
                if (tool2El) tool2El.textContent = scene4.additional_info[0].text[lang]; // same as tool
                if (fireEl) fireEl.textContent = scene4.additional_info[1].text[lang];
            }
        }

        // Apply text to scene 5 (Ending)
        const scene5 = chapterData.scenes.find(s => s.scene_id === "1.5");
        if (scene5) {
            const scene5Text = document.getElementById('scene5-text');
            if (scene5Text) scene5Text.textContent = scene5.main_text[lang];
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
            if (shadowHabilis) shadowHabilis.src = 'assets/img/chapter1/Shadow_hibilis.PNG';
        }
        if (popupErectus && popupErectus.classList.contains('show')) {
            popupErectus.classList.remove('show');
            if (shadowErectus) shadowErectus.src = 'assets/img/chapter1/Shadow_erectus.PNG';
        }

        // Dismiss cave prop popups on scroll
        const popupTool = document.getElementById('popup-tool');
        const popupTool2 = document.getElementById('popup-tool-2');
        const popupFire = document.getElementById('popup-fire');
        if (popupTool) popupTool.classList.remove('show');
        if (popupTool2) popupTool2.classList.remove('show');
        if (popupFire) popupFire.classList.remove('show');
    }

    // Manual Prologue Sequence
    let currentPrologueIndex = -1;
    let isPrologueTransitioning = false;
    let prologueFinished = false;
    let touchStartY = 0;

    function initManualPrologue() {
        // Force scroll to top to prevent browser scroll restoration from revealing the scene
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        window.addEventListener('wheel', handlePrologueScroll, { passive: false });
        window.addEventListener('keydown', handlePrologueKey);
        window.addEventListener('touchstart', handlePrologueTouchStart, { passive: false });
        window.addEventListener('touchend', handlePrologueTouchEnd, { passive: false });

        // Show the first text after a small delay
        setTimeout(nextPrologueStep, 500);
    }

    function handlePrologueScroll(e) {
        if (!prologueFinished) {
            e.preventDefault(); // Stop page from scrolling in the background
            if (e.deltaY > 0) nextPrologueStep();
            else if (e.deltaY < 0) prevPrologueStep();
        } else {
            // If main scroll is at top and user scrolls up, re-enter prologue
            if (window.scrollY <= 0 && e.deltaY < 0) {
                e.preventDefault();
                enterPrologueReverse();
            }
        }
    }

    function handlePrologueKey(e) {
        if (prologueFinished) return;
        if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
            e.preventDefault();
            nextPrologueStep();
        } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
            e.preventDefault();
            prevPrologueStep();
        }
    }

    function handlePrologueTouchStart(e) {
        if (prologueFinished) return;
        touchStartY = e.touches[0].clientY;
    }

    function handlePrologueTouchEnd(e) {
        if (prologueFinished) return;
        e.preventDefault(); // Stop page scroll
        const touchEndY = e.changedTouches[0].clientY;
        if (touchStartY - touchEndY > 30) {
            nextPrologueStep();
        } else if (touchEndY - touchStartY > 30) {
            prevPrologueStep();
        }
    }

    async function prevPrologueStep() {
        if (isPrologueTransitioning || prologueFinished) return;
        isPrologueTransitioning = true;
        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (currentPrologueIndex >= 0 && currentPrologueIndex < prologueTexts.length) {
            prologueTexts[currentPrologueIndex].classList.remove('active');
            prologueTexts[currentPrologueIndex].classList.remove('exit');
            await delay(600);
        }

        currentPrologueIndex--;

        if (currentPrologueIndex >= 0) {
            prologueTexts[currentPrologueIndex].classList.remove('exit');
            prologueTexts[currentPrologueIndex].classList.add('active');
            await delay(800);
            isPrologueTransitioning = false;
        } else {
            currentPrologueIndex = 0;
            prologueTexts[0].classList.add('active');
            isPrologueTransitioning = false;
        }
    }

    function enterPrologueReverse() {
        prologueFinished = false;
        isPrologueTransitioning = false; // Fix: Reset transition state
        window.scrollTo(0, 0); // Ensure we are at top
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        currentPrologueIndex = prologueTexts.length - 1;
        
        // Set all texts to .exit (above) state initially
        prologueTexts.forEach(t => { 
            t.classList.remove('active'); 
            t.classList.add('exit'); 
        });
        
        void document.body.offsetWidth; // Force reflow

        if (currentPrologueIndex >= 0) {
            // Move the last text down into view
            prologueTexts[currentPrologueIndex].classList.remove('exit');
            prologueTexts[currentPrologueIndex].classList.add('active');
        }

        // Add back listeners for touch and key since they were removed
        window.addEventListener('keydown', handlePrologueKey);
        window.addEventListener('touchstart', handlePrologueTouchStart, { passive: false });
        window.addEventListener('touchend', handlePrologueTouchEnd, { passive: false });
    }

    async function nextPrologueStep() {
        if (isPrologueTransitioning || prologueFinished) return;
        isPrologueTransitioning = true;

        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (currentPrologueIndex >= 0 && currentPrologueIndex < prologueTexts.length) {
            // Fade out current text
            prologueTexts[currentPrologueIndex].classList.remove('active');
            prologueTexts[currentPrologueIndex].classList.add('exit');
            await delay(600);
        }

        currentPrologueIndex++;

        if (currentPrologueIndex < prologueTexts.length) {
            // Fade in next text
            prologueTexts[currentPrologueIndex].classList.remove('exit');
            prologueTexts[currentPrologueIndex].classList.add('active');
            await delay(800); // Cooldown to prevent double triggers
            isPrologueTransitioning = false;
        } else {
            // Finished
            prologueFinished = true;
            isPrologueTransitioning = false; // Fix: Ensure state is reset when finishing
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            // We do NOT remove wheel listener because we need it to detect scrolling up at the top
            window.removeEventListener('keydown', handlePrologueKey);
            window.removeEventListener('touchstart', handlePrologueTouchStart);
            window.removeEventListener('touchend', handlePrologueTouchEnd);
            requestAnimationFrame(updateParallax);
        }
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

        // นกบินเข้ามาจากด้านขวาก่อน (ช่วง 65% - 90%)
        const birdX = mapRange(progress, 0.65, 0.90, 60, 0);
        layerBird.style.transform = `translateX(${birdX}vw)`;

        // ช้างเดินเข้ามาจากด้านซ้าย (มาก่อนกวาง ช่วง 70% - 95%)
        if (layerElephant) {
            const elephantX = mapRange(progress, 0.70, 0.95, -60, 0);
            layerElephant.style.transform = `translateX(${elephantX}vw)`;
        }

        // กวางเดินเข้ามาจากด้านซ้าย (ช้าลงและมาทีหลัง ช่วง 75% - 1.05)
        if (layerDeer) {
            const deerX = mapRange(progress, 0.75, 1.05, -40, 0);
            layerDeer.style.transform = `translateX(${deerX}vw)`;
        }

        // สิงโตเดินเข้ามาจากด้านขวา (พร้อมกวาง ช่วง 75% - 100%)
        const lionX = mapRange(progress, 0.75, 1.0, 60, 0);
        if (layerLion) layerLion.style.transform = `translateX(${lionX}vw)`;

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
        }
        if (layerShadowErectus) {
            layerShadowErectus.style.transform = `translateX(${erectusX}vw)`;
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

        // Phase 6: Night Sky (3.5 - 4.0)
        const layerBgDark = document.getElementById('layer-bg-dark');
        const layerStar = document.getElementById('layer-star');
        const layerMoon = document.getElementById('layer-moon');

        const phase6Opacity = mapRange(progress, 3.5, 4.0, 0, 1);

        if (layerBgDark) layerBgDark.style.opacity = phase6Opacity;
        if (layerStar) layerStar.style.opacity = phase6Opacity;
        if (layerMoon) {
            layerMoon.style.opacity = phase6Opacity;
            // Moon rises from below screen up — same window as Rock zoom
            const moonY = mapRange(progress, 3.5, 4.2, 120, 14);
            layerMoon.style.transform = `translateY(${moonY}vh)`;
        }

        // Phase 7a: Rock — appears after Moon lands, zooms IN (4.2 - 5.8)
        const layerRock = document.getElementById('layer-rock');
        if (layerRock) {
            const rockOpacity = progress >= 4.2 ? 1 : 0;           // snap visible after moon done
            const rockScale = mapRange(progress, 4.2, 5.8, 1, 2); // zoom IN slowly
            layerRock.style.opacity = rockOpacity;
            layerRock.style.transform = `scale(${rockScale})`;
        }

        // Phase 7b: Cave Final + Tool + Fire — fade in together (4.2 - 4.6)
        const layerCaveFinal = document.getElementById('layer-cave-final');
        const layerTool = document.getElementById('layer-tool');
        const layerTool2 = document.getElementById('layer-tool-2');
        const layerFire = document.getElementById('layer-fire');
        const caveGroupOpacity = mapRange(progress, 4.2, 4.6, 0, 1);

        if (layerCaveFinal) {
            layerCaveFinal.style.opacity = caveGroupOpacity;
            layerCaveFinal.style.transform = `scale(1)`;
        }
        if (layerTool) {
            layerTool.style.opacity = caveGroupOpacity;
            layerTool.style.pointerEvents = 'none'; // hitboxes handle pointer events
        }
        if (layerTool2) {
            layerTool2.style.opacity = caveGroupOpacity;
            layerTool2.style.pointerEvents = 'none';
        }
        if (layerFire) {
            layerFire.style.opacity = caveGroupOpacity;
            layerFire.style.pointerEvents = 'none';
        }

        // Manage hitboxes pointer events and opacity (for debugging borders)
        const hitboxTool = document.getElementById('hitbox-tool');
        const hitboxFire = document.getElementById('hitbox-fire');
        if (hitboxTool) {
            hitboxTool.style.pointerEvents = progress >= 4.6 ? 'auto' : 'none';
            hitboxTool.style.opacity = progress >= 4.6 ? 1 : 0;
        }
        if (hitboxFire) {
            hitboxFire.style.pointerEvents = progress >= 4.6 ? 'auto' : 'none';
            hitboxFire.style.opacity = progress >= 4.6 ? 1 : 0;
        }


        // Phase 7c: Scene 1.4 text — appears after cave is established (5.0 - 5.4)
        const scene4TextContainer = document.getElementById('scene4-text-container');
        if (scene4TextContainer) {
            const text4Opacity = mapRange(progress, 5.0, 5.4, 0, 1);
            const text4Y = mapRange(progress, 5.0, 5.4, 40, 0);
            scene4TextContainer.style.opacity = text4Opacity;
            scene4TextContainer.style.transform = `translateX(-50%) translateY(${text4Y}px)`;
        }

        // Phase 8: Scene 1.5 Ending Fade to Black (5.6 - 6.0)
        const endingBlackMask = document.getElementById('ending-black-mask');
        if (endingBlackMask) {
            const maskOpacity = mapRange(progress, 5.6, 6.0, 0, 1);
            endingBlackMask.style.opacity = maskOpacity;
        }

        // Scene 1.5 Ending Text floats up (6.0 - 6.5)
        const scene5TextContainer = document.getElementById('scene5-text-container');
        if (scene5TextContainer) {
            const text5Opacity = mapRange(progress, 6.0, 6.4, 0, 1);
            const text5Y = mapRange(progress, 6.0, 6.5, 50, -100);
            scene5TextContainer.style.opacity = text5Opacity;
            scene5TextContainer.style.transform = `translate(-50%, ${text5Y}px)`;
        }
    }
});
