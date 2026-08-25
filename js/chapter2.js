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

    // ===== CHAPTER 2 AUDIO -- START (marker used by the Node test harness) =====

    // Drop each file into assets/audio/chapter2/ and paste its name here. Keep the
    // original download name: the author handle baked into it is what the credits list
    // in that folder's README.txt is built from. An empty string means "not supplied
    // yet" -- the entry is skipped entirely, so no element is built and no 404 is
    // requested, which keeps the chapter fully playable while the library is still
    // being assembled.
    const AUDIO_DIR = 'assets/audio/chapter2/';
    const AUDIO_FILES = {
        // Music beds
        mWonder: 'freesound_community-mystical-music-54294.mp3',            // Scenes 1-3
        mEgypt: 'universfield-dramatic-flute-for-documentaries-165986.mp3', // Scenes 4-6
        mChaos: 'starostin-documentary-sad-sorrowful-music-479773.mp3',     // Scene 7
        // ---- TEMPORARY STAND-INS -- replace with real files, do not ship as-is ----
        // Scene 10 had no bed at all, which read as "Scene 10 is too loud": its cue was
        // playing with nothing under it. Pointing the empty slot at a file already here
        // fills the gap without touching a single range, so the designed crossovers stay
        // exactly as planned and swapping in the real file later is a one-line change.
        // Stretching the neighbouring beds' ranges instead would have overlapped the slots
        // these belong to, putting two ambience beds on a rest scene the moment the real
        // files arrived.
        mLaw: 'freesound_community-mystical-music-54294.mp3', // STAND-IN (mWonder's file)
        mCollapse: 'maciejm1992-your-adventure-has-come-to-an-end-477982.mp3', // Scene 11
        // Ambience beds
        aDesert: '',      // open desert wind -- Scenes 2-6
        // Was a stand-in on aHall's file, and has been emptied for exactly the reason
        // aPaper below was never filled with it. Pointing both slots at the same pad
        // meant one unbroken drone from Scene 6 through Scene 10, and worse, the
        // 6.50-6.90 handover crossfaded the pad with ITSELF -- two elements, one file,
        // at different playback positions -- which is not a scene change, it is the same
        // sound not stopping. Leaving it empty lets the pad belong to Scenes 8-9, and
        // drops Scene 7 to the level the rest of the chapter rests at. Fill this in when
        // a real crowd ambience is sourced; no range needs to move when it lands.
        aCrowd: '',       // market / crowd ambience -- Scenes 6-7
        aHall: 'idoberg-ambient-pads-loop-296968.mp3',                      // Scenes 8-9
        // ---- end temporary stand-ins ----
        // Deliberately left empty even though a stand-in was available. That file is a
        // dense pad -- median level -3dB, essentially no dynamics -- so it carries far more
        // energy than the sparse parchment texture this slot is for, and reads as loud at
        // any volume that is still audible. Borrowing it here also meant the same pad ran
        // unbroken from Scene 7 through Scene 10. Leaving it silent makes Scene 10 the
        // quiet beat it is meant to be, and the pad stopping is itself the sound of things
        // settling. Fill this in when a real parchment ambience is sourced.
        aPaper: '',       // parchment rustle -- Scene 10
        aRuin: 'universfield-apocalypse-153277.mp3',                        // Scene 11
        // Scene cues
        scrollUnfurl: 'lenspulse-foley-paper-handling-amp-page-turning-sfx-584919.mp3',
        stoneDrag: '',    // heavy stone dragged over sand -- Scene 6
        chisel: '',       // chisel / hammer on stone -- Scene 8
        lowGong: '',      // low ceremonial gong or horn -- Scene 9
        // Emptied deliberately, not "not sourced yet". good_b_music-grand-final-
        // orchestral-tutti was here and has been rejected by ear: the slot always wanted
        // a deep collapse rumble (see README's SOURCING GUIDE) and an orchestral tutti is
        // a different thing -- a triumphant finale on the scene where the empires fall.
        // README had it flagged as a known compromise from the day it landed. The file
        // (good_b_music-grand-final-orchestral-tutti-9927.mp3) was parked in candidates/
        // for a while and has since been deleted. assets/audio/ is not tracked by git,
        // so that filename is the only surviving record of which file this was.
        collapse: '',     // building-collapse rumble / deep boom -- Scene 11
        // Click sounds
        sledgeClick: 'dragon-studio-button-press-382713.mp3',
        slideChange: 'dragon-studio-simple-whoosh-382724.mp3',
        // Motion sounds. Short seamless loops (3-15s is plenty -- they only ever play in
        // 1-3 second bursts, so loop repetition is never heard). These four files cover
        // eight set-pieces between them; see AUDIO_CONFIG.motion below for the sharing.
        coinSpin: 'universfield-spinning-coin-on-table-352448.mp3',
        glyphRoll: '',    // stone discs rolling -- Scene 2's glyph drag, Scene 10's discs
        sphinxGrind: '',  // heavy stone sliding -- the sphinx and pharaoh figures
        featherWrite: '', // quill on parchment -- Scene 4's trace, Scene 7's text reveal
    };

    // The mute button's own click sound deliberately points at Chapter 1's copy rather
    // than duplicating a 33 KB file and a second licensing entry for the same sound.
    const UI_CLICK_SRC = 'assets/audio/chapter1/universfield-mouse-click-351398.mp3';

    function audioSrc(key) {
        return AUDIO_FILES[key] ? AUDIO_DIR + AUDIO_FILES[key] : '';
    }

    // Positions below are on a *scene* scale, not Chapter 1's scroll scale: 0 is Scene 1
    // at rest, 10 is Scene 11 at rest, and fractional values are the continuous
    // wheel-driven drags in between (see readScenePos). Crossovers sit mid-drag rather
    // than on a rest point, so the sound changes together with the picture.
    // See assets/audio/chapter2/README.txt for the full mapping and attribution notes.
    const AUDIO_CONFIG = {
        // Looping beds. `in` omitted = already at full volume at position 0. `out`
        // omitted = never fades out. A bed's volume is the max across its ranges.
        layers: [
            {
                // Measured lead-in 745ms. 71.4s long.
                id: 'mWonder',
                src: audioSrc('mWonder'),
                volume: 0.40,
                startAt: 0.72,
                ranges: [{ out: [2.40, 2.95] }]
            },
            {
                // Measured lead-in 2694ms -- the worst of the set. Untrimmed this bed would
                // go silent for 2.7s every 65s, right through the Imhotep scenes. Its last
                // 1.7s is a fade-out, cut too so the cycle joins at a matched level.
                id: 'mEgypt',
                src: audioSrc('mEgypt'),
                volume: 0.38,
                startAt: 2.66,
                loopEnd: 63.65,
                ranges: [{ in: [2.40, 2.95], out: [5.40, 5.90] }]
            },
            {
                // Measured lead-in 26ms, so no startAt: the track opens on its first frame.
                // It runs at a flat level to 36.5s, then fades for its last 4s into 3s of
                // silence, so loopEnd cuts the cycle before the fade starts. 36.50 was
                // picked over the later candidates by matching levels across the loop
                // point: the seam there is +1.5dB, where 41.10 (the last frame still within
                // 6dB of the body's typical level, which is how the audit script suggests a
                // loopEnd) reads -12.0dB and dips audibly every cycle.
                //
                // NOTE: audio-audit.js reports this file as "45086ms of silence at the
                // head" and suggests startAt 45.06. That is an artefact, not a property of
                // the file -- its last 27 frames all carry an identical global_gain of 210,
                // which is the parser reading past the audio data. The script only drops 3
                // trailing frames, so that value becomes the file's apparent peak and every
                // real frame then sits more than 12dB under it. Real peak is 170.
                id: 'mChaos',
                src: audioSrc('mChaos'),
                volume: 0.40,
                loopEnd: 36.50,
                ranges: [{ in: [5.40, 5.90], out: [6.40, 6.90] }]
            },
            {
                // TEMPORARY trim: inherited from mWonder, whose file this currently borrows
                // (lead-in 745ms). Drop it when a real mLaw arrives.
                //
                // The fade-out starts before Scene 10, so the music is already coming down
                // by the time that scene lands. It used to be [9.05, 9.60], which sits
                // entirely inside the one boundary the position JUMPS across -- so it
                // never actually faded at all and Scene 10 inherited the full 0.36 of the
                // law scenes. That made the chapter's calmest scene louder than Scenes
                // 1-6, the opposite of the intent, and is what read as the background
                // being too loud on the way in.
                //
                // The start then moved 8.40 -> 8.80, which is a correction of that fix
                // rather than a reversal of it. At 8.40 this bed was down to 0.19 when
                // Scene 10 landed, and since aPaper has no file and Scene 10 has no cue
                // and no motion sound, 0.19 of a tapering stand-in was the ENTIRE scene:
                // -14.3 dB, 7 dB under every other rest point, on a scene the reader can
                // sit on indefinitely. It was not quiet, it was inaudible. At 8.80 the bed
                // settles to 0.28 instead, which still puts Scene 10 nearly 4 dB below
                // Scenes 8-9 and makes it the quietest scene in the chapter -- the intent
                // -- without it dropping out from under the reader. Raise this again if
                // aPaper is ever filled: the two together should land near -11 dB.
                id: 'mLaw',
                src: audioSrc('mLaw'),
                volume: 0.36,
                startAt: 0.72,
                ranges: [{ in: [6.40, 6.90], out: [8.80, 9.70] }]
            },
            {
                // Scenes 10 and 11 are the one boundary that really is a jump, so this
                // pair of ranges spans positions the track never occupies continuously.
                // Both targets flip at once and the rate limiter in updateAudio renders
                // the crossfade -- see AUDIO_FADE_MS.
                id: 'mCollapse',
                src: audioSrc('mCollapse'),
                volume: 0.42,
                ranges: [{ in: [9.05, 9.60] }]
            },
            {
                id: 'aDesert',
                src: audioSrc('aDesert'),
                volume: 0.26,
                ranges: [{ in: [0.50, 1.20], out: [5.50, 6.00] }]
            },
            {
                id: 'aCrowd',
                src: audioSrc('aCrowd'),
                volume: 0.28,
                ranges: [{ in: [5.50, 6.00], out: [6.50, 6.90] }]
            },
            {
                // Fades out over exactly aPaper's fade-in window below, so the handover
                // completes during the Scene 9 -> 10 drag. Running it to 9.05 (to line up
                // with the music crossover) instead left both ambience beds audible while
                // resting on Scene 10.
                // The window ends AT the arrival rather than 0.1 before it, so the ambience
                // is still moving as Scene 10 lands. Finishing early left the last stretch
                // of the drag completely flat, which is part of why the cue then felt like
                // it came out of nowhere.
                id: 'aHall',
                src: audioSrc('aHall'),
                volume: 0.24,
                ranges: [{ in: [6.50, 6.90], out: [8.50, 9.00] }]
            },
            {
                // Mirrors aHall's fade-out exactly, so the two cross cleanly and the pair
                // is still rising right up to the moment Scene 10 arrives. 0.14 keeps it
                // clearly under the tapering mLaw above rather than level with it -- this
                // is texture under the papyrus, not the voice of the scene.
                id: 'aPaper',
                src: audioSrc('aPaper'),
                volume: 0.14,
                ranges: [{ in: [8.50, 9.00], out: [9.05, 9.50] }]
            },
            {
                // Measured lead-in 1337ms, and a 1.8s fade-out at the tail.
                id: 'aRuin',
                src: audioSrc('aRuin'),
                volume: 0.26,
                startAt: 1.30,
                loopEnd: 21.67,
                ranges: [{ in: [9.05, 9.60] }]
            }
        ],
        // One-shots fired once when moving forward past `at`, re-armed on going back.
        // maxDuration (seconds) trims files that are longer than the moment needs.
        cues: [
            // The paper file is a foley PACK, not one sound: three separate takes at
            // 0.00-0.46s, 2.72-3.50s and 5.00-5.95s, with the noise floor between them.
            // An earlier window of 0.22s + 4s straddled takes 1 and 2, so Scene 4 played
            // two paper sounds back to back. The window now sits wholly inside take 3, the
            // loudest, since unfurling the scroll is the bigger moment. Take 2 fed Scene
            // 10's cue until that was removed (see below); takes 1 and 2 are now unused.
            { id: 'scrollUnfurl', src: audioSrc('scrollUnfurl'), volume: 0.40, at: 3.00, startAt: 5.00, maxDuration: 1.0 },
            { id: 'stoneDrag', src: audioSrc('stoneDrag'), volume: 0.42, at: 5.00, maxDuration: 6 },
            { id: 'chisel', src: audioSrc('chisel'), volume: 0.40, at: 7.00, maxDuration: 5 },
            { id: 'lowGong', src: audioSrc('lowGong'), volume: 0.38, at: 8.00, maxDuration: 7 },
            // Scene 10 has NO entry cue any more. It used to carry `paperUnroll` -- a
            // second element on scrollUnfurl's file (take 2's tail, at 9.00) -- and it read
            // as too loud through several rounds of tuning: retimed past the take's
            // transient, trimmed to 0.55s, faded in, dropped to 0.36. It kept announcing
            // itself because Scene 10 is the chapter's calmest beat and, with aPaper
            // deliberately empty, the only thing under it is the tapering mLaw. Removed
            // rather than lowered again: at a level quiet enough to belong there it would
            // not have been audible anyway. Scene 10's sound is now the mLaw -> mCollapse
            // handover alone. If a real parchment ambience is ever sourced for aPaper,
            // reconsider a cue on top of it -- not before.
            // No startAt: the 552ms it used to carry was measured off the rejected
            // orchestral-tutti file and belongs to that file, not this slot -- re-measure
            // when a real rumble lands. maxDuration is the slot's own intent (Scene 11 is
            // the short closing scene) and stays.
            { id: 'collapse', src: audioSrc('collapse'), volume: 0.45, at: 10.00, maxDuration: 8 }
        ],
        // startAt (seconds) skips lead-in silence baked into a file so a click sound
        // lands on the same frame as the click. The two Chapter 2 sounds have no value
        // yet because their files do not exist -- see README.txt for how to measure one.
        sfx: {
            // Both measured at 60ms of lead-in -- just over the ~50ms where a click starts
            // reading as a delayed reaction, so both get the offset.
            sledgeClick: { src: audioSrc('sledgeClick'), volume: 0.50, startAt: 0.04, maxDuration: 1.2 },
            slideChange: { src: audioSrc('slideChange'), volume: 0.30, startAt: 0.04, maxDuration: 1.0 },
            // Measured off this file's MP3 side-info gain envelope: silence through
            // 24ms, low-level room tone to ~96ms, transient at 120ms. Starting at 100ms
            // puts the click on the same frame as the press without clipping its attack.
            uiClick: { src: UI_CLICK_SRC, volume: 0.35, startAt: 0.10 }
        },
        // Loops for the big scroll-driven set-pieces. These cannot be layers: during all
        // three the track does not move at all (applyScene2GlyphTransform holds translateY
        // at exactly -100vh for the first 70% of its drag), so readScenePos is blind to
        // them and they need their own hooks -- see setMotion below.
        //
        // `span` is the gesture's own px threshold. Converting the 0..1 progress back into
        // px means one wheel tick contributes the same energy in every gesture, so a single
        // gain constant works for all three despite thresholds from 1000 to 4500.
        // `warmAt` is the scene position to start downloading at, fed to the same
        // AUDIO_PRELOAD_LEAD logic the beds use.
        // Eight set-pieces, four files. Entries sharing a file still get their own id and
        // their own element -- sphinxGrind serves three of them: they fire on different
        // gestures with different spans and levels, so they cannot share playback state. Scene 10's calendar discs are literally the same Mayan stone
        // discs as Scene 2's glyphs, and the pharaoh and sphinx figures are all heavy
        // stone statues sliding, which is why so few files cover so much.
        motion: {
            coinSpin: { src: audioSrc('coinSpin'), volume: 0.28, span: 450, warmAt: 0.0 },
            glyphRoll: { src: audioSrc('glyphRoll'), volume: 0.34, span: 4500, warmAt: 1.0 },
            featherWrite: { src: audioSrc('featherWrite'), volume: 0.22, span: 2400, warmAt: 3.0 },
            sphinxEnter: { src: audioSrc('sphinxGrind'), volume: 0.26, span: 900, warmAt: 3.0 },
            pharaohEnter: { src: audioSrc('sphinxGrind'), volume: 0.24, span: 900, warmAt: 4.0 },
            // Quietest thing in the chapter on purpose: text arriving should be felt more
            // than heard, and it plays under mChaos at 0.40.
            textReveal: { src: audioSrc('featherWrite'), volume: 0.14, span: 2400, warmAt: 6.0 },
            sphinxGrind: { src: audioSrc('sphinxGrind'), volume: 0.30, span: 1000, warmAt: 7.0 },
            // 0.24 rather than glyphRoll's 0.34: Scene 10 is the quiet papyrus scene, where
            // even its ambience sits at 0.18.
            discFlow: { src: audioSrc('glyphRoll'), volume: 0.24, span: 1600, warmAt: 9.0 }
        }
    };

    const AUDIO_FADE_MS = 700;      // equals SCENE_TRANSITION_MS, so a jump-driven
                                    // crossfade lands with the CSS track transition
    const AUDIO_PRELOAD_LEAD = 1.5; // scenes of lead time before a bed/cue is needed
    // How far back past `at` a cue must go before it can fire again. 0.15 was far too
    // twitchy: every cue sits at a scene rest position reached by a 1200px drag, so 0.15
    // scene units is about 180px -- under two wheel notches. Nudging back and scrolling
    // forward again re-fired the cue, which read as the sound repeating itself. At 0.6 a
    // re-arm means travelling most of the way back to the previous scene, which is what
    // revisiting actually is; checked against every cue so a genuine return still re-arms.
    const AUDIO_CUE_REARM = 0.6;
    const AUDIO_IDLE_MS = 900;      // rAF keeps running this long after the last input

    // Motion-sound tuning. Level follows how fast a set-piece is being dragged, not where
    // it has got to, so a rolling-stone sound falls silent the moment scrolling stops even
    // though the stone is still mid-screen.
    const MOTION_DECAY = 0.85;     // energy retained per 16ms frame
    const MOTION_FULL_PX = 420;    // accumulated px of movement that counts as full level
    // Energy is capped at the saturation point. Without this a sustained drag banks far
    // more than it can use (a steady scroll settles near 900), and the exponential tail
    // then takes about a second to decay back to inaudible -- long after the thing on
    // screen stopped moving. Capped, silence lands ~450ms after the last tick.
    const MOTION_MAX_ENERGY = MOTION_FULL_PX;
    // Two guards against programmatic resets -- applyScene5PharaohSlide(0) and
    // applyScene8SphinxSlide(0) when leaving a scene -- being mistaken for real dragging
    // and firing a blip when nothing on screen moved. Clamping such a jump instead of
    // dropping it was tried first and was not enough; it still made a sound.
    //
    // The fractional rule is the one that actually characterises a reset: a reset always
    // jumps the WHOLE gesture, and real input never covers 90% of one in a single event.
    // It is what catches the 900px and 1000px resets, which sit under the absolute cap.
    //
    // The absolute cap is only a backstop for a wild delta, and is deliberately well clear
    // of real input: a hard trackpad flick legitimately produces a deltaY around 1000, and
    // on the 4500px glyph drag that is a perfectly valid 22% of the gesture. An earlier
    // 600px cap discarded exactly that, so the rolling sound dropped out whenever the user
    // scrolled hard -- the opposite of what these sounds are for.
    const MOTION_MAX_PX = 1500;
    const MOTION_RESET_T = 0.9;
    // Motion levels ramp far faster than beds. AUDIO_FADE_MS is sized for a scene
    // crossfade; reusing it here would fight the energy decay above and leave a
    // rolling-stone sound audible for a second after the stone stopped. The decay is
    // what shapes the tail -- this is only here to stop per-frame jitter.
    const MOTION_RAMP_MS = 150;

    // Entries with no file supplied yet are dropped here rather than at every use site.
    const audioLayerDefs = AUDIO_CONFIG.layers.filter(l => l.src);
    const audioCueDefs = AUDIO_CONFIG.cues.filter(c => c.src);
    const audioMotionDefs = Object.keys(AUDIO_CONFIG.motion)
        .filter(k => AUDIO_CONFIG.motion[k].src)
        .map(k => Object.assign({ id: k }, AUDIO_CONFIG.motion[k]));

    const audioTrackEl = document.querySelector('.chapter2-track');

    // A bed whose file opens with silence or a fade-in cannot just use el.loop: the browser
    // always restarts a loop at 0, so that lead-in comes back on every single cycle -- one
    // sourced track is silent for its first 2.7 seconds, which would be a hole in the sound
    // once a minute forever. Driving the loop by hand lets the bed cycle over a trimmed
    // window instead. `startAt` is where each cycle begins, `loopEnd` where it restarts
    // (used to cut a tail that fades out, which would otherwise dip at the seam).
    //
    // Trimming here rather than in an audio editor is deliberate and matches how cues are
    // handled -- the source files stay exactly as downloaded, so the credits still line up
    // with what was actually obtained.
    function attachLoopWindow(el, startAt, loopEnd) {
        const from = startAt || 0;
        const rewind = () => {
            try { el.currentTime = from; } catch (err) { /* metadata not in yet */ }
            if (el.paused) el.play().catch(() => {});
        };
        // `ended` covers the untrimmed tail; the timeupdate watch covers an early loopEnd.
        el.addEventListener('ended', rewind);
        if (loopEnd) {
            el.addEventListener('timeupdate', () => {
                if (el.currentTime >= loopEnd) rewind();
            });
        }
    }

    const audioLayers = {};
    const layerVolumes = {}; // volume actually applied to the element right now
    const layerTargets = {}; // volume the current scene position is asking for
    audioLayerDefs.forEach(layer => {
        const el = new Audio(layer.src);
        const trimmed = layer.startAt || layer.loopEnd;
        el.loop = !trimmed;
        if (trimmed) attachLoopWindow(el, layer.startAt, layer.loopEnd);
        el.volume = 0;
        // Beds with no fade-in on their first range are audible immediately, so preload
        // those. Everything else is fetched by warmAudio shortly before it is needed.
        el.preload = layer.ranges[0].in ? 'none' : 'auto';
        audioLayers[layer.id] = el;
        layerVolumes[layer.id] = 0;
        layerTargets[layer.id] = 0;
    });

    const audioCues = {};
    audioCueDefs.forEach(cue => {
        const el = new Audio(cue.src);
        el.preload = 'none';
        audioCues[cue.id] = el;
    });

    const audioSfx = {};
    Object.keys(AUDIO_CONFIG.sfx).forEach(key => {
        const cfg = AUDIO_CONFIG.sfx[key];
        if (!cfg.src) return;
        const el = new Audio(cfg.src);
        el.preload = 'auto'; // all small enough to fetch up front
        audioSfx[key] = el;
    });

    const audioMotion = {};
    const motionState = {}; // per set-piece: accumulated movement energy + last progress
    audioMotionDefs.forEach(def => {
        const el = new Audio(def.src);
        el.loop = true;
        el.volume = 0;
        el.preload = 'none';
        audioMotion[def.id] = el;
        motionState[def.id] = { energy: 0, lastT: 0, level: 0 };
    });

    const firedCues = new Set();
    const warmedAudio = new Set();

    // Mute lives in js/audio-settings.js, shared with the index page
    // and Chapter 1, so a visitor who muted before arriving here stays muted.
    const isMuted = () => AudioSettings.muted;
    let audioUnlocked = false; // set true once a real user gesture has let audio start

    function mapRange(value, inMin, inMax, outMin, outMax) {
        const clamped = Math.max(inMin, Math.min(value, inMax));
        return outMin + (outMax - outMin) * ((clamped - inMin) / (inMax - inMin));
    }

    // Chapter 2 has no scrollY to read: the track is paged and body overflow is hidden.
    // What it does have is nine applySceneNExit() functions plus goToScene(), all of
    // which write .chapter2-track's inline transform in exactly this shape, and nothing
    // else writes it. translateY in vh / 100 therefore *is* the continuous scene
    // position -- 0 at Scene 1, 10 at Scene 11, fractional mid-drag. Reading the inline
    // style rather than getComputedStyle is deliberate: it costs no style recalc, and
    // the one boundary that really jumps (Scene 10 -> 11) is absorbed by the volume
    // rate limiter instead. An empty string (page load) parses to 0, which is Scene 1.
    const AUDIO_POS_RE = /translateY\(-?([\d.]+)vh\)/;

    function readScenePos() {
        if (!audioTrackEl) return 0;
        const m = AUDIO_POS_RE.exec(audioTrackEl.style.transform);
        return m ? parseFloat(m[1]) / 100 : 0;
    }

    // Browsers block non-muted playback until a real user gesture, so audio cannot start
    // on page load. Called from the module's own gesture listeners (see
    // initChapter2Audio), which are separate from handleWheel so the navigation state
    // machine stays untouched.
    function unlockAudio() {
        if (audioUnlocked) return;
        if (isMuted()) {
            // Nothing to play while muted, but stop trying on every later gesture.
            audioUnlocked = true;
            return;
        }
        const openingLayers = audioLayerDefs.filter(l => !l.ranges[0].in);
        Promise.all(openingLayers.map(l => audioLayers[l.id].play()))
            .then(() => {
                audioUnlocked = true;
                kickAudioLoop();
            })
            .catch(() => { /* rejected -- retry on the next qualifying gesture */ });
    }

    // Plays a one-shot, restarting it if already playing so repeated clicks give a clean
    // repeated hit instead of stacking. maxDuration trims clips that run longer than the
    // moment needs, ramping the volume down first so the cut does not pop. startAt seeks
    // past a file's own lead-in so the sound is audible on the same frame as the click.
    function playOneShot(audioEl, rawVolume, maxDuration, startAt, fadeIn) {
        if (isMuted() || !audioEl) return;

        // Resolved once so the rise, the plateau and the tail fade all agree even if the
        // visitor mutes while the clip is still playing.
        const volume = AudioSettings.gain(rawVolume);

        clearInterval(audioEl.chapter2FadeTimer);
        clearInterval(audioEl.chapter2RiseTimer);
        clearTimeout(audioEl.chapter2StopTimer);

        // Seeking throws if metadata is not loaded yet. Failing silently here would put
        // the lead-in back, so fall back to a listener that applies it once it can.
        const from = startAt || 0;
        try {
            audioEl.currentTime = from;
        } catch (err) {
            audioEl.addEventListener('loadedmetadata', () => { audioEl.currentTime = from; }, { once: true });
        }
        const stepMs = 25;

        // fadeIn (seconds) swells a cue in instead of stepping to full on the frame it
        // fires. A one-shot landing at full volume is right for a hit -- a chisel, a
        // collapse -- but wrong where the moment is meant to arrive gently, and on a flat
        // bed it reads as the sound being too loud even when its level is modest.
        if (fadeIn) {
            audioEl.volume = 0;
            const riseSteps = Math.max(1, Math.round(fadeIn * 1000 / stepMs));
            let riseStep = 0;
            audioEl.chapter2RiseTimer = setInterval(() => {
                riseStep++;
                audioEl.volume = Math.min(volume, volume * (riseStep / riseSteps));
                if (riseStep >= riseSteps) clearInterval(audioEl.chapter2RiseTimer);
            }, stepMs);
        } else {
            audioEl.volume = volume;
        }
        audioEl.play().catch(() => {});

        if (!maxDuration) return;

        const fadeMs = 250;
        const steps = fadeMs / stepMs;
        audioEl.chapter2StopTimer = setTimeout(() => {
            // Stop any still-running rise, or the two ramps fight over the same property.
            clearInterval(audioEl.chapter2RiseTimer);
            const from = audioEl.volume; // may be mid-rise, so ramp down from where it got to
            let step = 0;
            audioEl.chapter2FadeTimer = setInterval(() => {
                step++;
                audioEl.volume = Math.max(0, from * (1 - step / steps));
                if (step >= steps) {
                    clearInterval(audioEl.chapter2FadeTimer);
                    audioEl.pause();
                }
            }, stepMs);
        }, Math.max(0, maxDuration * 1000 - fadeMs));
    }

    // Plays a click sound by its AUDIO_CONFIG.sfx key.
    function playSfx(key) {
        const cfg = AUDIO_CONFIG.sfx[key];
        if (!cfg || !cfg.src) return;
        playOneShot(audioSfx[key], cfg.volume, cfg.maxDuration, cfg.startAt, cfg.fadeIn);
    }

    // Starts downloading a file shortly before it is needed. Skips anything already set
    // to preload: load() resets a playing element, which would cut off the opening bed
    // the moment updateAudio() first runs.
    function warmAudio(id, audioEl) {
        if (warmedAudio.has(id) || audioEl.preload !== 'none') return;
        warmedAudio.add(id);
        audioEl.preload = 'auto';
        audioEl.load();
    }

    // Sets every bed's volume for the current scene position and fires any cues that
    // have been passed. Beds that fade to 0 keep playing silently rather than pausing,
    // so coming back into range resumes mid-loop without a restart artifact.
    function updateAudio(pos, dtMs) {
        if (isMuted() || !audioUnlocked) {
            audioLayerDefs.forEach(layer => {
                layerVolumes[layer.id] = 0;
                layerTargets[layer.id] = 0;
                audioLayers[layer.id].volume = 0; // muting is instant, never ramped
            });
            audioMotionDefs.forEach(def => {
                const st = motionState[def.id];
                st.energy = 0; // dump accumulated movement, so unmuting mid-drag is silent
                st.level = 0;
                const el = audioMotion[def.id];
                el.volume = 0;
                if (!el.paused) el.pause();
            });
            // Keep the cue list in sync while silent, so unmuting part-way through the
            // chapter does not fire every already-passed cue at once.
            audioCueDefs.forEach(cue => {
                if (pos >= cue.at) firedCues.add(cue.id);
                else if (pos < cue.at - AUDIO_CUE_REARM) firedCues.delete(cue.id);
            });
            return;
        }

        audioLayerDefs.forEach(layer => {
            const el = audioLayers[layer.id];

            // A bed can be active over several windows; the loudest one wins.
            let target = 0;
            layer.ranges.forEach(range => {
                let rangeVolume = layer.volume;
                if (range.in) {
                    rangeVolume = Math.min(rangeVolume, mapRange(pos, range.in[0], range.in[1], 0, layer.volume));
                }
                if (range.out) {
                    rangeVolume = Math.min(rangeVolume, mapRange(pos, range.out[0], range.out[1], layer.volume, 0));
                }
                target = Math.max(target, rangeVolume);
            });
            layerTargets[layer.id] = target;

            const startsAt = layer.ranges[0].in ? layer.ranges[0].in[0] : 0;
            if (pos >= startsAt - AUDIO_PRELOAD_LEAD) warmAudio(layer.id, el);

            // Rate-limited instead of assigned outright. On a drag boundary `target`
            // moves gradually and this cap barely binds, so the sound tracks the scroll
            // 1:1; on the Scene 10 -> 11 jump `target` flips in one frame and the cap
            // spreads it over AUDIO_FADE_MS, matching the CSS track transition.
            const current = layerVolumes[layer.id];
            const maxStep = layer.volume * (dtMs / AUDIO_FADE_MS);
            const next = current + Math.max(-maxStep, Math.min(maxStep, target - current));
            layerVolumes[layer.id] = next;
            el.volume = AudioSettings.gain(next);

            if (next > 0.0005 && el.paused) {
                // First play of a trimmed bed has to enter its window too, not just the
                // loops after it -- otherwise the very first pass replays the lead-in that
                // attachLoopWindow exists to skip.
                if (layer.startAt && el.currentTime < layer.startAt) {
                    try {
                        el.currentTime = layer.startAt;
                    } catch (err) {
                        el.addEventListener('loadedmetadata', () => { el.currentTime = layer.startAt; }, { once: true });
                    }
                }
                el.play().catch(() => {});
            }
        });

        audioCueDefs.forEach(cue => {
            const el = audioCues[cue.id];
            if (pos >= cue.at - AUDIO_PRELOAD_LEAD) warmAudio(cue.id, el);

            if (pos >= cue.at && !firedCues.has(cue.id)) {
                firedCues.add(cue.id);
                playOneShot(el, cue.volume, cue.maxDuration, cue.startAt, cue.fadeIn);
            } else if (pos < cue.at - AUDIO_CUE_REARM) {
                // Re-arm once the user has gone back clear of the trigger point.
                firedCues.delete(cue.id);
            }
        });

        audioMotionDefs.forEach(def => {
            const el = audioMotion[def.id];
            const st = motionState[def.id];
            if (pos >= def.warmAt - AUDIO_PRELOAD_LEAD) warmAudio(def.id, el);

            // Energy is only ever added by setMotion; here it just drains. With no further
            // movement this reaches silence in about 250ms, which is what makes the sound
            // stop when the user stops scrolling rather than when the gesture completes.
            st.energy *= Math.pow(MOTION_DECAY, dtMs / 16);
            const target = Math.min(1, st.energy / MOTION_FULL_PX) * def.volume;

            const maxStep = def.volume * (dtMs / MOTION_RAMP_MS);
            st.level += Math.max(-maxStep, Math.min(maxStep, target - st.level));
            // Snap relative to this sound's own peak: an exponential tail never quite
            // reaches zero, and 1% of peak is already far below audible under a bed.
            if (st.level < def.volume * 0.01) st.level = 0;
            el.volume = AudioSettings.gain(st.level);

            // Unlike a bed, a motion sound is idle most of the time, so it is paused when
            // silent rather than left looping under a zero volume.
            if (st.level > 0 && el.paused) el.play().catch(() => {});
            else if (st.level === 0 && !el.paused) el.pause();
        });
    }

    // Called from the three set-piece apply* functions with that gesture's own 0..1
    // progress. It records movement, not position: the rAF loop above turns accumulated
    // movement into level and drains it when the movement stops.
    function setMotion(id, t) {
        const st = motionState[id];
        const def = AUDIO_CONFIG.motion[id];
        if (!st || !def || !def.src) return;

        // Converted back into px via span, so one wheel tick weighs the same in every
        // gesture regardless of whether its threshold is 450px or 4500px.
        const stepT = Math.abs(t - st.lastT);
        const stepPx = stepT * def.span;
        st.lastT = t; // tracked even while muted, so unmuting mid-drag sees a small delta
        if (isMuted() || !audioUnlocked) return;
        if (stepT >= MOTION_RESET_T || stepPx > MOTION_MAX_PX) return; // a reset -- see above
        st.energy = Math.min(MOTION_MAX_ENERGY, st.energy + stepPx);
        kickAudioLoop();
    }

    // The loop only runs while there is something to do: a gesture landed recently, or a
    // bed is still ramping toward its target. Otherwise it stops, so a page sitting idle
    // on one scene is not burning a frame callback forever.
    let audioRafId = null;
    let audioLastFrame = 0;
    let audioLastKick = 0;

    function audioNow() {
        return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    }

    function audioFrame(now) {
        const dt = Math.min(now - audioLastFrame, 100); // clamp a tab-switch stall
        audioLastFrame = now;
        updateAudio(readScenePos(), dt);

        const ramping = audioLayerDefs.some(
            l => Math.abs(layerVolumes[l.id] - layerTargets[l.id]) > 0.0005
        ) || audioMotionDefs.some(
            // A motion sound still draining has to keep the loop alive, or it would be
            // left stuck at whatever level it held when the last gesture stopped.
            d => motionState[d.id].level > 0 || motionState[d.id].energy > 0.5
        );
        if (now - audioLastKick < AUDIO_IDLE_MS || ramping) {
            audioRafId = requestAnimationFrame(audioFrame);
        } else {
            audioRafId = null;
        }
    }

    function kickAudioLoop() {
        audioLastKick = audioNow();
        if (audioRafId === null) {
            audioLastFrame = audioLastKick;
            audioRafId = requestAnimationFrame(audioFrame);
        }
    }

    // The mute button and its speaker icons live in js/audio-settings.js now -- the
    // same control was duplicated verbatim in all three page scripts. This just mounts
    // it and wires the two things the shared module cannot know: that an unmute click
    // is itself this page's unlocking gesture, and which mixer to re-run on a change.
    //
    // The navbar is safe to query for: js/navbar.js is a synchronous IIFE that has
    // already written its markup by the time this runs, and never rewrites it.
    function createAudioControls() {
        AudioSettings.mountControls(document.getElementById('lang-toggle'), () => {
            audioUnlocked = true; // this click itself counts as the unlocking gesture
            playSfx('uiClick');
        });

        // Fires on mute and unmute.
        AudioSettings.onChange(() => {
            // dt 0: muting silences instantly (the muted branch ignores dt), unmuting
            // just sets targets and lets the loop ramp them up from zero.
            updateAudio(readScenePos(), 0);
            kickAudioLoop();
        });
    }

    function initChapter2Audio() {
        if (!audioTrackEl) return;
        createAudioControls();

        // The module's own listeners, deliberately separate from handleWheel: they are
        // passive and do not call preventDefault, so the navigation state machine and
        // its priority chains stay completely untouched. unlockAudio is idempotent and
        // returns immediately once unlocked, so it is cheap to call on every gesture --
        // and calling it repeatedly is what lets a rejected first attempt retry.
        function onAudioGesture() {
            unlockAudio();
            kickAudioLoop();
        }

        window.addEventListener('wheel', onAudioGesture, { passive: true });
        window.addEventListener('touchstart', onAudioGesture, { passive: true });
        window.addEventListener('touchmove', onAudioGesture, { passive: true });
        window.addEventListener('click', onAudioGesture);
    }

    initChapter2Audio();

    // ===== CHAPTER 2 AUDIO -- END =====

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
            if (newIndex === 10 && sceneIndex === 9) resetScene11Text();
            if (newIndex === 9 && sceneIndex === 10) resetScene11Text();
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
            setMotion('coinSpin', t);
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
            setMotion('glyphRoll', t); // track is parked for the first 70% here, so the
                                       // audio position alone cannot see this gesture
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
            setMotion('sphinxEnter', t);
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
            setMotion('pharaohEnter', t); // called with 0 to reset on leaving -- see MOTION_RESET_T
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
            setMotion('textReveal', t);
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
            setMotion('sphinxGrind', t);
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
            const discT = scene10DiscProgress / SCENE10_DISC_LOOP_THRESHOLD;
            const rawVh = discT * CYCLE_VH;
            scene10DiscEls.forEach(({ el, dir, restVh }) => {
                el.style.animation = 'none'; // release from the idle CSS bob loop
                el.style.transform = `translateY(${scene10DiscOffsetVh(rawVh, dir, restVh)}vh)`;
            });
            armScene10DiscIdleSway();
            setMotion('discFlow', discT);
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
            playSfx('sledgeClick');
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
            setMotion('featherWrite', t);
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

        // Scene 11's closing sentence rises into place under the scroll itself instead of
        // fading in on a timer — the same "the scroll IS the animation" idea as every other
        // gesture in this chapter, and started as a direct mirror of Chapter 1's ending (see
        // "Scene 1.5 Ending Text floats up" in js/chapter1.js, which drives a 50 -> -100px
        // travel off its scroll progress). The end point was pulled down to -50px on request
        // — Chapter 1's -100px sat too high here — so the two chapters no longer share the
        // exact travel, only the mechanism.
        let scene11TextProgress = 0;
        const SCENE11_TEXT_THRESHOLD = 1200; // px of wheel delta for the full rise -- matches the SCENE7/8/9 exit thresholds

        function applyScene11Text() {
            updateScrollDebug('scene11-text', scene11TextProgress, SCENE11_TEXT_THRESHOLD);
            const t = scene11TextProgress / SCENE11_TEXT_THRESHOLD;
            // Fade completes at 80% of the travel, so the last stretch is pure movement
            // and the sentence is fully readable before it stops.
            scene11TextEl.style.opacity = mapRange(t, 0, 0.8, 0, 1);
            const y = mapRange(t, 0, 1, 50, -50);
            // The CSS resting transform is translate(-50%, -50%) and an inline transform
            // REPLACES it outright, so the centring has to be reproduced here rather than
            // just the offset -- same trap as Scene 8's mirrored sphinx.
            scene11TextEl.style.transform = `translate(-50%, calc(-50% + ${y}px))`;
        }

        // Both arrival directions do the same thing: park the sentence hidden and low,
        // ready for the gesture to run again. Arriving forward is not special any more --
        // it used to replay a CSS fade-in and needed a forced reflow to do so.
        function resetScene11Text() {
            scene11TextProgress = 0;
            applyScene11Text();
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
            playSfx('slideChange'); // the carousel is the one place a scene changes without moving the track
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

            if (sceneIndex === 10) {
                // The closing sentence rises under the scroll -- see applyScene11Text. A live
                // gesture takes top priority and unwinds on reversal before the return to
                // Scene 10 is allowed, exactly as scene10DiscProgress guards the
                // sceneIndex===9 branch above.
                if (scene11TextProgress > 0) {
                    // Clamped at both ends. Forward at the cap deliberately does nothing more:
                    // this is the last scene of the chapter, so the sentence rises, stops, and
                    // stays there. It is the one gesture in the file that is not a handoff.
                    scene11TextProgress = Math.max(0, Math.min(SCENE11_TEXT_THRESHOLD, scene11TextProgress + e.deltaY));
                    applyScene11Text();
                    return;
                }

                if (e.deltaY > 0) {
                    scene11TextProgress = Math.min(SCENE11_TEXT_THRESHOLD, e.deltaY);
                    applyScene11Text();
                } else if (e.deltaY < 0) {
                    goToScene(9);
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
