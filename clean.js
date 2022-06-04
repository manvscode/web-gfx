const fs = require('fs');

function clean(files) {
	files.forEach((f) => {
		if (fs.existsSync(f)) {
			let s = fs.lstatSync(f);

			if (s.isDirectory()) {
				const subFiles = fs.readdirSync(f).map(s => `${f}/${s}`);
				clean(subFiles);
				fs.rmdirSync(f);
			} else {
				console.log(`Removing ${f}`)
				fs.unlinkSync(f)
			}
		}
	});
}

try {
	const dir = './dist/js';
	const files = fs.readdirSync(dir).map(f => `${dir}/${f}`);
	files.push('publish.zip');

	clean(files);
} catch (err) {
	console.error(err);
}

