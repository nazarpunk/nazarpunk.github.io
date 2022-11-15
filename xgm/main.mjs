import {Hsluv} from "./hsluv.mjs";

const container = document.querySelector('.container');

/** @type {HTMLElement} */
const clone = container.cloneNode(true);

container.classList.add('light');
clone.classList.add('dark');

container.insertAdjacentElement('afterend', clone);

const containers = [container, clone];

const theme = {
	background: ['#ececec', '#242424'],
	color: [],
};

const setVar = (container, name, value) => {
	const h = new Hsluv();
	h.hex(value);
	container.style.setProperty(`--${name}`, value);
	const hsl = h.hsluv;

	switch (name) {
		case 'background':
			if (hsl.l >= 80) {
				hsl.l = 10;
			} else {
				hsl.l += 50;
			}
			container.style.setProperty('--color', hsl.hex());
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