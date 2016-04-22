(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.diff = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upgrade = upgrade;
/**
 * Store all Custom Element definitions in this object. The tagName is the key.
 *
 * @public
 */
var components = exports.components = {};

/**
 * Ensures the element instance matches the CustomElement's prototype.
 *
 * @param nodeName - The HTML nodeName to use for the Custom Element
 * @param element - The element to upgrade
 * @param descriptor - The virtual node backing the element
 * @return {Boolean} successfully upgraded
 */
function upgrade(nodeName, element, descriptor) {
  // Value of the `is` attribute, if it exists.
  var isAttr = null;

  // Check for the `is` attribute. It has a known bug where it cannot be
  // applied dynamically.
  if (!components[nodeName] && Array.isArray(descriptor.attributes)) {
    descriptor.attributes.some(function (attr, idx) {
      if (attr.name === 'is') {
        isAttr = attr.value;
        return true;
      }
    });
  }

  // Hack around the `is` attribute being unable to be set dynamically.
  if (isAttr && components[isAttr]) {
    nodeName = isAttr;
  }

  var CustomElement = components[nodeName];

  if (!CustomElement) {
    return false;
  }

  if (CustomElement.extends && CustomElement.extends !== descriptor.nodeName) {
    return false;
  }

  // If no Custom Element was registered, bail early. Don't need to upgrade
  // if the element was already processed..
  if (typeof CustomElement === 'function' && element instanceof CustomElement) {
    return false;
  }

  // Copy the prototype into the Element.
  element.__proto__ = Object.create(CustomElement.prototype);

  // Custom elements have a createdCallback method that should be called.
  if (CustomElement.prototype.createdCallback) {
    CustomElement.prototype.createdCallback.call(element);
  }

  // Is the element existing in the DOM?
  var inDOM = element.ownerDocument.contains(element);

  // If the Node is in the DOM, trigger attached callback.
  if (inDOM && CustomElement.prototype.attachedCallback) {
    element.attachedCallback();
  }

  // The upgrade was successful.
  return true;
}

},{}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = get;

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

var _make3 = _dereq_('../element/make');

var _make4 = _interopRequireDefault(_make3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes in an element descriptor and resolve it to a uuid and DOM Node.
 *
 * @param descriptor - Element descriptor
 * @return {Object} containing the uuid and DOM node
 */
function get(descriptor) {
  var uuid = descriptor.uuid;
  var element = (0, _make4.default)(descriptor);

  return { uuid: uuid, element: element };
}

},{"../element/make":3,"../node/make":6}],3:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = make;

var _svg = _dereq_('../svg');

var svg = _interopRequireWildcard(_svg);

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

var _custom = _dereq_('./custom');

var _entities = _dereq_('../util/entities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Takes in a virtual descriptor and creates an HTML element. Sets the element
 * into the cache.
 *
 * @param descriptor - Element descriptor
 * @return {Element} - The newly created DOM Node
 */
function make(descriptor) {
  var element = null;
  var isSvg = false;
  // Get the Custom Element constructor for a given element.
  var nodeName = descriptor.nodeName;
  var CustomElement = _custom.components[nodeName];

  // If the element descriptor was already created, reuse the existing element.
  if (_make2.default.nodes[descriptor.uuid]) {
    return _make2.default.nodes[descriptor.uuid];
  }

  if (descriptor.nodeName === '#text') {
    element = document.createTextNode(descriptor.nodeValue);
  } else {
    if (svg.elements.indexOf(descriptor.nodeName) > -1) {
      isSvg = true;
      element = document.createElementNS(svg.namespace, descriptor.nodeName);
    } else {
      element = document.createElement(descriptor.nodeName);
    }

    // Copy all the attributes from the descriptor into the newly created DOM
    // Node.
    if (descriptor.attributes && descriptor.attributes.length) {
      for (var i = 0; i < descriptor.attributes.length; i++) {
        var attribute = descriptor.attributes[i];
        element.setAttribute(attribute.name, attribute.value);
      }
    }

    // Append all the children into the element, making sure to run them
    // through this `make` function as well.
    if (descriptor.childNodes && descriptor.childNodes.length) {
      for (var _i = 0; _i < descriptor.childNodes.length; _i++) {
        element.appendChild(make(descriptor.childNodes[_i]));
      }
    }
  }

  // Upgrade the element after creating it, if necessary.
  (0, _custom.upgrade)(nodeName, element, descriptor);

  // Custom elements have a createdCallback method that should be called.
  if (CustomElement && CustomElement.prototype.createdCallback) {
    CustomElement.prototype.createdCallback.call(element);
  }

  // Add to the nodes cache using the designated uuid as the lookup key.
  _make2.default.nodes[descriptor.uuid] = element;

  return element;
}

},{"../node/make":6,"../svg":12,"../util/entities":14,"./custom":1}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var missingStackTrace = 'Browser doesn\'t support error stack traces.';

/**
 * Identifies an error with transitions.
 */

var TransitionStateError = exports.TransitionStateError = function (_Error) {
  _inherits(TransitionStateError, _Error);

  function TransitionStateError(message) {
    var _this;

    _classCallCheck(this, TransitionStateError);

    var error = (_this = _possibleConstructorReturn(this, Object.getPrototypeOf(TransitionStateError).call(this)), _this);

    _this.message = message;
    _this.stack = error.stack || missingStackTrace;
    return _this;
  }

  return TransitionStateError;
}(Error);

/**
 * Identifies an error with registering an element.
 */


var DOMException = exports.DOMException = function (_Error2) {
  _inherits(DOMException, _Error2);

  function DOMException(message) {
    var _this2;

    _classCallCheck(this, DOMException);

    var error = (_this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(DOMException).call(this)), _this2);

    _this2.message = 'Uncaught DOMException: ' + message;
    _this2.stack = error.stack || missingStackTrace;
    return _this2;
  }

  return DOMException;
}(Error);

},{}],5:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DOMException = exports.TransitionStateError = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _errors = _dereq_('./errors');

Object.defineProperty(exports, 'TransitionStateError', {
  enumerable: true,
  get: function get() {
    return _errors.TransitionStateError;
  }
});
Object.defineProperty(exports, 'DOMException', {
  enumerable: true,
  get: function get() {
    return _errors.DOMException;
  }
});
exports.outerHTML = outerHTML;
exports.innerHTML = innerHTML;
exports.element = element;
exports.release = release;
exports.registerElement = registerElement;
exports.addTransitionState = addTransitionState;
exports.removeTransitionState = removeTransitionState;
exports.enableProllyfill = enableProllyfill;

var _patch = _dereq_('./node/patch');

var _patch2 = _interopRequireDefault(_patch);

var _release = _dereq_('./node/release');

var _release2 = _interopRequireDefault(_release);

var _make = _dereq_('./node/make');

var _make2 = _interopRequireDefault(_make);

var _tree = _dereq_('./node/tree');

var _transitions = _dereq_('./transitions');

var _custom = _dereq_('./element/custom');

var _memory = _dereq_('./util/memory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Used to diff the outerHTML contents of the passed element with the markup
 * contents.  Very useful for applying a global diff on the
 * `document.documentElement`.
 *
 * @param element
 * @param markup=''
 * @param options={}
 */
function outerHTML(element) {
  var markup = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.inner = false;
  (0, _patch2.default)(element, markup, options);
}

/**
 * Used to diff the innerHTML contents of the passed element with the markup
 * contents.  This is useful with libraries like Backbone that render Views
 * into element container.
 *
 * @param element
 * @param markup=''
 * @param options={}
 */
function innerHTML(element) {
  var markup = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.inner = true;
  (0, _patch2.default)(element, markup, options);
}

/**
 * Used to diff two elements.  The `inner` Boolean property can be specified in
 * the options to set innerHTML\outerHTML behavior.  By default it is
 * outerHTML.
 *
 * @param element
 * @param newElement
 * @param options={}
 */
function element(element, newElement) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  (0, _patch2.default)(element, newElement, options);
}

/**
 * Releases the worker and memory allocated to this element. Useful for
 * cleaning up components when removed in tests and applications.
 *
 * @param element
 */
function release(element) {
  (0, _release2.default)(element);
}

// Store a reference to the real `registerElement` method if it exists.
var realRegisterElement = document.registerElement;

/**
 * Register's a constructor with an element to provide lifecycle events.
 *
 * @param tagName
 * @param constructor
 */
function registerElement(tagName, constructor) {
  // Upgrade simple objects to inherit from HTMLElement and be usable in a real
  // implementation.
  var normalized = typeof constructor === 'function' ? constructor : null;

  // If this is not a valid constructor, create one.
  if (normalized === null) {
    normalized = function HTMLElement() {};
    normalized.__proto__ = constructor;
    normalized.prototype = constructor.prototype || constructor;
    normalized.prototype.__proto__ = HTMLElement.prototype;
  }

  // If the native web component specification is loaded, use that instead.
  if (realRegisterElement) {
    // Still store the reference internally, since we use it to circumvent the
    // `is` attribute bug.
    _custom.components[tagName] = normalized;
    return realRegisterElement.call(document, tagName, normalized);
  }

  // If the element has already been registered, raise an error.
  if (tagName in _custom.components) {
    throw new _errors.DOMException('\n      Failed to execute \'registerElement\' on \'Document\': Registration failed\n      for type \'' + tagName + '\'. A type with that name is already registered.\n    ');
  }

  // Assign the custom element reference to the constructor.
  _custom.components[tagName] = normalized;
}

/**
 * Adds a global transition listener.  With many elements this could be an
 * expensive operation, so try to limit the amount of listeners added if you're
 * concerned about performance.
 *
 * Since the callback triggers with various elements, most of which you
 * probably don't care about, you'll want to filter.  A good way of filtering
 * is to use the DOM `matches` method.  It's fairly well supported
 * (http://caniuse.com/#feat=matchesselector) and may suit many projects.  If
 * you need backwards compatibility, consider using jQuery's `is`.
 *
 * You can do fun, highly specific, filters:
 *
 * addTransitionState('attached', function(element) {
 *   // Fade in the main container after it's added.
 *   if (element.matches('body main.container')) {
 *     $(element).stop(true, true).fadeIn();
 *   }
 * });
 *
 * @param state - String name that matches what's available in the
 * documentation above.
 * @param callback - Function to receive the matching elements.
 */
