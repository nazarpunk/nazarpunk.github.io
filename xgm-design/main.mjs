import {Color} from "./Color.mjs";

const light = document.querySelector('.container');

/** @type {HTMLElement} */
const dark = light.cloneNode(true);

light.classList.add('light');
dark.classList.add('dark');

light.insertAdjacentElement('afterend', dark);

light.insertAdjacentHTML('afterbegin', '<h1>Светлая тема</h1>');
light.dataset.light = 1;

dark.insertAdjacentHTML('afterbegin', '<h1>Тёмная тема</h1>');

const containers = [light, dark];

const theme = {
	primary: ['#4d4da1', '#aaaa77'],
	background: ['#ececec', '#242424'],
	color: [],
};

const getContrastRatio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);

const setVar = (container, name, value, light) => {
	const a = new Color();
	a.hex.set(value);
	container.style.setProperty(`--${name}`, value);

	/**
	 * @param {string} l
	 * @param {Color} c
	 * @return {String}
	 * @private
	 */
	const _s = (l, c) => `${l} ${c.hsluv.hex()} | lum: ${c.rgb.luminance().toFixed(3)} | hsluv: ${c.hsluv.h.toFixed(3)}, ${c.hsluv.s.toFixed(3)}, ${c.hsluv.l.toFixed(3)}`;

	const div = container.querySelector(`.${name}-text`);

	switch (name) {
		case 'background':
			const b = (new Color()).hex.set(a.hsluv.hex());

			b.hsluv.add(null, null, b.hsluv.l > 50 ? -50 : 50);


			div.innerHTML = _s('&nbsp;&nbsp;Фон:', a);
			div.innerHTML += _s('<br>Текст:', b);

			const cr = getContrastRatio(a.rgb.luminance(), b.rgb.luminance());
			div.innerHTML += `<br>Contrast ratio: ${cr.toFixed(3)}`;
			container.style.setProperty('--color', b.hsluv.hex());

			const c = (new Color()).hex.set(a.hex.value);
			c.hex.blend(b.hex.value, light ? .54 : .7);
			div.innerHTML += _s('<br>Muted:', c);
			container.style.setProperty('--color-muted', c.hsluv.hex());
			break;

		case 'primary':
			div.innerHTML = _s('Primary:', a);

	}
};

for (let i = 0; i < 2; i++) {
	for (let [k, v] of Object.entries(theme)) {
		if (v.length !== 2) {
			continue;
		}
		const container = containers[i];

		setVar(container, k, v[i], i === 0);
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

	setVar(container, input.dataset.var, input.value, container.dataset.light === '1');
});

export {}