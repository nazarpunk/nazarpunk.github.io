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

export class Hsluv {
	// RGB
	/**
	 * @private
	 * @type {string}
	 */
	_hex = '#000000';
	rgb_r = 0;
	rgb_g = 0;
	rgb_b = 0;
	// CIE XYZ
	xyz_x = 0;
	xyz_y = 0;
	xyz_z = 0;
	// CIE LUV
	luv_l = 0;
	luv_u = 0;
	luv_v = 0;
	// CIE LUV LCh
	lch_l = 0;
	lch_c = 0;
	lch_h = 0;
	/**
	 * HSLuv
	 * @type {Hsl}
	 */
	hsluv;
	// HPLuv
	hpluv_h = 0;
	hpluv_p = 0;
	hpluv_l = 0;
	// 6 lines in slope-intercept format: R < 0, R > 1, G < 0, G > 1, B < 0, B > 1
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

	constructor() {
		this.hsluv = new Hsl(this);
	}

	rgbToHex() {
		this._hex = "#";
		this._hex += rgbChannelToHex(this.rgb_r);
		this._hex += rgbChannelToHex(this.rgb_g);
		this._hex += rgbChannelToHex(this.rgb_b);
	}

	xyzToRgb() {
		this.rgb_r = fromLinear(m_r0 * this.xyz_x + m_r1 * this.xyz_y + m_r2 * this.xyz_z);
		this.rgb_g = fromLinear(m_g0 * this.xyz_x + m_g1 * this.xyz_y + m_g2 * this.xyz_z);
		this.rgb_b = fromLinear(m_b0 * this.xyz_x + m_b1 * this.xyz_y + m_b2 * this.xyz_z);
	}

	rgbToXyz() {
		const lr = toLinear(this.rgb_r);
		const lg = toLinear(this.rgb_g);
		const lb = toLinear(this.rgb_b);
		this.xyz_x = 0.41239079926595 * lr + 0.35758433938387 * lg + 0.18048078840183 * lb;
		this.xyz_y = 0.21263900587151 * lr + 0.71516867876775 * lg + 0.072192315360733 * lb;
		this.xyz_z = 0.019330818715591 * lr + 0.11919477979462 * lg + 0.95053215224966 * lb;
	}

	xyzToLuv() {
		const divider = this.xyz_x + 15 * this.xyz_y + 3 * this.xyz_z;
		let varU = 4 * this.xyz_x;
		let varV = 9 * this.xyz_y;
		if (divider !== 0) {
			varU /= divider;
			varV /= divider;
		} else {
			varU = NaN;
			varV = NaN;
		}
		this.luv_l = yToL(this.xyz_y);
		if (this.luv_l === 0) {
			this.luv_u = 0;
			this.luv_v = 0;
		} else {
			this.luv_u = 13 * this.luv_l * (varU - refU);
			this.luv_v = 13 * this.luv_l * (varV - refV);
		}
	}

	luvToXyz() {
		if (this.luv_l === 0) {
			this.xyz_x = 0;
			this.xyz_y = 0;
			this.xyz_z = 0;
			return;
		}
		const varU = this.luv_u / (13 * this.luv_l) + refU;
		const varV = this.luv_v / (13 * this.luv_l) + refV;
		this.xyz_y = lToY(this.luv_l);
		this.xyz_x = 0 - 9 * this.xyz_y * varU / ((varU - 4) * varV - varU * varV);
		this.xyz_z = (9 * this.xyz_y - 15 * varV * this.xyz_y - varV * this.xyz_x) / (3 * varV);
	}

	luvToLch() {
		this.lch_l = this.luv_l;
		this.lch_c = Math.sqrt(this.luv_u * this.luv_u + this.luv_v * this.luv_v);
		if (this.lch_c < 0.00000001) {
			this.lch_h = 0;
		} else {
			const hrad = Math.atan2(this.luv_v, this.luv_u);
			this.lch_h = hrad * 180.0 / Math.PI;
			if (this.lch_h < 0) {
				this.lch_h = 360 + this.lch_h;
			}
		}
	}

