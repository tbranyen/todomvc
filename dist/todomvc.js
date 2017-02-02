(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.devTools = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _uniqueSelector = _dereq_('unique-selector');

var _uniqueSelector2 = _interopRequireDefault(_uniqueSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.unique = _uniqueSelector2.default;

function devTools() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var cacheTask = [];
  var elements = new Set();
  var extension = null;
  var interval = null;

  var pollForFunction = function pollForFunction() {
    return new Promise(function (resolve) {
      if (window.__diffHTMLDevTools) {
        resolve(window.__diffHTMLDevTools);
      } else {
        // Polling interval that looks for the diffHTML devtools hook.
        interval = setInterval(function () {
          if (window.__diffHTMLDevTools) {
            resolve(window.__diffHTMLDevTools);
            clearInterval(interval);
          }
        }, 2000);
      }
    });
  };

  function devToolsTask(transaction) {
    var domNode = transaction.domNode,
        markup = transaction.markup,
        options = transaction.options,
        _transaction$state = transaction.state,
        oldTree = _transaction$state.oldTree,
        newTree = _transaction$state.newTree,
        state = transaction.state;


    var selector = (0, _uniqueSelector2.default)(domNode);

    elements.add(selector);

    var startDate = Date.now();
    var start = function start() {
      return extension.startTransaction({
        domNode: selector,
        markup: markup,
        options: options,
        state: state
      });
    };

    if (extension) {
      start();
    }

    return function () {
      var endDate = Date.now();

      transaction.onceEnded(function () {
        var aborted = transaction.aborted,
            patches = transaction.patches,
            promises = transaction.promises,
            completed = transaction.completed;

        var stop = function stop() {
          return extension.endTransaction(startDate, endDate, {
            domNode: selector,
            markup: markup,
            options: options,
            state: state,
            patches: patches,
            promises: promises,
            completed: completed,
            aborted: aborted
          });
        };

        if (!extension) {
          cacheTask.push(function () {
            return stop();
          });
        } else {
          stop();
        }
      });
    };
  }

  devToolsTask.subscribe = function (_ref) {
    var VERSION = _ref.VERSION,
        internals = _ref.internals;

    pollForFunction().then(function (devToolsExtension) {
      var MiddlewareCache = [];

      internals.MiddlewareCache.forEach(function (middleware) {
        var name = middleware.name.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
          return str.toUpperCase();
        }).split(' ').slice(0, -1).join(' ');

        MiddlewareCache.push(name);
      });

      extension = devToolsExtension().activate({
        VERSION: VERSION,
        internals: {
          MiddlewareCache: MiddlewareCache
        }
      });

      if (cacheTask.length) {
        setTimeout(function () {
          cacheTask.forEach(function (cb) {
            return cb();
          });
          cacheTask.length = 0;
        });
      }
    });
  };

  return devToolsTask;
}

exports.default = devTools;

},{"unique-selector":8}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAttributes = getAttributes;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Returns the Attribute selectors of the element
 * @param  { DOM Element } element
 * @param  { Array } array of attributes to ignore
 * @return { Array }
 */
function getAttributes(el) {
  var attributesToIgnore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['id', 'class', 'length'];
  var attributes = el.attributes;

  var attrs = [].concat(_toConsumableArray(attributes));

  return attrs.reduce(function (sum, next) {
    if (!(attributesToIgnore.indexOf(next.nodeName) > -1)) {
      sum.push('[' + next.nodeName + '="' + next.value + '"]');
    }
    return sum;
  }, []);
}
},{}],3:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClasses = getClasses;
exports.getClassSelectors = getClassSelectors;
/**
 * Get class names for an element
 *
 * @pararm { Element } el
 * @return { Array }
 */
function getClasses(el) {
  var classNames = void 0;

  try {
    classNames = el.classList.toString().split(' ');
  } catch (e) {
    if (!el.hasAttribute('class')) {
      return [];
    }

    var className = el.getAttribute('class');

    // remove duplicate and leading/trailing whitespaces
    className = className.trim().replace(/\s+/g, ' ');

    // split into separate classnames
    classNames = className.split(' ');
  }

  return classNames;
}

/**
 * Returns the Class selectors of the element
 * @param  { Object } element
 * @return { Array }
 */
function getClassSelectors(el) {
  var classList = getClasses(el).filter(Boolean);
  return classList.map(function (cl) {
    return '.' + cl;
  });
}
},{}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getID = getID;
/**
 * Returns the Tag of the element
 * @param  { Object } element
 * @return { String }
 */
function getID(el) {
  return '#' + el.getAttribute('id');
}
},{}],5:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNthChild = getNthChild;

var _isElement = _dereq_('./isElement');

/**
 * Returns the selectors based on the position of the element relative to its siblings
 * @param  { Object } element
 * @return { Array }
 */
function getNthChild(element) {
  var counter = 0;
  var k = void 0;
  var sibling = void 0;
  var parentNode = element.parentNode;


  if (Boolean(parentNode)) {
    var childNodes = parentNode.childNodes;

    var len = childNodes.length;
    for (k = 0; k < len; k++) {
      sibling = childNodes[k];
      if ((0, _isElement.isElement)(sibling)) {
        counter++;
        if (sibling === element) {
          return ':nth-child(' + counter + ')';
        }
      }
    }
  }
  return null;
}
},{"./isElement":9}],6:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getParents = getParents;

var _isElement = _dereq_('./isElement');

/**
 * Returns all the element and all of its parents
 * @param { DOM Element }
 * @return { Array of DOM elements }
 */
function getParents(el) {
  var parents = [];
  var currentElement = el;
  while ((0, _isElement.isElement)(currentElement)) {
    parents.push(currentElement);
    currentElement = currentElement.parentNode;
  }

  return parents;
}
},{"./isElement":9}],7:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTag = getTag;
/**
 * Returns the Tag of the element
 * @param  { Object } element
 * @return { String }
 */
function getTag(el) {
  return el.tagName.toLowerCase();
}
},{}],8:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = unique;

var _getID = _dereq_('./getID');

var _getClasses = _dereq_('./getClasses');

var _getAttributes = _dereq_('./getAttributes');

var _getNthChild = _dereq_('./getNthChild');

var _getTag = _dereq_('./getTag');

var _isUnique = _dereq_('./isUnique');

var _getParents = _dereq_('./getParents');

/**
 * Returns all the selectors of the elmenet
 * @param  { Object } element
 * @return { Object }
 */
function getAllSelectors(el, selectors, attributesToIgnore) {
  var funcs = {
    'Tag': _getTag.getTag,
    'NthChild': _getNthChild.getNthChild,
    'Attributes': function Attributes(elem) {
      return (0, _getAttributes.getAttributes)(elem, attributesToIgnore);
    },
    'Class': _getClasses.getClassSelectors,
    'ID': _getID.getID
  };

  return selectors.reduce(function (res, next) {
    res[next] = funcs[next](el);
    return res;
  }, {});
}

/**
 * Tests uniqueNess of the element inside its parent
 * @param  { Object } element
 * @param { String } Selectors
 * @return { Boolean }
 */
/**
 * Expose `unique`
 */

function testUniqueness(element, selector) {
  var parentNode = element.parentNode;

  var elements = parentNode.querySelectorAll(selector);
  return elements.length === 1 && elements[0] === element;
}

/**
 * Checks all the possible selectors of an element to find one unique and return it
 * @param  { Object } element
 * @param  { Array } items
 * @param  { String } tag
 * @return { String }
 */
function getUniqueCombination(element, items, tag) {
  var combinations = getCombinations(items);
  var uniqCombinations = combinations.filter(testUniqueness.bind(this, element));
  if (uniqCombinations.length) return uniqCombinations[0];

  if (Boolean(tag)) {
    var _combinations = items.map(function (item) {
      return tag + item;
    });
    var _uniqCombinations = _combinations.filter(testUniqueness.bind(this, element));
    if (_uniqCombinations.length) return _uniqCombinations[0];
  }

  return null;
}

/**
 * Returns a uniqueSelector based on the passed options
 * @param  { DOM } element
 * @param  { Array } options
 * @return { String }
 */
function getUniqueSelector(element, selectorTypes, attributesToIgnore) {
  var foundSelector = void 0;

  var elementSelectors = getAllSelectors(element, selectorTypes, attributesToIgnore);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = selectorTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var selectorType = _step.value;
      var ID = elementSelectors.ID,
          Tag = elementSelectors.Tag,
          Classes = elementSelectors.Class,
          Attributes = elementSelectors.Attributes,
          NthChild = elementSelectors.NthChild;

      switch (selectorType) {
        case 'ID':
          if (Boolean(ID) && testUniqueness(element, ID)) {
            return ID;
          }
          break;

        case 'Tag':
          if (Boolean(Tag) && testUniqueness(element, Tag)) {
            return Tag;
          }
          break;

        case 'Class':
          if (Boolean(Classes) && Classes.length) {
            foundSelector = getUniqueCombination(element, Classes, Tag);
            if (foundSelector) {
              return foundSelector;
            }
          }
          break;

        case 'Attributes':
          if (Boolean(Attributes) && Attributes.length) {
            foundSelector = getUniqueCombination(element, Attributes, Tag);
            if (foundSelector) {
              return foundSelector;
            }
          }
          break;

        case 'NthChild':
          if (Boolean(NthChild)) {
            return NthChild;
          }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return '*';
}

/**
 * Returns all the possible selector combinations
 */
function getCombinations(items) {
  items = items ? items : [];
  var result = [[]];
  var i = void 0,
      j = void 0,
      k = void 0,
      l = void 0,
      ref = void 0,
      ref1 = void 0;

  for (i = k = 0, ref = items.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
    for (j = l = 0, ref1 = result.length - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
      result.push(result[j].concat(items[i]));
    }
  }

  result.shift();
  result = result.sort(function (a, b) {
    return a.length - b.length;
  });
  result = result.map(function (item) {
    return item.join('');
  });

  return result;
}

/**
 * Generate unique CSS selector for given DOM element
 *
 * @param {Element} el
 * @return {String}
 * @api private
 */

function unique(el) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$selectorType = options.selectorTypes,
      selectorTypes = _options$selectorType === undefined ? ['ID', 'Class', 'Tag', 'NthChild'] : _options$selectorType,
      _options$attributesTo = options.attributesToIgnore,
      attributesToIgnore = _options$attributesTo === undefined ? ['id', 'class', 'length'] : _options$attributesTo;

  var allSelectors = [];
  var parents = (0, _getParents.getParents)(el);

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = parents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var elem = _step2.value;

      var selector = getUniqueSelector(elem, selectorTypes, attributesToIgnore);
      if (Boolean(selector)) {
        allSelectors.push(selector);
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var selectors = [];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = allSelectors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var it = _step3.value;

      selectors.unshift(it);
      var _selector = selectors.join(' > ');
      if ((0, _isUnique.isUnique)(el, _selector)) {
        return _selector;
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return null;
}
},{"./getAttributes":2,"./getClasses":3,"./getID":4,"./getNthChild":5,"./getParents":6,"./getTag":7,"./isUnique":10}],9:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isElement = isElement;
/**
 * Determines if the passed el is a DOM element
 */
function isElement(el) {
  var isElem = void 0;

  if ((typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object') {
    isElem = el instanceof HTMLElement;
  } else {
    isElem = !!el && (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' && el.nodeType === 1 && typeof el.nodeName === 'string';
  }
  return isElem;
}
},{}],10:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUnique = isUnique;
/**
 * Checks if the selector is unique
 * @param  { Object } element
 * @param  { String } selector
 * @return { Array }
 */
function isUnique(el, selector) {
  if (!Boolean(selector)) return false;
  var elems = el.ownerDocument.querySelectorAll(selector);
  return elems.length === 1 && elems[0] === el;
}
},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.inlineTransitions = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = inlineTransitions;
// Store maps of elements to handlers that are associated to transitions.
var transitionsMap = {
  attached: new Map(),
  detached: new Map(),
  replaced: new Map(),
  attributeChanged: new Map(),
  textChanged: new Map()
};

// Internal global transition state handlers, allows us to bind once and match.
var boundHandlers = [];

var assign = Object.assign,
    keys = Object.keys;

/**
 * Binds inline transitions to the parent element and triggers for any matching
 * nested children.
 */

function inlineTransitions() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  // Monitors whenever an element changes an attribute, if the attribute is a
  // valid state name, add this element into the related Set.
  var attributeChanged = function attributeChanged(domNode, name, oldVal, newVal) {
    var map = transitionsMap[name];
    var isFunction = typeof newVal === 'function';

    // Abort early if not a valid transition or if the new value exists, but
    // isn't a function.
    if (!map || newVal && !isFunction) {
      return;
    }

    // Add or remove based on the value existence and type.
    map[isFunction ? 'set' : 'delete'](domNode, newVal);
  };

  var subscribe = function subscribe(_ref) {
    var addTransitionState = _ref.addTransitionState;

    addTransitionState('attributeChanged', attributeChanged);

    // Add a transition for every type.
    keys(transitionsMap).forEach(function (name) {
      var map = transitionsMap[name];

      var handler = function handler(child) {
        for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        // If there are no elements to match here, abort.
        if (!map.size) {
          return;
        }

        // If the child element triggered in the transition is the root
        // element, this is an easy lookup for the handler.
        if (map.has(child)) {
          return map.get(child).apply(undefined, [child, child].concat(rest));
        }
        // The last resort is looping through all the registered elements to
        // see if the child is contained within. If so, it aggregates all the
        // valid handlers and if they return Promises return them into a
        // `Promise.all`.
        else {
            var _ret = function () {
              var retVal = [];

              // Last resort check for child.
              map.forEach(function (fn, element) {
                if (element.contains(child)) {
                  retVal.push(fn.apply(child, [element].concat(child, rest)));
                }
              });

              var hasPromise = retVal.some(function (ret) {
                return Boolean(ret && ret.then);
              });

              // This is the only time the return value matters.
              if (hasPromise) {
                return {
                  v: Promise.all(retVal)
                };
              }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
          }
      };

      // Save the handler for later unbinding.
      boundHandlers.push(handler);

      // Add the state handler.
      addTransitionState(name, handler);
    });
  };

  // This will unbind any internally bound transition states.
  var unsubscribe = function unsubscribe(_ref2) {
    var removeTransitionState = _ref2.removeTransitionState;

    // Unbind all the transition states.
    removeTransitionState('attributeChanged', attributeChanged);

    // Remove all elements from the internal cache.
    keys(transitionsMap).forEach(function (name) {
      var map = transitionsMap[name];

      // Unbind the associated global handler.
      removeTransitionState(name, boundHandlers.shift());

      // Empty the associated element set.
      map.clear();
    });

    // Empty the bound handlers.
    boundHandlers.length = 0;
  };

  return assign(function inlineTransitionsTask() {}, { subscribe: subscribe, unsubscribe: unsubscribe });
}
module.exports = exports['default'];

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.logger = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var identity = function identity(x) {
  return x;
};
var assign = Object.assign;


