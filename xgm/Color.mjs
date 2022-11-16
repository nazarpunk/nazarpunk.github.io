// noinspection JSUnusedGlobalSymbols

const hexChars = "0123456789abcdef";
const refY = 1.0;
const refU = 0.19783000664283;
const refV = 0.46831999493879;
const kappa = 903.2962962;
const epsilon = 0.0088564516;
const m_r0 = 3.240969941904521;
const m_r1 = -1.537383177570093;
const m_r2 = -0.498610760293;
const m_g0 = -0.96924363628087;
const m_g1 = 1.87596750150772;
const m_g2 = 0.041555057407175;
const m_b0 = 0.055630079696993;
const m_b1 = -0.20397695888897;
const m_b2 = 1.056971514242878;

const fromLinear = c => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
const toLinear = c => c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
const yToL = Y => Y <= epsilon ? Y / refY * kappa : 116 * Math.pow(Y / refY, 1 / 3) - 16;
const lToY = L => L <= 8 ? refY * L / kappa : refY * Math.pow((L + 16) / 116, 3);
const distanceFromOrigin = (slope, intercept) => Math.abs(intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
const min6 = (f1, f2, f3, f4, f5, f6) => Math.min(f1, Math.min(f2, Math.min(f3, Math.min(f4, Math.min(f5, f6)))));
const rgbChannelToHex = chan => {
	const c = Math.round(chan * 255);
	const digit2 = c % 16;
	const digit1 = (c - digit2) / 16 | 0;
	return hexChars.charAt(digit1) + hexChars.charAt(digit2);
};
const hexToRgbChannel = (hex, offset) => {
	const digit1 = hexChars.indexOf(hex.charAt(offset));
	const digit2 = hexChars.indexOf(hex.charAt(offset + 1));
	const n = digit1 * 16 + digit2;
	return n / 255.0;
};
const distanceFromOriginAngle = (slope, intercept, angle) => {
	const d = intercept / (Math.sin(angle) - slope * Math.cos(angle));
	if (d < 0) {
		return Infinity;
	} else {
		return d;
	}
};

export class Color {
	/** @type {Hex} */ hex;
	/** @type {Hsl} */ hsl;
	/** @type {Hsluv} */ hsluv;
	/** @type {Hpluv} */ hpluv;
	/** @type {Rgb} */ rgb;
	/** @type {Rgb24} */ rgb24;
	/** @type {Xyz} */ xyz;
	/** @type {Luv} */ luv;
	/** @type {Lch} */ lch;

	constructor() {
		this.hex = new Hex(this);
		this.hsl = new Hsl(this);
		this.hsluv = new Hsluv(this);
		this.hpluv = new Hpluv(this);
		this.rgb = new Rgb(this);
		this.rgb24 = new Rgb24(this);
		this.xyz = new Xyz(this);
		this.luv = new Luv(this);
		this.lch = new Lch(this);
	}

	calculateBoundingLines(l) {
		const sub1 = Math.pow(l + 16, 3) / 1560896;
		const sub2 = sub1 > epsilon ? sub1 : l / kappa;
		const s1r = sub2 * (284517 * m_r0 - 94839 * m_r2);
		const s2r = sub2 * (838422 * m_r2 + 769860 * m_r1 + 731718 * m_r0);
		const s3r = sub2 * (632260 * m_r2 - 126452 * m_r1);
		const s1g = sub2 * (284517 * m_g0 - 94839 * m_g2);
		const s2g = sub2 * (838422 * m_g2 + 769860 * m_g1 + 731718 * m_g0);
		const s3g = sub2 * (632260 * m_g2 - 126452 * m_g1);
		const s1b = sub2 * (284517 * m_b0 - 94839 * m_b2);
		const s2b = sub2 * (838422 * m_b2 + 769860 * m_b1 + 731718 * m_b0);
		const s3b = sub2 * (632260 * m_b2 - 126452 * m_b1);
		this.rgb24.r0s = s1r / s3r;
		this.rgb24.r0i = s2r * l / s3r;
		this.rgb24.r1s = s1r / (s3r + 126452);
		this.rgb24.r1i = (s2r - 769860) * l / (s3r + 126452);
		this.rgb24.g0s = s1g / s3g;
		this.rgb24.g0i = s2g * l / s3g;
		this.rgb24.g1s = s1g / (s3g + 126452);
		this.rgb24.g1i = (s2g - 769860) * l / (s3g + 126452);
		this.rgb24.b0s = s1b / s3b;
		this.rgb24.b0i = s2b * l / s3b;
		this.rgb24.b1s = s1b / (s3b + 126452);
		this.rgb24.b1i = (s2b - 769860) * l / (s3b + 126452);
	}

	calcMaxChromaHpluv() {
		const r0 = distanceFromOrigin(this.rgb24.r0s, this.rgb24.r0i);
		const r1 = distanceFromOrigin(this.rgb24.r1s, this.rgb24.r1i);
		const g0 = distanceFromOrigin(this.rgb24.g0s, this.rgb24.g0i);
		const g1 = distanceFromOrigin(this.rgb24.g1s, this.rgb24.g1i);
		const b0 = distanceFromOrigin(this.rgb24.b0s, this.rgb24.b0i);
		const b1 = distanceFromOrigin(this.rgb24.b1s, this.rgb24.b1i);
		return min6(r0, r1, g0, g1, b0, b1);
	}

	calcMaxChromaHsluv(h) {
		const hueRad = h / 360 * Math.PI * 2;
		const r0 = distanceFromOriginAngle(this.rgb24.r0s, this.rgb24.r0i, hueRad);
		const r1 = distanceFromOriginAngle(this.rgb24.r1s, this.rgb24.r1i, hueRad);
		const g0 = distanceFromOriginAngle(this.rgb24.g0s, this.rgb24.g0i, hueRad);
		const g1 = distanceFromOriginAngle(this.rgb24.g1s, this.rgb24.g1i, hueRad);
		const b0 = distanceFromOriginAngle(this.rgb24.b0s, this.rgb24.b0i, hueRad);
		const b1 = distanceFromOriginAngle(this.rgb24.b1s, this.rgb24.b1i, hueRad);
		return min6(r0, r1, g0, g1, b0, b1);
	}

	/**
	 * @return {string}
	 */
	hsluvToHex() {
		// hsluv -> lch
		if (this.hsluv.l > 99.9999999) {
			this.lch.l = 100;
			this.lch.c = 0;
		} else if (this.hsluv.l < 0.00000001) {
			this.lch.l = 0;
			this.lch.c = 0;
		} else {
			this.lch.l = this.hsluv.l;
			this.calculateBoundingLines(this.hsluv.l);
			const max = this.calcMaxChromaHsluv(this.hsluv.h);
			this.lch.c = max / 100 * this.hsluv.s;
		}
		this.lch.h = this.hsluv.h;

		this._export();
		return this.hex.value;
	}

	/**
	 * @return {string}
	 */
	hpluvToHex() {
		// hpluv -> lch
		if (this.hpluv.l > 99.9999999) {
			this.lch.l = 100;
			this.lch.c = 0;
		} else if (this.hpluv.l < 0.00000001) {
			this.lch.l = 0;
			this.lch.c = 0;
		} else {
			this.lch.l = this.hpluv.l;
			this.calculateBoundingLines(this.hpluv.l);
			const max = this.calcMaxChromaHpluv();
			this.lch.c = max / 100 * this.hpluv.p;
		}
		this.lch.h = this.hpluv.h;

		this._export();
		return this.hex.value;
	}

	/**
	 * @private
	 */
	_export() {
		// lch -> Luv
		const hrad = this.lch.h / 180.0 * Math.PI;
		this.luv.l = this.lch.l;
		this.luv.u = Math.cos(hrad) * this.lch.c;
		this.luv.v = Math.sin(hrad) * this.lch.c;

		// luv -> xyz
		if (this.luv.l === 0) {
			this.xyz.x = 0;
			this.xyz.y = 0;
			this.xyz.z = 0;
			return;
		}
		const varU = this.luv.u / (13 * this.luv.l) + refU;
		const varV = this.luv.v / (13 * this.luv.l) + refV;
		this.xyz.y = lToY(this.luv.l);
		this.xyz.x = 0 - 9 * this.xyz.y * varU / ((varU - 4) * varV - varU * varV);
		this.xyz.z = (9 * this.xyz.y - 15 * varV * this.xyz.y - varV * this.xyz.x) / (3 * varV);

		// xyz -> rgb
		this.rgb.r = fromLinear(m_r0 * this.xyz.x + m_r1 * this.xyz.y + m_r2 * this.xyz.z);
		this.rgb.g = fromLinear(m_g0 * this.xyz.x + m_g1 * this.xyz.y + m_g2 * this.xyz.z);
		this.rgb.b = fromLinear(m_b0 * this.xyz.x + m_b1 * this.xyz.y + m_b2 * this.xyz.z);

		// rgb -> hsl
		this._rgb2hsl();

		// rgb -> hex
		this.hex.value = "#";
		this.hex.value += rgbChannelToHex(this.rgb.r);
		this.hex.value += rgbChannelToHex(this.rgb.g);
		this.hex.value += rgbChannelToHex(this.rgb.b);
	}

	/**
	 * @return {Color}
	 */
	import() {
		// rgb -> hsl
		this._rgb2hsl();

		// rgb -> xyz
		const lr = toLinear(this.rgb.r);
		const lg = toLinear(this.rgb.g);
		const lb = toLinear(this.rgb.b);
		this.xyz.x = 0.41239079926595 * lr + 0.35758433938387 * lg + 0.18048078840183 * lb;
		this.xyz.y = 0.21263900587151 * lr + 0.71516867876775 * lg + 0.072192315360733 * lb;
		this.xyz.z = 0.019330818715591 * lr + 0.11919477979462 * lg + 0.95053215224966 * lb;

		// xyz -> luv
		const divider = this.xyz.x + 15 * this.xyz.y + 3 * this.xyz.z;
		let varU = 4 * this.xyz.x;
		let varV = 9 * this.xyz.y;
		if (divider !== 0) {
			varU /= divider;
			varV /= divider;
		} else {
			varU = NaN;
			varV = NaN;
		}
		this.luv.l = yToL(this.xyz.y);
		if (this.luv.l === 0) {
			this.luv.u = 0;
			this.luv.v = 0;
		} else {
			this.luv.u = 13 * this.luv.l * (varU - refU);
			this.luv.v = 13 * this.luv.l * (varV - refV);
		}

		// luv -> lch
		this.lch.l = this.luv.l;
		this.lch.c = Math.sqrt(this.luv.u * this.luv.u + this.luv.v * this.luv.v);
		if (this.lch.c < 0.00000001) {
			this.lch.h = 0;
		} else {
			const hrad = Math.atan2(this.luv.v, this.luv.u);
			this.lch.h = hrad * 180.0 / Math.PI;
			if (this.lch.h < 0) {
				this.lch.h = 360 + this.lch.h;
			}
		}

		// lch -> hpluv
		if (this.lch.l > 99.9999999) {
			this.hpluv.p = 0;
			this.hpluv.l = 100;
		} else if (this.lch.l < 0.00000001) {
			this.hpluv.p = 0;
			this.hpluv.l = 0;
		} else {
			this.calculateBoundingLines(this.lch.l);
			const max = this.calcMaxChromaHpluv();
			this.hpluv.p = this.lch.c / max * 100;
			this.hpluv.l = this.lch.l;
		}
		this.hpluv.h = this.lch.h;

		// lch -> hsluv
		if (this.lch.l > 99.9999999) {
			this.hsluv.s = 0;
			this.hsluv.l = 100;
		} else if (this.lch.l < 0.00000001) {
			this.hsluv.s = 0;
			this.hsluv.l = 0;
		} else {
			this.calculateBoundingLines(this.lch.l);
			const max = this.calcMaxChromaHsluv(this.lch.h);
			this.hsluv.s = this.lch.c / max * 100;
			this.hsluv.l = this.lch.l;
		}
		this.hsluv.h = this.lch.h;

		return this;
	}

	_rgb2hsl() {
		const l = Math.max(this.rgb.r, this.rgb.g, this.rgb.b);
		const s = l - Math.min(this.rgb.r, this.rgb.g, this.rgb.b);
		const h = s
		          ? l === this.rgb.r
		            ? (this.rgb.g - this.rgb.b) / s
		            : l === this.rgb.g
		              ? 2 + (this.rgb.b - this.rgb.r) / s
		              : 4 + (this.rgb.r - this.rgb.g) / s
		          : 0;

		this.hsl.h = 60 * h < 0 ? 60 * h + 360 : 60 * h;
		this.hsl.s = 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0);
		this.hsl.l = (100 * (2 * l - s)) / 2;
	};
}

