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
	info: ['#0088cc', '#ffbb33'],
	danger: ['#ff006a', '#c51943'],
	linkColor: [],
	buttonPrimaryBg: [],
	buttonPrimaryColor: [],
	buttonInfoBg: [],
	buttonInfoColor: [],
	buttonDangerBg: [],
	buttonDangerColor: [],
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
const _s = (l, c) => `${l} ${c.hex.value} | lum: ${c.rgb.luminance().toFixed(3)} | HSLuv: ${c.hsluv.h.toFixed(3)}, ${c.hsluv.s.toFixed(3)}, ${c.hsluv.l.toFixed(3)}`;

const setVar = (name, value, i) => {
	theme[name][i] = (new Color()).hex.set(value).hex.value;

	// background
	const background = Color.fromHex(theme.background[i]);
	const backgroundText = containers[i].querySelector(`.background-text`);

	const color = Color
		.fromHex(background.hex.value)
		.hsluv.add(null, null, background.hsluv.l > 50 ? -50 : 50);

	backgroundText.innerHTML = _s('&nbsp;&nbsp;Фон:', background);
	backgroundText.innerHTML += _s('<br>Текст:', color);

	// color
	theme.color[i] = color.hex.value;
	const cr = getContrastRatio(background.rgb.luminance(), color.rgb.luminance());
	backgroundText.innerHTML += `<br>Contrast ratio: ${cr.toFixed(3)}`;

	// colorMuted
	const colorMuted = Color.fromHex(background.hex.value);
	colorMuted.hex.blend(color.hex.value, i ? .7 : .54);
	backgroundText.innerHTML += _s('<br>Muted:', colorMuted);
	theme.colorMuted[i] = colorMuted.hex.value;

	// primary
	const primary = Color.fromHex(theme.primary[i]);

	// link color
	const linkColor = Color.fromHex(primary.hex.value).hsluv.set(null, null, color.hsluv.l);
	theme.linkColor[i] = linkColor.hex.value;

	const linkColorText = containers[i].querySelector(`.link-color-text`);
	linkColorText.innerHTML = _s('Цвет ссылок:', linkColor);

	const de = color.lab.deltaE00(linkColor);
	linkColorText.innerHTML += `<br>CIEDE2000: ${de.toFixed(3)}`;
	containers[i].classList.toggle('link-underline', de <= 17);

	// button primary
	theme.buttonPrimaryBg[i] = primary.hex.value;
	const buttonPrimaryColor = Color.fromHex(primary.hex.value)
		.hsluv.add(null, null, primary.hsluv.l > 50 ? -50 : 50);
	theme.buttonPrimaryColor[i] = buttonPrimaryColor.hex.value;

	// button info
	const info = Color.fromHex(theme.info[i]);

	theme.buttonInfoBg[i] = info.hex.value;
	const buttonInfoColor = Color.fromHex(theme.buttonInfoBg[i])
		.hsluv.add(null, null, info.hsluv.l > 50 ? -50 : 50);
	theme.buttonInfoColor[i] = buttonInfoColor.hex.value;

	// button danger
	const danger = Color.fromHex(theme.danger[i]);
	theme.buttonDangerBg[i] = danger.hex.value;
	const buttonDangerColor = Color.fromHex(theme.buttonDangerBg[i])
		.hsluv.add(null, null, danger.hsluv.l > 50 ? -50 : 50);
	theme.buttonDangerColor[i] = buttonDangerColor.hex.value;

	// update
	update(i);
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