var humanize = function humanize(ms) {
  if (ms >= 1000) {
    return ms / 1000 + 's';
  }

  return ms + 'ms';
};

var stringToRGB = function stringToRGB(string) {
  var code = string.split('').reduce(function (hash, _, i) {
    return '' + (string.charCodeAt(i) + (hash << 5) - hash);
  }, 0);

  var hex = (code & 0x00FFFFFF).toString(16);
  return '#' + ('00000'.slice(0, 6 - hex.length) + hex);
};

var cloneTree = function cloneTree(tree) {
  return assign({}, tree, {
    attributes: assign({}, tree.attributes),
    childNodes: tree.childNodes.map(function (vTree) {
      return cloneTree(vTree);
    })
  });
};

var format = function format(patches) {
  var newPatches = {
    ELEMENT: {
      INSERT_BEFORE: [],
      REMOVE_CHILD: [],
      REPLACE_CHILD: [],
      NODE_VALUE: []
    },

    ATTRIBUTE: {
      SET: [],
      REMOVE: []
    }
  };

  var ELEMENT = newPatches.ELEMENT;
  var ATTRIBUTE = newPatches.ATTRIBUTE;


  patches.forEach(function (changeset) {
    var INSERT_BEFORE = changeset[0];
    var REMOVE_CHILD = changeset[1];
    var REPLACE_CHILD = changeset[2];
    var NODE_VALUE = changeset[3];
    var SET_ATTRIBUTE = changeset[4];
    var REMOVE_ATTRIBUTE = changeset[5];

    INSERT_BEFORE.forEach(function (patch) {
      var _patch = _slicedToArray(patch, 3);

      var vTree = _patch[0];
      var fragment = _patch[1];
      var referenceNode = _patch[2];

      ELEMENT.INSERT_BEFORE.push({ vTree: vTree, fragment: fragment, referenceNode: referenceNode });
    });

    REMOVE_CHILD.forEach(function (patch) {
      var _patch2 = _slicedToArray(patch, 2);

      var vTree = _patch2[0];
      var childNode = _patch2[1];

      ELEMENT.REMOVE_CHILD.push({ vTree: vTree, childNode: childNode });
    });

    REPLACE_CHILD.forEach(function (patch) {
      var _patch3 = _slicedToArray(patch, 3);

      var vTree = _patch3[0];
      var newChildNode = _patch3[1];
      var oldChildNode = _patch3[2];

      ELEMENT.REPLACE_CHILD.push({ vTree: vTree, newChildNode: newChildNode, oldChildNode: oldChildNode });
    });

    SET_ATTRIBUTE.forEach(function (patch) {
      var _patch4 = _slicedToArray(patch, 2);

      var vTree = _patch4[0];
      var attributesList = _patch4[1];

      var attributes = {};

      for (var i = 0; i < attributesList.length; i++) {
        var _attributesList$i = _slicedToArray(attributesList[i], 2);

        var name = _attributesList$i[0];
        var value = _attributesList$i[1];

        attributes[name] = value;
      }

      ATTRIBUTE.SET.push({ vTree: vTree, attributes: attributes });
    });

    REMOVE_ATTRIBUTE.forEach(function (patch) {
      var _patch5 = _slicedToArray(patch, 2);

      var vTree = _patch5[0];
      var attributesList = _patch5[1];

      var attributes = {};

      for (var i = 0; i < attributesList.length; i++) {
        var list = attributesList[i];

        for (var _i = 0; _i < list.length; _i++) {
          attributes[list[_i].name] = list[_i].value;
        }
      }

      ATTRIBUTE.REMOVE.push({ vTree: vTree, attributes: attributes });
    });
  });

  return newPatches;
};

/**
 * Re-usable log function. Used for during render and after render.
 *
 * @param message - Prefix for the console output.
 * @param method - Which console method to call
 * @param color - Which color styles to use
 * @param date - A date object to render
 * @param transaction - Contains: domNode, oldTree, newTree, patches, promises
 * @param options - Middleware options
 */
var log = function log(message, method, color, date, transaction, completed) {
  var domNode = transaction.domNode;
  var oldTree = transaction.oldTree;
  var newTree = transaction.newTree;
  var patches = transaction.patches;
  var promises = transaction.promises;
  var options = transaction.options;
  var markup = transaction.markup;
  var state = transaction.state;

  // Shadow DOM rendering...

  if (domNode.host) {
    var ctorName = domNode.host.constructor.name;


    console[method]('%c' + ctorName + ' render ' + (completed ? 'ended' : 'started'), 'color: ' + stringToRGB(ctorName) + (completed ? '; opacity: 0.5' : ''), completed ? completed : '');
  } else {
    console[method](message, color, completed ? completed : '');
  }

  if (!completed && domNode) {
    console.log('%cdomNode %O', 'font-weight: bold; color: #333', domNode);
  }

  if (!completed && markup) {
    console.log('%cmarkup %O', 'font-weight: bold; color: #333', markup);
  }

  if (!completed && options) {
    console.log('%coptions', 'font-weight: bold; color: #333', options);
  }

  if (oldTree || newTree) {
    console.log('%coldTree %O newTree %O', 'font-weight: bold; color: #333', transaction._cloneOldTree, cloneTree(newTree));
  }

  if (patches) {
    console.log('%cpatches %O', 'font-weight: bold; color: #333', patches);
  }

  // Don't clutter the output if there aren't any promises.
  if (promises && promises.length) {
    console.log('%ctransition promises %O', 'font-weight: bold; color: #333', promises);
  }
};

//

exports.default = function (opts) {
  return function loggerTask(transaction) {
    var start = new Date();

    log('%cdiffHTML...render transaction started', 'group', 'color: #FF0066', start, transaction);

    var oldTree = transaction.state.oldTree;


    transaction._cloneOldTree = oldTree && cloneTree(oldTree);

    /**
     * Transaction is effectively done, but we need to listen for it to actually
     * be finished.
     */
    return function () {
      // Transaction has fully completed.
      transaction.onceEnded(function () {
        console.groupEnd();

        log('%cdiffHTML...render transaction ended  ', 'group', 'color: #FF78B2', new Date(), transaction, ' >> Completed in: ' + humanize(Date.now() - start));

        console.groupEnd();
      });
    };
  };
};

