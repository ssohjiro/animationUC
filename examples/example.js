
var aniUC = require('../animation-uc');

aniUC.tween( document.getElementById('box'), { y: 400, x:200 }, {
	duration: 5000,
	complete: function() {
		console.log('ok');
	}
});

setTimeout( function() {
	aniUC.tween( document.getElementById('box'), { y: 0, x:0 }, {
		duration: 5000,
		complete: function() {
			console.log('ok2');
		}
	});
}, 2000 );
