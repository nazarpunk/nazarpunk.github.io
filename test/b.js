"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.o = void 0;
exports.o = new IntersectionObserver((entries, observer) => entries.forEach(entry => {
    const $model = entry.target;
    if (entry.isIntersecting)
        $model.style.removeProperty(`visibility`);
    else
        return $model.style.visibility = `hidden`;
    const $noscript = $model.querySelector(`noscript.picture-noscript`);
    if ($noscript !== null) {
        $noscript.insertAdjacentHTML(`afterend`, $noscript.innerText);
        const $img = $noscript.nextElementSibling;
        $img.addEventListener(`load`, () => {
            fetch($img.currentSrc).then(r => {
                if (!r.ok)
                    return;
                $model.style.backgroundImage = `url(${r.url})`;
                setTimeout(() => $img.remove(), 500);
            });
        });
        $noscript.remove();
    }
}), {
    root: document.body,
    rootMargin: '25%',
    threshold: 0
});

//# sourceMappingURL=b.js.map
