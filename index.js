/*!
 * array-sort <https://github.com/jonschlinkert/array-sort>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var defaultCompare = require('default-compare');
var typeOf = require('kind-of');
var get = require('get-value');

/**
 * Sort an array of objects by one or more properties.
 *
 * @param  {Array} `arr` The Array to sort.
 * @param  {String|Array|Function} `props` One or more object paths or comparison functions.
 * @param  {Object} `opts` Pass `{ direction: 'asc' }` to set the sort direction.
 * @return {Array} Returns a sorted array.
 * @api public
 */

function arraySort(arr, props) {
  var opts = {};
  if (arr == null) {
    return [];
  }

  if (!Array.isArray(arr)) {
    throw new TypeError('array-sort expects an array.');
  }

  if (arguments.length === 1) {
    return arr.sort();
  }

  var args = flatten([].slice.call(arguments, 1));

  // if the last argument appears to be a plain object,
  // it's not a valid `compare` arg, so it must be options.
  if (typeOf(args[args.length - 1]) === 'object' && !args[args.length - 1].hasOwnProperty('field')) {
    opts = args.pop();
  }
  return arr.sort(sortBy(args, opts));
}

/**
 * Iterate over each comparison property or function until `1` or `-1`
 * is returned.
 *
 * @param  {String|Array|Function} `props` One or more object paths or comparison functions.
 * @param  {Object} `opts` Pass `{ direction: 'asc' }` to set the sort direction.
 * @return {Array}
 */

function sortBy(props, opts) {
  opts = opts || {};

  var order = {};
  if (opts.order) {
    opts.order.forEach((d, i) => { order[d] = i; });
  }

  return function compareFn(a, b) {
    var len = props.length, i = -1;
    var result;

    while (++i < len) {
      result = compare(props[i], a, b, order);
      if (result !== 0) {
        break;
      }
    }
    if (opts.direction === 'desc') {
      return result * -1;
    }
    return result;
  };
}

/**
 * Compare `a` to `b`. If an object `prop` is passed, then
 * `a[prop]` is compared to `b[prop]`
 */

function compare(prop, a, b, map = {}) {
  if (typeof prop === 'function') {
    // expose `compare` to custom function
    return prop(a, b, compare.bind(null, null));
  }
  if (prop && typeof prop === 'object') {
    return (prop.direction === 'desc' ? -1 : 1) * compare(prop.field, a, b, map);
  }
  if (map.hasOwnProperty(a) || map.hasOwnProperty(b)) {
    return defaultCompare(map[a], map[b]);
  }
  // compare object values
  if (prop && typeof a === 'object' && typeof b === 'object') {
    return compare(null, get(a, prop), get(b, prop), map);
  }
  return defaultCompare(a, b);
}

/**
 * Flatten the given array.
 */

function flatten(arr) {
  return [].concat.apply([], arr);
}

/**
 * Expose `arraySort`
 */

module.exports = arraySort;