function addTransitionState(state, callback) {
  if (!state) {
    throw new _errors.TransitionStateError('Missing transition state name');
  }

  if (!callback) {
    throw new _errors.TransitionStateError('Missing transition state callback');
  }

  // Not a valid state name.
  if (Object.keys(_transitions.states).indexOf(state) === -1) {
    throw new _errors.TransitionStateError('Invalid state name: ' + state);
  }

  _transitions.states[state].push(callback);
}

/**
 * Removes a global transition listener.
 *
 * When invoked with no arguments, this method will remove all transition
 * callbacks.  When invoked with the name argument it will remove all
 * transition state callbacks matching the name, and so on for the callback.
 *
 * @param state - String name that matches what's available in the
 * documentation above.
 * @param callback - Function to receive the matching elements.
 */
function removeTransitionState(state, callback) {
  if (!callback && state) {
    _transitions.states[state].length = 0;
  } else if (state && callback) {
    // Not a valid state name.
    if (Object.keys(_transitions.states).indexOf(state) === -1) {
      throw new _errors.TransitionStateError('Invalid state name ' + state);
    }

    var index = _transitions.states[state].indexOf(callback);
    _transitions.states[state].splice(index, 1);
  } else {
    for (var _state in _transitions.states) {
      _transitions.states[_state].length = 0;
    }
  }
}

/**
 * By calling this function your browser environment is enhanced globally. This
 * project would love to hit the standards track and allow all developers to
 * benefit from the performance gains of DOM diffing.
 */
function enableProllyfill() {
  // Exposes the `TransitionStateError` constructor globally so that developers
  // can instanceof check exception errors.
  Object.defineProperty(window, 'TransitionStateError', {
    configurable: true,

    value: _errors.TransitionStateError
  });

  // Allows a developer to add transition state callbacks.
  Object.defineProperty(document, 'addTransitionState', {
    configurable: true,

    value: function value(state, callback) {
      addTransitionState(state, callback);
    }
  });

  // Allows a developer to remove transition state callbacks.
  Object.defineProperty(document, 'removeTransitionState', {
    configurable: true,

    value: function value(state, callback) {
      removeTransitionState(state, callback);
    }
  });

  // Exposes the API into the Element, ShadowDOM, and DocumentFragment
  // constructors.
  [typeof Element !== 'undefined' ? Element : undefined, typeof HTMLElement !== 'undefined' ? HTMLElement : undefined, typeof ShadowRoot !== 'undefined' ? ShadowRoot : undefined, typeof DocumentFragment !== 'undefined' ? DocumentFragment : undefined].filter(Boolean).forEach(function (Ctor) {
    Object.defineProperty(Ctor.prototype, 'diffInnerHTML', {
      configurable: true,

      set: function set(newHTML) {
        innerHTML(this, newHTML);
      }
    });

    // Allows a developer to set the `outerHTML` of an element.
    Object.defineProperty(Ctor.prototype, 'diffOuterHTML', {
      configurable: true,

      set: function set(newHTML) {
        outerHTML(this, newHTML);
      }
    });

    // Allows a developer to diff the current element with a new element.
    Object.defineProperty(Ctor.prototype, 'diffElement', {
      configurable: true,

      value: function value(newElement, options) {
        element(this, newElement, options);
      }
    });

    // Releases the retained memory and worker instance.
    Object.defineProperty(Ctor.prototype, 'diffRelease', {
      configurable: true,

      value: function value() {
        (0, _release2.default)(this);
      }
    });
  });

  // Polyfill in the `registerElement` method if it doesn't already exist. This
  // requires patching `createElement` as well to ensure that the proper proto
  // chain exists.
  Object.defineProperty(document, 'registerElement', {
    configurable: true,

    value: function value(tagName, component) {
      registerElement(tagName, component);
    }
  });

  // If HTMLElement is an object, rejigger it to work like a function so that
  // it can be extended. Specifically affects IE and Safari.
  Object.getOwnPropertyNames(window).filter(function (key) {
    return key.indexOf('HTML') === 0 && _typeof(window[key]) === 'object';
  }).forEach(function (key) {
    // Fall back to the Element constructor if the HTMLElement does not exist.
    var realElement = window[key];

    // If there is no `__proto__` available, add one to the prototype.
    if (!realElement.__proto__) {
      var copy = {
        set: function set(val) {
          val = Object.keys(val).length ? val : Object.getPrototypeOf(val);

          for (var _key in val) {
            if (val.hasOwnProperty(_key)) {
              this[_key] = val[_key];
            }
          }
        }
      };

      Object.defineProperty(realElement, '__proto__', copy);
      Object.defineProperty(realElement.prototype, '__proto__', copy);
    }

    var Element = new Function('return function ' + key + '() {};')();
    Element.prototype = Object.create(realElement.prototype);
    Element.__proto__ = realElement;

    // Ensure that the global Element matches the HTMLElement.
    window[key] = Element;
  });

  /**
   * Will automatically activate any components found in the page automatically
   * after calling `enableProllyfill`. This is useful to simulate a real-world
   * usage of Custom Elements.
   */
  var activateComponents = function activateComponents() {
    var documentElement = document.documentElement;
    var bufferSet = false;

    // If this element is already rendering, add this new render request into
    // the buffer queue. Check and see if any element is currently rendering,
    // can only do one at a time.
    _tree.TreeCache.forEach(function iterateTreeCache(elementMeta, element) {
      if (elementMeta.isRendering) {
        bufferSet = true;
      }
    });

    // Short circuit the rest of this render.
    if (bufferSet) {
      // Remove the load event listener, since it's complete.
      return window.removeEventListener('load', activateComponents);
    }

    var descriptor = (0, _make2.default)(documentElement);

    // After the initial render, clean up the resources, no point in lingering.
    documentElement.addEventListener('renderComplete', function render() {
      var elementMeta = _tree.TreeCache.get(documentElement) || {};

      // Release resources allocated to the element.
      if (!elementMeta.isRendering) {

        // Unprotect after the activation is complete.
        (0, _memory.unprotectElement)(descriptor, _make2.default);
        documentElement.diffRelease(documentElement);
      }

      // Remove this event listener.
      documentElement.removeEventListener('renderComplete', render);
    });

    // Protect the documentElement before applying the changes.
    (0, _memory.protectElement)(descriptor);

    // Diff the entire document on activation of the prollyfill.
    documentElement.diffOuterHTML = documentElement.outerHTML;

    // Remove the load event listener, since it's complete.
    window.removeEventListener('load', activateComponents);
  };

  // If the document has already loaded, immediately activate the components.
  if (document.readyState === 'complete') {
    activateComponents();
  } else {
    // This section will automatically parse out your entire page to ensure all
    // custom elements are hooked into.
    window.addEventListener('load', activateComponents);
  }
}

},{"./element/custom":1,"./errors":4,"./node/make":6,"./node/patch":7,"./node/release":8,"./node/tree":10,"./transitions":13,"./util/memory":15}],6:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = make;

var _pools2 = _dereq_('../util/pools');

var _custom = _dereq_('../element/custom');

var pools = _pools2.pools;
var empty = {};

// Cache created nodes inside this object.
make.nodes = {};

/**
 * Converts a live node into a virtual node.
 *
 * @param node
 * @return
 */
function make(node) {
  var nodeType = node.nodeType;

  // Whitelist: Elements, TextNodes, and Shadow Root.
  if (nodeType !== 1 && nodeType !== 3 && nodeType !== 11) {
    return false;
  }

  // Virtual representation of a node, containing only the data we wish to
  // diff and patch.
  var entry = pools.elementObject.get();

  // Associate this newly allocated uuid with this Node.
  make.nodes[entry.uuid] = node;

  // Set a lowercased (normalized) version of the element's nodeName.
  entry.nodeName = node.nodeName.toLowerCase();

  // If the element is a text node set the nodeValue.
  if (nodeType === 3) {
    entry.nodeValue = node.textContent;
  } else {
    entry.nodeValue = '';
  }

  entry.childNodes.length = 0;
  entry.attributes.length = 0;

  // Collect attributes.
  var attributes = node.attributes;

  // If the element has no attributes, skip over.
  if (attributes) {
    var attributesLength = attributes.length;

    if (attributesLength) {
      for (var i = 0; i < attributesLength; i++) {
        var attr = pools.attributeObject.get();

        attr.name = attributes[i].name;
        attr.value = attributes[i].value;

        entry.attributes[entry.attributes.length] = attr;
      }
    }
  }

  // Collect childNodes.
  var childNodes = node.childNodes ? node.childNodes : [];
  var childNodesLength = childNodes.length;

  // If the element has child nodes, convert them all to virtual nodes.
  if (nodeType !== 3 && childNodesLength) {
    for (var _i = 0; _i < childNodesLength; _i++) {
      var newNode = make(childNodes[_i]);

      if (newNode) {
        entry.childNodes[entry.childNodes.length] = newNode;
      }
    }
  }

  // Prune out whitespace from between HTML tags in markup.
  if (entry.nodeName === 'html') {
    entry.childNodes = entry.childNodes.filter(function (el) {
      return el.nodeName === 'head' || el.nodeName === 'body';
    });
  }

  // Reset the prototype chain for this element. Upgrade will return `true`
  // if the element was upgraded for the first time. This is useful so we
  // don't end up in a loop when working with the same element.
  (0, _custom.upgrade)(entry.nodeName, node, entry, true);

  return entry;
}

},{"../element/custom":1,"../util/pools":17}],7:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = patchNode;

var _create = _dereq_('../worker/create');

var _memory = _dereq_('../util/memory');

var _parser = _dereq_('../util/parser');

var _render = _dereq_('../util/render');

var _make = _dereq_('./make');

var _make2 = _interopRequireDefault(_make);

var _process = _dereq_('../patches/process');

var _process2 = _interopRequireDefault(_process);

var _sync = _dereq_('./sync');

var _sync2 = _interopRequireDefault(_sync);

var _tree = _dereq_('./tree');

