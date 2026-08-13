// Chapter 2 - switch Scene 1's title and populate Scene 2 text (from chapter2.json, scene 2.1)
// with the navbar's TH/EN toggle
document.addEventListener('DOMContentLoaded', async () => {
    const scene1TitleEl = document.querySelector('.scene-title-main');
    const scene1TitleWrap = document.querySelector('.scene-title');

    const coin1El = document.querySelector('.layer-mayan-coin-1');
    const coin2El = document.querySelector('.layer-mayan-coin-2');
    const COIN1_REST_DEG = 26;
    const COIN2_REST_DEG = 8;

    // Once the CSS pop-in finishes, hand off to JS: fill-mode:both would otherwise
    // hold the animation's transform forever and silently win over any inline
    // style.transform we set later for the scroll-driven spin below.
    coin1El.addEventListener('animationend', (e) => {
        if (e.animationName !== 'scene1-coin-1-enter') return;
        coin1El.style.animation = 'none';
        coin1El.style.transform = `rotate(${COIN1_REST_DEG}deg)`;
    });
    coin2El.addEventListener('animationend', (e) => {
        if (e.animationName !== 'scene1-coin-2-enter') return;
        coin2El.style.animation = 'none';
        coin2El.style.transform = `rotate(${COIN2_REST_DEG}deg)`;
    });

    const glyphEls = [
        document.querySelector('.layer-glyph-1'),
        document.querySelector('.layer-glyph-2'),
        document.querySelector('.layer-glyph-3'),
        document.querySelector('.layer-glyph-4'),
    ];

    function renderScene1(lang) {
        scene1TitleWrap.dataset.lang = lang;
        scene1TitleEl.textContent = scene1TitleEl.dataset[lang];
    }

    const res = await fetch('assets/data/chapter2.json');
    const data = await res.json();
    const scene = data.scenes.find(s => s.scene_id === '2.1');
    const scene22 = data.scenes.find(s => s.scene_id === '2.2');
    const scene23 = data.scenes.find(s => s.scene_id === '2.3');
    const scene24 = data.scenes.find(s => s.scene_id === '2.4');
    const scene25 = data.scenes.find(s => s.scene_id === '2.5');
    const scene28 = data.scenes.find(s => s.scene_id === '2.8');
    const scene29 = data.scenes.find(s => s.scene_id === '2.9');

    const textEl = document.querySelector('.scene2-text');
    const titleEl = document.querySelector('.scene2-title');
    const subtitleEl = document.querySelector('.scene2-subtitle');
    const bodyEl = document.querySelector('.scene2-body');

    const scene3TrackEl = document.querySelector('.scene3-track');
    const scene3CaptionTitleEl = document.querySelector('.scene3-caption-title');
    const scene3CaptionBodyEl = document.querySelector('.scene3-caption-body');

    const scene4TitleEl = document.querySelector('.scene4-title');
    const scene4SubtitleEl = document.querySelector('.scene4-subtitle');
    const scene4BodyEl = document.querySelector('.scene4-body');
    const scene4ScrollTextEl = document.querySelector('.scene4-scroll-text');

    const scene5TitleEl = document.querySelector('.scene5-title');
    const scene5SubtitleEl = document.querySelector('.scene5-subtitle');

    const scene6TextEl = document.querySelector('.scene6-text');
    const textPopupSledgeEl = document.getElementById('text-popup-sledge');

    const scene7TitleEl = document.querySelector('.scene7-title');
    const scene7TitleLine1El = document.querySelector('.scene7-title-line1');
    const scene7TitleWord2El = document.querySelector('.scene7-title-word2');
    const scene7CaptionEl = document.querySelector('.scene7-statue-caption');
    const scene7TextEl = document.querySelector('.scene7-text');

    const scene8TitleEl = document.querySelector('.scene8-title');
    const scene8TextEl = document.querySelector('.scene8-text');
    const scene8ScrollTabletTextEl = document.querySelector('.scene8-scroll-tablet-text');
    const scene8ScrollBronzeTextEl = document.querySelector('.scene8-scroll-bronze-text');
    const scene8SphinxCaptionEl = document.querySelector('.scene8-sphinx-caption-left');

    const scene9TitleEl = document.querySelector('.scene9-title');
    const scene9TextEl = document.querySelector('.scene9-text');
    const scene9ScrollTextEl = document.querySelector('.scene9-scroll-text');

    const scene10TitleEl = document.querySelector('.scene10-title');
    const scene10TextEl = document.querySelector('.scene10-text');

    const scene11TextEl = document.querySelector('.scene11-text');

    let scene3Lang = localStorage.getItem('lang') || 'th';
    let scene3SlideIndex = 0; // 0 = Giza, 1 = El Castillo

    // Thai sentences here have no internal spaces before the first space; English ones do,
    // so try the sentence-ending ". " first and fall back to the first space.
    function splitSubtitleBody(text) {
        const periodIdx = text.indexOf('. ');
        const idx = periodIdx !== -1 ? periodIdx + 1 : text.indexOf(' ');
        return { subtitle: text.slice(0, idx), body: text.slice(idx + 1).trim() };
    }

    function renderScene2(lang) {
        if (!scene) return;
        textEl.dataset.lang = lang;
        titleEl.textContent = scene.title[lang];
        const { subtitle, body } = splitSubtitleBody(scene.main_text[lang]);
        subtitleEl.textContent = subtitle;
        bodyEl.innerHTML = body.replace(/"([^"]+)"/g, '<span class="highlight">$1</span>');
    }

    function updateScene3Caption() {
        const sceneId = scene3SlideIndex === 0 ? '2.6' : '2.7';
        const captionScene = data.scenes.find(s => s.scene_id === sceneId);
        if (!captionScene) return;
        scene3CaptionTitleEl.textContent = captionScene.title[scene3Lang];
        scene3CaptionBodyEl.textContent = captionScene.main_text[scene3Lang];
    }

    function renderScene3(lang) {
        scene3Lang = lang;
        updateScene3Caption();
    }

    function renderScene4(lang) {
        const info = scene && scene.additional_info.find(i => i.trigger === 'อิมโฮเตป');
        if (!info) return;
        scene4TitleEl.textContent = info.title.th;
        scene4SubtitleEl.textContent = info.title.en;
        scene4ScrollTextEl.textContent = info.title[lang];

        const fullText = info.text[lang];
        const colonIdx = fullText.indexOf(': ');
        const label = fullText.slice(0, colonIdx);
        const body = fullText.slice(colonIdx + 2);
        const highlightWord = info.title[lang];
        const highlightRegex = new RegExp(highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

        // Each space-delimited chunk is wrapped as its own .scene4-word span so the
        // scroll-driven feather (see initChapter2Paging) has a waypoint to move
        // between; the highlight can still land mid-chunk since Thai text here has
        // no spaces between individual words, only between phrase clusters.
        const wordsHtml = body.split(' ').map((word) => {
            const highlighted = word.replace(highlightRegex, '<span class="highlight">$&</span>');
            return `<span class="scene4-word">${highlighted}</span>`;
        }).join(' ');
        scene4BodyEl.innerHTML = `<strong>${label}</strong> ${wordsHtml}`;
    }

    function renderScene5(lang) {
        scene5TitleEl.dataset.lang = lang;
        scene5TitleEl.textContent = scene5TitleEl.dataset[lang];
        if (!scene22) return;
        const text = scene22.main_text[lang];
        const qIdx = text.indexOf('?');
        scene5SubtitleEl.textContent = qIdx !== -1 ? text.slice(0, qIdx + 1) : text;
    }

    function renderScene6(lang) {
        if (!scene22) return;
        scene6TextEl.dataset.lang = lang;
        const text = scene22.main_text[lang];
        const qIdx = text.indexOf('?');
        scene6TextEl.textContent = qIdx !== -1 ? text.slice(qIdx + 1).trim() : text;

        const sledgeInfo = scene22.additional_info.find((i) => i.trigger === 'คนงานลากหิน');
        if (sledgeInfo) textPopupSledgeEl.textContent = sledgeInfo.text[lang];
    }

    function renderScene7(lang) {
        scene7TitleEl.dataset.lang = lang; // keeps .scene7-title[data-lang="en"]'s uppercase/letter-spacing styling working
        scene7TitleLine1El.textContent = scene7TitleLine1El.dataset[lang];
        scene7TitleWord2El.textContent = scene7TitleWord2El.dataset[lang];
        scene7CaptionEl.dataset.lang = lang;
        scene7CaptionEl.textContent = scene7CaptionEl.dataset[lang];
        if (!scene23) return;
        scene7TextEl.dataset.lang = lang;
        // Each space-delimited chunk is wrapped as its own .scene7-word span so
        // applyScene7TextReveal (see initChapter2Paging) has a unit to fade in per
        // visual line, same approach as .scene4-word.
        scene7TextEl.innerHTML = scene23.main_text[lang].split(' ').map((word) => {
            const highlighted = word.replace(/"([^"]+)"/g, '<span class="highlight">$1</span>');
            return `<span class="scene7-word">${highlighted}</span>`;
        }).join(' ');
    }

    function renderScene8(lang) {
        if (!scene28) return;
        scene8TitleEl.dataset.lang = lang; // keeps .scene8-title[data-lang="en"]'s uppercase/letter-spacing styling working
        scene8TitleEl.textContent = scene28.title[lang];
        
        const tabletInfo = scene28.additional_info.find(i => i.trigger === 'scroll-tablet');
        if (tabletInfo) scene8ScrollTabletTextEl.textContent = tabletInfo.text[lang];
        
        const bronzeInfo = scene28.additional_info.find(i => i.trigger === 'scroll-bronze');
        if (bronzeInfo) scene8ScrollBronzeTextEl.textContent = bronzeInfo.text[lang];
        
        const sphinxInfo = scene28.additional_info.find(i => i.trigger === 'sphinx-caption');
        if (sphinxInfo && scene8SphinxCaptionEl) scene8SphinxCaptionEl.textContent = sphinxInfo.text[lang];
        
        scene8TextEl.dataset.lang = lang;
        scene8TextEl.innerHTML = scene28.main_text[lang].replace(/"([^"]+)"/g, '<span class="highlight">$1</span>');
    }

    function renderScene9(lang) {
        if (!scene29) return;
        if (scene9TitleEl) scene9TitleEl.textContent = scene29.title[lang];
        if (scene9TextEl) {
            scene9TextEl.innerHTML = scene29.main_text[lang]
                .replace(/\"([^\"]+)\"/g, '<span class="highlight">$1</span>')
                .replace(/\n/g, '<br>');
        }
        
        const scrollInfo = scene29.additional_info.find(i => i.trigger === 'stone_inscription');
        if (scrollInfo && scene9ScrollTextEl) scene9ScrollTextEl.textContent = scrollInfo.text[lang];
    }

    function renderScene10(lang) {
        scene10TitleEl.dataset.lang = lang;
        scene10TitleEl.textContent = scene10TitleEl.dataset[lang];

        if (!scene24) return;
        const papyrusInfo = scene24.additional_info.find(i => i.trigger === 'ม้วนกระดาษปาปิรุส');
        if (papyrusInfo) scene10TextEl.textContent = papyrusInfo.text[lang];
    }

    function renderScene11(lang) {
        if (!scene25) return;
        scene11TextEl.textContent = scene25.main_text[lang];
    }

    function render(lang) {
        renderScene1(lang);
        renderScene2(lang);
        renderScene3(lang);
        renderScene4(lang);
        renderScene5(lang);
        renderScene6(lang);
        renderScene7(lang);
        renderScene8(lang);
        renderScene9(lang);
        renderScene10(lang);
        renderScene11(lang);
    }

    render(localStorage.getItem('lang') || 'th');
    window.addEventListener('langchange', (e) => render(e.detail.lang));

    initChapter2Paging();

    function initChapter2Paging() {
        const trackEl = document.querySelector('.chapter2-track');
        if (!trackEl || !scene3TrackEl) return;

        const scene4El = document.querySelector('.scene-4');
        const scene4ScrollEl = document.querySelector('.scene4-scroll');
        const scene4FeatherEl = document.querySelector('.layer-feather');
        const scene4SphinxEl = document.querySelector('.layer-sphinx');
        const nemesLeftEl = document.querySelector('.layer-pharaoh-left-2');
        const nemesRightEl = document.querySelector('.layer-pharaoh-right-2');
        const scene6ArmEl = document.querySelector('.layer-orator-arm');
        const scene6HitboxSledgeEl = document.getElementById('hitbox-sledge');
        const scene6PopupSledgeEl = document.getElementById('popup-sledge');
        const scene8SphinxLeftEl = document.querySelector('.layer-sphinx-left');
        const scene8SphinxRightEl = document.querySelector('.layer-sphinx-right');

        // dir: +1 = translateY positive (down), -1 = translateY negative (up)
        // restVh: rest top-edge Y coordinate in vh, treating .scene-10 as a 100vh-tall
        // coordinate space (matches the wrap's own CSS top/bottom % — see
        // .scene10-disc-wrap.disc-N rules in chapter2.css); used by applyScene10DiscMove's
        // loop-wrap math below.
        // idleAmplitudeVh/idlePeriodMs: per-disc idle-sway config used when scrolling
        // pauses mid-gesture (see startScene10DiscIdleSway below) — bumped stronger/slower
        // per user request; the resume-scroll snap grows a bit bigger as a result (see
        // that same tradeoff note near applyScene10DiscMove), accepted like every other
        // snap-over-seamless tradeoff already made in this feature.
        const scene10DiscEls = [
            { el: document.querySelector('.scene10-disc-wrap.disc-1'), dir: 1, restVh: -2, idleAmplitudeVh: 3.8, idlePeriodMs: 5400 },  // down
            { el: document.querySelector('.scene10-disc-wrap.disc-2'), dir: -1, restVh: -1, idleAmplitudeVh: 4.6, idlePeriodMs: 4600 }, // up
            { el: document.querySelector('.scene10-disc-wrap.disc-3'), dir: 1, restVh: 55, idleAmplitudeVh: 4.0, idlePeriodMs: 6000 },  // down
            { el: document.querySelector('.scene10-disc-wrap.disc-4'), dir: -1, restVh: 30, idleAmplitudeVh: 5.0, idlePeriodMs: 4400 }, // up
            { el: document.querySelector('.scene10-disc-wrap.disc-5'), dir: 1, restVh: 87, idleAmplitudeVh: 3.6, idlePeriodMs: 5600 },  // down
            { el: document.querySelector('.scene10-disc-wrap.disc-6'), dir: -1, restVh: 88, idleAmplitudeVh: 4.4, idlePeriodMs: 5000 }, // up
            { el: document.querySelector('.scene10-disc-wrap.disc-7'), dir: -1, restVh: 30, idleAmplitudeVh: 3.8, idlePeriodMs: 4800 }, // up
        ];

        const SCENE_COUNT = 11;
        const SCENE_TRANSITION_MS = 700; // keep in sync with .chapter2-track's CSS transition-duration
        const SUB_ADVANCE_DISTANCE = window.innerHeight; // must scroll ~1 full viewport height to trigger the Scene 3 sub-slide
        const SUB_TRANSITION_MS = 700; // keep in sync with .scene3-track's CSS transition-duration

        let sceneIndex = 0;
        let sceneTransitioning = false;
        let subScrollProgress = 0; // accumulated px of wheel distance toward the next/previous Scene 3 sub-slide
        let subTransitioning = false;

        function goToScene(newIndex) {
            if (sceneTransitioning || newIndex < 0 || newIndex >= SCENE_COUNT || newIndex === sceneIndex) return;
            trackEl.style.transition = ''; // restore the CSS-driven snap in case the
                                            // Scene 2/3 boundary left it manually disabled
            if (newIndex === 3 && sceneIndex === 2) enterScene4Forward();
            if (newIndex === 3 && sceneIndex === 4) enterScene4Backward();
            if (newIndex === 10 && sceneIndex === 9) enterScene11Forward();
            if (newIndex === 9 && sceneIndex === 10) enterScene11Backward();
            sceneTransitioning = true;
            sceneIndex = newIndex;
            trackEl.style.transform = `translateY(-${sceneIndex * 100}vh)`;
            setTimeout(() => {
                sceneTransitioning = false;
            }, SCENE_TRANSITION_MS);
        }

        // Scene 1 <-> Scene 2 boundary: scrolling accumulates instead of jumping
        // instantly, and drives the mayan coins spinning live in real time (coin-1
        // clockwise, coin-2 counter-clockwise) until ~2 full rotations' worth of
        // wheel distance crosses the threshold, at which point the real scene
        // transition fires. Reversing direction before the threshold unwinds the
        // coins back toward rest instead of committing to the transition.
        let scene1CoinProgress = 0;
        const SCENE1_COIN_THRESHOLD = 450; // px of wheel delta for ~2 full coin rotations
        const SCENE1_COIN_TURNS = 2;

        function applyScene1CoinRotation() {
            updateScrollDebug('scene1-coin', scene1CoinProgress, SCENE1_COIN_THRESHOLD);
            const t = scene1CoinProgress / SCENE1_COIN_THRESHOLD;
            coin1El.style.transform = `rotate(${COIN1_REST_DEG + t * 360 * SCENE1_COIN_TURNS}deg)`;
            coin2El.style.transform = `rotate(${COIN2_REST_DEG - t * 360 * SCENE1_COIN_TURNS}deg)`;
        }

        function resetScene1CoinRotation() {
            scene1CoinProgress = 0;
            coin1El.style.transform = `rotate(${COIN1_REST_DEG}deg)`;
            coin2El.style.transform = `rotate(${COIN2_REST_DEG}deg)`;
        }

        // Once the coin spin-up has fully played out, further forward scroll
        // continuously lifts the track into Scene 2 — same idea as Scene 3<->4's
        // applyScene3Exit / Scene 4<->5's applyScene4Exit further below — instead
        // of the instant goToScene(1) snap this used to be.
        let scene1ExitProgress = 0;
        const SCENE1_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift into Scene 2

        function applyScene1Exit() {
            updateScrollDebug('scene1-exit', scene1ExitProgress, SCENE1_EXIT_THRESHOLD);
            const liftT = scene1ExitProgress / SCENE1_EXIT_THRESHOLD;
            trackEl.style.transition = liftT > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${liftT * 100}vh)`; // 0vh = Scene 1's own resting position (sceneIndex 0 * 100vh)
        }

        // Scene 2 <-> Scene 3 boundary: same accumulate-then-transition idea as
        // the Scene 1 coins, but glyph motion (translate off-screen) isn't cyclic
        // like rotation, so progress must NOT reset on threshold-cross — it stays
        // clamped at 0 (at rest on Scene 2) or SCENE2_GLYPH_THRESHOLD (fully
        // exited, Scene 3 side), so arriving at Scene 3 leaves the discs correctly
        // parked off-screen until a return gesture pulls progress back down.
        let scene2GlyphProgress = 0;
        const SCENE2_GLYPH_THRESHOLD = 4500; // px of wheel delta for the full off-screen-left
                                             // to off-screen-right journey; also the point at
                                             // which the scene switch commits (t=1, fully exited)
        const GLYPH_START_X = -110; // vw — off-screen left at rest (t=0); clears
                                     // all 4 discs regardless of their own `left` (3-51%)
        const GLYPH_END_X = 110;    // vw — off-screen right at full exit (t=1)
        const GLYPH_LIFT_Y = -20;   // vh raised, only during the final stretch
        const GLYPH_LIFT_START_T = 0.7; // lift-off (and the Scene 3 reveal below) doesn't
                                         // start until 70% progress
        const GLYPH_SPIN_DEG = 1080; // 3 turns, clockwise (rolling right)

        function applyScene2GlyphTransform() {
            updateScrollDebug('scene2-glyph', scene2GlyphProgress, SCENE2_GLYPH_THRESHOLD);
            const t = scene2GlyphProgress / SCENE2_GLYPH_THRESHOLD;
            const x = GLYPH_START_X + t * (GLYPH_END_X - GLYPH_START_X);
            const liftT = t < GLYPH_LIFT_START_T ? 0 : (t - GLYPH_LIFT_START_T) / (1 - GLYPH_LIFT_START_T);
            const y = liftT * GLYPH_LIFT_Y;
            const transform = `translate(${x}vw, ${y}vh) rotate(${t * GLYPH_SPIN_DEG}deg)`;
            glyphEls.forEach((el) => { el.style.transform = transform; });

            // Scene 3 rises into view during the discs' final lift-off stretch, driven
            // 1:1 by scroll instead of snapping up on its own once the boundary is crossed.
            trackEl.style.transition = t > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${100 + liftT * 100}vh)`;
        }

        // Scene 3 <-> Scene 4 boundary: same continuous track-drag idea as
        // Scene 2<->3's applyScene2GlyphTransform above, but Scene 3's carousel has
        // no decorative element to animate during the lift — it's just the track.
        // "At rest" is 0 when viewed from Scene 3's own side, but
        // SCENE3_EXIT_THRESHOLD when viewed from Scene 4's side (mirrors
        // scene2GlyphProgress's asymmetric "at rest" convention).
        let scene3ExitProgress = 0;
        const SCENE3_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift into Scene 4

        function applyScene3Exit() {
            updateScrollDebug('scene3-exit', scene3ExitProgress, SCENE3_EXIT_THRESHOLD);
            const liftT = scene3ExitProgress / SCENE3_EXIT_THRESHOLD;
            trackEl.style.transition = liftT > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${200 + liftT * 100}vh)`; // 200vh = Scene 3's own resting position (sceneIndex 2 * 100vh)
        }

        // Scene 4 (papyrus card): the scroll banner unfurls once on arrival, then
        // scrolling drives a feather from word to word through the caption
        // (.scene4-word spans built in renderScene4), gating the Scene 5 transition
        // until the last word is reached — same accumulate-then-commit shape as the
        // Scene 1 coins / Scene 2 glyphs above.
        let scene4FeatherProgress = 0;
        const SCENE4_FEATHER_THRESHOLD = 2400; // px of wheel delta for the full first-to-last-word trace
        let scene4Unfurling = false;

        // Once the trace completes, further forward scroll drags the sphinx in from
        // off-screen left 1:1 with wheel delta (no timers, no CSS transition — the
        // scroll itself is the animation, same idea as the coins/glyphs elsewhere).
        let scene4SphinxProgress = 0;
        const SCENE4_SPHINX_THRESHOLD = 900; // px of wheel delta for the sphinx's full slide-in
        const SCENE4_SPHINX_HIDDEN_VW = 60; // matches the -60vw baked into .layer-sphinx's default (hidden) transform

        function applyScene4SphinxTransform() {
            updateScrollDebug('scene4-sphinx', scene4SphinxProgress, SCENE4_SPHINX_THRESHOLD);
            const t = scene4SphinxProgress / SCENE4_SPHINX_THRESHOLD;
            const offsetVw = (1 - t) * SCENE4_SPHINX_HIDDEN_VW;
            scene4SphinxEl.style.transform = `translate(calc(-50% - ${offsetVw}vw), -50%) scale(2.87)`;
        }

        // Once the sphinx is fully in, further forward scroll continuously lifts the
        // track into Scene 5 — same idea as Scene 2<->3's applyScene2GlyphTransform —
        // instead of a canned CSS-transition snap.
        let scene4ExitProgress = 0;
        const SCENE4_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift into Scene 5

        function applyScene4Exit() {
            updateScrollDebug('scene4-exit', scene4ExitProgress, SCENE4_EXIT_THRESHOLD);
            const liftT = scene4ExitProgress / SCENE4_EXIT_THRESHOLD;
            trackEl.style.transition = liftT > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${300 + liftT * 100}vh)`; // 300vh = Scene 4's own resting position (sceneIndex 3 * 100vh)
        }

        // The two pharaoh_nemes.png instances (.layer-pharaoh-left-2 and
        // .layer-pharaoh-right-2) slide in from off-screen 1:1 with wheel delta — same
        // idea as the sphinx above (the scroll itself is the animation, no canned
        // CSS-timed keyframe) — but only once the user is already resting fully on
        // Scene 5. This is deliberately a *separate* progress from scene4ExitProgress:
        // the exit-lift drag that arrives at Scene 5 leaves these figures untouched, so
        // the user sees the scene at rest first, and the very next forward scroll is
        // what starts sliding them in. The pharaoh_khepresh.png instances
        // (.layer-pharaoh-left-1 / -right-1) are untouched by JS and stay fully static.
        let scene5PharaohProgress = 0;
        const SCENE5_PHARAOH_THRESHOLD = 900;
        const NEMES_SLIDE_VW = 30; // off-screen starting offset at progress = 0 — large enough to
                                    // fully clear the viewport from the nemes instances' rest
                                    // positions (left: 5%, right: 10%)

        function applyScene5PharaohSlide(t) {
            updateScrollDebug('scene5-pharaoh', scene5PharaohProgress, SCENE5_PHARAOH_THRESHOLD);
            const offsetVw = (1 - t) * NEMES_SLIDE_VW;
            nemesLeftEl.style.transform = `translateX(-${offsetVw}vw)`;
            nemesRightEl.style.transform = `scaleX(-1) translateX(-${offsetVw}vw)`; // mirror is static in CSS; reproduced here since inline transform replaces it
        }

        // Once the pharaoh slide-in is fully played out, further forward scroll
        // continuously lifts the track into Scene 6 — same idea as Scene 3<->4's
        // applyScene3Exit / Scene 4<->5's applyScene4Exit above — instead of the
        // instant goToScene(5) snap this used to be.
        let scene5ExitProgress = 0;
        const SCENE5_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift into Scene 6

        function applyScene5Exit() {
            updateScrollDebug('scene5-exit', scene5ExitProgress, SCENE5_EXIT_THRESHOLD);
            const liftT = scene5ExitProgress / SCENE5_EXIT_THRESHOLD;
            trackEl.style.transition = liftT > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${400 + liftT * 100}vh)`; // 400vh = Scene 5's own resting position (sceneIndex 4 * 100vh)
            scene6TextEl.style.opacity = liftT; // fades in/out 1:1 with the drag itself, same "scroll is the animation" idea as the position above
        }

        // Scene 6 (last scene, no forward transition of its own): the orator
        // statue's arm waves (sine oscillation) off the same progress as the
        // Scene 6->7 lift below, instead of requiring a separate arm-wave
        // stage to fully play out before the lift can even start. The Liver
        // of Piacenza's own back-and-forth sway is a self-running CSS
        // animation (see .layer-liver-2 / scene6-liver-sway) and isn't tied
        // to scroll at all.
        const ARM_WAVE_FREQ = 3; // full wave cycles across the whole lift
        const ARM_WAVE_AMPLITUDE_DEG = 18;

        function applyScene6Transform(t) {
            scene6ArmEl.style.transform = `rotate(${Math.sin(t * ARM_WAVE_FREQ * Math.PI * 2) * ARM_WAVE_AMPLITUDE_DEG}deg)`;
        }

        // Further forward scroll continuously lifts the track into Scene 7 —
        // same idea as Scene 4<->5's applyScene4Exit / Scene 5<->6's
        // applyScene5Exit above — instead of an instant goToScene(6) snap.
        let scene6ExitProgress = 0;
        const SCENE6_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift into Scene 7

        function applyScene6Exit() {
            updateScrollDebug('scene6-exit', scene6ExitProgress, SCENE6_EXIT_THRESHOLD);
            const liftT = scene6ExitProgress / SCENE6_EXIT_THRESHOLD;
            trackEl.style.transition = liftT > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${500 + liftT * 100}vh)`; // 500vh = Scene 6's own resting position (sceneIndex 5 * 100vh)
        }

        // "ความวุ่นวาย" stays inline, flat, and completely still on the same line as
        // line 1 through the whole Scene 6->7 entrance and the first few scroll
        // ticks once resting on Scene 7 — no creeping. Only once forward scroll
        // ticks (not px distance) reach SCENE7_TITLE_TICK_THRESHOLD does it drop
        // into its tilted pose in one go (CSS transition on the element does the
        // actual "falling" motion, not a scroll-proportional drag). Scrolling back
        // counts ticks back down and un-tilts once below threshold again, same
        // idea as scene5PharaohProgress taking priority over the exit-lift return.
        let scene7TitleScrollTicks = 0;
        const SCENE7_TITLE_TICK_THRESHOLD = 4; // 3 ticks do nothing, the 4th triggers the drop
        const SCENE7_WORD2_TILT_DEG = 15;

        function applyScene7TitleTilt() {
            updateScrollDebug('scene7-title-tick', scene7TitleScrollTicks, SCENE7_TITLE_TICK_THRESHOLD);
            const tilted = scene7TitleScrollTicks >= SCENE7_TITLE_TICK_THRESHOLD;
            scene7TitleWord2El.style.transform = tilted ? `rotate(${SCENE7_WORD2_TILT_DEG}deg)` : 'rotate(0deg)';
        }

        // Once the title has fully dropped (ticks maxed), further forward scroll
        // continuously lifts the track into Scene 8 — same idea as Scene 5<->6's
        // applyScene5Exit / Scene 6<->7's applyScene6Exit above — instead of the
        // tick counter incrementing forever with no further effect.
        let scene7ExitProgress = 0;
        const SCENE7_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift into Scene 8

        function applyScene7Exit() {
            updateScrollDebug('scene7-exit', scene7ExitProgress, SCENE7_EXIT_THRESHOLD);
            const liftT = scene7ExitProgress / SCENE7_EXIT_THRESHOLD;
            trackEl.style.transition = liftT > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${600 + liftT * 100}vh)`; // 600vh = Scene 7's own resting position (sceneIndex 6 * 100vh)
        }

        // scene7-text fades in as the user scrolls, same 1:1 opacity-tracks-delta
        // convention as scene6-text (applyScene5Exit). This has to fully reveal
        // (progress reach SCENE7_TEXT_THRESHOLD) before forward ticks are allowed to
        // start counting toward the title-word2 tilt above — see the priority chain
        // in handleWheel.
        let scene7TextProgress = 0;
        const SCENE7_TEXT_THRESHOLD = 2400; // px of wheel delta for the full fade-in (~2 scroll ticks per line)

        // Same Range.getClientRects() line-grouping idea as
        // getScene4LineFragmentsFrom below (a .scene7-word chunk can itself wrap
        // across two visual lines for Thai text with no inter-word spaces), except
        // here it's only used to bucket each word into a line index, not to place a
        // moving waypoint. A wrapped word is grouped by where it *starts*.
        const SCENE7_LINE_Y_TOLERANCE = 8; // px; words within this band count as the same line

        function getScene7WordLines() {
            const wordEls = Array.from(scene7TextEl.querySelectorAll('.scene7-word'));
            let lineY = null;
            let lineIndex = -1;
            return wordEls.map((el) => {
                const range = document.createRange();
                range.selectNodeContents(el);
                const rect = range.getClientRects()[0] || el.getBoundingClientRect();
                if (lineY === null || Math.abs(rect.top - lineY) > SCENE7_LINE_Y_TOLERANCE) {
                    lineY = rect.top;
                    lineIndex++;
                }
                return { el, lineIndex };
            });
        }

        function applyScene7TextReveal() {
            updateScrollDebug('scene7-text', scene7TextProgress, SCENE7_TEXT_THRESHOLD);
            const wordLines = getScene7WordLines();
            if (!wordLines.length) return;
            const numLines = wordLines[wordLines.length - 1].lineIndex + 1;
            const t = Math.max(0, Math.min(1, scene7TextProgress / SCENE7_TEXT_THRESHOLD));
            const linesRevealed = t * numLines;
            wordLines.forEach(({ el, lineIndex }) => {
                el.style.opacity = Math.max(0, Math.min(1, linesRevealed - lineIndex));
            });
        }

        // value, gating the Scene 9 transition until they are fully apart.
        let scene8SphinxProgress = 0;
        const SCENE8_SPHINX_THRESHOLD = 1000; // px of wheel delta for the full slide-apart
        const SPHINX_EXIT_VW = 45; // vw each sphinx travels outward

        function applyScene8SphinxSlide(t) {
            updateScrollDebug('scene8-sphinx', scene8SphinxProgress, SCENE8_SPHINX_THRESHOLD);
            const offsetVw = t * SPHINX_EXIT_VW;
            scene8SphinxLeftEl.style.transform = `translateX(-${offsetVw}vw)`;
            scene8SphinxRightEl.style.transform = `scaleX(-1) translateX(-${offsetVw}vw)`; // mirror is static in CSS; reproduced here since inline transform replaces it
        }

        // Once the sphinxes slide apart, further forward scroll continuously lifts the track
        // into Scene 9.
        let scene8ExitProgress = 0;
        const SCENE8_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift into Scene 9

        function applyScene8Exit() {
            updateScrollDebug('scene8-exit', scene8ExitProgress, SCENE8_EXIT_THRESHOLD);
            const liftT = scene8ExitProgress / SCENE8_EXIT_THRESHOLD;
            trackEl.style.transition = liftT > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${700 + liftT * 100}vh)`; // 700vh = Scene 8's own resting position (sceneIndex 7 * 100vh)
        }

        // Once resting on Scene 9, further forward scroll continuously lifts the track
        // into Scene 10. No gated sub-stage first (unlike Scene 7/8's title-tilt/sphinx-slide)
        // since Scene 10 has no scroll-driven content of its own.
        let scene9ExitProgress = 0;
        const SCENE9_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift into Scene 10

        function applyScene9Exit() {
            updateScrollDebug('scene9-exit', scene9ExitProgress, SCENE9_EXIT_THRESHOLD);
            const liftT = scene9ExitProgress / SCENE9_EXIT_THRESHOLD;
            trackEl.style.transition = liftT > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${800 + liftT * 100}vh)`; // 800vh = Scene 9's own resting position (sceneIndex 8 * 100vh)
            // The 7 disc coins are visible for the whole Scene9->10 lift (as soon as it
            // starts, not gated behind reaching full arrival) and hide instantly again
            // only once fully back at rest on Scene 9 (liftT back down to exactly 0).
            // Runs every tick of this drag in both directions, so it needs no separate
            // goToScene() hook.
            scene10DiscEls.forEach(({ el }) => { el.style.opacity = liftT > 0 ? '1' : '0'; });
        }

        // Once resting on Scene 10, further forward scroll drives the 7 disc coins
        // moving up/down together (each along its own direction, all sharing one
        // progress value) — same "the scroll itself is the animation" idea as Scene
        // 8's sphinxes (applyScene8SphinxSlide) — but only once handed off from the
        // idle CSS bob loop (see .scene10-disc-wrap / scene10-disc-bob in
        // chapter2.css): an active CSS animation on `transform` silently wins over an
        // inline style.transform for the same property, same issue already solved for
        // Scene 1's coins above. Reversing before this reaches the threshold unwinds
        // it and hands control back to the CSS bob (see resetScene10DiscMove) instead
        // of committing.
        // Each disc travels a straight line from its CSS rest position until it fully
        // exits the frame, then reappears at the OPPOSITE edge and keeps flowing the
        // same direction — a true conveyor-belt loop. Clamped to exactly ONE loop (see
        // SCENE10_DISC_LOOP_THRESHOLD below), not an infinite repeat. Reversing un-loops
        // symmetrically back through that one crossing to exactly progress===0.
        let scene10DiscProgress = 0;

        // Disc's own rendered height in vh. width:8vw, aspect-ratio:578/577 => height ≈
        // 7.986vw; vw-to-vh depends on live viewport aspect ratio (not measured live —
        // no getBoundingClientRect() precedent for this in the file for this kind of
        // value; Scene 7's getScene7WordLines() measures wrapped *text* geometry, which
        // can't be derived any other way, a different problem). 15 comfortably covers
        // the common 16:9/16:10 desktop range with margin; tune live if needed on very
        // wide ultrawide monitors.
        const DISC_H_VH = 15;
        // Full cross-frame traversal length: 100vh of frame plus a full DISC_H_VH
        // margin on both the exit side and the reappear side, so a disc is always
        // comfortably (not just barely) invisible at the loop seam.
        const CYCLE_VH = 100 + 2 * DISC_H_VH;
        // px of wheel delta for one full CYCLE_VH loop of continuous disc travel
        // (~12.3px per vh) — paced similarly to SCENE9_EXIT_THRESHOLD's ~12px/vh
        // gearing for the Scene9->10 lift. This is also the hard cap on
        // scene10DiscProgress (see the sceneIndex===9 wheel branch below) — the user
        // wants exactly ONE loop, not an infinite repeat. Capping rawVh at exactly
        // CYCLE_VH is not arbitrary: since Y is periodic with period CYCLE_VH once past
        // exit0, and segment 0 (pre-exit) is just the same periodic function's first
        // slice, traveling exactly one full CYCLE_VH from rest always lands back at
        // y=restVh for every disc regardless of its own restVh/direction (re-derived
        // algebraically, not guessed) — so "one loop" naturally means "exit, reappear
        // from the opposite edge, and coast back to exactly its own rest position."
        const SCENE10_DISC_LOOP_THRESHOLD = 1600;

        // Gap of no wheel/touch ticks before a paused-mid-gesture disc starts idle-swaying
        // in place instead of sitting frozen — see startScene10DiscIdleSway below.
        const SCENE10_DISC_IDLE_DELAY_MS = 250;

        // Pure geometry, shared by applyScene10DiscMove (every tick) and
        // startScene10DiscIdleSway (once, to find the sway's center) — deliberately
        // extracted rather than duplicated, since this modulo/wrap math was re-derived
        // algebraically (not guessed) and a second, slightly-off copy would be very hard
        // to notice visually.
        function scene10DiscOffsetVh(rawVh, dir, restVh) {
            let y;
            if (dir > 0) {
                // moving down: exit0 = rawVh needed until the top edge clears
                // (100 + DISC_H_VH), i.e. the whole disc is comfortably below the frame
                const exit0 = (100 + DISC_H_VH) - restVh;
                if (rawVh <= exit0) {
                    y = restVh + rawVh;
                } else {
                    // looped past the bottom — reappear just above the top edge
                    // (opposite edge from where it exited) and keep flowing down
                    const cyclePos = (rawVh - exit0) % CYCLE_VH;
                    y = -DISC_H_VH + cyclePos;
                }
            } else {
                // moving up: exit0 = rawVh needed until the top edge clears -DISC_H_VH,
                // i.e. the whole disc is comfortably above the frame
                const exit0 = restVh + DISC_H_VH;
                if (rawVh <= exit0) {
                    y = restVh - rawVh;
                } else {
                    // looped past the top — reappear just below the bottom edge
                    // and keep flowing up
                    const cyclePos = (rawVh - exit0) % CYCLE_VH;
                    y = (100 + DISC_H_VH) - cyclePos;
                }
            }
            // The wrap's own CSS top/bottom already positions it at restVh; the caller
            // adds this as the additional transform offset on top of that rest position.
            return y - restVh;
        }

        function applyScene10DiscMove() {
            updateScrollDebug('scene10-disc', scene10DiscProgress, SCENE10_DISC_LOOP_THRESHOLD);
            const rawVh = (scene10DiscProgress / SCENE10_DISC_LOOP_THRESHOLD) * CYCLE_VH;
            scene10DiscEls.forEach(({ el, dir, restVh }) => {
                el.style.animation = 'none'; // release from the idle CSS bob loop
                el.style.transform = `translateY(${scene10DiscOffsetVh(rawVh, dir, restVh)}vh)`;
            });
            armScene10DiscIdleSway();
        }

        // Hands control back to the CSS idle-bob loop once the drag fully unwinds back
        // to 0 — mirrors resetScene1CoinRotation's rest-state handoff above. No geometry
        // changes needed here: at progress===0, every disc's y-restVh is 0 regardless of
        // how many loop cycles it has been through, so clearing the inline style and
        // letting CSS's own top/bottom rest position take back over is exactly correct.
        function resetScene10DiscMove() {
            stopScene10DiscIdleSway();
            scene10DiscProgress = 0;
            scene10DiscEls.forEach(({ el }) => {
                el.style.animation = '';
                el.style.transform = '';
            });
        }

        // Once the discs stop receiving fresh wheel/touch ticks for
        // SCENE10_DISC_IDLE_DELAY_MS, they resume a small continuous sway centered on
        // wherever scene10DiscProgress last left them (NOT restVh) instead of sitting
        // frozen — armed on every applyScene10DiscMove() tick, canceled the instant a
        // new tick arrives or the drag fully unwinds back to the CSS bob. This is the
        // first requestAnimationFrame/idle-timer use in this file — everything else here
        // is purely event-driven off wheel ticks — because it's the only way to animate
        // continuously starting from an arbitrary scroll-driven position without a jump.
        let scene10DiscIdleTimer = null;
        let scene10DiscIdleRafId = null;

        function stopScene10DiscIdleSway() {
            if (scene10DiscIdleTimer !== null) { clearTimeout(scene10DiscIdleTimer); scene10DiscIdleTimer = null; }
            if (scene10DiscIdleRafId !== null) { cancelAnimationFrame(scene10DiscIdleRafId); scene10DiscIdleRafId = null; }
        }

        function armScene10DiscIdleSway() {
            stopScene10DiscIdleSway();
            scene10DiscIdleTimer = setTimeout(startScene10DiscIdleSway, SCENE10_DISC_IDLE_DELAY_MS);
        }

        function startScene10DiscIdleSway() {
            scene10DiscIdleTimer = null;
            const rawVh = (scene10DiscProgress / SCENE10_DISC_LOOP_THRESHOLD) * CYCLE_VH;
            const baseOffsets = scene10DiscEls.map(({ dir, restVh }) => scene10DiscOffsetVh(rawVh, dir, restVh));
            const startTime = performance.now();
            function frame(now) {
                const elapsed = now - startTime;
                scene10DiscEls.forEach(({ el, idleAmplitudeVh, idlePeriodMs }, i) => {
                    const wobble = Math.sin((elapsed / idlePeriodMs) * Math.PI * 2) * idleAmplitudeVh;
                    el.style.transform = `translateY(${baseOffsets[i] + wobble}vh)`;
                });
                scene10DiscIdleRafId = requestAnimationFrame(frame);
            }
            scene10DiscIdleRafId = requestAnimationFrame(frame);
        }

        scene6HitboxSledgeEl.addEventListener('click', () => {
            scene6PopupSledgeEl.classList.toggle('show');
        });

        // Whole-span getBoundingClientRect() breaks down for Thai: its .scene4-word
        // chunks are long (space-delimited phrase clusters, not single words) and
        // routinely wrap across several visual lines inside one span. The bounding
        // box of a wrapped span is the *union* of all those lines, collapsing to one
        // point near the paragraph's horizontal middle instead of tracking the text.
        // Range.getClientRects() instead returns one rect per visual line fragment,
        // so English still yields one waypoint per word while wrapped Thai chunks
        // yield one correctly-placed waypoint per line they actually span.
        function getScene4LineFragmentsFrom(wordEls) {
            const sceneRect = scene4El.getBoundingClientRect();
            const fragments = [];
            wordEls.forEach((el, wordIndex) => {
                const range = document.createRange();
                range.selectNodeContents(el);
                Array.from(range.getClientRects()).forEach((r) => {
                    fragments.push({
                        wordIndex,
                        x: r.left - sceneRect.left + r.width / 2,
                        y: r.top - sceneRect.top + r.height / 2,
                    });
                });
            });
            return exaggerateScene4LineX(fragments);
        }

        // Every fragment stays exactly on its real word/line position (accurate
        // tracking took priority after earlier attempts that stretched — and
        // therefore misaligned — every word along the line). The only exaggeration
        // is a fixed rightward nudge on the *last* fragment of each line, right
        // before the feather drops to the next line, so every line reads as a
        // clear left-to-right sweep instead of a flat/vertical drift.
        const SCENE4_LINE_END_PUSH = 100; // px nudge applied at the end of every line
        const SCENE4_LINE2_EXTRA_END_PUSH = 60; // px on top of the above, only for the 2nd line (index 1)
        const SCENE4_LINE_Y_TOLERANCE = 8; // px; fragments within this band count as the same line

        function exaggerateScene4LineX(fragments) {
            let lineY = null;
            let lineIndex = -1;
            const grouped = fragments.map((f) => {
                if (lineY === null || Math.abs(f.y - lineY) > SCENE4_LINE_Y_TOLERANCE) {
                    lineY = f.y;
                    lineIndex++;
                }
                return { wordIndex: f.wordIndex, x: f.x, y: f.y, lineIndex };
            });
            return grouped.map((f, i) => {
                const isLastInLine = i === grouped.length - 1 || grouped[i + 1].lineIndex !== f.lineIndex;
                const push = isLastInLine
                    ? SCENE4_LINE_END_PUSH + (f.lineIndex === 1 ? SCENE4_LINE2_EXTRA_END_PUSH : 0)
                    : 0;
                return { wordIndex: f.wordIndex, x: f.x + push, y: f.y };
            });
        }

        function applyScene4FeatherTransform() {
            updateScrollDebug('scene4-feather', scene4FeatherProgress, SCENE4_FEATHER_THRESHOLD);
            const wordEls = Array.from(scene4BodyEl.querySelectorAll('.scene4-word'));
            const fragments = getScene4LineFragmentsFrom(wordEls);
            if (!fragments.length) return;
            const t = scene4FeatherProgress / SCENE4_FEATHER_THRESHOLD;
            const scaled = t * (fragments.length - 1);
            const i0 = Math.floor(scaled);
            const i1 = Math.min(fragments.length - 1, i0 + 1);
            const localT = scaled - i0;
            const x = fragments[i0].x + (fragments[i1].x - fragments[i0].x) * localT;
            const y = fragments[i0].y + (fragments[i1].y - fragments[i0].y) * localT;
            scene4FeatherEl.style.left = `${x}px`;
            scene4FeatherEl.style.top = `${y}px`;

            // Reveal the caption progressively as the feather reaches each word,
            // fading words back out again on a reverse (retrace) gesture.
            const currentWordIndex = fragments[Math.round(scaled)].wordIndex;
            wordEls.forEach((el, i) => {
                el.classList.toggle('is-revealed', i <= currentWordIndex);
            });
        }

        function enterScene4Forward() {
            scene4FeatherProgress = 0;
            scene4SphinxProgress = 0;
            scene4ExitProgress = 0;
            scene5PharaohProgress = 0;
            // Arrived at Scene 4 — the Scene 3<->4 lift is fully behind us, parked at
            // its "arrived here" rest value so a return gesture has something to pull
            // down from (mirrors scene2GlyphProgress's convention on Scene 3 arrival).
            scene3ExitProgress = SCENE3_EXIT_THRESHOLD;
            scene4FeatherEl.style.left = ''; // back to its decorative CSS rest spot near the title
            scene4FeatherEl.style.top = '';
            scene4BodyEl.querySelectorAll('.scene4-word.is-revealed').forEach((el) => {
                el.classList.remove('is-revealed'); // words persist across visits; hide them again
            });
            scene4SphinxEl.style.transform = ''; // back to its default (hidden-left) CSS position
            applyScene5PharaohSlide(0); // nemes figures parked off-screen, ready for the post-arrival slide-in gesture
            scene4ScrollEl.classList.remove('is-unfurling');
            void scene4ScrollEl.offsetWidth; // force reflow so the animation restarts if replayed
            scene4ScrollEl.classList.add('is-unfurling');
            scene4Unfurling = true;
        }

        function enterScene4Backward() {
            scene4Unfurling = false;
            // Still on the Scene-4 side of the Scene 3<->4 lift, same as forward entry.
            scene3ExitProgress = SCENE3_EXIT_THRESHOLD;
            // Resuming an already-fully-read Scene 4 — feather and sphinx park at
            // their "fully forward" state immediately (mirrors Scene 2/3's glyphs
            // staying parked at their fully-exited rest value), so a return gesture
            // pulls the sphinx back out first, then retraces the feather.
            scene4FeatherProgress = SCENE4_FEATHER_THRESHOLD;
            applyScene4FeatherTransform();
            scene4SphinxProgress = SCENE4_SPHINX_THRESHOLD;
            applyScene4SphinxTransform();
            // Exit-lift is different: unlike feather/sphinx (self-contained elements),
            // it drives the *shared* track, and Scene 4's own rest position (-300vh,
            // just snapped to by goToScene) already **is** its "0" state — parking it
            // at max here would fight the snap that just happened and immediately
            // yank the track back toward Scene 5 on the very next tick.
            scene4ExitProgress = 0;
            scene5PharaohProgress = 0;
            applyScene5PharaohSlide(0); // nemes figures parked off-screen, ready for the post-arrival slide-in gesture
        }

        function enterScene11Forward() {
            scene11TextEl.classList.remove('is-entering');
            void scene11TextEl.offsetWidth; // force reflow so the fade-in replays every arrival, not just the first
            scene11TextEl.classList.add('is-entering');
        }

        function enterScene11Backward() {
            scene11TextEl.classList.remove('is-entering'); // reset to hidden, ready to fade in again next time
        }

        scene4ScrollEl.addEventListener('animationend', (e) => {
            if (e.animationName !== 'scene4-scroll-unfurl') return;
            scene4Unfurling = false;
        });

        function handleScene4Boundary(e) {
            if (scene4Unfurling) return;

            // A return-to-Scene-3 gesture is mid-flight whenever scene3ExitProgress
            // isn't sitting at its "arrived at Scene 4" rest value; it takes top
            // priority over everything below, same idea as the Scene 2/3 boundary.
            if (scene3ExitProgress !== SCENE3_EXIT_THRESHOLD) {
                scene3ExitProgress = Math.max(0, Math.min(SCENE3_EXIT_THRESHOLD, scene3ExitProgress + e.deltaY));
                applyScene3Exit();
                if (scene3ExitProgress <= 0) goToScene(2);
                return;
            }

            // Whichever phase already has live progress keeps priority, so reversing
            // mid-gesture unwinds it instead of fighting an earlier phase (same idea
            // as handleScene2Boundary above). Order: exit-lift, then sphinx, then the
            // feather trace — mirroring the forward order they're completed in.
            if (scene4ExitProgress > 0) {
                scene4ExitProgress = Math.max(0, Math.min(SCENE4_EXIT_THRESHOLD, scene4ExitProgress + e.deltaY));
                applyScene4Exit();
                if (scene4ExitProgress >= SCENE4_EXIT_THRESHOLD) goToScene(4);
                return;
            }

            if (scene4SphinxProgress > 0) {
                scene4SphinxProgress = Math.max(0, Math.min(SCENE4_SPHINX_THRESHOLD, scene4SphinxProgress + e.deltaY));
                applyScene4SphinxTransform();
                if (scene4SphinxProgress >= SCENE4_SPHINX_THRESHOLD && e.deltaY > 0) {
                    scene4ExitProgress = Math.min(SCENE4_EXIT_THRESHOLD, e.deltaY);
                    applyScene4Exit();
                    if (scene4ExitProgress >= SCENE4_EXIT_THRESHOLD) goToScene(4);
                }
                return;
            }

            scene4FeatherProgress = Math.max(0, Math.min(SCENE4_FEATHER_THRESHOLD, scene4FeatherProgress + e.deltaY));
            applyScene4FeatherTransform();
            if (scene4FeatherProgress >= SCENE4_FEATHER_THRESHOLD && e.deltaY > 0) {
                scene4SphinxProgress = Math.min(SCENE4_SPHINX_THRESHOLD, e.deltaY);
                applyScene4SphinxTransform();
            } else if (scene4FeatherProgress <= 0 && e.deltaY < 0) {
                // Fresh return-gesture start into Scene 3 (was an instant goToScene(2)).
                scene3ExitProgress = Math.max(0, SCENE3_EXIT_THRESHOLD + e.deltaY);
                applyScene3Exit();
                if (scene3ExitProgress <= 0) goToScene(2);
            }
        }

        function handleScene1Boundary(e) {
            const wantsForward = e.deltaY > 0;

            // A Scene-1-to-2 lift gesture is mid-flight whenever scene1ExitProgress
            // isn't sitting at rest (0); it takes top priority over everything below,
            // same idea as the Scene 3/4, Scene 4/5, and Scene 5/6 boundaries above.
            if (sceneIndex === 0 && scene1ExitProgress > 0) {
                scene1ExitProgress = Math.max(0, Math.min(SCENE1_EXIT_THRESHOLD, scene1ExitProgress + e.deltaY));
                applyScene1Exit();
                if (scene1ExitProgress >= SCENE1_EXIT_THRESHOLD) goToScene(1);
                return;
            }

            if (sceneIndex === 0 && wantsForward) {
                scene1CoinProgress = Math.min(SCENE1_COIN_THRESHOLD, scene1CoinProgress + e.deltaY);
                applyScene1CoinRotation();
                if (scene1CoinProgress >= SCENE1_COIN_THRESHOLD) {
                    // Coin spin-up has fully played out — hand off any leftover wheel
                    // delta into a fresh continuous lift into Scene 2 (was an instant
                    // goToScene(1) snap), same handoff idea as the sphinx->exit /
                    // pharaoh->exit transitions elsewhere in this file.
                    resetScene1CoinRotation();
                    scene1ExitProgress = Math.min(SCENE1_EXIT_THRESHOLD, e.deltaY);
                    applyScene1Exit();
                    if (scene1ExitProgress >= SCENE1_EXIT_THRESHOLD) goToScene(1);
                }
                return;
            }

            if (sceneIndex === 1) {
                handleScene2Boundary(e);
                return;
            }

            // sceneIndex === 0, scrolling up: nothing before Scene 1, true no-op.
            resetScene1CoinRotation();
        }

        // Resting on Scene 2: scrolling up continues/starts the lift-down
        // return-to-Scene-1 gesture; scrolling down continues/starts the glyph
        // roll-away-to-Scene-3 gesture. Whichever already has live progress keeps
        // priority, so reversing mid-gesture unwinds it instead of fighting the
        // other boundary.
        function handleScene2Boundary(e) {
            // A return-to-Scene-1 lift-down gesture is mid-flight whenever
            // scene1ExitProgress isn't sitting at its "fully arrived here" rest
            // value (SCENE1_EXIT_THRESHOLD); same idea as the Scene 3/4, Scene 4/5,
            // and Scene 5/6 boundaries above — drag continuously instead of
            // snapping instantly on the first up-tick.
            if (scene1ExitProgress !== SCENE1_EXIT_THRESHOLD) {
                scene1ExitProgress = Math.max(0, Math.min(SCENE1_EXIT_THRESHOLD, scene1ExitProgress + e.deltaY));
                applyScene1Exit();
                if (scene1ExitProgress <= 0) goToScene(0);
                return;
            }

            if (scene2GlyphProgress > 0) {
                scene2GlyphProgress = Math.max(0, Math.min(SCENE2_GLYPH_THRESHOLD, scene2GlyphProgress + e.deltaY));
                applyScene2GlyphTransform();
                if (scene2GlyphProgress >= SCENE2_GLYPH_THRESHOLD) goToScene(2);
                return;
            }

            if (e.deltaY < 0) {
                // Fresh return-gesture start into Scene 1 (was an instant goToScene(0)).
                scene1ExitProgress = Math.max(0, SCENE1_EXIT_THRESHOLD + e.deltaY);
                applyScene1Exit();
                if (scene1ExitProgress <= 0) goToScene(0);
            } else if (e.deltaY > 0) {
                scene2GlyphProgress = Math.min(SCENE2_GLYPH_THRESHOLD, e.deltaY);
                applyScene2GlyphTransform();
                if (scene2GlyphProgress >= SCENE2_GLYPH_THRESHOLD) goToScene(2);
            }
        }

        function goToSubSlide(newIndex) {
            if (subTransitioning || newIndex === scene3SlideIndex) return;
            subTransitioning = true;
            scene3SlideIndex = newIndex;
            scene3TrackEl.classList.toggle('scene3-show-2', scene3SlideIndex === 1);
            updateScene3Caption();

            setTimeout(() => {
                subTransitioning = false;
            }, SUB_TRANSITION_MS);
        }

        // Native scroll is fully disabled (overflow: hidden), so every wheel/touch
        // tick is handled here — one tick is one page-step attempt, no accumulation
        // at the outer scene level (Scene 3's sub-slide keeps its own accumulator).
        function handleWheel(e) {
            e.preventDefault();
            if (sceneTransitioning) return;

            if (sceneIndex === 2) {
                if (subTransitioning) return;

                // A return-to-Scene-2 gesture is mid-flight whenever glyph
                // progress isn't sitting at its "fully exited" rest value; it
                // takes priority over normal carousel scrolling until resolved.
                if (scene2GlyphProgress !== SCENE2_GLYPH_THRESHOLD) {
                    scene2GlyphProgress = Math.max(0, Math.min(SCENE2_GLYPH_THRESHOLD, scene2GlyphProgress + e.deltaY));
                    applyScene2GlyphTransform();
                    if (scene2GlyphProgress <= 0) {
                        subScrollProgress = 0;
                        goToScene(1);
                    }
                    return;
                }

                // A Scene-3-to-4 lift gesture is mid-flight whenever scene3ExitProgress
                // isn't sitting at rest (0); it takes priority over normal carousel
                // scrolling until resolved, same idea as the check above.
                if (scene3ExitProgress > 0) {
                    scene3ExitProgress = Math.max(0, Math.min(SCENE3_EXIT_THRESHOLD, scene3ExitProgress + e.deltaY));
                    applyScene3Exit();
                    if (scene3ExitProgress >= SCENE3_EXIT_THRESHOLD) {
                        subScrollProgress = 0;
                        goToScene(3);
                    }
                    return;
                }

                if (e.deltaY > 0) {
                    if (scene3SlideIndex === 0) {
                        subScrollProgress += e.deltaY;
                        updateScrollDebug('scene3-sub', subScrollProgress, SUB_ADVANCE_DISTANCE);
                        if (subScrollProgress >= SUB_ADVANCE_DISTANCE) {
                            subScrollProgress = 0;
                            goToSubSlide(1);
                        }
                    } else {
                        // Fresh forward-lift start into Scene 4 (was an instant goToScene(3)).
                        scene3ExitProgress = Math.min(SCENE3_EXIT_THRESHOLD, e.deltaY);
                        applyScene3Exit();
                        if (scene3ExitProgress >= SCENE3_EXIT_THRESHOLD) {
                            subScrollProgress = 0;
                            goToScene(3);
                        }
                    }
                } else if (e.deltaY < 0) {
                    if (scene3SlideIndex === 1) {
                        subScrollProgress += -e.deltaY;
                        updateScrollDebug('scene3-sub', subScrollProgress, SUB_ADVANCE_DISTANCE);
                        if (subScrollProgress >= SUB_ADVANCE_DISTANCE) {
                            subScrollProgress = 0;
                            goToSubSlide(0);
                        }
                    } else {
                        // Fresh return-gesture start (was an instant goToScene(1)).
                        scene2GlyphProgress = Math.max(0, SCENE2_GLYPH_THRESHOLD + e.deltaY);
                        applyScene2GlyphTransform();
                        if (scene2GlyphProgress <= 0) {
                            subScrollProgress = 0;
                            goToScene(1);
                        }
                    }
                }
                return;
            }

            if (sceneIndex === 0 || sceneIndex === 1) {
                handleScene1Boundary(e);
                return;
            }

            if (sceneIndex === 3) {
                handleScene4Boundary(e);
                return;
            }

            if (sceneIndex === 4) {
                // A Scene-5-to-6 lift gesture is mid-flight whenever scene5ExitProgress
                // isn't sitting at rest (0); it takes top priority over everything below,
                // same idea as the Scene 3/4 and Scene 4/5 boundaries above.
                if (scene5ExitProgress > 0) {
                    scene5ExitProgress = Math.max(0, Math.min(SCENE5_EXIT_THRESHOLD, scene5ExitProgress + e.deltaY));
                    applyScene5Exit();
                    if (scene5ExitProgress >= SCENE5_EXIT_THRESHOLD) goToScene(5);
                    return;
                }

                // A pharaoh-slide-in gesture takes priority whenever it has live
                // progress — reversing mid-gesture unwinds it first instead of
                // fighting the exit-lift return below, same priority idea as the
                // Scene 2/3 and Scene 3/4 boundaries above. Once it fully plays out,
                // the very next forward tick starts the continuous lift into Scene 6
                // (was an instant goToScene(5) snap), same idea as the sphinx-to-exit
                // handoff in handleScene4Boundary above.
                if (scene5PharaohProgress > 0) {
                    scene5PharaohProgress = Math.max(0, Math.min(SCENE5_PHARAOH_THRESHOLD, scene5PharaohProgress + e.deltaY));
                    applyScene5PharaohSlide(scene5PharaohProgress / SCENE5_PHARAOH_THRESHOLD);
                    if (scene5PharaohProgress >= SCENE5_PHARAOH_THRESHOLD && e.deltaY > 0) {
                        scene5ExitProgress = Math.min(SCENE5_EXIT_THRESHOLD, e.deltaY);
                        applyScene5Exit();
                        if (scene5ExitProgress >= SCENE5_EXIT_THRESHOLD) goToScene(5);
                    }
                    return;
                }

                // A return-to-Scene-4 gesture is mid-flight whenever exit-lift progress
                // isn't sitting at its "fully arrived here" rest value; same idea as the
                // Scene 2/3 and Scene 3/4 boundaries above — drag continuously instead
                // of snapping instantly on the first up-tick.
                if (scene4ExitProgress !== SCENE4_EXIT_THRESHOLD) {
                    scene4ExitProgress = Math.max(0, Math.min(SCENE4_EXIT_THRESHOLD, scene4ExitProgress + e.deltaY));
                    applyScene4Exit();
                    if (scene4ExitProgress <= 0) goToScene(3);
                    return;
                }

                if (e.deltaY < 0) {
                    // Fresh return-gesture start (was an instant goToScene(3)).
                    scene4ExitProgress = Math.max(0, SCENE4_EXIT_THRESHOLD + e.deltaY);
                    applyScene4Exit();
                    if (scene4ExitProgress <= 0) goToScene(3);
                } else if (e.deltaY > 0) {
                    // Fresh forward pharaoh-slide-in start — the *next* scroll after
                    // already resting fully on Scene 5, distinct from the exit-lift
                    // drag that arrived here (was previously coupled to that drag).
                    scene5PharaohProgress = Math.min(SCENE5_PHARAOH_THRESHOLD, e.deltaY);
                    applyScene5PharaohSlide(scene5PharaohProgress / SCENE5_PHARAOH_THRESHOLD);
                }
                return;
            }

            if (sceneIndex === 5) {
                // Forward scroll immediately starts the continuous lift into
                // Scene 7 (was an instant goToScene(6) snap) — no separate
                // arm-wave warm-up stage required first anymore. A return
                // gesture from full rest continuously drags the track back
                // down into Scene 5 (was an instant goToScene(4) snap), same
                // idea as the Scene 4/5 return-drag above.
                scene6PopupSledgeEl.classList.remove('show');

                if (scene5ExitProgress !== SCENE5_EXIT_THRESHOLD) {
                    scene5ExitProgress = Math.max(0, Math.min(SCENE5_EXIT_THRESHOLD, scene5ExitProgress + e.deltaY));
                    applyScene5Exit();
                    if (scene5ExitProgress <= 0) goToScene(4);
                    return;
                }

                if (scene6ExitProgress > 0 || e.deltaY > 0) {
                    scene6ExitProgress = Math.max(0, Math.min(SCENE6_EXIT_THRESHOLD, scene6ExitProgress + e.deltaY));
                    applyScene6Exit();
                    applyScene6Transform(scene6ExitProgress / SCENE6_EXIT_THRESHOLD);
                    if (scene6ExitProgress >= SCENE6_EXIT_THRESHOLD) goToScene(6);
                    return;
                }

                // Fresh return-gesture start into Scene 5 (was an instant goToScene(4)).
                scene5ExitProgress = Math.max(0, SCENE5_EXIT_THRESHOLD + e.deltaY);
                applyScene5Exit();
                if (scene5ExitProgress <= 0) goToScene(4);
                return;
            }

            if (sceneIndex === 6) {
                // A return gesture continuously drags the track back down into Scene 6
                // (was an instant goToScene(5) snap), same idea as the Scene 5/6
                // return-drag above.
                if (scene6ExitProgress !== SCENE6_EXIT_THRESHOLD) {
                    scene6ExitProgress = Math.max(0, Math.min(SCENE6_EXIT_THRESHOLD, scene6ExitProgress + e.deltaY));
                    applyScene6Exit();
                    if (scene6ExitProgress <= 0) goToScene(5);
                    return;
                }

                // A Scene-7-to-8 lift gesture is mid-flight whenever scene7ExitProgress
                // isn't sitting at rest (0) — takes priority over the title-tilt/
                // text-reveal phases below; reversing mid-gesture unwinds it first,
                // same priority idea as the Scene 4/5 and Scene 5/6 boundaries above.
                if (scene7ExitProgress > 0) {
                    scene7ExitProgress = Math.max(0, Math.min(SCENE7_EXIT_THRESHOLD, scene7ExitProgress + e.deltaY));
                    applyScene7Exit();
                    if (scene7ExitProgress >= SCENE7_EXIT_THRESHOLD) goToScene(7);
                    return;
                }

                // Forward scroll only starts counting title-drop ticks once scene7-text has
                // fully faded in; reversing un-tilts the title first (if any ticks are
                // live), then un-reveals the text, then resumes the Scene 7->6 return-drag —
                // same priority idea as the Scene 4/5 boundary above.
                if (scene7TitleScrollTicks > 0 || (e.deltaY > 0 && scene7TextProgress >= SCENE7_TEXT_THRESHOLD)) {
                    if (scene7TitleScrollTicks >= SCENE7_TITLE_TICK_THRESHOLD && e.deltaY > 0) {
                        // Title has fully dropped — hand off further forward scroll into
                        // the continuous lift toward Scene 8 (was an uncapped, do-nothing
                        // tick counter past this point).
                        scene7ExitProgress = Math.min(SCENE7_EXIT_THRESHOLD, e.deltaY);
                        applyScene7Exit();
                        if (scene7ExitProgress >= SCENE7_EXIT_THRESHOLD) goToScene(7);
                        return;
                    }
                    scene7TitleScrollTicks = Math.max(0, scene7TitleScrollTicks + (e.deltaY > 0 ? 1 : -1));
                    applyScene7TitleTilt();
                    return;
                }

                if (scene7TextProgress > 0 || e.deltaY > 0) {
                    scene7TextProgress = Math.max(0, Math.min(SCENE7_TEXT_THRESHOLD, scene7TextProgress + e.deltaY));
                    applyScene7TextReveal();
                    return;
                }

                if (e.deltaY < 0) {
                    scene6ExitProgress = Math.max(0, SCENE6_EXIT_THRESHOLD + e.deltaY);
                    applyScene6Exit();
                    if (scene6ExitProgress <= 0) goToScene(5);
                }
                return;
            }

            if (sceneIndex === 7) {
                // A Scene-7-to-8 lift gesture is mid-flight whenever scene7ExitProgress
                // isn't sitting at its "fully arrived here" rest value — drag
                // continuously instead of snapping instantly, same idea as the Scene
                // 5/6 and Scene 6/7 boundaries above.
                if (scene7ExitProgress !== SCENE7_EXIT_THRESHOLD) {
                    scene7ExitProgress = Math.max(0, Math.min(SCENE7_EXIT_THRESHOLD, scene7ExitProgress + e.deltaY));
                    applyScene7Exit();
                    if (scene7ExitProgress <= 0) goToScene(6);
                    return;
                }

                // A Scene-8-to-9 lift gesture is mid-flight whenever scene8ExitProgress
                // isn't sitting at rest (0) — takes priority over the sphinx slide.
                if (scene8ExitProgress > 0) {
                    scene8ExitProgress = Math.max(0, Math.min(SCENE8_EXIT_THRESHOLD, scene8ExitProgress + e.deltaY));
                    applyScene8Exit();
                    if (scene8ExitProgress >= SCENE8_EXIT_THRESHOLD) goToScene(8);
                    return;
                }

                // Forward scroll slides the two sphinx statues apart, and once fully
                // apart, hands off to the continuous lift toward Scene 9.
                if (scene8SphinxProgress > 0 || e.deltaY > 0) {
                    scene8SphinxProgress = Math.max(0, Math.min(SCENE8_SPHINX_THRESHOLD, scene8SphinxProgress + e.deltaY));
                    applyScene8SphinxSlide(scene8SphinxProgress / SCENE8_SPHINX_THRESHOLD);
                    if (scene8SphinxProgress >= SCENE8_SPHINX_THRESHOLD && e.deltaY > 0) {
                        scene8ExitProgress = Math.min(SCENE8_EXIT_THRESHOLD, e.deltaY);
                        applyScene8Exit();
                        if (scene8ExitProgress >= SCENE8_EXIT_THRESHOLD) goToScene(8);
                    }
                    return;
                }
                
                if (e.deltaY < 0) {
                    scene7ExitProgress = Math.max(0, SCENE7_EXIT_THRESHOLD + e.deltaY);
                    applyScene7Exit();
                    if (scene7ExitProgress <= 0) goToScene(6);
                }
                return;
            }


            if (sceneIndex === 8) {
                // A return gesture continuously drags the track back down into Scene 8.
                if (scene8ExitProgress !== SCENE8_EXIT_THRESHOLD) {
                    scene8ExitProgress = Math.max(0, Math.min(SCENE8_EXIT_THRESHOLD, scene8ExitProgress + e.deltaY));
                    applyScene8Exit();
                    if (scene8ExitProgress <= 0) goToScene(7);
                    return;
                }

                // A Scene-9-to-10 lift gesture is mid-flight whenever scene9ExitProgress
                // isn't sitting at rest (0) — takes priority over a fresh gesture below,
                // same idea as the Scene 7/8 and Scene 8/9 boundaries above.
                if (scene9ExitProgress > 0) {
                    scene9ExitProgress = Math.max(0, Math.min(SCENE9_EXIT_THRESHOLD, scene9ExitProgress + e.deltaY));
                    applyScene9Exit();
                    if (scene9ExitProgress >= SCENE9_EXIT_THRESHOLD) goToScene(9);
                    return;
                }

                if (e.deltaY < 0) {
                    scene8ExitProgress = Math.max(0, SCENE8_EXIT_THRESHOLD + e.deltaY);
                    applyScene8Exit();
                    if (scene8ExitProgress <= 0) goToScene(7);
                } else if (e.deltaY > 0) {
                    // Fresh forward-lift start into Scene 10 — was a true dead end before this
                    // change. No gated sub-stage first (unlike Scene 7/8's title-tilt/sphinx-slide)
                    // since Scene 10 has no scroll-driven content of its own.
                    scene9ExitProgress = Math.min(SCENE9_EXIT_THRESHOLD, e.deltaY);
                    applyScene9Exit();
                    if (scene9ExitProgress >= SCENE9_EXIT_THRESHOLD) goToScene(9);
                }
                return;
            }

            if (sceneIndex === 9) {
                // The 7 disc coins have their own scroll-driven move gesture once fully
                // arrived here — see applyScene10DiscMove. Exactly one loop (clamped at
                // SCENE10_DISC_LOOP_THRESHOLD, which lands the disc back at its own rest
                // position — see the comment on that constant), not an infinite repeat. A
                // live disc-move gesture takes top priority, same idea as
                // scene5PharaohProgress in the sceneIndex===4 branch above: reversing
                // mid-gesture unwinds the discs (through the one loop, if it got that far)
                // first instead of fighting the return-to-Scene-9 drag below.
                if (scene10DiscProgress > 0) {
                    // The loop already finished and is sitting at rest — the next forward
                    // scroll advances into Scene 11 instead of re-applying the same rest
                    // position forever (was a true dead end before this change).
                    if (scene10DiscProgress >= SCENE10_DISC_LOOP_THRESHOLD && e.deltaY > 0) {
                        goToScene(10);
                        return;
                    }
                    scene10DiscProgress = Math.max(0, Math.min(SCENE10_DISC_LOOP_THRESHOLD, scene10DiscProgress + e.deltaY));
                    if (scene10DiscProgress <= 0) {
                        resetScene10DiscMove();
                    } else {
                        applyScene10DiscMove();
                    }
                    return;
                }

                // A return gesture continuously drags the track back down into Scene 9.
                if (scene9ExitProgress !== SCENE9_EXIT_THRESHOLD) {
                    scene9ExitProgress = Math.max(0, Math.min(SCENE9_EXIT_THRESHOLD, scene9ExitProgress + e.deltaY));
                    applyScene9Exit();
                    if (scene9ExitProgress <= 0) goToScene(8);
                    return;
                }

                if (e.deltaY < 0) {
                    scene9ExitProgress = Math.max(0, SCENE9_EXIT_THRESHOLD + e.deltaY);
                    applyScene9Exit();
                    if (scene9ExitProgress <= 0) goToScene(8);
                } else if (e.deltaY > 0) {
                    // Fresh forward disc-move start — the *next* scroll after already
                    // resting fully on Scene 10 (was a true dead end before this change).
                    scene10DiscProgress = Math.min(SCENE10_DISC_LOOP_THRESHOLD, e.deltaY);
                    applyScene10DiscMove();
                }
                return;
            }

            subScrollProgress = 0;
            if (e.deltaY > 0) {
                goToScene(sceneIndex + 1);
            } else if (e.deltaY < 0) {
                goToScene(sceneIndex - 1);
            }
        }

        window.addEventListener('wheel', handleWheel, { passive: false });

        // Touch devices never fire 'wheel' events, and overflow: hidden disables
        // native touch-scroll too, so swipe has to be routed through the same logic.
        const TOUCH_THRESHOLD = 40;
        let touchStartY = null;

        function handleTouchStart(e) {
            touchStartY = e.touches[0].clientY;
        }

        function handleTouchMove(e) {
            if (touchStartY === null) return;
            const diffY = touchStartY - e.touches[0].clientY;
            if (Math.abs(diffY) > TOUCH_THRESHOLD) {
                touchStartY = e.touches[0].clientY;
                handleWheel({ deltaY: diffY, preventDefault: () => e.preventDefault() });
            }
        }

        function handleTouchEnd() {
            touchStartY = null;
        }

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
});
