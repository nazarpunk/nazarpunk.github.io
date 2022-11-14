// noinspection DuplicatedCode,JSUnusedLocalSymbols

const a = document.querySelector('.a .block');
const b = document.querySelector('.b .block');

/*
 sx0  yx1  zx2  p3
 xy4  sy5  zy6  p7
 xz8  yz9  sz10 p11
 tx12 ty13 tz14 p15
 */

window.addEventListener('mousemove', e => {
	const d = clamp((e.pageY - innerHeight * .5) / 400, -1, 1);
	const v = lerp(0, Math.PI, d);

	const x = 160 * .5;
	const y = 106 * .5;

	//         0  1  2  3       4  5  6  7       8  9  10 11      12 13 14 15
	const m = [1, 0, 0, 0, /**/ 0, 1, 0, 0, /**/ 0, 0, 1, 0, /**/ 0, 0, 0, 1];

	const p = [1, 0, 0, 0, /**/ 0, 1, 0, 0, /**/ 0, 0, 1, -1 / 800, /**/ 0, 0, 0, 1];

	multiply(m, p);
	translate(m, -x, y, 0);
	rotateX(m, v);

	translate(m, 0, -y, 0);
	a.style.transform = `matrix3d(${m.join(',')})`;

	translate(m, x);
	b.style.transform = `matrix3d(${m.join(',')})`;
});

/**
 * @param {number[]} a
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
const translate = (a, x = 0, y = 0, z = 0) => {
	a[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
	a[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
	a[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
	a[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
};

/**
 * @param {number[]} m the receiving matrix
 * @param {number} rad the angle to rotate the matrix by
 */
const rotateX = (m, rad) => {
	const s = Math.sin(rad),
		c = Math.cos(rad),
		a4 = m[4],
		a5 = m[5],
		a6 = m[6],
		a7 = m[7],
		a8 = m[8],
		a9 = m[9],
		a10 = m[10],
		a11 = m[11];
	m[4] = a4 * c + a8 * s;
	m[5] = a5 * c + a9 * s;
	m[6] = a6 * c + a10 * s;
	m[7] = a7 * c + a11 * s;
	m[8] = a8 * c - a4 * s;
	m[9] = a9 * c - a5 * s;
	m[10] = a10 * c - a6 * s;
	m[11] = a11 * c - a7 * s;
};

const multiply = (a, b) => {
	const a0 = a[0],
		a1 = a[1],
		a2 = a[2],
		a3 = a[3],
		a4 = a[4],
		a5 = a[5],
		a6 = a[6],
		a7 = a[7],
		a8 = a[8],
		a9 = a[9],
		a10 = a[10],
		a11 = a[11],
		a12 = a[12],
		a13 = a[13],
		a14 = a[14],
		a15 = a[15];

	let b0 = b[0],
		b1 = b[1],
		b2 = b[2],
		b3 = b[3];

	a[0] = b0 * a0 + b1 * a4 + b2 * a8 + b3 * a12;
	a[1] = b0 * a1 + b1 * a5 + b2 * a9 + b3 * a13;
	a[2] = b0 * a2 + b1 * a6 + b2 * a10 + b3 * a14;
	a[3] = b0 * a3 + b1 * a7 + b2 * a11 + b3 * a15;

	b0 = b[4];
	b1 = b[5];
	b2 = b[6];
	b3 = b[7];
	a[4] = b0 * a0 + b1 * a4 + b2 * a8 + b3 * a12;
	a[5] = b0 * a1 + b1 * a5 + b2 * a9 + b3 * a13;
	a[6] = b0 * a2 + b1 * a6 + b2 * a10 + b3 * a14;
	a[7] = b0 * a3 + b1 * a7 + b2 * a11 + b3 * a15;

	b0 = b[8];
	b1 = b[9];
	b2 = b[10];
	b3 = b[11];
	a[8] = b0 * a0 + b1 * a4 + b2 * a8 + b3 * a12;
	a[9] = b0 * a1 + b1 * a5 + b2 * a9 + b3 * a13;
	a[10] = b0 * a2 + b1 * a6 + b2 * a10 + b3 * a14;
	a[11] = b0 * a3 + b1 * a7 + b2 * a11 + b3 * a15;

	b0 = b[12];
	b1 = b[13];
	b2 = b[14];
	b3 = b[15];
	a[12] = b0 * a0 + b1 * a4 + b2 * a8 + b3 * a12;
	a[13] = b0 * a1 + b1 * a5 + b2 * a9 + b3 * a13;
	a[14] = b0 * a2 + b1 * a6 + b2 * a10 + b3 * a14;
	a[15] = b0 * a3 + b1 * a7 + b2 * a11 + b3 * a15;
};

/**
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
const lerp = (a, b, t) => a * (1 - t) + b * t;


export {}