export class Lch {
	/**
	 * @param {Color} parent
	 */
	constructor(parent) {
		this._parent = parent;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_parent;

	l = 0;
	c = 0;
	h = 0;
}

export class Luv {
	/**
	 * @param {Color} parent
	 */
	constructor(parent) {
		this._parent = parent;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_parent;

	l = 0;
	u = 0;
	v = 0;
}

export class Xyz {
	/**
	 * @param {Color} parent
	 */
	constructor(parent) {
		this._parent = parent;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_parent;

	x = 0;
	y = 0;
	z = 0;
}

export class Hex {
	/**
	 * @param {Color} parent
	 */
	constructor(parent) {
		this._parent = parent;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_parent;

	/**
	 * @param {string} color
	 * @return {Color}
	 */
	set(color) {
		this.value = color.toLowerCase();
		this._parent.rgb.r = hexToRgbChannel(this.value, 1);
		this._parent.rgb.g = hexToRgbChannel(this.value, 3);
		this._parent.rgb.b = hexToRgbChannel(this.value, 5);
		return this._parent.import();
	}

	/**
	 * @param {string} color
	 * @param {number} t
	 * @return {Color}
	 */
	blend(color, t) {
		const [rA, gA, bA] = this.value.match(/\w\w/g).map(c => parseInt(c, 16));
		const [rB, gB, bB] = color.match(/\w\w/g).map(c => parseInt(c, 16));
		const r = Math.round(rA + (rB - rA) * t).toString(16).padStart(2, '0');
		const g = Math.round(gA + (gB - gA) * t).toString(16).padStart(2, '0');
		const b = Math.round(bA + (bB - bA) * t).toString(16).padStart(2, '0');
		return this.set('#' + r + g + b);
	};

	value = '#000000';
}

export class Rgb {
	/**
	 * @param {Color} parent
	 */
	constructor(parent) {
		this._parent = parent;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_parent;

	r = 0;
	g = 0;
	b = 0;

	/**
	 * @return {number}
	 */
	luminance() {
		const a = [this.r, this.g, this.b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
		return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}
}

export class Rgb24 {
	/**
	 * 6 lines in slope-intercept format: R < 0, R > 1, G < 0, G > 1, B < 0, B > 1
	 * @param {Color} parent
	 */
	constructor(parent) {
		this._parent = parent;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_parent;

	r0s = 0;
	r0i = 0;
	r1s = 0;
	r1i = 0;
	g0s = 0;
	g0i = 0;
	g1s = 0;
	g1i = 0;
	b0s = 0;
	b0i = 0;
	b1s = 0;
	b1i = 0;
}

export class Hpluv {
	/**
	 * @param {Color} parent
	 */
	constructor(parent) {
		this._parent = parent;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_parent;

	h = 0;
	p = 0;
	l = 0;
}

export class Hsluv {
	/**
	 * @param {Color} parent
	 */
	constructor(parent) {
		this._parent = parent;
		this.hex = this._parent.hsluvToHex.bind(this._parent);
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_parent;

	h = 0;
	s = 0;
	l = 0;

	/**
	 * @param {?number} h
	 * @param {?number} s
	 * @param {?number} l
	 * @return {Hsluv}
	 */
	add(h, s, l) {
		if (h != null) {
			this.h += h;
		}
		if (s != null) {
			this.s += s;
		}
		if (l != null) {
			this.l += l;
		}
		this.hex();
		return this;
	}

	/**
	 * @type {function(): string}
	 */
	hex;
}

export class Hsl {
	/**
	 * @param {Color} parent
	 */
	constructor(parent) {
		this._parent = parent;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_parent;

	h = 0;
	s = 0;
	l = 0;
}