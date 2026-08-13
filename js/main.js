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
        const delta = Math.sign(e.deltaY);
        processScroll(delta);
    }

    // Navigation Click Listeners
    document.getElementById('nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        if (isScrolling || currentView === 'hero') return;

        // Reset to first slide automatically when returning to hero
        currentIndex = 0;
        updateSliderPosition();
        updateTextContent(currentIndex);

        scrollToHero();
    });

    document.getElementById('nav-eras').addEventListener('click', (e) => {
        e.preventDefault();
        if (isScrolling || currentView === 'main') return;
        scrollToMain();
    });

    // Tablet/iPad: Touch Swipe
    let startY = 0;
    const touchSensitivity = 40; // Minimum distance to register as a swipe

    function handleTouchStart(e) {
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
        currentLang = currentLang === 'th' ? 'en' : 'th';
        localStorage.setItem('lang', currentLang);
        applyLang(currentLang);
    });

    // Startup Initialization
    async function initApp() {
        // Initialize Lang
        applyLang(currentLang);

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
    }

    initApp();
});
