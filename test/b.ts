export const o = new IntersectionObserver(
	(entries, observer) => entries.forEach(entry => {
		const $model = <HTMLElement>entry.target;
		
		if (entry.isIntersecting) $model.style.removeProperty(`visibility`);
		else return $model.style.visibility = `hidden`;
		
		const $noscript = $model.querySelector<HTMLElement>(`noscript.picture-noscript`);
		if ($noscript !== null) {
			$noscript.insertAdjacentHTML(`afterend`, $noscript.innerText);
			const $img = <HTMLImageElement>$noscript.nextElementSibling!;
			$img.addEventListener(`load`, () => {
				fetch($img.currentSrc).then(r => {
					if (!r.ok) return;
					$model.style.backgroundImage = `url(${r.url})`;
					setTimeout(() => $img.remove(), 500);
				});
			});
			$noscript.remove();
		}
	}),
	{
		root      : document.body,
		rootMargin: '25%',
		threshold : 0
	}
);