module.exports = exports['default'];

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (process,global){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.diff = global.diff || {})));
}(this, (function (exports) { 'use strict';

// Associates DOM Nodes with state objects.
var StateCache = new Map();

// Associates Virtual Tree Elements with DOM Nodes.
var NodeCache = new Map();

// Caches all middleware. You cannot unset a middleware once it has been added.
var MiddlewareCache = new Set();

// Cache transition functions.
var TransitionCache = new Map();

// A modest size.
var size = 10000;

/**
 * Creates a pool to query new or reused values from.
 *
 * @param name
 * @param opts
 * @return {Object} pool
 */
var memory$1 = {
  free: new Set(),
  allocated: new Set(),
  protected: new Set()
};

// Prime the memory cache with n objects.
for (var i = 0; i < size; i++) {
  memory$1.free.add({
    rawNodeName: '',
    nodeName: '',
    nodeValue: '',
    nodeType: 1,
    key: '',
    childNodes: [],
    attributes: {}
  });
}

// Cache the values object.
var freeValues = memory$1.free.values();

// Cache VTree objects in a pool which is used to get
var Pool = {
  size: size,
  memory: memory$1,

  get: function get() {
    var value = freeValues.next().value || {
      rawNodeName: '',
      nodeName: '',
      nodeValue: '',
      nodeType: 1,
      key: '',
      childNodes: [],
      attributes: {}
    };
    memory$1.free.delete(value);
    memory$1.allocated.add(value);
    return value;
  },
  protect: function protect(value) {
    memory$1.allocated.delete(value);
    memory$1.protected.add(value);
  },
  unprotect: function unprotect(value) {
    if (memory$1.protected.has(value)) {
      memory$1.protected.delete(value);
      memory$1.free.add(value);
    }
  }
};

var memory = Pool.memory;
var protect = Pool.protect;
var unprotect = Pool.unprotect;

/**
 * Ensures that an vTree is not recycled during a render cycle.
 *
 * @param vTree
 * @return vTree
 */

function protectVTree(vTree) {
  protect(vTree);

  for (var i = 0; i < vTree.childNodes.length; i++) {
    protectVTree(vTree.childNodes[i]);
  }

  return vTree;
}

/**
 * Allows an vTree to be recycled during a render cycle.
 *
 * @param vTree
 * @return
 */
function unprotectVTree(vTree) {
  unprotect(vTree);

  for (var i = 0; i < vTree.childNodes.length; i++) {
    unprotectVTree(vTree.childNodes[i]);
  }

  return vTree;
}

/**
 * Moves all unprotected allocations back into available pool. This keeps
 * diffHTML in a consistent state after synchronizing.
 */
function cleanMemory() {
  memory.allocated.forEach(function (vTree) {
    return memory.free.add(vTree);
  });
  memory.allocated.clear();

  // Clean out unused elements, if we have any elements cached that no longer
  // have a backing VTree, we can safely remove them from the cache.
  NodeCache.forEach(function (node, descriptor) {
    if (!memory.protected.has(descriptor)) {
      NodeCache.delete(descriptor);
    }
  });
}

// Namespace.
var namespace = 'http://www.w3.org/2000/svg';

// List of SVG elements.
var elements = ['altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'svg', 'switch', 'symbol', 'text', 'textPath', 'tref', 'tspan', 'use', 'view', 'vkern'];

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Support loading diffHTML in non-browser environments.
var g = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object' ? global : window;
var element = g.document ? document.createElement('div') : null;

/**
 * Decodes HTML strings.
 *
 * @see http://stackoverflow.com/a/5796718
 * @param string
 * @return unescaped HTML
 */
function decodeEntities(string) {
  // If there are no HTML entities, we can safely pass the string through.
  if (!element || !string || !string.indexOf || !string.includes('&')) {
    return string;
  }

  element.innerHTML = string;
  return element.textContent;
}

/**
 * Tiny HTML escaping function, useful to protect against things like XSS and
 * unintentionally breaking attributes with quotes.
 *
 * @param {String} unescaped - An HTML value, unescaped
 * @return {String} - An HTML-safe string
 */
function escape(unescaped) {
  return unescaped.replace(/["&'<>`]/g, function (match) {
    return "&#" + match.charCodeAt(0) + ";";
  });
}

var marks = new Map();
var prefix = 'diffHTML';
var token = 'diff_perf';

var hasSearch = typeof location !== 'undefined' && location.search;
var hasArguments = typeof process !== 'undefined' && process.argv;
var wantsSearch = hasSearch && location.search.includes(token);
var wantsArguments = hasArguments && process.argv.includes(token);
var wantsPerfChecks = wantsSearch || wantsArguments;
var nop = function nop() {};

var measure = (function (domNode, vTree) {
  // If the user has not requested they want perf checks, return a nop
  // function.
  if (!wantsPerfChecks) {
    return nop;
  }

  return function (name) {
    // Use the Web Component name if it's available.
    if (domNode && domNode.host) {
      name = domNode.host.constructor.name + ' ' + name;
    } else if (typeof vTree.rawNodeName === 'function') {
      name = vTreevTree.name + ' ' + name;
    }

    var endName = name + '-end';

    if (!marks.has(name)) {
      marks.set(name, performance.now());
      performance.mark(name);
    } else {
      var totalMs = (performance.now() - marks.get(name)).toFixed(3);

      marks.delete(name);

      performance.mark(endName);
      performance.measure(prefix + ' ' + name + ' (' + totalMs + 'ms)', name, endName);
    }
  };
});

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;

var fragment = '#document-fragment';

function createTree(input, attributes, childNodes) {
  for (var _len = arguments.length, rest = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    rest[_key - 3] = arguments[_key];
  }

  var isNode = input && (typeof input === 'undefined' ? 'undefined' : _typeof$1(input)) === 'object' && 'parentNode' in input;

  if (arguments.length === 1) {
    if (!input) {
      return null;
    }

    // If the first argument is an array, we assume this is a DOM fragment and
    // the array are the childNodes.
    if (isArray(input)) {
      return createTree(fragment, input.map(function (vTree) {
        return createTree(vTree);
      }));
    }

    // Crawl an HTML or SVG Element/Text Node etc. for attributes and children.
    if (isNode) {
      attributes = {};
      childNodes = [];

      // When working with a text node, simply save the nodeValue as the
      // initial value.
      if (input.nodeType === 3) {
        childNodes = input.nodeValue;
      }
      // Element types are the only kind of DOM node we care about attributes
      // from. Shadow DOM, Document Fragments, Text, Comment nodes, etc. can
      // ignore this.
      else if (input.nodeType === 1 && input.attributes.length) {
          attributes = {};

          for (var i = 0; i < input.attributes.length; i++) {
            var _input$attributes$i = input.attributes[i],
                name = _input$attributes$i.name,
                value = _input$attributes$i.value;


            if (value === '' && name in input) {
              attributes[name] = input[name];
              continue;
            }

            attributes[name] = value;
          }
        }

      // Get the child nodes from an Element or Fragment/Shadow Root.
      if (input.nodeType === 1 || input.nodeType === 11) {
        if (input.childNodes.length) {
          childNodes = [];

          for (var _i = 0; _i < input.childNodes.length; _i++) {
            if (input.childNodes[_i]) {
              childNodes[_i] = createTree(input.childNodes[_i]);
            }
          }
        }
      }

      var vTree = createTree(input.nodeName, attributes, childNodes);
      NodeCache.set(vTree, input);
      return vTree;
    }

    // Assume any object value is a valid VTree object.
    if ((typeof input === 'undefined' ? 'undefined' : _typeof$1(input)) === 'object') {
      return input;
    }

    // Assume it is a DOM Node.
    return createTree(String(input), null, null);
  }

  // Support JSX-style children being passed.
  if (rest.length) {
    childNodes = [childNodes].concat(rest);
  }

  // Allocate a new VTree from the pool.
  var entry = Pool.get();
  var isTextNode = input === '#text';

  entry.key = '';
  entry.rawNodeName = input;
  entry.childNodes.length = 0;
  entry.nodeValue = '';
  entry.attributes = {};

  if (typeof input === 'string') {
    entry.nodeName = input.toLowerCase();
  } else {
    entry.nodeName = fragment;
  }

  if (isTextNode) {
    var _nodes = arguments.length === 2 ? attributes : childNodes;
    var nodeValue = isArray(_nodes) ? _nodes.join('') : _nodes;

    entry.nodeType = 3;
    entry.nodeValue = String(nodeValue || '');

    return entry;
  }

  if (input === fragment) {
    entry.nodeType = 11;
  } else if (input === '#comment') {
    entry.nodeType = 8;
  } else {
    entry.nodeType = 1;
  }

  var useAttributes = isArray(attributes) || (typeof attributes === 'undefined' ? 'undefined' : _typeof$1(attributes)) !== 'object';
  var nodes = useAttributes ? attributes : childNodes;
  var nodeArray = isArray(nodes) ? nodes : [nodes];

  if (nodes && nodeArray.length) {
    for (var _i2 = 0; _i2 < nodeArray.length; _i2++) {
      var newNode = nodeArray[_i2];

      if ((typeof newNode === 'undefined' ? 'undefined' : _typeof$1(newNode)) === 'object') {
        entry.childNodes[_i2] = createTree(newNode);
      }
      // Cover generate cases where a user has indicated they do not want a
      // node from appearing.
      else if (typeof newNode !== 'null' && typeof newNode !== 'undefined') {
          if (newNode !== false) {
            entry.childNodes[_i2] = createTree('#text', newNode);
          }
        }
    }
  }

  if (attributes && (typeof attributes === 'undefined' ? 'undefined' : _typeof$1(attributes)) === 'object' && !isArray(attributes)) {
    entry.attributes = attributes;
  }

  // If is a script tag and has a src attribute, key off that.
  if (entry.nodeName === 'script' && entry.attributes.src) {
    entry.key = String(entry.attributes.src);
  }

  // Set the key prop if passed as an attr.
  if (entry.attributes && entry.attributes.key) {
    entry.key = String(entry.attributes.key);
  }

  return entry;
}

var empty = null;

// Reuse these maps, it's more performant to clear them than recreate.
var oldKeys = new Map();
var newKeys = new Map();

var propToAttrMap = {
  className: 'class',
  htmlFor: 'for'
};

function syncTree(oldTree, newTree, patches) {
  if (!newTree) {
    throw new Error('Missing new tree to sync into');
  }

  // Create new arrays for patches or use existing from a recursive call.
  patches = patches || {
    TREE_OPS: [],
    NODE_VALUE: [],
    SET_ATTRIBUTE: [],
    REMOVE_ATTRIBUTE: []
  };

  var _patches = patches,
      TREE_OPS = _patches.TREE_OPS,
      NODE_VALUE = _patches.NODE_VALUE,
      SET_ATTRIBUTE = _patches.SET_ATTRIBUTE,
      REMOVE_ATTRIBUTE = _patches.REMOVE_ATTRIBUTE;

  // Build up a patchset object to use for tree operations.

  var patchset = {
    INSERT_BEFORE: empty,
    REMOVE_CHILD: empty,
    REPLACE_CHILD: empty
  };

  // We recurse into all Nodes
  if (newTree.nodeType === 1) {
    var setAttributes = [];
    var removeAttributes = [];
    var oldAttributes = oldTree ? oldTree.attributes : {};
    var newAttributes = newTree.attributes;

    // Search for sets and changes.

    for (var key in newAttributes) {
      var value = newAttributes[key];

      if (key in oldAttributes && oldAttributes[key] === newAttributes[key]) {
        continue;
      }

      oldAttributes[key] = value;

      // Alias prop names to attr names for patching purposes.
      if (key in propToAttrMap) {
        key = propToAttrMap[key];
      }

      SET_ATTRIBUTE.push(oldTree || newTree, key, value);
    }

    // Search for removals.
    for (var _key in oldAttributes) {
      if (_key in newAttributes) {
        continue;
      }
      REMOVE_ATTRIBUTE.push(oldTree || newTree, _key);
      delete oldAttributes[_key];
    }
  }

  if (!oldTree) {
    // Dig into all nested children.
    for (var i = 0; i < newTree.childNodes.length; i++) {
      syncTree(null, newTree.childNodes[i], patches);
    }

    return patches;
  }

  var oldTreeName = oldTree.nodeName;
  var newTreeName = newTree.nodeName;


  if (oldTreeName !== newTreeName) {
    throw new Error('Sync failure, cannot compare ' + newTreeName + ' with ' + oldTreeName);
  }

  var oldChildNodes = oldTree.childNodes;
  var newChildNodes = newTree.childNodes;

  // Determines if any of the elements have a key attribute. If so, then we can
  // safely assume keys are being used here for optimization/transition
  // purposes.

  var hasOldKeys = oldChildNodes.some(function (vTree) {
    return vTree.key;
  });
  var hasNewKeys = newChildNodes.some(function (vTree) {
    return vTree.key;
  });

  // If we are working with keys, we can follow an optimized path.
  if (hasOldKeys || hasNewKeys) {
    oldKeys.clear();
    newKeys.clear();

    // Put the old `childNode` VTree's into the key cache for lookup.
    for (var _i = 0; _i < oldChildNodes.length; _i++) {
      var vTree = oldChildNodes[_i];

      // Only add references if the key exists, otherwise ignore it. This
      // allows someone to specify a single key and keep that element around.
      if (vTree.key) {
        oldKeys.set(vTree.key, vTree);
      }
    }

    // Put the new `childNode` VTree's into the key cache for lookup.
    for (var _i2 = 0; _i2 < newChildNodes.length; _i2++) {
      var _vTree = newChildNodes[_i2];

      // Only add references if the key exists, otherwise ignore it. This
      // allows someone to specify a single key and keep that element around.
      if (_vTree.key) {
        newKeys.set(_vTree.key, _vTree);
      }
    }

    // Do a single pass over the new child nodes.
    for (var _i3 = 0; _i3 < newChildNodes.length; _i3++) {
      var oldChildNode = oldChildNodes[_i3];
      var newChildNode = newChildNodes[_i3];

      var _key2 = newChildNode.key;

      // If there is no old element to compare to, this is a simple addition.

      if (!oldChildNode) {
        // Prefer an existing match to a brand new element.
        var optimalNewNode = null;

        // Prefer existing to new and remove from old position.
        if (oldKeys.has(_key2)) {
          optimalNewNode = oldKeys.get(_key2);
          oldChildNodes.splice(oldChildNodes.indexOf(optimalNewNode), 1);
        } else {
          optimalNewNode = newKeys.get(_key2) || newChildNode;
        }

        if (patchset.INSERT_BEFORE === empty) {
          patchset.INSERT_BEFORE = [];
        }
        patchset.INSERT_BEFORE.push([oldTree, optimalNewNode]);
        oldChildNodes.push(optimalNewNode);
        syncTree(null, optimalNewNode, patches);
        continue;
      }

      // If there is a key set for this new element, use that to figure out
      // which element to use.
      if (_key2 !== oldChildNode.key) {
        var _optimalNewNode = newChildNode;

        // Prefer existing to new and remove from old position.
        if (_key2 && oldKeys.has(_key2)) {
          _optimalNewNode = oldKeys.get(_key2);
          oldChildNodes.splice(oldChildNodes.indexOf(_optimalNewNode), 1);
        } else if (_key2) {
          _optimalNewNode = newKeys.get(_key2);
        }

        if (patchset.INSERT_BEFORE === empty) {
          patchset.INSERT_BEFORE = [];
        }
        patchset.INSERT_BEFORE.push([oldTree, _optimalNewNode, oldChildNode]);
        oldChildNodes.splice(_i3, 0, _optimalNewNode);
        syncTree(null, _optimalNewNode, patches);
        continue;
      }

      // If the element we're replacing is totally different from the previous
      // replace the entire element, don't bother investigating children.
      if (oldChildNode.nodeName !== newChildNode.nodeName) {
        if (patchset.REPLACE_CHILD === empty) {
          patchset.REPLACE_CHILD = [];
        }
        patchset.REPLACE_CHILD.push([newChildNode, oldChildNode]);
        oldTree.childNodes[_i3] = newChildNode;
        syncTree(null, newChildNode, patches);
        continue;
      }

      syncTree(oldChildNode, newChildNode, patches);
    }
  }

  // No keys used on this level, so we will do easier transformations.
  else {
      // Do a single pass over the new child nodes.
      for (var _i4 = 0; _i4 < newChildNodes.length; _i4++) {
        var _oldChildNode = oldChildNodes[_i4];
        var _newChildNode = newChildNodes[_i4];

        // If there is no old element to compare to, this is a simple addition.
        if (!_oldChildNode) {
          if (patchset.INSERT_BEFORE === empty) {
            patchset.INSERT_BEFORE = [];
          }
          patchset.INSERT_BEFORE.push([oldTree, _newChildNode]);
          oldChildNodes.push(_newChildNode);
          syncTree(null, _newChildNode, patches);
          continue;
        }

        // If the element we're replacing is totally different from the previous
        // replace the entire element, don't bother investigating children.
        if (_oldChildNode.nodeName !== _newChildNode.nodeName) {
          if (patchset.REPLACE_CHILD === empty) {
            patchset.REPLACE_CHILD = [];
          }
          patchset.REPLACE_CHILD.push([_newChildNode, _oldChildNode]);
          oldTree.childNodes[_i4] = _newChildNode;
          syncTree(null, _newChildNode, patches);
          continue;
        }

        syncTree(_oldChildNode, _newChildNode, patches);
      }
    }

  // We've reconciled new changes, so we can remove any old nodes and adjust
  // lengths to be equal.
  if (oldChildNodes.length !== newChildNodes.length) {
    for (var _i5 = newChildNodes.length; _i5 < oldChildNodes.length; _i5++) {
      if (patchset.REMOVE_CHILD === empty) {
        patchset.REMOVE_CHILD = [];
      }
      patchset.REMOVE_CHILD.push(oldChildNodes[_i5]);
    }

    oldChildNodes.length = newChildNodes.length;
  }

  var INSERT_BEFORE = patchset.INSERT_BEFORE,
      REMOVE_CHILD = patchset.REMOVE_CHILD,
      REPLACE_CHILD = patchset.REPLACE_CHILD;

  // We want to look if anything has changed, if nothing has we won't add it to
  // the patchset.

  if (INSERT_BEFORE || REMOVE_CHILD || REPLACE_CHILD) {
    TREE_OPS.push(patchset);
  }

  // If both VTrees are text nodes and the values are different, change the
  // NODE_VALUE.
  if (oldTree.nodeName === '#text' && newTree.nodeName === '#text') {
    if (oldTree.nodeValue !== newTree.nodeValue) {
      oldTree.nodeValue = newTree.nodeValue;
      NODE_VALUE.push(oldTree, oldTree.nodeValue);

      var _INSERT_BEFORE = patchset.INSERT_BEFORE,
          _REMOVE_CHILD = patchset.REMOVE_CHILD,
          _REPLACE_CHILD = patchset.REPLACE_CHILD;

      // We want to look if anything has changed, if nothing has we won't add
      // it to the patchset.

      if (_INSERT_BEFORE || _REMOVE_CHILD || _REPLACE_CHILD) {
        TREE_OPS.push(patchset);
      }

      return patches;
    }
  }

  return patches;
}

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Code based off of:
// https://github.com/ashi009/node-fast-html-parser

// This is a very special word in the diffHTML parser. It is the only way it
// can gain access to dynamic content.
var TOKEN = '__DIFFHTML__';

var hasNonWhitespaceEx = /\S/;
var doctypeEx = /<!.*>/ig;
var attrEx = /\b([_a-z][_a-z0-9\-]*)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;
var spaceEx = /[^ ]/;

var blockText = new Set(['script', 'noscript', 'style', 'code', 'template']);

var selfClosing = new Set(['meta', 'img', 'link', 'input', 'area', 'br', 'hr']);

var kElementsClosedByOpening = {
  li: { li: true },
  p: { p: true, div: true },
  td: { td: true, th: true },
  th: { td: true, th: true }
};

var kElementsClosedByClosing = {
  li: { ul: true, ol: true },
  a: { div: true },
  b: { div: true },
  i: { div: true },
  p: { div: true },
  td: { tr: true, table: true },
  th: { tr: true, table: true }
};

var flattenFragments = function flattenFragments(childNodes) {
  for (var i = 0; i < childNodes.length; i++) {
    var childNode = childNodes[i];

    if (childNode && childNode.nodeType === 11) {
      childNodes.splice.apply(childNodes, [i, 1].concat(_toConsumableArray(childNode.childNodes)));

      // Reset the loop.
      i = 0;
    } else if (childNode) {
      flattenFragments(childNode.childNodes);
    } else {
      childNodes.splice(i, 1);
    }
  }
};

/**
 * Interpolate dynamic supplemental values from the tagged template into the
 * tree.
 *
 * @param currentParent
 * @param string
 * @param supplemental
 */
var interpolateValues = function interpolateValues(currentParent, string, supplemental) {
  if (string && string.includes(TOKEN)) {
    var childNodes = [];
    var parts = string.split(TOKEN);
    var length = parts.length;


    for (var i = 0; i < parts.length; i++) {
      var value = parts[i];

      if (i === 0 || value) {
        // If the first text node has relevant text, put it in, otherwise
        // discard. This mimicks how the browser works and is generally easier
        // to work with (when using tagged template tags).
        if (hasNonWhitespaceEx.test(value)) {
          childNodes.push(createTree('#text', value));
        }

        // If we are in the second iteration, this means the whitespace has
        // been trimmed and we can pull out dynamic interpolated values.
        // Flatten all fragments found in the tree. They are used as containers
        // and are not reflected in the DOM Tree.
        if (--length > 0) {
          childNodes.push(supplemental.children.shift());
          flattenFragments(childNodes);
        }
      }
    }

    currentParent.childNodes.push.apply(currentParent.childNodes, childNodes);
  }
  // If this is text and not a doctype, add as a text node.
  else if (string && string.length && !doctypeEx.exec(string)) {
      currentParent.childNodes.push(createTree('#text', string));
    }
};

/**
 * HTMLElement, which contains a set of children.
 *
 * Note: this is a minimalist implementation, no complete tree structure
 * provided (no parentNode, nextSibling, previousSibling etc).
 *
 * @param {String} nodeName - DOM Node name
 * @param {Object} rawAttrs - DOM Node Attributes
 * @param {Object} supplemental - Interpolated data from a tagged template
 * @return {Object} vTree
 */
var HTMLElement = function HTMLElement(nodeName, rawAttrs, supplemental) {
  // Support dynamic tag names like: `<${MyComponent} />`.
  if (nodeName === TOKEN) {
    return HTMLElement(supplemental.tags.shift(), rawAttrs, supplemental);
  }

  var attributes = {};

  // Migrate raw attributes into the attributes object used by the VTree.

  var _loop = function _loop(match) {
    var name = match[1];
    var value = match[6] || match[5] || match[4] || match[1];

    // If we have multiple interpolated values in an attribute, we must
    // flatten to a string. There are no other valid options.
    if (value.indexOf(TOKEN) > -1 && value !== TOKEN) {
      attributes[name] = '';

      // Break the attribute down and replace each dynamic interpolation.
      value.split(TOKEN).forEach(function (part, index, array) {
        attributes[name] += part;

        // Only interpolate up to the last element.
        if (index !== array.length - 1) {
          attributes[name] += supplemental.attributes.shift();
        }
      });
    } else if (name === TOKEN) {
      var nameAndValue = supplemental.attributes.shift();

      if (nameAndValue) {
        attributes[nameAndValue] = nameAndValue;
      }
    } else if (value === TOKEN) {
      attributes[name] = supplemental.attributes.shift();
    } else {
      attributes[name] = value;
    }

    // Look for empty attributes.
    if (match[6] === '""') {
      attributes[name] = '';
    }
  };

  for (var match; match = attrEx.exec(rawAttrs || '');) {
    _loop(match);
  }

  return createTree(nodeName, attributes, []);
};

/**
 * Parses HTML and returns a root element
 *
 * @param {String} html - String of HTML markup to parse into a Virtual Tree
 * @param {Object} supplemental - Dynamic interpolated data values
 * @param {Object} options - Contains options like silencing warnings
 * @return {Object} - Parsed Virtual Tree Element
 */
function parse(html, supplemental) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var root = createTree('#document-fragment', null, []);
  var stack = [root];
  var currentParent = root;
  var lastTextPos = -1;

  // If there are no HTML elements, treat the passed in html as a single
  // text node.
  if (html.indexOf('<') === -1 && html) {
    interpolateValues(currentParent, html, supplemental);
    return root;
  }

  var tagEx = /<!--[^]*?(?=-->)-->|<(\/?)([a-z\-\_][a-z0-9\-\_]*)\s*([^>]*?)(\/?)>/ig;

  // Look through the HTML markup for valid tags.
  for (var match, text; match = tagEx.exec(html);) {
    if (lastTextPos > -1) {
      if (lastTextPos + match[0].length < tagEx.lastIndex) {
        text = html.slice(lastTextPos, tagEx.lastIndex - match[0].length);
        interpolateValues(currentParent, text, supplemental);
      }
    }

    var matchOffset = tagEx.lastIndex - match[0].length;

    if (lastTextPos === -1 && matchOffset > 0) {
      var string = html.slice(0, matchOffset);

      if (string && hasNonWhitespaceEx.test(string) && !doctypeEx.exec(string)) {
        interpolateValues(currentParent, string, supplemental);
      }
    }

    lastTextPos = tagEx.lastIndex;

    // This is a comment.
    if (match[0][1] === '!') {
      continue;
    }

    if (!match[1]) {
      // not </ tags
      var attrs = {};

      if (!match[4] && kElementsClosedByOpening[currentParent.rawNodeName]) {
        if (kElementsClosedByOpening[currentParent.rawNodeName][match[2]]) {
          stack.pop();
          currentParent = stack[stack.length - 1];
        }
      }

      currentParent = currentParent.childNodes[currentParent.childNodes.push(HTMLElement(match[2], match[3], supplemental)) - 1];

      stack.push(currentParent);

      if (blockText.has(match[2])) {
        // A little test to find next </script> or </style> ...
        var closeMarkup = '</' + match[2] + '>';
        var index = html.indexOf(closeMarkup, tagEx.lastIndex);
        var length = match[2].length;


        if (index === -1) {
          lastTextPos = tagEx.lastIndex = html.length + 1;
        } else {
          lastTextPos = index + closeMarkup.length;
          tagEx.lastIndex = lastTextPos;
          match[1] = true;
        }

        var newText = html.slice(match.index + match[0].length, index);

        // TODO Determine if a closing tag is present.
        //if (options.strict) {
        //  const nodeName = currentParent.rawNodeName;

        //  // Find a subset of the markup passed in to validate.
        //  const markup = markup.slice(
        //    tagEx.lastIndex - match[0].length
        //  ).split('\n').slice(0, 3);

        //  console.log(markup);

        //  // Position the caret next to the first non-whitespace character.
        //  const caret = Array(spaceEx.exec(markup[0]).index).join(' ') + '^';

        //  // Craft the warning message and inject it into the markup.
        //  markup.splice(1, 0, `${caret}
        //Invali markup. Saw ${match[2]}, expected ${nodeName}
        //  `);

        //  // Throw an error message if the markup isn't what we expected.
        //  throw new Error(`\n\n${markup.join('\n')}`);
        //}

        interpolateValues(currentParent, newText.trim(), supplemental);
      }
    }

    if (match[1] || match[4] || selfClosing.has(match[2])) {
      if (match[2] !== currentParent.rawNodeName && options.strict) {
        var nodeName = currentParent.rawNodeName;

        // Find a subset of the markup passed in to validate.
        var markup = html.slice(tagEx.lastIndex - match[0].length).split('\n').slice(0, 3);

        // Position the caret next to the first non-whitespace character.
        var caret = Array(spaceEx.exec(markup[0]).index).join(' ') + '^';

        // Craft the warning message and inject it into the markup.
        markup.splice(1, 0, caret + '\nPossibly invalid markup. Saw ' + match[2] + ', expected ' + nodeName + '...\n        ');

        // Throw an error message if the markup isn't what we expected.
        throw new Error('\n\n' + markup.join('\n'));
      }

      // </ or /> or <br> etc.
      while (currentParent) {
        // Self closing dynamic nodeName.
        if (match[2] === TOKEN && match[4] === '/') {
          stack.pop();
          currentParent = stack[stack.length - 1];

          break;
        }
        // Not self-closing, so seek out the next match.
        else if (match[2] === TOKEN) {
            var _value = supplemental.tags.shift();

            if (currentParent.nodeName === _value) {
              stack.pop();
              currentParent = stack[stack.length - 1];

              break;
            }
          }

        if (currentParent.rawNodeName == match[2]) {
          stack.pop();
          currentParent = stack[stack.length - 1];

          break;
        } else {
          var tag = kElementsClosedByClosing[currentParent.rawNodeName];

          // Trying to close current tag, and move on
          if (tag) {

            if (tag[match[2]]) {
              stack.pop();
              currentParent = stack[stack.length - 1];

              continue;
            }
          }

          // Use aggressive strategy to handle unmatching markups.
          break;
        }
      }
    }
  }

  // Find any last remaining text after the parsing completes over tags.
  var remainingText = html.slice(lastTextPos === -1 ? 0 : lastTextPos).trim();

  // Ensure that all values are properly interpolated through the remaining
  // markup after parsing.
  interpolateValues(currentParent, remainingText, supplemental);

  // This is an entire document, so only allow the HTML children to be
  // body or head.
  if (root.childNodes.length && root.childNodes[0].nodeName === 'html') {
    (function () {
      // Store elements from before body end and after body end.
      var head = { before: [], after: [] };
      var body = { after: [] };
      var HTML = root.childNodes[0];

      var beforeHead = true;
      var beforeBody = true;

      // Iterate the children and store elements in the proper array for
      // later concat, replace the current childNodes with this new array.
      HTML.childNodes = HTML.childNodes.filter(function (el) {
        // If either body or head, allow as a valid element.
        if (el.nodeName === 'body' || el.nodeName === 'head') {
          if (el.nodeName === 'head') beforeHead = false;
          if (el.nodeName === 'body') beforeBody = false;

          return true;
        }
        // Not a valid nested HTML tag element, move to respective container.
        else if (el.nodeType === 1) {
            if (beforeHead && beforeBody) head.before.push(el);else if (!beforeHead && beforeBody) head.after.push(el);else if (!beforeBody) body.after.push(el);
          }
      });

      // Ensure the first element is the HEAD tag.
      if (!HTML.childNodes[0] || HTML.childNodes[0].nodeName !== 'head') {
        var headInstance = createTree('head', null, []);
        var existing = headInstance.childNodes;

        existing.unshift.apply(existing, head.before);
        existing.push.apply(existing, head.after);
        HTML.childNodes.unshift(headInstance);
      } else {
        var _existing = HTML.childNodes[0].childNodes;

        _existing.unshift.apply(_existing, head.before);
        _existing.push.apply(_existing, head.after);
      }

      // Ensure the second element is the body tag.
      if (!HTML.childNodes[1] || HTML.childNodes[1].nodeName !== 'body') {
        var bodyInstance = createTree('body', null, []);
        var _existing2 = bodyInstance.childNodes;

        _existing2.push.apply(_existing2, body.after);
        HTML.childNodes.push(bodyInstance);
      } else {
        var _existing3 = HTML.childNodes[1].childNodes;
        _existing3.push.apply(_existing3, body.after);
      }
    })();
  }

  return root;
}



var internals = Object.freeze({
	StateCache: StateCache,
	NodeCache: NodeCache,
	MiddlewareCache: MiddlewareCache,
	TransitionCache: TransitionCache,
	protectVTree: protectVTree,
	unprotectVTree: unprotectVTree,
	cleanMemory: cleanMemory,
	namespace: namespace,
	elements: elements,
	decodeEntities: decodeEntities,
	escape: escape,
	measure: measure,
	Pool: Pool,
	parse: parse
});

/**
 * If diffHTML is rendering anywhere asynchronously, we need to wait until it
 * completes before this render can be executed. This sets up the next
 * buffer, if necessary, which serves as a Boolean determination later to
 * `bufferSet`.
 *
 * @param {Object} nextTransaction - The Transaction instance to schedule
 * @return {Boolean} - Value used to terminate a transaction render flow
 */
function schedule(transaction) {
  // The state is a global store which is shared by all like-transactions.
  var state = transaction.state;

  // If there is an in-flight transaction render happening, push this
  // transaction into a queue.

  if (state.isRendering) {
    state.nextTransaction = transaction;
    return transaction.abort();
  }

  // Indicate we are now rendering a transaction for this DOM Node.
  state.isRendering = true;
}

function shouldUpdate(transaction) {
  var markup = transaction.markup,
      state = transaction.state,
      measure = transaction.state.measure;


  measure('should update');

  // If the contents haven't changed, abort the flow. Only support this if
  // the new markup is a string, otherwise it's possible for our object
  // recycling to match twice.
  if (typeof markup === 'string' && state.markup === markup) {
    return transaction.abort();
  } else if (typeof markup === 'string') {
    state.markup = markup;
  }

  measure('should update');
}

//function reconcileComponents(oldTree, newTree) {
//  // Stateful components have a very limited API, designed to be fully
//  // implemented by a higher-level abstraction. The only method ever called
//  // is `render`. It is up to a higher level abstraction on how to handle the
//  // changes.
//  for (let i = 0; i < newTree.childNodes.length; i++) {
//    const oldChild = oldTree && oldTree.childNodes[i];
//    const newChild = newTree.childNodes[i];
//
//    // If incoming tree is a component, flatten down to tree for now.
//    if (newChild && typeof newChild.rawNodeName === 'function') {
//      const oldCtor = oldChild && oldChild.rawNodeName;
//      const newCtor = newChild.rawNodeName;
//      const children = newChild.childNodes;
//      const props = assign({}, newChild.attributes, { children });
//      const canNew = newCtor.prototype && newCtor.prototype.render;
//
//      // If the component has already been initialized, we can reuse it.
//      const oldInstance = oldCtor === newCtor && ComponentCache.get(oldChild);
//      const newInstance = !oldInstance && canNew && new newCtor(props);
//      const instance = oldInstance || newInstance;
//      const renderTree = createTree(
//        instance ? instance.render(props) : newCtor(props)
//      );
//
//      // Build a new tree from the render, and use this as the current tree.
//      newTree.childNodes[i] = renderTree;
//
//      // Cache this new current tree.
//      if (instance) {
//        ComponentCache.set(renderTree, instance);
//      }
//
//      // Recursively update trees.
//      reconcileComponents(oldChild, renderTree);
//    }
//    else {
//      reconcileComponents(oldChild, newChild);
//    }
//  }
//}

function reconcileTrees(transaction) {
  var state = transaction.state,
      measure$$1 = transaction.state.measure,
      domNode = transaction.domNode,
      markup = transaction.markup,
      options = transaction.options;
  var previousMarkup = state.previousMarkup,
      previousText = state.previousText;
  var inner = options.inner;


  measure$$1('reconcile trees');

  // This looks for changes in the DOM from what we'd expect. This means we
  // need to rebuild the old Virtual Tree. This allows for keeping our tree
  // in sync with unexpected DOM changes. It's not very performant, so
  // ideally you should never change markup that diffHTML affects from
  // outside of diffHTML if performance is a concern.
  var sameInnerHTML = inner ? previousMarkup === domNode.innerHTML : true;
  var sameOuterHTML = inner ? true : previousMarkup === domNode.outerHTML;
  var sameTextContent = previousText === domNode.textContent;

  // We rebuild the tree whenever the DOM Node changes, including the first
  // time we patch a DOM Node.
  if (!sameInnerHTML || !sameOuterHTML || !sameTextContent) {
    if (state.oldTree) {
      unprotectVTree(state.oldTree);
    }

    // Set the `oldTree` in the state as-well-as the transaction. This allows
    // it to persist with the DOM Node and also be easily available to
    // middleware and transaction tasks.
    state.oldTree = createTree(domNode);

    // We need to keep these objects around for comparisons.
    protectVTree(state.oldTree);
  }

  // Associate the old tree with this brand new transaction.
  transaction.oldTree = state.oldTree;

  // We need to ensure that our target to diff is a Virtual Tree Element. This
  // function takes in whatever `markup` is and normalizes to a tree object.
  // The callback function runs on every normalized Node to wrap childNodes
  // in the case of setting innerHTML.

  // This is HTML Markup, so we need to parse it.
  if (typeof markup === 'string') {
    // If we are dealing with innerHTML, use all the Nodes. If we're dealing
    // with outerHTML, we can only support diffing against a single element,
    // so pick the first one.
    transaction.newTree = createTree(parse(markup, null, options).childNodes);
  }

  // Only create a document fragment for inner nodes if the user didn't already
  // pass an array. If they pass an array, `createTree` will auto convert to
  // a fragment.
  else if (options.inner) {
      var _transaction$oldTree = transaction.oldTree,
          nodeName = _transaction$oldTree.nodeName,
          attributes = _transaction$oldTree.attributes;

      transaction.newTree = createTree(nodeName, attributes, markup);
    }

    // Everything else gets passed into `createTree` to be figured out.
    else {
        transaction.newTree = createTree(markup);
      }

  // FIXME: Huge Hack at the moment to make it easier to work with components.
  //reconcileComponents(state.oldTree, transaction.newTree);

  measure$$1('reconcile trees');
}

function syncTrees(transaction) {
  var _transaction$state = transaction.state,
      measure = _transaction$state.measure,
      oldTree = _transaction$state.oldTree,
      newTree = transaction.newTree;


  measure('sync trees');

  // Do a global replace of the element, unable to do this at a lower level.
  if (oldTree.nodeName !== newTree.nodeName) {
    transaction.patches = { TREE_OPS: [{ REPLACE_CHILD: [newTree, oldTree] }] };
    transaction.oldTree = transaction.state.oldTree = newTree;
  }
  // Otherwise only diff the children.
  else {
      transaction.patches = syncTree(oldTree, newTree);
    }

  measure('sync trees');
}

/**
 * Takes in a Virtual Tree Element (VTree) and creates a DOM Node from it.
 * Sets the node into the Node cache. If this VTree already has an
 * associated node, it will reuse that.
 *
 * @param {Object} - A Virtual Tree Element or VTree-like element
 * @param {Object} - Document to create Nodes in
 * @return {Object} - A DOM Node matching the vTree
 */
function makeNode(vTree) {
  var doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

  if (!vTree) {
    throw new Error('Missing VTree when trying to create DOM Node');
  }

  var existingNode = NodeCache.get(vTree);

  // If the DOM Node was already created, reuse the existing node.
  if (existingNode) {
    return existingNode;
  }

  var nodeName = vTree.nodeName,
      childNodes = vTree.childNodes,
      attributes = vTree.attributes,
      nodeValue = vTree.nodeValue;

  // Will vary based on the properties of the VTree.

  var domNode = null;

  // If we're dealing with a Text Node, we need to use the special DOM method,
  // since createElement does not understand the nodeName '#text'.
  // All other nodes can be created through createElement.
  if (nodeName === '#text') {
    domNode = doc.createTextNode(decodeEntities(nodeValue));
  }
  // Support dynamically creating document fragments.
  else if (nodeName === '#document-fragment') {
      domNode = doc.createDocumentFragment();
    }
    // If the nodeName matches any of the known SVG element names, mark it as
    // SVG. The reason for doing this over detecting if nested in an <svg>
    // element, is that we do not currently have circular dependencies in the
    // VTree, by avoiding parentNode, so there is no way to crawl up the parents.
    else if (elements.indexOf(nodeName) > -1) {
        domNode = doc.createElementNS(namespace, nodeName);
      }
      // If not a Text or SVG Node, then create with the standard method.
      else {
          domNode = doc.createElement(nodeName);
        }

  // Add to the domNodes cache.
  NodeCache.set(vTree, domNode);

  // Append all the children into the domNode, making sure to run them
  // through this `make` function as well.
  for (var i = 0; i < childNodes.length; i++) {
    domNode.appendChild(makeNode(childNodes[i]));
  }

  return domNode;
}

var _typeof$3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Available transition states.
var stateNames = ['attached', 'detached', 'replaced', 'attributeChanged', 'textChanged'];

// Sets up the states up so we can add and remove events from the sets.
stateNames.forEach(function (stateName) {
  return TransitionCache.set(stateName, new Set());
});

function addTransitionState(stateName, callback) {
  if (!stateName) {
    throw new Error('Missing transition state name');
  }

  if (!callback) {
    throw new Error('Missing transition state callback');
  }

  // Not a valid state name.
  if (stateNames.indexOf(stateName) === -1) {
    throw new Error('Invalid state name: ' + stateName);
  }

  TransitionCache.get(stateName).add(callback);
}

function removeTransitionState(stateName, callback) {
  // Not a valid state name.
  if (stateName && !stateNames.includes(stateName)) {
    throw new Error('Invalid state name ' + stateName);
  }

  // Remove all transition callbacks from state.
  if (!callback && stateName) {
    TransitionCache.get(stateName).clear();
  }
  // Remove a specific transition callback.
  else if (stateName && callback) {

      TransitionCache.get(stateName).delete(callback);
    }
    // Remove all callbacks.
    else {
        for (var _stateName in stateNames) {
          TransitionCache.get(_stateName).clear();
        }
      }
}

function runTransitions(set) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var promises = [];

  set.forEach(function (callback) {
    if (typeof callback === 'function') {
      var retVal = callback.apply(undefined, args);

      // Is a `thennable` object or Native Promise.
      if ((typeof retVal === 'undefined' ? 'undefined' : _typeof$3(retVal)) === 'object' && retVal.then) {
        promises.push(retVal);
      }
    }
  });

  return promises;
}

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var blockText$1 = new Set(['script', 'noscript', 'style', 'code', 'template']);

function patchNode$$1(patches, state) {
  var promises = [];
  var TREE_OPS = patches.TREE_OPS,
      NODE_VALUE = patches.NODE_VALUE,
      SET_ATTRIBUTE = patches.SET_ATTRIBUTE,
      REMOVE_ATTRIBUTE = patches.REMOVE_ATTRIBUTE;

  // Set attributes.

  if (SET_ATTRIBUTE.length) {
    (function () {
      // Triggered either synchronously or asynchronously depending on if a
      // transition was invoked.
      var mutationCallback = function mutationCallback(domNode, name, value) {
        var isObject = (typeof value === 'undefined' ? 'undefined' : _typeof$2(value)) === 'object';
        var isFunction = typeof value === 'function';

        // Support patching an object representation of the style object.
        if (!isObject && !isFunction && name) {
          domNode.setAttribute(name, value == null ? '' : value);

          // Allow the user to find the real value in the DOM Node as a
          // property.
          domNode[name] = value;
        } else if (isObject && name === 'style') {
          var keys = Object.keys(value);

          for (var i = 0; i < keys.length; i++) {
            domNode.style[keys[i]] = value[keys[i]];
          }
        } else if (typeof value !== 'string') {
          // We remove and re-add the attribute to trigger a change in a web
          // component or mutation observer. Although you could use a setter or
          // proxy, this is more natural.
          if (domNode.hasAttribute(name) && domNode[name] !== value) {
            domNode.removeAttribute(name, '');
          }

          // Necessary to track the attribute/prop existence.
          domNode.setAttribute(name, '');

          // Since this is a property value it gets set directly on the node.
          domNode[name] = value;
        }
      };

      var _loop = function _loop(i) {
        var vTree = SET_ATTRIBUTE[i];
        var name = SET_ATTRIBUTE[i + 1];
        var value = SET_ATTRIBUTE[i + 2];

        var domNode = makeNode(vTree);

        var attributeChanged = TransitionCache.get('attributeChanged');

        if (attributeChanged.size) {
          var oldValue = domNode.getAttribute(name);

          var newPromises = runTransitions(attributeChanged, domNode, name, oldValue, value);

          if (newPromises.length) {
            Promise.all(newPromises).then(function () {
              mutationCallback(domNode, name, value);
            });
          } else {
            mutationCallback(domNode, name, value);
          }
        } else {
          mutationCallback(domNode, name, value);
        }
      };

      for (var i = 0; i < SET_ATTRIBUTE.length; i += 3) {
        _loop(i);
      }
    })();
  }

  // Remove attributes.
  if (REMOVE_ATTRIBUTE.length) {
    for (var i = 0; i < REMOVE_ATTRIBUTE.length; i += 2) {
      var vTree = REMOVE_ATTRIBUTE[i];
      var _name = REMOVE_ATTRIBUTE[i + 1];

      var _domNode = makeNode(vTree);

      _domNode.removeAttribute(_name);

      if (_name in _domNode) {
        _domNode[_name] = undefined;
      }
    }
  }

  // Change all nodeValues.
  if (NODE_VALUE.length) {
    for (var _i = 0; _i < NODE_VALUE.length; _i += 2) {
      var _vTree = NODE_VALUE[_i];
      var nodeValue = NODE_VALUE[_i + 1];

      var _domNode2 = NodeCache.get(_vTree);
      var parentNode = _domNode2.parentNode;


      if (nodeValue.includes('&')) {
        _domNode2.nodeValue = decodeEntities(escape(nodeValue));
      } else {
        _domNode2.nodeValue = escape(nodeValue);
      }

      if (parentNode) {
        if (blockText$1.has(parentNode.nodeName.toLowerCase())) {
          parentNode.nodeValue = escape(nodeValue);
        }
      }
    }
  }

  // First do all DOM tree operations, and then do attribute and node value.
  for (var _i2 = 0; _i2 < TREE_OPS.length; _i2++) {
    var _TREE_OPS$_i = TREE_OPS[_i2],
        INSERT_BEFORE = _TREE_OPS$_i.INSERT_BEFORE,
        REMOVE_CHILD = _TREE_OPS$_i.REMOVE_CHILD,
        REPLACE_CHILD = _TREE_OPS$_i.REPLACE_CHILD;

    // Insert/append elements.

    if (INSERT_BEFORE && INSERT_BEFORE.length) {
      for (var _i3 = 0; _i3 < INSERT_BEFORE.length; _i3++) {
        var _INSERT_BEFORE$_i = _slicedToArray(INSERT_BEFORE[_i3], 3),
            _vTree2 = _INSERT_BEFORE$_i[0],
            childNodes = _INSERT_BEFORE$_i[1],
            referenceNode = _INSERT_BEFORE$_i[2];

        var _domNode3 = NodeCache.get(_vTree2);
        var refNode = referenceNode ? makeNode(referenceNode) : null;
        var fragment = null;

        var attached = TransitionCache.get('attached');

        if (referenceNode) {
          protectVTree(referenceNode);
        }

        if (childNodes.length) {
          fragment = document.createDocumentFragment();

          for (var _i4 = 0; _i4 < childNodes.length; _i4++) {
            var newNode = makeNode(childNodes[_i4]);
            fragment.appendChild(newNode);
            protectVTree(childNodes[_i4]);
          }
        } else {
          fragment = makeNode(childNodes);
          protectVTree(childNodes);
        }

        _domNode3.insertBefore(fragment, refNode);

        if (attached.size) {
          promises.push.apply(promises, _toConsumableArray$1(runTransitions(attached, fragment)));
        }
      }
    }

    // Remove elements.
    if (REMOVE_CHILD && REMOVE_CHILD.length) {
      var _loop2 = function _loop2(_i5) {
        var childNode = REMOVE_CHILD[_i5];
        var domNode = NodeCache.get(childNode);

        var detached = TransitionCache.get('detached');

        if (detached.size) {
          var newPromises = runTransitions(detached, domNode);

          Promise.all(newPromises).then(function () {
            domNode.parentNode.removeChild(domNode);
            unprotectVTree(childNode);
          });

          if (newPromises.length) {
            promises.push.apply(promises, _toConsumableArray$1(newPromises));
          }
        } else {
          domNode.parentNode.removeChild(domNode);
          unprotectVTree(childNode);
        }
      };

      for (var _i5 = 0; _i5 < REMOVE_CHILD.length; _i5++) {
        _loop2(_i5);
      }
    }

    // Replace elements.
    if (REPLACE_CHILD && REPLACE_CHILD.length) {
      var _loop3 = function _loop3(_i6) {
        var _REPLACE_CHILD$_i = _slicedToArray(REPLACE_CHILD[_i6], 2),
            newChildNode = _REPLACE_CHILD$_i[0],
            oldChildNode = _REPLACE_CHILD$_i[1];

        var oldDomNode = NodeCache.get(oldChildNode);
        var newDomNode = makeNode(newChildNode);

        var attached = TransitionCache.get('attached');
        var detached = TransitionCache.get('detached');
        var replaced = TransitionCache.get('replaced');

        if (replaced.size) {
          var attachedPromises = runTransitions(attached, newDomNode);
          var detachedPromises = runTransitions(detached, oldDomNode);

          var replacedPromises = runTransitions(replaced, oldDomNode, newDomNode);

          var newPromises = [].concat(_toConsumableArray$1(attachedPromises), _toConsumableArray$1(detachedPromises), _toConsumableArray$1(replacedPromises));

          Promise.all(newPromises).then(function () {
            oldDomNode.parentNode.replaceChild(newDomNode, oldDomNode);
            protectVTree(newChildNode);
            unprotectVTree(oldChildNode);
          });

          if (newPromises.length) {
            promises.push.apply(promises, _toConsumableArray$1(newPromises));
          }
        } else {
          oldDomNode.parentNode.replaceChild(newDomNode, oldDomNode);
          protectVTree(newChildNode);
          unprotectVTree(oldChildNode);
        }
      };

      for (var _i6 = 0; _i6 < REPLACE_CHILD.length; _i6++) {
        _loop3(_i6);
      }
    }
  }

  return promises;
}

/**
 * Processes a set of patches onto a tracked DOM Node.
 *
 * @param {Object} node - DOM Node to process patchs on
 * @param {Array} patches - Contains patch objects
 */
function patch(transaction) {
  var domNode = transaction.domNode,
      state = transaction.state,
      measure = transaction.state.measure,
      patches = transaction.patches;


  measure('patch node');
  transaction.promises = patchNode$$1(patches, state).filter(Boolean);
  measure('patch node');
}

// End flow, this terminates the transaction and returns a Promise that
// resolves when completed. If you want to make diffHTML return streams or
// callbacks replace this function.
function endAsPromise(transaction) {
  var _transaction$promises = transaction.promises,
      promises = _transaction$promises === undefined ? [] : _transaction$promises;

  // Operate synchronously unless opted into a Promise-chain. Doesn't matter
  // if they are actually Promises or not, since they will all resolve
  // eventually with `Promise.all`.

  if (promises.length) {
    return Promise.all(promises).then(function () {
      return transaction.end();
    });
  } else {
    // Pass off the remaining middleware to allow users to dive into the
    // transaction completed lifecycle event.
    return Promise.resolve(transaction.end());
  }
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Transaction = function () {
  _createClass(Transaction, null, [{
    key: 'create',
    value: function create(domNode, markup, options) {
      return new Transaction(domNode, markup, options);
    }
  }, {
    key: 'renderNext',
    value: function renderNext(state) {
      // Still no next transaction, so can safely return early.
      if (!state.nextTransaction) {
        return;
      }

      // Create the next transaction.
      var _state$nextTransactio = state.nextTransaction,
          domNode = _state$nextTransactio.domNode,
          markup = _state$nextTransactio.markup,
          options = _state$nextTransactio.options;

      state.nextTransaction = undefined;
      Transaction.create(domNode, markup, options).start();
    }
  }, {
    key: 'flow',
    value: function flow(transaction, tasks) {
      var retVal = transaction;

      // Execute each "task" serially, passing the transaction as a baton that
      // can be used to share state across the tasks.
      for (var i = 0; i < tasks.length; i++) {
        // If aborted, don't execute any more tasks.
        if (transaction.aborted) {
          return retVal;
        }

        // Run the task.
        retVal = tasks[i](transaction);

        // The last `returnValue` is what gets sent to the consumer. This
        // mechanism is crucial for the `abort`, if you want to modify the "flow"
        // that's fine, but you must ensure that your last task provides a
        // mechanism to know when the transaction completes. Something like
        // callbacks or a Promise.
        if (retVal !== undefined && retVal !== transaction) {
          return retVal;
        }
      }
    }
  }, {
    key: 'assert',
    value: function assert(transaction) {
      if (transaction.aborted && transaction.completed) {
        throw new Error('Transaction was previously aborted');
      } else if (transaction.completed) {
        throw new Error('Transaction was previously completed');
      }
    }
  }, {
    key: 'invokeMiddleware',
    value: function invokeMiddleware(transaction) {
      var tasks = transaction.tasks;


      MiddlewareCache.forEach(function (fn) {
        // Invoke all the middleware passing along this transaction as the only
        // argument. If they return a value (must be a function) it will be added
        // to the transaction task flow.
        var result = fn(transaction);

        if (result) {
          tasks.push(result);
        }
      });
    }
  }]);

  function Transaction(domNode, markup, options) {
    _classCallCheck(this, Transaction);

    this.domNode = domNode;
    this.markup = markup;
    this.options = options;

    this.state = StateCache.get(domNode) || {
      measure: measure(domNode, markup),
      internals: internals
    };

    this.tasks = options.tasks || [schedule, shouldUpdate, reconcileTrees, syncTrees, patch, endAsPromise];

    // Store calls to trigger after the transaction has ended.
    this.endedCallbacks = new Set();

    StateCache.set(domNode, this.state);
  }

  _createClass(Transaction, [{
    key: 'start',
    value: function start() {
      var domNode = this.domNode,
          measure$$1 = this.state.measure,
          tasks = this.tasks;

      var takeLastTask = tasks.pop();

      this.aborted = false;

      // Add middleware in as tasks.
      Transaction.invokeMiddleware(this);

      // Measure the render flow if the user wants to track performance.
      measure$$1('render');

      // Push back the last task as part of ending the flow.
      tasks.push(takeLastTask);

      return Transaction.flow(this, tasks);
    }

    // This will immediately call the last flow task and terminate the flow. We
    // call the last task to ensure that the control flow completes. This should
    // end psuedo-synchronously. Think `Promise.resolve()`, `callback()`, and
    // `return someValue` to provide the most accurate performance reading. This
    // doesn't matter practically besides that.

  }, {
    key: 'abort',
    value: function abort() {
      var state = this.state;


      this.aborted = true;

      // Grab the last task in the flow and return, this task will be responsible
      // for calling `transaction.end`.
      return this.tasks[this.tasks.length - 1](this);
    }
  }, {
    key: 'end',
    value: function end() {
      var _this = this;

      var state = this.state,
          domNode = this.domNode,
          options = this.options;
      var measure$$1 = state.measure;
      var inner = options.inner;


      this.completed = true;

      var renderScheduled = false;

      StateCache.forEach(function (cachedState) {
        if (cachedState.isRendering && cachedState !== state) {
          renderScheduled = true;
        }
      });

      // Don't attempt to clean memory if in the middle of another render.
      if (!renderScheduled) {
        cleanMemory();
      }

      // Mark the end to rendering.
      measure$$1('finalize');
      measure$$1('render');

      // Cache the markup and text for the DOM node to allow for short-circuiting
      // future render transactions.
      state.previousMarkup = domNode[inner ? 'innerHTML' : 'outerHTML'];
      state.previousText = domNode.textContent;

      // Trigger all `onceEnded` callbacks, so that middleware can know the
      // transaction has ended.
      this.endedCallbacks.forEach(function (callback) {
        return callback(_this);
      });
      this.endedCallbacks.clear();

      // We are no longer rendering the previous transaction so set the state to
      // `false`.
      state.isRendering = false;

      // Try and render the next transaction if one has been saved.
      Transaction.renderNext(state);

      return this;
    }
  }, {
    key: 'onceEnded',
    value: function onceEnded(callback) {
      this.endedCallbacks.add(callback);
    }
  }]);

  return Transaction;
}();

var _typeof$4 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isAttributeEx = /(=|"|')[^><]*?$/;
var isTagEx = /(<|\/)/;
var TOKEN$1 = '__DIFFHTML__';

/**
 * Get the next value from the list. If the next value is a string, make sure
 * it is escaped.
 *
 * @param {Array} values - Values extracted from tagged template literal
 * @return {String|*} - Escaped string, otherwise any value passed
 */
var nextValue = function nextValue(values) {
  var value = values.shift();
  return typeof value === 'string' ? escape(value) : value;
};

function handleTaggedTemplate(options, strings) {
  for (var _len = arguments.length, values = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    values[_key - 2] = arguments[_key];
  }

  // Automatically coerce a string literal to array.
  if (typeof strings === 'string') {
    strings = [strings];
  }

  // Do not attempt to parse empty strings.
  if (!strings[0].length && !values.length) {
    return null;
  }

  // Parse only the text, no dynamic bits.
  if (strings.length === 1 && !values.length) {
    var _childNodes = parse(strings[0]).childNodes;
    return _childNodes.length > 1 ? _childNodes : _childNodes[0];
  }

  // Used to store markup and tokens.
  var retVal = '';

  // We filter the supplemental values by where they are used. Values are
  // either, children, or tags (for components).
  var supplemental = {
    attributes: [],
    children: [],
    tags: []
  };

  // Loop over the static strings, each break correlates to an interpolated
  // value. Since these values can be dynamic, we cannot pass them to the
  // diffHTML HTML parser inline. They are passed as an additional argument
  // called supplemental. The following loop instruments the markup with tokens
  // that the parser then uses to assemble the correct tree.
  strings.forEach(function (string, i) {
    // Always add the string, we need it to parse the markup later.
    retVal += string;

    // If there are values, figure out where in the markup they were injected.
    // This is most likely incomplete code, and will need to be improved in the
    // future with robust testing.
    if (values.length) {
      var value = nextValue(values);
      var lastSegment = string.split(' ').pop();
      var lastCharacter = lastSegment.trim().slice(-1);
      var isAttribute = Boolean(retVal.match(isAttributeEx));
      var isTag = Boolean(lastCharacter.match(isTagEx));
      var isString = typeof value === 'string';
      var isObject = (typeof value === 'undefined' ? 'undefined' : _typeof$4(value)) === 'object';
      var isArray = Array.isArray(value);

      // Injected as attribute.
      if (isAttribute) {
        supplemental.attributes.push(value);
        retVal += TOKEN$1;
      }
      // Injected as component tag.
      else if (isTag && !isString) {
          supplemental.tags.push(value);
          retVal += TOKEN$1;
        }
        // Injected as a child node.
        else if (isArray || isObject) {
            supplemental.children.push(createTree(value));
            retVal += TOKEN$1;
          }
          // Injected as something else in the markup or undefined, ignore
          // obviously falsy values used with boolean operators.
          else if (value !== null && value !== undefined && value !== false) {
              retVal += isString ? decodeEntities(value) : value;
            }
    }
  });

  // Parse the instrumented markup to get the Virtual Tree.
  var childNodes = parse(retVal, supplemental, options).childNodes;

  // This makes it easier to work with a single element as a root, opposed to
  // always returning an array.
  return childNodes.length === 1 ? childNodes[0] : childNodes;
}

// Loose mode (default)
var html = function html() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return handleTaggedTemplate.apply(undefined, [{}].concat(args));
};

// Strict mode (optional enforcing closing tags)
html.strict = function () {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return handleTaggedTemplate.apply(undefined, [{ strict: true }].concat(args));
};

function release(domNode) {
  // Try and find a state object for this DOM Node.
  var state = StateCache.get(domNode);

  // If there is a Virtual Tree element, recycle all objects allocated for it.
  if (state && state.oldTree) {
    unprotectVTree(state.oldTree);
  }

  // Remove the DOM Node's state object from the cache.
  StateCache.delete(domNode);

  // Recycle all unprotected objects.
  cleanMemory();
}

function use(middleware) {
  if (typeof middleware !== 'function') {
    throw new Error('Middleware must be a function');
  }

  // Add the function to the set of middlewares.
  MiddlewareCache.add(middleware);

  // Call the subscribe method if it was defined, passing in the full public
  // API we have access to at this point.
  middleware.subscribe && middleware.subscribe(use.diff);

  // The unsubscribe method for the middleware.
  return function () {
    // Remove this middleware from the internal cache. This will prevent it
    // from being invoked in the future.
    MiddlewareCache.delete(middleware);

    // Call the unsubscribe method if defined in the middleware (allows them
    // to cleanup).
    middleware.unsubscribe && middleware.unsubscribe(use.diff);
  };
}

/**
 * A convenient helper to create Virtual Tree elements. This can be used in
 * place of HTML parsing and is what the Babel transform will compile down to.
 *
 * @example
 *
 *    import { createTree } from 'diffhtml';
 *
 *    // Creates a div with the test class and a nested text node.
 *    const vTree = createTree('div', { 'class': 'test' }, 'Hello world');
 *
 *    // Creates an empty div.
 *    const vTree = createTree('div');
 *
 *    // Creates a VTree and associates it with a DOM Node.
 *    const div = document.createElement('div');
 *    const vTree = createTree(div);
 *
 *    // Create a fragment of Nodes (is wrapped by a #document-fragment).
 *    const vTree = createTree([createTree('div'), createTree('h1')]);
 *    console.log(vTree.nodeName === '#document-fragment'); // true
 *
 *    // Any other object passed to `createTree` will be returned and assumed
 *    // to be an object that is shaped like a VTree.
 *    const vTree = createTree({
 *      nodeName: 'div',
 *      attributes: { 'class': 'on' },
 *    });
 *
 *
 * @param {Array|Object|Node} nodeName - Value used to infer making the DOM Node
 * @param {Object =} attributes - Attributes to assign
 * @param {Array|Object|String|Node =} childNodes - Children to assign
 * @return {Object} A VTree object
 */
/**
 * Parses HTML strings into Virtual Tree elements. This can be a single static
 * string, like that produced by a template engine, or a complex tagged
 * template string.
 *
 * @example
 *
 *    import { html } from 'diffhtml';
 *
 *    // Parses HTML directly from a string, useful for consuming template
 *    // engine output and inlining markup.
 *    const fromString = html('<center>Markup</center>');
 *
 *    // Parses a tagged template string. This can contain interpolated
 *    // values in between the `${...}` symbols. The values are typically
 *    // going to be strings, but you can pass any value to any property or
 *    // attribute.
 *    const fromTaggedTemplate = html`<center>${'Markup'}</center>`;
 *
 *    // You can pass functions to event handlers and basically any value to
 *    // property or attribute. If diffHTML encounters a value that is not a
 *    // string it will still create an attribute, but the value will be an
 *    // empty string. This is necessary for tracking changes.
 *    const dynamicValues = html`<center onclick=${
 *      ev => console.log('Clicked the center tag')
 *    }>Markup</center>`;
 *
 *
 * @param {String} markup - A string or tagged template string containing HTML
 * @return {Object|Array} - A single instance or array of Virtual Tree elements
 */
/**
 * Recycles internal memory, removes state, and cancels all scheduled render
 * transactions. This is mainly going to be used in unit tests and not
 * typically in production. The reason for this is that components are usually
 * going to live the lifetime of the page, with a refresh cleaning slate.
 *
 * @example
 *
 *    import { innerHTML, release } from 'diffhtml';
 *
 *    // Associate state and reuse pre-allocated memory.
 *    innerHTML(document.body, 'Hello world');
 *
 *    // Free all association to `document.body`.
 *    release(document.body);
 *
 *
 * @param {Object} node - A DOM Node that is being tracked by diffHTML
 */
/**
 * Registers middleware functions which are called during the render
 * transaction flow. These should be very fast and ideally asynchronous to
 * avoid blocking the render.
 *
 * @example
 *
 *    import { use } from 'diffhtml';
 *    import logger from 'diffhtml-logger';
 *    import devTools from 'diffhtml-devtools';
 *
 *    use(logger());
 *    use(devTools());
 *
 *
 * @param {Function} middleware - A function that gets passed internals
 * @return Function - When invoked removes and deactivates the middleware
 */
/**
 * Export the version based on the package.json version field value, is inlined
 * with babel.
 */
var VERSION = '1.0.0-beta';

/**
 * Used to diff the outerHTML contents of the passed element with the markup
 * contents. Very useful for applying a global diff on the
 * `document.documentElement`.
 *
 * @example
 *
 *    import { outerHTML } from 'diffhtml';
 *
 *    // Remove all attributes and set the children to be a single text node
 *    // containing the text 'Hello world',
 *    outerHTML(document.body, '<body>Hello world</body>');
 *
 *
 * @param {Object} element - A DOM Node to render into
 * @param {String|Object} markup='' - A string of markup or virtual tree
 * @param {Object =} options={} - An object containing configuration options
 */
function outerHTML(element) {
  var markup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  options.inner = false;
  return Transaction.create(element, markup, options).start();
}

/**
 * Used to diff the innerHTML contents of the passed element with the markup
 * contents. This is useful with libraries like Backbone that render Views
 * into element container.
 *
 * @example
 *
 *    import { innerHTML } from 'diffhtml';
 *
 *    // Sets the body children to be a single text node containing the text
 *    // 'Hello world'.
 *    innerHTML(document.body, 'Hello world');
 *
 *
 * @param {Object} element - A DOM Node to render into
 * @param {String|Object} markup='' - A string of markup or virtual tree
 * @param {Object =} options={} - An object containing configuration options
 */
function innerHTML(element) {
  var markup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  options.inner = true;
  return Transaction.create(element, markup, options).start();
}

// Public API. Passed to subscribed middleware.
var diff = {
  VERSION: '1.0.0-beta',
  addTransitionState: addTransitionState,
  removeTransitionState: removeTransitionState,
  release: release,
  createTree: createTree,
  use: use,
  outerHTML: outerHTML,
  innerHTML: innerHTML,
  html: html,
  internals: internals
};

// Ensure the `diff` property is nonenumerable so it doesn't show up in logs.
Object.defineProperty(use, 'diff', { value: diff, enumerable: false });

exports.__VERSION__ = VERSION;
exports.addTransitionState = addTransitionState;
exports.removeTransitionState = removeTransitionState;
exports.release = release;
exports.createTree = createTree;
exports.use = use;
exports.outerHTML = outerHTML;
exports.innerHTML = innerHTML;
exports.html = html;
exports['default'] = diff;

Object.defineProperty(exports, '__esModule', { value: true });

})));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":18}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n      <section class="todoapp"\n        attached=', '\n        detached=', '\n        onsubmit=', '\n        onclick=', '\n        onkeydown=', '\n        ondblclick=', '\n        onchange=', '>\n\n        <header class="header">\n          <h1>todos</h1>\n\n          <form class="add-todo">\n            <input\n              class="new-todo"\n              placeholder="What needs to be done?"\n              autofocus="">\n          </form>\n        </header>\n\n        ', '\n      </section>\n\n      ', '\n    '], ['\n      <section class="todoapp"\n        attached=', '\n        detached=', '\n        onsubmit=', '\n        onclick=', '\n        onkeydown=', '\n        ondblclick=', '\n        onchange=', '>\n\n        <header class="header">\n          <h1>todos</h1>\n\n          <form class="add-todo">\n            <input\n              class="new-todo"\n              placeholder="What needs to be done?"\n              autofocus="">\n          </form>\n        </header>\n\n        ', '\n      </section>\n\n      ', '\n    ']),
    _templateObject2 = _taggedTemplateLiteral(['\n          <section class="main">\n            <input class="toggle-all" type="checkbox" ', '>\n\n            <ul class="todo-list">', '</ul>\n          </section>\n\n          <footer class="footer">\n            <span class="todo-count">\n              <strong>', '</strong>\n              ', ' left\n            </span>\n\n            <ul class="filters">\n              <li>\n                <a href="#/" class=', '>All</a>\n              </li>\n              <li>\n                <a href="#/active" class=', '>Active</a>\n              </li>\n              <li>\n                <a href="#/completed" class=', '>Completed</a>\n              </li>\n            </ul>\n\n            ', '\n          </footer>\n        '], ['\n          <section class="main">\n            <input class="toggle-all" type="checkbox" ', '>\n\n            <ul class="todo-list">', '</ul>\n          </section>\n\n          <footer class="footer">\n            <span class="todo-count">\n              <strong>', '</strong>\n              ', ' left\n            </span>\n\n            <ul class="filters">\n              <li>\n                <a href="#/" class=', '>All</a>\n              </li>\n              <li>\n                <a href="#/active" class=', '>Active</a>\n              </li>\n              <li>\n                <a href="#/completed" class=', '>Completed</a>\n              </li>\n            </ul>\n\n            ', '\n          </footer>\n        ']),
    _templateObject3 = _taggedTemplateLiteral(['\n              <button class="clear-completed" onclick=', '>Clear completed</button>\n            '], ['\n              <button class="clear-completed" onclick=', '>Clear completed</button>\n            ']);

