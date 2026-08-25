/* =========================================================================
   SHARED AUDIO SETTINGS
   =========================================================================
   The one thing the three audio engines share. It is deliberately NOT an audio
   manager: index.js, chapter1.js and chapter2.js keep their own mixers because
   they are driven by genuinely different things (a view flip, a scroll position,
   and a scene position plus motion energy). What they had no business keeping
   separate was the *settings* — mute lived under three localStorage keys, so
   muting the index and then opening a chapter played it at full level, and there
   was no volume control anywhere.

   What lives here:
     - mute state, under ONE key shared by every page (like 'lang' already is)
     - a master volume multiplier, 0..1
     - the navbar controls for both
     - gain(), which every engine runs its levels through

   What does NOT live here: the levels themselves. Those stay in each page's own
   AUDIO_CONFIG, which is still where the mix is balanced. This only scales them.
   Each folder under assets/audio/ has a README.txt with the per-slot rationale.
   ========================================================================= */
(function () {
    'use strict';

    const MUTE_KEY = 'audioMuted';
    const VOLUME_KEY = 'audioVolume';

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

    function readMaster() {
        const stored = parseFloat(localStorage.getItem(VOLUME_KEY));
        // Default 1, so adding the slider changes nothing for anyone who never
        // touches it — every level stays exactly what its AUDIO_CONFIG says.
        if (!isFinite(stored)) return 1;
        return Math.max(0, Math.min(1, stored));
    }

    let muted = readMuted();
    let master = readMaster();
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
        get master() { return master; },

        // Every engine's `el.volume = ...` goes through this. Muting is instant and
        // absolute rather than a ramp to zero, which is what the chapter mixers
        // already assumed when they short-circuited on isMuted.
        gain(volume) {
            if (muted) return 0;
            return Math.max(0, Math.min(1, volume * master));
        },

        // Called whenever mute or master changes, so the page can re-run its mixer
        // and have the slider take effect mid-drag instead of at the next scroll.
        onChange(fn) {
            if (typeof fn === 'function') listeners.push(fn);
        },

        setMuted(value) {
            storeMuted(value);
            notify();
        },

        setMaster(value) {
            master = Math.max(0, Math.min(1, value));
            localStorage.setItem(VOLUME_KEY, String(master));
            notify();
        },

        /* Builds the mute button and volume slider into .nav-right, just left of the
           language toggle, so the navbar's own flex layout positions them — no fixed
           offsets to break at other widths. index.html has its navbar as static
           markup; the chapters build theirs in js/navbar.js. Either way it is in the
           DOM by the time a page script runs.

           `onUnmute` is the page's hook for the one thing that cannot live here: an
           unmute click is itself a user gesture, so it is the page's chance to mark
           its audio unlocked and play its click sound. */
        mountControls(langToggleBtn, onUnmute) {
            const btn = document.createElement('button');
            btn.id = 'audio-toggle';
            btn.className = 'control-btn audio-toggle';

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = 'audio-volume';
            slider.className = 'audio-volume';
            slider.min = '0';
            slider.max = '100';
            slider.step = '1';
            slider.value = String(Math.round(master * 100));
            slider.setAttribute('aria-label', 'Volume');

            function paint() {
                btn.innerHTML = muted ? ICON_SOUND_OFF : ICON_SOUND_ON;
                btn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
                btn.setAttribute('aria-pressed', String(muted));
                // The slider is meaningless while muted, and saying so out loud beats
                // leaving a live-looking control that does nothing audible.
                slider.disabled = muted;
                slider.setAttribute('aria-valuetext', Math.round(master * 100) + '%');
            }
            paint();

            const navRight = document.querySelector('.nav-right');
            if (navRight && langToggleBtn) {
                navRight.insertBefore(btn, langToggleBtn);
                navRight.insertBefore(slider, langToggleBtn);
            } else {
                // Navbar missing — fall back to the corner so the controls never vanish.
                document.body.appendChild(btn);
                document.body.appendChild(slider);
                btn.classList.add('audio-toggle-floating');
                slider.classList.add('audio-volume-floating');
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

            slider.addEventListener('input', () => {
                AudioSettings.setMaster(parseInt(slider.value, 10) / 100);
                slider.setAttribute('aria-valuetext', Math.round(master * 100) + '%');
            });

            return btn;
        }
    };

    window.AudioSettings = AudioSettings;
})();
