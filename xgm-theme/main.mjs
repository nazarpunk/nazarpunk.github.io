import {Colour} from "./colour.mjs";
import {Color} from "./Color.mjs";

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
	//background: ['#ececec', '#ee2b2b'],
	color: [],
	colorMuted: [],
	primary: ['#4d4da1', '#aaaa77'],
};

const getContrastRatio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);

/** @param {number} i */
const update = i => {
	for (let [k, v] of Object.entries(theme)) {
		containers[i].style.setProperty(`--${k}`, v[i]);
	}
};

/**
 * @param {string} l
 * @param {Color} c
 * @return {String}
 * @private
 */
const _s = (l, c) => `${l} ${c.hsluv.hex()} | lum: ${c.rgb.luminance().toFixed(3)} | HSLuv: ${c.hsluv.h.toFixed(3)}, ${c.hsluv.s.toFixed(3)}, ${c.hsluv.l.toFixed(3)}`;

const setVar = (name, value, i) => {
	theme[name][i] = (new Color()).hex.set(value).hex.value;

	// background
	const background = (new Color()).hex.set(theme.background[i]);
	const backgroundText = containers[i].querySelector(`.background-text`);

	const color = (new Color()).hex.set(background.hex.value);
	color.hsluv.add(null, null, background.hsluv.l > 50 ? -50 : 50);

	backgroundText.innerHTML = _s('&nbsp;&nbsp;Фон:', background);
	backgroundText.innerHTML += _s('<br>Текст:', color);

	// color
	theme.color[i] = color.hex.value;
	const cr = getContrastRatio(background.rgb.luminance(), color.rgb.luminance());
	backgroundText.innerHTML += `<br>Contrast ratio: ${cr.toFixed(3)}`;

	// colorMuted
	const colorMuted = (new Color()).hex.set(background.hex.value);
	colorMuted.hex.blend(color.hex.value, i ? .7 : .54);
	backgroundText.innerHTML += _s('<br>Muted:', colorMuted);
	theme.colorMuted[i] = colorMuted.hsluv.hex();

	// primary
	const primary = (new Color()).hex.set(theme.primary[i]);
	const primaryText = containers[i].querySelector(`.primary-text`);
	primary.hsluv.set(null, null, color.hsluv.l);

	primaryText.innerHTML = _s('Primary:', primary);

	const c1 = Colour.hex2lab(color.hex.value);
	const c2 = Colour.hex2lab(primary.hex.value);
	const de = Colour.deltaE00(...c1, ...c2);
	primaryText.innerHTML += `<br>CIEDE2000: ${de.toFixed(3)}`;
	if (de <= 15) {
		//primary.hex.set(color.hex.value).hsluv.add(1,null,null);
	}

	// update
	update(i);
	containers[i].style.setProperty(`--primary`, primary.hex.value);
};

for (let i = 0; i < 2; i++) {
	for (let [k, v] of Object.entries(theme)) {
		if (v.length !== 2) {
			continue;
		}
		const container = containers[i];

		setVar(k, v[i], i);
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

	setVar(input.dataset.var, input.value, container.classList.contains('light') ? 0 : 1);
});

export {}