//     animationUC.js 1.2.1

//     (c) 2015 Byunghwa Yoo
//     animationUC may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/ssohjiro/animationUC

(function( factory ) {

	// Establish the root object, `window` (`self`) in the browser, or `global` on the server.
	// We use `self` instead of `window` for `WebWorker` support.
	var root = (typeof self == 'object' && self.self == self && self) ||
			(typeof global == 'object' && global.global == global && global);




	// Set up Backbone appropriately for the environment. Start with AMD.
	if (typeof define === 'function' && define.amd) {

		define(['jquery', 'rafUC', 'ease-component', 'underscore', 'loglevel', 'exports'],
		function($, rafUC, ease, _, logger, exports) {
			// Export global even in AMD case in case this script is loaded with
			// others that may still expect a global aniUC.
			root.aniUC = factory(root, exports, $, rafUC.raf, rafUC.caf, ease, _, logger );
		});




	// Next for CommonJS.
	} else if (typeof exports !== 'undefined') {

		var $ = require('jquery');
		var rafUC = require('rafUC');
		var ease = require('ease-component');
		var _ = require('underscore');
		var logger = require('loglevel');

		factory(root, exports, $, rafUC.raf, rafUC.caf, ease, _, logger );




	// Finally, as a browser global.
	} else {
		root.logger = root.log;	// in case of loglevel
		root.aniUC = factory(root, {}, root.jQuery, root.rafUC.raf, root.rafUC.caf, root.ease, root._, root.logger );
	}
	
}( function( root, aniUC, $, raf, caf, ease, _, logger ) {

	// Current version of the library. Keep in sync with `package.json`.
	aniUC.VERSION = '0.0.1';

	// Save the previous value of the `Backbone` variable, so that it can be
	// restored later on, if `noConflict` is used.
	var previousAniUC = root.aniUC;
	aniUC.noConflict = function() {
		root.aniUC = previousAniUC;
		return this;
	};

	var defaultOptions = {
		duration: 500
	}

	aniUC.tween = function( el, endPos, options ) {

		options = _.extend({}, defaultOptions, options );

		'use strict';

		var startPos = {};

		_.each( endPos, function( val, key ) {
			if( key === 'scrollTop' ) {
				startPos.scrollTop = el.scrollTop;
			}
		});

		var startTime = Date.now();
		var stop = false;

		function draw() {

			var cur = {};
			var now = Date.now();

			if( now - startTime >= options.duration ) stop = true;

			if( stop ) {
				cur.scrollTop = endPos.scrollTop;
			} else {
				var p = ( now - startTime ) / options.duration;
				var val = ease.outQuad( p );
				cur.scrollTop = startPos.scrollTop + ( endPos.scrollTop - startPos.scrollTop ) * val;
			}

			logger.debug( cur.scrollTop );
			el.scrollTop = cur.scrollTop;
		}

		function animate() {
			if( stop ) return;
			raf( animate );
			draw();
		}

		animate();
	};


	_getStartStyles = function( el, styles ) {

		var styleValues = {};

		var keys = _.keys( styles );

		_.each( keys, function( val ) {

			var pos = el.style[ key ];
			if( _.isString( pos ) ) {
				pos = Number( pos.replace('px', '' ));
			}

			if( ! _.isNumber( pos ) ) {
				logger.error( 'key: ' + key + ' / val: ' + val );
				return;
			}
				
			styleValues[ key ] = startPos;
		});

		return styleValues;
	};

	return aniUC;
}));
