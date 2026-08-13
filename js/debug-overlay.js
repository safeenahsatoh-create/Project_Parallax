// Dev-only scroll-progress readout, shared across every chapter page. Include
// with <script src="js/debug-overlay.js"></script> and call
// window.updateScrollDebug(label, current, max) from wherever a page already
// renders its own scroll-driven progress, to show "label / percent%" fixed at
// the left edge, vertically centered. No HTML/CSS changes needed anywhere else
// — remove the <script> tag when done tuning to remove this entirely.
(function () {
    const el = document.createElement('div');
    el.id = 'scroll-debug-overlay';
    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.top = '50%';
    el.style.transform = 'translateY(-50%)';
    el.style.zIndex = '9999';
    el.style.background = 'rgba(0, 0, 0, 0.75)';
    el.style.color = '#0f0';
    el.style.font = '12px/1.4 monospace';
    el.style.padding = '6px 10px';
    el.style.whiteSpace = 'pre';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);

    window.updateScrollDebug = function (label, current, max) {
        const pct = max > 0 ? Math.round((current / max) * 100) : 0;
        el.textContent = `${label}\n${pct}%`;
    };
})();
