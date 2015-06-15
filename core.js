/**
 * requestAnimationFrame polyfill by Erik Möller & Paul Irish et. al.
 * https://gist.github.com/1866474
 *
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
**/

/*jshint asi: false, browser: true, curly: true, eqeqeq: true, forin: false, newcap: true, noempty: true, strict: true, undef: true */

require('./requestAnimationFrame.js');
var ease = require('ease-component');
var _ = require('underscore');
var logger = require('loglevel');

var auc = {};
auc.tween = function( el, destStyles ) {

	'use strict';

	var startTime = Date.now();
	var startStyles = getStyleValues( destStyles );
	var duration

};

function getStyleValues( styles ) {

	var styleValues = {};

	_.each( styles, function( val, key ) {

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
}


function getValue( x, duration, now ) {

	return val;
}

modules.exports = animationUc;
