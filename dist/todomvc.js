(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.logger = f();
  }
})(function () {
  var define, module, exports;return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof _dereq_ == "function" && _dereq_;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof _dereq_ == "function" && _dereq_;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }({ 1: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _slicedToArray = function () {
        function sliceIterator(arr, i) {
          var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);if (i && _arr.length === i) break;
            }
          } catch (err) {
            _d = true;_e = err;
          } finally {
            try {
              if (!_n && _i["return"]) _i["return"]();
            } finally {
              if (_d) throw _e;
            }
          }return _arr;
        }return function (arr, i) {
          if (Array.isArray(arr)) {
            return arr;
          } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
          } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }
        };
      }();

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
            APPEND_CHILD: [],
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
          console.log('%cpatches %O', 'font-weight: bold; color: #333', format(patches));
        }

        // Don't clutter the output if there aren't any promises.
        if (promises && promises.length) {
          console.log('%ctransition promises %O', 'font-weight: bold; color: #333', promises);
        }
      };

      //

      exports.default = function (opts) {
        return function (transaction) {
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
    }, {}] }, {}, [1])(1);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.utils = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getValue = function getValue(vTree, i) {
  if (vTree instanceof Node && vTree.attributes) {
    return vTree.attributes[i].value || vTree[vTree.attributes[i].name];
  } else {
    return vTree.attributes[Object.keys(vTree.attributes)[i]];
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
  var NodeCache = transaction.state.internals.NodeCache;

  var debug = setupDebugger(options);

  var oldAttrKeys = Object.keys(oldTree.attributes || {});
  var newAttrKeys = Object.keys(newTree.attributes || {});

  var oldTreeIsNode = oldTree instanceof Node;
  var oldLabel = oldTreeIsNode ? 'ON DOM NODE' : 'OLD';

  if (oldTreeIsNode) {
    newTree = flattenFragments(newTree);
  }

  var oldValue = decodeEntities(oldTree.nodeValue || '').replace(/\r?\n|\r/g, '');
  var newValue = decodeEntities(newTree.nodeValue || '').replace(/\r?\n|\r/g, '');

  if (oldTree.nodeName.toLowerCase() !== newTree.nodeName.toLowerCase()) {
    debug('[Mismatched nodeName] ' + oldLabel + ': ' + oldTree.nodeName + ' NEW TREE: ' + newTree.nodeName);
  } else if (oldTree.nodeValue && newTree.nodeValue && oldValue !== newValue) {
    debug('[Mismatched nodeValue] ' + oldLabel + ': ' + oldValue + ' NEW TREE: ' + newValue);
  } else if (oldTree.nodeType !== newTree.nodeType) {
    debug('[Mismatched nodeType] ' + oldLabel + ': ' + oldTree.nodeType + ' NEW TREE: ' + newTree.nodeType);
  } else if (oldTree.childNodes.length !== newTree.childNodes.length) {
    debug('[Mismatched childNodes length] ' + oldLabel + ': ' + oldTree.childNodes.length + ' NEW TREE: ' + newTree.childNodes.length);
  }

  if (oldTreeIsNode && oldTree.attributes) {
    oldAttrKeys = [].concat(_toConsumableArray(oldTree.attributes)).map(function (s) {
      return String(s.name);
    });
  }

  if (!oldTreeIsNode && !NodeCache.has(oldTree)) {
    debug('Tree does not have an associated DOM Node');
  }

  // Look for attribute differences.
  for (var i = 0; i < oldAttrKeys.length; i++) {
    var _oldValue = getValue(oldTree, i);
    var _newValue = getValue(newTree, i);

    // If names are different report it out.
    if (oldAttrKeys[i] !== newAttrKeys[i]) {
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
};

var verifyState = function verifyState() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function () {
    return function (transaction) {
      var domNode = transaction.domNode,
          state = transaction.state;

      var oldTree = transaction.oldTree || state.oldTree;
      var newTree = transaction.newTree;

      if (oldTree && newTree) {
        compareTrees(options, transaction, oldTree, newTree);
      }

      transaction.onceEnded(function () {
        return compareTrees(options, transaction, domNode, newTree);
      });
    };
  };
};

var delay = function delay(ms) {
  return function (transaction) {
    return function () {
      return setTimeout(function () {
        return transaction.end();
      }, ms);
    };
  };
};

var _count = 0;
var take = _count = function count(transaction) {
  return ++_count >= 3 ? transaction.end() : transaction;
};

var middleware = exports.middleware = { verifyState: verifyState, delay: delay, take: take };

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
(function (global){
"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof2(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.diff = f();
  }
})(function () {
  var define, module, exports;return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof _dereq_ == "function" && _dereq_;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof _dereq_ == "function" && _dereq_;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }({ 1: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
        return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
      };

      exports.default = html;

      var _tree = _dereq_('./tree');

      var _util = _dereq_('./util');

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
        return typeof value === 'string' ? (0, _util.escape)(value) : value;
      };

      /**
       * Parses tagged template contents into a Virtual Tree. These tagged templates
       * separate static strings from values, so we need to do some special token
       * work
       *
       * @param {Array} strings - A list of static strings, split by value
       * @param {Array} ...values - A list of interpolated values
       * @return {Object|Array} - A Virtual Tree Element or array of elements
       */
      function html(strings) {
        for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          values[_key - 1] = arguments[_key];
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
          var _childNodes = (0, _util.parse)(strings[0]).childNodes;
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

            // Injected as attribute.
            if (isAttribute) {
              supplemental.attributes.push(value);
              retVal += TOKEN;
            }
            // Injected as tag.
            else if (isTag && typeof value !== 'string') {
                supplemental.tags.push(value);
                retVal += TOKEN;
              }
              // Injected as a child node.
              else if (Array.isArray(value) || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                  supplemental.children.push((0, _tree.createTree)(value));
                  retVal += TOKEN;
                }
                // Injected as something else in the markup or undefined.
                else if (value !== null && value !== undefined) {
                    retVal += (0, _util.decodeEntities)(value);
                  }
          }
        });

        // Parse the instrumented markup to get the Virtual Tree.
        var childNodes = (0, _util.parse)(retVal, supplemental).childNodes;

        // This makes it easier to work with a single element as a root, opposed to
        // always returning an array.
        return childNodes.length === 1 ? childNodes[0] : childNodes;
      }
    }, { "./tree": 17, "./util": 23 }], 2: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.use = exports.createTree = exports.release = exports.html = exports.removeTransitionState = exports.addTransitionState = undefined;

      var _transition = _dereq_('./transition');

      Object.defineProperty(exports, 'addTransitionState', {
        enumerable: true,
        get: function get() {
          return _transition.addTransitionState;
        }
      });
      Object.defineProperty(exports, 'removeTransitionState', {
        enumerable: true,
        get: function get() {
          return _transition.removeTransitionState;
        }
      });

      var _html = _dereq_('./html');

      Object.defineProperty(exports, 'html', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_html).default;
        }
      });

      var _release = _dereq_('./release');

      Object.defineProperty(exports, 'release', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_release).default;
        }
      });

      var _create = _dereq_('./tree/create');

      Object.defineProperty(exports, 'createTree', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_create).default;
        }
      });

      var _use = _dereq_('./use');

      Object.defineProperty(exports, 'use', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_use).default;
        }
      });
      exports.outerHTML = outerHTML;
      exports.innerHTML = innerHTML;

      var _transaction = _dereq_('./transaction');

      var _transaction2 = _interopRequireDefault(_transaction);

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

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
        return _transaction2.default.create(element, markup, options).start();
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
        return _transaction2.default.create(element, markup, options).start();
      }
    }, { "./html": 1, "./release": 6, "./transaction": 14, "./transition": 15, "./tree/create": 16, "./use": 19 }], 3: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _make = _dereq_('./make');

      Object.defineProperty(exports, 'makeNode', {
        enumerable: true,
        get: function get() {
          return _make.makeNode;
        }
      });

      var _patch = _dereq_('./patch');

      Object.defineProperty(exports, 'patchNode', {
        enumerable: true,
        get: function get() {
          return _patch.patchNode;
        }
      });
    }, { "./make": 4, "./patch": 5 }], 4: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.makeNode = makeNode;

      var _util = _dereq_('../util');

      var keys = Object.keys;

      /**
       * Takes in a Virtual Tree Element (VTree) and creates a DOM Node from it.
       * Sets the node into the Node cache. If this VTree already has an
       * associated node, it will reuse that.
       *
       * @param {Object} - A Virtual Tree Element or VTree-like element
       * @return {Object} - A DOM Node matching the vTree
       */

      function makeNode(vTree) {
        if (!vTree) {
          throw new Error('Missing VTree when trying to create DOM Node');
        }

        // If the DOM Node was already created, reuse the existing node.
        if (_util.NodeCache.has(vTree)) {
          return _util.NodeCache.get(vTree);
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
          domNode = document.createTextNode((0, _util.decodeEntities)(nodeValue));
        }
        // Support dynamically creating document fragments.
        else if (nodeName === '#document-fragment') {
            domNode = document.createDocumentFragment();
          }
          // If the nodeName matches any of the known SVG element names, mark it as
          // SVG. The reason for doing this over detecting if nested in an <svg>
          // element, is that we do not currently have circular dependencies in the
          // VTree, by avoiding parentNode, so there is no way to crawl up the parents.
          else if (_util.elements.indexOf(nodeName) > -1) {
              domNode = document.createElementNS(_util.namespace, nodeName);
            }
            // If not a Text or SVG Node, then create with the standard method.
            else {
                domNode = document.createElement(nodeName);
              }

        // Get an array of all the attribute names.
        var attributeNames = keys(attributes);

        // Copy all the attributes from the vTree into the newly created DOM
        // Node.
        for (var i = 0; i < attributeNames.length; i++) {
          var name = attributeNames[i];
          var value = attributes[name];
          var isString = typeof value === 'string';
          var isBoolean = typeof value === 'boolean';
          var isNumber = typeof value === 'number';

          // If not a dynamic type, set as an attribute, since it's a valid
          // attribute value.
          if (name && (isString || isBoolean || isNumber)) {
            domNode.setAttribute(name, (0, _util.decodeEntities)(value));
          } else if (name) {
            // Necessary to track the attribute/prop existence.
            domNode.setAttribute(name, '');

            // Since this is a dynamic value it gets set as a property.
            domNode[name] = value;
          }
        }

        // Add to the domNodes cache.
        _util.NodeCache.set(vTree, domNode);

        // Append all the children into the domNode, making sure to run them
        // through this `make` function as well.
        for (var _i = 0; _i < childNodes.length; _i++) {
          domNode.appendChild(makeNode(childNodes[_i]));
        }

        return domNode;
      }
    }, { "../util": 23 }], 5: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
        return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
      };

      var _slicedToArray = function () {
        function sliceIterator(arr, i) {
          var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);if (i && _arr.length === i) break;
            }
          } catch (err) {
            _d = true;_e = err;
          } finally {
            try {
              if (!_n && _i["return"]) _i["return"]();
            } finally {
              if (_d) throw _e;
            }
          }return _arr;
        }return function (arr, i) {
          if (Array.isArray(arr)) {
            return arr;
          } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
          } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }
        };
      }();

      exports.patchNode = patchNode;

      var _node = _dereq_('../node');

      var _util = _dereq_('../util');

      function patchNode(patches, state) {
        // Apply the set of patches to the Node.
        var promises = [];

        // Loop through all the patches and changesets to apply them.
        for (var i = 0; i < patches.length; i++) {
          var changeset = patches[i];

          var INSERT_BEFORE = changeset[0];
          var REMOVE_CHILD = changeset[1];
          var REPLACE_CHILD = changeset[2];
          var NODE_VALUE = changeset[3];
          var SET_ATTRIBUTE = changeset[4];
          var REMOVE_ATTRIBUTE = changeset[5];

          // Insert/append elements.
          for (var _i = 0; _i < INSERT_BEFORE.length; _i++) {
            var _INSERT_BEFORE$_i = _slicedToArray(INSERT_BEFORE[_i], 3),
                vTree = _INSERT_BEFORE$_i[0],
                childNodes = _INSERT_BEFORE$_i[1],
                referenceNode = _INSERT_BEFORE$_i[2];

            var domNode = _util.NodeCache.get(vTree);
            var fragment = document.createDocumentFragment();

            for (var _i2 = 0; _i2 < childNodes.length; _i2++) {
              var _vTree = (0, _node.makeNode)(childNodes[_i2]);
              fragment.appendChild(_vTree);
            }

            (0, _util.protectVTree)(vTree);
            domNode.insertBefore(fragment, referenceNode);
          }

          // Remove elements.
          for (var _i3 = 0; _i3 < REMOVE_CHILD.length; _i3++) {
            var _REMOVE_CHILD$_i = _slicedToArray(REMOVE_CHILD[_i3], 2),
                vTree = _REMOVE_CHILD$_i[0],
                childNode = _REMOVE_CHILD$_i[1];

            var _domNode = _util.NodeCache.get(vTree);

            _domNode.removeChild(_util.NodeCache.get(childNode));
            (0, _util.unprotectVTree)(childNode);
          }

          // Replace elements.
          for (var _i4 = 0; _i4 < REPLACE_CHILD.length; _i4++) {
            var _REPLACE_CHILD$_i = _slicedToArray(REPLACE_CHILD[_i4], 3),
                vTree = _REPLACE_CHILD$_i[0],
                newChildNode = _REPLACE_CHILD$_i[1],
                oldChildNode = _REPLACE_CHILD$_i[2];

            var _domNode2 = _util.NodeCache.get(vTree);
            var oldDomNode = _util.NodeCache.get(oldChildNode);
            var newDomNode = (0, _node.makeNode)(newChildNode);

            _domNode2.replaceChild(newDomNode, oldDomNode);
            (0, _util.protectVTree)(newChildNode);
            (0, _util.unprotectVTree)(oldChildNode);
          }

          // Change nodeValue.
          for (var _i5 = 0; _i5 < NODE_VALUE.length; _i5++) {
            var _NODE_VALUE$_i = _slicedToArray(NODE_VALUE[_i5], 2),
                vTree = _NODE_VALUE$_i[0],
                nodeValue = _NODE_VALUE$_i[1];

            var _domNode3 = _util.NodeCache.get(vTree);
            var parentNode = _domNode3.parentNode;

            _domNode3.nodeValue = nodeValue;

            if (parentNode) {
              var nodeName = parentNode.nodeName;

              if (_util.blockText.has(nodeName.toLowerCase())) {
                parentNode.nodeValue = nodeValue;
              }
            }
          }

          // Set attributes.
          for (var _i6 = 0; _i6 < SET_ATTRIBUTE.length; _i6++) {
            var _SET_ATTRIBUTE$_i = _slicedToArray(SET_ATTRIBUTE[_i6], 2),
                vTree = _SET_ATTRIBUTE$_i[0],
                attributes = _SET_ATTRIBUTE$_i[1];

            var _domNode4 = _util.NodeCache.get(vTree);

            for (var _i7 = 0; _i7 < attributes.length; _i7++) {
              var _attributes$_i = _slicedToArray(attributes[_i7], 2),
                  name = _attributes$_i[0],
                  value = _attributes$_i[1];

              var isObject = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
              var isFunction = typeof value === 'function';

              if (!isObject && !isFunction && name) {
                _domNode4.setAttribute(name, (0, _util.decodeEntities)(value));
              } else if (typeof value !== 'string') {
                // Necessary to track the attribute/prop existence.
                _domNode4.setAttribute(name, '');

                // Since this is a property value it gets set directly on the node.
                _domNode4[name] = value;
              }

              // Support live updating of the `value` and `checked` attribute.
              if (name === 'value' || name === 'checked') {
                _domNode4[name] = value;
              }
            }
          }

          // Remove attributes.
          for (var _i8 = 0; _i8 < REMOVE_ATTRIBUTE.length; _i8++) {
            var _REMOVE_ATTRIBUTE$_i = _slicedToArray(REMOVE_ATTRIBUTE[_i8], 2),
                vTree = _REMOVE_ATTRIBUTE$_i[0],
                attributes = _REMOVE_ATTRIBUTE$_i[1];

            var _domNode5 = _util.NodeCache.get(vTree);

            for (var _i9 = 0; _i9 < attributes.length; _i9++) {
              var name = attributes[_i9];

              _domNode5.removeAttribute(name);

              if (name in _domNode5) {
                _domNode5[name] = undefined;
              }
            }
          }
        }

        return promises;
      }
    }, { "../node": 3, "../util": 23 }], 6: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = release;

      var _util = _dereq_('./util');

      function release(domNode) {
        // Try and find a state object for this DOM Node.
        var state = _util.StateCache.get(domNode);

        // If there is a Virtual Tree element, recycle all objects allocated for it.
        if (state && state.oldTree) {
          (0, _util.unprotectVTree)(state.oldTree);
        }

        // Remove the DOM Node's state object from the cache.
        _util.StateCache.delete(domNode);

        // Recycle all unprotected objects.
        (0, _util.cleanMemory)();
      }
    }, { "./util": 23 }], 7: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = endAsPromise;
      // End flow, this terminates the transaction and returns a Promise that
      // resolves when completed. If you want to make diffHTML return streams or
      // callbacks replace this function.
      function endAsPromise(transaction) {
        var state = transaction.state,
            domNode = transaction.domNode,
            inner = transaction.options.inner,
            _transaction$promises = transaction.promises,
            promises = _transaction$promises === undefined ? [] : _transaction$promises;

        // Cache the markup and text for the DOM node to allow for short-circuiting
        // future render transactions.

        state.previousMarkup = domNode[inner ? 'innerHTML' : 'outerHTML'];
        state.previousText = domNode.textContent;

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
    }, {}], 8: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _schedule = _dereq_('./schedule');

      Object.defineProperty(exports, 'schedule', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_schedule).default;
        }
      });

      var _shouldUpdate = _dereq_('./should-update');

      Object.defineProperty(exports, 'shouldUpdate', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_shouldUpdate).default;
        }
      });

      var _reconcileTrees = _dereq_('./reconcile-trees');

      Object.defineProperty(exports, 'reconcileTrees', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_reconcileTrees).default;
        }
      });

      var _syncTrees = _dereq_('./sync-trees');

      Object.defineProperty(exports, 'syncTrees', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_syncTrees).default;
        }
      });

      var _patchNode = _dereq_('./patch-node');

      Object.defineProperty(exports, 'patchNode', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_patchNode).default;
        }
      });

      var _endAsPromise = _dereq_('./end-as-promise');

      Object.defineProperty(exports, 'endAsPromise', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_endAsPromise).default;
        }
      });

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
    }, { "./end-as-promise": 7, "./patch-node": 9, "./reconcile-trees": 10, "./schedule": 11, "./should-update": 12, "./sync-trees": 13 }], 9: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = patch;

      var _node = _dereq_('../node');

      var Node = _interopRequireWildcard(_node);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      /**
       * Processes a set of patches onto a tracked DOM Node.
       *
       * @param {Object} node - DOM Node to process patchs on
       * @param {Array} patches - Contains patch objects
       */
      function patch(transaction) {
        var state = transaction.state,
            measure = transaction.state.measure,
            patches = transaction.patches;

        measure('patch node');
        transaction.promises = Node.patchNode(patches, state).filter(Boolean);
        measure('patch node');
      }
    }, { "../node": 3 }], 10: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = reconcileTrees;

      var _memory = _dereq_('../util/memory');

      var _parser = _dereq_('../util/parser');

      var _tree = _dereq_('../tree');

      var isArray = Array.isArray;
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
            (0, _memory.unprotectVTree)(state.oldTree);
          }

          // Set the `oldTree` in the state as-well-as the transaction. This allows
          // it to persist with the DOM Node and also be easily available to
          // middleware and transaction tasks.
          state.oldTree = (0, _tree.createTree)(domNode);

          // We need to keep these objects around for comparisons.
          (0, _memory.protectVTree)(state.oldTree);
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
          transaction.newTree = (0, _parser.parse)(markup, null, options).childNodes;
        }

        // Only create a document fragment for inner nodes if the user didn't already
        // pass an array. If they pass an array, `createTree` will auto convert to
        // a fragment.
        else if (options.inner) {
            var _transaction$oldTree = transaction.oldTree,
                nodeName = _transaction$oldTree.nodeName,
                attributes = _transaction$oldTree.attributes;

            transaction.newTree = (0, _tree.createTree)(nodeName, attributes, markup);
          }

          // Everything else gets passed into `createTree` to be figured out.
          else {
              transaction.newTree = (0, _tree.createTree)(markup);
            }

        measure('reconcile trees');
      }
    }, { "../tree": 17, "../util/memory": 24, "../util/parser": 25 }], 11: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = schedule;

      var _caches = _dereq_('../util/caches');

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
    }, { "../util/caches": 20 }], 12: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = shouldUpdate;
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
    }, {}], 13: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = syncTrees;

      var _tree = _dereq_('../tree');

      var Tree = _interopRequireWildcard(_tree);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      function syncTrees(transaction) {
        var _transaction$state = transaction.state,
            measure = _transaction$state.measure,
            oldTree = _transaction$state.oldTree,
            newTree = transaction.newTree;

        measure('sync trees');
        transaction.patches = Tree.syncTree(oldTree, newTree);
        measure('sync trees');
      }
    }, { "../tree": 17 }], 14: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
          }
        }return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
        };
      }();

      var _util = _dereq_('./util');

      var internals = _interopRequireWildcard(_util);

      var _tasks = _dereq_('./tasks');

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

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
            // Execute each "task" serially, passing the transaction as a baton that
            // can be used to share state across the tasks.
            return tasks.reduce(function (retVal, task, index) {
              // If aborted, don't execute any more tasks.
              if (transaction.aborted) {
                return retVal;
              }

              // Continue flow, so long as there was no return value, or it matches the
              // transaction.
              if (retVal === undefined || retVal === transaction) {
                return task(transaction);
              }

              // The last `returnValue` is what gets sent to the consumer. This
              // mechanism is crucial for the `abort`, if you want to modify the "flow"
              // that's fine, but you must ensure that your last task provides a
              // mechanism to know when the transaction completes. Something like
              // callbacks or a Promise.
              return retVal;
            }, transaction);
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

            _util.MiddlewareCache.forEach(function (fn) {
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

          this.state = _util.StateCache.get(domNode) || { measure: _util.measure, internals: internals };

          this.tasks = options.tasks || [_tasks.schedule, _tasks.shouldUpdate, _tasks.reconcileTrees, _tasks.syncTrees, _tasks.patchNode, _tasks.endAsPromise];

          // Store calls to trigger after the transaction has ended.
          this._endedCallbacks = new Set();

          _util.StateCache.set(domNode, this.state);
        }

        _createClass(Transaction, [{
          key: 'start',
          value: function start() {
            Transaction.assert(this);

            var domNode = this.domNode,
                measure = this.state.measure,
                tasks = this.tasks;

            var takeLastTask = tasks.pop();

            // Add middleware in as tasks.
            Transaction.invokeMiddleware(this);

            // Shadow DOM rendering...
            if (domNode && domNode.host) {
              measure(domNode.host.constructor.name + ' render');
            } else {
              measure('render');
            }

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
            Transaction.assert(this);

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

            Transaction.assert(this);

            var state = this.state,
                domNode = this.domNode,
                options = this.options;
            var measure = state.measure;
            var inner = options.inner;

            this.completed = true;

            var renderScheduled = false;

            _util.StateCache.forEach(function (cachedState) {
              if (cachedState.isRendering && cachedState !== state) {
                renderScheduled = true;
              }
            });

            // Don't attempt to clean memory if in the middle of another render.
            if (!renderScheduled) {
              (0, _util.cleanMemory)();
            }

            measure('finalize');

            // Shadow DOM rendering...
            if (domNode && domNode.host) {
              measure(domNode.host.constructor.name + ' render');
            } else {
              measure('render');
            }

            // Trigger all `onceEnded` callbacks, so that middleware can know the
            // transaction has ended.
            this._endedCallbacks.forEach(function (callback) {
              return callback(_this);
            });
            this._endedCallbacks.clear();

            // We are no longer rendering the previous transaction so set the state to
            // `false`.
            state.isRendering = false;

            // Try and render the next transaction if one has been saved.
            Transaction.renderNext(state);
          }
        }, {
          key: 'onceEnded',
          value: function onceEnded(callback) {
            this._endedCallbacks.add(callback);
          }
        }]);

        return Transaction;
      }();

      exports.default = Transaction;
    }, { "./tasks": 8, "./util": 23 }], 15: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.addTransitionState = addTransitionState;
      exports.removeTransitionState = removeTransitionState;

      var _util = _dereq_('./util');

      // Available transition states.
      var stateNames = ['attached', 'detached', 'replaced', 'attributeChanged', 'textChanged'];

      // Sets up the states up so we can add and remove events from the sets.
      stateNames.forEach(function (stateName) {
        return _util.TransitionCache.set(stateName, new Set());
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

        _util.TransitionCache.get(stateName).add(callback);
      }

      function removeTransitionState(stateName, callback) {
        if (!callback && stateName) {
          _util.TransitionCache.get(stateName).clear();
        } else if (stateName && callback) {
          // Not a valid state name.
          if (stateNames.indexOf(stateName) === -1) {
            throw new Error('Invalid state name ' + stateName);
          }

          _util.TransitionCache.get(stateName).delete(callback);
        } else {
          for (var _stateName in stateNames) {
            if (_util.TransitionCache.has(_stateName)) {
              _util.TransitionCache.get(_stateName).clear();
            }
          }
        }
      }
    }, { "./util": 23 }], 16: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
        return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
      };

      exports.default = createTree;

      var _util = _dereq_('../util');

      var assign = Object.assign;
      var isArray = Array.isArray;
      function createTree(input, attributes, childNodes) {
        var _arguments = arguments;

        if (arguments.length === 1) {
          // If the first argument is an array, we assume this is a DOM fragment and
          // the array are the childNodes.
          if (isArray(input)) {
            return createTree('#document-fragment', input.map(function (vTree) {
              return createTree(vTree);
            }));
          }

          // Crawl an HTML or SVG Element/Text Node etc. for attributes and children.
          if (typeof Node !== 'undefined' && input instanceof Node) {
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
                  childNodes[_i] = createTree(input.childNodes[_i]);
                }
              }
            }

            var vTree = createTree(input.nodeName, attributes, childNodes);
            _util.NodeCache.set(vTree, input);
            return vTree;
          }

          // Assume any object value is a valid VTree object.
          if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object') {
            return input;
          }
        }

        // Allocate a new VTree from the pool.
        var entry = _util.Pool.get();
        var isTextNode = input === '#text';

        entry.key = '';
        entry.nodeName = String(input).toLowerCase();
        entry.rawNodeName = input;

        if (isTextNode) {
          var getValue = function getValue(attributes, childNodes) {
            var nodes = _arguments.length === 2 ? attributes : childNodes;
            return isArray(nodes) ? nodes.join('') : nodes;
          };

          var value = getValue(attributes, childNodes);

          entry.nodeType = 3;
          entry.nodeValue = (0, _util.escape)(String(value || ''));
          entry.attributes = {};
          entry.childNodes = [];

          return entry;
        }

        var getChildNodes = function getChildNodes(attributes, childNodes) {
          var nodes = null;

          if (isArray(attributes) || (typeof attributes === 'undefined' ? 'undefined' : _typeof(attributes)) !== 'object') {
            nodes = attributes;
          } else {
            nodes = childNodes;
          }

          return nodes ? [].concat(nodes).map(function (node) {
            if (typeof node === 'string') {
              return createTree('#text', node);
            }

            return node;
          }) : [];
        };

        if (input === '#document-fragment') {
          entry.nodeType = 11;
        } else if (input === '#comment') {
          entry.nodeType = 8;
        } else {
          entry.nodeType = 1;
        }

        entry.nodeValue = '';
        entry.childNodes = getChildNodes(attributes, childNodes);
        entry.attributes = {};

        if (attributes && (typeof attributes === 'undefined' ? 'undefined' : _typeof(attributes)) === 'object' && !isArray(attributes)) {
          entry.attributes = attributes;
        }

        // Set the key prop if passed as an attr.
        if (entry.attributes && entry.attributes.key) {
          entry.key = entry.attributes.key;
        }

        return entry;
      }
    }, { "../util": 23 }], 17: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _create = _dereq_('./create');

      Object.defineProperty(exports, 'createTree', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_create).default;
        }
      });

      var _sync = _dereq_('./sync');

      Object.defineProperty(exports, 'syncTree', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_sync).default;
        }
      });

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
    }, { "./create": 16, "./sync": 18 }], 18: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = syncTree;

      var _util = _dereq_('../util');

      var assign = Object.assign,
          keys = Object.keys;
      function syncTree(oldTree, newTree) {
        if (!oldTree) {
          throw new Error('Missing existing tree to sync from');
        }
        if (!newTree) {
          throw new Error('Missing new tree to sync into');
        }

        // Create new arrays for patches or use existing from a recursive call.
        var patches = arguments[2] || [];

        var changeset = Array(7).fill(null).map(function () {
          return [];
        });

        var INSERT_BEFORE = changeset[0];
        var REMOVE_CHILD = changeset[1];
        var REPLACE_CHILD = changeset[2];
        var NODE_VALUE = changeset[3];
        var SET_ATTRIBUTE = changeset[4];
        var REMOVE_ATTRIBUTE = changeset[5];

        // Immdiately push the changeset into the patches.
        patches.push(changeset);

        // If the element we're replacing is totally different from the previous
        // replace the entire element, don't bother investigating children. The
        // exception is if the `newTree` is a document fragment / shadow dom.
        if (oldTree.nodeName !== newTree.nodeName && newTree.nodeType !== 11) {
          // Shallow clone the `newTree` into the `oldTree`. We want to get the same
          // references/values inside here.
          assign(oldTree, newTree);
          REPLACE_ELEMENT.push([oldTree, newTree]);
          return patches;
        }

        // If these trees are identical references, abort early. This will occur
        // when caching static VTrees.
        if (oldTree === newTree) {
          return patches;
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
        var oldKeys = new Map();
        var newKeys = new Map();

        // Build up the key caches for each set of children.
        if (hasOldKeys && hasNewKeys) {
          // Put the old `childNode` VTree's into the key cache for lookup.
          for (var i = 0; i < oldChildNodes.length; i++) {
            var vTree = oldChildNodes[i];

            // Only add references if the key exists, otherwise ignore it. This
            // allows someone to specify a single key and keep that element around.
            if (vTree.key) {
              oldKeys.set(vTree.key, vTree);
            }
          }

          // Put the new `childNode` VTree's into the key cache for lookup.
          for (var _i = 0; _i < newChildNodes.length; _i++) {
            var _vTree = newChildNodes[_i];

            // Only add references if the key exists, otherwise ignore it. This
            // allows someone to specify a single key and keep that element around.
            if (_vTree.key) {
              newKeys.set(_vTree.key, _vTree);
            }
          }
        }

        // First check for new elements to add, this is the most common in my
        // experience.
        if (newChildNodes.length > oldChildNodes.length) {
          // Store elements in a DocumentFragment to increase performance and be
          // generally simplier to work with.
          var fragment = [];

          for (var _i2 = oldChildNodes.length; _i2 < newChildNodes.length; _i2++) {
            // Internally add to the tree.
            oldChildNodes.push(newChildNodes[_i2]);

            // Add to the document fragment.
            fragment.push(newChildNodes[_i2]);
          }

          // Assign the fragment to the patches to be injected.
          INSERT_BEFORE.push([oldTree, fragment]);
        }

        // Find elements to replace and remove.
        for (var _i3 = 0; _i3 < oldChildNodes.length; _i3++) {
          var oldChildNode = oldChildNodes[_i3];
          var newChildNode = newChildNodes[_i3];

          // If there was no new child to compare to, remove from the childNodes.
          if (!newChildNode) {
            REMOVE_CHILD.push([oldTree, oldChildNode]);
            oldTree.childNodes.splice(_i3, 1);
            _i3--;
            continue;
          }

          var isOldInNewSet = newKeys.has(oldChildNode.key);
          var isNewInOldSet = oldKeys.has(newChildNode.key);
          var keyedNewChildNode = isOldInNewSet && newKeys.get(oldChildNode.key);
          var keyedOldChildNode = isNewInOldSet && oldKeys.get(newChildNode.key);
          var hasNoKeys = !hasOldKeys && !hasNewKeys;

          if (hasNoKeys && oldChildNode.nodeName !== newChildNode.nodeName) {
            REPLACE_CHILD.push([oldTree, newChildNode, oldChildNode]);
            oldTree.childNodes.splice(_i3, 1, newChildNode);
            continue;
          }

          // If these elements are already in place, continue to the next.
          if (oldChildNode === newChildNode) {
            continue;
          }
          // If using `keys` and this node exists in the new set, and is located at
          // the same index.
          else if (newChildNodes.indexOf(keyedNewChildNode) === _i3) {
              syncTree(oldChildNode, newChildNode, patches);
            }
            // If not using `keys` but the nodeNames match, sync the trees.
            else if (oldChildNode.nodeName === newChildNode.nodeName) {
                // Do not synchronize text nodes.
                syncTree(oldChildNode, newChildNode, patches);
              }
              // Replace the remaining elements, do not traverse further.
              else {
                  // If we're using keys and we found a matching new node using the old key
                  // we can do a direct replacement.
                  if (keyedNewChildNode) {
                    var newIndex = newChildNodes.indexOf(keyedNewChildNode);
                    var prevTree = oldChildNodes[newIndex];

                    oldChildNodes[_i3] = prevTree;
                    oldChildNodes[newIndex] = oldChildNode;

                    REPLACE_CHILD.push([oldTree, oldChildNode, prevTree]);
                    continue;
                  }

                  // If we're using keys and found a matching old node using the new key
                  // we can do a direct replacement.
                  if (keyedOldChildNode) {
                    // Remove from old position.
                    oldChildNodes.splice(oldChildNodes.indexOf(keyedOldChildNode), 1);

                    var _oldChildNode = oldChildNodes[_i3];

                    // Assign to the new position.
                    oldChildNodes[_i3] = keyedOldChildNode;

                    REPLACE_CHILD.push([oldTree, keyedOldChildNode, _oldChildNode]);
                  }
                }
        }

        // If both VTrees are text nodes then copy the value over.
        if (oldTree.nodeName === '#text' && newTree.nodeName === '#text') {
          oldTree.nodeValue = newTree.nodeValue;
          NODE_VALUE.push([oldTree, (0, _util.decodeEntities)(oldTree.nodeValue)]);
          return patches;
        }

        // Attributes are significantly easier than elements and we ignore checking
        // them on fragments. The algorithm is the same as elements, check for
        // additions/removals based off length, and then iterate once to make
        // adjustments.
        if (newTree.nodeType === 1) {
          // Cache the lengths for performance and readability.
          var oldNames = keys(oldTree.attributes);
          var newNames = keys(newTree.attributes);
          var setAttributes = [];
          var removeAttributes = [];

          for (var _i4 = 0; _i4 < newNames.length; _i4++) {
            var name = newNames[_i4];
            var value = newTree.attributes[name];

            if (oldNames.indexOf(name) < 0 || oldTree.attributes[name] !== value) {
              if (name) {
                oldTree.attributes[name] = value;
                setAttributes.push([name, value]);
              }
            }
          }

          for (var _i5 = 0; _i5 < oldNames.length; _i5++) {
            var _name = oldNames[_i5];

            if (newNames.indexOf(_name) < 0) {
              delete oldTree.attributes[_name];
              removeAttributes.push(_name);
            }
          }

          if (setAttributes.length) {
            SET_ATTRIBUTE.push([oldTree, setAttributes]);
          }

          if (removeAttributes.length) {
            REMOVE_ATTRIBUTE.push([oldTree, removeAttributes]);
          }
        }

        var hasChanged = changeset.some(function (record) {
          return Boolean(record.length);
        });

        // Remove the changeset if nothing changed.
        if (!hasChanged) {
          patches.splice(patches.indexOf(changeset), 1);
        }

        return patches;
      }
    }, { "../util": 23 }], 19: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = use;

      var _util = _dereq_('./util');

      function use(middleware) {
        if (typeof middleware !== 'function') {
          throw new Error('Middleware must be a function');
        }

        // Add the function to the set of middlewares.
        _util.MiddlewareCache.add(middleware);

        // The unsubscribe method for the middleware.
        return function () {
          // Remove this middleware from the internal cache. This will prevent it
          // from being invoked in the future.
          _util.MiddlewareCache.delete(middleware);

          // Call the unsubscribe method if defined in the middleware (allows them
          // to cleanup).
          middleware.unsubscribe && middleware.unsubscribe();
        };
      }
    }, { "./util": 23 }], 20: [function (_dereq_, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      // Associates DOM Nodes with state objects.
      var StateCache = exports.StateCache = new Map();

      // Associates Virtual Tree Elements with DOM Nodes.
      var NodeCache = exports.NodeCache = new Map();

      window.NodeCache = NodeCache;

      // Caches all middleware. You cannot unset a middleware once it has been added.
      var MiddlewareCache = exports.MiddlewareCache = new Set();

      // Cache transition functions.
      var TransitionCache = exports.TransitionCache = new Map();
    }, {}], 21: [function (_dereq_, module, exports) {
      (function (global) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.default = decodeEntities;
        // Support loading diffHTML in non-browser environments.
        var element = global.document ? document.createElement('div') : null;

        /**
         * Decodes HTML strings.
         *
         * @see http://stackoverflow.com/a/5796718
         * @param string
         * @return unescaped HTML
         */
        function decodeEntities(string) {
          // If there are no HTML entities, we can safely pass the string through.
          if (!element || !string || !string.indexOf || string.indexOf('&') === -1) {
            return string;
          }

          element.innerHTML = string;
          return element.textContent;
        }
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}], 22: [function (_dereq_, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = escape;
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
    }, {}], 23: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _caches = _dereq_('./caches');

      Object.defineProperty(exports, 'StateCache', {
        enumerable: true,
        get: function get() {
          return _caches.StateCache;
        }
      });
      Object.defineProperty(exports, 'NodeCache', {
        enumerable: true,
        get: function get() {
          return _caches.NodeCache;
        }
      });
      Object.defineProperty(exports, 'MiddlewareCache', {
        enumerable: true,
        get: function get() {
          return _caches.MiddlewareCache;
        }
      });
      Object.defineProperty(exports, 'TransitionCache', {
        enumerable: true,
        get: function get() {
          return _caches.TransitionCache;
        }
      });

      var _memory = _dereq_('./memory');

      Object.defineProperty(exports, 'protectVTree', {
        enumerable: true,
        get: function get() {
          return _memory.protectVTree;
        }
      });
      Object.defineProperty(exports, 'unprotectVTree', {
        enumerable: true,
        get: function get() {
          return _memory.unprotectVTree;
        }
      });
      Object.defineProperty(exports, 'cleanMemory', {
        enumerable: true,
        get: function get() {
          return _memory.cleanMemory;
        }
      });

      var _parser = _dereq_('./parser');

      Object.defineProperty(exports, 'blockText', {
        enumerable: true,
        get: function get() {
          return _parser.blockText;
        }
      });
      Object.defineProperty(exports, 'parse', {
        enumerable: true,
        get: function get() {
          return _parser.parse;
        }
      });

      var _svg = _dereq_('./svg');

      Object.defineProperty(exports, 'namespace', {
        enumerable: true,
        get: function get() {
          return _svg.namespace;
        }
      });
      Object.defineProperty(exports, 'elements', {
        enumerable: true,
        get: function get() {
          return _svg.elements;
        }
      });

      var _transitions = _dereq_('./transitions');

      Object.defineProperty(exports, 'states', {
        enumerable: true,
        get: function get() {
          return _transitions.states;
        }
      });
      Object.defineProperty(exports, 'buildTrigger', {
        enumerable: true,
        get: function get() {
          return _transitions.buildTrigger;
        }
      });
      Object.defineProperty(exports, 'makePromises', {
        enumerable: true,
        get: function get() {
          return _transitions.makePromises;
        }
      });

      var _decodeEntities = _dereq_('./decode-entities');

      Object.defineProperty(exports, 'decodeEntities', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_decodeEntities).default;
        }
      });

      var _escape = _dereq_('./escape');

      Object.defineProperty(exports, 'escape', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_escape).default;
        }
      });

      var _performance = _dereq_('./performance');

      Object.defineProperty(exports, 'measure', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_performance).default;
        }
      });

      var _pool = _dereq_('./pool');

      Object.defineProperty(exports, 'Pool', {
        enumerable: true,
        get: function get() {
          return _interopRequireDefault(_pool).default;
        }
      });

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
    }, { "./caches": 20, "./decode-entities": 21, "./escape": 22, "./memory": 24, "./parser": 25, "./performance": 26, "./pool": 27, "./svg": 28, "./transitions": 29 }], 24: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.protectVTree = protectVTree;
      exports.unprotectVTree = unprotectVTree;
      exports.cleanMemory = cleanMemory;

      var _pool = _dereq_('./pool');

      var _pool2 = _interopRequireDefault(_pool);

      var _caches = _dereq_('./caches');

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      var memory = _pool2.default.memory,
          protect = _pool2.default.protect,
          unprotect = _pool2.default.unprotect;

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

        _caches.NodeCache.delete(vTree);
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
        _caches.NodeCache.forEach(function (node, descriptor) {
          if (!memory.protected.has(descriptor)) {
            _caches.NodeCache.delete(descriptor);
          }
        });
      }
    }, { "./caches": 20, "./pool": 27 }], 25: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.blockText = undefined;
      exports.parse = parse;

      var _tree = _dereq_('../tree');

      var _pool = _dereq_('./pool');

      var _pool2 = _interopRequireDefault(_pool);

      var _escape = _dereq_('./escape');

      var _escape2 = _interopRequireDefault(_escape);

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      // This is a very special word in the diffHTML parser. It is the only way it
      // can gain access to dynamic content.
      var TOKEN = '__DIFFHTML__'; // Code based off of:
      // https://github.com/ashi009/node-fast-html-parser

      var hasNonWhitespaceEx = /\S/;
      var doctypeEx = /<!.*>/ig;
      var attrEx = /\b([_a-z][_a-z0-9\-]*)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;
      var spaceEx = /[^ ]/;

      var assign = Object.assign;

      // We use this Set in the node/patch module so marking it exported.

      var blockText = exports.blockText = new Set(['script', 'noscript', 'style', 'code', 'template']);

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

      /**
       * Interpolate dynamic supplemental values from the tagged template into the
       * tree.
       *
       * @param currentParent
       * @param string
       * @param supplemental
       */
      var interpolateValues = function interpolateValues(currentParent, string, supplemental) {
        if (string && string.indexOf(TOKEN) > -1) {
          (function () {
            var childNodes = [];

            // Break up the incoming string into dynamic parts that are then pushed
            // into a new set of child nodes.
            string.split(TOKEN).forEach(function (value, index, array) {
              // If the first text node has relevant text, put it in, otherwise
              // discard. This mimicks how the browser works and is generally easier
              // to work with (when using tagged template tags).
              if (value && hasNonWhitespaceEx.test(value)) {
                childNodes.push((0, _tree.createTree)('#text', value));
              }

              // If we are in the second iteration, this means the whitespace has been
              // trimmed and we can pull out dynamic interpolated values. We do not
              // want to grab a childNode by accident for the last one.
              if (index !== array.length - 1) {
                childNodes.push(supplemental.children.shift());
              }
            });

            currentParent.childNodes.push.apply(currentParent.childNodes, childNodes);
          })();
        } else if (string && string.length && !doctypeEx.exec(string)) {
          currentParent.childNodes.push((0, _tree.createTree)('#text', string));
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

        return (0, _tree.createTree)(nodeName, attributes, []);
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

        var root = (0, _tree.createTree)('#document-fragment', null, []);
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
              // if has content
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
              var headInstance = (0, _tree.createTree)('head', null, []);
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
              var bodyInstance = (0, _tree.createTree)('body', null, []);
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
    }, { "../tree": 17, "./escape": 22, "./pool": 27 }], 26: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = measure;
      var marks = exports.marks = new Map();
      var prefix = exports.prefix = 'diffHTML';

      var wantsPerfChecks = location.search.includes('diff_perf');

      function measure(name) {
        if (!wantsPerfChecks) {
          return;
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
      }
    }, {}], 27: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      // A modest size.
      var size = 10000;

      /**
       * Creates a pool to query new or reused values from.
       *
       * @param name
       * @param opts
       * @return {Object} pool
       */
      var memory = {
        free: new Set(),
        allocated: new Set(),
        protected: new Set()
      };

      // Prime the memory cache with n objects.
      for (var i = 0; i < size; i++) {
        memory.free.add({
          rawNodeName: '',
          nodeName: '',
          nodeValue: '',
          nodeType: 1,
          key: '',
          childNodes: null,
          attributes: null
        });
      }

      // Cache VTree objects in a pool which is used to get
      exports.default = {
        size: size,
        memory: memory,

        get: function get() {
          var value = memory.free.values().next().value || fill();
          memory.free.delete(value);
          memory.allocated.add(value);
          return value;
        },
        protect: function protect(value) {
          memory.allocated.delete(value);
          memory.protected.add(value);
        },
        unprotect: function unprotect(value) {
          if (memory.protected.has(value)) {
            memory.protected.delete(value);
            memory.free.add(value);
          }
        }
      };
    }, {}], 28: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      // Namespace.
      var namespace = exports.namespace = 'http://www.w3.org/2000/svg';

      // List of SVG elements.
      var elements = exports.elements = ['altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'svg', 'switch', 'symbol', 'text', 'textPath', 'tref', 'tspan', 'use', 'view', 'vkern'];
    }, {}], 29: [function (_dereq_, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.buildTrigger = buildTrigger;
      exports.makePromises = makePromises;
      var forEach = Array.prototype.forEach;

      /**
       * Contains arrays to store transition callbacks.
       *
       * attached
       * --------
       *
       * For when elements come into the DOM. The callback triggers immediately after
       * the element enters the DOM. It is called with the element as the only
       * argument.
       *
       * detached
       * --------
       *
       * For when elements are removed from the DOM. The callback triggers just
       * before the element leaves the DOM. It is called with the element as the only
       * argument.
       *
       * replaced
       * --------
       *
       * For when elements are replaced in the DOM. The callback triggers after the
       * new element enters the DOM, and before the old element leaves. It is called
       * with old and new elements as arguments, in that order.
       *
       * attributeChanged
       * ----------------
       *
       * Triggered when an element's attribute has changed. The callback triggers
       * after the attribute has changed in the DOM. It is called with the element,
       * the attribute name, old value, and current value.
       *
       * textChanged
       * -----------
       *
       * Triggered when an element's `textContent` chnages. The callback triggers
       * after the textContent has changed in the DOM. It is called with the element,
       * the old value, and current value.
       */
      var states = exports.states = {
        attached: [],
        detached: [],
        replaced: [],
        attributeChanged: [],
        textChanged: []
      };

      // Define the custom signatures necessary for the loop to fill in the "magic"
      // methods that process the transitions consistently.
      var fnSignatures = {
        attached: function attached(el) {
          return function (cb) {
            return cb(el);
          };
        },
        detached: function detached(el) {
          return function (cb) {
            return cb(el);
          };
        },
        replaced: function replaced(oldEl, newEl) {
          return function (cb) {
            return cb(oldEl, newEl);
          };
        },
        textChanged: function textChanged(el, oldVal, newVal) {
          return function (cb) {
            return cb(el, oldVal, newVal);
          };
        },
        attributeChanged: function attributeChanged(el, name, oldVal, newVal) {
          return function (cb) {
            return cb(el, name, oldVal, newVal);
          };
        }
      };

      var make = {};

      // Dynamically fill in the custom methods instead of manually constructing
      // them.
      Object.keys(states).forEach(function (stateName) {
        var mapFn = fnSignatures[stateName];

        /**
         * Make's the transition promises.
         *
         * @param elements
         * @param args
         * @param promises
         */
        make[stateName] = function makeTransitionPromises(elements, args, promises) {
          // Sometimes an array-like is passed so using forEach in this manner yields
          // more consistent results.
          forEach.call(elements, function (element) {
            // Never pass text nodes to a state callback unless it is textChanged.
            if (stateName !== 'textChanged' && element.nodeType !== 1) {
              return;
            }

            // Call the map function with each element.
            var newPromises = states[stateName].map(mapFn.apply(null, [element].concat(args)));

            // Merge these Promises into the main cache.
            promises.push.apply(promises, newPromises);

            // Recursively call into the children if attached or detached.
            if (stateName === 'attached' || stateName === 'detached') {
              make[stateName](element.childNodes, args, promises);
            }
          });

          return promises.filter(function (promise) {
            return Boolean(promise && promise.then);
          });
        };
      });

      /**
       * Builds a reusable trigger mechanism for the element transitions.
       *
       * @param allPromises
       */
      function buildTrigger(allPromises) {
        var addPromises = allPromises.push.apply.bind(allPromises.push, allPromises);

        // This becomes `triggerTransition` in process.js.
        return function (stateName, makePromisesCallback, callback) {
          if (states[stateName] && states[stateName].length) {
            // Calls into each custom hook to bind Promises into the local array,
            // these will then get merged into the main `allPromises` array.
            var promises = makePromisesCallback([]);

            // Add these promises into the global cache.
            addPromises(promises);

            if (callback) {
              callback(promises.length ? promises : undefined);
            }
          } else if (callback) {
            callback();
          }
        };
      }

      /**
       * Make a reusable function for easy transition calling.
       *
       * @param stateName
       */
      function makePromises(stateName) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        // Ensure elements is always an array.
        var elements = [].concat(args[0]);

        // Accepts the local Array of promises to use.
        return function (promises) {
          return make[stateName](elements, args.slice(1), promises);
        };
      }
    }, {}] }, {}, [2])(2);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n      <section class="todoapp"\n        attached=', '\n        detached=', '\n        onsubmit=', '\n        onclick=', '\n        onkeydown=', '\n        ondblclick=', '\n        onchange=', '>\n\n        <header class="header">\n          <h1>todos</h1>\n\n          <form class="add-todo">\n            <input\n              class="new-todo"\n              placeholder="What needs to be done?"\n              autofocus="">\n          </form>\n        </header>\n\n        ', '\n      </section>\n\n      ', '\n    '], ['\n      <section class="todoapp"\n        attached=', '\n        detached=', '\n        onsubmit=', '\n        onclick=', '\n        onkeydown=', '\n        ondblclick=', '\n        onchange=', '>\n\n        <header class="header">\n          <h1>todos</h1>\n\n          <form class="add-todo">\n            <input\n              class="new-todo"\n              placeholder="What needs to be done?"\n              autofocus="">\n          </form>\n        </header>\n\n        ', '\n      </section>\n\n      ', '\n    ']),
    _templateObject2 = _taggedTemplateLiteral(['\n          <section class="main">\n            <input class="toggle-all" type="checkbox" ', '>\n\n            <ul class="todo-list">', '</ul>\n          </section>\n\n          <footer class="footer">\n            <span class="todo-count">\n              <strong>', '</strong>\n              ', ' left\n            </span>\n\n            <ul class="filters">\n              <li>\n                <a href="#/" class=', '>\n                  All\n                </a>\n              </li>\n              <li>\n                <a href="#/active" class=', '>\n                  Active\n                </a>\n              </li>\n              <li>\n                <a href="#/completed" class=', '>\n                  Completed\n                </a>\n              </li>\n            </ul>\n\n            ', '\n          </footer>\n        '], ['\n          <section class="main">\n            <input class="toggle-all" type="checkbox" ', '>\n\n            <ul class="todo-list">', '</ul>\n          </section>\n\n          <footer class="footer">\n            <span class="todo-count">\n              <strong>', '</strong>\n              ', ' left\n            </span>\n\n            <ul class="filters">\n              <li>\n                <a href="#/" class=', '>\n                  All\n                </a>\n              </li>\n              <li>\n                <a href="#/active" class=', '>\n                  Active\n                </a>\n              </li>\n              <li>\n                <a href="#/completed" class=', '>\n                  Completed\n                </a>\n              </li>\n            </ul>\n\n            ', '\n          </footer>\n        ']),
    _templateObject3 = _taggedTemplateLiteral(['\n              <button class="clear-completed" onclick=', '>\n                Clear completed\n              </button>\n            '], ['\n              <button class="clear-completed" onclick=', '>\n                Clear completed\n              </button>\n            ']);

