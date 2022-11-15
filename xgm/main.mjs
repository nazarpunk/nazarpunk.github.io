import {CUtil} from "./CUtil.mjs";

const light = document.querySelector('.container');

/** @type {HTMLElement} */
const dark = light.cloneNode(true);

light.classList.add('light');
dark.classList.add('dark');

light.insertAdjacentElement('afterend', dark);

light.insertAdjacentHTML('afterbegin', '<h1>Светлая тема</h1>');
dark.insertAdjacentHTML('afterbegin', '<h1>Тёмная тема</h1>');

const containers = [light, dark];

const theme = {
	background: ['#ececec', '#242424'],
	color: [],
};

/*
 3.0:1 minimum for texts larger than 18pt or icons (AA+).
 4.5:1 minimum for texts smaller than 18pt (AA).
 7.0:1 minimum when possible, if possible (AAA).
 */

const getContrastRatio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);

const setVar = (container, name, value) => {
	const a = new CUtil();
	a.hex(value);
	container.style.setProperty(`--${name}`, value);

	switch (name) {
		case 'background':
			const b = (new CUtil()).hex(a.hsluv.hex());

			b.hsluv.modify(null, null, b.hsluv.l > 80 ? -60 : 60);

			const div = container.querySelector('.background-text');
			div.innerHTML = `l: ${b.hsluv.l}`;
			div.innerHTML += `<br>&nbsp;&nbsp;Фон: ${a.hsluv.hex()} lum: ${a.rgb.luminance().toFixed(3)}`;
			div.innerHTML += `<br>Текст: ${b.hsluv.hex()} lum: ${b.rgb.luminance().toFixed(3)}`;

			const cr = getContrastRatio(a.rgb.luminance(), b.rgb.luminance());
			div.innerHTML += `<br>Text contrast ratio: ${cr.toFixed(3)}`;

			container.style.setProperty('--color', b.hsluv.hex());

			const c = (new CUtil()).hex(b.hsluv.hex());

			c.hsluv.modify(null, null, -40);

			const mcr = getContrastRatio(a.rgb.luminance(), c.rgb.luminance());
			div.innerHTML += `<br>Muted contrast ratio: ${mcr.toFixed(3)}`;

			div.innerHTML += `<br>${a.hsluv.h.toFixed(3)} | ${a.hsluv.s.toFixed(3)} | ${a.hsluv.l.toFixed(3)}`;
			div.innerHTML += `<br>${a.hsl.h.toFixed(3)} | ${a.hsl.s.toFixed(3)} | ${a.hsl.l.toFixed(3)}`;

			container.style.setProperty('--color-muted', c.hsluv.hex());

			break;
	}
};

for (let i = 0; i < 2; i++) {
	for (let [k, v] of Object.entries(theme)) {
		if (v.length !== 2) {
			continue;
		}
		const container = containers[i];

		setVar(container, k, v[i]);
		/** @type {HTMLInputElement} */
		const input = container.querySelector(`[data-var='${k}']`);
		input && (input.value = v[i]);
	}
}

addEventListener('input', e => {
	/** @type {HTMLInputElement} */
	const input = e.target;
	if (input.type !== 'color' || !input.dataset.var) {
		return;
	}
	const container = input.closest('.container');

	setVar(container, input.dataset.var, input.value);
});

export {}