var _pools = _dereq_('../util/pools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Patches an element's DOM to match that of the passed markup.
 *
 * @param element
 * @param newHTML
 */
function patchNode(element, newHTML, options) {
  // Ensure that the document disable worker is always picked up.
  if (typeof options.enableWorker !== 'boolean') {
    options.enableWorker = document.ENABLE_WORKER;
  }

  // The element meta object is a location to associate metadata with the
  // currently rendering element. This prevents attaching properties to the
  // instance itself.
  var elementMeta = _tree.TreeCache.get(element) || {};

  // Last options used.
  elementMeta.options = options;

  // Always ensure the most up-to-date meta object is stored.
  _tree.TreeCache.set(element, elementMeta);

  var bufferSet = false;
  var isInner = options.inner;
  var previousMarkup = elementMeta.previousMarkup;

  // If this element is already rendering, add this new render request into the
  // buffer queue. Check and see if any element is currently rendering, can
  // only do one at a time.
  _tree.TreeCache.forEach(function iterateTreeCache(_elementMeta, _element) {
    if (_elementMeta.isRendering) {
      elementMeta.renderBuffer = { element: element, newHTML: newHTML, options: options };
      bufferSet = true;
    }
  });

  // Short circuit the rest of this render.
  if (bufferSet) {
    return;
  }

  var sameInnerHTML = isInner ? previousMarkup === element.innerHTML : true;
  var sameOuterHTML = !isInner ? previousMarkup === element.outerHTML : true;
  var sameTextContent = elementMeta._textContent === element.textContent;

  // If the contents haven't changed, abort, since there is no point in
  // continuing.
  if (elementMeta.newHTML === newHTML) {
    return;
  }

  // Associate the last markup rendered with this element.
  elementMeta.newHTML = newHTML;

  // Start with worker being a falsy value.
  var worker = null;

  // If we can use a worker and the user wants one, try and create it.
  if (options.enableWorker && _create.hasWorker) {
    // Create a worker for this element.
    worker = elementMeta.worker = elementMeta.worker || (0, _create.create)();
  }

  var rebuildTree = function rebuildTree() {
    var oldTree = elementMeta.oldTree;

    if (oldTree) {
      (0, _memory.unprotectElement)(oldTree, _make2.default);
      (0, _memory.cleanMemory)(_make2.default);
    }

    elementMeta.oldTree = (0, _memory.protectElement)((0, _make2.default)(element));
    elementMeta.updateWorkerTree = true;
  };

  // The last render was done via Worker, but now we're rendering in the UI
  // thread. This is very uncommon, but we need to ensure trees stay in sync.
  if (elementMeta.renderedViaWorker === true && !options.enableWorker) {
    rebuildTree();
  }

  if (!sameInnerHTML || !sameOuterHTML || !sameTextContent) {
    rebuildTree();
  }

  // Will want to ensure that the first render went through, the worker can
  // take a bit to startup and we want to show changes as soon as possible.
  if (options.enableWorker && _create.hasWorker && worker) {
    // Set a render lock as to not flood the worker.
    elementMeta.isRendering = true;
    elementMeta.renderedViaWorker = true;
    elementMeta.workerCache = elementMeta.workerCache || [];

    // Attach all properties here to transport.
    var transferObject = {};

    // This should only occur once, or whenever the markup changes externally
    // to diffHTML.
    if (!elementMeta.hasWorkerRendered || elementMeta.updateWorkerTree) {
      transferObject.oldTree = elementMeta.oldTree;
      elementMeta.updateWorkerTree = false;
    }

    // Wait for the worker to finish processing and then apply the patchset.
    worker.onmessage = function onmessage(ev) {
      var wrapRender = function wrapRender(cb) {
        return function () {
          elementMeta.hasWorkerRendered = true;
          cb();
        };
      };
      var invokeRender = wrapRender((0, _render.completeRender)(element, elementMeta));

      // Wait until all promises have resolved, before finishing up the patch
      // cycle.  Process the data immediately and wait until all transition
      // callbacks have completed.
      var promises = (0, _process2.default)(element, ev.data.patches);

      // Operate synchronously unless opted into a Promise-chain.
      if (promises.length) {
        Promise.all(promises).then(invokeRender, function (ex) {
          return console.log(ex);
        });
      } else {
        invokeRender();
      }
    };

    if (typeof newHTML !== 'string') {
      transferObject.newTree = (0, _make2.default)(newHTML);

      // Transfer this buffer to the worker, which will take over and process
      // the markup.
      worker.postMessage(transferObject);

      return;
    }

    // Let the browser copy the HTML into the worker, converting to a
    // transferable object is too expensive.
    transferObject.newHTML = newHTML;

    // Add properties to send to worker.
    transferObject.isInner = options.inner;

    // Transfer this buffer to the worker, which will take over and process the
    // markup.
    worker.postMessage(transferObject);
  } else {
    if (elementMeta.renderedViaWorker && elementMeta.oldTree) {
      rebuildTree();
    }

    if (elementMeta.workerCache) {
      elementMeta.workerCache.forEach(function (x) {
        return (0, _memory.unprotectElement)(x, _make2.default);
      });
      delete elementMeta.workerCache;
    }

    // We're rendering in the UI thread.
    elementMeta.isRendering = true;

    // Whenever we render in the UI-thread, ensure that the Worker gets a
    // refreshed copy of the `oldTree`.
    elementMeta.updateWorkerTree = true;

    var newTree = null;

    if (typeof newHTML === 'string') {
      newTree = (0, _parser.parseHTML)(newHTML, options.inner);
    } else {
      newTree = (0, _make2.default)(newHTML);
    }

    if (options.inner) {
      var childNodes = Array.isArray(newTree) ? newTree : [newTree];

      newTree = {
        childNodes: childNodes,
        attributes: elementMeta.oldTree.attributes,
        uuid: elementMeta.oldTree.uuid,
        nodeName: elementMeta.oldTree.nodeName,
        nodeValue: elementMeta.oldTree.nodeValue
      };
    }

    // Synchronize the tree.
    var patches = (0, _sync2.default)(elementMeta.oldTree, newTree);
    var invokeRender = (0, _render.completeRender)(element, elementMeta);

    // Process the data immediately and wait until all transition callbacks
    // have completed.
    var promises = (0, _process2.default)(element, patches);

    // Operate synchronously unless opted into a Promise-chain.
    if (promises.length) {
      Promise.all(promises).then(invokeRender, function (ex) {
        return console.log(ex);
      });
    } else {
      invokeRender();
    }
  }
}

},{"../patches/process":11,"../util/memory":15,"../util/parser":16,"../util/pools":17,"../util/render":18,"../worker/create":20,"./make":6,"./sync":9,"./tree":10}],8:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = releaseNode;

var _tree = _dereq_('./tree');

var _make = _dereq_('./make');

var _make2 = _interopRequireDefault(_make);

var _memory = _dereq_('../util/memory');

var _pools = _dereq_('../util/pools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Release's the allocated objects and recycles internal memory.
 *
 * @param element
 */
function releaseNode(element) {
  var elementMeta = _tree.TreeCache.get(element);

  // Do not remove an element that is in process of rendering. User intentions
  // come first, so if we are cleaning up an element being used by another part
  // of the code, keep it alive.
  if (elementMeta) {
    // If there is a worker associated with this element, then kill it.
    if (elementMeta.worker) {
      elementMeta.worker.terminate();
      delete elementMeta.worker;
    }

    // If there was a tree set up, recycle the memory allocated for it.
    if (elementMeta.oldTree) {
      (0, _memory.unprotectElement)(elementMeta.oldTree, _make2.default);
    }

    if (elementMeta.workerCache) {
      elementMeta.workerCache.forEach(function (x) {
        return (0, _memory.unprotectElement)(x, _make2.default);
      });
      delete elementMeta.workerCache;
    }

    // Remove this element's meta object from the cache.
    _tree.TreeCache.delete(element);
  }

  (0, _memory.cleanMemory)(_make2.default);
}

},{"../util/memory":15,"../util/pools":17,"./make":6,"./tree":10}],9:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CHANGE_TEXT = exports.MODIFY_ATTRIBUTE = exports.MODIFY_ELEMENT = exports.REPLACE_ENTIRE_ELEMENT = exports.REMOVE_ENTIRE_ELEMENT = exports.REMOVE_ELEMENT_CHILDREN = undefined;
exports.default = sync;

var _pools2 = _dereq_('../util/pools');

var pools = _pools2.pools;

var slice = Array.prototype.slice;
var filter = Array.prototype.filter;

// Patch actions.
var REMOVE_ELEMENT_CHILDREN = exports.REMOVE_ELEMENT_CHILDREN = -2;
var REMOVE_ENTIRE_ELEMENT = exports.REMOVE_ENTIRE_ELEMENT = -1;
var REPLACE_ENTIRE_ELEMENT = exports.REPLACE_ENTIRE_ELEMENT = 0;
var MODIFY_ELEMENT = exports.MODIFY_ELEMENT = 1;
var MODIFY_ATTRIBUTE = exports.MODIFY_ATTRIBUTE = 2;
var CHANGE_TEXT = exports.CHANGE_TEXT = 3;

/**
 * Synchronizes changes from the newTree into the oldTree.
 *
 * @param oldTree
 * @param newTree
 * @param patches - optional
 */