var _diffhtml = _dereq_('diffhtml');

var _store = _dereq_('../redux/store');

var _store2 = _interopRequireDefault(_store);

var _todoApp = _dereq_('../redux/actions/todo-app');

var todoAppActions = _interopRequireWildcard(_todoApp);

var _todoList = _dereq_('./todo-list');

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

      (0, _diffhtml.innerHTML)(this.mount, (0, _diffhtml.html)(_templateObject, this.animateAttached, this.animateDetached, this.onSubmitHandler.bind(this), this.onClickHandler.bind(this), this.handleKeyDown.bind(this), this.startEditing.bind(this), this.toggleCompletion.bind(this), allTodos.length ? (0, _diffhtml.html)(_templateObject2, this.setCheckedState(), _todoList2.default.call(this, {
        stopEditing: this.stopEditing.bind(this),
        todos: todos
      }), activeTodos.length, activeTodos.length == 1 ? 'item' : 'items', this.getNavClass('/'), this.getNavClass('/active'), this.getNavClass('/completed'), completedTodos.length ? (0, _diffhtml.html)(_templateObject3, this.clearCompleted.bind(this)) : '') : '', this.existingFooter));
    }
  }], [{
    key: 'mount',
    value: function mount(domNode) {
      return new TodoApp(domNode);
    }
  }]);

  function TodoApp(mount) {
    var _this = this;

    _classCallCheck(this, TodoApp);

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
  }, {
    key: 'addTodo',
    value: function addTodo(ev) {
      if (!ev.target.matches('.add-todo')) {
        return;
      }

      ev.preventDefault();

      var newTodo = ev.target.querySelector('.new-todo');
      _store2.default.dispatch(todoAppActions.addTodo(newTodo.value));
      newTodo.value = '';
    }
  }, {
    key: 'removeTodo',
    value: function removeTodo(ev) {
      if (!ev.target.matches('.destroy')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      _store2.default.dispatch(todoAppActions.removeTodo(index));
    }
  }, {
    key: 'toggleCompletion',
    value: function toggleCompletion(ev) {
      if (!ev.target.matches('.toggle')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      _store2.default.dispatch(todoAppActions.toggleCompletion(index, ev.target.checked));
    }
  }, {
    key: 'startEditing',
    value: function startEditing(ev) {
      if (!ev.target.matches('label')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      _store2.default.dispatch(todoAppActions.startEditing(index));

      li.querySelector('form input').focus();
    }
  }, {
    key: 'stopEditing',
    value: function stopEditing(ev) {
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
    }
  }, {
    key: 'clearCompleted',
    value: function clearCompleted(ev) {
      if (!ev.target.matches('.clear-completed')) {
        return;
      }

      _store2.default.dispatch(todoAppActions.clearCompleted());
    }
  }, {
    key: 'toggleAll',
    value: function toggleAll(ev) {
      if (!ev.target.matches('.toggle-all')) {
        return;
      }

      _store2.default.dispatch(todoAppActions.toggleAll(ev.target.checked));
    }
  }, {
    key: 'handleKeyDown',
    value: function handleKeyDown(ev) {
      if (!ev.target.matches('.edit')) {
        return;
      }

      var todoApp = _store2.default.getState()[this.mount.dataset.reducer];

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      switch (ev.keyCode) {
        case 27:
          {
            ev.target.value = todoApp.todos[index].title;
            this.stopEditing(ev);
          }
      }
    }
  }, {
    key: 'getTodoClassNames',
    value: function getTodoClassNames(todo) {
      return [todo.completed ? 'completed' : '', todo.editing ? 'editing' : ''].filter(Boolean).join(' ');
    }
  }, {
    key: 'setCheckedState',
    value: function setCheckedState() {
      var todoApp = _store2.default.getState()[this.mount.dataset.reducer];
      var notChecked = todoApp.todos.filter(function (todo) {
        return !todo.completed;
      }).length;

      return notChecked ? '' : 'checked';
    }
  }, {
    key: 'onSubmitHandler',
    value: function onSubmitHandler(ev) {
      ev.preventDefault();

      if (ev.target.matches('.add-todo')) {
        this.addTodo(ev);
      } else if (ev.target.matches('.edit-todo')) {
        this.stopEditing(ev);
      }
    }
  }, {
    key: 'onClickHandler',
    value: function onClickHandler(ev) {
      if (ev.target.matches('.destroy')) {
        this.removeTodo(ev);
      } else if (ev.target.matches('.toggle-all')) {
        this.toggleAll(ev);
      } else if (ev.target.matches('.clear-completed')) {
        this.clearCompleted(ev);
      }
    }
  }, {
    key: 'getNavClass',
    value: function getNavClass(name) {
      var state = _store2.default.getState();
      var path = state.url.path;

      return path === name ? 'selected' : undefined;
    }
  }]);

  return TodoApp;
}();

