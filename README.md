TodoMVC
-------

This is an experimental project to make a TodoMVC with Custom Elements and
diffHTML to handle Virtual DOM operations.

# diffHTML TodoMVC Example

> diffHTML is an experimental library for building components and structuring applications with a virtual DOM and declarative HTML interface.

> _[diffHTML - www.diffhtml.org](https://www.diffhtml.org/)_

## Learning diffHTML

The [diffHTML website](https://www.diffhtml.org) is a great resource for getting started.

Get help from diffHTML devs and users:

* Find us on Gitter -
	[https://gitter.im/tbranyen/diffhtml](https://gitter.im/tbranyen/diffhtml)

## Implementation

The diffHTML implementation of TodoMVC has a few key differences from other
implementations:

* [Custom Elements](http://w3c.github.io/webcomponents/explainer/) allow you to
	create new HTML elements that are reusable, composable, and encapsulated.
* [Transitions](https://github.com/tbranyen/diffhtml#add-a-transition-state-callback)
	are added since they are trivial to write with diffHTML. They provide a
	smoother and more pleasing experience by adding animations that hook into the
	rendering engine.

## Compatibility

This example should run in all major browsers, although the Web Animations
specification will only work in browsers that support it.

## Running this sample

1. Start an HTTP server in the root directory of `todomvc/` and navigate to
	 `/diffhtml` to run this sample.

	 Hint: if you have python installed, you can just run: `python -m SimpleHTTPServer`

## Building this sample

1. Install [Node.js](https://www.nodejs.org) (contains NPM for package management)
2. From the `todomvc/` folder, run `npm install` followed by an `npm run build`
3. Run the http server from the above "Running this sample" section
4. If you're continually updating you can run `npm run watch` to monitor
	 changes and re-build automatically
