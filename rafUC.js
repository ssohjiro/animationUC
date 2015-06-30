/**
 * requestAnimationFrame polyfill by Erik Möller & Paul Irish et. al.
 * https://gist.github.com/1866474
 *
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
**/

/*jshint asi: false, browser: true, curly: true, eqeqeq: true, forin: false, newcap: true, noempty: true, strict: true, undef: true */

(function( factory ) {

	'use strict';

	// Establish the root object, `window` (`self`) in the browser.
	var root = window;

	// Set up Backbone appropriately for the environment. Start with AMD.
	if (typeof define === 'function' && define.amd) {

		define(['exports'], function(exports) {
			// Export global even in AMD case in case this script is loaded with
			// others that may still expect a global rafUC.
			root.rafUC = factory( window, exports );
		});

	// Next for CommonJS.
	} else if (typeof exports !== 'undefined') {
		factory( window, exports );

	// Finally, as a browser global.
	} else {
		root.rafUC = factory( window, {} );
	}

}( function( window, rafUC ) {

	'use strict';
	
	// Current version of the library. Keep in sync with `package.json`.
	rafUC.VERSION = '0.0.1';

	var previousRafUC = window.rafUC;
	rafUC.noConflict = function() {
		window.rafUC = previousRafUC;
		return this;
	};

	var lastTime = 0;
	var prefixes = 'webkit moz ms o'.split(' ');
	// get unprefixed rAF and cAF, if present
	var requestAnimationFrame = window.requestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame;
	// loop through vendor prefixes and get prefixed rAF and cAF
	var prefix;
	for( var i = 0; i < prefixes.length; i++ ) {
		if ( requestAnimationFrame && cancelAnimationFrame ) {
			break;
		}
		prefix = prefixes[i];
		requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
		cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] ||
		window[ prefix + 'CancelRequestAnimationFrame' ];
	}

	// fallback to setTimeout and clearTimeout if either request/cancel is not supported
	if ( !requestAnimationFrame || !cancelAnimationFrame ) {
		requestAnimationFrame = function( callback, element ) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() {
				callback( currTime + timeToCall );
			}, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};

		cancelAnimationFrame = function( id ) {
			window.clearTimeout( id );
		};
	}

	// put in global namespace
	window.requestAnimationFrame = requestAnimationFrame;
	window.cancelAnimationFrame = cancelAnimationFrame;

	rafUC.raf = requestAnimationFrame;
	rafUC.caf = requestAnimationFrame;

	return rafUC;
}));
