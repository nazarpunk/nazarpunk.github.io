// noinspection JSUnusedGlobalSymbols

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

	/**
	 * @param {string} color
	 * @return {Color}
	 */
	static fromHex(color) {
		return (new Color()).hex.set(color);
	}
}

export class Lch {
	/**
	 * @param {Color} color
	 */
	constructor(color) {
		this._color = color;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_color;

	l = 0;
	c = 0;
	h = 0;

	/**
	 * @return {Color}
	 */
	toHpluv() {
		const hpluv = this._color.hpluv;

		if (this.l > 99.9999999) {
			hpluv.p = 0;
			hpluv.l = 100;
		} else if (this.l < 0.00000001) {
			hpluv.p = 0;
			hpluv.l = 0;
		} else {
			this._color.rgb24.calcBoundingLines(this.l);
			hpluv.p = this.c / hpluv.maxChroma() * 100;
			hpluv.l = this.l;
		}
		hpluv.h = this.h;

		return this._color;
	}

	/**
	 * @return {Color}
	 */
	toHsluv() {
		const hsluv = this._color.hsluv;

		if (this.l > 99.9999999) {
			hsluv.s = 0;
			hsluv.l = 100;
		} else if (this.l < 0.00000001) {
			hsluv.s = 0;
			hsluv.l = 0;
		} else {
			this._color.rgb24.calcBoundingLines(this.l);
			hsluv.s = this.c / hsluv.maxChroma(this.h) * 100;
			hsluv.l = this.l;
		}
		hsluv.h = this.h;

		return this._color;
	}

	/**
	 * @return {Color}
	 */
	toLuv() {
		const luv = this._color.luv;
		const hrad = this.h / 180.0 * Math.PI;
		luv.l = this.l;
		luv.u = Math.cos(hrad) * this.c;
		luv.v = Math.sin(hrad) * this.c;
		return this._color;
	}
}

export class Luv {
	/**
	 * @param {Color} color
	 */
	constructor(color) {
		this._color = color;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_color;

	l = 0;
	u = 0;
	v = 0;

	static refY = 1.0;
	static refU = 0.19783000664283;
	static refV = 0.46831999493879;
	static kappa = 903.2962962;
	static epsilon = 0.0088564516;

	/**
	 * @return {Color}
	 */
	toLch() {
		const lch = this._color.lch;

		lch.l = this.l;
		lch.c = Math.sqrt(this.u * this.u + this.v * this.v);
		if (lch.c < 0.00000001) {
			lch.h = 0;
		} else {
			const hrad = Math.atan2(this.v, this.u);
			lch.h = hrad * 180.0 / Math.PI;
			if (lch.h < 0) {
				lch.h = 360 + lch.h;
			}
		}

		return this._color;
	}

	/**
	 * @param {number} L
	 * @return {number}
	 */
	static lToY(L) {
		return L <= 8 ? Luv.refY * L / Luv.kappa : Luv.refY * Math.pow((L + 16) / 116, 3);
	}

	/**
	 * @param {number} Y
	 * @return {number}
	 */
	static yToL(Y) {
		return Y <= Luv.epsilon ? Y / Luv.refY * Luv.kappa : 116 * Math.pow(Y / Luv.refY, 1 / 3) - 16;
	}

	/**
	 * @return {Color}
	 */
	toXyz() {
		const xyz = this._color.xyz;

		if (this.l === 0) {
			xyz.x = 0;
			xyz.y = 0;
			xyz.z = 0;
		} else {
			const varU = this.u / (13 * this.l) + Luv.refU;
			const varV = this.v / (13 * this.l) + Luv.refV;
			xyz.y = Luv.lToY(this.l);
			xyz.x = 0 - 9 * xyz.y * varU / ((varU - 4) * varV - varU * varV);
			xyz.z = (9 * xyz.y - 15 * varV * xyz.y - varV * xyz.x) / (3 * varV);
		}
		return this._color;
	}
}

export class Xyz {
	/**
	 * @param {Color} color
	 */
	constructor(color) {
		this._color = color;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_color;

	x = 0;
	y = 0;
	z = 0;

	/**
	 * @return {Color}
	 */
	toLuv() {
		const luv = this._color.luv;

		const divider = this.x + 15 * this.y + 3 * this.z;
		let varU = 4 * this.x;
		let varV = 9 * this.y;
		if (divider !== 0) {
			varU /= divider;
			varV /= divider;
		} else {
			varU = NaN;
			varV = NaN;
		}
		luv.l = Luv.yToL(this.y);
		if (luv.l === 0) {
			luv.u = 0;
			luv.v = 0;
		} else {
			luv.u = 13 * luv.l * (varU - Luv.refU);
			luv.v = 13 * luv.l * (varV - Luv.refV);
		}

		return this._color;
	}

	/**
	 * @param {number} c
	 * @return {number}
	 */
	static fromLinear(c) {
		return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
	}

	/**
	 * @return {Color}
	 */
	toRgb() {
		const rgb = this._color.rgb;
		rgb.r = Xyz.fromLinear(Rgb24.m_r0 * this.x + Rgb24.m_r1 * this.y + Rgb24.m_r2 * this.z);
		rgb.g = Xyz.fromLinear(Rgb24.m_g0 * this.x + Rgb24.m_g1 * this.y + Rgb24.m_g2 * this.z);
		rgb.b = Xyz.fromLinear(Rgb24.m_b0 * this.x + Rgb24.m_b1 * this.y + Rgb24.m_b2 * this.z);
		return this._color;
	}

}

export class Hex {
	/**
	 * @param {Color} color
	 */
	constructor(color) {
		this._color = color;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_color;

	value = '#000000';

	static chars = '0123456789abcdef';

	/**
	 * @param {string} hex
	 * @param {number} offset
	 * @return {number}
	 */
	static channelToRgb = (hex, offset) => {
		const digit1 = Hex.chars.indexOf(hex.charAt(offset));
		const digit2 = Hex.chars.indexOf(hex.charAt(offset + 1));
		const n = digit1 * 16 + digit2;
		return n / 255;
	};

	/**
	 * @return {Color}
	 */
	toRgb() {
		const rgb = this._color.rgb;

		rgb.r = Hex.channelToRgb(this.value, 1);
		rgb.g = Hex.channelToRgb(this.value, 3);
		rgb.b = Hex.channelToRgb(this.value, 5);

		return rgb
			.toHsl()
			.rgb.toXyz()
			.xyz.toLuv()
			.luv.toLch()
			.lch.toHpluv()
			.lch.toHsluv();
	}

	/**
	 * @param {string} color
	 * @return {Color}
	 */
	set(color) {
		this.value = color.toLowerCase();
		return this.toRgb();
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
}

export class Rgb {
	/**
	 * @param {Color} color
	 */
	constructor(color) {
		this._color = color;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_color;

	r = 0;
	g = 0;
	b = 0;

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @return {Color}
	 */
	set(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;

		return this
			.toHex()
			.rgb.toHsl()
			.rgb.toXyz()
			.xyz.toLuv()
			.luv.toLch()
			.lch.toHpluv()
			.lch.toHsluv();
	}

	/**
	 * @return {Color}
	 */
	toHsl() {
		const l = Math.max(this.r, this.g, this.b);
		const s = l - Math.min(this.r, this.g, this.b);
		const h = s
			? l === this.r
				? (this.g - this.b) / s
				: l === this.g
					? 2 + (this.b - this.r) / s
					: 4 + (this.r - this.g) / s
			: 0;

		const hsl = this._color.hsl;

		hsl.h = 60 * h < 0 ? 60 * h + 360 : 60 * h;
		hsl.s = 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0);
		hsl.l = (100 * (2 * l - s)) / 2;

		return this._color;
	}

	/**
	 * @param {number} c
	 * @return {number}
	 */
	static toLinear(c) {
		return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
	}

	/**
	 * @return {Color}
	 */
	toXyz() {
		const lr = Rgb.toLinear(this.r);
		const lg = Rgb.toLinear(this.g);
		const lb = Rgb.toLinear(this.b);

		const xyz = this._color.xyz;

		xyz.x = 0.41239079926595 * lr + 0.35758433938387 * lg + 0.18048078840183 * lb;
		xyz.y = 0.21263900587151 * lr + 0.71516867876775 * lg + 0.072192315360733 * lb;
		xyz.z = 0.019330818715591 * lr + 0.11919477979462 * lg + 0.95053215224966 * lb;

		return this._color;
	}

	/**
	 * @param {number} channel
	 * @return {string}
	 */
	static channelToHex = channel => {
		const c = Math.round(channel * 255);
		const digit2 = c % 16;
		const digit1 = (c - digit2) / 16 | 0;
		return Hex.chars.charAt(digit1) + Hex.chars.charAt(digit2);
	};

	/**
	 * @return {Color}
	 */
	toHex() {
		const hex = this._color.hex;
		hex.value = "#";
		hex.value += Rgb.channelToHex(this.r);
		hex.value += Rgb.channelToHex(this.g);
		hex.value += Rgb.channelToHex(this.b);
		return this._color;
	}

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
	 * @param {Color} color
	 */
	constructor(color) {
		this._color = color;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_color;

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

	static m_r0 = 3.240969941904521;
	static m_r1 = -1.537383177570093;
	static m_r2 = -0.498610760293;
	static m_g0 = -0.96924363628087;
	static m_g1 = 1.87596750150772;
	static m_g2 = 0.041555057407175;
	static m_b0 = 0.055630079696993;
	static m_b1 = -0.20397695888897;
	static m_b2 = 1.056971514242878;

	/**
	 * @param {number} l
	 */
	calcBoundingLines(l) {
		const sub1 = Math.pow(l + 16, 3) / 1560896;
		const sub2 = sub1 > Luv.epsilon ? sub1 : l / Luv.kappa;
		const s1r = sub2 * (284517 * Rgb24.m_r0 - 94839 * Rgb24.m_r2);
		const s2r = sub2 * (838422 * Rgb24.m_r2 + 769860 * Rgb24.m_r1 + 731718 * Rgb24.m_r0);
		const s3r = sub2 * (632260 * Rgb24.m_r2 - 126452 * Rgb24.m_r1);
		const s1g = sub2 * (284517 * Rgb24.m_g0 - 94839 * Rgb24.m_g2);
		const s2g = sub2 * (838422 * Rgb24.m_g2 + 769860 * Rgb24.m_g1 + 731718 * Rgb24.m_g0);
		const s3g = sub2 * (632260 * Rgb24.m_g2 - 126452 * Rgb24.m_g1);
		const s1b = sub2 * (284517 * Rgb24.m_b0 - 94839 * Rgb24.m_b2);
		const s2b = sub2 * (838422 * Rgb24.m_b2 + 769860 * Rgb24.m_b1 + 731718 * Rgb24.m_b0);
		const s3b = sub2 * (632260 * Rgb24.m_b2 - 126452 * Rgb24.m_b1);
		this.r0s = s1r / s3r;
		this.r0i = s2r * l / s3r;
		this.r1s = s1r / (s3r + 126452);
		this.r1i = (s2r - 769860) * l / (s3r + 126452);
		this.g0s = s1g / s3g;
		this.g0i = s2g * l / s3g;
		this.g1s = s1g / (s3g + 126452);
		this.g1i = (s2g - 769860) * l / (s3g + 126452);
		this.b0s = s1b / s3b;
		this.b0i = s2b * l / s3b;
		this.b1s = s1b / (s3b + 126452);
		this.b1i = (s2b - 769860) * l / (s3b + 126452);
	}
}

export class Hpluv {
	/**
	 * @param {Color} color
	 */
	constructor(color) {
		this._color = color;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_color;

	h = 0;
	p = 0;
	l = 0;

	/**
	 * @param {number} slope
	 * @param {number} intercept
	 * @return {number}
	 */
	static distanceFromOrigin(slope, intercept) {
		return Math.abs(intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
	};

	maxChroma() {
		const rgb24 = this._color.rgb24;
		const r0 = Hpluv.distanceFromOrigin(rgb24.r0s, rgb24.r0i);
		const r1 = Hpluv.distanceFromOrigin(rgb24.r1s, rgb24.r1i);
		const g0 = Hpluv.distanceFromOrigin(rgb24.g0s, rgb24.g0i);
		const g1 = Hpluv.distanceFromOrigin(rgb24.g1s, rgb24.g1i);
		const b0 = Hpluv.distanceFromOrigin(rgb24.b0s, rgb24.b0i);
		const b1 = Hpluv.distanceFromOrigin(rgb24.b1s, rgb24.b1i);
		return Math.min(r0, r1, g0, g1, b0, b1);
	}

	/**
	 * @return {Color}
	 */
	toLch() {
		const lch = this._color.lch;

		if (this.l > 99.9999999) {
			lch.l = 100;
			lch.c = 0;
		} else if (this.l < 0.00000001) {
			lch.l = 0;
			lch.c = 0;
		} else {
			lch.l = this.l;
			this._color.rgb24.calcBoundingLines(this.l);
			lch.c = this.maxChroma() / 100 * this.p;
		}
		lch.h = this.h;

		return this._color;
	}

	/**
	 * @return {Color}
	 */
	toHex() {
		return this
			.toLch()
			.lch.toLuv()
			.luv.toXyz()
			.xyz.toRgb()
			.rgb.toHsl()
			.rgb.toHex();
	}
}

export class Hsluv {
	/**
	 * @param {Color} color
	 */
	constructor(color) {
		this._color = color;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_color;

	h = 0;
	s = 0;
	l = 0;

	/**
	 * @param {?number} h
	 * @param {?number} s
	 * @param {?number} l
	 * @return {Color}
	 */
	set(h, s, l) {
		if (h != null) {
			this.h = h;
		}
		if (s != null) {
			this.s = s;
		}
		if (l != null) {
			this.l = l;
		}
		return this.toHex();
	}

	/**
	 * @param {?number} h
	 * @param {?number} s
	 * @param {?number} l
	 * @return {Color}
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
		return this.toHex();
	}

	/**
	 * @param {number} slope
	 * @param {number} intercept
	 * @param {number} angle
	 * @return {number}
	 */
	static distanceFromOriginAngle(slope, intercept, angle) {
		const d = intercept / (Math.sin(angle) - slope * Math.cos(angle));
		return d < 0 ? Infinity : d;
	};

	/**
	 * @param {number} h
	 * @return {number}
	 */
	maxChroma(h) {
		const rgb24 = this._color.rgb24;
		const hueRad = h / 360 * Math.PI * 2;
		const r0 = Hsluv.distanceFromOriginAngle(rgb24.r0s, rgb24.r0i, hueRad);
		const r1 = Hsluv.distanceFromOriginAngle(rgb24.r1s, rgb24.r1i, hueRad);
		const g0 = Hsluv.distanceFromOriginAngle(rgb24.g0s, rgb24.g0i, hueRad);
		const g1 = Hsluv.distanceFromOriginAngle(rgb24.g1s, rgb24.g1i, hueRad);
		const b0 = Hsluv.distanceFromOriginAngle(rgb24.b0s, rgb24.b0i, hueRad);
		const b1 = Hsluv.distanceFromOriginAngle(rgb24.b1s, rgb24.b1i, hueRad);
		return Math.min(r0, r1, g0, g1, b0, b1);
	}

	/**
	 * @return {Color}
	 */
	toLch() {
		const lch = this._color.lch;

		if (this.l > 99.9999999) {
			lch.l = 100;
			lch.c = 0;
		} else if (this.l < 0.00000001) {
			lch.l = 0;
			lch.c = 0;
		} else {
			lch.l = this.l;
			this._color.rgb24.calcBoundingLines(this.l);
			lch.c = this.maxChroma(this.h) / 100 * this.s;
		}
		lch.h = this.h;

		return this._color;
	}

	/**
	 * @return {Color}
	 */
	toHex() {
		return this
			.toLch()
			.lch.toLuv()
			.luv.toXyz()
			.xyz.toRgb()
			.rgb.toHsl()
			.rgb.toHex();
	}

}

export class Hsl {
	/**
	 * @param {Color} color
	 */
	constructor(color) {
		this._color = color;
	}

	/**
	 * @private
	 * @type {Color}
	 */
	_color;

	h = 0;
	s = 0;
	l = 0;
}