function sync(oldTree, newTree, patches) {
  patches = patches || [];

  if (!Array.isArray(patches)) {
    throw new Error('Missing Array to sync patches into');
  }

  if (!oldTree) {
    throw new Error('Missing existing tree to sync');
  }

  var oldNodeValue = oldTree.nodeValue;
  var oldChildNodes = oldTree.childNodes;
  var oldChildNodesLength = oldChildNodes ? oldChildNodes.length : 0;
  var oldElement = oldTree.uuid;
  var oldNodeName = oldTree.nodeName;
  var oldIsTextNode = oldNodeName === '#text';

  if (!newTree) {
    var removed = [oldTree].concat(oldChildNodes.splice(0, oldChildNodesLength));

    patches.push({
      __do__: REMOVE_ENTIRE_ELEMENT,
      element: oldTree,
      toRemove: removed
    });

    return patches;
  }

  var nodeValue = newTree.nodeValue;
  var childNodes = newTree.childNodes;
  var childNodesLength = childNodes ? childNodes.length : 0;
  var newElement = newTree.uuid;
  var nodeName = newTree.nodeName;
  var newIsTextNode = nodeName === '#text';

  // If the element we're replacing is totally different from the previous
  // replace the entire element, don't bother investigating children.
  if (oldTree.nodeName !== newTree.nodeName) {
    patches.push({
      __do__: REPLACE_ENTIRE_ELEMENT,
      old: oldTree,
      new: newTree
    });

    return patches;
  }

  // If the top level nodeValue has changed we should reflect it.
  if (oldIsTextNode && newIsTextNode && oldNodeValue !== nodeValue) {
    patches.push({
      __do__: CHANGE_TEXT,
      element: oldTree,
      value: newTree.nodeValue
    });

    oldTree.nodeValue = newTree.nodeValue;

    return;
  }

  // Most common additive elements.
  if (childNodesLength > oldChildNodesLength) {
    // Store elements in a DocumentFragment to increase performance and be
    // generally simplier to work with.
    var fragment = [];

    for (var i = oldChildNodesLength; i < childNodesLength; i++) {
      // Internally add to the tree.
      oldChildNodes.push(childNodes[i]);

      // Add to the document fragment.
      fragment.push(childNodes[i]);
    }

    oldChildNodesLength = oldChildNodes.length;

    // Assign the fragment to the patches to be injected.
    patches.push({
      __do__: MODIFY_ELEMENT,
      element: oldTree,
      fragment: fragment
    });
  }

  // A A
  // T T
  // B C
  // T T
  // C
  // T

  // Remove these elements.
  if (oldChildNodesLength > childNodesLength) {
    // For now just splice out the end items.
    var diff = oldChildNodesLength - childNodesLength;
    // Removal offset to check elements.
    var toRemove = oldChildNodes.splice(oldChildNodesLength - diff, diff);

    oldChildNodesLength = oldChildNodes.length;

    if (childNodesLength === 0) {
      patches.push({
        __do__: REMOVE_ELEMENT_CHILDREN,
        element: oldTree,
        toRemove: toRemove
      });
    } else {
      for (var _i = 0; _i < toRemove.length; _i++) {
        // Remove the element, this happens before the splice so that we
        // still have access to the element.
        patches.push({
          __do__: MODIFY_ELEMENT,
          old: toRemove[_i]
        });
      }
    }
  }

  // Replace elements if they are different.
  if (oldChildNodesLength >= childNodesLength) {
    for (var _i2 = 0; _i2 < childNodesLength; _i2++) {
      if (oldChildNodes[_i2].nodeName !== childNodes[_i2].nodeName) {
        // Add to the patches.
        patches.push({
          __do__: MODIFY_ELEMENT,
          old: oldChildNodes[_i2],
          new: childNodes[_i2]
        });

        // Replace the internal tree's point of view of this element.
        oldChildNodes[_i2] = childNodes[_i2];
      } else {
        sync(oldChildNodes[_i2], childNodes[_i2], patches);
      }
    }
  }

  // Synchronize attributes
  var attributes = newTree.attributes;

  if (attributes) {
    var oldLength = oldTree.attributes.length;
    var newLength = attributes.length;

    // Start with the most common, additive.
    if (newLength > oldLength) {
      var toAdd = slice.call(attributes, oldLength);

      for (var _i3 = 0; _i3 < toAdd.length; _i3++) {
        var change = {
          __do__: MODIFY_ATTRIBUTE,
          element: oldTree,
          name: toAdd[_i3].name,
          value: toAdd[_i3].value
        };

        var attr = pools.attributeObject.get();
        attr.name = toAdd[_i3].name;
        attr.value = toAdd[_i3].value;

        pools.attributeObject.protect(attr);

        // Push the change object into into the virtual tree.
        oldTree.attributes.push(attr);

        // Add the change to the series of patches.
        patches.push(change);
      }
    }

    // Check for removals.
    if (oldLength > newLength) {
      var _toRemove = slice.call(oldTree.attributes, newLength);

      for (var _i4 = 0; _i4 < _toRemove.length; _i4++) {
        var _change = {
          __do__: MODIFY_ATTRIBUTE,
          element: oldTree,
          name: _toRemove[_i4].name,
          value: undefined
        };

        // Remove the attribute from the virtual node.
        var _removed = oldTree.attributes.splice(_i4, 1);

        for (var _i5 = 0; _i5 < _removed.length; _i5++) {
          pools.attributeObject.unprotect(_removed[_i5]);
        }

        // Add the change to the series of patches.
        patches.push(_change);
      }
    }

    // Check for modifications.
    var toModify = attributes;

    for (var _i6 = 0; _i6 < toModify.length; _i6++) {
      var oldAttrValue = oldTree.attributes[_i6] && oldTree.attributes[_i6].value;
      var newAttrValue = attributes[_i6] && attributes[_i6].value;

      // Only push in a change if the attribute or value changes.
      if (oldAttrValue !== newAttrValue) {
        var _change2 = {
          __do__: MODIFY_ATTRIBUTE,
          element: oldTree,
          name: toModify[_i6].name,
          value: toModify[_i6].value
        };

        // Replace the attribute in the virtual node.
        var _attr = oldTree.attributes[_i6];
        _attr.name = toModify[_i6].name;
        _attr.value = toModify[_i6].value;

        // Add the change to the series of patches.
        patches.push(_change2);
      }
    }
  }

  return patches;
}

},{"../util/pools":17}],10:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Cache prebuilt trees and lookup by element.
var TreeCache = exports.TreeCache = new Map();

},{}],11:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = process;

var _transitions = _dereq_('../transitions');

var transition = _interopRequireWildcard(_transitions);

var _pools = _dereq_('../util/pools');

var _get = _dereq_('../element/get');

var _get2 = _interopRequireDefault(_get);

var _custom = _dereq_('../element/custom');

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

var _sync = _dereq_('../node/sync');

var sync = _interopRequireWildcard(_sync);

var _tree = _dereq_('../node/tree');

var _memory = _dereq_('../util/memory');

