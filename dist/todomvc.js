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

function devTools() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var cacheTask = [];
  var selectors = new Set();
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
    selectors.add(selector);

    var startDate = performance.now();
    var start = function start() {
      return extension.startTransaction({
        domNode: selector,
        markup: markup,
        options: options,
        state: Object.assign({}, state, state.nextTransaction && {
          nextTransaction: undefined
        })
      });
    };

    if (extension) {
      start();
    }

    return function () {
      var endDate = performance.now();
      var patches = JSON.parse(JSON.stringify(transaction.patches));
      var promises = transaction.promises.slice();

      transaction.onceEnded(function () {
        var aborted = transaction.aborted,
            completed = transaction.completed;

        var stop = function stop() {
          return extension.endTransaction(startDate, endDate, {
            domNode: selector,
            markup: markup,
            options: options,
            state: Object.assign({}, state, state.nextTransaction && {
              nextTransaction: undefined
            }),
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

      var mounts = [];

      selectors.forEach(function (selector) {
        return mounts.push({
          selector: selector
        });
      });

      extension = devToolsExtension().activate({
        VERSION: VERSION,
        internals: {
          MiddlewareCache: MiddlewareCache
        },
        mounts: mounts
      });

      if (cacheTask.length) {
        setTimeout(function () {
          cacheTask.forEach(function (cb) {
            return cb();
          });
          cacheTask.length = 0;
        }, 250);
      }
    }).catch(console.log);
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = inlineTransitions;
var assign = Object.assign;
var keys = Object.keys;

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

/**
 * Binds inline transitions to the parent element and triggers for any matching
 * nested children.
 */
function inlineTransitions() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  // Monitors whenever an element changes an attribute, if the attribute is a
  // valid state name, add this element into the related Set.
  var attributeChanged = function attributeChanged(domNode, name, oldVal, newVal) {
    var map = transitionsMap[name.slice(2)];
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
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.syntheticEvents = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var useCapture = ['onload', 'onunload', 'onscroll', 'onfocus', 'onblur', 'onloadstart', 'onprogress', 'onerror', 'onabort', 'onload', 'onloadend', 'onpointerenter', 'onpointerleave'];

var eventNames = [];
var handlers = new Map();
var bounded = new Set();

// Ensure we don't get user added event/properties.
var cloneDoc = document.cloneNode();

// Fill up event names.
for (var name in cloneDoc) {
  if (name.indexOf('on') === 0) {
    eventNames.push(name);
  }
}

var SyntheticEvent = function SyntheticEvent() {
  _classCallCheck(this, SyntheticEvent);
};

var cloneEvent = function cloneEvent(ev) {
  var ov = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var newEvent = new SyntheticEvent();

  // Copy over original event getters/setters first, will need some extra
  // intelligence to ensure getters/setters work, thx @kofifus.
  for (var key in ev) {
    var desc = Object.getOwnPropertyDescriptor(ev, key);

    if (desc && (desc.get || desc.set)) {
      Object.defineProperty(newEvent, key, desc);
    } else {
      newEvent[key] = ev[key];
    }
  }

  // Copy over overrides.
  for (var _key in ov) {
    newEvent[_key] = ov[_key];
  }

  Object.setPrototypeOf(newEvent, ev);

  return newEvent;
};

var getShadowRoot = function getShadowRoot(node) {
  while (node = node.parentNode) {
    if (node.toString() === "[object ShadowRoot]") {
      return node;
    }
  }

  return false;
};

// Set up global event delegation, once clicked call the saved handlers.
var bindEventsTo = function bindEventsTo(domNode) {
  var rootNode = getShadowRoot(domNode) || domNode.ownerDocument;
  var addEventListener = rootNode.addEventListener;


  if (bounded.has(rootNode)) {
    return false;
  }

  bounded.add(rootNode);

  eventNames.forEach(function (eventName) {
    return addEventListener(eventName.slice(2), function (ev) {
      var target = ev.target;
      var eventHandler = null;

      var path = ev.path ? ev.path : ev.composedPath ? ev.composedPath() : [];

      // If we were unable to get the path via some kind of standard approach,
      // build it up manually.
      if (!path.length) {
        for (var node = target; node; node = node.parentNode) {
          path.push(node);
        }
      }

      for (var i = 0; i < path.length; i++) {
        var _node = path[i];

        if (handlers.has(_node)) {
          var hasEventHandler = handlers.get(_node)[eventName];

          if (hasEventHandler) {
            eventHandler = hasEventHandler;
          }

          break;
        }
      }

      var syntheticEvent = cloneEvent(ev, {
        stopPropagation: function stopPropagation() {
          ev.stopImmediatePropagation();
          ev.stopPropagation();
        },
        preventDefault: function preventDefault() {
          ev.preventDefault();
        },

        nativeEvent: ev
      });
      eventHandler && eventHandler(syntheticEvent);
    }, useCapture.includes(eventName) ? true : false);
  });
};

var syntheticEvents = function syntheticEvents() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  function syntheticEventsTask() {
    return function (_ref) {
      var state = _ref.state,
          patches = _ref.patches;
      var NodeCache = state.internals.NodeCache;
      var SET_ATTRIBUTE = patches.SET_ATTRIBUTE,
          REMOVE_ATTRIBUTE = patches.REMOVE_ATTRIBUTE;


      if (SET_ATTRIBUTE.length) {
        for (var i = 0; i < SET_ATTRIBUTE.length; i += 3) {
          var vTree = SET_ATTRIBUTE[i];
          var _name = SET_ATTRIBUTE[i + 1];
          var value = SET_ATTRIBUTE[i + 2];

          var domNode = NodeCache.get(vTree);
          var eventName = _name.toLowerCase();

          // Remove inline event binding from element and add to handlers.
          if (eventNames.includes(eventName)) {
            var handler = value;
            domNode[eventName] = undefined;

            var newHandlers = handlers.get(domNode) || {};

            // If the value passed is a function, that's what we're looking for.
            if (typeof handler === 'function') {
              newHandlers[eventName] = handler;
            }
            // If the value passed is a string name for a global function, use
            // that.
            else if (typeof window[handler] === 'function') {
                newHandlers[eventName] = window[handler];
              }
              // Remove the event association if the value passed was not a
              // function.
              else {
                  delete newHandlers[eventName];
                }

            handlers.set(domNode, newHandlers);
            bindEventsTo(domNode);
          }
        }
      }

      if (REMOVE_ATTRIBUTE.length) {
        for (var _i = 0; _i < REMOVE_ATTRIBUTE.length; _i += 2) {
          var _vTree = REMOVE_ATTRIBUTE[_i];
          var _name2 = REMOVE_ATTRIBUTE[_i + 1];

          var _domNode = NodeCache.get(_vTree);
          var _eventName = _name2.toLowerCase();

          // Remove event binding from element and instead add to handlers.
          if (eventNames.includes(_eventName)) {
            var _newHandlers = handlers.get(_domNode) || {};
            delete _newHandlers[_eventName];
            handlers.set(_domNode, _newHandlers);
          }
        }
      }
    };
  }

  var subscribe = function subscribe() {};

  var unsubscribe = function unsubscribe() {};

  return Object.assign(syntheticEventsTask, { subscribe: subscribe, unsubscribe: unsubscribe });
};

exports.default = syntheticEvents;
module.exports = exports['default'];

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
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

  var ELEMENT = newPatches.ELEMENT,
      ATTRIBUTE = newPatches.ATTRIBUTE;


  patches.forEach(function (changeset) {
    var INSERT_BEFORE = changeset[0];
    var REMOVE_CHILD = changeset[1];
    var REPLACE_CHILD = changeset[2];
    var NODE_VALUE = changeset[3];
    var SET_ATTRIBUTE = changeset[4];
    var REMOVE_ATTRIBUTE = changeset[5];

    INSERT_BEFORE.forEach(function (patch) {
      var _patch = _slicedToArray(patch, 3),
          vTree = _patch[0],
          fragment = _patch[1],
          referenceNode = _patch[2];

      ELEMENT.INSERT_BEFORE.push({ vTree: vTree, fragment: fragment, referenceNode: referenceNode });
    });

    REMOVE_CHILD.forEach(function (patch) {
      var _patch2 = _slicedToArray(patch, 2),
          vTree = _patch2[0],
          childNode = _patch2[1];

      ELEMENT.REMOVE_CHILD.push({ vTree: vTree, childNode: childNode });
    });

    REPLACE_CHILD.forEach(function (patch) {
      var _patch3 = _slicedToArray(patch, 3),
          vTree = _patch3[0],
          newChildNode = _patch3[1],
          oldChildNode = _patch3[2];

      ELEMENT.REPLACE_CHILD.push({ vTree: vTree, newChildNode: newChildNode, oldChildNode: oldChildNode });
    });

    SET_ATTRIBUTE.forEach(function (patch) {
      var _patch4 = _slicedToArray(patch, 2),
          vTree = _patch4[0],
          attributesList = _patch4[1];

      var attributes = {};

      for (var i = 0; i < attributesList.length; i++) {
        var _attributesList$i = _slicedToArray(attributesList[i], 2),
            name = _attributesList$i[0],
            value = _attributesList$i[1];

        attributes[name] = value;
      }

      ATTRIBUTE.SET.push({ vTree: vTree, attributes: attributes });
    });

    REMOVE_ATTRIBUTE.forEach(function (patch) {
      var _patch5 = _slicedToArray(patch, 2),
          vTree = _patch5[0],
          attributesList = _patch5[1];

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
  var domNode = transaction.domNode,
      oldTree = transaction.oldTree,
      newTree = transaction.newTree,
      patches = transaction.patches,
      promises = transaction.promises,
      options = transaction.options,
      markup = transaction.markup,
      state = transaction.state;

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


    if (transaction.state.isRendering) {
      console.groupEnd();

      log('%cdiffHTML...render transaction aborted  ', 'group', 'color: #FF78B2', new Date(), transaction);

      console.groupEnd();
    }

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
},{}],5:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.verifyState = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getValue = function getValue(vTree, keyName) {
  if (vTree instanceof Node && vTree.attributes) {
    return vTree.attributes[keyName].value || vTree[keyName];
  } else {
    return vTree.attributes[keyName];
  }
};

var setupDebugger = function setupDebugger(options) {
  return function (message) {
    if (options.debug) {
      throw new Error(message);
    } else {
      console.warn(message);
    }
  };
};

var cloneTree = exports.cloneTree = function cloneTree(tree) {
  return tree ? assign({}, tree, {
    attributes: assign({}, tree.attributes),
    childNodes: tree.childNodes.map(function (vTree) {
      return cloneTree(vTree);
    })
  }) : null;
};

// Support loading diffHTML in non-browser environments.
var element = global.document ? document.createElement('div') : null;

/**
 * Decodes HTML strings.
 *
 * @see http://stackoverflow.com/a/5796718
 * @param string
 * @return unescaped HTML
 */
var decodeEntities = exports.decodeEntities = function decodeEntities(string) {
  // If there are no HTML entities, we can safely pass the string through.
  if (!element || !string || !string.indexOf || string.indexOf('&') === -1) {
    return string;
  }

  element.innerHTML = string;
  return element.textContent;
};

var flattenFragments = function flattenFragments(vTree) {
  vTree.childNodes.forEach(function (childNode, i) {
    if (childNode.nodeType === 11) {
      // Flatten the nodes into the position.
      vTree.childNodes.splice.apply(vTree.childNodes, [i, 1].concat(_toConsumableArray(childNode.childNodes)));
      childNode.childNodes.forEach(function (childNode) {
        return flattenFragments(childNode);
      });
      return;
    }

    flattenFragments(childNode);
  });

  return vTree;
};

var compareTrees = exports.compareTrees = function compareTrees(options, transaction, oldTree, newTree) {
  var promises = transaction.promises,
      NodeCache = transaction.state.internals.NodeCache;


  var debug = setupDebugger(options);

  var oldAttrKeys = Object.keys(oldTree.attributes || {}).sort().filter(Boolean);
  var newAttrKeys = Object.keys(newTree.attributes || {}).sort().filter(Boolean);

  var oldTreeIsNode = oldTree instanceof Node;
  var oldLabel = oldTreeIsNode ? 'ON DOM NODE' : 'OLD';

  if (oldTreeIsNode) {
    newTree = flattenFragments(newTree);
  }

  var oldValue = decodeEntities(oldTree.nodeValue || '').replace(/\r?\n|\r/g, '');
  var newValue = decodeEntities(newTree.nodeValue || '').replace(/\r?\n|\r/g, '');

  if (oldTree.nodeName.toLowerCase() !== newTree.nodeName.toLowerCase() && newTree.nodeType !== 11) {
    debug('[Mismatched nodeName] ' + oldLabel + ': ' + oldTree.nodeName + ' NEW TREE: ' + newTree.nodeName);
  } else if (oldTree.nodeValue && newTree.nodeValue && oldValue !== newValue) {
    debug('[Mismatched nodeValue] ' + oldLabel + ': ' + oldValue + ' NEW TREE: ' + newValue);
  } else if (oldTree.nodeType !== newTree.nodeType && newTree.nodeType !== 11) {
    debug('[Mismatched nodeType] ' + oldLabel + ': ' + oldTree.nodeType + ' NEW TREE: ' + newTree.nodeType);
  } else if (oldTree.childNodes.length !== newTree.childNodes.length) {
    debug('[Mismatched childNodes length] ' + oldLabel + ': ' + oldTree.childNodes.length + ' NEW TREE: ' + newTree.childNodes.length);
  }

  if (oldTreeIsNode && oldTree.attributes) {
    oldAttrKeys = [].concat(_toConsumableArray(oldTree.attributes)).map(function (s) {
      return String(s.name);
    }).sort();
  }

  if (!oldTreeIsNode && !NodeCache.has(oldTree)) {
    debug('Tree does not have an associated DOM Node');
  }

  // Look for attribute differences.
  if (newTree.nodeType !== 11) {
    for (var i = 0; i < oldAttrKeys.length; i++) {
      var _oldValue = getValue(oldTree, oldAttrKeys[i]) || '';
      var _newValue = getValue(newTree, newAttrKeys[i]) || '';

      // If names are different report it out.
      if (oldAttrKeys[i].toLowerCase() !== newAttrKeys[i].toLowerCase()) {
        if (!newAttrKeys[i]) {
          debug('[Unexpected attribute] ' + oldLabel + ': ' + oldAttrKeys[i] + '="' + _oldValue + '"');
        } else if (!oldAttrKeys[i]) {
          debug('[Unexpected attribute] IN NEW TREE: ' + newAttrKeys[i] + '="' + _newValue + '"');
        } else {
          debug('[Unexpected attribute] ' + oldLabel + ': ' + oldAttrKeys[i] + '="' + _oldValue + '" IN NEW TREE: ' + newAttrKeys[i] + '="' + _newValue + '"');
        }
      }
      // If values are different
      else if (!oldTreeIsNode && _oldValue !== _newValue) {
          debug('[Unexpected attribute] ' + oldLabel + ': ' + oldAttrKeys[i] + '="' + _oldValue + '" IN NEW TREE: ' + newAttrKeys[i] + '="' + _newValue + '"');
        }
    }

    for (var _i = 0; _i < oldTree.childNodes.length; _i++) {
      if (oldTree.childNodes[_i] && newTree.childNodes[_i]) {
        compareTrees(options, transaction, oldTree.childNodes[_i], newTree.childNodes[_i]);
      }
    }
  }
};

exports.default = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function verifyStateTask() {
    return function (transaction) {
      var domNode = transaction.domNode,
          state = transaction.state;

      var oldTree = transaction.oldTree || state.oldTree;
      var newTree = transaction.newTree;

      if (oldTree && newTree) {
        compareTrees(options, transaction, oldTree, newTree);
      }

      transaction.onceEnded(function () {
        compareTrees(options, transaction, domNode, newTree);
      });
    };
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
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

var free = new Set();
var allocate = new Set();
var _protect = new Set();
var shape = function shape() {
  return {
    rawNodeName: '',
    nodeName: '',
    nodeValue: '',
    nodeType: 1,
    key: '',
    childNodes: [],
    attributes: {}
  };
};

// Creates a pool to query new or reused values from.
var memory$1 = { free: free, allocated: allocate, protected: _protect };

// Prime the free memory pool with VTrees.
for (var i = 0; i < size; i++) {
  free.add(shape());
}

// Cache the values object, we'll refer to this iterator which is faster
// than calling it every single time. It gets replaced once exhausted.
var freeValues = free.values();

// Cache VTree objects in a pool which is used to get
var Pool = {
  size: size,
  memory: memory$1,

  get: function get() {
    var _freeValues$next = freeValues.next(),
        _freeValues$next$valu = _freeValues$next.value,
        value = _freeValues$next$valu === undefined ? shape() : _freeValues$next$valu,
        done = _freeValues$next.done;

    // This extra bit of work allows us to avoid calling `free.values()` every
    // single time an object is needed.


    if (done) {
      freeValues = free.values();
    }

    free.delete(value);
    allocate.add(value);
    return value;
  },
  protect: function protect(value) {
    allocate.delete(value);
    _protect.add(value);
  },
  unprotect: function unprotect(value) {
    if (_protect.has(value)) {
      _protect.delete(value);
      free.add(value);
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

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Support loading diffHTML in non-browser environments.
var g = (typeof global === 'undefined' ? 'undefined' : _typeof$1(global)) === 'object' ? global : window;
var element$1 = g.document ? document.createElement('div') : null;

/**
 * Decodes HTML strings.
 *
 * @see http://stackoverflow.com/a/5796718
 * @param string
 * @return unescaped HTML
 */
function decodeEntities(string) {
  // If there are no HTML entities, we can safely pass the string through.
  if (!element$1 || !string || !string.indexOf || !string.includes('&')) {
    return string;
  }

  element$1.innerHTML = string;
  return element$1.textContent;
}

/**
 * Tiny HTML escaping function, useful to protect against things like XSS and
 * unintentionally breaking attributes with quotes.
 *
 * @param {String} unescaped - An HTML value, unescaped
 * @return {String} - An HTML-safe string
 */
function escape(unescaped) {
  return unescaped.replace(/[&<>]/g, function (match) {
    return "&#" + match.charCodeAt(0) + ";";
  });
}

var marks = new Map();
var prefix = 'diffHTML';
var DIFF_PERF = 'diff_perf';

var hasSearch = typeof location !== 'undefined';
var hasArguments = typeof process !== 'undefined' && process.argv;
var nop = function nop() {};

var makeMeasure = (function (domNode, vTree) {
  // Check for these changes on every check.
  var wantsSearch = hasSearch && location.search.includes(DIFF_PERF);
  var wantsArguments = hasArguments && process.argv.includes(DIFF_PERF);
  var wantsPerfChecks = wantsSearch || wantsArguments;

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
      name = vTree.rawNodeName.name + ' ' + name;
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

var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var isArray = Array.isArray;

var fragmentName = '#document-fragment';

function createTree(input, attributes, childNodes) {
  for (var _len = arguments.length, rest = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    rest[_key - 3] = arguments[_key];
  }

  // If no input was provided then we return an indication as such.
  if (!input) {
    return null;
  }

  // If the first argument is an array, we assume this is a DOM fragment and
  // the array are the childNodes.
  if (isArray(input)) {
    childNodes = [];

    for (var i = 0; i < input.length; i++) {
      var newTree = createTree(input[i]);
      if (!newTree) {
        continue;
      }
      var isFragment = newTree.nodeType === 11;

      if (typeof newTree.rawNodeName === 'string' && isFragment) {
        var _childNodes;

        (_childNodes = childNodes).push.apply(_childNodes, _toConsumableArray$1(newTree.childNodes));
      } else {
        childNodes.push(newTree);
      }
    }

    return createTree(fragmentName, null, childNodes);
  }

  var isObject = (typeof input === 'undefined' ? 'undefined' : _typeof$2(input)) === 'object';

  // Crawl an HTML or SVG Element/Text Node etc. for attributes and children.
  if (input && isObject && 'parentNode' in input) {
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

        for (var _i = 0; _i < input.attributes.length; _i++) {
          var _input$attributes$_i = input.attributes[_i],
              name = _input$attributes$_i.name,
              value = _input$attributes$_i.value;

          // If the attribute's value is empty, seek out the property instead.

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

        for (var _i2 = 0; _i2 < input.childNodes.length; _i2++) {
          childNodes.push(createTree(input.childNodes[_i2]));
        }
      }
    }

    var vTree = createTree(input.nodeName, attributes, childNodes);
    NodeCache.set(vTree, input);
    return vTree;
  }

  // Assume any object value is a valid VTree object.
  if (isObject) {
    return input;
  }

  // Support JSX-style children being passed.
  if (rest.length) {
    childNodes = [childNodes].concat(rest);
  }

  // Allocate a new VTree from the pool.
  var entry = Pool.get();
  var isTextNode = input === '#text';
  var isString = typeof input === 'string';

  entry.key = '';
  entry.rawNodeName = input;
  entry.nodeName = isString ? input.toLowerCase() : '#document-fragment';
  entry.childNodes.length = 0;
  entry.nodeValue = '';
  entry.attributes = {};

  if (isTextNode) {
    var _nodes = arguments.length === 2 ? attributes : childNodes;
    var nodeValue = isArray(_nodes) ? _nodes.join('') : _nodes;

    entry.nodeType = 3;
    entry.nodeValue = String(nodeValue || '');

    return entry;
  }

  if (input === fragmentName || typeof input !== 'string') {
    entry.nodeType = 11;
  } else if (input === '#comment') {
    entry.nodeType = 8;
  } else {
    entry.nodeType = 1;
  }

  var useAttributes = isArray(attributes) || (typeof attributes === 'undefined' ? 'undefined' : _typeof$2(attributes)) !== 'object';
  var nodes = useAttributes ? attributes : childNodes;
  var nodeArray = isArray(nodes) ? nodes : [nodes];

  if (nodes && nodeArray.length) {
    for (var _i3 = 0; _i3 < nodeArray.length; _i3++) {
      var newNode = nodeArray[_i3];

      // Assume objects are vTrees.
      if ((typeof newNode === 'undefined' ? 'undefined' : _typeof$2(newNode)) === 'object') {
        entry.childNodes.push(newNode);
      }
      // Cover generate cases where a user has indicated they do not want a
      // node from appearing.
      else if (newNode) {
          entry.childNodes.push(createTree('#text', null, newNode));
        }
    }
  }

  if (attributes && (typeof attributes === 'undefined' ? 'undefined' : _typeof$2(attributes)) === 'object' && !isArray(attributes)) {
    entry.attributes = attributes;
  }

  // If is a script tag and has a src attribute, key off that.
  if (entry.nodeName === 'script' && entry.attributes.src) {
    entry.key = String(entry.attributes.src);
  }

  // Set the `key` prop if passed as an attr, overrides `script[src]`.
  if (entry.attributes && 'key' in entry.attributes) {
    entry.key = String(entry.attributes.key);
  }

  return entry;
}

var empty = {};

// Reuse these maps, it's more performant to clear them than to recreate.
var oldKeys = new Map();
var newKeys = new Map();

var propToAttrMap = {
  className: 'class',
  htmlFor: 'for'
};

var addTreeOperations = function addTreeOperations(TREE_OPS, patchset) {
  var INSERT_BEFORE = patchset.INSERT_BEFORE,
      REMOVE_CHILD = patchset.REMOVE_CHILD,
      REPLACE_CHILD = patchset.REPLACE_CHILD;

  // We want to look if anything has changed, if nothing has we won't add it to
  // the patchset.

  if (INSERT_BEFORE || REMOVE_CHILD || REPLACE_CHILD) {
    TREE_OPS.push(patchset);
  }
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
    INSERT_BEFORE: null,
    REMOVE_CHILD: null,
    REPLACE_CHILD: null
  };

  // Seek out attribute changes first, but only from element Nodes.
  if (newTree.nodeType === 1) {
    var oldAttributes = oldTree ? oldTree.attributes : empty;
    var newAttributes = newTree.attributes;

    // Search for sets and changes.

    for (var key in newAttributes) {
      var value = newAttributes[key];

      if (key in oldAttributes && oldAttributes[key] === newAttributes[key]) {
        continue;
      }

      if (oldTree) {
        oldAttributes[key] = value;
      }

      // Alias prop names to attr names for patching purposes.
      if (key in propToAttrMap) {
        key = propToAttrMap[key];
      }

      SET_ATTRIBUTE.push(oldTree || newTree, key, value);
    }

    if (oldTree) {
      // Search for removals.
      for (var _key in oldAttributes) {
        if (_key in newAttributes) {
          continue;
        }
        REMOVE_ATTRIBUTE.push(oldTree || newTree, _key);
        delete oldAttributes[_key];
      }
    }
  }

  // If both VTrees are text nodes and the values are different, change the
  // NODE_VALUE.
  if (newTree.nodeName === '#text') {
    if (oldTree && oldTree.nodeName === '#text') {
      if (oldTree.nodeValue !== newTree.nodeName) {
        NODE_VALUE.push(oldTree, newTree.nodeValue, oldTree.nodeValue);
        oldTree.nodeValue = newTree.nodeValue;
        addTreeOperations(TREE_OPS, patchset);
        return patches;
      }
    } else {
      NODE_VALUE.push(newTree, newTree.nodeValue, null);
      addTreeOperations(TREE_OPS, patchset);
      return patches;
    }
  }

  // If there was no oldTree specified, this is a new element so scan for
  // attributes.
  if (!oldTree) {
    // Dig into all nested children for attribute changes.
    for (var i = 0; i < newTree.childNodes.length; i++) {
      syncTree(null, newTree.childNodes[i], patches);
    }

    return patches;
  }

  var oldNodeName = oldTree.nodeName;
  var newNodeName = newTree.nodeName;


  if (oldNodeName !== newNodeName && newTree.nodeType !== 11) {
    throw new Error('Sync failure, cannot compare ' + newNodeName + ' with ' + oldNodeName);
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
      var newKey = newChildNode.key;

      // If there is no old element to compare to, this is a simple addition.

      if (!oldChildNode) {
        if (patchset.INSERT_BEFORE === null) {
          patchset.INSERT_BEFORE = [];
        }
        patchset.INSERT_BEFORE.push(oldTree, newChildNode, null);
        oldChildNodes.push(newChildNode);
        syncTree(null, newChildNode, patches);
        continue;
      }

      var oldKey = oldChildNode.key;

      // Remove the old Node and insert the new node (aka replace).

      if (!newKeys.has(oldKey) && !oldKeys.has(newKey)) {
        if (patchset.REPLACE_CHILD === null) {
          patchset.REPLACE_CHILD = [];
        }
        patchset.REPLACE_CHILD.push(newChildNode, oldChildNode);
        oldChildNodes.splice(oldChildNodes.indexOf(oldChildNode), 1, newChildNode);
        syncTree(null, newChildNode, patches);
        continue;
      }
      // Remove the old node instead of replacing.
      else if (!newKeys.has(oldKey)) {
          if (patchset.REMOVE_CHILD === null) {
            patchset.REMOVE_CHILD = [];
          }
          patchset.REMOVE_CHILD.push(oldChildNode);
          oldChildNodes.splice(oldChildNodes.indexOf(oldChildNode), 1);
          _i3 = _i3 - 1;
          continue;
        }

      // If there is a key set for this new element, use that to figure out
      // which element to use.
      if (newKey !== oldKey) {
        var optimalNewNode = newChildNode;

        // Prefer existing to new and remove from old position.
        if (newKey && oldKeys.has(newKey)) {
          optimalNewNode = oldKeys.get(newKey);
          oldChildNodes.splice(oldChildNodes.indexOf(optimalNewNode), 1);
        } else if (newKey) {
          optimalNewNode = newChildNode;

          // Find attribute changes for this Node.
          syncTree(null, newChildNode, patches);
        }

        if (patchset.INSERT_BEFORE === null) {
          patchset.INSERT_BEFORE = [];
        }
        patchset.INSERT_BEFORE.push(oldTree, optimalNewNode, oldChildNode);
        oldChildNodes.splice(_i3, 0, optimalNewNode);
        continue;
      }

      // If the element we're replacing is totally different from the previous
      // replace the entire element, don't bother investigating children.
      if (oldChildNode.nodeName !== newChildNode.nodeName) {
        if (patchset.REPLACE_CHILD === null) {
          patchset.REPLACE_CHILD = [];
        }
        patchset.REPLACE_CHILD.push(newChildNode, oldChildNode);
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
          if (patchset.INSERT_BEFORE === null) {
            patchset.INSERT_BEFORE = [];
          }
          patchset.INSERT_BEFORE.push(oldTree, _newChildNode, null);
          oldChildNodes.push(_newChildNode);
          syncTree(null, _newChildNode, patches);
          continue;
        }

        // If the element we're replacing is totally different from the previous
        // replace the entire element, don't bother investigating children.
        if (_oldChildNode.nodeName !== _newChildNode.nodeName) {
          if (patchset.REPLACE_CHILD === null) {
            patchset.REPLACE_CHILD = [];
          }
          patchset.REPLACE_CHILD.push(_newChildNode, _oldChildNode);
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
      if (patchset.REMOVE_CHILD === null) {
        patchset.REMOVE_CHILD = [];
      }
      patchset.REMOVE_CHILD.push(oldChildNodes[_i5]);
    }

    oldChildNodes.length = newChildNodes.length;
  }

  addTreeOperations(TREE_OPS, patchset);

  return patches;
}

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Adapted implementation from:
// https://github.com/ashi009/node-fast-html-parser

var hasNonWhitespaceEx = /\S/;
var doctypeEx = /<!.*>/i;
var attrEx = /\b([_a-z][_a-z0-9\-]*)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;
var spaceEx = /[^ ]/;
var tokenEx = /__DIFFHTML__([^_]*)__/;
var tagEx = /<!--[^]*?(?=-->)-->|<(\/?)([a-z\-\_][a-z0-9\-\_]*)\s*([^>]*?)(\/?)>/ig;

var blockText = new Set(['script', 'noscript', 'style', 'code', 'template']);

var selfClosing = new Set(['meta', 'img', 'link', 'input', 'area', 'br', 'hr', 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

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

/**
 * Interpolate dynamic supplemental values from the tagged template into the
 * tree.
 *
 * @param currentParent
 * @param string
 * @param supplemental
 */
var interpolateValues = function interpolateValues(currentParent, string) {
  var _currentParent$childN;

  var supplemental = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // If this is text and not a doctype, add as a text node.
  if (string && !doctypeEx.test(string) && !tokenEx.test(string)) {
    return currentParent.childNodes.push(createTree('#text', string));
  }

  var childNodes = [];
  var parts = string.split(tokenEx);
  var length = parts.length;


  for (var i = 0; i < parts.length; i++) {
    var value = parts[i];

    if (!value) {
      continue;
    }

    // When we split on the token expression, the capture group will replace
    // the token's position. So all we do is ensure that we're on an odd
    // index and then we can source the correct value.
    if (i % 2 === 1) {
      var innerTree = supplemental.children[value];
      if (!innerTree) {
        continue;
      }
      var isFragment = innerTree.nodeType === 11;

      if (typeof innerTree.rawNodeName === 'string' && isFragment) {
        childNodes.push.apply(childNodes, _toConsumableArray(innerTree.childNodes));
      } else {
        childNodes.push(innerTree);
      }
    } else if (!doctypeEx.test(value)) {
      childNodes.push(createTree('#text', value));
    }
  }

  (_currentParent$childN = currentParent.childNodes).push.apply(_currentParent$childN, childNodes);
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
  var match = null;

  // Support dynamic tag names like: `<${MyComponent} />`.
  if (match = tokenEx.exec(nodeName)) {
    return HTMLElement(supplemental.tags[match[1]], rawAttrs, supplemental);
  }

  var attributes = {};

  // Migrate raw attributes into the attributes object used by the VTree.
  for (var _match; _match = attrEx.exec(rawAttrs || '');) {
    var name = _match[1];
    var value = _match[6] || _match[5] || _match[4] || _match[1];
    var tokenMatch = value.match(tokenEx);

    // If we have multiple interpolated values in an attribute, we must
    // flatten to a string. There are no other valid options.
    if (tokenMatch && tokenMatch.length) {
      var parts = value.split(tokenEx);
      var length = parts.length;


      var hasToken = tokenEx.exec(name);
      var newName = hasToken ? supplemental.attributes[hasToken[1]] : name;

      for (var i = 0; i < parts.length; i++) {
        var _value = parts[i];

        if (!_value) {
          continue;
        }

        // When we split on the token expression, the capture group will
        // replace the token's position. So all we do is ensure that we're on
        // an odd index and then we can source the correct value.
        if (i % 2 === 1) {
          if (attributes[newName]) {
            attributes[newName] += supplemental.attributes[_value];
          } else {
            attributes[newName] = supplemental.attributes[_value];
          }
        } else {
          if (attributes[newName]) {
            attributes[newName] += _value;
          } else {
            attributes[newName] = _value;
          }
        }
      }
    } else if (tokenMatch = tokenEx.exec(name)) {
      var nameAndValue = supplemental.attributes[tokenMatch[1]];
      var _hasToken = tokenEx.exec(value);
      var getValue = _hasToken ? supplemental.attributes[_hasToken[1]] : value;

      attributes[nameAndValue] = value === '""' ? '' : getValue;
    } else {
      attributes[name] = value === '""' ? '' : value;
    }
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
  var preLastTextPos = -1;

  // If there are no HTML elements, treat the passed in html as a single
  // text node.
  if (html.indexOf('<') === -1 && html) {
    interpolateValues(currentParent, html, supplemental);
    return root;
  }

  // Look through the HTML markup for valid tags.
  for (var match, text; match = tagEx.exec(html);) {
    if (lastTextPos > -1) {
      if (lastTextPos + match[0].length < tagEx.lastIndex) {
        text = html.slice(lastTextPos, tagEx.lastIndex - match[0].length);

        // Do not process leading whitespace in a tagged template.
        if (preLastTextPos === -1 ? hasNonWhitespaceEx.test(text) : text) {
          interpolateValues(currentParent, text, supplemental);
        }
      }
    }

    var matchOffset = tagEx.lastIndex - match[0].length;

    if (lastTextPos === -1 && matchOffset > 0) {
      var string = html.slice(0, matchOffset);

      if (string && hasNonWhitespaceEx.test(string) && !doctypeEx.exec(string)) {
        interpolateValues(currentParent, string, supplemental);
      }
    }

    preLastTextPos = lastTextPos;
    lastTextPos = tagEx.lastIndex;

    // This is a comment (TODO support these).
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

      var tokenMatch = tokenEx.exec(match[2]);

      // </ or /> or <br> etc.
      while (currentParent) {
        // Self closing dynamic nodeName.
        if (match[4] === '/' && tokenMatch) {
          stack.pop();
          currentParent = stack[stack.length - 1];

          break;
        }
        // Not self-closing, so seek out the next match.
        else if (tokenMatch) {
            var value = supplemental.tags[tokenMatch[1]];

            if (currentParent.rawNodeName === value) {
              stack.pop();
              currentParent = stack[stack.length - 1];

              break;
            }
          }

        if (currentParent.rawNodeName === match[2]) {
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
  if (remainingText) {
    interpolateValues(currentParent, remainingText, supplemental);
  }

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

  // Reset regular expression positions per parse.
  attrEx.lastIndex = 0;
  tagEx.lastIndex = 0;

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
	makeMeasure: makeMeasure,
	Pool: Pool,
	parse: parse
});

var _typeof$3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
    var _ret = function () {
      // Resolve an existing transaction that we're going to pave over in the
      // next statement.
      if (state.nextTransaction) {
        state.nextTransaction.promises[0].resolve(state.nextTransaction);
      }

      // Set a pointer to this current transaction to render immediatately after
      // the current transaction completes.
      state.nextTransaction = transaction;

      var deferred = {};
      var resolver = new Promise(function (resolve) {
        return deferred.resolve = resolve;
      });

      resolver.resolve = deferred.resolve;
      transaction.promises = [resolver];

      return {
        v: transaction.abort()
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof$3(_ret)) === "object") return _ret.v;
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

function reconcileTrees(transaction) {
  var state = transaction.state,
      measure = transaction.state.measure,
      domNode = transaction.domNode,
      markup = transaction.markup,
      options = transaction.options;
  var previousMarkup = state.previousMarkup,
      previousText = state.previousText;
  var inner = options.inner;


  measure('reconcile trees');

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
    var _parse = parse(markup, null, options),
        childNodes = _parse.childNodes;

    // If we are dealing with innerHTML, use all the Nodes. If we're dealing
    // with outerHTML, we can only support diffing against a single element,
    // so pick the first one.


    transaction.newTree = createTree(!inner && childNodes.length === 1 ? childNodes[0] : childNodes);
  }

  // Only create a document fragment for inner nodes if the user didn't already
  // pass an array. If they pass an array, `createTree` will auto convert to
  // a fragment.
  else if (options.inner) {
      var _transaction$oldTree = transaction.oldTree,
          nodeName = _transaction$oldTree.nodeName,
          attributes = _transaction$oldTree.attributes;

      var newTree = createTree(markup);
      var isFragment = newTree.nodeType === 11;

      transaction.newTree = createTree(nodeName, attributes, newTree);

      // Flatten the fragment.
      if (typeof newTree.rawNodeName === 'string' && isFragment) {
        transaction.newTree.childNodes = newTree.childNodes;
      }
    }

    // Everything else gets passed into `createTree` to be figured out.
    else {
        transaction.newTree = createTree(markup);
      }

  measure('reconcile trees');
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
function createNode(vTree) {
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
      _vTree$childNodes = vTree.childNodes,
      childNodes = _vTree$childNodes === undefined ? [] : _vTree$childNodes;

  // Will vary based on the properties of the VTree.

  var domNode = null;

  // Create empty text elements. They will get filled in during the patch
  // process.
  if (nodeName === '#text') {
    domNode = doc.createTextNode(vTree.nodeValue);
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
  // through this `createNode` function as well.
  for (var i = 0; i < childNodes.length; i++) {
    domNode.appendChild(createNode(childNodes[i], doc));
  }

  return domNode;
}

var _typeof$5 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray$3(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Available transition states.
var stateNames = ['attached', 'detached', 'replaced', 'attributeChanged', 'textChanged'];

// Sets up the states up so we can add and remove events from the sets.
stateNames.forEach(function (stateName) {
  return TransitionCache.set(stateName, new Set());
});

function addTransitionState(stateName, callback) {
  if (!stateName || !stateNames.includes(stateName)) {
    throw new Error('Invalid state name \'' + stateName + '\'');
  }

  if (!callback) {
    throw new Error('Missing transition state callback');
  }

  TransitionCache.get(stateName).add(callback);
}

function removeTransitionState(stateName, callback) {
  // Only validate the stateName if the caller provides one.
  if (stateName && !stateNames.includes(stateName)) {
    throw new Error('Invalid state name \'' + stateName + '\'');
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
        for (var i = 0; i < stateNames.length; i++) {
          TransitionCache.get(stateNames[i]).clear();
        }
      }
}

function runTransitions(setName) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var set = TransitionCache.get(setName);
  var promises = [];

  if (!set.size) {
    return promises;
  }

  // Ignore text nodes.
  if (setName !== 'textChanged' && args[0].nodeType === 3) {
    return promises;
  }

  // Run each transition callback, if on the attached/detached.
  set.forEach(function (callback) {
    var retVal = callback.apply(undefined, args);

    // Is a `thennable` object or Native Promise.
    if ((typeof retVal === 'undefined' ? 'undefined' : _typeof$5(retVal)) === 'object' && retVal.then) {
      promises.push(retVal);
    }
  });

  if (setName === 'attached' || setName === 'detached') {
    var element = args[0];

    [].concat(_toConsumableArray$3(element.childNodes)).forEach(function (childNode) {
      promises.push.apply(promises, _toConsumableArray$3(runTransitions.apply(undefined, [setName, childNode].concat(_toConsumableArray$3(args.slice(1))))));
    });
  }

  return promises;
}

var _typeof$4 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray$2(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var blockText$1 = new Set(['script', 'noscript', 'style', 'code', 'template']);

var removeAttribute = function removeAttribute(domNode, name) {
  domNode.removeAttribute(name);

  if (name in domNode) {
    domNode[name] = undefined;
  }
};

function patchNode$$1(patches) {
  var promises = [];
  var TREE_OPS = patches.TREE_OPS,
      NODE_VALUE = patches.NODE_VALUE,
      SET_ATTRIBUTE = patches.SET_ATTRIBUTE,
      REMOVE_ATTRIBUTE = patches.REMOVE_ATTRIBUTE;

  // Set attributes.

  if (SET_ATTRIBUTE.length) {
    for (var i = 0; i < SET_ATTRIBUTE.length; i += 3) {
      var vTree = SET_ATTRIBUTE[i];
      var _name = SET_ATTRIBUTE[i + 1];
      var value = decodeEntities(SET_ATTRIBUTE[i + 2]);
      var domNode = createNode(vTree);
      var attributeChanged = TransitionCache.get('attributeChanged');
      var oldValue = domNode.getAttribute(_name);
      var newPromises = runTransitions('attributeChanged', domNode, _name, oldValue, value);

      // Triggered either synchronously or asynchronously depending on if a
      // transition was invoked.
      var isObject = (typeof value === 'undefined' ? 'undefined' : _typeof$4(value)) === 'object';
      var isFunction = typeof value === 'function';

      // Events must be lowercased otherwise they will not be set correctly.
      var name = _name.indexOf('on') === 0 ? _name.toLowerCase() : _name;

      // Normal attribute value.
      if (!isObject && !isFunction && name) {
        var noValue = value === null || value === undefined;

        // Allow the user to find the real value in the DOM Node as a
        // property.
        try {
          domNode[name] = value;
        } catch (unhandledException) {}

        // Set the actual attribute, this will ensure attributes like
        // `autofocus` aren't reset by the property call above.
        domNode.setAttribute(name, noValue ? '' : value);
      }
      // Support patching an object representation of the style object.
      else if (isObject && name === 'style') {
          var keys = Object.keys(value);

          for (var _i = 0; _i < keys.length; _i++) {
            domNode.style[keys[_i]] = value[keys[_i]];
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
          try {
            domNode[name] = value;
          } catch (unhandledException) {}
        }

      if (newPromises.length) {
        promises.push.apply(promises, _toConsumableArray$2(newPromises));
      }
    }
  }

  // Remove attributes.
  if (REMOVE_ATTRIBUTE.length) {
    var _loop = function _loop(_i2) {
      var vTree = REMOVE_ATTRIBUTE[_i2];
      var name = REMOVE_ATTRIBUTE[_i2 + 1];
      var domNode = NodeCache.get(vTree);
      var attributeChanged = TransitionCache.get('attributeChanged');
      var oldValue = domNode.getAttribute(name);
      var newPromises = runTransitions('attributeChanged', domNode, name, oldValue, null);

      if (newPromises.length) {
        Promise.all(newPromises).then(function () {
          return removeAttribute(domNode, name);
        });
        promises.push.apply(promises, _toConsumableArray$2(newPromises));
      } else {
        removeAttribute(domNode, name);
      }
    };

    for (var _i2 = 0; _i2 < REMOVE_ATTRIBUTE.length; _i2 += 2) {
      _loop(_i2);
    }
  }

  // First do all DOM tree operations, and then do attribute and node value.
  for (var _i3 = 0; _i3 < TREE_OPS.length; _i3++) {
    var _TREE_OPS$_i = TREE_OPS[_i3],
        INSERT_BEFORE = _TREE_OPS$_i.INSERT_BEFORE,
        REMOVE_CHILD = _TREE_OPS$_i.REMOVE_CHILD,
        REPLACE_CHILD = _TREE_OPS$_i.REPLACE_CHILD;

    // Insert/append elements.

    if (INSERT_BEFORE && INSERT_BEFORE.length) {
      for (var _i4 = 0; _i4 < INSERT_BEFORE.length; _i4 += 3) {
        var _vTree = INSERT_BEFORE[_i4];
        var newTree = INSERT_BEFORE[_i4 + 1];
        var referenceTree = INSERT_BEFORE[_i4 + 2];
        var _domNode = NodeCache.get(_vTree);
        var referenceNode = referenceTree && createNode(referenceTree);
        var attached = TransitionCache.get('attached');

        if (referenceTree) {
          protectVTree(referenceTree);
        }

        var newNode = createNode(newTree);
        protectVTree(newTree);

        // If refNode is `null` then it will simply append like `appendChild`.
        _domNode.insertBefore(newNode, referenceNode);

        var attachedPromises = runTransitions('attached', newNode);

        if (attachedPromises.length) {
          promises.push.apply(promises, _toConsumableArray$2(attachedPromises));
        }
      }
    }

    // Remove elements.
    if (REMOVE_CHILD && REMOVE_CHILD.length) {
      var _loop2 = function _loop2(_i5) {
        var vTree = REMOVE_CHILD[_i5];
        var domNode = NodeCache.get(vTree);
        var detached = TransitionCache.get('detached');
        var detachedPromises = runTransitions('detached', domNode);

        if (detachedPromises.length) {
          Promise.all(detachedPromises).then(function () {
            domNode.parentNode.removeChild(domNode);
            unprotectVTree(vTree);
          });

          promises.push.apply(promises, _toConsumableArray$2(detachedPromises));
        } else {
          domNode.parentNode.removeChild(domNode);
          unprotectVTree(vTree);
        }
      };

      for (var _i5 = 0; _i5 < REMOVE_CHILD.length; _i5++) {
        _loop2(_i5);
      }
    }

    // Replace elements.
    if (REPLACE_CHILD && REPLACE_CHILD.length) {
      var _loop3 = function _loop3(_i6) {
        var newTree = REPLACE_CHILD[_i6];
        var oldTree = REPLACE_CHILD[_i6 + 1];
        var oldDomNode = NodeCache.get(oldTree);
        var newDomNode = createNode(newTree);
        var attached = TransitionCache.get('attached');
        var detached = TransitionCache.get('detached');
        var replaced = TransitionCache.get('replaced');

        // Always insert before to allow the element to transition.
        oldDomNode.parentNode.insertBefore(newDomNode, oldDomNode);
        protectVTree(newTree);

        var attachedPromises = runTransitions('attached', newDomNode);
        var detachedPromises = runTransitions('detached', oldDomNode);
        var replacedPromises = runTransitions('replaced', oldDomNode, newDomNode);
        var allPromises = [].concat(_toConsumableArray$2(attachedPromises), _toConsumableArray$2(detachedPromises), _toConsumableArray$2(replacedPromises));

        if (allPromises.length) {
          promises.push(Promise.all(allPromises).then(function () {
            oldDomNode.parentNode.replaceChild(newDomNode, oldDomNode);
            unprotectVTree(oldTree);
          }));
        } else {
          oldDomNode.parentNode.replaceChild(newDomNode, oldDomNode);
          unprotectVTree(oldTree);
        }
      };

      for (var _i6 = 0; _i6 < REPLACE_CHILD.length; _i6 += 2) {
        _loop3(_i6);
      }
    }
  }

  // Change all nodeValues.
  if (NODE_VALUE.length) {
    for (var _i7 = 0; _i7 < NODE_VALUE.length; _i7 += 3) {
      var _vTree2 = NODE_VALUE[_i7];
      var nodeValue = NODE_VALUE[_i7 + 1];
      var _oldValue = NODE_VALUE[_i7 + 2];
      var _domNode2 = NodeCache.get(_vTree2);
      var textChanged = TransitionCache.get('textChanged');
      var textChangedPromises = runTransitions('textChanged', _domNode2, _oldValue, nodeValue);

      var parentNode = _domNode2.parentNode;


      if (nodeValue.includes('&')) {
        _domNode2.nodeValue = decodeEntities(nodeValue);
      } else {
        _domNode2.nodeValue = nodeValue;
      }

      if (parentNode && blockText$1.has(parentNode.nodeName.toLowerCase())) {
        parentNode.nodeValue = escape(decodeEntities(nodeValue));
      }

      if (textChangedPromises.length) {
        promises.push.apply(promises, _toConsumableArray$2(textChangedPromises));
      }
    }
  }

  return promises;
}

function syncTrees(transaction) {
  var _transaction$state = transaction.state,
      measure = _transaction$state.measure,
      oldTree = _transaction$state.oldTree,
      newTree = transaction.newTree,
      domNode = transaction.domNode;


  measure('sync trees');

  // Do a global replace of the element, unable to do this at a lower level.
  // Ignore this for document fragments, they don't appear in the DOM and we
  // treat them as transparent containers.
  if (oldTree.nodeName !== newTree.nodeName && newTree.nodeType !== 11) {
    transaction.patches = {
      TREE_OPS: [{ REPLACE_CHILD: [newTree, oldTree] }],
      SET_ATTRIBUTE: [],
      REMOVE_ATTRIBUTE: [],
      NODE_VALUE: []
    };

    unprotectVTree(transaction.oldTree);
    transaction.oldTree = transaction.state.oldTree = newTree;
    protectVTree(transaction.oldTree);

    // Update the StateCache since we are changing the top level element.
    StateCache.set(createNode(newTree), transaction.state);
  }
  // Otherwise only diff the children.
  else {
      transaction.patches = syncTree(oldTree, newTree);
    }

  measure('sync trees');
}

function _toConsumableArray$4(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
  var _transaction$promises = transaction.promises,
      promises = _transaction$promises === undefined ? [] : _transaction$promises;


  measure('patch node');
  promises.push.apply(promises, _toConsumableArray$4(patchNode$$1(patches, state)));
  measure('patch node');

  transaction.promises = promises;
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



var tasks = Object.freeze({
	schedule: schedule,
	shouldUpdate: shouldUpdate,
	reconcileTrees: reconcileTrees,
	syncTrees: syncTrees,
	patchNode: patch,
	endAsPromise: endAsPromise
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
      var nextTransaction = state.nextTransaction,
          promises = state.nextTransaction.promises;

      state.nextTransaction = undefined;

      // Pull out the resolver deferred.
      var resolver = promises && promises[0];

      // Remove the aborted status.
      nextTransaction.aborted = false;

      // Remove the last task, this has already been executed (via abort).
      nextTransaction.tasks.pop();

      // Reflow this transaction, sans the terminator, since we have already
      // executed it.
      Transaction.flow(nextTransaction, nextTransaction.tasks);

      // Wait for the promises to complete if they exist, otherwise resolve
      // immediately.
      if (promises && promises.length > 1) {
        Promise.all(promises.slice(1)).then(function () {
          return resolver.resolve();
        });
      } else if (resolver) {
        resolver.resolve();
      }
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
      if (_typeof(transaction.domNode) !== 'object') {
        throw new Error('Transaction requires a DOM Node mount point');
      }
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
      measure: makeMeasure(domNode, markup),
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
      Transaction.assert(this);

      var domNode = this.domNode,
          measure = this.state.measure,
          tasks = this.tasks;

      var takeLastTask = tasks.pop();

      this.aborted = false;

      // Add middleware in as tasks.
      Transaction.invokeMiddleware(this);

      // Measure the render flow if the user wants to track performance.
      measure('render');

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
      var measure = state.measure;
      var inner = options.inner;


      measure('finalize');

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
      measure('finalize');
      measure('render');

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

var _typeof$6 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isAttributeEx = /(=|"|')[^><]*?$/;
var isTagEx = /(<|\/)/;
var TOKEN = '__DIFFHTML__';
/**
 * Get the next value from the list. If the next value is a string, make sure
 * it is escaped.
 *
 * @param {Array} values - Values extracted from tagged template literal
 * @return {String|*} - Escaped string, otherwise any value passed
 */
var nextValue = function nextValue(values) {
  var value = values.shift();
  return typeof value === 'string' ? escape(decodeEntities(value)) : value;
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
  if (!strings) {
    return null;
  }

  // Parse only the text, no dynamic bits.
  if (strings.length === 1 && !values.length) {
    var _childNodes = parse(strings[0]).childNodes;
    return _childNodes.length > 1 ? createTree(_childNodes) : _childNodes[0];
  }

  // Used to store markup and tokens.
  var retVal = '';

  // We filter the supplemental values by where they are used. Values are
  // either, children, or tags (for components).
  var supplemental = {
    attributes: {},
    children: {},
    tags: {}
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
      var isObject = (typeof value === 'undefined' ? 'undefined' : _typeof$6(value)) === 'object';
      var isArray = Array.isArray(value);
      var token = TOKEN + i + '__';

      // Injected as attribute.
      if (isAttribute) {
        supplemental.attributes[i] = value;
        retVal += token;
      }
      // Injected as a tag.
      else if (isTag && !isString) {
          supplemental.tags[i] = value;
          retVal += token;
        }
        // Injected as a child node.
        else if (isArray || isObject) {
            supplemental.children[i] = createTree(value);
            retVal += token;
          }
          // Injected as something else in the markup or undefined, ignore
          // obviously falsy values used with boolean operators.
          else if (value) {
              retVal += value;
            }
    }
  });

  // Parse the instrumented markup to get the Virtual Tree.
  var childNodes = parse(retVal, supplemental, options).childNodes;

  // This makes it easier to work with a single element as a root, opposed to
  // always returning an array.
  return childNodes.length === 1 ? childNodes[0] : createTree(childNodes);
}

var html = (function () {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return handleTaggedTemplate.apply(undefined, [{}].concat(args));
});

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

function element(element) {
  var markup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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
  internals: internals,
  tasks: tasks
};

// Ensure the `diff` property is nonenumerable so it doesn't show up in logs.
if (!use.diff) {
  Object.defineProperty(use, 'diff', { value: diff, enumerable: false });
}

exports.__VERSION__ = VERSION;
exports.addTransitionState = addTransitionState;
exports.removeTransitionState = removeTransitionState;
exports.release = release;
exports.createTree = createTree;
exports.createElement = createTree;
exports.use = use;
exports.outerHTML = outerHTML;
exports.innerHTML = innerHTML;
exports.element = element;
exports.html = html;
exports['default'] = diff;

Object.defineProperty(exports, '__esModule', { value: true });

})));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":27}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n      <section class="todoapp"\n        onattached=', '\n        ondetached=', '\n        onsubmit=', '\n        onclick=', '\n        onkeydown=', '\n        ondblclick=', '\n        onchange=', '>\n\n        <header class="header">\n          <h1>todos</h1>\n\n          <form class="add-todo">\n            <input\n              class="new-todo"\n              placeholder="What needs to be done?"\n              autofocus="">\n          </form>\n        </header>\n\n        ', '\n      </section>\n\n      ', '\n    '], ['\n      <section class="todoapp"\n        onattached=', '\n        ondetached=', '\n        onsubmit=', '\n        onclick=', '\n        onkeydown=', '\n        ondblclick=', '\n        onchange=', '>\n\n        <header class="header">\n          <h1>todos</h1>\n\n          <form class="add-todo">\n            <input\n              class="new-todo"\n              placeholder="What needs to be done?"\n              autofocus="">\n          </form>\n        </header>\n\n        ', '\n      </section>\n\n      ', '\n    ']),
    _templateObject2 = _taggedTemplateLiteral(['\n          <section class="main">\n            <input class="toggle-all" type="checkbox" ', '>\n\n            <ul class="todo-list">', '</ul>\n          </section>\n\n          <footer class="footer">\n            <span class="todo-count">\n              <strong>', '</strong>\n              ', ' left\n            </span>\n\n            <ul class="filters">\n              <li>\n                <a href="#/" class=', '>All</a>\n              </li>\n              <li>\n                <a href="#/active" class=', '>Active</a>\n              </li>\n              <li>\n                <a href="#/completed" class=', '>Completed</a>\n              </li>\n            </ul>\n\n            ', '\n          </footer>\n        '], ['\n          <section class="main">\n            <input class="toggle-all" type="checkbox" ', '>\n\n            <ul class="todo-list">', '</ul>\n          </section>\n\n          <footer class="footer">\n            <span class="todo-count">\n              <strong>', '</strong>\n              ', ' left\n            </span>\n\n            <ul class="filters">\n              <li>\n                <a href="#/" class=', '>All</a>\n              </li>\n              <li>\n                <a href="#/active" class=', '>Active</a>\n              </li>\n              <li>\n                <a href="#/completed" class=', '>Completed</a>\n              </li>\n            </ul>\n\n            ', '\n          </footer>\n        ']),
    _templateObject3 = _taggedTemplateLiteral(['\n              <button class="clear-completed" onclick=', '>Clear completed</button>\n            '], ['\n              <button class="clear-completed" onclick=', '>Clear completed</button>\n            ']);

var _diffhtml = require('diffhtml');

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

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
  _createClass(TodoApp, null, [{
    key: 'create',
    value: function create(mount) {
      return new TodoApp(mount);
    }
  }]);

  function TodoApp(mount) {
    var _this = this;

    _classCallCheck(this, TodoApp);

    this.render = (0, _lodash2.default)(function () {
      var state = _store2.default.getState();
      var todoApp = state[_this.mount.dataset.reducer];
      var status = state.url.path.slice(1);
      var allTodos = todoApp.todos;
      var todos = todoApp.getByStatus(status);
      var activeTodos = todoApp.getByStatus('active');
      var completedTodos = todoApp.getByStatus('completed');

      localStorage['diffhtml-todos'] = JSON.stringify(allTodos);

      (0, _diffhtml.innerHTML)(_this.mount, (0, _diffhtml.html)(_templateObject, _this.animateAttached, _this.animateDetached, _this.onSubmitHandler, _this.onClickHandler, _this.handleKeyDown, _this.startEditing, _this.toggleCompletion, allTodos.length && (0, _diffhtml.html)(_templateObject2, _this.setCheckedState(), (0, _todoList2.default)({
        stopEditing: _this.stopEditing,
        getTodoClassNames: _this.getTodoClassNames,
        todos: todos
      }), String(activeTodos.length), activeTodos.length == 1 ? 'item' : 'items', _this.getNavClass('/'), _this.getNavClass('/active'), _this.getNavClass('/completed'), completedTodos.length && (0, _diffhtml.html)(_templateObject3, _this.clearCompleted)), _this.existingFooter));
    }, 10, { leading: true });

    this.addTodo = function (ev) {
      ev.preventDefault();

      var newTodo = ev.target.parentNode.querySelector('.new-todo');
      _store2.default.dispatch(todoAppActions.addTodo(newTodo.value));
      newTodo.value = '';
    };

    this.removeTodo = function (ev) {
      if (!ev.target.matches('.destroy')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;

      _store2.default.dispatch(todoAppActions.removeTodo(li.key));
    };

    this.toggleCompletion = function (ev) {
      if (!ev.target.matches('.toggle')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;

      _store2.default.dispatch(todoAppActions.toggleCompletion(li.key, ev.target.checked));
    };

    this.startEditing = function (ev) {
      if (!ev.target.matches('label')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;

      _store2.default.dispatch(todoAppActions.startEditing(li.key));

      li.querySelector('form input').focus();
    };

    this.stopEditing = function (ev) {
      ev.preventDefault();

      var parentNode = ev.target.parentNode;
      var nodeName = parentNode.nodeName.toLowerCase();
      var li = nodeName === 'li' ? parentNode : parentNode.parentNode;
      var editTodo = li.querySelector('.edit');
      var text = editTodo.value.trim();

      if (text) {
        _store2.default.dispatch(todoAppActions.stopEditing(key, text));
      } else {
        _store2.default.dispatch(todoAppActions.removeTodo(key));
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
      if (!ev.target.matches('.edit, .new-todo')) {
        return;
      }

      switch (ev.keyCode) {
        case 27:
          {
            var todoApp = _store2.default.getState()[_this.mount.dataset.reducer];
            var li = ev.target.parentNode.parentNode;
            var index = Array.from(li.parentNode.children).indexOf(li);

            ev.target.value = todoApp.todos.find(function (todo) {
              return todo.key === key;
            }).title;

            _this.stopEditing(ev);
            break;
          }

        case 13:
          {
            _this.addTodo(ev);
            break;
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
    this.unsubscribeStore = _store2.default.subscribe(this.render);
    this.render();
  }

  _createClass(TodoApp, [{
    key: 'animateAttached',
    value: function animateAttached(parent, element) {
      if (!element.animate) {
        return;
      }

      if (element.matches('footer.info')) {
        return new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 250 }).onfinish = resolve;
        }).then(function () {
          element.style.opacity = 1;
        });
      }

      // Animate Todo item being added.
      if (element.matches('.todo-list li, footer.info')) {
        return new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 250 }).onfinish = resolve;
        });
      }

      // Animate the entire app loading.
      if (element.matches('.todoapp')) {
        return new Promise(function (resolve) {
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

},{"../redux/actions/todo-app":10,"../redux/store":14,"./todo-list":8,"diffhtml":6,"lodash.debounce":16}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _templateObject = _taggedTemplateLiteral(['\n\t\t<li key="', '" class="', '">\n\t\t\t<div class="view">\n\t\t\t\t<input onclick=', ' class="toggle" type="checkbox" ', '>\n\t\t\t\t<label>', '</label>\n\t\t\t\t<button class="destroy"></button>\n\t\t\t</div>\n\n\t\t\t<form class="edit-todo">\n\t\t\t\t<input onblur=', ' value="', '" class="edit" />\n\t\t\t</form>\n\t\t</li>\n\t'], ['\n\t\t<li key="', '" class="', '">\n\t\t\t<div class="view">\n\t\t\t\t<input onclick=', ' class="toggle" type="checkbox" ', '>\n\t\t\t\t<label>', '</label>\n\t\t\t\t<button class="destroy"></button>\n\t\t\t</div>\n\n\t\t\t<form class="edit-todo">\n\t\t\t\t<input onblur=', ' value="', '" class="edit" />\n\t\t\t</form>\n\t\t</li>\n\t']);

exports.default = renderTodoList;

var _diffhtml = require('diffhtml');

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var stopPropagation = function stopPropagation(ev) {
	return ev.stopPropagation();
};

function renderTodoList(props) {
	return props.todos.map(function (todo) {
		return (0, _diffhtml.html)(_templateObject, todo.key, props.getTodoClassNames(todo), stopPropagation, todo.completed && 'checked', todo.title, props.stopEditing, todo.title);
	});
}

},{"diffhtml":6}],9:[function(require,module,exports){
'use strict';

var _diffhtml = require('diffhtml');

var _diffhtmlDevtools = require('diffhtml-devtools');

var _diffhtmlDevtools2 = _interopRequireDefault(_diffhtmlDevtools);

var _diffhtmlMiddlewareLogger = require('diffhtml-middleware-logger');

var _diffhtmlMiddlewareLogger2 = _interopRequireDefault(_diffhtmlMiddlewareLogger);

var _diffhtmlInlineTransitions = require('diffhtml-inline-transitions');

var _diffhtmlInlineTransitions2 = _interopRequireDefault(_diffhtmlInlineTransitions);

var _diffhtmlSyntheticEvents = require('diffhtml-synthetic-events');

var _diffhtmlSyntheticEvents2 = _interopRequireDefault(_diffhtmlSyntheticEvents);

var _diffhtmlMiddlewareVerifyState = require('diffhtml-middleware-verify-state');

var _diffhtmlMiddlewareVerifyState2 = _interopRequireDefault(_diffhtmlMiddlewareVerifyState);

var _todoApp = require('./components/todo-app');

var _todoApp2 = _interopRequireDefault(_todoApp);

var _store = require('./redux/store');

var _store2 = _interopRequireDefault(_store);

var _url = require('./redux/actions/url');

var urlActions = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _diffhtml.use)((0, _diffhtmlDevtools2.default)());
(0, _diffhtml.use)((0, _diffhtmlMiddlewareLogger2.default)());
(0, _diffhtml.use)((0, _diffhtmlMiddlewareVerifyState2.default)({ debug: true }));
(0, _diffhtml.use)((0, _diffhtmlInlineTransitions2.default)());
//use(syntheticEvents());

var setHashState = function setHashState(hash) {
  return _store2.default.dispatch(urlActions.setHashState(hash));
};

// Create the application and mount.
_todoApp2.default.create(document.querySelector('todo-app'));

// Set URL state when hash changes.
window.onhashchange = function (e) {
  return setHashState(location.hash);
};

},{"./components/todo-app":7,"./redux/actions/url":11,"./redux/store":14,"diffhtml":6,"diffhtml-devtools":1,"diffhtml-inline-transitions":2,"diffhtml-middleware-logger":4,"diffhtml-middleware-verify-state":5,"diffhtml-synthetic-events":3}],10:[function(require,module,exports){
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

function removeTodo(key) {
	return {
		type: REMOVE_TODO,
		key: key
	};
}

function toggleCompletion(key, completed) {
	return {
		type: TOGGLE_COMPLETION,
		key: key,
		completed: completed
	};
}

function startEditing(key) {
	return {
		type: START_EDITING,
		key: key
	};
}

function stopEditing(key, title) {
	return {
		type: STOP_EDITING,
		key: key,
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = todoApp;

var _todoApp = require('../actions/todo-app');

var todoAppActions = _interopRequireWildcard(_todoApp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var assign = Object.assign;

// Generates good-enough-for-a-demo keys using uuidv4.

var uuidv4 = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
var uuid = function uuid() {
	return uuidv4.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0;
		return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
	});
};

// Persists todos to localStorage and
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
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
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
						key: uuid()
					})
				});
			}

		case todoAppActions.REMOVE_TODO:
			{
				return assign({}, state, {
					todos: state.todos.filter(function (todo) {
						return todo.key !== action.key;
					})
				});
			}

		case todoAppActions.TOGGLE_COMPLETION:
			{
				var index = state.todos.findIndex(function (todo) {
					return todo.key === action.key;
				});
				var todo = state.todos[index];

				state.todos[index] = assign({}, todo, {
					completed: action.completed
				});

				return assign({}, state, {
					todos: [].concat(_toConsumableArray(state.todos))
				});
			}

		case todoAppActions.START_EDITING:
			{
				var _index = state.todos.findIndex(function (todo) {
					return todo.key === action.key;
				});
				var _todo = state.todos[_index];

				state.todos[_index] = assign({}, _todo, {
					editing: true
				});

				return assign({}, state, {
					todos: [].concat(_toConsumableArray(state.todos))
				});
			}

		case todoAppActions.STOP_EDITING:
			{
				var _index2 = state.todos.findIndex(function (todo) {
					return todo.key === action.key;
				});
				var _todo2 = state.todos[_index2];

				state.todos[_index2] = assign({}, _todo2, {
					title: action.title,
					editing: false
				});

				return assign({}, state, {
					todos: [].concat(_toConsumableArray(state.todos))
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

},{"../actions/todo-app":10}],13:[function(require,module,exports){
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
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
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

},{"../actions/url":11}],14:[function(require,module,exports){
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

},{"./reducers/todo-app":12,"./reducers/url":13,"redux":38,"redux-logger":32}],15:[function(require,module,exports){
(function (global){
/*!
 * deep-diff.
 * Licensed under the MIT License.
 */
;(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return factory();
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.DeepDiff = factory();
  }
}(this, function(undefined) {
  'use strict';

  var $scope, conflict, conflictResolution = [];
  if (typeof global === 'object' && global) {
    $scope = global;
  } else if (typeof window !== 'undefined') {
    $scope = window;
  } else {
    $scope = {};
  }
  conflict = $scope.DeepDiff;
  if (conflict) {
    conflictResolution.push(
      function() {
        if ('undefined' !== typeof conflict && $scope.DeepDiff === accumulateDiff) {
          $scope.DeepDiff = conflict;
          conflict = undefined;
        }
      });
  }

  // nodejs compatible on server side and in the browser.
  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }

  function Diff(kind, path) {
    Object.defineProperty(this, 'kind', {
      value: kind,
      enumerable: true
    });
    if (path && path.length) {
      Object.defineProperty(this, 'path', {
        value: path,
        enumerable: true
      });
    }
  }

  function DiffEdit(path, origin, value) {
    DiffEdit.super_.call(this, 'E', path);
    Object.defineProperty(this, 'lhs', {
      value: origin,
      enumerable: true
    });
    Object.defineProperty(this, 'rhs', {
      value: value,
      enumerable: true
    });
  }
  inherits(DiffEdit, Diff);

  function DiffNew(path, value) {
    DiffNew.super_.call(this, 'N', path);
    Object.defineProperty(this, 'rhs', {
      value: value,
      enumerable: true
    });
  }
  inherits(DiffNew, Diff);

  function DiffDeleted(path, value) {
    DiffDeleted.super_.call(this, 'D', path);
    Object.defineProperty(this, 'lhs', {
      value: value,
      enumerable: true
    });
  }
  inherits(DiffDeleted, Diff);

  function DiffArray(path, index, item) {
    DiffArray.super_.call(this, 'A', path);
    Object.defineProperty(this, 'index', {
      value: index,
      enumerable: true
    });
    Object.defineProperty(this, 'item', {
      value: item,
      enumerable: true
    });
  }
  inherits(DiffArray, Diff);

  function arrayRemove(arr, from, to) {
    var rest = arr.slice((to || from) + 1 || arr.length);
    arr.length = from < 0 ? arr.length + from : from;
    arr.push.apply(arr, rest);
    return arr;
  }

  function realTypeOf(subject) {
    var type = typeof subject;
    if (type !== 'object') {
      return type;
    }

    if (subject === Math) {
      return 'math';
    } else if (subject === null) {
      return 'null';
    } else if (Array.isArray(subject)) {
      return 'array';
    } else if (Object.prototype.toString.call(subject) === '[object Date]') {
      return 'date';
    } else if (typeof subject.toString !== 'undefined' && /^\/.*\//.test(subject.toString())) {
      return 'regexp';
    }
    return 'object';
  }

  function deepDiff(lhs, rhs, changes, prefilter, path, key, stack) {
    path = path || [];
    var currentPath = path.slice(0);
    if (typeof key !== 'undefined') {
      if (prefilter) {
        if (typeof(prefilter) === 'function' && prefilter(currentPath, key)) { return; }
        else if (typeof(prefilter) === 'object') {
          if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) { return; }
          if (prefilter.normalize) {
            var alt = prefilter.normalize(currentPath, key, lhs, rhs);
            if (alt) {
              lhs = alt[0];
              rhs = alt[1];
            }
          }
        }
      }
      currentPath.push(key);
    }

    // Use string comparison for regexes
    if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {
      lhs = lhs.toString();
      rhs = rhs.toString();
    }

    var ltype = typeof lhs;
    var rtype = typeof rhs;
    if (ltype === 'undefined') {
      if (rtype !== 'undefined') {
        changes(new DiffNew(currentPath, rhs));
      }
    } else if (rtype === 'undefined') {
      changes(new DiffDeleted(currentPath, lhs));
    } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {
      changes(new DiffEdit(currentPath, lhs, rhs));
    } else if (Object.prototype.toString.call(lhs) === '[object Date]' && Object.prototype.toString.call(rhs) === '[object Date]' && ((lhs - rhs) !== 0)) {
      changes(new DiffEdit(currentPath, lhs, rhs));
    } else if (ltype === 'object' && lhs !== null && rhs !== null) {
      stack = stack || [];
      if (stack.indexOf(lhs) < 0) {
        stack.push(lhs);
        if (Array.isArray(lhs)) {
          var i, len = lhs.length;
          for (i = 0; i < lhs.length; i++) {
            if (i >= rhs.length) {
              changes(new DiffArray(currentPath, i, new DiffDeleted(undefined, lhs[i])));
            } else {
              deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack);
            }
          }
          while (i < rhs.length) {
            changes(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i++])));
          }
        } else {
          var akeys = Object.keys(lhs);
          var pkeys = Object.keys(rhs);
          akeys.forEach(function(k, i) {
            var other = pkeys.indexOf(k);
            if (other >= 0) {
              deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack);
              pkeys = arrayRemove(pkeys, other);
            } else {
              deepDiff(lhs[k], undefined, changes, prefilter, currentPath, k, stack);
            }
          });
          pkeys.forEach(function(k) {
            deepDiff(undefined, rhs[k], changes, prefilter, currentPath, k, stack);
          });
        }
        stack.length = stack.length - 1;
      }
    } else if (lhs !== rhs) {
      if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
        changes(new DiffEdit(currentPath, lhs, rhs));
      }
    }
  }

  function accumulateDiff(lhs, rhs, prefilter, accum) {
    accum = accum || [];
    deepDiff(lhs, rhs,
      function(diff) {
        if (diff) {
          accum.push(diff);
        }
      },
      prefilter);
    return (accum.length) ? accum : undefined;
  }

  function applyArrayChange(arr, index, change) {
    if (change.path && change.path.length) {
      var it = arr[index],
          i, u = change.path.length - 1;
      for (i = 0; i < u; i++) {
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          applyArrayChange(it[change.path[i]], change.index, change.item);
          break;
        case 'D':
          delete it[change.path[i]];
          break;
        case 'E':
        case 'N':
          it[change.path[i]] = change.rhs;
          break;
      }
    } else {
      switch (change.kind) {
        case 'A':
          applyArrayChange(arr[index], change.index, change.item);
          break;
        case 'D':
          arr = arrayRemove(arr, index);
          break;
        case 'E':
        case 'N':
          arr[index] = change.rhs;
          break;
      }
    }
    return arr;
  }

  function applyChange(target, source, change) {
    if (target && source && change && change.kind) {
      var it = target,
          i = -1,
          last = change.path ? change.path.length - 1 : 0;
      while (++i < last) {
        if (typeof it[change.path[i]] === 'undefined') {
          it[change.path[i]] = (typeof change.path[i] === 'number') ? [] : {};
        }
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);
          break;
        case 'D':
          delete it[change.path[i]];
          break;
        case 'E':
        case 'N':
          it[change.path[i]] = change.rhs;
          break;
      }
    }
  }

  function revertArrayChange(arr, index, change) {
    if (change.path && change.path.length) {
      // the structure of the object at the index has changed...
      var it = arr[index],
          i, u = change.path.length - 1;
      for (i = 0; i < u; i++) {
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          revertArrayChange(it[change.path[i]], change.index, change.item);
          break;
        case 'D':
          it[change.path[i]] = change.lhs;
          break;
        case 'E':
          it[change.path[i]] = change.lhs;
          break;
        case 'N':
          delete it[change.path[i]];
          break;
      }
    } else {
      // the array item is different...
      switch (change.kind) {
        case 'A':
          revertArrayChange(arr[index], change.index, change.item);
          break;
        case 'D':
          arr[index] = change.lhs;
          break;
        case 'E':
          arr[index] = change.lhs;
          break;
        case 'N':
          arr = arrayRemove(arr, index);
          break;
      }
    }
    return arr;
  }

  function revertChange(target, source, change) {
    if (target && source && change && change.kind) {
      var it = target,
          i, u;
      u = change.path.length - 1;
      for (i = 0; i < u; i++) {
        if (typeof it[change.path[i]] === 'undefined') {
          it[change.path[i]] = {};
        }
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          // Array was modified...
          // it will be an array...
          revertArrayChange(it[change.path[i]], change.index, change.item);
          break;
        case 'D':
          // Item was deleted...
          it[change.path[i]] = change.lhs;
          break;
        case 'E':
          // Item was edited...
          it[change.path[i]] = change.lhs;
          break;
        case 'N':
          // Item is new...
          delete it[change.path[i]];
          break;
      }
    }
  }

  function applyDiff(target, source, filter) {
    if (target && source) {
      var onChange = function(change) {
        if (!filter || filter(target, source, change)) {
          applyChange(target, source, change);
        }
      };
      deepDiff(target, source, onChange);
    }
  }

  Object.defineProperties(accumulateDiff, {

    diff: {
      value: accumulateDiff,
      enumerable: true
    },
    observableDiff: {
      value: deepDiff,
      enumerable: true
    },
    applyDiff: {
      value: applyDiff,
      enumerable: true
    },
    applyChange: {
      value: applyChange,
      enumerable: true
    },
    revertChange: {
      value: revertChange,
      enumerable: true
    },
    isConflict: {
      value: function() {
        return 'undefined' !== typeof conflict;
      },
      enumerable: true
    },
    noConflict: {
      value: function() {
        if (conflictResolution) {
          conflictResolution.forEach(function(it) {
            it();
          });
          conflictResolution = null;
        }
        return accumulateDiff;
      },
      enumerable: true
    }
  });

  return accumulateDiff;
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

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

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],17:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":24}],18:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":17,"./_getRawTag":21,"./_objectToString":22}],19:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":23}],21:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":17}],22:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":19}],25:[function(require,module,exports){
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
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],26:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    getPrototype = require('./_getPrototype'),
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
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

},{"./_baseGetTag":18,"./_getPrototype":20,"./isObjectLike":25}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.printBuffer = printBuffer;

var _helpers = require('./helpers');

var _diff = require('./diff');

var _diff2 = _interopRequireDefault(_diff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Get log level string based on supplied params
 *
 * @param {string | function | object} level - console[level]
 * @param {object} action - selected action
 * @param {array} payload - selected payload
 * @param {string} type - log entry type
 *
 * @returns {string} level
 */
function getLogLevel(level, action, payload, type) {
  switch (typeof level === 'undefined' ? 'undefined' : _typeof(level)) {
    case 'object':
      return typeof level[type] === 'function' ? level[type].apply(level, _toConsumableArray(payload)) : level[type];
    case 'function':
      return level(action);
    default:
      return level;
  }
}

function defaultTitleFormatter(options) {
  var timestamp = options.timestamp,
      duration = options.duration;


  return function (action, time, took) {
    var parts = ['action'];

    if (timestamp) parts.push('@ ' + time);
    parts.push(String(action.type));
    if (duration) parts.push('(in ' + took.toFixed(2) + ' ms)');

    return parts.join(' ');
  };
}

function printBuffer(buffer, options) {
  var logger = options.logger,
      actionTransformer = options.actionTransformer,
      _options$titleFormatt = options.titleFormatter,
      titleFormatter = _options$titleFormatt === undefined ? defaultTitleFormatter(options) : _options$titleFormatt,
      collapsed = options.collapsed,
      colors = options.colors,
      level = options.level,
      diff = options.diff;


  buffer.forEach(function (logEntry, key) {
    var started = logEntry.started,
        startedTime = logEntry.startedTime,
        action = logEntry.action,
        prevState = logEntry.prevState,
        error = logEntry.error;
    var took = logEntry.took,
        nextState = logEntry.nextState;

    var nextEntry = buffer[key + 1];

    if (nextEntry) {
      nextState = nextEntry.prevState;
      took = nextEntry.started - started;
    }

    // Message
    var formattedAction = actionTransformer(action);
    var isCollapsed = typeof collapsed === 'function' ? collapsed(function () {
      return nextState;
    }, action, logEntry) : collapsed;

    var formattedTime = (0, _helpers.formatTime)(startedTime);
    var titleCSS = colors.title ? 'color: ' + colors.title(formattedAction) + ';' : null;
    var title = titleFormatter(formattedAction, formattedTime, took);

    // Render
    try {
      if (isCollapsed) {
        if (colors.title) logger.groupCollapsed('%c ' + title, titleCSS);else logger.groupCollapsed(title);
      } else {
        if (colors.title) logger.group('%c ' + title, titleCSS);else logger.group(title);
      }
    } catch (e) {
      logger.log(title);
    }

    var prevStateLevel = getLogLevel(level, formattedAction, [prevState], 'prevState');
    var actionLevel = getLogLevel(level, formattedAction, [formattedAction], 'action');
    var errorLevel = getLogLevel(level, formattedAction, [error, prevState], 'error');
    var nextStateLevel = getLogLevel(level, formattedAction, [nextState], 'nextState');

    if (prevStateLevel) {
      if (colors.prevState) logger[prevStateLevel]('%c prev state', 'color: ' + colors.prevState(prevState) + '; font-weight: bold', prevState);else logger[prevStateLevel]('prev state', prevState);
    }

    if (actionLevel) {
      if (colors.action) logger[actionLevel]('%c action', 'color: ' + colors.action(formattedAction) + '; font-weight: bold', formattedAction);else logger[actionLevel]('action', formattedAction);
    }

    if (error && errorLevel) {
      if (colors.error) logger[errorLevel]('%c error', 'color: ' + colors.error(error, prevState) + '; font-weight: bold', error);else logger[errorLevel]('error', error);
    }

    if (nextStateLevel) {
      if (colors.nextState) logger[nextStateLevel]('%c next state', 'color: ' + colors.nextState(nextState) + '; font-weight: bold', nextState);else logger[nextStateLevel]('next state', nextState);
    }

    if (diff) {
      (0, _diff2.default)(prevState, nextState, logger, isCollapsed);
    }

    try {
      logger.groupEnd();
    } catch (e) {
      logger.log('\u2014\u2014 log end \u2014\u2014');
    }
  });
}
},{"./diff":30,"./helpers":31}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  level: "log",
  logger: console,
  logErrors: true,
  collapsed: undefined,
  predicate: undefined,
  duration: false,
  timestamp: true,
  stateTransformer: function stateTransformer(state) {
    return state;
  },
  actionTransformer: function actionTransformer(action) {
    return action;
  },
  errorTransformer: function errorTransformer(error) {
    return error;
  },
  colors: {
    title: function title() {
      return "inherit";
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
  },
  diff: false,
  diffPredicate: undefined,

  // Deprecated options
  transformer: undefined
};
module.exports = exports["default"];
},{}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = diffLogger;

var _deepDiff = require('deep-diff');

var _deepDiff2 = _interopRequireDefault(_deepDiff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// https://github.com/flitbit/diff#differences
var dictionary = {
  'E': {
    color: '#2196F3',
    text: 'CHANGED:'
  },
  'N': {
    color: '#4CAF50',
    text: 'ADDED:'
  },
  'D': {
    color: '#F44336',
    text: 'DELETED:'
  },
  'A': {
    color: '#2196F3',
    text: 'ARRAY:'
  }
};

function style(kind) {
  return 'color: ' + dictionary[kind].color + '; font-weight: bold';
}

function render(diff) {
  var kind = diff.kind,
      path = diff.path,
      lhs = diff.lhs,
      rhs = diff.rhs,
      index = diff.index,
      item = diff.item;


  switch (kind) {
    case 'E':
      return [path.join('.'), lhs, '\u2192', rhs];
    case 'N':
      return [path.join('.'), rhs];
    case 'D':
      return [path.join('.')];
    case 'A':
      return [path.join('.') + '[' + index + ']', item];
    default:
      return [];
  }
}

function diffLogger(prevState, newState, logger, isCollapsed) {
  var diff = (0, _deepDiff2.default)(prevState, newState);

  try {
    if (isCollapsed) {
      logger.groupCollapsed('diff');
    } else {
      logger.group('diff');
    }
  } catch (e) {
    logger.log('diff');
  }

  if (diff) {
    diff.forEach(function (elem) {
      var kind = elem.kind;

      var output = render(elem);

      logger.log.apply(logger, ['%c ' + dictionary[kind].text, style(kind)].concat(_toConsumableArray(output)));
    });
  } else {
    logger.log('\u2014\u2014 no diff \u2014\u2014');
  }

  try {
    logger.groupEnd();
  } catch (e) {
    logger.log('\u2014\u2014 diff end \u2014\u2014 ');
  }
}
module.exports = exports['default'];
},{"deep-diff":15}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var repeat = exports.repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};

var pad = exports.pad = function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
};

var formatTime = exports.formatTime = function formatTime(time) {
  return pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
};

// Use performance API if it's available in order to get better precision
var timer = exports.timer = typeof performance !== "undefined" && performance !== null && typeof performance.now === "function" ? performance : Date;
},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _core = require('./core');

var _helpers = require('./helpers');

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates logger with following options
 *
 * @namespace
 * @param {object} options - options for logger
 * @param {string | function | object} options.level - console[level]
 * @param {boolean} options.duration - print duration of each action?
 * @param {boolean} options.timestamp - print timestamp with each action?
 * @param {object} options.colors - custom colors
 * @param {object} options.logger - implementation of the `console` API
 * @param {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @param {boolean} options.collapsed - is group collapsed?
 * @param {boolean} options.predicate - condition which resolves logger behavior
 * @param {function} options.stateTransformer - transform state before print
 * @param {function} options.actionTransformer - transform action before print
 * @param {function} options.errorTransformer - transform error before print
 *
 * @returns {function} logger middleware
 */
function createLogger() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var loggerOptions = _extends({}, _defaults2.default, options);

  var logger = loggerOptions.logger,
      transformer = loggerOptions.transformer,
      stateTransformer = loggerOptions.stateTransformer,
      errorTransformer = loggerOptions.errorTransformer,
      predicate = loggerOptions.predicate,
      logErrors = loggerOptions.logErrors,
      diffPredicate = loggerOptions.diffPredicate;

  // Return if 'console' object is not defined

  if (typeof logger === 'undefined') {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }

  if (transformer) {
    console.error('Option \'transformer\' is deprecated, use \'stateTransformer\' instead!'); // eslint-disable-line no-console
  }

  var logBuffer = [];

  return function (_ref) {
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        // Exit early if predicate function returns 'false'
        if (typeof predicate === 'function' && !predicate(getState, action)) {
          return next(action);
        }

        var logEntry = {};
        logBuffer.push(logEntry);

        logEntry.started = _helpers.timer.now();
        logEntry.startedTime = new Date();
        logEntry.prevState = stateTransformer(getState());
        logEntry.action = action;

        var returnedValue = void 0;
        if (logErrors) {
          try {
            returnedValue = next(action);
          } catch (e) {
            logEntry.error = errorTransformer(e);
          }
        } else {
          returnedValue = next(action);
        }

        logEntry.took = _helpers.timer.now() - logEntry.started;
        logEntry.nextState = stateTransformer(getState());

        var diff = loggerOptions.diff && typeof diffPredicate === 'function' ? diffPredicate(getState, action) : loggerOptions.diff;

        (0, _core.printBuffer)(logBuffer, _extends({}, loggerOptions, { diff: diff }));
        logBuffer.length = 0;

        if (logEntry.error) throw logEntry.error;
        return returnedValue;
      };
    };
  };
}

exports.default = createLogger;
module.exports = exports['default'];
},{"./core":28,"./defaults":29,"./helpers":31}],33:[function(require,module,exports){
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
},{"./compose":36}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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

    if ("development" !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        (0, _warning2['default'])('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  if ("development" !== 'production') {
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

    if ("development" !== 'production') {
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
},{"./createStore":37,"./utils/warning":39,"lodash/isPlainObject":26}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
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
},{"lodash/isPlainObject":26,"symbol-observable":40}],38:[function(require,module,exports){
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

if ("development" !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2['default'])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2['default'];
exports.combineReducers = _combineReducers2['default'];
exports.bindActionCreators = _bindActionCreators2['default'];
exports.applyMiddleware = _applyMiddleware2['default'];
exports.compose = _compose2['default'];
},{"./applyMiddleware":33,"./bindActionCreators":34,"./combineReducers":35,"./compose":36,"./createStore":37,"./utils/warning":39}],39:[function(require,module,exports){
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
},{}],40:[function(require,module,exports){
module.exports = require('./lib/index');

},{"./lib/index":41}],41:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = require('./ponyfill');

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root; /* global window */


if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ponyfill":42}],42:[function(require,module,exports){
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
},{}]},{},[9]);