exports.default = TodoApp;

},{"../redux/actions/todo-app":7,"../redux/store":11,"./todo-list":5,"diffhtml":3}],5:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _templateObject = _taggedTemplateLiteral(['\n\t\t<li key="', '" class="', '">\n\t\t\t<div class="view">\n\t\t\t\t<input class="toggle" type="checkbox" ', '>\n\t\t\t\t<label>', '</label>\n\t\t\t\t<button class="destroy"></button>\n\t\t\t</div>\n\n\t\t\t<form class="edit-todo">\n\t\t\t\t<input\n\t\t\t\t\tonblur=', '\n\t\t\t\t\tvalue="', '"\n\t\t\t\t\tclass="edit">\n\t\t\t</form>\n\t\t</li>\n\t'], ['\n\t\t<li key="', '" class="', '">\n\t\t\t<div class="view">\n\t\t\t\t<input class="toggle" type="checkbox" ', '>\n\t\t\t\t<label>', '</label>\n\t\t\t\t<button class="destroy"></button>\n\t\t\t</div>\n\n\t\t\t<form class="edit-todo">\n\t\t\t\t<input\n\t\t\t\t\tonblur=', '\n\t\t\t\t\tvalue="', '"\n\t\t\t\t\tclass="edit">\n\t\t\t</form>\n\t\t</li>\n\t']);

