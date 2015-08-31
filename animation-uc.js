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

		define(['raf-uc', 'ease-component', 'underscore', 'loglevel', 'exports'],
		function( rafUC, ease, _, logger, exports) {
			// Export global even in AMD case in case this script is loaded with
			// others that may still expect a global aniUC.
			root.aniUC = factory(root, exports, rafUC.raf, rafUC.caf, ease, _, logger );
		});




	// Next for CommonJS.
	} else if (typeof exports !== 'undefined') {

		var rafUC = require('raf-uc');
		var ease = require('ease-component');
		var _ = require('underscore');
		var logger = require('loglevel');

		factory(root, exports, rafUC.raf, rafUC.caf, ease, _, logger );




	// Finally, as a browser global.
	} else {
		root.logger = root.log;	// in case of loglevel
		root.aniUC = factory(root, {}, root.rafUC.raf, root.rafUC.caf, root.ease, root._, root.logger );
	}
	
}( function( root, aniUC, raf, caf, ease, _, logger ) {

	// Current version of the library. Keep in sync with `package.json`.
	aniUC.VERSION = '0.0.1';

	// Save the previous value of the `Backbone` variable, so that it can be
	// restored later on, if `noConflict` is used.
	var previousAniUC = root.aniUC;
	aniUC.noConflict = function() {
		root.aniUC = previousAniUC;
		return this;
	};

	var cssAttrs = [ 'top','height','fontSize','lineHeight' ];

	var defaultOptions = {
		duration: 500
	};
	
	function getTransform(el) {
		var transform = window.getComputedStyle(el, null).getPropertyValue('transform');
		//var results = transform.match(/matrix(?:(3d)\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))(?:, (-{0,1}\d+)), -{0,1}\d+\)|\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))\))/);
		//var results = transform.match(/matrix(?:(3d)\(\d+(?:, \d+)*(?:, (\d+))(?:, (\d+))(?:, (\d+)), \d+\)|\(\d+(?:, \d+)*(?:, (\d+))(?:, (\d+))\))/)


		var results = transform.match(/matrix(?:(3d)\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*)), -{0,1}\d+\.?\d*\)|\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))\))/);


		if(!results) return [0, 0, 0];
		if(results[1] == '3d') return results.slice(2,5).map( Number );

		results.push(0);
		return results.slice(5, 8).map(Number); // returns the [X,Y,Z,1] values
	}
	

	aniUC.getTransform = function(el ) {
		return getTransform( el );
	};

	var animatingList = {};

	aniUC.tween = function( el, endPos, options ) {

		'use strict';

		options = _.extend({}, defaultOptions, options );

		var id = _.uniqueId('animating');

		animatingList[ id ] = [{ el: el }];
		var startPos = {};

		_.each( endPos, function( val, key ) {

			if( key === 'scrollTop' ) {

				startPos.scrollTop = el.scrollTop;

			} else if(['x','y','z'].indexOf( key ) > -1 ) {
				// transform's translate3d style

				if( startPos.x === undefined ) {
					var translate3d = getTransform( el );
					startPos.x = translate3d[0] || 0;
					startPos.y = translate3d[1] || 0;
					startPos.z = translate3d[2] || 0;
					startPos.transform = 'translate3d(' + startPos.x + 'px, '+ startPos.y+'px,' + startPos.z+ 'px)';
					endPos.transform = 'translate3d(' + (endPos.x||0) + 'px, '+ (endPos.y||0)+'px,' + (endPos.z||0)+ 'px)';
				}

			} else if( cssAttrs.indexOf( key ) > -1 ) {

				var computedStyle = getComputedStyle( el );
				var position = computedStyle.position;

				var tmpStartPos = computedStyle[ key ].replace('px','');
				if( key === 'top' && tmpStartPos === 'auto' ) {
					if( position === 'absolute' ) tmpStartPos = el.offsetTop;
					else if( position === 'relative' ) tmpStartPos = 0;
				}

				startPos[ key ] = Number( tmpStartPos );

				if( typeof endPos[ key ] === 'string' ) {
					endPos[key] = Number( endPos[ key ].replace('px','') );
				}
			}
		});

		console.log( startPos, endPos );


		var startTime = Date.now();
		var stop = false;
		var complete = false;

		function draw() {

			var cur = {};
			var now = Date.now();

			if( now - startTime >= options.duration || animatingList[ id ].stop ) {
				stop = true;
				complete = true;
			}

			if( stop ) {

				_.each( startPos, function( val, key ) {
					if( key === 'scrollTop' ) {
						cur.scrollTop = endPos.scrollTop;
					} else if(['x','y','z'].indexOf( key ) > -1 ) {
						// transform's translate3d style
						cur.transform = endPos.transform;
					} else if( cssAttrs.indexOf( key ) > -1 ) {
						cur[ key ] = endPos[ key ];
					}
				});

				//cur.scrollTop = endPos.scrollTop;

			} else {
				var p = ( now - startTime ) / options.duration;
				var r = ease.outQuad( p );
				var x,y,z;

				_.each( startPos, function( val, key ) {
					cur[ key ] = val + ( endPos[ key ] - val ) * r;
				});

				cur.x = cur.x || 0;
				cur.y = cur.y || 0;
				cur.z = cur.z || 0;
				cur.transform = 'translate3d(' + cur.x + 'px, '+ cur.y+'px,' + cur.z+ 'px)';
				//console.log( cur.transform );

				//cur.scrollTop = startPos.scrollTop + ( endPos.scrollTop - startPos.scrollTop ) * r;
			}


			// 여기서 값 셋팅
			_.each( startPos, function( val, key ) {
				if( key === 'scrollTop' ) {
					el.scrollTop = cur.scrollTop;
				} else if( key === 'transform' ) {

					el.style[ key ] = cur[ key ];

				} else if( cssAttrs.indexOf( key ) > -1 ) {
					
					el.style[ key ] = cur[ key ] + 'px';
					logger.debug( el.style[ key ] );
				}
			});
			//el.scrollTop = cur.scrollTop;

			if( cur.scrollTop === endPos.scrollTop ) delete startPos.scrollTop;
			if( cur.top === endPos.top ) delete startPos.top;
		}

		function animate() {

			if( complete ) {
				if( options.complete && typeof options.complete === 'function' ) {
					options.complete( el );
				}
			}
			if( stop ) return;

			raf( animate );
			draw();
		}

		animate();
	};
	
	window.aniUC = aniUC;
	return aniUC;
}));
