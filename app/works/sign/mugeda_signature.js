var MugedaSignature = (function() {

	var isM = isMobile();

	function extend() {
		function isPlainObject(obj) {
			var class2type = {},
			core_toString = class2type.toString,
			core_hasOwn = class2type.hasOwnProperty;
			function type(obj) {
				if (obj == null) {
					return String(obj);
				}
				return typeof obj === "object" || typeof obj === "function" ? class2type[core_toString.call(obj)] || "object": typeof obj;
			}
			function isWindow(obj) {
				return obj != null && obj === obj.window;
			}
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

	function isMobile() {
		var isMobile = navigator.userAgent.match(/Android/i) 
			|| navigator.userAgent.match(/webOS/i) 
			|| navigator.userAgent.match(/iPhone/i) 
			|| navigator.userAgent.match(/iPad/i) 
			|| navigator.userAgent.match(/iPod/i) 
			|| navigator.userAgent.match(/BlackBerry/i) 
			|| navigator.userAgent.match(/Windows Phone/i);
		return isMobile ? true: false;
	}

 /*********************************************************************
 * Pencil 
 *********************************************************************/
	var Pencil = function(data) {
		var defaultData = {
			'lastPoint': null,
			'curve': {
				'points': [],
				'smooth': 3
			}
		}
		this.data = extend({},
		defaultData, data);
		for (var key in this.data) {
			this[key] = this.data[key];
		}
	}

	Pencil.prototype = {
		addPoint: function(e, t) {
			if (!this.lastPoint) return;
			var n = this.curve.points;
			var r = .2;
			var i = r * (e - this.lastPoint.x);
			var s = r * (t - this.lastPoint.y);
			var o = this.createTriPoint((e + this.lastPoint.x) / 2, (t + this.lastPoint.y) / 2, e - i, t - s, this.lastPoint.x + i, this.lastPoint.y + s);
			n.push(o)
		},
		updatePoints: function(e, t, n, r, i) {
			function s(e, t, n, r) {
				return Math.sqrt(Math.pow(e - n, 2) + Math.pow(t - r, 2))
			}
			var o = Math.pow(2, this.curve.smooth);
			if (this.lastPoint) {
				if (s(this.lastPoint.x, this.lastPoint.y, n, r) > o) {
					this.addPoint(n, r);
					this.lastPoint.x = n;
					this.lastPoint.y = r
				}
			} else {
				this.lastPoint = {};
				this.lastPoint.x = e;
				this.lastPoint.y = t
			}
		},
		setStartPoint: function(e, t, n) {
			this.editStartX = e;
			this.editStartY = t;
		},
		setEndPoint: function(e, t, n) {
			this.editEndX = e;
			this.editEndY = t
			this.updatePoints(this.editStartX, this.editStartY, this.editEndX, this.editEndY, n)
		},
		createTriPoint: function(x0, y0, x1, y1, x2, y2) {
			var triPoint = {
				nodeX: x0 ? x0: 0,
				nodeY: y0 ? y0: 0,
				forwardX: x1 ? x1: 0,
				forwardY: y1 ? y1: 0,
				backwardX: x2 ? x2: 0,
				backwardY: y2 ? y2: 0
			};
			return triPoint;
		},
		draw: function(ctx, pointIndex) {
			ctx.save();
			ctx.beginPath();
			for (var i = 0, points = this.curve.points, drawLen = points.length; i < drawLen - 1; i++) {
				if (pointIndex != undefined && i > pointIndex) {
					ctx.stroke();
					ctx.restore();
					return;
				}
				point1 = points[i];
				point2 = points[i + 1];
				if (i == 0) ctx.moveTo(point1.nodeX, point1.nodeY);
				ctx.bezierCurveTo(point1.forwardX, point1.forwardY, point2.backwardX, point2.backwardY, point2.nodeX, point2.nodeY);
			}
			ctx.stroke();
			ctx.restore();
		}
	}

	var Signature = function() {
		this.defaultOption = {
			parent: null,
			left: 0,
			top: 0,
			width: 320,
			height: 240,
			backgroundColor: '#fff',
			color: 'rgb(224, 0, 57)',
			lineWidth: 4,
			linecap: 'round',
			linejoin: 'round',
			smooth: 3,
			globalAlpha: 1,
			showTool: true,
			renderTime:2000,
			clearImgSrc:getClearImage(),
			okImgSrc:getOkImage(),
			backImgSrc:getBackImage(),
			okCallback: function(data) {},
			cancelCallback:function(el){}
		};
		this.data = {width:0,height:0,pencils:[]};
	}
	Signature.prototype = {
		create: function(option) {
			this.options = extend({},
			this.defaultOption, option);
			var self = this;
			var options = self.options;
			var signDiv = document.createElement("div");
			signDiv.setAttribute("class", "signDiv");
			signDiv.innerHTML = '<div class="signTool">' 
			+ '<img src="'+options.clearImgSrc+'" class="toolbtn signToolClear" />'
			+ '<img src="'+options.backImgSrc+'" class="toolbtn signToolBack" />'
			+ '<style>.signDiv{position:relative;}.signTool{position:absolute;bottom:0px;width:125px;height:32px;right:5px;text-align:right;}' 
			+ '.signTool .toolbtn{margin-left:5px;}' 
			+ '.signTool .toolbtn:hover{box-shadow:rgba(0,0,0,.4) 0 0 8px;-webkit-box-shadow:rgba(0,0,0,.4) 0 0 8px;}' 
			+ '</style>' 
			+ '<img src="'+options.okImgSrc+'" class="toolbtn signToolOk" />'
			+ '</div>'
			+ '</div>'
			this.canvas = document.createElement("canvas");
			this.canvas.style.position = 'relative';
			this.canvas.style.backgroundColor = options.backgroundColor;
			this.canvas.style.strokeStyle = options.color;
			if (options.parent) {
				var width = getStyle(options.parent, "width", true);
				var height = getStyle(options.parent, "height", true);
				this.canvas.width = width;
				this.canvas.height = height;
				signDiv.style.width = width + 'px';
				signDiv.style.height = height + 'px';
				options.parent.innerHTML = "";
				signDiv.insertBefore(this.canvas, signDiv.firstChild);
				options.parent.appendChild(signDiv);
			} else {
				var width = options.width;
				var height = options.height;
				this.canvas.width = width;
				this.canvas.height = height;
				signDiv.style.width = width + 'px';
				signDiv.style.height = height + 'px';
				signDiv.style.position = 'absolute';
				signDiv.style.top = options.top + 'px';
				signDiv.style.left = options.left + 'px';
				signDiv.insertBefore(this.canvas, signDiv.firstChild);
				document.body.appendChild(signDiv);
			}
			this.data.width = this.canvas.width;
			this.data.height = this.canvas.height;
			this.dealSignDiv(signDiv);
			this.context = this.canvas.getContext("2d");
			self.setStyle();
			E(function(e) {
				e.stopPropagation();
				e.preventDefault();
				if (!options.showTool) return false;
				var pencil = new Pencil();
				pencil.curve.smooth = self.options.smooth;
				self.pencil = pencil;
				pencil.curve.points = [];
				pencil.lastPoint = null;
				var position = getPointOnCanvas(self.canvas, e);
				pencil.setStartPoint(position.x, position.y);
				pencil.setEndPoint(position.x, position.y);
			},isM ? "touchstart": "mousedown", self.canvas);
			E(function(e) {
				if (!self.pencil) return;
				var position = getPointOnCanvas(self.canvas, e);
				self.pencil.setEndPoint(position.x, position.y, 0);
				self.clear();
				self.draw();
			},isM ? "touchmove": "mousemove", self.canvas);
			E(function(e) {
				if(!self.pencil) return;
				if (self.pencil.curve.points.length > 0) {
					self.data.pencils.push(self.pencil);
				}
				self.pencil = null;
			},isM ? "touchend": "mouseup", self.canvas);
		},
		clear: function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		render: function(option) {
			if (this.canvas) {
				var signDiv = this.canvas.parentNode;
				if (signDiv) {
					signDiv.parentNode.removeChild(signDiv);
				}
			}
			var data = option.data;
			if(!data){
				this.create(option);
				return;
			}
			if (typeof data === "string") {
				data = this.unzip(data);
				if(!data) return;
			}
			var pencilData = {width:data.width,height:data.height,pencils:[]};
			var ow=option.width;
			var oh=option.height;
			var nw=pencilData.width;
			var nh=pencilData.height;
			var newW=ow;
			var newH=oh;
			if(nw>ow || nh>oh){
				if(nw/nh>ow/oh){
					newW = ow;
					newH = ow*(nh/nw);
				}
				else{
					newH = oh;
					newW = oh*(nw/nh);
				}
			}
			var vs = nw/newW;
			this.create(option);
			for (var index in data.pencils) {
				var item = data.pencils[index];
				if(vs>1){
					for(var i=0,points=item.curve.points,l=points.length;i<l;i++){
						var point = points[i];
						point.backwardX/=vs;
						point.backwardY/=vs;
						point.forwardX/=vs;
						point.forwardY/=vs;
						point.nodeX/=vs;
						point.nodeY/=vs;
					}
				}
				pencilData.pencils.push(new Pencil(item));
			}
			this.data = pencilData;
			if(this.options.renderTime<=0){
				this.draw();
			}
			else{
				this.redraw();
			}
		},
		draw: function() {
			for (var i = 0, l = this.data.pencils.length; i < l; i++) {
				var pencil = this.data.pencils[i];
				pencil.draw(this.context);
			}
			if (this.pencil) {
				this.pencil.draw(this.context);
			}
		},
		redraw: function() {
			var self = this;
			var pencilIndex = 0;
			var pointIndex = 0;
			var pencilLength = this.data.pencils.length;
			if(pencilLength===0) return;
			var realTime = Math.floor(self.options.renderTime/this.getPointsLength());
			var re = setInterval(function() {
				self.clear();
				for (var i = 0; i < pencilIndex; i++) {
					var pencil = self.data.pencils[i];
					pencil.draw(self.context);
				}
				var currentPen = self.data.pencils[pencilIndex];
				if(!currentPen) return;
				currentPen.draw(self.context, pointIndex);
				if (pointIndex === currentPen.curve.points.length - 1) {
					if (pencilIndex === pencilLength - 1) {
						clearInterval(re);
						return;
					}
					pencilIndex++;
					pointIndex = 0;
				}
				else {
					pointIndex++;
				}
			},realTime);
		},
		getPointsLength:function(){
			var len =0;
			for(var i=0,l=this.data.pencils.length;i<l;i++){
				len += this.data.pencils[i].curve.points.length;
			}
			return len;
		},
		setStyle: function() {
			var ctx = this.context;
			var options = this.options;
			ctx.lineWidth = options.lineWidth;
			ctx.lineCap = options.lineCap;
			ctx.lineJoin = options.linejoin;
			ctx.globalAlpha = options.globalAlpha;
			ctx.strokeStyle = options.color;
		},
		dealSignDiv: function(el) {
			var self = this;
			var canvas = el.firstChild;
			var toolDiv = el.lastChild;
			if (toolDiv) {
				toolDiv.style.display = self.options.showTool ? "block": "none";
				var clearBtn = toolDiv.firstChild;
				var okBtn = toolDiv.lastChild;
				var backBtn = toolDiv.getElementsByClassName("signToolBack")[0];
				if(!clearBtn) return;
				E(function() {
					self.clearStart = true;
				},isM ? "touchstart": "mousedown", clearBtn);
				E(function() {
					if (!self.clearStart) return false;
					self.clear();
					self.data.pencils = [];
					self.clearStart = false;
				},isM ? "touchend": "mouseup", clearBtn);

				if(!okBtn) back;
				E(function(e) {
					self.okStart = true;
				},isM ? "touchstart": "mousedown", okBtn);
				E(function(e) {
					if (!self.okStart) return false;
					self.okStart = false;
					var zipData = self.zip();
					self.options.okCallback(JSON.stringify(zipData));
				},isM ? "touchend": "mouseup", okBtn);
				
				if(!backBtn) return;
				E(function(e) {
					self.backStart = true;
				},isM ? "touchstart": "mousedown", backBtn);
				E(function(e) {
					if (!self.backStart) return false;
					self.backStart = false;
					self.data.pencils.splice(-1,1);
					self.clear();
					self.draw();
					//self.options.cancelCallback(self);
				},isM ? "touchend": "mouseup", backBtn);
			}
		},
		hide: function() {
			if (this.options.parent) {
				this.options.parent.style.display = "none";
			} else {
				this.canvas.parentNode.style.display = "none";
			}
		},
		show: function() {
			if (this.options.parent) {
				this.options.parent.style.display = "block";
			} else {
				this.canvas.parentNode.style.display = "block";
			}
		},
		zip: function() {
			var cpData = JSON.parse(JSON.stringify(this.data));
			var pencils = cpData.pencils;
			for (var index in pencils) {
				var item = pencils[index];
				delete item.data;
				delete item.lastPoint;
				delete item.editEndX;
				delete item.editEndY;
				delete item.editStartX;
				delete item.editStartY;
				this.zipCurve(item);
			}
			return cpData;
		},
		unzip: function(strData) {
			var data = [];
			try {
				data = JSON.parse(strData);
			} catch(e) {
				return;
			}
			for (var index in data.pencils) {
				var item = data.pencils[index];
				this.unzipCurve(item);
			}
			return data;
		},
		zipCurve: function (object) {
			var points = object.curve.points;
			if (typeof points == 'string'){
				var pts = points.split(';');
				points = [];
				for (var i = 0; i < pts.length; i ++) {
					var pt=pts[i].split(',');
					points.push({
						backwardX : Number(pt[0]),
						backwardY : Number(pt[1]),
						forwardX : Number(pt[2]),
						forwardY : Number(pt[3]),
						nodeX : Number(pt[4]),
						nodeY : Number(pt[5])
					});
				}
			}
			var ret = [];
			ret.push(object.curve.closed ? 1 : 0);
			for (var i = 0; i < points.length; i++) {
				var pt = points[i];
				ret.push(pt.backwardX);
				ret.push(pt.backwardY);
				ret.push(pt.forwardX);
				ret.push(pt.forwardY);
				ret.push(pt.nodeX);
				ret.push(pt.nodeY);
			}
			object.curve = ret.join(',');
		},
		unzipCurve: function (object) {
			var curve = object.curve;
			if (typeof curve != 'string') return;
			object.curve = {};
			var pts = curve.split(',');
			var closed = pts.shift() == 1;
			var points = [];
			for (var i = 0; i < pts.length; i += 6) {
				points.push({
					backwardX : Number(pts[i]),
					backwardY : Number(pts[i + 1]),
					forwardX : Number(pts[i + 2]),
					forwardY : Number(pts[i + 3]),
					nodeX : Number(pts[i + 4]),
					nodeY : Number(pts[i + 5])
				});
			}
			object.curve.points = points;
		}
	}

	function getClearImage(){
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAARVBMVEX///9mZmZmZmZmZmZmZmZmZmZycnJsbGxmZmanp6eTk5OEhIR9fX1ycnLMzMzExMS8vLy2traqqqqnp6fe3t7X1tfMzMx4+DUiAAAAF3RSTlMAEURmd4i7u7vMzMzMzN3d3d3d3e7u7jbX52QAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMjcvMTRwI2jIAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M1cbXjNgAAALpJREFUOI2tk1kOwyAMRIGE4CY0Swvc/6hFLGGz5Krq/CVvMN5g7I/iQkKQFBzDM1SaB4uATqLlU88BJoI3jiF+dwvHOUDOtMkfVrs/cy1YgM0Zc6omRJOBtsbrUHUWsj4fuI+hw6cMBoT7GPFHZyjcWMyw7Dd3K2JYznJ+g9FQcadhNOir8Hw+GWKZKJdVo153gYWnRsVWq0fklyo8TysN6x1aWPP523GTC0OvHL209NrTD4eRT+9nfQByhxkiEToxhQAAAABJRU5ErkJggg==';
	}
	
	function getOkImage(){
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAASFBMVEX///9mZmZmZmZmZmZmZmZmZmZycnJra2tmZmaZmZmVlZWMjIyGhoZ8fHxycnLMzMzIyMi+vb61tbWtra2lpaXe3t7W1tbMzMzUMzqRAAAAGHRSTlMAEURmd4i7u7vMzMzMzMzd3d3d3d3u7u71q+/NAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFnRFWHRDcmVhdGlvbiBUaW1lADAyLzI3LzE0cCNoyAAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAADFSURBVDiNrZPhDoMgDIQFQW86pqDV93/TIUFngYRlWf/BfRxtKU3zxxBSI4SWoiQr3EJliEQSkuttqgNtRWdE5p/cIso6cGaqkv2nNbGWssG408IskgweRORYFprpg9fJxoUOQFz04WKzHQCNcfMGvCwNnpqCvq05sBJNPZagO4Mc6J03Noe8n/4cQLfRPB/HO5QBjMF+BVLgKtNmuuaN8iU6psdGfVq9TB0HRPmxrlDfPnd1YOojVx/a+tjXP05T/Xo/xxsHfRcudKF2fgAAAABJRU5ErkJggg==';
	}

	function getBackImage(){
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAASFBMVEX///9mZmZmZmZmZmZmZmZmZmZxcXFra2tmZmajo6OVlZWMjIyEhIR7fHxxcXHMzMzFxcW+vr6zs7OsrKze3t7W1tbR0tLMzMxVCj1wAAAAGHRSTlMAEURmd4i7u7vMzMzMzMzd3d3d3e7u7u4XNbiCAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFnRFWHRDcmVhdGlvbiBUaW1lADAyLzI3LzE0cCNoyAAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAADgSURBVDiNrVNbDoQgDBTkUR8sqEXvf9MVBS1oQrLZ+TCGmU5LW5rmj2BcwgHJ2RstgEA8JBwK8JxvSx6grfCZgvqbST2yMBqnrRvTf6o0qx8GxCWaiBcD+Iwr4tZTC1KB6aadDpjNXYW868MbPpzIQ5D4jtC4nkmooI+Rq9+/m4FSoEJyP/ejXhBt5KlgCXFHByZ0V6+IIBgfvEGn4V3gzkbNV3wUyJTCQQlJGqVtTEHBaav3GWyqELBsWMMar3FBFONWnfOLeRqQcenBkjuStaytXH1p62tffzhN9en9jC9rfBio5Pj6fgAAAABJRU5ErkJggg=='
	}

	return Signature;
})();
