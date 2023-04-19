import {Color} from './Color.mjs';

/** @type {number} is dark theme */
let d;

const colors = {
	background: ['#ececec', '#242424'],
	primary: ['#4d4da1', '#aaaa77'],
	info: ['#0088cc', '#ffbb33'],
	danger: ['#ff006a', '#c51943'],
};

const variables = {
	background: [],
	color: [],
	colorMuted: [],
	linkColor: [],
	buttonPrimaryBg: [],
	buttonPrimaryColor: [],
	buttonInfoBg: [],
	buttonInfoColor: [],
	buttonDangerBg: [],
	buttonDangerColor: [],
};

const setVariables = () => {
	// background
	const background = Color.fromHex(colors.background[d]);
	variables.background[d] = background.hex.value;

	// color
	const color = Color
	.fromHex(background.hex.value)
	.hsluv.add(null, null, background.hsluv.l > 50 ? -50 : 50);
	variables.color[d] = color.hex.value;

	// colorMuted
	const colorMuted = Color.fromHex(background.hex.value);
	colorMuted.hex.blend(color.hex.value, d ? .7 : .54);
	variables.colorMuted[d] = colorMuted.hex.value;

	if (0) {


		// primary
		const primary = Color.fromHex(variables.primary[d]);

		// link color
		const linkColor = Color.fromHex(primary.hex.value).hsluv.set(null, null, color.hsluv.l);
		variables.linkColor[d] = linkColor.hex.value;

		const de = color.lab.deltaE00(linkColor);
		document.body.classList.toggle('link-underline', de <= 17);

		// button primary
		variables.buttonPrimaryBg[d] = primary.hex.value;
		const buttonPrimaryColor = Color.fromHex(primary.hex.value)
		.hsluv.add(null, null, primary.hsluv.l > 50 ? -50 : 50);
		variables.buttonPrimaryColor[d] = buttonPrimaryColor.hex.value;

		// button info
		const info = Color.fromHex(variables.info[d]);

		variables.buttonInfoBg[d] = info.hex.value;
		const buttonInfoColor = Color.fromHex(variables.buttonInfoBg[d])
		.hsluv.add(null, null, info.hsluv.l > 50 ? -50 : 50);
		variables.buttonInfoColor[d] = buttonInfoColor.hex.value;

		// button danger
		const danger = Color.fromHex(variables.danger[d]);
		variables.buttonDangerBg[d] = danger.hex.value;
		const buttonDangerColor = Color.fromHex(variables.buttonDangerBg[d])
		.hsluv.add(null, null, danger.hsluv.l > 50 ? -50 : 50);
		variables.buttonDangerColor[d] = buttonDangerColor.hex.value;
	}

	// update
	for (let [k, v] of Object.entries(variables)) {
		document.body.style.setProperty(`--${k}`, v[d]);
	}
};

/**
 * @type {HTMLInputElement}
 */
const themeInput = document.querySelector('.theme-input');

const inputs = document.querySelector('.inputs');

const setTheme = () => {
	d = themeInput.checked ? 1 : 0;

	for (let [k, v] of Object.entries(colors)) {
		if (v.length !== 2) {
			continue;
		}
		/** @type {HTMLInputElement} */
		const input = document.body.querySelector(`[data-var='${k}']`);
		input && (input.value = v[d]);
	}

	inputs.textContent = '';
	for (let [k, v] of Object.entries(colors)) {
		const div = document.createElement('div');
		div.classList.add('color-label');
		inputs.appendChild(div);

		const input = document.createElement('input');
		input.type = 'color';
		input.value = v[d];
		div.appendChild(input);
		div.insertAdjacentHTML('beforeend', `<div>${k}</div>`);

		input.addEventListener('input', () => {
			colors[k][d] = input.value;
			setVariables();
		});
	}

	setVariables();
};

themeInput.addEventListener('change', setTheme);
setTheme();

export {}