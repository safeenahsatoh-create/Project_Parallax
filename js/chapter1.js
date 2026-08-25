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

    // Audio config. Progress values are on the same scale updateParallax() uses
    // (progress = scrollY / (3 * vh)). See assets/audio/chapter1/README.txt for the
    // full mapping and attribution notes.
    const AUDIO_DIR = 'assets/audio/chapter1/';
    const AUDIO_CONFIG = {
        // Looping beds. `in` omitted = already at full volume at progress 0 (the manual
        // prologue runs entirely at progress 0, so a bed that fades in from 0 would be
        // silent through the whole intro). `out` omitted = never fades out.
        // A bed's volume is the max across its ranges, which lets a bed dip to silence
        // and come back (the savanna bed does this across the black scene transition).
        layers: [
            {
                id: 'piano',
                src: AUDIO_DIR + 'zec53-thoughtful-mysterious-ambient-piano-loop-1-30-sec-476746.mp3',
                volume: 0.40,
                ranges: [
                    { out: [0.45, 0.70] },                        // prologue + cave
                    // Starts 0.20 earlier than it used to (was 3.55). The savanna and
                    // dreamscape beds finish fading at 3.55, so a piano that only began
                    // there left 3.50-3.65 at about -25 dB with nothing in it.
                    // The reprise carries its own quieter peak. At the layer's 0.40 it was
                    // a louder single source than all three cave ambiences put together,
                    // so the fire scene came out sounding like piano with fire under it
                    // rather than a cave. Most of that is fixed by raising the ambiences;
                    // 0.37 is the rest of it. It does not go lower because the reprise
                    // also holds 3.75-4.05 alone, before any cave bed has arrived.
                    { in: [3.35, 3.75], out: [5.55, 5.80], volume: 0.37 }  // reprise under the night sky
                ]
            },
            {
                // Fades out 0.08 later than it used to (was [0.50, 0.72]), so the cave
                // is still audible while the savanna beds are climbing in.
                id: 'caveAmbience',
                src: AUDIO_DIR + 'freesound_community-cave-background-sound-49440.mp3',
                volume: 0.30,
                ranges: [{ out: [0.55, 0.80] }]
            },
            {
                id: 'savannaAmbience',
                src: AUDIO_DIR + 'freesound_community-african-savanna-2-23769.mp3',
                volume: 0.24,
                ranges: [
                    { in: [0.50, 0.76], out: [1.08, 1.30] },      // savanna arrival
                    { in: [1.30, 1.70], out: [3.25, 3.55] }       // phase 5 is still outdoors
                ]
            },
            {
                id: 'savannaMusic',
                src: AUDIO_DIR + 'grumpynora-savanna-39-sec-edit-579889.mp3',
                volume: 0.38,
                ranges: [{ in: [0.66, 0.88], out: [1.08, 1.30] }]
            },
            {
                // Comes in at 1.10 rather than 1.45. The black scene transition runs
                // 1.08-1.22 and the savanna pair used to be gone by 1.22 with nothing
                // arriving until 1.45 — about 0.75 viewport-heights of scrolling in
                // complete silence, the largest hole in the chapter. Starting the bed
                // under the black scene also reads better than waiting for it: the new
                // world arrives before you see it.
                id: 'dreamscape',
                src: AUDIO_DIR + 'freesound_community-sci-fi-survival-dreamscape-6319.mp3',
                volume: 0.40,
                ranges: [{ in: [1.10, 1.60], out: [3.25, 3.55] }]
            },
            // The three beds below all run at once from 4.60 to 5.50, on top of the
            // piano reprise -- four beds, the only place in the chapter with that many.
            // An earlier pass took a 2 dB trim out of these three and none out of the
            // piano, which brought the peak down but left the melody as the loudest
            // single source in a scene that is about fire and stone. The budget is taken
            // partly out of the piano's reprise instead (see its range above): these three
            // are back up, the stack sums to about -4.5 dB, and what leads it is the cave
            // rather than the score.
            {
                id: 'caveFinalAmbience',
                src: AUDIO_DIR + 'capaholiczsfx-cave-with-water-dripping-402696.mp3',
                volume: 0.28,
                // Both ends moved. In 0.15 early, so it covers 4.05-4.20, where the piano
                // used to hold the night sky alone and dropping the reprise would have
                // left a new soft spot; the cave group itself becomes visible at 4.20, so
                // the sound arrives just ahead of the picture. Out 0.50 late, so it fades
                // across the closing text rather than finishing before it starts.
                ranges: [{ in: [4.05, 4.50], out: [6.00, 6.50] }]
            },
            {
                // No fade-out, unlike every other ambience. The closing text is "around
                // that campfire", and the fire used to be gone by 6.20 -- leaving the
                // march alone for the last 2.4 viewport-heights of the chapter, which is
                // the density collapse that made the ending read as thin. It plays under
                // the black screen to the end of the chapter. Its fade-in moved 0.15
                // early with the cave's, for the same reason.
                id: 'fireAmbience',
                src: AUDIO_DIR + 'freesound_community-fire-6699.mp3',
                volume: 0.32,
                ranges: [{ in: [4.10, 4.55] }]
            },
            {
                id: 'stoneKnapping',
                src: AUDIO_DIR + 'freesound_community-stone_tap-74068.mp3',
                volume: 0.20,
                ranges: [{ in: [4.60, 4.95], out: [5.50, 5.75] }]
            },
            {
                // Starts 0.15 earlier so it climbs through the piano's fall rather than
                // after it. The two used to barely overlap, leaving about -8.7 dB at 5.75
                // -- the thinnest point of the whole back half, and it landed on the
                // fade-to-black.
                id: 'triumphantMarch',
                src: AUDIO_DIR + 'fronbondi_skegs-amb-triumphant-march-cinematic-ambient-background-track-462368.mp3',
                volume: 0.44,
                ranges: [{ in: [5.50, 5.85] }]
            }
        ],
        // One-shots fired once when scrolling forward past `at`, re-armed on scrolling back.
        // maxDuration (seconds) trims files that are longer than the moment needs.
        cues: [
            // 0.40, not 0.45: it fires at 0.87, where the savanna pair is already at full
            // level, and the two together used to peak higher than anything else in the
            // chapter. The roar still leads -- it just no longer overshoots the scene.
            { id: 'lionRoar', src: AUDIO_DIR + 'engyclick-lion-roaring-sound-effect-440951.mp3', volume: 0.40, at: 0.87, maxDuration: 6 },
            // Stays at 0.45 deliberately. It fires into the black scene transition where
            // the beds are at their thinnest, so it is carrying that moment on its own --
            // this is the one cue that is SUPPOSED to be the loudest thing playing.
            { id: 'transitionWhoosh', src: AUDIO_DIR + 'keannix-whoosh-1-522923.mp3', volume: 0.45, at: 1.17 },
            { id: 'mysticReveal', src: AUDIO_DIR + 'universfield-mystic-reveal-567294.mp3', volume: 0.38, at: 1.55, maxDuration: 9 },
            { id: 'hyenas', src: AUDIO_DIR + 'magiaz-sound_of_hyenas-400730.mp3', volume: 0.35, at: 3.80 }
        ],
        // startAt (seconds) skips lead-in silence baked into a file, so a click sound lands on
        // the same frame as the click. The whoosh below is silent for its first ~100ms and then
        // swells for another ~350ms; without the offset it reads as a delayed reaction.
        sfx: {
            shadowReveal: { src: AUDIO_DIR + 'studiokolomna-fast-whoosh-118248.mp3', volume: 0.45, startAt: 0.38 },
            // Both of these are clicked during the fire scene, on top of its four-bed
            // stack, so they were the loudest things on the site by a wide margin.
            toolClick: { src: AUDIO_DIR + 'freesound_community-cave-taps-89098.mp3', volume: 0.48, maxDuration: 1.0 },
            // Set against the fireAmbience bed, not in isolation: this is the SAME FILE
            // as that bed, which is playing at 0.32 when the fire is clickable. Much over
            // this and the click is the identical crackle well above the bed it sits in,
            // which reads as the fire jumping in volume rather than as a response. It
            // holds about +4.4 dB over the bed -- if that bed's level changes, move this
            // with it (it was 0.40 when the bed was 0.24).
            fireClick: { src: AUDIO_DIR + 'freesound_community-fire-6699.mp3', volume: 0.52, maxDuration: 1.5 },
            // startAt measured off this file's MP3 side-info gain envelope: silence
            // through 24ms, low-level room tone to ~96ms, transient at 120ms. Without
            // the offset the click reads as a delayed reaction to the button press.
            uiClick: { src: AUDIO_DIR + 'universfield-mouse-click-351398.mp3', volume: 0.35, startAt: 0.10 }
        }
    };

    // How far ahead of a layer/cue's start to begin downloading it. Everything except the
    // beds playing at progress 0 uses preload="none" so the page doesn't pull ~18MB up front.
    const AUDIO_PRELOAD_LEAD = 0.35;

    // Build one Audio element per layer, keyed by id.
    const audioLayers = {};
    AUDIO_CONFIG.layers.forEach(layer => {
        const el = new Audio(layer.src);
        el.loop = true;
        el.volume = 0;
        // Layers with no fade-in on their first range are audible immediately, so preload those.
        const startsImmediately = !layer.ranges[0].in;
        el.preload = startsImmediately ? 'auto' : 'none';
        audioLayers[layer.id] = el;
    });

    const audioCues = {};
    AUDIO_CONFIG.cues.forEach(cue => {
        const el = new Audio(cue.src);
        el.preload = 'none';
        audioCues[cue.id] = el;
    });

    const audioSfx = {};
    Object.keys(AUDIO_CONFIG.sfx).forEach(key => {
        const el = new Audio(AUDIO_CONFIG.sfx[key].src);
        el.preload = 'auto'; // all small enough to fetch up front
        audioSfx[key] = el;
    });

    const firedCues = new Set();
    const warmedAudio = new Set();

    // The level each bed is actually AT, as opposed to the level the scroll position
    // says it should be at. Kept separately so the rate limiter below has something to
    // ramp from -- reading it back off el.volume would mix in the mute state.
    const layerVolumes = {};
    AUDIO_CONFIG.layers.forEach(layer => { layerVolumes[layer.id] = 0; });

    // Ceiling on how fast a bed may change, in ms for a full 0 -> its own volume sweep.
    // Chapter 2 uses the same mechanism (see its AUDIO_FADE_MS) to render the one scene
    // boundary its track jumps across. Here there are no jumps, so on ordinary scrolling
    // this cap never binds and the sound still tracks the scroll 1:1 -- it only catches
    // a hard flick, where a single wheel event can move progress far enough to snap a
    // bed from silence to full in one frame.
    const AUDIO_FADE_MS = 400;
    let lastAudioTs = 0;

    // Mute lives in js/audio-settings.js, shared with the index page
    // and Chapter 2, so a visitor who muted before arriving here stays muted.
    const isMuted = () => AudioSettings.muted;
    let audioUnlocked = false; // set true once a real user gesture has let audio start playing

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

            // Audio mute toggle
            createAudioControls();

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
                playSfx('shadowReveal');
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
                playSfx('shadowReveal');
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
                playSfx('toolClick');
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
                playSfx('fireClick');
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

    // Audio System
    // Browsers block non-muted audio playback until a real user gesture occurs, so audio
    // can't start on page load. This is called from the prologue's wheel/key/touch handlers
    // (the first guaranteed user interactions) plus a one-time fallback click listener.
    function unlockAudio() {
        if (audioUnlocked) return;
        if (isMuted()) {
            // Nothing to play while muted, but stop trying on every subsequent gesture.
            audioUnlocked = true;
            return;
        }
        // Start the beds that are audible from progress 0 (the prologue's piano + cave echo).
        const openingLayers = AUDIO_CONFIG.layers.filter(l => !l.ranges[0].in);
        Promise.all(openingLayers.map(l => audioLayers[l.id].play()))
            .then(() => {
                audioUnlocked = true;
                updateAudio(window.scrollY / (3 * window.innerHeight));
            })
            .catch(() => { /* rejected — retry on the next qualifying gesture */ });
    }

    // Plays a one-shot sound, restarting it if it's already playing (so repeated clicks give
    // a clean repeated hit instead of stacking). maxDuration trims clips that run longer than
    // the moment needs, ramping the volume down first so the cut doesn't pop. startAt seeks
    // past a file's own lead-in so the sound is audible on the same frame as the click.
    function playOneShot(audioEl, rawVolume, maxDuration, startAt) {
        if (isMuted()) return;

        // Resolved once so the start level and the tail fade below agree even if the
        // visitor mutes while the clip is still playing.
        const volume = AudioSettings.gain(rawVolume);

        clearInterval(audioEl.chapter1FadeTimer);
        clearTimeout(audioEl.chapter1StopTimer);

        // Seeking throws if metadata isn't loaded yet. Failing silently here would put the
        // lead-in back, so fall back to a listener that applies the offset once it can.
        const from = startAt || 0;
        try {
            audioEl.currentTime = from;
        } catch (err) {
            audioEl.addEventListener('loadedmetadata', () => { audioEl.currentTime = from; }, { once: true });
        }
        audioEl.volume = volume;
        audioEl.play().catch(() => {});

        if (!maxDuration) return;

        const fadeMs = 250;
        const stepMs = 25;
        const steps = fadeMs / stepMs;
        audioEl.chapter1StopTimer = setTimeout(() => {
            let step = 0;
            audioEl.chapter1FadeTimer = setInterval(() => {
                step++;
                audioEl.volume = Math.max(0, volume * (1 - step / steps));
                if (step >= steps) {
                    clearInterval(audioEl.chapter1FadeTimer);
                    audioEl.pause();
                }
            }, stepMs);
        }, Math.max(0, maxDuration * 1000 - fadeMs));
    }

    // Plays a click sound by its AUDIO_CONFIG.sfx key.
    function playSfx(key) {
        const cfg = AUDIO_CONFIG.sfx[key];
        if (!cfg) return;
        playOneShot(audioSfx[key], cfg.volume, cfg.maxDuration, cfg.startAt);
    }

    // Starts downloading an audio file shortly before it's needed. Everything but the
    // opening beds is preload="none", so without this a bed would stutter on first play.
    // Skips anything already set to preload — load() resets a playing element, which would
    // cut off the opening beds the moment updateAudio() first runs.
    function warmAudio(id, audioEl) {
        if (warmedAudio.has(id) || audioEl.preload !== 'none') return;
        warmedAudio.add(id);
        audioEl.preload = 'auto';
        audioEl.load();
    }

    // Requests one more updateAudio pass on the next frame, for when the beds are still
    // catching up to a target the user has already scrolled past. Guarded so a burst of
    // scroll events cannot queue several frames at once.
    let audioSettlePending = false;
    function scheduleAudioSettle() {
        if (audioSettlePending) return;
        audioSettlePending = true;
        requestAnimationFrame(() => {
            audioSettlePending = false;
            // Re-read the scroll position rather than reusing the caller's: by the time
            // this frame runs the user may have moved on, and the live value is correct.
            updateAudio(window.scrollY / (3 * window.innerHeight));
        });
    }

    // Sets every bed's volume for the current scroll position and fires any scene cues that
    // have been scrolled past. Beds that fade to 0 keep playing silently rather than pausing,
    // so scrolling back into their range resumes mid-loop without a restart artifact.
    function updateAudio(progress) {
        // Time since the last pass, for the rate limiter below. Normally about one
        // frame, since the callers are rAF-throttled, but the gap can be arbitrarily
        // long -- scrolling stops, or the tab is backgrounded -- and an unclamped dt
        // would let a bed through the whole cap in a single step, which is the one
        // thing the cap exists to prevent.
        const now = performance.now();
        const dtMs = lastAudioTs ? Math.min(100, now - lastAudioTs) : 16;
        lastAudioTs = now;

        if (isMuted() || !audioUnlocked) {
            Object.keys(audioLayers).forEach(id => {
                layerVolumes[id] = 0;          // so unmuting ramps up from silence
                audioLayers[id].volume = 0;    // muting is instant, never ramped
            });
            // Keep the cue list in sync while silent, so unmuting part-way through the
            // chapter doesn't fire every cue the user already scrolled past all at once.
            AUDIO_CONFIG.cues.forEach(cue => {
                if (progress >= cue.at) firedCues.add(cue.id);
                else if (progress < cue.at - 0.1) firedCues.delete(cue.id);
            });
            return;
        }

        let stillRamping = false;

        AUDIO_CONFIG.layers.forEach(layer => {
            const el = audioLayers[layer.id];

            // A bed can be active over several windows; the loudest one wins.
            let target = 0;
            layer.ranges.forEach(range => {
                // A range may carry its own peak. Only the piano uses this: its reprise
                // sits under the fire scene's ambiences and has to be quieter than its
                // prologue, which plays alone.
                const peak = range.volume !== undefined ? range.volume : layer.volume;
                let rangeVolume = peak;
                if (range.in) {
                    rangeVolume = Math.min(rangeVolume, mapRange(progress, range.in[0], range.in[1], 0, peak));
                }
                if (range.out) {
                    rangeVolume = Math.min(rangeVolume, mapRange(progress, range.out[0], range.out[1], peak, 0));
                }
                target = Math.max(target, rangeVolume);
            });

            const startsAt = layer.ranges[0].in ? layer.ranges[0].in[0] : 0;
            if (progress >= startsAt - AUDIO_PRELOAD_LEAD) warmAudio(layer.id, el);

            // Rate-limited rather than assigned outright. Scrolling normally moves
            // `target` a little per frame and this cap never binds, so the sound still
            // follows the scroll exactly; a hard flick, which can move progress far
            // enough in one event to snap a bed from silence to full, gets spread over
            // AUDIO_FADE_MS instead of arriving as a jolt.
            const current = layerVolumes[layer.id];
            const maxStep = layer.volume * (dtMs / AUDIO_FADE_MS);
            const next = current + Math.max(-maxStep, Math.min(maxStep, target - current));
            layerVolumes[layer.id] = next;
            if (Math.abs(target - next) > 0.0005) stillRamping = true;

            el.volume = AudioSettings.gain(next);
            if (next > 0.0005 && el.paused) el.play().catch(() => {});
        });

        // updateParallax runs on scroll events, not on a standing rAF loop, so when the
        // user stops scrolling this function stops being called. A bed the cap above
        // caught mid-ramp would then be stranded at a partial level, which is exactly
        // the case the cap exists for. Keep asking for frames until every bed has landed.
        if (stillRamping) scheduleAudioSettle();

        AUDIO_CONFIG.cues.forEach(cue => {
            const el = audioCues[cue.id];
            if (progress >= cue.at - AUDIO_PRELOAD_LEAD) warmAudio(cue.id, el);

            if (progress >= cue.at && !firedCues.has(cue.id)) {
                firedCues.add(cue.id);
                playOneShot(el, cue.volume, cue.maxDuration, cue.startAt);
            } else if (progress < cue.at - 0.1) {
                // Re-arm once the user has scrolled back clear of the trigger point.
                firedCues.delete(cue.id);
            }
        });
    }

    // The mute button and its speaker icons live in js/audio-settings.js now — the
    // same control was duplicated verbatim in all three page scripts. This just mounts
    // it and wires the two things the shared module cannot know: that an unmute click
    // is itself this page's unlocking gesture, and which mixer to re-run on a change.
    //
    // The navbar is safe to query for: js/navbar.js is a synchronous IIFE that has
    // already written its markup by the time this runs, and never rewrites it. Only
    // chapter1.js and chapter2.js call this, so the chapters with no audio yet don't
    // get a dead control.
    function createAudioControls() {
        AudioSettings.mountControls(document.getElementById('lang-toggle'), () => {
            audioUnlocked = true; // this click itself counts as the unlocking gesture
            playSfx('uiClick');
        });

        // Fires on mute and unmute, so the beds follow the click rather than waiting
        // for the next scroll event.
        AudioSettings.onChange(() => {
            updateAudio(window.scrollY / (3 * window.innerHeight));
        });
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
        // Fallback: any click also counts as the user gesture browsers require before audio can play
        window.addEventListener('click', unlockAudio, { once: true });

        // Show the first text after a small delay
        setTimeout(nextPrologueStep, 500);
    }

    function handlePrologueScroll(e) {
        unlockAudio();
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
        unlockAudio();
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
        unlockAudio();
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

        updateAudio(progress);

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
