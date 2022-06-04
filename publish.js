const zipdir = require('zip-dir');

zipdir('./dist', {saveTo: './dist.zip'}, (err, buffer) => {
	if (err) {
		console.error(err);
	}
});