var _entities = _dereq_('../util/entities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var blockTextElements = ['script', 'noscript', 'style', 'pre', 'template'];

/**
 * Processes an array of patches.
 *
 * @param element - Element to process patchsets on.
 * @param e - Object that contains patches.
 */
function process(element, patches) {
  var elementMeta = _tree.TreeCache.get(element);
  var promises = [];
  var triggerTransition = transition.buildTrigger(promises);

  // Trigger the attached transition state for this element and all childNodes.
  var attached = function attached(descriptor, fragment, parentNode) {
    (0, _memory.protectElement)(descriptor);

    if (elementMeta.workerCache) {
      elementMeta.workerCache.push(descriptor);
    }

    var el = (0, _get2.default)(descriptor).element;

    // If the element added was a DOM text node or SVG text element, trigger
    // the textChanged transition.
    if (descriptor.nodeName === '#text') {
      var textPromises = transition.makePromises('textChanged', [el], null, descriptor.nodeValue);

      el.textContent = (0, _entities.decodeEntities)(descriptor.nodeValue);

      if (parentNode) {
        var nodeName = parentNode.nodeName.toLowerCase();

        if (blockTextElements.indexOf(nodeName) > -1) {
          parentNode.nodeValue = (0, _entities.decodeEntities)(descriptor.nodeValue);
        }
      }

      triggerTransition('textChanged', textPromises, function (promises) {});
    }

    if (descriptor.attributes && descriptor.attributes.length) {
      descriptor.attributes.forEach(function (attr) {
        var attrChangePromises = transition.makePromises('attributeChanged', [el], attr.name, null, attr.value);

        triggerTransition('attributeChanged', attrChangePromises, function (promises) {});
      });
    }

    // Call all `childNodes` attached callbacks as well.
    if (descriptor.childNodes && descriptor.childNodes.length) {
      descriptor.childNodes.forEach(function (x) {
        return attached(x, null, el);
      });
    }

    // If a document fragment was specified, append the real element into it.
    if (fragment) {
      fragment.appendChild(el);
    }

    return el;
  };

  // Loop through all the patches and apply them.

  var _loop = function _loop(i) {
    var patch = patches[i];
    var newEl = void 0,
        oldEl = void 0,
        el = void 0;

    if (patch.element) {
      var result = (0, _get2.default)(patch.element);
      el = result.element;
    }

    if (patch.old) {
      var _result = (0, _get2.default)(patch.old);
      oldEl = _result.element;
    }

    if (patch.new) {
      var _result2 = (0, _get2.default)(patch.new);
      newEl = _result2.element;
    }

    // Empty the Node's contents. This is an optimization, since `innerHTML`
    // will be faster than iterating over every element and manually removing.
    if (patch.__do__ === sync.REMOVE_ELEMENT_CHILDREN) {
      var childNodes = el.childNodes;
      var detachPromises = transition.makePromises('detached', childNodes);

      triggerTransition('detached', detachPromises, function (promises) {
        patch.toRemove.forEach(function (x) {
          return (0, _memory.unprotectElement)(x, _make2.default);
        });
        el.innerHTML = '';
      });
    }

    // Remove the entire Node. Only does something if the Node has a parent
    // element.
    else if (patch.__do__ === sync.REMOVE_ENTIRE_ELEMENT) {
        var _detachPromises = transition.makePromises('detached', [el]);

        if (el.parentNode) {
          triggerTransition('detached', _detachPromises, function (promises) {
            el.parentNode.removeChild(el);
            patch.toRemove.forEach(function (x) {
              return (0, _memory.unprotectElement)(x, _make2.default);
            });
          });
        } else {
          patch.toRemove.forEach(function (x) {
            return (0, _memory.unprotectElement)(x, _make2.default);
          });
        }
      }

      // Replace the entire Node.
      else if (patch.__do__ === sync.REPLACE_ENTIRE_ELEMENT) {
          (function () {
            var allPromises = [];
            var attachedPromises = transition.makePromises('attached', [newEl]);
            var detachedPromises = transition.makePromises('detached', [oldEl]);
            var replacedPromises = transition.makePromises('replaced', [oldEl], newEl);

            // Add all the transition state promises into the main array, we'll use
            // them all to decide when to alter the DOM.
            triggerTransition('detached', detachedPromises, function (promises) {
              allPromises.push.apply(allPromises, promises);
            });

            triggerTransition('attached', attachedPromises, function (promises) {
              allPromises.push.apply(allPromises, promises);
              attached(patch.new, null, newEl);
            });

            triggerTransition('replaced', replacedPromises, function (promises) {
              allPromises.push.apply(allPromises, promises);
            });

            (0, _memory.unprotectElement)(patch.old, _make2.default);

            // Reset the tree cache.
            _tree.TreeCache.set(newEl, {
              oldTree: patch.new,
              element: newEl
            });

            // Once all the promises have completed, invoke the action, if no
            // promises were added, this will be a synchronous operation.
            if (allPromises.length) {
              Promise.all(allPromises).then(function replaceEntireElement() {
                if (!oldEl.parentNode) {
                  (0, _memory.unprotectElement)(patch.new, _make2.default);

                  throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
                }

                oldEl.parentNode.replaceChild(newEl, oldEl);
              }, function (ex) {
                return console.log(ex);
              });
            } else {
              if (!oldEl.parentNode) {
                (0, _memory.unprotectElement)(patch.new, _make2.default);

                throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
              }

              oldEl.parentNode.replaceChild(newEl, oldEl);
            }
          })();
        }

        // Node manip.
        else if (patch.__do__ === sync.MODIFY_ELEMENT) {
            // Add.
            if (el && patch.fragment && !oldEl) {
              (function () {
                var fragment = document.createDocumentFragment();

                // Loop over every element to be added and process the descriptor
                // into the real element and append into the DOM fragment.
                toAttach = patch.fragment.map(function (el) {
                  return attached(el, fragment, el);
                });

                // Turn elements into childNodes of the patch element.

                el.appendChild(fragment);

                // Trigger transitions.
                var makeAttached = transition.makePromises('attached', toAttach);
                triggerTransition('attached', makeAttached);
              })();
            }

            // Remove.
            else if (oldEl && !newEl) {
                if (!oldEl.parentNode) {
                  (0, _memory.unprotectElement)(patch.old, _make2.default);

                  throw new Error('Can\'t remove without parent, is this the ' + 'document root?');
                }

                var makeDetached = transition.makePromises('detached', [oldEl]);

                triggerTransition('detached', makeDetached, function () {
                  if (oldEl.parentNode) {
                    oldEl.parentNode.removeChild(oldEl);
                  }

                  // And then empty out the entire contents.
                  oldEl.innerHTML = '';

                  (0, _memory.unprotectElement)(patch.old, _make2.default);
                });
              }

              // Replace.
              else if (oldEl && newEl) {
                  (function () {
                    if (!oldEl.parentNode) {
                      (0, _memory.unprotectElement)(patch.old, _make2.default);
                      (0, _memory.unprotectElement)(patch.new, _make2.default);

                      throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
                    }

                    // Append the element first, before doing the replacement.
                    if (oldEl.nextSibling) {
                      oldEl.parentNode.insertBefore(newEl, oldEl.nextSibling);
                    } else {
                      oldEl.parentNode.appendChild(newEl);
                    }

                    // Removed state for transitions API.
                    var allPromises = [];
                    var attachPromises = transition.makePromises('attached', [newEl]);
                    var detachPromises = transition.makePromises('detached', [oldEl]);
                    var replacePromises = transition.makePromises('replaced', [oldEl], newEl);

                    triggerTransition('replaced', replacePromises, function (promises) {
                      allPromises.push.apply(allPromises, promises);
                    });

                    triggerTransition('detached', detachPromises, function (promises) {
                      allPromises.push.apply(allPromises, promises);
                    });

                    triggerTransition('attached', attachPromises, function (promises) {
                      allPromises.push.apply(allPromises, promises);
                      attached(patch.new);
                    });

                    // Once all the promises have completed, invoke the action, if no
                    // promises were added, this will be a synchronous operation.
                    if (allPromises.length) {
                      Promise.all(allPromises).then(function replaceElement() {
                        if (oldEl.parentNode) {
                          oldEl.parentNode.replaceChild(newEl, oldEl);
                        }

                        (0, _memory.unprotectElement)(patch.old, _make2.default);

                        (0, _memory.protectElement)(patch.new);

                        if (elementMeta.workerCache) {
                          elementMeta.workerCache.push(patch.new);
                        }
                      }, function (ex) {
                        return console.log(ex);
                      });
                    } else {
                      if (!oldEl.parentNode) {
                        (0, _memory.unprotectElement)(patch.old, _make2.default);
                        (0, _memory.unprotectElement)(patch.new, _make2.default);

                        throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
                      }

                      oldEl.parentNode.replaceChild(newEl, oldEl);
                      (0, _memory.unprotectElement)(patch.old, _make2.default);
                      (0, _memory.protectElement)(patch.new);

                      if (elementMeta.workerCache) {
                        elementMeta.workerCache.push(patch.new);
                      }
                    }
                  })();
                }
          }

          // Attribute manipulation.
          else if (patch.__do__ === sync.MODIFY_ATTRIBUTE) {
              var attrChangePromises = transition.makePromises('attributeChanged', [el], patch.name, el.getAttribute(patch.name), patch.value);

              triggerTransition('attributeChanged', attrChangePromises, function (promises) {
                // Remove.
                if (patch.value === undefined) {
                  el.removeAttribute(patch.name);

                  if (patch.name === 'checked') {
                    el.checked = false;
                  }
                }
                // Change.
                else {
                    el.setAttribute(patch.name, patch.value);

                    // If an `is` attribute was set, we should upgrade it.
                    (0, _custom.upgrade)(patch.element.nodeName, el, patch.element);

                    // Support live updating of the value attribute.
                    if (patch.name === 'value' || patch.name === 'checked') {
                      el[patch.name] = patch.value;
                    }
                  }
              });
            }

            // Text node manipulation.
            else if (patch.__do__ === sync.CHANGE_TEXT) {
                var textChangePromises = transition.makePromises('textChanged', [el], el.nodeValue, patch.value);

                triggerTransition('textChanged', textChangePromises, function (promises) {
                  patch.element.nodeValue = (0, _entities.decodeEntities)(patch.value);
                  el.nodeValue = patch.element.nodeValue;

                  if (el.parentNode) {
                    var nodeName = el.parentNode.nodeName.toLowerCase();

                    if (blockTextElements.indexOf(nodeName) > -1) {
                      el.parentNode.nodeValue = patch.element.nodeValue;
                    }
                  }
                });
              }
  };

  for (var i = 0; i < patches.length; i++) {
    var toAttach;

    _loop(i);
  }

  // Return the Promises that were allocated so that rendering can be blocked
  // until they resolve.
  return promises.filter(Boolean);
}

},{"../element/custom":1,"../element/get":2,"../node/make":6,"../node/sync":9,"../node/tree":10,"../transitions":13,"../util/entities":14,"../util/memory":15,"../util/pools":17}],12:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// List of SVG elements.
var elements = exports.elements = ['altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'svg', 'switch', 'symbol', 'text', 'textPath', 'tref', 'tspan', 'use', 'view', 'vkern'];

// Namespace.
var namespace = exports.namespace = 'http://www.w3.org/2000/svg';

},{}],13:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.states = undefined;
exports.buildTrigger = buildTrigger;
exports.makePromises = makePromises;

var _custom = _dereq_('./element/custom');

var _make = _dereq_('./node/make');

var _make2 = _interopRequireDefault(_make);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var slice = Array.prototype.slice;
var forEach = Array.prototype.forEach;
var concat = Array.prototype.concat;
var empty = { prototype: {} };

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
  attached: {
    mapFn: function mapFn(el) {
      return function (cb) {
        return cb(el);
      };
    },
    customElementsFn: function customElementsFn(el) {
      return function (cb) {
        return cb.call(el);
      };
    }
  },

  detached: {
    mapFn: function mapFn(el) {
      return function (cb) {
        return cb(el);
      };
    },
    customElementsFn: function customElementsFn(el) {
      return function (cb) {
        return cb.call(el);
      };
    }
  },

  replaced: {
    mapFn: function mapFn(oldEl, newEl) {
      return function (cb) {
        return cb(oldEl, newEl);
      };
    }
  },

  attributeChanged: {
    mapFn: function mapFn(el, name, oldVal, newVal) {
      return function (cb) {
        return cb(el, name, oldVal, newVal);
      };
    },
    customElementsFn: function customElementsFn(el, name, oldVal, newVal) {
      return function (cb) {
        return cb.call(el, name, oldVal, newVal);
      };
    }
  },

  textChanged: {
    mapFn: function mapFn(el, oldVal, newVal) {
      return function (cb) {
        return cb(el, oldVal, newVal);
      };
    },
    customElementsFn: function customElementsFn(el, oldVal, newVal) {
      return function (cb) {
        return cb.call(el, oldVal, newVal);
      };
    }
  }
};

var make = {};

// Dynamically fill in the custom methods instead of manually constructing
// them.
Object.keys(states).forEach(function iterateStates(stateName) {
  var mapFn = fnSignatures[stateName].mapFn;

  /**
   * Make's the transition promises.
   *
   * @param elements
   * @param args
   * @param promises
   */
  make[stateName] = function makeTransitionPromises(elements, args, promises) {
    forEach.call(elements, function (element) {
      // Never pass text nodes to a state callback unless it is textChanged.
      if (stateName !== 'textChanged' && element.nodeType !== 1) {
        return;
      }

      // Call the map function with each element.
      var newPromises = states[stateName].map(mapFn.apply(null, [element].concat(args))).filter(Boolean);

      // Merge these Promises into the main cache.
      promises.push.apply(promises, newPromises);

      // Recursively call into the children if attached or detached.
      if (stateName === 'attached' || stateName === 'detached') {
        make[stateName](element.childNodes, args, promises);
      }
    });

    return promises;
  };
});

/**
 * Builds a reusable trigger mechanism for the element transitions.
 *
 * @param stateName
 * @param nodes
 * @param callback
 * @return
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

      if (!promises.length && callback) {
        callback(promises);
      } else {
        Promise.all(promises).then(callback, function handleRejection(ex) {
          console.log(ex);
        });
      }
    } else if (callback) {
      callback();
    }
  };
}

/**
 * Triggers the lifecycle events on an HTMLElement.
 *
 * @param stateName
 * @param elements
 * @return
 */
function triggerLifecycleEvent(stateName, args, elements) {
  // Trigger custom element
  var customElementFn = fnSignatures[stateName].customElementsFn;

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var isTextNode = element.nodeType === 3;
    var nodeName = element.nodeName.toLowerCase();
    var descriptor = (0, _make2.default)(element);

    // Value of the `is` attribute, if it exists.
    var isAttr = null;

    // Check for the `is` attribute. It has a known bug where it cannot be
    // applied dynamically.
    if (!_custom.components[nodeName] && Array.isArray(descriptor.attributes)) {
      descriptor.attributes.some(function (attr, idx) {
        if (attr.name === 'is') {
          isAttr = attr.value;
          return true;
        }
      });
    }

    // Hack around the `is` attribute being unable to be set dynamically.
    if (isAttr && _custom.components[isAttr]) {
      nodeName = isAttr;
    }

    var customElement = _custom.components[nodeName] || empty;
    var customElementMethodName = stateName + 'Callback';

    // Call the associated CustomElement's lifecycle callback, if it exists.
    if (customElement.prototype[customElementMethodName]) {
      customElementFn.apply(null, args)(customElement.prototype[customElementMethodName].bind(element));
    }
  }
}