var _diffhtml = require('diffhtml');

var _store = require('../redux/store');

var _store2 = _interopRequireDefault(_store);

var _todoApp = require('../redux/actions/todo-app');

var todoAppActions = _interopRequireWildcard(_todoApp);

var _todoList = require('./todo-list');

var _todoList2 = _interopRequireDefault(_todoList);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TodoApp = function () {
  _createClass(TodoApp, [{
    key: 'render',
    value: function render() {
      var state = _store2.default.getState();
      var todoApp = state[this.mount.dataset.reducer];
      var status = state.url.path.slice(1);
      var allTodos = todoApp.todos;
      var todos = todoApp.getByStatus(status);
      var activeTodos = todoApp.getByStatus('active');
      var completedTodos = todoApp.getByStatus('completed');

      localStorage['diffhtml-todos'] = JSON.stringify(allTodos);

      (0, _diffhtml.innerHTML)(this.mount, (0, _diffhtml.html)(_templateObject, this.animateAttached, this.animateDetached, this.onSubmitHandler, this.onClickHandler, this.handleKeyDown, this.startEditing, this.toggleCompletion, allTodos.length ? (0, _diffhtml.html)(_templateObject2, this.setCheckedState(), (0, _todoList2.default)({
        stopEditing: this.stopEditing,
        getTodoClassNames: this.getTodoClassNames,
        todos: todos
      }), activeTodos.length, activeTodos.length == 1 ? 'item' : 'items', this.getNavClass('/'), this.getNavClass('/active'), this.getNavClass('/completed'), completedTodos.length ? (0, _diffhtml.html)(_templateObject3, this.clearCompleted) : '') : '', this.existingFooter));
    }
  }], [{
    key: 'create',
    value: function create(mount) {
      return new TodoApp(mount);
    }
  }]);

  function TodoApp(mount) {
    var _this = this;

    _classCallCheck(this, TodoApp);

    this.addTodo = function (ev) {
      if (!ev.target.matches('.add-todo')) {
        return;
      }

      ev.preventDefault();

      var newTodo = ev.target.querySelector('.new-todo');
      _store2.default.dispatch(todoAppActions.addTodo(newTodo.value));
      newTodo.value = '';
    };

    this.removeTodo = function (ev) {
      if (!ev.target.matches('.destroy')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      _store2.default.dispatch(todoAppActions.removeTodo(index));
    };

    this.toggleCompletion = function (ev) {
      if (!ev.target.matches('.toggle')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      _store2.default.dispatch(todoAppActions.toggleCompletion(index, ev.target.checked));
    };

    this.startEditing = function (ev) {
      if (!ev.target.matches('label')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      _store2.default.dispatch(todoAppActions.startEditing(index));

      li.querySelector('form input').focus();
    };

    this.stopEditing = function (ev) {
      ev.preventDefault();

      var parentNode = ev.target.parentNode;
      var nodeName = parentNode.nodeName.toLowerCase();
      var li = nodeName === 'li' ? parentNode : parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);
      var editTodo = li.querySelector('.edit');
      var text = editTodo.value.trim();

      if (text) {
        _store2.default.dispatch(todoAppActions.stopEditing(index, text));
      } else {
        _store2.default.dispatch(todoAppActions.removeTodo(index));
      }
    };

    this.clearCompleted = function (ev) {
      if (!ev.target.matches('.clear-completed')) {
        return;
      }

      _store2.default.dispatch(todoAppActions.clearCompleted());
    };

    this.toggleAll = function (ev) {
      if (!ev.target.matches('.toggle-all')) {
        return;
      }

      _store2.default.dispatch(todoAppActions.toggleAll(ev.target.checked));
    };

    this.handleKeyDown = function (ev) {
      if (!ev.target.matches('.edit')) {
        return;
      }

      var todoApp = _store2.default.getState()[_this.mount.dataset.reducer];

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      switch (ev.keyCode) {
        case 27:
          {
            ev.target.value = todoApp.todos[index].title;
            _this.stopEditing(ev);
          }
      }
    };

    this.onSubmitHandler = function (ev) {
      ev.preventDefault();

      if (ev.target.matches('.add-todo')) {
        _this.addTodo(ev);
      } else if (ev.target.matches('.edit-todo')) {
        _this.stopEditing(ev);
      }
    };

    this.onClickHandler = function (ev) {
      if (ev.target.matches('.destroy')) {
        _this.removeTodo(ev);
      } else if (ev.target.matches('.toggle-all')) {
        _this.toggleAll(ev);
      } else if (ev.target.matches('.clear-completed')) {
        _this.clearCompleted(ev);
      }
    };

    this.getTodoClassNames = function (todo) {
      return [todo.completed ? 'completed' : '', todo.editing ? 'editing' : ''].filter(Boolean).join(' ');
    };

    this.setCheckedState = function () {
      var todoApp = _store2.default.getState()[_this.mount.dataset.reducer];
      var notChecked = todoApp.todos.filter(function (todo) {
        return !todo.completed;
      }).length;

      return notChecked ? '' : 'checked';
    };

    this.getNavClass = function (name) {
      var state = _store2.default.getState();
      var path = state.url.path;

      return path === name ? 'selected' : undefined;
    };

    this.mount = mount;
    this.existingFooter = this.mount.querySelector('footer');
    this.unsubscribeStore = _store2.default.subscribe(function () {
      return _this.render();
    });
    this.render();
  }

  _createClass(TodoApp, [{
    key: 'animateAttached',
    value: function animateAttached(parent, element) {
      if (!element.animate) {
        return;
      }

      if (element.matches('footer.info')) {
        new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 250 }).onfinish = resolve;
        }).then(function () {
          element.style.opacity = 1;
        });
      }

      // Animate Todo item being added.
      if (element.matches('.todo-list li, footer.info')) {
        new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 250 }).onfinish = resolve;
        });
      }

      // Animate the entire app loading.
      if (element.matches('.todoapp')) {
        new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'translateY(100%)', easing: 'ease-out' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 375 }).onfinish = resolve;
        });
      }
    }
  }, {
    key: 'animateDetached',
    value: function animateDetached(parent, element) {
      if (!element.animate) {
        return;
      }

      // We are removing an item from the list.
      if (element.matches('.todo-list li')) {
        return new Promise(function (resolve) {
          return element.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.5)' }], { duration: 250 }).onfinish = resolve;
        });
      }
    }
  }]);

  return TodoApp;
}();