exports.default = renderTodoList;

var _diffhtml = _dereq_('diffhtml');

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function renderTodoList(props) {
	var _this = this;

	return props.todos.map(function (todo) {
		return (0, _diffhtml.html)(_templateObject, todo.key, _this.getTodoClassNames(todo), todo.completed ? 'checked' : '', todo.title, props.stopEditing, todo.title);
	});
}

},{"diffhtml":3}],6:[function(_dereq_,module,exports){
'use strict';

var _diffhtml = _dereq_('diffhtml');

var _diffhtmlInlineTransitions = _dereq_('diffhtml-inline-transitions');

var _diffhtmlInlineTransitions2 = _interopRequireDefault(_diffhtmlInlineTransitions);

var _diffhtmlLogger = _dereq_('diffhtml-logger');

var _diffhtmlLogger2 = _interopRequireDefault(_diffhtmlLogger);

var _diffhtmlUtils = _dereq_('diffhtml-utils');

var _todoApp = _dereq_('./components/todo-app');

var _todoApp2 = _interopRequireDefault(_todoApp);

var _store = _dereq_('./redux/store');

var _store2 = _interopRequireDefault(_store);

var _url = _dereq_('./redux/actions/url');

var urlActions = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Add diffHTML middleware.
(0, _diffhtml.use)((0, _diffhtmlLogger2.default)());
(0, _diffhtml.use)((0, _diffhtmlInlineTransitions2.default)({ addTransitionState: _diffhtml.addTransitionState, removeTransitionState: _diffhtml.removeTransitionState }));
(0, _diffhtml.use)(_diffhtmlUtils.middleware.verifyState({ debug: location.search.includes('debug') }));

// Create the application and mount.
_todoApp2.default.mount(document.querySelector('todo-app'));

// Sets the hash state
var setHashState = function setHashState(hash) {
  return _store2.default.dispatch(urlActions.setHashState(hash));
};

// Set URL state.
setHashState(location.hash);

// Set URL state when hash changes.
window.onhashchange = function (e) {
  return setHashState(location.hash);
};

},{"./components/todo-app":4,"./redux/actions/url":8,"./redux/store":11,"diffhtml":3,"diffhtml-inline-transitions":12,"diffhtml-logger":1,"diffhtml-utils":2}],7:[function(_dereq_,module,exports){
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

},{}],8:[function(_dereq_,module,exports){
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

},{}],9:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = todoApp;

