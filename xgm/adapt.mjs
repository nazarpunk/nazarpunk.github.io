const log = console.log;

const getSmallerColor = (c1, c2) => {
	c1 = c1.startsWith('#') ? c1.substring(1) : c1;
	c2 = c2.startsWith('#') ? c2.substring(1) : c2;
	return parseInt(c1, 16) > parseInt(c2, 16)
	       ? `#${c2}`
	       : `#${c1}`;
};
const hexSubtract = (c1, c2) => {
	c1 = c1.startsWith('#') ? c1.substring(1) : c1;
	c2 = c2.startsWith('#') ? c2.substring(1) : c2;
	return `#${(parseInt(c1, 16) - parseInt(c2, 16)).toString(16).toUpperCase().padStart(6, '0')}`;
};

const rgbAdd = (rgb, value) => {
	try {
		if (rgb.r + value > 255 && rgb.g + value > 255 && rgb.b + value > 255) {
			log(`rgb: ${JSON.stringify(rgb)}`);
			throw new Error('ERR_OUT_OF_BOUNDS');
		}
		return {
			r: rgb.r + value > 255 ? 255 : rgb.r + value,
			g: rgb.g + value > 255 ? 255 : rgb.g + value,
			b: rgb.b + value > 255 ? 255 : rgb.b + value
		}
	} catch(e) {
		throwe;
	}
};

const rgbSubtract = (rgb, value) => {
	try {
		if (rgb.r - value < 0 && rgb.g - value < 0 && rgb.b - value < 0) {
			log(`rgb: ${JSON.stringify(rgb)}`);
			throw new Error('ERR_OUT_OF_BOUNDS');
		}
		return {
			r: rgb.r - value < 0 ? 0 : rgb.r - value,
			g: rgb.g - value < 0 ? 0 : rgb.g - value,
			b: rgb.b - value < 0 ? 0 : rgb.b - value
		}
	} catch(e) {
		throwe;
	}
};

// compare two values, as usual. c1 > c2 => 1, c1 < c2 => -1, c1 == c2 => 0
const hexCompare = (c1, c2) => {
	c1 = c1.startsWith('#') ? c1.substring(1) : c1;
	c2 = c2.startsWith('#') ? c2.substring(1) : c2;
	const p1 = parseInt(c1, 16);
	const p2 = parseInt(c2, 16);
	if (p1 === p2) return 0;
	return p1 > p2 ? 1 : -1
};

// select color to change - select the one that is furthest from white or black
const selectColorToChange = (color1, color2) => {
	const darkerColor = Color(getSmallerColor(color1.hex(), color2.hex()));
	const lighterColor = color1.hex() === darkerColor.hex() ? color2 : color1;
	const distanceFromBlack = darkerColor.hex();
	const distanceFromWhite = hexSubtract('#ffffff', lighterColor.hex());

	const colorToChange = hexCompare(distanceFromBlack, distanceFromWhite) > 0
	                      ? darkerColor
	                      : lighterColor;

	return {
		colorToChange,
		otherColor: colorToChange.hex() === darkerColor.hex() ? lighterColor : darkerColor,
		operation: hexCompare(distanceFromBlack, distanceFromWhite) > 0 ? 'subtract' : 'add'
	}
};


const colorLog = (i, bg, fg, contrast) => {
	log(
		chalk.bgHex(bg).hex(fg)
		     .visible(`#${i.toString().padStart(3, '0')} contrast: ${contrast.toFixed(1)} otherColor: ${fg} colorToChange: ${bg}`)
	);
};

// constants used
const contrastNormal = 4.5;
const contrastBig = 3;
const knownContrasts = [contrastNormal, contrastBig];
const step = 1;
const maxChanges = 1;
let hasChangedSense = false;

const changeColor = (colorToChange, otherColor, contrast, contrastLevel, operation) => {
	const originalColorToChange = colorToChange;
	const originalOtherColor = otherColor;
	const originalOperation = operation;
	const originalContrast = contrast;
	try {
		// change colors to achieve sufficient contrast
		let iteration = 0;
		colorLog(iteration, colorToChange.hex(), otherColor.hex(), contrast);
		while (contrast < contrastLevel) {
			colorToChange = operation === 'subtract'
			                ? Color(rgbSubtract(colorToChange.object(), step))
			                : Color(rgbAdd(colorToChange.object(), step));
			contrast = parseFloat(colorToChange.contrast(otherColor).toFixed(1));
			if (iteration > 255) throw Error(`Too many iterations`);
			iteration++;
			if (iteration % 5 === 0) colorLog(iteration, colorToChange.hex(), otherColor.hex(), contrast);
		}
		colorLog(iteration, colorToChange.hex(), otherColor.hex(), contrast);

		return {
			colorToChange,
			otherColor,
			contrast,
			step,
			operation,
			iteration,
		}
	} catch(e) {
		log(`Error in changeColor: ${e.message}`);
		if (e.message === 'ERR_OUT_OF_BOUNDS') {
			if (hasChangedSense) throw new Error('Already changed sense once, abandoning ...');
			hasChangedSense = true;
			log(`Relaunching changeColor with other color`);
			const res = changeColor(originalOtherColor, originalColorToChange, originalContrast, contrastLevel, originalOperation === 'subtract' ? 'add' : 'subtract');
			return res;
		} else {
			log(`Error ${e}, quitting ...`);
			process.exit(1);
		}
	}
};

////////////////////////////////////////////////
const adaptColors = (c1, c2, contrastLevel) => {
	const color1 = Color(c1);
	const color2 = Color(c2);

	if (!contrastLevel) contrastLevel = contrastNormal;
	if (!knownContrasts.includes(contrastLevel)) contrastLevel = contrastNormal;

	// check contrast is not already sufficient
	let contrast = parseFloat(color1.contrast(color2).toFixed(1));
	if (contrast >= contrastLevel) {
		log(`no need to adapt as contrast is ${contrast}`);
		return {
			original: {
				color1: color1.hex(),
				color2: color2.hex()
			},
			contrast,
		};
	}
	// decide which color to change
	let { colorToChange, otherColor, operation } = selectColorToChange(color1, color2);

	// change color
	const res = changeColor(colorToChange, otherColor, contrast, contrastLevel, operation);

	// prepare result object
	const adapted = { color1: color1.hex(), color2: color2.hex() };
	if (color1.hex() === res.otherColor.hex()) {
		adapted.color2 = res.colorToChange.hex();
	} else {
		adapted.color1 = res.colorToChange.hex();
	}

	return {
		original: {
			color1: color1.hex(),
			color2: color2.hex()
		},
		adapted,
		operation: res.operation,
		iterations: res.iteration,
		contrast: res.contrast,
		step: res.step,
	}
};

export {
	adaptColors
};