exports.default = TodoApp;

},{"../redux/actions/todo-app":8,"../redux/store":12,"./todo-list":6,"diffhtml":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _templateObject = _taggedTemplateLiteral(['\n\t\t<li key="', '" class="', '">\n\t\t\t<div class="view">\n\t\t\t\t<input class="toggle" type="checkbox" ', '>\n\t\t\t\t<label>', '</label>\n\t\t\t\t<button class="destroy"></button>\n\t\t\t</div>\n\n\t\t\t<form class="edit-todo">\n\t\t\t\t<input onblur=', ' value="', '" class="edit">\n\t\t\t</form>\n\t\t</li>\n\t'], ['\n\t\t<li key="', '" class="', '">\n\t\t\t<div class="view">\n\t\t\t\t<input class="toggle" type="checkbox" ', '>\n\t\t\t\t<label>', '</label>\n\t\t\t\t<button class="destroy"></button>\n\t\t\t</div>\n\n\t\t\t<form class="edit-todo">\n\t\t\t\t<input onblur=', ' value="', '" class="edit">\n\t\t\t</form>\n\t\t</li>\n\t']);

exports.default = renderTodoList;

var _diffhtml = require('diffhtml');

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function renderTodoList(props) {
	return props.todos.map(function (todo) {
		return (0, _diffhtml.html)(_templateObject, todo.key, props.getTodoClassNames(todo), todo.completed ? 'checked' : '', todo.title, props.stopEditing, todo.title);
	});
}

},{"diffhtml":4}],7:[function(require,module,exports){
'use strict';

var _diffhtml = require('diffhtml');

var _diffhtmlDevtools = require('diffhtml-devtools');

var _diffhtmlDevtools2 = _interopRequireDefault(_diffhtmlDevtools);

var _diffhtmlLogger = require('diffhtml-logger');

var _diffhtmlLogger2 = _interopRequireDefault(_diffhtmlLogger);

var _diffhtmlInlineTransitions = require('diffhtml-inline-transitions');

var _diffhtmlInlineTransitions2 = _interopRequireDefault(_diffhtmlInlineTransitions);

var _todoApp = require('./components/todo-app');

var _todoApp2 = _interopRequireDefault(_todoApp);

var _store = require('./redux/store');

var _store2 = _interopRequireDefault(_store);

var _url = require('./redux/actions/url');

var urlActions = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _diffhtml.use)((0, _diffhtmlDevtools2.default)());
//use(logger());
//use(inlineTransitions());

var setHashState = function setHashState(hash) {
  return _store2.default.dispatch(urlActions.setHashState(hash));
};

// Create the application and mount.
_todoApp2.default.create(document.querySelector('todo-app'));

// Set URL state.
setHashState(location.hash);

// Set URL state when hash changes.
window.onhashchange = function (e) {
  return setHashState(location.hash);
};

},{"./components/todo-app":5,"./redux/actions/url":9,"./redux/store":12,"diffhtml":4,"diffhtml-devtools":1,"diffhtml-inline-transitions":2,"diffhtml-logger":3}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.addTodo = addTodo;
exports.removeTodo = removeTodo;
exports.toggleCompletion = toggleCompletion;
exports.startEditing = startEditing;
exports.stopEditing = stopEditing;
exports.clearCompleted = clearCompleted;
exports.toggleAll = toggleAll;
var ADD_TODO = exports.ADD_TODO = 'ADD_TODO';
var REMOVE_TODO = exports.REMOVE_TODO = 'REMOVE_TODO';
var TOGGLE_COMPLETION = exports.TOGGLE_COMPLETION = 'TOGGLE_COMPLETION';
var START_EDITING = exports.START_EDITING = 'START_EDITING';
var STOP_EDITING = exports.STOP_EDITING = 'STOP_EDITING';
var CLEAR_COMPLETED = exports.CLEAR_COMPLETED = 'CLEAR_COMPLETED';
var TOGGLE_ALL = exports.TOGGLE_ALL = 'TOGGLE_ALL';