var _todoApp = _dereq_('../actions/todo-app');

var todoAppActions = _interopRequireWildcard(_todoApp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

				return Object.assign({}, state, {
					todos: state.todos.concat({
						completed: false,
						editing: false,

						title: action.title.trim(),
						key: Date.now() + state.todos.length
					})
				});
			}

		case todoAppActions.REMOVE_TODO:
			{
				state.todos.splice(action.index, 1);

				return Object.assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.TOGGLE_COMPLETION:
			{
				var todo = state.todos[action.index];

				state.todos[action.index] = Object.assign({}, todo, {
					completed: action.completed
				});

				return Object.assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.START_EDITING:
			{
				var _todo = state.todos[action.index];

				state.todos[action.index] = Object.assign({}, _todo, {
					editing: true
				});

				return Object.assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.STOP_EDITING:
			{
				var _todo2 = state.todos[action.index];

				state.todos[action.index] = Object.assign({}, _todo2, {
					title: action.title,
					editing: false
				});

				return Object.assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.CLEAR_COMPLETED:
			{
				return Object.assign({}, state, {
					todos: state.todos.filter(function (todo) {
						return todo.completed === false;
					})
				});
			}

		case todoAppActions.TOGGLE_ALL:
			{
				return Object.assign({}, state, {
					todos: state.todos.map(function (todo) {
						return Object.assign({}, todo, {
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

},{"../actions/todo-app":7}],10:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = url;

var _url = _dereq_('../actions/url');

var urlActions = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var initialState = {
	path: location.hash.slice(1) || '/'
};

function url() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	var action = arguments[1];

	switch (action.type) {
		case urlActions.SET_HASH_STATE:
			{
				return Object.assign({}, state, {
					path: action.path
				});
			}

		default:
			{
				return state;
			}
	}
}

},{"../actions/url":8}],11:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _redux = _dereq_('redux');

var _reduxLogger = _dereq_('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _todoApp = _dereq_('./reducers/todo-app');

var _todoApp2 = _interopRequireDefault(_todoApp);

var _url = _dereq_('./reducers/url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Makes a reusable function to create a store. Currently not exported, but
// could be in the future for testing purposes.
var createStoreWithMiddleware = (0, _redux.compose)(
// Adds in store middleware, such as async thunk and logging.
//applyMiddleware(createLogger()),

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

},{"./reducers/todo-app":9,"./reducers/url":10,"redux":24,"redux-logger":18}],12:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.inlineTransitions = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
module.exports = function (_ref) {
  var addTransitionState = _ref.addTransitionState;
  var removeTransitionState = _ref.removeTransitionState;

  var attached = function attached(element) {
    if (element.attached) {
      return element.attached(element, element);
    }
  };

  // Monitors whenever an element changes an attribute, if the attribute
  // is a valid state name, add this element into the related Set.
  var attributeChanged = function attributeChanged(element, name, oldVal, newVal) {
    var map = transitionsMap[name];

    // Abort early if not a valid transition or if the new value exists, but
    // isn't a function.
    if (!map || newVal && typeof newVal !== 'function') {
      return;
    }

    // Add or remove based on the value existence and type.
    map[typeof newVal === 'function' ? 'set' : 'delete'](element, newVal);
  };

  // This will unbind any internally bound transition states.
  var unsubscribe = function unsubscribe() {
    // Unbind all the transition states.
    removeTransitionState('attached', attached);
    removeTransitionState('attributeChanged', attributeChanged);

    // Remove all elements from the internal cache.
    Object.keys(transitionsMap).forEach(function (name) {
      var map = transitionsMap[name];

      // Unbind the associated global handler.
      removeTransitionState(name, boundHandlers.shift());

      // Empty the associated element set.
      map.clear();
    });

    // Empty the bound handlers.
    boundHandlers.length = 0;
  };

  // If this function gets repeatedly called, unbind the previous to avoid
  // doubling up.
  unsubscribe();

  // Set a "global" `attributeChanged` to monitor all elements for transition
  // states being attached.
  addTransitionState('attached', attached);
  addTransitionState('attributeChanged', attributeChanged);

  // Add a transition for every type.
  Object.keys(transitionsMap).forEach(function (name) {
    var map = transitionsMap[name];

    var handler = function handler(child) {
      for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
      }

      // If there are no elements to match here, abort.
      if (!map.size) {
        return;
      }
      // If the child element triggered in the transition is the root element,
      // this is an easy lookup for the handler.
      else if (map.has(child)) {
          // Attached is handled special by the separate global attached handler.
          if (name !== 'attached') {
            return map.get(child).apply(child, [child].concat(rest));
          }
        }
        // The last resort is looping through all the registered elements to see
        // if the child is contained within. If so, it aggregates all the valid
        // handlers and if they return Promises return them into a `Promise.all`.
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

  return unsubscribe;
};

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(_dereq_,module,exports){
var overArg = _dereq_('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":15}],14:[function(_dereq_,module,exports){
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

},{}],15:[function(_dereq_,module,exports){
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

},{}],16:[function(_dereq_,module,exports){
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

},{}],17:[function(_dereq_,module,exports){
var getPrototype = _dereq_('./_getPrototype'),
    isHostObject = _dereq_('./_isHostObject'),
    isObjectLike = _dereq_('./isObjectLike');

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

},{"./_getPrototype":13,"./_isHostObject":14,"./isObjectLike":16}],18:[function(_dereq_,module,exports){
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
},{}],19:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports["default"] = applyMiddleware;

var _compose = _dereq_('./compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
    return function (reducer, initialState, enhancer) {
      var store = createStore(reducer, initialState, enhancer);
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
      _dispatch = _compose2["default"].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":22}],20:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = bindActionCreators;
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
},{}],21:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = combineReducers;

var _createStore = _dereq_('./createStore');

var _isPlainObject = _dereq_('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = _dereq_('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2["default"])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key);
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
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

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
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action);
      if (warningMessage) {
        (0, _warning2["default"])(warningMessage);
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
},{"./createStore":23,"./utils/warning":25,"lodash/isPlainObject":17}],22:[function(_dereq_,module,exports){
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
  } else {
    var _ret = function () {
      var last = funcs[funcs.length - 1];
      var rest = funcs.slice(0, -1);
      return {
        v: function v() {
          return rest.reduceRight(function (composed, f) {
            return f(composed);
          }, last.apply(undefined, arguments));
        }
      };
    }();

    if (typeof _ret === "object") return _ret.v;
  }
}
},{}],23:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports["default"] = createStore;

var _isPlainObject = _dereq_('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _symbolObservable = _dereq_('symbol-observable');

var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
 * @param {any} [initialState] The initial state. You may optionally specify it
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
function createStore(reducer, initialState, enhancer) {
  var _ref2;

  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
    enhancer = initialState;
    initialState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, initialState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = initialState;
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
    if (!(0, _isPlainObject2["default"])(action)) {
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
    }, _ref[_symbolObservable2["default"]] = function () {
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
  }, _ref2[_symbolObservable2["default"]] = observable, _ref2;
}
},{"lodash/isPlainObject":17,"symbol-observable":26}],24:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = _dereq_('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = _dereq_('./combineReducers');

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = _dereq_('./bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = _dereq_('./applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = _dereq_('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = _dereq_('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if ("development" !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2["default"];
exports.combineReducers = _combineReducers2["default"];
exports.bindActionCreators = _bindActionCreators2["default"];
exports.applyMiddleware = _applyMiddleware2["default"];
exports.compose = _compose2["default"];
},{"./applyMiddleware":19,"./bindActionCreators":20,"./combineReducers":21,"./compose":22,"./createStore":23,"./utils/warning":25}],25:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = warning;
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
},{}],26:[function(_dereq_,module,exports){
(function (global){
/* global window */
'use strict';

module.exports = _dereq_('./ponyfill')(global || window || this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ponyfill":27}],27:[function(_dereq_,module,exports){
'use strict';

module.exports = function symbolObservablePonyfill(root) {
	var result;
	var Symbol = root.Symbol;

	if (typeof Symbol === 'function') {
		if (Symbol.observable) {
			result = Symbol.observable;
		} else {
			result = Symbol('observable');
			Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};

},{}]},{},[6]);
