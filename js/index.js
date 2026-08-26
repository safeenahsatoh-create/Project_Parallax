document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Management
    let erasData = [];
    let currentLang = localStorage.getItem('lang') || 'th';

    // Handle Return Transition
    if (document.documentElement.classList.contains('returning')) {
        setTimeout(() => {
            document.documentElement.classList.add('loaded');
        }, 50);
    }

    // Static Image URLs mapping
    const eraImages = [
        "assets/img/hero/Homo habilis.PNG", // 1
        "assets/img/chapter2/mayan_pyramid.png", // 2
        "https://images.unsplash.com/photo-1505501861961-d6f78fcd4703?q=80&w=2000&auto=format&fit=crop", // 3
        "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop", // 4
        "https://images.unsplash.com/photo-1533230488583-36cb926cb17c?q=80&w=2000&auto=format&fit=crop", // 5
        "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=2000&auto=format&fit=crop"  // 6
    ];

    // DOM Elements Cache
    const sliderTrack = document.getElementById('slider-track');
    const textContainer = document.getElementById('text-container');
    const eraCategory = document.getElementById('era-category');
    const eraTitle = document.getElementById('era-title');
    const eraDescription = document.getElementById('era-description');
    const eraLink = document.getElementById('era-link');
    const sliderContainer = document.getElementById('slider-container');
    const langToggleBtn = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');

    // Hero Data for translation
    const heroContent = {
        th: { title: "วิวัฒนาการของเทคโนโลยี", subtitle: "การเดินทางข้ามกาลเวลา", navEras: "ยุคสมัย", navAbout: "เกี่ยวกับ" },
        en: { title: "The Evolution of Technology", subtitle: "A Journey Through Time", navEras: "Eras", navAbout: "About" }
    };

    // State Variables
    let currentIndex = 0;
    let isScrolling = false; // Throttle flag to prevent rapid jumping
    let currentView = 'hero'; // 'hero' or 'main'

    // Audio Configuration
    // Two music beds crossfade with the view: bgmHero on the landing screen, bgmEras on
    // the era picker. Volumes and file paths are one-line edits here; see
    // assets/audio/index/README.txt for what each slot wants.
    //
    // Real files go in assets/audio/index/ under their ORIGINAL download name (same rule
    // as the chapter folders — the name is the attribution). Entries marked STAND-IN
    // borrow a chapter file so the page has sound before the real tracks land; swap the
    // path for 'assets/audio/index/<your-file>.mp3' as each one arrives.
    const AUDIO_DIR = 'assets/audio/index/';

    const AUDIO_CONFIG = {
        beds: {
            // The volumes are set by the view's needs, not the file's: bgmEras sits lower
            // because the slide whoosh plays over it constantly. See the README for the
            // loop-seam measurements on both of these files.
            bgmHero: {
                src: AUDIO_DIR + 'mfcc-ambient-ambient-music-479762.mp3', // 51.7s
                volume: 0.40
            },
            bgmEras: {
                // Higher than bgmHero despite sitting under the slide whoosh, because this
                // file is intrinsically much quieter: mean global_gain 142 against mfcc's
                // 163. Matching numbers here would not have matched loudness.
                src: AUDIO_DIR + 'samuelfjohanns-ancient-99556.mp3', // 27.5s
                volume: 0.55
            }
        },
        sfx: {
            // Shared with both chapters rather than duplicated — same click, same folder.
            uiClick: { src: 'assets/audio/chapter1/universfield-mouse-click-351398.mp3', volume: 0.35, startAt: 0.10 },
            // 0.30, not 0.40: this is the same file in the same role as Chapter 2's
            // slideChange, which sits at 0.30, and it fires on every era change over a
            // bed running at 0.55. Two pages, one whoosh, one level.
            slideChange: { src: 'assets/audio/chapter2/dragon-studio-simple-whoosh-382724.mp3', volume: 0.30 }, // STAND-IN
            viewTransition: { src: AUDIO_DIR + 'lordsonny-whoosh-cinematic-161021.mp3', volume: 0.45 },
            // startAt measured, not guessed: the file rises 110->146 (global_gain) over its
            // first 0.78s and plateaus after. Only ~350ms is audible before the page
            // navigates, so starting at 0.50 puts that window on the body of the sound
            // instead of its attack.
            enterChapter: { src: 'assets/audio/chapter1/universfield-mystic-reveal-567294.mp3', volume: 0.40, maxDuration: 1.2, startAt: 0.50 } // STAND-IN
        }
    };

    // How long the hero <-> eras crossfade takes. Matches the 1.5s white flash in
    // scrollToMain/scrollToHero, so the swap finishes exactly as the screen clears.
    const BED_CROSSFADE_MS = 1500;

    // Delay before the Enter Chapter link navigates, so its sound is audible first.
    // Same 350ms the navbar's light flash uses in js/navbar.js.
    const ENTER_CHAPTER_DELAY_MS = 350;

    const audioBeds = {};
    Object.keys(AUDIO_CONFIG.beds).forEach(key => {
        const el = new Audio(AUDIO_CONFIG.beds[key].src);
        el.loop = true;
        el.volume = 0;
        el.preload = 'auto'; // only two beds on this page, both wanted within a few seconds
        audioBeds[key] = el;
    });

    const audioSfx = {};
    Object.keys(AUDIO_CONFIG.sfx).forEach(key => {
        const el = new Audio(AUDIO_CONFIG.sfx[key].src);
        el.preload = 'auto'; // all short one-shots
        audioSfx[key] = el;
    });

    // Mute lives in js/audio-settings.js, shared with both chapters,
    // so muting here carries into a chapter instead of stopping at the page boundary.
    const isMuted = () => AudioSettings.muted;
    let audioUnlocked = false; // true once a real user gesture has let audio start playing

    // 2. Initialize Slider Images dynamically
    function initSlider() {
        erasData.forEach((era, index) => {
            const slide = document.createElement('div');
            slide.classList.add('slide');
            if (index === 0) slide.classList.add('active'); // First slide is active initially

            const img = document.createElement('img');
            img.src = eraImages[index] || eraImages[0];
            img.alt = era[currentLang].title;
            if (index === 1) img.classList.add('era-cover-contain');

            slide.appendChild(img);
            sliderTrack.appendChild(slide);
        });

        // Set initial text without animation
        updateTextContent(0);
    }

    // 3. Sync Logic: Instant Text Update with Language Support
    function updateTextContent(index) {
        if (!erasData || erasData.length === 0) return;

        const data = erasData[index];
        const langData = data[currentLang];

        // Update DOM Elements with new data immediately
        eraCategory.textContent = langData.subtitle;
        eraTitle.textContent = langData.title;
        eraDescription.textContent = langData.description;

        const btnSpan = eraLink.querySelector('span');
        if (btnSpan) btnSpan.textContent = langData.button;

        eraLink.href = data.link;
    }

    // 4. Logic to Update Slider Position (Vertical)
    function updateSliderPosition() {
        // Each slide height equals the viewport height
        const slideHeight = window.innerHeight;
        // Move track by multiplying index by negative slideHeight (Translate Y)
        sliderTrack.style.transform = `translateY(-${currentIndex * slideHeight}px)`;

        // Update active class for nested zoom effects
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    // 5. Scroll & Swipe Engine (Universal Support)

    // Core Scroll Logic (Hero to Main, No Loop)
    function processScroll(delta) {
        if (isScrolling) return;

        if (currentView === 'hero') {
            if (delta > 0) {
                // Scroll down from Hero to Main Section
                scrollToMain();
            }
        } else if (currentView === 'main') {
            if (delta > 0) {
                // Scroll down: next slide
                if (currentIndex < erasData.length - 1) {
                    currentIndex++;
                    triggerUpdate();
                }
            } else if (delta < 0) {
                // Scroll up: previous slide or back to hero
                if (currentIndex > 0) {
                    currentIndex--;
                    triggerUpdate();
                } else {
                    // At chapter 1, scroll up goes back to hero
                    scrollToHero();
                }
            }
        }
    }

    function scrollToMain() {
        isScrolling = true;

        // Audio rides the flash: the whoosh hits as the white starts, and the beds swap
        // over the same 1.5s so the new track is fully in when the screen clears.
        playSfx('viewTransition');
        crossfadeBedsTo('main', BED_CROSSFADE_MS);

        // Trigger Light Effect (White out)
        document.getElementById('hero').classList.add('light-transition');

        // Prepare Split Layout to be white
        const splitLayout = document.querySelector('.split-layout');
        splitLayout.classList.add('flash-active');

        // Wait for white flash to fill screen before translating layout
        setTimeout(() => {
            currentView = 'main';
            const appContainer = document.getElementById('app-container');

            // Disable transition for an instant cut
            appContainer.style.transition = 'none';
            appContainer.style.transform = `translateY(-100vh)`;

            // Force reflow
            void appContainer.offsetHeight;

            // Re-enable transition
            appContainer.style.transition = '';

            document.getElementById('nav-eras').classList.add('active');

            // Now start fading out the white flash
            setTimeout(() => {
                splitLayout.classList.remove('flash-active');
            }, 50);

            setTimeout(() => { isScrolling = false; }, 1200); // Cooldown for translating
        }, 1500); // Wait for the light flash
    }

    function scrollToHero() {
        isScrolling = true;

        playSfx('viewTransition');
        crossfadeBedsTo('hero', BED_CROSSFADE_MS);

        const hero = document.getElementById('hero');
        const splitLayout = document.querySelector('.split-layout');
        
        // 1. Prepare hero section in the background by setting it to massive light state
        // Its white overlay will fade in over 1.5s
        hero.classList.add('light-transition');
        
        // 2. Fade split layout to solid white over 1.5s
        splitLayout.classList.add('flash-out');
        
        // Wait for both to turn solid white
        setTimeout(() => {
            currentView = 'hero';
            const appContainer = document.getElementById('app-container');
            
            // Snap to hero section instantly
            appContainer.style.transition = 'none';
            appContainer.style.transform = `translateY(0)`;
            
            void appContainer.offsetHeight; // Force reflow
            appContainer.style.transition = '';
            
            document.getElementById('nav-eras').classList.remove('active');
            splitLayout.classList.remove('flash-out');
            
            // Now that we are on hero section (which is white), we remove light-transition
            // This triggers the light to shrink from scale(40) to scale(1) over 2s
            // And the white overlay will fade out over 1.5s (after a 0.5s delay)
            setTimeout(() => {
                hero.classList.remove('light-transition');
                
                setTimeout(() => {
                    isScrolling = false;
                }, 2000);
            }, 50);
            
        }, 1500); // Wait 1.5s for flash to cover screen
    }

    // Desktop: Mouse Wheel (Global)
    function handleWheel(e) {
        e.preventDefault(); // Stop default vertical page scrolling
        unlockAudio(); // first wheel is usually the page's first user gesture
        const delta = Math.sign(e.deltaY);
        processScroll(delta);
    }

    // Navigation Click Listeners
    document.getElementById('nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        if (isScrolling || currentView === 'hero') return;

        playSfx('uiClick');

        // Reset to first slide automatically when returning to hero
        currentIndex = 0;
        updateSliderPosition();
        updateTextContent(currentIndex);

        scrollToHero();
    });

    document.getElementById('nav-eras').addEventListener('click', (e) => {
        e.preventDefault();
        if (isScrolling || currentView === 'main') return;
        playSfx('uiClick');
        scrollToMain();
    });

    // Enter Chapter: hold the navigation back briefly so its sound is actually heard —
    // leaving the page mid-play would cut it off. Same 350ms as the navbar's light flash.
    eraLink.addEventListener('click', (e) => {
        const href = eraLink.getAttribute('href');
        if (!href || href === '#') return;

        e.preventDefault();
        playSfx('enterChapter');
        setTimeout(() => { window.location.href = href; }, ENTER_CHAPTER_DELAY_MS);
    });

    // Tablet/iPad: Touch Swipe
    let startY = 0;
    const touchSensitivity = 40; // Minimum distance to register as a swipe

    function handleTouchStart(e) {
        unlockAudio(); // touch equivalent of the wheel gesture above
        startY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (isScrolling || !startY) return;

        const currentY = e.touches[0].clientY;
        const diffY = startY - currentY; // Positive = Swipe Up (Scroll Down)

        if (Math.abs(diffY) > touchSensitivity) {
            e.preventDefault(); // Prevent native scroll
            const delta = Math.sign(diffY);
            processScroll(delta);
            startY = 0; // Reset after trigger
        }
    }

    function handleTouchEnd() {
        startY = 0;
    }

    function triggerUpdate() {
        isScrolling = true;

        playSfx('slideChange');

        // Sync both visuals and text
        updateSliderPosition();
        updateTextContent(currentIndex);

        // Throttle matching the CSS transition duration
        setTimeout(() => {
            isScrolling = false;
        }, 1200); // 1.2s cooldown provides a natural pace
    }

    // Removed transition overlays and typewriter functions per user request

    // Global Event Listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 6. Language Switcher Logic
    function applyLang(lang) {
        document.documentElement.lang = lang;
        if (lang === 'th') {
            langText.textContent = 'EN';
        } else {
            langText.textContent = 'TH';
        }

        // Update Hero and Nav text
        document.getElementById('hero-title').textContent = heroContent[lang].title;
        document.getElementById('hero-subtitle').textContent = heroContent[lang].subtitle;
        document.getElementById('nav-eras').textContent = heroContent[lang].navEras;
        document.getElementById('nav-about').textContent = heroContent[lang].navAbout;

        if (erasData.length > 0) {
            updateTextContent(currentIndex);
        }
    }

    langToggleBtn.addEventListener('click', () => {
        playSfx('uiClick');
        currentLang = currentLang === 'th' ? 'en' : 'th';
        localStorage.setItem('lang', currentLang);
        applyLang(currentLang);
    });

    // 7. Audio System
    // Starts the bed that matches the view we're actually on — landing on ?era=N opens
    // straight into the era picker, so it must be bgmEras there, not bgmHero.
    //
    // Called twice over: once at the end of initApp on the chance the browser allows
    // autoplay, and again from the first wheel/touch/click. Browsers block non-muted
    // playback until a real user gesture, but the bar is per-origin rather than absolute
    // (Chrome's Media Engagement Index lets a frequently visited site through), so the
    // load-time attempt is worth making. When it is refused the catch below leaves
    // audioUnlocked false and the gesture listeners retry, which is the old behaviour
    // exactly — a blocked autoplay costs nothing.
    //
    // NOTE FOR TESTING: on localhost the load-time attempt nearly always succeeds, because
    // we visit it constantly. That says nothing about a first-time visitor. Check that case
    // in a fresh incognito window.
    function unlockAudio() {
        if (audioUnlocked) return;
        if (isMuted()) {
            // Nothing to play while muted, but stop trying on every later gesture.
            audioUnlocked = true;
            return;
        }
        const bed = currentView === 'hero' ? audioBeds.bgmHero : audioBeds.bgmEras;
        bed.play()
            .then(() => {
                audioUnlocked = true;
                crossfadeBedsTo(currentView, 600);
            })
            .catch(() => { /* rejected — retry on the next qualifying gesture */ });
    }

    // Ramps one bed toward `target` over `ms`. `target` is an ELEMENT volume, already
    // through AudioSettings.gain() — the ramp reads `from` off el.volume, so both ends
    // are on the same scale.
    // A bed that reaches 0 keeps playing silently
    // instead of pausing, so sliding back to the other view resumes mid-loop rather than
    // restarting the track. The timer lives on the element so a new fade cancels the old
    // one — otherwise a fast hero/eras flip leaves two fades fighting over the volume.
    function fadeBed(el, target, ms) {
        clearInterval(el.indexFadeTimer);

        if (isMuted() || !audioUnlocked) {
            el.volume = 0;
            return;
        }
        if (target > 0 && el.paused) el.play().catch(() => {});

        const stepMs = 25;
        const steps = Math.max(1, Math.round(ms / stepMs));
        const from = el.volume;
        let step = 0;
        el.indexFadeTimer = setInterval(() => {
            step++;
            el.volume = Math.max(0, Math.min(1, from + (target - from) * (step / steps)));
            if (step >= steps) clearInterval(el.indexFadeTimer);
        }, stepMs);
    }

    // Takes the view to fade *towards* rather than reading currentView, because the
    // transitions start the crossfade while the white flash is still covering the screen —
    // currentView doesn't flip until 1.5s later, halfway through the fade.
    function crossfadeBedsTo(view, ms) {
        fadeBed(audioBeds.bgmHero, view === 'hero' ? AudioSettings.gain(AUDIO_CONFIG.beds.bgmHero.volume) : 0, ms);
        fadeBed(audioBeds.bgmEras, view === 'hero' ? 0 : AudioSettings.gain(AUDIO_CONFIG.beds.bgmEras.volume), ms);
    }

    // Plays a one-shot, restarting it if it's already playing so repeated clicks give a
    // clean repeated hit instead of stacking. maxDuration trims clips that run longer than
    // the moment needs, ramping the volume down first so the cut doesn't pop. startAt seeks
    // past a file's own lead-in so the sound lands on the same frame as the click.
    function playSfx(key) {
        const cfg = AUDIO_CONFIG.sfx[key];
        const audioEl = audioSfx[key];
        if (!cfg || !audioEl || isMuted()) return;

        // Resolved once so the start level and the tail fade below agree even if the
        // visitor mutes while the clip is still playing.
        const volume = AudioSettings.gain(cfg.volume);

        clearInterval(audioEl.indexFadeTimer);
        clearTimeout(audioEl.indexStopTimer);

        // Seeking throws if metadata isn't loaded yet. Failing silently here would put the
        // lead-in back, so fall back to a listener that applies the offset once it can.
        const from = cfg.startAt || 0;
        try {
            audioEl.currentTime = from;
        } catch (err) {
            audioEl.addEventListener('loadedmetadata', () => { audioEl.currentTime = from; }, { once: true });
        }
        audioEl.volume = volume;
        audioEl.play().catch(() => {});

        if (!cfg.maxDuration) return;

        const fadeMs = 250;
        const stepMs = 25;
        const steps = fadeMs / stepMs;
        audioEl.indexStopTimer = setTimeout(() => {
            let step = 0;
            audioEl.indexFadeTimer = setInterval(() => {
                step++;
                audioEl.volume = Math.max(0, volume * (1 - step / steps));
                if (step >= steps) {
                    clearInterval(audioEl.indexFadeTimer);
                    audioEl.pause();
                }
            }, stepMs);
        }, Math.max(0, cfg.maxDuration * 1000 - fadeMs));
    }

    // The mute button and its speaker icons live in js/audio-settings.js now — the
    // same control was duplicated verbatim in all three page scripts. This just mounts
    // it and wires the two things the shared module cannot know: that an unmute click
    // is itself this page's unlocking gesture, and which mixer to re-run on a change.
    function createAudioControls() {
        AudioSettings.mountControls(langToggleBtn, () => {
            audioUnlocked = true; // this click itself counts as the unlocking gesture
            playSfx('uiClick');
        });

        // Fires on mute and unmute, so the beds follow the click rather than waiting
        // for the next view flip.
        AudioSettings.onChange(() => {
            crossfadeBedsTo(currentView, 400);
        });
    }

    // Startup Initialization
    async function initApp() {
        // Initialize Lang
        applyLang(currentLang);

        // Audio mute toggle
        createAudioControls();

        // Fallback unlock: covers anyone who clicks a nav control before ever scrolling.
        // Runs after the button handlers, so a click on "mute" is already reflected.
        document.addEventListener('click', unlockAudio, { once: true });

        // Ensure we start at hero section
        document.getElementById('nav-eras').classList.remove('active');

        // Fetch Data
        try {
            const response = await fetch('assets/data/content.json');
            if (!response.ok) throw new Error("Failed to fetch content.json");
            const data = await response.json();
            erasData = data.chapters;

            initSlider();

            // Check URL for era parameter to snap back to a specific era
            const urlParams = new URLSearchParams(window.location.search);
            const targetEra = urlParams.get('era');
            if (targetEra !== null) {
                const eraIndex = parseInt(targetEra, 10);
                if (!isNaN(eraIndex) && eraIndex >= 0 && eraIndex < erasData.length) {
                    currentIndex = eraIndex;
                    updateSliderPosition();
                    updateTextContent(currentIndex);

                    // Instantly snap to main layout
                    currentView = 'main';
                    document.getElementById('app-container').style.transition = 'none';
                    document.getElementById('app-container').style.transform = `translateY(-100vh)`;
                    document.getElementById('nav-eras').classList.add('active');

                    // Re-enable transition after a short delay
                    setTimeout(() => {
                        document.getElementById('app-container').style.transition = '';
                    }, 50);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback gracefully or show error UI if necessary
        }

        // Try to start the music without waiting for a gesture. Must run after the block
        // above: ?era=N is what sets currentView to 'main', and unlockAudio picks its bed
        // from that. If the browser refuses, this is a no-op and the gesture path takes over.
        unlockAudio();
    }

    initApp();
});