function addTodo(title) {
	return {
		type: ADD_TODO,
		title: title
	};
}

function removeTodo(index) {
	return {
		type: REMOVE_TODO,
		index: index
	};
}

function toggleCompletion(index, completed) {
	return {
		type: TOGGLE_COMPLETION,
		index: index,
		completed: completed
	};
}

function startEditing(index) {
	return {
		type: START_EDITING,
		index: index
	};
}

function stopEditing(index, title) {
	return {
		type: STOP_EDITING,
		index: index,
		title: title
	};
}

function clearCompleted() {
	return {
		type: CLEAR_COMPLETED
	};
}

function toggleAll(completed) {
	return {
		type: TOGGLE_ALL,
		completed: completed
	};
}

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.setHashState = setHashState;
var SET_HASH_STATE = exports.SET_HASH_STATE = 'SET_HASH_STATE';

function setHashState(hash) {
	var path = hash.slice(1) || '/';

	return {
		type: SET_HASH_STATE,
		path: path
	};
}

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = todoApp;

var _todoApp = require('../actions/todo-app');

var todoAppActions = _interopRequireWildcard(_todoApp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var assign = Object.assign;

var initialState = {
	todos: JSON.parse(localStorage['diffhtml-todos'] || '[]'),

	getByStatus: function getByStatus(type) {
		return this.todos.filter(function (todo) {
			switch (type) {
				case 'active':
					return !todo.completed;
				case 'completed':
					return todo.completed;
			}

			return true;
		});
	}
};

function todoApp() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	var action = arguments[1];

	switch (action.type) {
		case todoAppActions.ADD_TODO:
			{
				if (!action.title) {
					return state;
				}

				return assign({}, state, {
					todos: state.todos.concat({
						completed: false,
						editing: false,

						title: action.title.trim(),
						key: state.todos.length
					})
				});
			}

		case todoAppActions.REMOVE_TODO:
			{
				state.todos.splice(action.index, 1);

				return assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.TOGGLE_COMPLETION:
			{
				var todo = state.todos[action.index];

				state.todos[action.index] = assign({}, todo, {
					completed: action.completed
				});

				return assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.START_EDITING:
			{
				var _todo = state.todos[action.index];

				state.todos[action.index] = assign({}, _todo, {
					editing: true
				});

				return assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.STOP_EDITING:
			{
				var _todo2 = state.todos[action.index];

				state.todos[action.index] = assign({}, _todo2, {
					title: action.title,
					editing: false
				});

				return assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.CLEAR_COMPLETED:
			{
				return assign({}, state, {
					todos: state.todos.filter(function (todo) {
						return todo.completed === false;
					})
				});
			}

		case todoAppActions.TOGGLE_ALL:
			{
				return assign({}, state, {
					todos: state.todos.map(function (todo) {
						return assign({}, todo, {
							completed: action.completed
						});
					})
				});
			}

		default:
			{
				return state;
			}
	}
}

},{"../actions/todo-app":8}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = url;

var _url = require('../actions/url');

var urlActions = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var assign = Object.assign;

var initialState = { path: location.hash.slice(1) || '/' };

function url() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	var action = arguments[1];

	switch (action.type) {
		case urlActions.SET_HASH_STATE:
			{
				return assign({}, state, { path: action.path });
			}

		default:
			{
				return state;
			}
	}
}

},{"../actions/url":9}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _redux = require('redux');

var _reduxLogger = require('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _todoApp = require('./reducers/todo-app');

var _todoApp2 = _interopRequireDefault(_todoApp);

var _url = require('./reducers/url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Makes a reusable function to create a store. Currently not exported, but
// could be in the future for testing purposes.
var createStoreWithMiddleware = (0, _redux.compose)(
// Adds in store middleware, such as async thunk and logging.
(0, _redux.applyMiddleware)(),

// Hook devtools into our store.
window.devToolsExtension ? window.devToolsExtension() : function (f) {
	return f;
})(_redux.createStore);

// Compose the root reducer from modular reducers.
exports.default = createStoreWithMiddleware((0, _redux.combineReducers)({
	// Encapsulates all TodoApp state.
	todoApp: _todoApp2.default,

	// Manage the URL state.
	url: _url2.default,

	// Store the last action taken.
	lastAction: function lastAction(state, action) {
		return action;
	}
}), {});

},{"./reducers/todo-app":10,"./reducers/url":11,"redux":25,"redux-logger":19}],13:[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":15}],14:[function(require,module,exports){
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

module.exports = isHostObject;

},{}],15:[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],16:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],17:[function(require,module,exports){
var getPrototype = require('./_getPrototype'),
    isHostObject = require('./_isHostObject'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

module.exports = isPlainObject;

},{"./_getPrototype":13,"./_isHostObject":14,"./isObjectLike":16}],18:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],19:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};
var pad = function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
};
var formatTime = function formatTime(time) {
  return "@ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
};

