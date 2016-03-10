var isM = isMobile();
var START = isM ? "touchstart": "mousedown";
var MOVE = isM ? "touchmove": "mousemove";
var END = isM ? "touchend": "mouseup";

function isMobile() {
	var isMobile = navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i);
	return isMobile ? true: false;
}

function type(obj) {
	var class2type = {},
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty;
	if (obj == null) {
		return String(obj);
	}
	return typeof obj === "object" || typeof obj === "function" ? class2type[core_toString.call(obj)] || "object": typeof obj;
}

function isPlainObject(obj) {
	function isWindow(obj) {
		return obj != null && obj === obj.window;
	}
	var class2type = {},
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty;
	if (type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
		return false;
	}
	try {
		if (obj.constructor && ! core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
			return false;
		}
	} catch(e) {
		return false;
	}
	return true;
}

function extend() {
	var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
	i = 1,
	length = arguments.length,
	deep = false;
	if (typeof target === "boolean") {
		deep = target;
		target = arguments[1] || {};
		i = 2;
	}
	if (typeof target !== "object" && ! this.isFunction(target)) {
		target = {};
	}
	if (length === i) {
		target = this; --i;
	}
	for (; i < length; i++) {
		if ((options = arguments[i]) != null) {
			for (name in options) {
				src = target[name];
				copy = options[name];
				if (target === copy) {
					continue;
				}
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && this.isArray(src) ? src: [];
					} else {
						clone = src && isPlainObject(src) ? src: {};
					}
					target[name] = this.extend(deep, clone, copy);
				}
				else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}
	return target;
}

function getStyle(element, style, needInt) {
	var value = getComputedStyle(element)[style];
	return needInt ? parseInt(value) : value;
}

function E(f, e, o) {
	if (!e) e = 'load';
	if (!o) o = window;
	if (o.attachEvent) {
		o.attachEvent('on' + e, f)
	} else {
		o.addEventListener(e, f, false)
	}
}

function getTarget(e) {
	var ex = e || window.event;
	var target = ex.target || ex.srcElement;
	return target;
}

function E_Click(f, o) {
	var target = null;
	var isFire = true;
	E(function(e) {
		target = getTarget(e);
	},
	START, o);
	E(function(e) {
		if (isFire) {
			var fTarget = getTarget(e);
			if (target === fTarget) {
				f(e, fTarget);
			}
		}
		target = null;
		isFire = true;
	},
	END, o);
}

function getPointOnCanvas(canvas, e) {
	var bbox = canvas.getBoundingClientRect();
	var x = 0,
	y = 0;
	if (isM) {
		var touch = e.touches[0];
		x = touch.clientX;
		y = touch.clientY;
	}
	else {
		x = e.pageX;
		y = e.pageY;
	}
	return {
		x: x - bbox.left * (canvas.width / bbox.width),
		y: y - bbox.top * (canvas.height / bbox.height)
	};
}

function ajax(o) {
	var b = /POST/i.test(o.type),
	p = o.data || '',
	t = o.dataType,
	url = o.url || location.href,
	q = /\?/.test(url) ? '&': '?',
	x = window.XMLHttpRequest ? new XMLHttpRequest() : (new ActiveXObject('Msxml2.XMLHTTP') || new ActiveXObject('Microsoft.XMLHTTP')),
	z = function(s) {
		if (x.readyState == 4) {
			if (x.status == 200) {
				s = x.responseText;
				if (t == 'json') s = json(s);
				if (b = o.success) b(s)
			} else if (o.error) {
				o.error(x.status, x)
			}
		}
	};
	x.onreadystatechange = z;
	if (typeof p == 'object') {
		var r = [];
		for (var k in p)
		r.push(encodeURIComponent(k) + '=' + encodeURIComponent(p[k]));
		p = r.join('&')
	}
	x.open(b ? 'POST': 'GET', url + (b ? '': ((p ? q: '') + p + (o.cache ? '': (((!p && q == '?') ? '?': '&') + '_=' + new Date().getTime())))), o.async === false ? false: true);
	if (b) x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	x.send(p);
	return x;
}

function stopDefault(e) {
	e.preventDefault();
	e.stopPropagation();
}

function eRandom(m,n,isInt){
	var max = Math.max(m,n);
	var min = Math.min(m,n);
	var result = min + (max-min)*Math.random();
	return isInt ? Math.round(result) : result;
}

function randomColor(){
	return "rgba(" + [eRandom(0,255,true),eRandom(0,255,true),eRandom(0,255,true),Math.random().toFixed(2)] +")"
}

function randomAngle(){
	return eRandom(-Math.PI,Math.PI);
}