/**
 * Make a reusable function for easy transition calling.
 *
 * @param stateName
 * @param elements
 * @return
 */
function makePromises(stateName) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  // Ensure elements is always an array.
  var elements = slice.call(args[0]);

  // Triggers the custom element callback.
  triggerLifecycleEvent(stateName, args.slice(1), elements);

  // Accepts the local Array of promises to use.
  return function (promises) {
    return make[stateName](elements, args.slice(1), promises);
  };
}

},{"./element/custom":1,"./node/make":6}],14:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeEntities = decodeEntities;
var element = document.createElement('div');

/**
 * Decodes HTML strings.
 *
 * @see http://stackoverflow.com/a/5796718
 * @param stringing
 * @return unescaped HTML
 */
function decodeEntities(string) {
  element.innerHTML = string;

  return element.textContent;
}

},{}],15:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.protectElement = protectElement;
exports.unprotectElement = unprotectElement;
exports.cleanMemory = cleanMemory;

var _pools2 = _dereq_('../util/pools');

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pools = _pools2.pools;
var makeNode = _make2.default;

/**
 * Ensures that an element is not recycled during a render cycle.
 *
 * @param element
 * @return element
 */
function protectElement(element) {
  var elementObject = pools.elementObject;
  var attributeObject = pools.attributeObject;

  elementObject.protect(element);

  element.attributes.forEach(attributeObject.protect, attributeObject);

  if (element.childNodes) {
    element.childNodes.forEach(protectElement);
  }

  return element;
}

/**
 * Allows an element to be recycled during a render cycle.
 *
 * @param element
 * @return
 */
function unprotectElement(element, makeNode) {
  var elementObject = pools.elementObject;
  var attributeObject = pools.attributeObject;

  elementObject.unprotect(element);
  elementObject.cache.uuid.delete(element.uuid);

  element.attributes.forEach(attributeObject.unprotect, attributeObject);

  if (element.childNodes) {
    element.childNodes.forEach(function (node) {
      return unprotectElement(node, makeNode);
    });
  }

  if (makeNode && makeNode.nodes) {
    delete makeNode.nodes[element.uuid];
  }

  return element;
}

/**
 * Recycles all unprotected allocations.
 */
function cleanMemory(makeNode) {
  var elementObject = pools.elementObject;
  var attributeObject = pools.attributeObject;

  // Clean out unused elements.
  if (makeNode && makeNode.nodes) {
    for (var uuid in makeNode.nodes) {
      if (!elementObject.cache.uuid.has(uuid)) {
        delete makeNode.nodes[uuid];
      }
    }
  }

  // Empty all element allocations.
  elementObject.cache.allocated.forEach(function (v) {
    elementObject.cache.free.push(v);
  });

  elementObject.cache.allocated.clear();

  // Empty all attribute allocations.
  attributeObject.cache.allocated.forEach(function (v) {
    attributeObject.cache.free.push(v);
  });

  attributeObject.cache.allocated.clear();
}

},{"../node/make":6,"../util/pools":17}],16:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseHTML = parseHTML;
exports.makeParser = makeParser;

var _pools2 = _dereq_('./pools');

var pools = _pools2.pools; // Code based off of:
// https://github.com/ashi009/node-fast-html-parser

var parser = makeParser();
var slice = Array.prototype.slice;

/**
 * parseHTML
 *
 * @param newHTML
 * @return
 */
function parseHTML(newHTML, isInner) {
  var documentElement = parser.parse(newHTML);
  var nodes = documentElement.childNodes;

  return isInner ? nodes : nodes[0];
}

/**
 * makeParser
 *
 * @return
 */