// Use the new performance api to get better precision if available
var timer = typeof performance !== "undefined" && typeof performance.now === "function" ? performance : Date;

/**
 * parse the level option of createLogger
 *
 * @property {string | function | object} level - console[level]
 * @property {object} action
 * @property {array} payload
 * @property {string} type
 */

function getLogLevel(level, action, payload, type) {
  switch (typeof level === "undefined" ? "undefined" : _typeof(level)) {
    case "object":
      return typeof level[type] === "function" ? level[type].apply(level, _toConsumableArray(payload)) : level[type];
    case "function":
      return level(action);
    default:
      return level;
  }
}

/**
 * Creates logger with followed options
 *
 * @namespace
 * @property {object} options - options for logger
 * @property {string | function | object} options.level - console[level]
 * @property {boolean} options.duration - print duration of each action?
 * @property {boolean} options.timestamp - print timestamp with each action?
 * @property {object} options.colors - custom colors
 * @property {object} options.logger - implementation of the `console` API
 * @property {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @property {boolean} options.collapsed - is group collapsed?
 * @property {boolean} options.predicate - condition which resolves logger behavior
 * @property {function} options.stateTransformer - transform state before print
 * @property {function} options.actionTransformer - transform action before print
 * @property {function} options.errorTransformer - transform error before print
 */

