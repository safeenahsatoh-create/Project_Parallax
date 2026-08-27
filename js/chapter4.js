document.addEventListener('DOMContentLoaded', () => {

    const trackEl = document.querySelector('.chapter4-track');
    const trainEl = document.getElementById('layer-train');
    const cloudLeftEl = document.getElementById('cloud-left');
    const cloudRightEl = document.getElementById('cloud-right');

    /* ===================== Language ===================== */
    // Short fixed labels carry their own copy in data-th / data-en (same convention as
    // chapter2.html); js/navbar.js dispatches 'langchange' when the TH/EN button is hit.
    function render(lang) {
        document.querySelectorAll('[data-th]').forEach((el) => {
            el.textContent = el.dataset[lang] || el.dataset.th;
            el.setAttribute('data-lang', lang);
        });
    }

    render(localStorage.getItem('lang') || 'th');
    window.addEventListener('langchange', (e) => render(e.detail.lang));

    /* ===================== Scene paging ===================== */
    // Scenes are 100vh siblings in one track, so scene N rests at translateY(-N * 100vh).
    // goToScene() is the only place sceneIndex changes, and it doubles as the enter-hook
    // dispatcher -- same shape as js/chapter2.js.
    const SCENE_COUNT = 2;
    const SCENE_TRANSITION_MS = 700; // keep in sync with .chapter4-track's CSS transition-duration

    let sceneIndex = 0;
    let sceneTransitioning = false;

    function goToScene(newIndex) {
        if (sceneTransitioning || newIndex < 0 || newIndex >= SCENE_COUNT || newIndex === sceneIndex) return;
        trackEl.style.transition = ''; // restore the CSS-driven snap; the exit drag disabled it
        if (newIndex === 1 && sceneIndex === 0) enterScene2Forward();
        if (newIndex === 0 && sceneIndex === 1) enterScene1Backward();
        sceneTransitioning = true;
        sceneIndex = newIndex;
        // Scene 1 is a light wall, Scene 2 a dark sky -- the fixed navbar has to invert with it.
        document.body.classList.toggle('ch4-dark-scene', sceneIndex >= 1);
        trackEl.style.transform = `translateY(-${sceneIndex * 100}vh)`;
        setTimeout(() => { sceneTransitioning = false; }, SCENE_TRANSITION_MS);
    }

    /* ===================== Scene 1 - train shrink ===================== */
    // Storyboard board 1 -> board 2: the train's visible bounds go from
    // (240,85)-(1590,1080) to roughly (90,430)-(950,1010) on the 1920x1080 reference,
    // i.e. the shrunken centre sits (-413px, +155px) off the full-size one. Those two px
    // offsets are the percentages below (of the train box's own size).
    // The train has two poses and no in-between: one scroll commits it from one to the
    // other and CSS animates the transform. It is deliberately NOT wheel-linked.
    let scene1TrainShrunk = false;
    let scene1TrainAnimating = false;
    const SCENE1_TRAIN_MS = 900;      // keep in sync with the transition on .layer-train
    // The resting pose deviates from board 1's full-bleed train on purpose -- it read as too
    // dominant, so it sits 10% down. Safe to shrink about the centre because the asset's bottom
    // is a soft fade (alpha tapers from row ~1020 and is gone by ~1071), not a hard crop, so
    // lifting it off the frame edge exposes no cut line. Keep in sync with .layer-train's
    // resting scale in css/chapter4.css, which is what shows for the first frame.
    const TRAIN_START_SCALE = 0.90;
    // Board 2's parked pose is untouched by the above: percentage translates resolve against the
    // *unscaled* box and scale() sits last in the transform list, so these three still land the
    // shrunken train exactly where the storyboard put it.
    const TRAIN_END_SCALE = 0.60;
    const TRAIN_END_X = -21.5;        // % of the train box's own width
    const TRAIN_END_Y = 14.3;         // % of its own height

    function applyScene1Train() {
        const t = scene1TrainShrunk ? 1 : 0;
        updateScrollDebug('scene1-train', t, 1);
        // An inline transform replaces the CSS resting one outright, so the -50%/-50%
        // centring has to be reproduced here.
        const x = -50 + TRAIN_END_X * t;
        const y = -50 + TRAIN_END_Y * t;
        const s = TRAIN_START_SCALE + (TRAIN_END_SCALE - TRAIN_START_SCALE) * t;
        trainEl.style.transform = `translate(${x}%, ${y}%) scale(${s})`;
    }

    // One mouse notch, one trackpad flick and one swipe each deliver a *burst* of wheel
    // events, so the lock is what makes a burst commit exactly once and swallows the
    // momentum tail -- same pairing goToScene() uses in js/chapter2.js.
    function commitScene1Train(shrunk) {
        if (scene1TrainAnimating || shrunk === scene1TrainShrunk) return;
        scene1TrainShrunk = shrunk;
        scene1TrainAnimating = true;
        applyScene1Train();
        setTimeout(() => { scene1TrainAnimating = false; }, SCENE1_TRAIN_MS);
    }

    /* ===================== Scene 1 -> 2 - exit lift ===================== */
    // Unlike the train above, the handoff into Scene 2 is dragged, not committed: the track
    // follows the wheel 1:1 so reversing mid-gesture pulls Scene 1 straight back down.
    let scene1ExitProgress = 0;
    const SCENE1_EXIT_THRESHOLD = 1200; // px of wheel delta for the full continuous lift

    function applyScene1Exit() {
        updateScrollDebug('scene1-exit', scene1ExitProgress, SCENE1_EXIT_THRESHOLD);
        const liftT = scene1ExitProgress / SCENE1_EXIT_THRESHOLD;
        // The CSS transition would fight the drag, so it is off for the whole gesture and
        // restored at rest (and by goToScene, which needs the snap back).
        trackEl.style.transition = liftT > 0 ? 'none' : '';
        trackEl.style.transform = `translateY(-${liftT * 100}vh)`; // Scene 1 rests at 0vh
    }

    /* ===================== Scene 2 - clouds parting ===================== */
    // Storyboard board 2: the two cloud banks slide outward off the sides, uncovering the
    // heading and body text that sit behind them at a lower z-index. Enough travel to clear the
    // text, not enough to leave the frame -- the leftover haze at each edge keeps the smog.
    let scene2CloudProgress = 0;
    const SCENE2_CLOUD_THRESHOLD = 1200; // px of wheel delta for the full part
    // Travel is a % of the cloud's own cover box, not vw. On a window taller than 16:9 that box is
    // 177.78vh wide -- far wider than the viewport -- so a vw-based travel would move the bank only
    // a small fraction of its own width and leave the title still hazed. A % keeps the parting
    // looking identical in proportion to the art at any window shape, and on a 16:9 window the two
    // units are the same thing anyway.
    // Travel is measured from the resting pose, so this and CLOUD_REST's x move together: pushing
    // the banks further apart at rest without dropping this by the same amount would carry them
    // that much further out at full part too, and the left bank's edge haze is only ~40px wide to
    // begin with. Rest x -5 paired with travel -5 leaves the parted end state bit-identical.
    const CLOUD_PART_PCT = 48;           // how far each bank travels outward
    const CLOUD_PART_SCALE_GAIN = 0.15;  // slight billow as it disperses; 0 = flat slide

    // Resting placements. These must match .cloud-left / .cloud-right in css/chapter4.css,
    // because the inline transform written below replaces the CSS one outright -- the same trap
    // applyScene1Train() documents.
    // Each puff sits off-centre inside its own 1920x1080 canvas (cloud_2 at -11.2%/-1.4% from the
    // canvas centre, cloud_1 at +3.4%/-3.2%), so x absorbs that offset times the scale: the puffs
    // land at +/-29% of the box from centre. Recompute x when s changes.
    // These are as far apart as they can go: the limit is where the two feathered edges stop
    // meeting over the heading, and it is a cliff, not a slope. Measured by sweeping x in the live
    // page and diffing cloud coverage across the heading against a clouds-hidden frame, worst case
    // over the idle drift's phases: 1% further apart each still covers (min +26), 2% opens a hole
    // straight onto the heading before the parting gesture has revealed it (min 0). Do not nudge
    // these outward without re-running that measurement.
    const CLOUD_REST = [
        { el: cloudLeftEl, x: -63.3, y: -58.1, s: 1.4, dir: -1 },
        { el: cloudRightEl, x: -25.8, y: -57.5, s: 1.4, dir: 1 },
    ];

    function applyScene2Clouds() {
        updateScrollDebug('scene2-cloud', scene2CloudProgress, SCENE2_CLOUD_THRESHOLD);
        const t = scene2CloudProgress / SCENE2_CLOUD_THRESHOLD;
        CLOUD_REST.forEach((c) => {
            // Placement and travel are both % of the same box, so they just add. scale() sits last
            // in the transform list, so it never multiplies either term.
            const x = c.x + c.dir * t * CLOUD_PART_PCT;
            const s = c.s + CLOUD_PART_SCALE_GAIN * t;
            c.el.style.transform = `translate(${x}%, ${c.y}%) scale(${s})`;
        });
    }

    /* ===================== Scene enter hooks ===================== */
    function enterScene2Forward() {
        // The lift parks at its arrived value, not 0, so scrolling back up has something to pull
        // down from -- otherwise Scene 2 would be a one-way door.
        scene1ExitProgress = SCENE1_EXIT_THRESHOLD;
        scene2CloudProgress = 0;
        applyScene2Clouds();
    }

    function enterScene1Backward() {
        // The shared-track lift is the exception to the rule above: Scene 1's rest position *is*
        // its 0, so it parks there. scene1TrainShrunk deliberately stays true -- you come back to
        // the train exactly where you left it.
        scene1ExitProgress = 0;
        scene2CloudProgress = 0;
        applyScene2Clouds();
    }

    /* ===================== Input ===================== */
    const WHEEL_DEADZONE = 10; // px; swallows trackpad micro-deltas before any gesture sees them

    function handleWheel(e) {
        e.preventDefault();
        if (sceneTransitioning) return;
        if (Math.abs(e.deltaY) < WHEEL_DEADZONE) return;

        if (sceneIndex === 0) { handleScene1Boundary(e); return; }
        if (sceneIndex === 1) { handleScene2Boundary(e); return; }
    }

    // Both handlers follow chapter 2's recipe: whichever stage already has live progress wins,
    // checked in reverse-completion order, each clamped to [0, THRESHOLD] so scrolling up unwinds
    // the same gesture instead of jumping, and each returning early.
    function handleScene1Boundary(e) {
        if (scene1ExitProgress > 0) {                       // stage 2: the lift is mid-drag
            scene1ExitProgress = Math.max(0, Math.min(SCENE1_EXIT_THRESHOLD, scene1ExitProgress + e.deltaY));
            applyScene1Exit();
            if (scene1ExitProgress >= SCENE1_EXIT_THRESHOLD) goToScene(1);
            return;
        }

        if (!scene1TrainShrunk) {                           // stage 1: park the train first
            commitScene1Train(e.deltaY > 0);
            return;
        }

        if (e.deltaY > 0) {
            // The 900ms shrink has to land before the lift starts, or the momentum tail of the
            // flick that parked the train would run both at once -- same reason commitScene1Train
            // holds the animating lock.
            if (scene1TrainAnimating) return;
            scene1ExitProgress = Math.min(SCENE1_EXIT_THRESHOLD, e.deltaY);
            applyScene1Exit();
            if (scene1ExitProgress >= SCENE1_EXIT_THRESHOLD) goToScene(1);
        } else {
            commitScene1Train(false);                       // scrolling up un-parks the train
        }
    }

    function handleScene2Boundary(e) {
        // The return-to-Scene-1 drag is mid-flight whenever the lift isn't parked at its arrived
        // value, so it outranks Scene 2's own gesture.
        if (scene1ExitProgress !== SCENE1_EXIT_THRESHOLD) {
            scene1ExitProgress = Math.max(0, Math.min(SCENE1_EXIT_THRESHOLD, scene1ExitProgress + e.deltaY));
            applyScene1Exit();
            if (scene1ExitProgress <= 0) goToScene(0);
            return;
        }

        scene2CloudProgress = Math.max(0, Math.min(SCENE2_CLOUD_THRESHOLD, scene2CloudProgress + e.deltaY));
        applyScene2Clouds();

        // Handoff backward: once the clouds are fully closed again, the leftover delta of this
        // same tick seeds the return lift, so one continuous flick flows through without a dead
        // tick. Forward at the threshold just clamps -- Scene 3 doesn't exist yet, so Scene 2 is
        // the new dead end. Bump SCENE_COUNT when it lands.
        if (scene2CloudProgress <= 0 && e.deltaY < 0) {
            scene1ExitProgress = Math.max(0, SCENE1_EXIT_THRESHOLD + e.deltaY);
            applyScene1Exit();
            if (scene1ExitProgress <= 0) goToScene(0);
        }
    }

    window.addEventListener('wheel', handleWheel, { passive: false });

    // Touch devices never fire 'wheel' events, and overflow: hidden disables native
    // touch-scroll too, so swipe has to be routed through the same logic.
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

    // Pin the rest states so the transforms agree with the progress vars from the first frame.
    // Scene 1's goes last on purpose: the overlay shows whichever label was written most recently,
    // and on load the live gesture is the train, not the clouds.
    applyScene2Clouds();
    applyScene1Train();
});
