const img = document.querySelector('img');

/*
 sx0  yx1  zx2  p3
 xy4  sy5  zy6  p7
 xz8  yz9  sz10 p11
 tx12 ty13 tz14 p15
 */

//              0  1  2  3       4  5  6  7       8  9  10 11      12 13 14 15
const matrix = [1, 0, 0, 0, /**/ 0, 1, 0, 0, /**/ 0, 0, 1, 0, /**/ 0, 0, 0, 1];

window.addEventListener('mousemove', e => {
	matrix[12] = 250;
	matrix[13] = 50;

	const cx = img.offsetLeft + img.clientWidth * .5 + matrix[12];
	const cy = img.offsetTop + img.clientHeight * .5;



	let rx = (e.pageX - cx) * 0.000001;
	let ry = (e.pageY - cy) * 0.000001;

	matrix[0] = .5;
	matrix[5] = matrix[0];

	matrix[3] = rx * 3;
	matrix[7] = ry * 4;

	console.log(ry);

	img.style.transform = `matrix3d(${matrix.join(',')})`;
});

export {}