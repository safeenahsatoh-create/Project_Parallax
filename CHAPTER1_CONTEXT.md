# CHRONOS: Chapter 1 (Stone Age) - AI Context

**Purpose of this file:** Provide an efficient architectural and technical overview of Chapter 1 so the AI can understand the codebase without needing to read every file, saving context tokens.

## 1. Project Overview
- **Name:** CHRONOS
- **Current Scope:** Chapter 1 (Stone Age)
- **Core Concept:** An interactive storytelling web application utilizing vertical parallax scrolling.
- **Tech Stack:** HTML5, Vanilla CSS, Vanilla JavaScript. No heavy frameworks.

## 2. Architecture & File Structure
- **`chapter1.html`**: The main view. Contains a massive `<div class="scroll-container">` (2200vh height) to allow long scrolling, and a fixed `<div class="parallax-viewport">` containing layers of images with explicit `z-index` values.
- **`css/chapter1.css`**: Manages the Z-Index matrix. Layers use `position: absolute`, and animations (like drifting clouds) are handled via CSS keyframes.
- **`js/chapter1.js`**: 
  - Handles the scroll event listener to manipulate layer transforms (`requestAnimationFrame` for performance).
  - Fetches bilingual text data from `assets/data/chapter1.json`.
  - Manages interactive click events for specific layers (e.g., character shadows, cave props).
- **`assets/data/chapter1.json`**: The Single Source of Truth for text content. Supports Thai (`th`) and English (`en`).

## 3. Scene Breakdown (Scroll Progression)
1. **Phase 0 (Prologue):** Starts with a black overlay (`#black-overlay`) and sequentially reveals introductory text.
2. **Phase 1-4 (Savanna):** Camera transitions from inside a dark cave out to a bright savanna. Features sky layers, sun, drifting clouds, and static animal layers (Deer, Elephant, Lion, Giraffe, Bird).
3. **Phase 5 (Hominids):** Introduces shadows of *Homo Habilis* and *Homo Erectus*. Users can click on these shadows to reveal the full character illustration and a text popup. Moving dinosaur footprints are at the bottom.
4. **Phase 6 & 7 (Night & Cave):** The sky transitions to night (stars, moon). The camera zooms back into a cave revealing early human tools and fire. Props are clickable to reveal informational popups.
5. **Ending (Scene 1.5):** Screen fades to black with closing text before transitioning to the next chapter.

## 4. Development Guidelines for AI
- **Modifying Text:** ALWAYS modify `assets/data/chapter1.json`. Do not hardcode text into the HTML or JS files.
- **Parallax Matrix:** When adding new image layers to `chapter1.html`, ensure they are assigned a specific `z-index` in `css/chapter1.css` to maintain depth sorting.
- **Performance:** Many layers use `will-change: transform`. Be cautious about adding too many heavy DOM elements or complex filters to avoid lag on mobile devices.
- **Translations:** Ensure any new UI element that contains text is wired up in the `applyLang()` function inside `js/chapter1.js`.