function makeParser() {
  var kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z\-][a-z0-9\-]*)\s*([^>]*?)(\/?)>/ig;

  var kAttributePattern = /\b(id|class)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;

  var reAttrPattern = /\b([a-z][a-z0-9\-]*)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;

  var kSelfClosingElements = {
    meta: true,
    img: true,
    link: true,
    input: true,
    area: true,
    br: true,
    hr: true
  };

  var kElementsClosedByOpening = {
    li: {
      li: true
    },

    p: {
      p: true, div: true
    },

    td: {
      td: true, th: true
    },

    th: {
      td: true, th: true
    }
  };

  var kElementsClosedByClosing = {
    li: {
      ul: true, ol: true
    },

    a: {
      div: true
    },

    b: {
      div: true
    },

    i: {
      div: true
    },

    p: {
      div: true
    },

    td: {
      tr: true, table: true
    },

    th: {
      tr: true, table: true
    }
  };

  var kBlockTextElements = {
    script: true,
    noscript: true,
    style: true,
    template: true
  };

  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  /**
   * TextNode to contain a text element in DOM tree.
   * @param {string} value [description]
   */
  function TextNode(value) {
    var instance = pools.elementObject.get();

    instance.nodeName = '#text';
    instance.nodeValue = value;
    instance.nodeType = 3;
    instance.childNodes.length = 0;
    instance.attributes.length = 0;

    return instance;
  }

  /**
   * HTMLElement, which contains a set of children.
   *
   * Note: this is a minimalist implementation, no complete tree structure
   * provided (no parentNode, nextSibling, previousSibling etc).
   *
   * @param {string} name     nodeName
   * @param {Object} keyAttrs id and class attribute
   * @param {Object} rawAttrs attributes in string
   */
  function HTMLElement(name, keyAttrs, rawAttrs) {
    var instance = pools.elementObject.get();

    instance.nodeName = name;
    instance.nodeValue = '';
    instance.nodeType = 1;
    instance.childNodes.length = 0;
    instance.attributes.length = 0;

    if (rawAttrs) {
      for (var match; match = reAttrPattern.exec(rawAttrs);) {
        var attr = pools.attributeObject.get();

        attr.name = match[1];
        attr.value = match[6] || match[5] || match[4] || match[1];

        // Look for empty attributes.
        if (match[6] === '""') {
          attr.value = '';
        }

        instance.attributes.push(attr);
      }
    }

    return instance;
  }

  /**
   * Parses HTML and returns a root element
   */
  var htmlParser = {
    /**
     * Parse a chuck of HTML source.
     * @param  {string} data      html
     * @return {HTMLElement}      root element
     */
    parse: function parse(data) {
      var rootObject = {};
      var root = HTMLElement(null, rootObject);
      var currentParent = root;
      var stack = [root];
      var lastTextPos = -1;

      if (data.indexOf('<') === -1 && data) {
        currentParent.childNodes.push(TextNode(data));

        return root;
      }

      for (var match, text; match = kMarkupPattern.exec(data);) {
        if (lastTextPos > -1) {
          if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
            // if has content
            text = data.slice(lastTextPos, kMarkupPattern.lastIndex - match[0].length);

            currentParent.childNodes.push(TextNode(text));
          }
        }

        lastTextPos = kMarkupPattern.lastIndex;

        // This is a comment.
        if (match[0][1] === '!') {
          continue;
        }

        if (!match[1]) {
          // not </ tags
          var attrs = {};

          for (var attMatch; attMatch = kAttributePattern.exec(match[3]);) {
            attrs[attMatch[1]] = attMatch[3] || attMatch[4] || attMatch[5];
          }

          if (!match[4] && kElementsClosedByOpening[currentParent.nodeName]) {
            if (kElementsClosedByOpening[currentParent.nodeName][match[2]]) {
              stack.pop();
              currentParent = stack[stack.length - 1];
            }
          }

          currentParent = currentParent.childNodes[currentParent.childNodes.push(HTMLElement(match[2], attrs, match[3])) - 1];

          stack.push(currentParent);

          if (kBlockTextElements[match[2]]) {
            // A little test to find next </script> or </style> ...
            var closeMarkup = '</' + match[2] + '>';
            var index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
            var length = match[2].length;

            if (index === -1) {
              lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
            } else {
              lastTextPos = kMarkupPattern.lastIndex = index + closeMarkup.length;
              match[1] = true;
            }

            var newText = data.slice(match.index + match[0].length, index);

            if (newText.trim()) {
              newText = slice.call(newText).map(function (ch) {
                return escapeMap[ch] || ch;
              }).join('');

              currentParent.childNodes.push(TextNode(newText));
            }
          }
        }
        if (match[1] || match[4] || kSelfClosingElements[match[2]]) {
          // </ or /> or <br> etc.
          while (currentParent) {
            if (currentParent.nodeName == match[2]) {
              stack.pop();
              currentParent = stack[stack.length - 1];

              break;
            } else {
              // Trying to close current tag, and move on
              if (kElementsClosedByClosing[currentParent.nodeName]) {
                if (kElementsClosedByClosing[currentParent.nodeName][match[2]]) {
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

      // This is an entire document, so only allow the HTML children to be
      // body or head.
      if (root.childNodes.length && root.childNodes[0].nodeName === 'html') {
        (function () {
          // Store elements from before body end and after body end.
          var head = { before: [], after: [] };
          var body = { after: [] };
          var beforeHead = true;
          var beforeBody = true;
          var HTML = root.childNodes[0];

          // Iterate the children and store elements in the proper array for
          // later concat, replace the current childNodes with this new array.
          HTML.childNodes = HTML.childNodes.filter(function (el) {
            // If either body or head, allow as a valid element.
            if (el.nodeName === 'body' || el.nodeName === 'head') {
              if (el.nodeName === 'head') {
                beforeHead = false;
              }

              if (el.nodeName === 'body') {
                beforeBody = false;
              }

              return true;
            }
            // Not a valid nested HTML tag element, move to respective container.
            else if (el.nodeType === 1) {
                if (beforeHead && beforeBody) {
                  head.before.push(el);
                } else if (!beforeHead && beforeBody) {
                  head.after.push(el);
                } else if (!beforeBody) {
                  body.after.push(el);
                }
              }
          });

          // Ensure the first element is the HEAD tag.
          if (!HTML.childNodes[0] || HTML.childNodes[0].nodeName !== 'head') {
            var headInstance = pools.elementObject.get();
            headInstance.nodeName = 'head';
            headInstance.childNodes.length = 0;
            headInstance.attributes.length = 0;

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
            var bodyInstance = pools.elementObject.get();
            bodyInstance.nodeName = 'body';
            bodyInstance.childNodes.length = 0;
            bodyInstance.attributes.length = 0;

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
  };

  return htmlParser;
}

},{"./pools":17}],17:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.count = exports.pools = undefined;
exports.createPool = createPool;
exports.initializePools = initializePools;

var _uuid2 = _dereq_('./uuid');

var _uuid3 = _interopRequireDefault(_uuid2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var uuid = _uuid3.default;

var pools = exports.pools = {};
var count = exports.count = 10000;

/**
 * Creates a pool to query new or reused values from.
 *
 * @param name
 * @param opts
 * @return {Object} pool
 */
function createPool(name, opts) {
  var size = opts.size;
  var fill = opts.fill;

  var cache = {
    free: [],
    allocated: new Set(),
    protected: new Set(),
    uuid: new Set()
  };

  // Prime the cache with n objects.
  for (var i = 0; i < size; i++) {
    cache.free.push(fill());
  }

  return {
    cache: cache,

    get: function get() {
      var value = cache.free.pop() || fill();
      cache.allocated.add(value);
      return value;
    },
    protect: function protect(value) {
      cache.allocated.delete(value);
      cache.protected.add(value);

      if (name === 'elementObject') {
        cache.uuid.add(value.uuid);
      }
    },
    unprotect: function unprotect(value) {
      if (cache.protected.has(value)) {
        cache.protected.delete(value);
        cache.free.push(value);
      }
    }
  };
}

function initializePools(COUNT) {
  pools.attributeObject = createPool('attributeObject', {
    size: COUNT,

    fill: function fill() {
      return { name: '', value: '' };
    }
  });

  pools.elementObject = createPool('elementObject', {
    size: COUNT,

    fill: function fill() {
      return {
        nodeName: '',
        nodeValue: '',
        uuid: uuid(),
        childNodes: [],
        attributes: []
      };
    }
  });
}

// Create ${COUNT} items of each type.
initializePools(count);

},{"./uuid":19}],18:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.completeRender = completeRender;

var _customEvent = _dereq_('custom-event');

var _customEvent2 = _interopRequireDefault(_customEvent);

var _patch = _dereq_('../node/patch');

var _patch2 = _interopRequireDefault(_patch);

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

var _tree = _dereq_('../node/tree');

var _memory = _dereq_('../util/memory');

var _pools = _dereq_('../util/pools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderNext(elementMeta) {
  var nextRender = elementMeta.renderBuffer;
  elementMeta.renderBuffer = undefined;

  // Noticing some weird performance implications with this concept.
  (0, _patch2.default)(nextRender.element, nextRender.newHTML, nextRender.options);
}

/**
 * When the UI or Worker thread completes, clean up memory and schedule the
 * next render if necessary.
 *
 * @param element
 * @param elementMeta
 */
function completeRender(element, elementMeta) {
  return function invokeRender() {
    elementMeta.previousMarkup = elementMeta.options.inner ? element.innerHTML : element.outerHTML;
    elementMeta._textContent = element.textContent;

    (0, _memory.cleanMemory)(_make2.default);

    elementMeta.isRendering = false;

    // Boolean to stop operations in the TreeCache loop below.
    var stopLooping = false;

    // This is designed to handle use cases where renders are being hammered
    // or when transitions are used with Promises.
    if (elementMeta.renderBuffer) {
      renderNext(elementMeta);
    } else {
      _tree.TreeCache.forEach(function iterateTreeCache(elementMeta) {
        if (!stopLooping && elementMeta.renderBuffer) {
          renderNext(elementMeta);
          stopLooping = true;
        }
      });
    }

    // Dispatch an event on the element once rendering has completed.
    element.dispatchEvent(new _customEvent2.default('renderComplete'));
  };
}

},{"../node/make":6,"../node/patch":7,"../node/tree":10,"../util/memory":15,"../util/pools":17,"custom-event":22}],19:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = uuid;
/**
 * Generates a uuid.
 *
 * @see http://stackoverflow.com/a/2117523/282175
 * @return {string} uuid
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

},{}],20:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasWorker = undefined;
exports.create = create;

var _uuid = _dereq_('../util/uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _pools = _dereq_('../util/pools');

var _parser = _dereq_('../util/parser');

var _memory = _dereq_('../util/memory');

var _sync = _dereq_('../node/sync');

var _sync2 = _interopRequireDefault(_sync);

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

var _source = _dereq_('./source');

var _source2 = _interopRequireDefault(_source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Tests if the browser has support for the `Worker` API.
var hasWorker = exports.hasWorker = typeof Worker === 'function';

// Find all the coverage statements and expressions.
var COV_EXP = /__cov_([^\+\+]*)\+\+/gi;

/**
 * Awful hack to remove `__cov` lines from the source before sending over to
 * the worker. Only useful while testing.
 */
function filterOutCoverage(string) {
  return string.replace(COV_EXP, 'null');
}

/**
 * Creates a new Web Worker per element that will be diffed. Allows multiple
 * concurrent diffing operations to occur simultaneously, leveraging the
 * multi-core nature of desktop and mobile devices.
 *
 * Attach any functions that could be used by the Worker inside the Blob below.
 * All functions are named so they can be accessed globally. Since we're
 * directly injecting the methods into the ES6 template string,
 * `Function.prototype.toString` will be invoked returning a representation of
 * the function's source. This comes at a cost since Babel rewrites variable
 * names when you `import` a module. This is why you'll see underscored
 * properties being imported and then reassigned to non-underscored names in
 * modules that are reused here. Isparta injects coverage function calls that
 * will error out in the Worker, which is why we strip them out.
 *
 * @return {Object} A Worker instance.
 */
function create() {
  var worker = null;
  var workerBlob = null;
  var workerSource = filterOutCoverage('\n    // Reusable Array methods.\n    var slice = Array.prototype.slice;\n    var filter = Array.prototype.filter;\n\n    // Add a namespace to attach pool methods to.\n    var pools = {};\n    var nodes = 0;\n    var REMOVE_ELEMENT_CHILDREN = -2;\n    var REMOVE_ENTIRE_ELEMENT = -1;\n    var MODIFY_ELEMENT = 1;\n    var MODIFY_ATTRIBUTE = 2;\n    var CHANGE_TEXT = 3;\n\n    // Inject the uuid code.\n    ' + _uuid2.default + ';\n\n    // Add in pool manipulation methods.\n    ' + _pools.createPool + ';\n    ' + _pools.initializePools + ';\n\n    initializePools(' + _pools.count + ');\n\n    // Add the ability to protect elements from free\'d memory.\n    ' + _memory.protectElement + ';\n    ' + _memory.unprotectElement + ';\n    ' + _memory.cleanMemory + ';\n\n    // Add in Node manipulation.\n    var syncNode = ' + _sync2.default + ';\n    var makeNode = ' + _make2.default + ';\n\n    // Add in the ability to parseHTML.\n    ' + _parser.parseHTML + ';\n\n    var makeParser = ' + _parser.makeParser + ';\n    var parser = makeParser();\n\n    // Add in the worker source.\n    ' + _source2.default + ';\n\n    // Metaprogramming up this worker call.\n    startup(self);\n  ');

  // Set up a WebWorker if available.
  if (hasWorker) {
    // Construct the worker reusing code already organized into modules.  Keep
    // this code ES5 since we do not get time to pre-process it as ES6.
    workerBlob = new Blob([workerSource], { type: 'application/javascript' });

    // Construct the worker and start it up.
    try {
      worker = new Worker(URL.createObjectURL(workerBlob));
    } catch (ex) {
      if (console && console.info) {
        console.info('Failed to create diffhtml worker', ex);
      }

      // If we cannot create a Worker, then disable trying again, all work
      // will happen on the main UI thread.
      exports.hasWorker = hasWorker = false;
    }
  }

  return worker;
}

},{"../node/make":6,"../node/sync":9,"../util/memory":15,"../util/parser":16,"../util/pools":17,"../util/uuid":19,"./source":21}],21:[function(_dereq_,module,exports){
'use strict';

// These are globally defined to avoid issues with JSHint thinking that we're
// referencing unknown identifiers.

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = startup;
var parseHTML;
var syncNode;
var pools;
var unprotectElement;
var protectElement;
var cleanMemory;

/**
 * This is the Web Worker source code. All globals here are defined in the
 * worker/create module. This allows code sharing and less duplication since
 * most of the logic is identical to the UI thread.
 *
 * @param worker - A worker instance
 */
function startup(worker) {
  var patches = [];
  var oldTree = null;

  /**
   * Triggered whenever a `postMessage` call is made on the Worker instance
   * from the UI thread. Signals that some work needs to occur. Will post back
   * to the main thread with patch and node transform results.
   *
   * @param e - The normalized event object.
   */
  worker.onmessage = function onmessage(e) {
    var data = e.data;
    var isInner = data.isInner;
    var newTree = null;

    // If an `oldTree` was provided by the UI thread, use that in place of the
    // current `oldTree`.
    if (data.oldTree) {
      if (oldTree) {
        unprotectElement(oldTree);
        cleanMemory();
      }

      oldTree = data.oldTree;
    }

    // If the `newTree` was provided to the worker, use that instead of trying
    // to create one from HTML source.
    if (data.newTree) {
      newTree = data.newTree;
    }

    // If no `newTree` was provided, we'll have to try and create one from the
    // HTML source provided.
    else if (typeof data.newHTML === 'string') {
        // Calculate a new tree.
        newTree = parseHTML(data.newHTML, isInner);

        // If the operation is for `innerHTML` then we'll retain the previous
        // tree's attributes, nodeName, and nodeValue, and only adjust the
        // childNodes.
        if (isInner) {
          var childNodes = newTree;

          newTree = {
            childNodes: childNodes,
            attributes: oldTree.attributes,
            uuid: oldTree.uuid,
            nodeName: oldTree.nodeName,
            nodeValue: oldTree.nodeValue
          };
        }
      }

    // Synchronize the old virtual tree with the new virtual tree.  This will
    // produce a series of patches that will be executed to update the DOM.
    syncNode(oldTree, newTree, patches);

    // Protect the current `oldTree` so that Nodes will not be accidentally
    // recycled in the cleanup process.
    protectElement(oldTree);

    // Send the patches back to the userland.
    worker.postMessage({
      // All the patches to apply to the DOM.
      patches: patches
    });

    // Recycle allocated objects back into the pool.
    cleanMemory();

    // Wipe out the patches in memory.
    patches.length = 0;
  };
}

},{}],22:[function(_dereq_,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[5])(5)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _store = _dereq_('../redux/store');

var _store2 = _interopRequireDefault(_store);

var _todoApp = _dereq_('../redux/actions/todo-app');

var todoAppActions = _interopRequireWildcard(_todoApp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NOP = function NOP() {};

var TodoApp = function (_HTMLElement) {
  _inherits(TodoApp, _HTMLElement);

  function TodoApp() {
    _classCallCheck(this, TodoApp);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(TodoApp).apply(this, arguments));
  }

  _createClass(TodoApp, [{
    key: 'createdCallback',
    value: function createdCallback() {
      var _this2 = this;

      this.animateAttached = this.animateAttached.bind(this);
      this.animateDetached = this.animateDetached.bind(this);

      // Store original *injected* markup.
      this._innerHTML = this.innerHTML;

      // Necessary to track which elements were removed.
      this._removedIndexes = [];

      document.addTransitionState('attached', this.animateAttached);
      document.addTransitionState('detached', this.animateDetached);

      this.render();
      this.unsubscribeStore = _store2.default.subscribe(function () {
        return _this2.render();
      });

      this.addEventListener('submit', this.addTodo, false);
      this.addEventListener('click', this.removeTodo, false);
      this.addEventListener('change', this.toggleCompletion, false);
      this.addEventListener('dblclick', this.startEditing, false);
      this.addEventListener('submit', this.stopEditing, false);
      this.addEventListener('click', this.clearCompleted, false);
      this.addEventListener('click', this.toggleAll, false);
    }
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      document.removeTransitionState('attached', this.animateAttached);
      document.removeTransitionState('detached', this.animateDetached);

      this.unsubscribeStore();

      this.removeEventListener(this.addTodo);
      this.removeEventListener(this.removeTodo);
      this.removeEventListener(this.toggleCompletion);
      this.removeEventListener(this.startEditing);
      this.removeEventListener(this.stopEditing);
      this.removeEventListener(this.clearCompleted);
      this.removeEventListener(this.toggleAll);
    }
  }, {
    key: 'animateAttached',
    value: function animateAttached(element) {
      if (element.matches('footer.info')) {
        return new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 250 }).onfinish = resolve;
        }).then(function () {
          element.style.opacity = 1;
        }).then(NOP, NOP);
      }

      // Animate Todo item being added.
      if (element.matches('.todo-list li, footer.info')) {
        return new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 250 }).onfinish = resolve;
        }).then(NOP, NOP);
      }

      // Animate the entire app loading.
      if (element.matches('.todoapp')) {
        return new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'translateY(100%)', easing: 'ease-out' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 375 }).onfinish = resolve;
        }).then(NOP, NOP);
      }
    }
  }, {
    key: 'animateDetached',
    value: function animateDetached(el) {
      var _this3 = this;

      // We are removing an item from the list.
      if (el.matches('.todo-list li')) {
        var _ret = function () {
          var rows = _this3.querySelectorAll('.todo-list li');
          var actualElement = rows[_this3._removedIndexes.shift()];

          return {
            v: new Promise(function (resolve) {
              return actualElement.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.5)' }], { duration: 250 }).onfinish = resolve;
            }).then(NOP, NOP)
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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

      this._removedIndexes.push(index);

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
    }
  }, {
    key: 'stopEditing',
    value: function stopEditing(ev) {
      if (!ev.target.matches('.edit-todo')) {
        return;
      }

      ev.preventDefault();

      var li = ev.target.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);
      var editTodo = ev.target.querySelector('.edit');

      _store2.default.dispatch(todoAppActions.stopEditing(index, editTodo.value));
    }
  }, {
    key: 'clearCompleted',
    value: function clearCompleted(ev) {
      var _this4 = this;

      if (!ev.target.matches('.clear-completed')) {
        return;
      }

      var todoApp = _store2.default.getState()[this.dataset.reducer];

      todoApp.todos.forEach(function (todo, i) {
        if (todo.completed === true) {
          _this4._removedIndexes.push(i);
        }
      });

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
    key: 'getTodoClassNames',
    value: function getTodoClassNames(todo) {
      return [todo.completed ? 'completed' : '', todo.editing ? 'editing' : ''].filter(Boolean).join(' ');
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      var todoApp = _store2.default.getState()[this.dataset.reducer];

      localStorage['diffhtml-todos'] = JSON.stringify(todoApp.todos);

      this.diffInnerHTML = '\n      <section class="todoapp">\n        <header class="header">\n          <h1>todos</h1>\n\n          <form class="add-todo">\n            <input\n              class="new-todo"\n              placeholder="What needs to be done?"\n              autofocus="">\n          </form>\n        </header>\n\n        ' + (todoApp.todos.length ? '\n          <section class="main">\n            <input class="toggle-all" type="checkbox">\n\n            <ul class="todo-list">\n              ' + todoApp.todos.map(function (todo) {
        return '\n                <li class="' + _this5.getTodoClassNames(todo) + '">\n                  <div class="view">\n                    <input class="toggle" type="checkbox"\n                      ' + (todo.completed ? 'checked' : '') + '>\n\n                    <label>' + todo.title + '</label>\n                    <button class="destroy"></button>\n                  </div>\n\n                  <form class="edit-todo">\n                    <input value="' + todo.title + '" class="edit">\n                  </form>\n                </li>\n              ';
      }).join('\n') + '\n            </ul>\n          </section>\n\n          <footer class="footer">\n            <span class="todo-count">\n              <strong>' + todoApp.getRemaining().length + '</strong>\n              ' + (todoApp.getRemaining().length == 1 ? 'item' : 'items') + ' left\n            </span>\n\n            <button class="clear-completed">Clear completed</button>\n          </footer>\n        ' : '') + '\n      </section>\n\n      ' + this._innerHTML + '\n    ';
    }
  }]);

  return TodoApp;
}(HTMLElement);