function createLogger() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _options$level = options.level;
  var level = _options$level === undefined ? "log" : _options$level;
  var _options$logger = options.logger;
  var logger = _options$logger === undefined ? console : _options$logger;
  var _options$logErrors = options.logErrors;
  var logErrors = _options$logErrors === undefined ? true : _options$logErrors;
  var collapsed = options.collapsed;
  var predicate = options.predicate;
  var _options$duration = options.duration;
  var duration = _options$duration === undefined ? false : _options$duration;
  var _options$timestamp = options.timestamp;
  var timestamp = _options$timestamp === undefined ? true : _options$timestamp;
  var transformer = options.transformer;
  var _options$stateTransfo = options.stateTransformer;
  var // deprecated
  stateTransformer = _options$stateTransfo === undefined ? function (state) {
    return state;
  } : _options$stateTransfo;
  var _options$actionTransf = options.actionTransformer;
  var actionTransformer = _options$actionTransf === undefined ? function (actn) {
    return actn;
  } : _options$actionTransf;
  var _options$errorTransfo = options.errorTransformer;
  var errorTransformer = _options$errorTransfo === undefined ? function (error) {
    return error;
  } : _options$errorTransfo;
  var _options$colors = options.colors;
  var colors = _options$colors === undefined ? {
    title: function title() {
      return "#000000";
    },
    prevState: function prevState() {
      return "#9E9E9E";
    },
    action: function action() {
      return "#03A9F4";
    },
    nextState: function nextState() {
      return "#4CAF50";
    },
    error: function error() {
      return "#F20404";
    }
  } : _options$colors;

  // exit if console undefined

  if (typeof logger === "undefined") {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }

  if (transformer) {
    console.error("Option 'transformer' is deprecated, use stateTransformer instead");
  }

  var logBuffer = [];
  function printBuffer() {
    logBuffer.forEach(function (logEntry, key) {
      var started = logEntry.started;
      var startedTime = logEntry.startedTime;
      var action = logEntry.action;
      var prevState = logEntry.prevState;
      var error = logEntry.error;
      var took = logEntry.took;
      var nextState = logEntry.nextState;

      var nextEntry = logBuffer[key + 1];
      if (nextEntry) {
        nextState = nextEntry.prevState;
        took = nextEntry.started - started;
      }
      // message
      var formattedAction = actionTransformer(action);
      var isCollapsed = typeof collapsed === "function" ? collapsed(function () {
        return nextState;
      }, action) : collapsed;

      var formattedTime = formatTime(startedTime);
      var titleCSS = colors.title ? "color: " + colors.title(formattedAction) + ";" : null;
      var title = "action " + (timestamp ? formattedTime : "") + " " + formattedAction.type + " " + (duration ? "(in " + took.toFixed(2) + " ms)" : "");

      // render
      try {
        if (isCollapsed) {
          if (colors.title) logger.groupCollapsed("%c " + title, titleCSS);else logger.groupCollapsed(title);
        } else {
          if (colors.title) logger.group("%c " + title, titleCSS);else logger.group(title);
        }
      } catch (e) {
        logger.log(title);
      }

      var prevStateLevel = getLogLevel(level, formattedAction, [prevState], "prevState");
      var actionLevel = getLogLevel(level, formattedAction, [formattedAction], "action");
      var errorLevel = getLogLevel(level, formattedAction, [error, prevState], "error");
      var nextStateLevel = getLogLevel(level, formattedAction, [nextState], "nextState");

      if (prevStateLevel) {
        if (colors.prevState) logger[prevStateLevel]("%c prev state", "color: " + colors.prevState(prevState) + "; font-weight: bold", prevState);else logger[prevStateLevel]("prev state", prevState);
      }

      if (actionLevel) {
        if (colors.action) logger[actionLevel]("%c action", "color: " + colors.action(formattedAction) + "; font-weight: bold", formattedAction);else logger[actionLevel]("action", formattedAction);
      }

      if (error && errorLevel) {
        if (colors.error) logger[errorLevel]("%c error", "color: " + colors.error(error, prevState) + "; font-weight: bold", error);else logger[errorLevel]("error", error);
      }

      if (nextStateLevel) {
        if (colors.nextState) logger[nextStateLevel]("%c next state", "color: " + colors.nextState(nextState) + "; font-weight: bold", nextState);else logger[nextStateLevel]("next state", nextState);
      }

      try {
        logger.groupEnd();
      } catch (e) {
        logger.log("—— log end ——");
      }
    });
    logBuffer.length = 0;
  }

  return function (_ref) {
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        // exit early if predicate function returns false
        if (typeof predicate === "function" && !predicate(getState, action)) {
          return next(action);
        }

        var logEntry = {};
        logBuffer.push(logEntry);

        logEntry.started = timer.now();
        logEntry.startedTime = new Date();
        logEntry.prevState = stateTransformer(getState());
        logEntry.action = action;

        var returnedValue = undefined;
        if (logErrors) {
          try {
            returnedValue = next(action);
          } catch (e) {
            logEntry.error = errorTransformer(e);
          }
        } else {
          returnedValue = next(action);
        }

        logEntry.took = timer.now() - logEntry.started;
        logEntry.nextState = stateTransformer(getState());

        printBuffer();

        if (logEntry.error) throw logEntry.error;
        return returnedValue;
      };
    };
  };
}

module.exports = createLogger;
},{}],20:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = applyMiddleware;

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":23}],21:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
},{}],22:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports['default'] = combineReducers;

var _createStore = require('./createStore');

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2['default'])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });

  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        (0, _warning2['default'])('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  if (process.env.NODE_ENV !== 'production') {
    var unexpectedKeyCache = {};
  }

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) {
        (0, _warning2['default'])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
}).call(this,require('_process'))
},{"./createStore":24,"./utils/warning":26,"_process":18,"lodash/isPlainObject":17}],23:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = compose;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  var last = funcs[funcs.length - 1];
  var rest = funcs.slice(0, -1);
  return function () {
    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}
},{}],24:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports['default'] = createStore;

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _symbolObservable = require('symbol-observable');

var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = exports.ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!(0, _isPlainObject2['default'])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[_symbolObservable2['default']] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[_symbolObservable2['default']] = observable, _ref2;
}
},{"lodash/isPlainObject":17,"symbol-observable":27}],25:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = require('./combineReducers');

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = require('./bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = require('./applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2['default'])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2['default'];
exports.combineReducers = _combineReducers2['default'];
exports.bindActionCreators = _bindActionCreators2['default'];
exports.applyMiddleware = _applyMiddleware2['default'];
exports.compose = _compose2['default'];
}).call(this,require('_process'))
},{"./applyMiddleware":20,"./bindActionCreators":21,"./combineReducers":22,"./compose":23,"./createStore":24,"./utils/warning":26,"_process":18}],26:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
},{}],27:[function(require,module,exports){
module.exports = require('./lib/index');

},{"./lib/index":28}],28:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ponyfill = require('./ponyfill');

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root = undefined; /* global window */

if (typeof global !== 'undefined') {
	root = global;
} else if (typeof window !== 'undefined') {
	root = window;
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ponyfill":29}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};
},{}]},{},[7]);