	lchToLuv() {
		const hrad = this.lch_h / 180.0 * Math.PI;
		this.luv_l = this.lch_l;
		this.luv_u = Math.cos(hrad) * this.lch_c;
		this.luv_v = Math.sin(hrad) * this.lch_c;
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

	calcMaxChromaHpluv() {
		const r0 = distanceFromOrigin(this.r0s, this.r0i);
		const r1 = distanceFromOrigin(this.r1s, this.r1i);
		const g0 = distanceFromOrigin(this.g0s, this.g0i);
		const g1 = distanceFromOrigin(this.g1s, this.g1i);
		const b0 = distanceFromOrigin(this.b0s, this.b0i);
		const b1 = distanceFromOrigin(this.b1s, this.b1i);
		return min6(r0, r1, g0, g1, b0, b1);
	}

	calcMaxChromaHsluv(h) {
		const hueRad = h / 360 * Math.PI * 2;
		const r0 = distanceFromOriginAngle(this.r0s, this.r0i, hueRad);
		const r1 = distanceFromOriginAngle(this.r1s, this.r1i, hueRad);
		const g0 = distanceFromOriginAngle(this.g0s, this.g0i, hueRad);
		const g1 = distanceFromOriginAngle(this.g1s, this.g1i, hueRad);
		const b0 = distanceFromOriginAngle(this.b0s, this.b0i, hueRad);
		const b1 = distanceFromOriginAngle(this.b1s, this.b1i, hueRad);
		return min6(r0, r1, g0, g1, b0, b1);
	}

	hsluvToLch() {
		if (this.hsluv.l > 99.9999999) {
			this.lch_l = 100;
			this.lch_c = 0;
		} else if (this.hsluv.l < 0.00000001) {
			this.lch_l = 0;
			this.lch_c = 0;
		} else {
			this.lch_l = this.hsluv.l;
			this.calculateBoundingLines(this.hsluv.l);
			const max = this.calcMaxChromaHsluv(this.hsluv.h);
			this.lch_c = max / 100 * this.hsluv.s;
		}
		this.lch_h = this.hsluv.h;
	}

	lchToHsluv() {
		if (this.lch_l > 99.9999999) {
			this.hsluv.s = 0;
			this.hsluv.l = 100;
		} else if (this.lch_l < 0.00000001) {
			this.hsluv.s = 0;
			this.hsluv.l = 0;
		} else {
			this.calculateBoundingLines(this.lch_l);
			const max = this.calcMaxChromaHsluv(this.lch_h);
			this.hsluv.s = this.lch_c / max * 100;
			this.hsluv.l = this.lch_l;
		}
		this.hsluv.h = this.lch_h;
	}

	hpluvToLch() {
		if (this.hpluv_l > 99.9999999) {
			this.lch_l = 100;
			this.lch_c = 0;
		} else if (this.hpluv_l < 0.00000001) {
			this.lch_l = 0;
			this.lch_c = 0;
		} else {
			this.lch_l = this.hpluv_l;
			this.calculateBoundingLines(this.hpluv_l);
			const max = this.calcMaxChromaHpluv();
			this.lch_c = max / 100 * this.hpluv_p;
		}
		this.lch_h = this.hpluv_h;
	}

	lchToHpluv() {
		if (this.lch_l > 99.9999999) {
			this.hpluv_p = 0;
			this.hpluv_l = 100;
		} else if (this.lch_l < 0.00000001) {
			this.hpluv_p = 0;
			this.hpluv_l = 0;
		} else {
			this.calculateBoundingLines(this.lch_l);
			const max = this.calcMaxChromaHpluv();
			this.hpluv_p = this.lch_c / max * 100;
			this.hpluv_l = this.lch_l;
		}
		this.hpluv_h = this.lch_h;
	}

	hsluvToRgb() {
		this.hsluvToLch();
		this.lchToLuv();
		this.luvToXyz();
		this.xyzToRgb();
	}

	hpluvToRgb() {
		this.hpluvToLch();
		this.lchToLuv();
		this.luvToXyz();
		this.xyzToRgb();
	}

	/**
	 * @return {string}
	 */
	hsluvToHex() {
		this.hsluvToRgb();
		this.rgbToHex();
		return this._hex;
	}

	/**
	 * @return {string}
	 */
	hpluvToHex() {
		this.hpluvToRgb();
		this.rgbToHex();
		return this._hex;
	}

	/**
	 * @param {string} hex
	 * @return {Hsluv}
	 */
	hex(hex) {
		this._hex = hex.toLowerCase();
		this.rgb_r = hexToRgbChannel(this._hex, 1);
		this.rgb_g = hexToRgbChannel(this._hex, 3);
		this.rgb_b = hexToRgbChannel(this._hex, 5);
		this._toLuv();
		return this;
	}

	/**
	 * @private
	 */
	_toLuv() {
		this.rgbToXyz();
		this.xyzToLuv();
		this.luvToLch();
		this.lchToHpluv();
		this.lchToHsluv();
	}
}

export class Hsl {
	/**
	 * @param {Hsluv} parent
	 */
	constructor(parent) {
		this._parent = parent;
		this.hex = this._parent.hsluvToHex.bind(this._parent);
	}

	/**
	 * @private
	 * @type {Hsluv}
	 */
	_parent;

	h = 0;
	s = 0;
	l = 0;

	/**
	 * @type {function(): string}
	 */
	hex;
}