exports.default = TodoApp;

},{"../redux/actions/todo-app":4,"../redux/store":6}],3:[function(_dereq_,module,exports){
'use strict';

_dereq_('./util/diffhtml');

var _todoApp = _dereq_('./components/todo-app');

var _todoApp2 = _interopRequireDefault(_todoApp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.registerElement('todo-app', _todoApp2.default);

},{"./components/todo-app":2,"./util/diffhtml":7}],4:[function(_dereq_,module,exports){
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

},{}],5:[function(_dereq_,module,exports){
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

  getRemaining: function getRemaining() {
    return this.todos.filter(function (todo) {
      return !todo.completed;
    });
  },
  getCompleted: function getCompleted() {
    return this.todos.filter(function (todo) {
      return todo.completed;
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

            title: action.title.trim()
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

},{"../actions/todo-app":4}],6:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = _dereq_('redux');

var _reduxLogger = _dereq_('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _todoApp = _dereq_('./reducers/todo-app');

var _todoApp2 = _interopRequireDefault(_todoApp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Makes a reusable function to create a store. Currently not exported, but
// could be in the future for testing purposes.
var createStoreWithMiddleware = (0, _redux.compose)(
// Adds in store middleware, such as async thunk and logging.
(0, _redux.applyMiddleware)((0, _reduxLogger2.default)()),

// Hook devtools into our store.
window.devToolsExtension ? window.devToolsExtension() : function (f) {
  return f;
})(_redux.createStore);

// Compose the root reducer from modular reducers.
exports.default = createStoreWithMiddleware((0, _redux.combineReducers)({
  // Encapsulates all TodoApp state.
  todoApp: _todoApp2.default,

  // Store the last action taken.
  lastAction: function lastAction(state, action) {
    return action;
  }
}), {});

},{"./reducers/todo-app":5,"redux":14,"redux-logger":8}],7:[function(_dereq_,module,exports){
'use strict';

var _diffhtml = _dereq_('diffhtml');

// Support older browsers (Custom Elements polyfill and element extensions).
(0, _diffhtml.enableProllyfill)();

},{"diffhtml":1}],8:[function(_dereq_,module,exports){
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
},{}],9:[function(_dereq_,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.__esModule = true;
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
},{"./compose":12}],10:[function(_dereq_,module,exports){
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
},{}],11:[function(_dereq_,module,exports){
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

  return 'Reducer "' + key + '" returned undefined handling ' + actionName + '. ' + 'To ignore an action, you must explicitly return the previous state.';
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
},{"./createStore":13,"./utils/warning":15,"lodash/isPlainObject":19}],12:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = compose;
/**
 * Composes single-argument functions from right to left.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing functions from right to
 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
 */
function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  return function () {
    if (funcs.length === 0) {
      return arguments.length <= 0 ? undefined : arguments[0];
    }

    var last = funcs[funcs.length - 1];
    var rest = funcs.slice(0, -1);

    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}
},{}],13:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports["default"] = createStore;

var _isPlainObject = _dereq_('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

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
   * 2. The listener should not expect to see all states changes, as the state
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

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  };
}
},{"lodash/isPlainObject":19}],14:[function(_dereq_,module,exports){
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
},{"./applyMiddleware":9,"./bindActionCreators":10,"./combineReducers":11,"./compose":12,"./createStore":13,"./utils/warning":15}],15:[function(_dereq_,module,exports){
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
    // This error was thrown as a convenience so that you can use this stack
    // to find the callsite that caused this warning to fire.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
},{}],16:[function(_dereq_,module,exports){
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetPrototype = Object.getPrototypeOf;

/**
 * Gets the `[[Prototype]]` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {null|Object} Returns the `[[Prototype]]`.
 */
function getPrototype(value) {
  return nativeGetPrototype(Object(value));
}

module.exports = getPrototype;

},{}],17:[function(_dereq_,module,exports){
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

},{}],18:[function(_dereq_,module,exports){
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

},{}],19:[function(_dereq_,module,exports){
var getPrototype = _dereq_('./_getPrototype'),
    isHostObject = _dereq_('./_isHostObject'),
    isObjectLike = _dereq_('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
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
 * @returns {boolean} Returns `true` if `value` is a plain object,
 *  else `false`.
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

},{"./_getPrototype":16,"./_isHostObject":17,"./isObjectLike":18}]},{},[3]);
