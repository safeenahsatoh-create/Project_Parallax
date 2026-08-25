/* =========================================================================
   SHARED AUDIO SETTINGS
   =========================================================================
   The one thing the three audio engines share. It is deliberately NOT an audio
   manager: index.js, chapter1.js and chapter2.js keep their own mixers because
   they are driven by genuinely different things (a view flip, a scroll position,
   and a scene position plus motion energy). What they had no business keeping
   separate was the *settings* — mute lived under three localStorage keys, so
   muting the index and then opening a chapter played it at full level.

   What lives here:
     - mute state, under ONE key shared by every page (like 'lang' already is)
     - the navbar mute button
     - gain(), which every engine runs its levels through

   There is deliberately no in-page volume control: the levels in each page's
   AUDIO_CONFIG are exactly what plays, and anyone who wants it louder or quieter
   uses their own device. gain() therefore only ever answers the mute question.
   Each folder under assets/audio/ has a README.txt with the per-slot rationale.
   ========================================================================= */
(function () {
    'use strict';

    const MUTE_KEY = 'audioMuted';

    // Read once, at load, before any page script builds its elements. Pages that
    // predate this module wrote their own key; carry that over so an existing
    // visitor's choice is not silently reset. Whichever page they last muted on
    // wins, which is the closest thing to their intent we can recover.
    const LEGACY_MUTE_KEYS = ['indexMuted', 'chapter1Muted', 'chapter2Muted'];

    function readMuted() {
        const stored = localStorage.getItem(MUTE_KEY);
        if (stored !== null) return stored === 'true';
        return LEGACY_MUTE_KEYS.some(key => localStorage.getItem(key) === 'true');
    }

    let muted = readMuted();
    const listeners = [];

    // Split out from setMuted so the button below can change the state, let the page
    // react to the gesture, and only THEN re-run the mixers. Order matters on unmute:
    // the page marks its audio unlocked inside its onUnmute hook, and a mixer that ran
    // before that would see audioUnlocked still false and set every bed to zero.
    function storeMuted(value) {
        muted = !!value;
        localStorage.setItem(MUTE_KEY, String(muted));
    }

    function notify() {
        listeners.forEach(fn => {
            try {
                fn();
            } catch (err) {
                // One page's mixer throwing must not stop the others from updating.
            }
        });
    }

    // Speaker icons, drawn to match the navbar's other controls (global.css styles
    // .control-btn svg with fill: currentColor, so they pick up the hover colour too).
    const ICON_SOUND_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
    const ICON_SOUND_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';

    const AudioSettings = {
        get muted() { return muted; },

        // Every engine's `el.volume = ...` goes through this. It is a pure mute gate:
        // the number a page asks for is the number it gets. Muting is instant and
        // absolute rather than a ramp to zero, which is what the chapter mixers
        // already assumed when they short-circuited on isMuted.
        gain(volume) {
            if (muted) return 0;
            return Math.max(0, Math.min(1, volume));
        },

        // Called whenever mute changes, so the page can re-run its mixer on the
        // click instead of waiting for the next scroll.
        onChange(fn) {
            if (typeof fn === 'function') listeners.push(fn);
        },

        setMuted(value) {
            storeMuted(value);
            notify();
        },

        /* Builds the mute button into .nav-right, just left of the language toggle,
           so the navbar's own flex layout positions it — no fixed offsets to break
           at other widths. index.html has its navbar as static markup; the chapters
           build theirs in js/navbar.js. Either way it is in the DOM by the time a
           page script runs.

           `onUnmute` is the page's hook for the one thing that cannot live here: an
           unmute click is itself a user gesture, so it is the page's chance to mark
           its audio unlocked and play its click sound. */
        mountControls(langToggleBtn, onUnmute) {
            const btn = document.createElement('button');
            btn.id = 'audio-toggle';
            btn.className = 'control-btn audio-toggle';

            function paint() {
                btn.innerHTML = muted ? ICON_SOUND_OFF : ICON_SOUND_ON;
                btn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
                btn.setAttribute('aria-pressed', String(muted));
            }
            paint();

            const navRight = document.querySelector('.nav-right');
            if (navRight && langToggleBtn) {
                navRight.insertBefore(btn, langToggleBtn);
            } else {
                // Navbar missing — fall back to the corner so the button never vanishes.
                document.body.appendChild(btn);
                btn.classList.add('audio-toggle-floating');
            }

            btn.addEventListener('click', () => {
                const wasMuted = muted;
                storeMuted(!muted);
                paint();
                // Before notify(), not after: this click is the page's unlocking gesture,
                // and the hook is where the page records that. Only on unmute — a click
                // sound when muting is contradictory, and the hook plays one.
                if (wasMuted && typeof onUnmute === 'function') onUnmute();
                notify();
            });

            return btn;
        }
    };

    window.AudioSettings = AudioSettings;
})();
