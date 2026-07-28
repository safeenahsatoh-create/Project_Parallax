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

    function render(lang) {
        renderScene1(lang);
        renderScene2(lang);
        renderScene3(lang);
        renderScene4(lang);
        renderScene5(lang);
        renderScene6(lang);
        renderScene7(lang);
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
        const scene6Liver2El = document.querySelector('.layer-liver-2');
        const scene6HitboxSledgeEl = document.getElementById('hitbox-sledge');
        const scene6PopupSledgeEl = document.getElementById('popup-sledge');

        const SCENE_COUNT = 7;
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
            const liftT = scene5ExitProgress / SCENE5_EXIT_THRESHOLD;
            trackEl.style.transition = liftT > 0 ? 'none' : '';
            trackEl.style.transform = `translateY(-${400 + liftT * 100}vh)`; // 400vh = Scene 5's own resting position (sceneIndex 4 * 100vh)
            scene6TextEl.style.opacity = liftT; // fades in/out 1:1 with the drag itself, same "scroll is the animation" idea as the position above
        }

        // Scene 6 (last scene, no forward transition of its own): scrolling
        // continuously drives two independent things off one shared progress value —
        // the orator statue's arm waves the whole time (sine oscillation, not phase-
        // gated), while the second Liver of Piacenza instance rotates further
        // clockwise ("right") the more the user scrolls, on top of its static
        // rotate(-90deg) rest pose.
        let scene6Progress = 0;
        const SCENE6_THRESHOLD = 3000; // px of wheel delta for the full arm-wave + liver-rotate journey
        const ARM_WAVE_FREQ = 3; // full wave cycles across the whole Scene 6 scroll range
        const ARM_WAVE_AMPLITUDE_DEG = 18;
        const LIVER_ROTATE_DEG = 15; // clockwise rotation added on top of the -90deg rest pose

        function applyScene6Transform(t) {
            scene6ArmEl.style.transform = `rotate(${Math.sin(t * ARM_WAVE_FREQ * Math.PI * 2) * ARM_WAVE_AMPLITUDE_DEG}deg)`;
            scene6Liver2El.style.transform = `rotate(${-90 + t * LIVER_ROTATE_DEG}deg)`; // -90deg reproduced here since inline transform replaces the static CSS one
        }

        // Once the arm-wave/liver-rotate progress above is fully played out,
        // further forward scroll continuously lifts the track into Scene 7 —
        // same idea as Scene 4<->5's applyScene4Exit / Scene 5<->6's
        // applyScene5Exit above — instead of an instant goToScene(6) snap.
        let scene6ExitProgress = 0;
        const SCENE6_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift into Scene 7

        function applyScene6Exit() {
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
            const tilted = scene7TitleScrollTicks >= SCENE7_TITLE_TICK_THRESHOLD;
            scene7TitleWord2El.style.transform = tilted ? `rotate(${SCENE7_WORD2_TILT_DEG}deg)` : 'rotate(0deg)';
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
            const wordLines = getScene7WordLines();
            if (!wordLines.length) return;
            const numLines = wordLines[wordLines.length - 1].lineIndex + 1;
            const t = Math.max(0, Math.min(1, scene7TextProgress / SCENE7_TEXT_THRESHOLD));
            const linesRevealed = t * numLines;
            wordLines.forEach(({ el, lineIndex }) => {
                el.style.opacity = Math.max(0, Math.min(1, linesRevealed - lineIndex));
            });
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
                // Forward scroll drives the arm-wave/liver-rotate progress and clamps
                // at the end; once fully clamped, further forward scroll continuously
                // lifts the track into Scene 7 (was an instant goToScene(6) snap). A
                // return gesture from full rest (scene6Progress at 0) continuously
                // drags the track back down into Scene 5 (was an instant goToScene(4)
                // snap), same idea as the Scene 4/5 return-drag above.
                scene6PopupSledgeEl.classList.remove('show');

                if (scene5ExitProgress !== SCENE5_EXIT_THRESHOLD) {
                    scene5ExitProgress = Math.max(0, Math.min(SCENE5_EXIT_THRESHOLD, scene5ExitProgress + e.deltaY));
                    applyScene5Exit();
                    if (scene5ExitProgress <= 0) goToScene(4);
                    return;
                }

                // A Scene-6-to-7 lift gesture is mid-flight whenever scene6ExitProgress
                // isn't sitting at rest (0); it takes priority over the arm-wave/liver
                // progress below, same idea as the Scene 4/5 and Scene 5/6 boundaries.
                if (scene6ExitProgress > 0) {
                    scene6ExitProgress = Math.max(0, Math.min(SCENE6_EXIT_THRESHOLD, scene6ExitProgress + e.deltaY));
                    applyScene6Exit();
                    if (scene6ExitProgress >= SCENE6_EXIT_THRESHOLD) goToScene(6);
                    return;
                }

                if (scene6Progress >= SCENE6_THRESHOLD && e.deltaY > 0) {
                    // Fresh forward-lift start into Scene 7 (was an instant goToScene(6)).
                    scene6ExitProgress = Math.min(SCENE6_EXIT_THRESHOLD, e.deltaY);
                    applyScene6Exit();
                    if (scene6ExitProgress >= SCENE6_EXIT_THRESHOLD) goToScene(6);
                    return;
                }

                if (scene6Progress > 0 || e.deltaY > 0) {
                    scene6Progress = Math.max(0, Math.min(SCENE6_THRESHOLD, scene6Progress + e.deltaY));
                    applyScene6Transform(scene6Progress / SCENE6_THRESHOLD);
                    return;
                }

                // Fresh return-gesture start into Scene 5 (was an instant goToScene(4)).
                scene5ExitProgress = Math.max(0, SCENE5_EXIT_THRESHOLD + e.deltaY);
                applyScene5Exit();
                if (scene5ExitProgress <= 0) goToScene(4);
                return;
            }

            if (sceneIndex === 6) {
                // Scene 7 is the last scene — a return gesture continuously drags the
                // track back down into Scene 6 (was an instant goToScene(5) snap),
                // same idea as the Scene 5/6 return-drag above.
                if (scene6ExitProgress !== SCENE6_EXIT_THRESHOLD) {
                    scene6ExitProgress = Math.max(0, Math.min(SCENE6_EXIT_THRESHOLD, scene6ExitProgress + e.deltaY));
                    applyScene6Exit();
                    if (scene6ExitProgress <= 0) goToScene(5);
                    return;
                }

                // Forward scroll only starts counting title-drop ticks once scene7-text has
                // fully faded in; reversing un-tilts the title first (if any ticks are
                // live), then un-reveals the text, then resumes the Scene 7->6 return-drag —
                // same priority idea as the Scene 4/5 boundary above.
                if (scene7TitleScrollTicks > 0 || (e.deltaY > 0 && scene7TextProgress >= SCENE7_TEXT_THRESHOLD)) {
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
