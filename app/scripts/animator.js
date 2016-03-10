!(function(){
	var Matrix = function (a, b, c, d, tx, ty) {
		a = a || 1;
		b = b || 0;
		c = c || 0;
		d = d || 1;
		tx = tx || 0;
		ty = ty || 0;

		var that = this;

		that._a = a;
		that._b = b;
		that._c = c;
		that._d = d;
		that._tx = tx;
		that._ty = ty;
	};

	var proto = Matrix.prototype;

	proto._decomposingMatrix = function () {
		var that = this;

		var obj = {};
		obj._x = that._tx;
		obj._y = that._ty;

		// col0
		var a = that._a;
		var b = that._b;

		// col1
		var c = that._c;
		var d = that._d;



		obj._scaleX = Math.sqrt(a * a + b * b);
		obj._scaleY = Math.sqrt(c * c + d * d);

		obj._rotation = Math.atan2(b, a);

	};

	proto._getA = function () { return this._a; };
	proto._setA = function (v) { this._a = v; };
	proto._getB = function () { return this._b; };
	proto._setB = function (v) { this._a = v; };
	proto._getC = function () { return this._c; };
	proto._setC = function (v) { this._a = v; };
	proto._getD = function () { return this._d; };
	proto._setD = function (v) { this._a = v; };

	proto._getScaleX = function () {
		var matrix = this;
		var a = matrix._a;
		var b = matrix._b;

		return Math.sqrt(a * a + b * b);
	};

	proto._getScaleY = function () {
		var matrix = this;
		var c = matrix._c;
		var d = matrix._d;

		return Math.sqrt(c * c + d * d);
	};

	proto._setScaleX = function (v) {
		var matrix = this;
		matrix._scale(1 / matrix._getScaleX() * v, 1);
	};

	proto._setScaleY = function (v) {
		var matrix = this;
		matrix._scale(1 / matrix._getScaleY() * v, 1);
	};

	proto._getRotation = function () {
		var matrix = this;

		var a = matrix._a;
		var b = matrix._b;
		return Math.atan2(b, a);
	};

	proto._setRotation = function (v) {
		var matrix = this;
		matrix._rotate(-matrix._getRotation() + v);
	};

	proto._createBox = function (scaleX, scaleY, rotation, tx, ty) {
		var that = this;
		var cosQ = Math.cos(rotation);
		var sinQ = Math.sin(rotation);

		that._a = scaleX * cosQ;
		that._b = scaleX * sinQ;
		that._c = -scaleY * sinQ;
		that._d = scaleY * cosQ;
		that._tx = tx;
		that._ty = ty;
	};

	proto._translate = function (dx, dy) {
		var that = this;
		that._tx += dx;
		that._ty += dy;
	};

	proto._scale = function (sx, sy) {
		var that = this;

		that._a *= sx;
		that._b *= sy;
		that._c *= sx;
		that._d *= sy;
		that._tx *= sx;
		that._ty *= sy;
	};

	proto._rotate = function (angle) {
		var that = this;
		var cosQ = Math.cos(angle);
		var sinQ = Math.sin(angle);

		var a = that._a;
		var b = that._b;
		var c = that._c;
		var d = that._d;
		var tx = that._tx;
		var ty = that._ty;

		that._a = a * cosQ - b * sinQ;
		that._b = a * sinQ + b * cosQ;
		that._c = c * cosQ - d * sinQ;
		that._d = c * sinQ + d * cosQ;
		that._tx = tx * cosQ - ty * sinQ;
		that._ty = tx * sinQ + ty * cosQ;
	};

	proto._skew = function (angleX,angleY){
		var that = this;
		var tanX = Math.tan(angleX);
		var tanY = Math.tan(angleY);

		var a = that._a;
		var b = that._b;
		var c = that._c;
		var d = that._d;
		var tx = that._tx;
		var ty = that._ty;

		that._a = a + b*tanX;
		that._b = b + a*tanY;
		that._c = c + d*tanX;
		that._d = d + c*tanY;
		that._tx = tx + ty*tanX;
		that._ty = ty + tx*tanY;

	}

	proto._compare = function (matrix) {
		var that = this;
		return that._a === matrix._a && that._b === matrix._b && that._c === matrix._c && that._tx === matrix._tx && that._ty === matrix._ty;
	};

	Matrix._multiplication = function (A, B) {
		return new Matrix(A._a * B._a + A._c * B._b, A._b * B._a + A._b * B._b, A._a * B._c + A._c * B._d, A._b * B._c + A._d * B._d, A._a * B._tx + A._c * B._ty + A._tx, A._b * B._tx + A._d * B._ty + A._ty);
	};

	proto._toCssText = function () {
		var matrix = this;
		var arr = ['_a','_b','_c','_d','_tx','_ty'].map(function(item){return matrix[item]});
		return 'matrix(' + arr.join(',') + ')';
	};

	Matrix._getMatrix = function(cssText){
		var arr = cssText.split(',');
		var r = arr.map(function(item,index){
			var value = index?item.substring(item.indexOf('(')+1,item.length):index.toString().trim();
			return parseFloat(value);
		});
		return new Matrix(r[0],r[1],r[2],r[3],r[4],r[5]);
	}

	var TWEEN = {};

	TWEEN.Easing = { 
		Linear: {}, 
		Quadratic: {}, 
		Cubic: {}, 
		Quartic: {}, 
		Quintic: {}, 
		Sinusoidal: {}, 
		Exponential: {}, 
		Circular: {}, 
		Elastic: {}, 
		Back: {}, 
		Bounce: {}, 
		Step: {} 
	};

	TWEEN.Easing.Linear.EaseNone = function (k) {
		return k;
	};
	//
	TWEEN.Easing.Quadratic.EaseIn = function (k) {
		return k * k;
	};
	TWEEN.Easing.Quadratic.EaseOut = function (k) {
		return -k * (k - 2);
	};
	TWEEN.Easing.Quadratic.EaseInOut = function (k) {
		if ((k *= 2) < 1) return 0.5 * k * k;
		return -0.5 * (--k * (k - 2) - 1);
	};
	//
	TWEEN.Easing.Cubic.EaseIn = function (k) {
		return k * k * k;
	};
	TWEEN.Easing.Cubic.EaseOut = function (k) {
		return --k * k * k + 1;
	};
	TWEEN.Easing.Cubic.EaseInOut = function (k) {
		if ((k *= 2) < 1) return 0.5 * k * k * k;
		return 0.5 * ((k -= 2) * k * k + 2);
	};
	//
	TWEEN.Easing.Quartic.EaseIn = function (k) {
		return k * k * k * k;
	};
	TWEEN.Easing.Quartic.EaseOut = function (k) {
		return -(--k * k * k * k - 1);
	}
	TWEEN.Easing.Quartic.EaseInOut = function (k) {
		if ((k *= 2) < 1) return 0.5 * k * k * k * k;
		return -0.5 * ((k -= 2) * k * k * k - 2);
	};
	//
	TWEEN.Easing.Quintic.EaseIn = function (k) {
		return k * k * k * k * k;
	};
	TWEEN.Easing.Quintic.EaseOut = function (k) {
		return (k = k - 1) * k * k * k * k + 1;
	};
	TWEEN.Easing.Quintic.EaseInOut = function (k) {
		if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
		return 0.5 * ((k -= 2) * k * k * k * k + 2);
	};
	//
	TWEEN.Easing.Sinusoidal.EaseIn = function (k) {
		return -Math.cos(k * Math.PI / 2) + 1;
	};
	TWEEN.Easing.Sinusoidal.EaseOut = function (k) {
		return Math.sin(k * Math.PI / 2);
	};
	TWEEN.Easing.Sinusoidal.EaseInOut = function (k) {
		return -0.5 * (Math.cos(Math.PI * k) - 1);
	};
	//
	TWEEN.Easing.Exponential.EaseIn = function (k) {
		return k == 0 ? 0 : Math.pow(2, 10 * (k - 1));
	};
	TWEEN.Easing.Exponential.EaseOut = function (k) {
		return k == 1 ? 1 : -Math.pow(2, -10 * k) + 1;
	};
	TWEEN.Easing.Exponential.EaseInOut = function (k) {
		if (k == 0) return 0;
		if (k == 1) return 1;
		if ((k *= 2) < 1) return 0.5 * Math.pow(2, 10 * (k - 1));
		return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
	};
	//
	TWEEN.Easing.Circular.EaseIn = function (k) {
		return -(Math.sqrt(1 - k * k) - 1);
	};
	TWEEN.Easing.Circular.EaseOut = function (k) {
		return Math.sqrt(1 - --k * k);
	};
	TWEEN.Easing.Circular.EaseInOut = function (k) {
		if ((k /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
		return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
	};
	//
	TWEEN.Easing.Elastic.EaseIn = function (k) {
		var s, a = 0.1, p = 0.25;
		if (k == 0) return 0; if (k == 1) return 1; if (!p) p = 0.3;
		if (!a || a < 1) { a = 1; s = p / 4; }
		else s = p / (2 * Math.PI) * Math.asin(1 / a);
		return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
	};
	TWEEN.Easing.Elastic.EaseOut = function (k) {
		var s, a = 0.1, p = 0.25;
		if (k == 0) return 0; if (k == 1) return 1; if (!p) p = 0.3;
		if (!a || a < 1) { a = 1; s = p / 4; }
		else s = p / (2 * Math.PI) * Math.asin(1 / a);
		return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
	};
	TWEEN.Easing.Elastic.EaseInOut = function (k) {
		var s, a = 0.1, p = 0.25;
		if (k == 0) return 0; if (k == 1) return 1; if (!p) p = 0.3;
		if (!a || a < 1) { a = 1; s = p / 4; }
		else s = p / (2 * Math.PI) * Math.asin(1 / a);
		if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
		return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
	};
	//
	TWEEN.Easing.Back.EaseIn = function (k) {
		var s = 1.70158;
		return k * k * ((s + 1) * k - s);
	};
	TWEEN.Easing.Back.EaseOut = function (k) {
		var s = 1.70158;
		return (k = k - 1) * k * ((s + 1) * k + s) + 1;
	};
	TWEEN.Easing.Back.EaseInOut = function (k) {
		var s = 1.70158 * 1.525;
		if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
		return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
	};
	//
	TWEEN.Easing.Bounce.EaseIn = function (k) {
		return 1 - TWEEN.Easing.Bounce.EaseOut(1 - k);
	};
	TWEEN.Easing.Bounce.EaseOut = function (k) {
		if ((k /= 1) < (1 / 2.75)) {
			return 7.5625 * k * k;
		} else if (k < (2 / 2.75)) {
			return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
		} else if (k < (2.5 / 2.75)) {
			return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
		} else {
			return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
		}
	};
	TWEEN.Easing.Bounce.EaseInOut = function (k) {
		if (k < 0.5) return TWEEN.Easing.Bounce.EaseIn(k * 2) * 0.5;
		return TWEEN.Easing.Bounce.EaseOut(k * 2 - 1) * 0.5 + 0.5;
	};

	TWEEN.Easing.Step.EaseIn = function (k) {
		return 0;
	};


	var aniMaps={
		add:function(pageId,el_id,type,params){
			var elAni=this.findAniById(el_id);
			if(!elAni) {
				elAni = {id:el_id,pageId:pageId,animations:[]};
				window.animationMaps.maps.push(elAni);
			}
			var name = [el_id,type,this.getNextIndex(elAni)].join('_');
			elAni.animations.push({ name:name, type:type, params:params });
			this.addOrder(pageId,name);
			return name;
		},
		remove:function(name){
			var result = this.findAniIndex(name);
			if(result.index<=-1) return;
			var orders = this.getPageOrders(result.map.pageId);
			var orderIndex = orders.indexOf(name);
			if(orderIndex<=-1) return;
			result.map.animations.splice(result.index,1);
			orders.splice(orderIndex,1);
			return true;
		},
		removeById:function(el_id){
			var elAni=this.findAniById(el_id);
			if(!elAni) return;
			var maps = window.animationMaps.maps;
			var orders = this.getPageOrders(elAni.pageId);
			elAni.animations.forEach(function(item){
				var name = item.name;
				orders.splice(orders.indexOf(name),1);
			});
			maps.splice(maps.indexOf(elAni),1);
			return true;
		},
		removeByPageId:function(pageId){
			var pageOrder = this.getPageOrders(pageId);
			if(!pageOrder.length) return;
			var self = this;
			pageOrder.forEach(function(name){
				self.remove(name);
			});
			var orders = window.animationMaps.orders;
			delete orders[pageId];
			return true;
		},
		update:function(name,params){
			var animationParams = this.getParams(name);
			if(!animationParams) return;
			for(var key in params){
				animationParams[key]=params[key];
			}
			return true;
		},
		addOrder:function(pageId,name){
			var pageOrder = this.getPageOrders(pageId);
			pageOrder.push(name);
			return true;
		},
		updateOrder:function(pageId,orders){
			window.animationMaps.orders[pageId]=orders;
			return true;
		},
		getPageOrders:function(pageId){
			var orders = window.animationMaps.orders;
			if(!orders[pageId]) orders[pageId]=[];
			return orders[pageId];
		},
		getAniOrderList:function(pageId,isView){
			var editList = [];
			var viewList = [];
			var orders = this.getPageOrders(pageId);
			for(var i=0,l=orders.length;i<l;i++){
				var name = orders[i];
				var result = this.findAniIndex(name);
				var ani = JSON.parse(JSON.stringify(result.map.animations[result.index]));
				if(ani.params.sequence === 'event') viewList.push(ani);
				editList.push(ani);
			}
			return isView ? viewList : editList;
		},
		getElAniList:function(el_id){
			var elAni=this.findAniById(el_id);
			if(!elAni) return;
			var arr = [];
			var animations = JSON.parse(JSON.stringify(elAni.animations));
			var animationsObj = {};
			animations.forEach(function(item){
				animationsObj[item.name]=item;
			});
			var orders = this.getPageOrders(elAni.pageId);
			orders.forEach(function(item){if(animationsObj[item]) arr.push(animationsObj[item]);});
			return arr;
		},
		getParams:function(name){
			var animation = this.findAnimation(name)
			return animation?animation.params:false;
		},
		findAniIndex:function(name){
			var el_id = name.split('_')[0];
			var elAni = this.findAniById(el_id);
			var index = -1;
			elAni.animations.some(function(item,i){
				var ok = item.name === name;
				ok && (index=i);
				return ok;
			});
			return {map:elAni,index:index};
		},
		findAnimation:function(name){
			var result = this.findAniIndex(name);
			if(result.index<=-1) return;
			return result.map.animations[result.index];
		},
		findAniById:function(id){
			return window.animationMaps.maps.filter(function(obj){return obj.id===id;})[0];
		},
		getNextIndex:function(elAni){
			var indexArr=[0];
			elAni.animations.forEach(function(item){
				var index = parseInt(item.name.split('_')[2]);
				indexArr.push(index);
			});
			return Math.max.apply(Math,indexArr)+1;
		},
		updateLink:function(id,links){
			var linkObj = this.getLinks();
			linkObj[id]=links;
			if(!links.length) delete linkObj[id];
			return true;
		},
		getLink:function(id){
			var linkObj = this.getLinks();
			return linkObj[id];
		},
		getLinks:function(){
			var links = window.animationMaps.links;
			if(!links) links = {};
			return links;
		}
	};
	window.aniMaps = aniMaps;

	(function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] +
			  'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			  lastTime = currTime + timeToCall;
			  return id;
		 };
		if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
		   clearTimeout(id);
		};
	}());

	function getVendorPrefix() {
		var body = document.body || document.documentElement,
		style = body.style,
		vendor = ['webkit', 'khtml', 'moz', 'ms', 'o' , 'Moz'];
		if(typeof style.transform === 'string') return '';
		for(var i=0,l=vendor.length;i<l;i++){ 
			var item = vendor[i];
			if(typeof style[item+'Transition'] === 'string') return item;
		}
	}

	var vendor = getVendorPrefix();
	var transformProp =  vendor ? vendor+'Transform' : 'transform';

    var ticker = window.requestAnimationFrame;
	var clearTicker  =  window.cancelAnimationFrame;
	var eventType = 'ontouchstart' in window ? "touchstart" : "click";

	var mTween = function(options){
		var opts = {
			startObj:{},
			endObj:{},
			easing:TWEEN.Easing.Linear.EaseNone
		};
		this.endObj = {};
		for(var key in opts) {
			if(key === 'endObj') continue;
			if(options[key]!==undefined) this[key]=options[key];
		}
		for(var key in this.startObj){
			if(options.endObj[key]!==undefined) this.endObj[key]= options.endObj[key];
		}
	}
	mTween.prototype = {
		getFactor :function(percent){
			var elapsed = Math.min(1., Math.max(0., percent));
			var value = this.easing(elapsed);
			return value;
		},
		getResult:function(percent){
			var value = this.getFactor(percent);
			var result = {};
			for(var key in this.startObj){
				var start = this.startObj[key];
				var end = this.endObj[key];
				result[key]= start + (end-start)*value;
			}
			return result;
		}
	}

	var Status = {
		Pre:-1,
		Start:1,
		Finish:0
	};

	var animator = function(aniMaps){
		this.aniMaps = aniMaps;
		this.orderArr = ['skew','rotate','zoom','move','flyIn','flyOut','fadeOut','fadeIn'];
		this.status = Status.Pre;

		//常量设定
		this.loopCount = 1000;
	}

	animator.prototype = {
		run:function(pageId){
			this.currentTime = +new Date;
			this.completeAnis = {};
			var aniList = this.time_animations(pageId);
			this.aniData = aniList;
			//处理点击触发的和事件触发的
			this.deal_trigger();
			//开始动画
			this.animate();
		},
		animate:function(){
			var timeList = this.aniData.time;
			var thisLoop = loop.bind(this);
			function loop(){
				var tx = +new Date - this.currentTime; 
				var isOk = this.time_ani(timeList,tx);
				isOk && (this.loopId = ticker(thisLoop));
			}
			this.loopId = ticker(thisLoop);
			this.status = Status.Start;
		},
		stopLoop:function(id){
			clearTicker(id);
			this.status = Status.Finish;
		},
		time_preview:function(name,begin_callback,end_callback){
			var animation = this.aniMaps.findAnimation(name);
			var params = animation.params,
				type = animation.type;
			
			var fun = this[type].bind(this);
			if(!fun) return;
			var time = +new Date,previewId = 0,el = this.getPreviewEl();
			var durationTime = this.getDuration(params)*1000;
			var thisLoop = loop.bind(this);
			function loop(){
				var tx = +new Date - time;
				if(tx>durationTime || this.stopPreview){
					clearTicker(previewId);
					el.style[transformProp] = '';
					el.style.opacity = 1;
					end_callback && end_callback();
					delete this.stopPreview;
					return;
				}
				var degree = tx/durationTime;
				var mat = new Matrix;
				fun(mat,params,degree,el);
				el.style[transformProp] = mat._toCssText();
				previewId=ticker(thisLoop);
			}
			begin_callback && begin_callback();
			previewId = ticker(thisLoop);
		},
		time_animations:function(pageId){
			var self = this;
			var list = [];
			function findPreAni(len,params){
				var last = list[len-1];
				if(/^(syn)?$/.test(last.animation.params.sequence||'')) return getFromTo(last,params,false);
				var max = 0;
				for(var i=len-1;i>=0;i--){
					var item = list[i];
					var isAsyn = item.animation.params.sequence === 'asyn';
					var obj = getFromTo(item,params,isAsyn);
					max = Math.max(obj.to);
					if(!isAsyn || i===0) return obj;
				}
			}
			//通过比较，得到开始时间，结束时间
			function getFromTo(item,params){
				var isAsyn = params.sequence === 'asyn';
				var delay = parseFloat(params.delay),
					duration = parseFloat(params.duration),
					loop = parseFloat(params.loop),
					len = list.length;

				var last_from = len ? item.from : 0;
				var last_to = len ? item.to :0;
				var from = isAsyn ? last_from + delay : last_to + delay;
				var to = from + self.getDuration(params);
				return {from:from,to:to};
			}
			var triggerList = [];
			this.aniMaps.getAniOrderList(pageId).forEach(function(item){
				var params = item.params;
				if(!/^((syn)|(asyn))?$/.test(params.sequence||'')){
					triggerList.push(item);
					return;
				}
				var obj = list.length === 0 ? getFromTo(item,params) : findPreAni(list.length,params);
				list.push({from:obj.from,to:obj.to,animation:item});
			});
			return {time:list,trigger:triggerList};
		},
		time_ani:function(aniList,tx){
			var self = this;
			var runTime = 0;
			var previousDatas = [];
			var currentCount = 0;
			var txList = aniList.filter(function(item){
				var id = item.animation.name.split('_')[0];
				var from = item.from*1000,to=item.to*1000;
				var isCurrent = from<=tx && to>=tx;
				var isLast = self.lastTx && from<=self.lastTx && to>self.lastTx && tx>to;
				var isStart = isCurrent && self.lastTx && self.lastTx<from; //此动画开始
				if(isStart){
				}
				var isFinish = self.lastTx>to;
				if(isFinish && !item.finish){
					if(!self.completeAnis[id]) self.completeAnis[id]=[];
					self.completeAnis[id].push(item);
					item.finish = true;
				}
				runTime = Math.max(runTime,to);
				if(isCurrent || isLast) currentCount++;
				return isCurrent || isLast || item.finish;
			});
			this.lastTx = tx;
			if(currentCount===0) {
				var isOver = tx>runTime;
				isOver && this.stopLoop(this.loopId);
				return !isOver;
			}
			var aniData = [];
			this.orderArr.forEach(function(type){
				aniData = aniData.concat(txList.filter(function(item){return item.animation.type === type}));
			});
			var obj = {};
			aniData.forEach(function(item){
				var degree = item.isFinish ? 1 : (tx-item.from*1000)/(item.to*1000-item.from*1000);
				var id = item.animation.name.split('_')[0],
					type = item.animation.type;

				var isTransform=!/^(fadeIn)|(fadeOut)$/.test(item.type);
				if(!obj[id]) obj[id] = { matrix:new Matrix, opacity:1 };
				var fun = self[type],
				data=obj[id][isTransform?'matrix':'opacity'];
				fun && fun.bind(self)(data,item.animation.params,degree,G(id));
			});
			for(var key in obj) {
				G(key).style[transformProp] = obj[key].matrix._toCssText();
			}
			return true;
		},
		deal_trigger:function(){
			var self = this;
			var triggerData = this.aniData.trigger;
			var timeData = this.aniData.time;
			var links = this.aniMaps.getLinks();
			function add(){
				var params = this.item.params;
				var from = (+new Date - self.currentTime)/1000; 
				var to = from + self.getDuration(params);
				var my = this;
				var preItem = timeData.filter(function(item){return item.animation.name===my.item.name});
				if(preItem.length) { preItem[0].from = from; preItem[0].to = to;}
				else timeData.push({from:from,to:to,animation:this.item});
				if(self.status === Status.Finish) self.animate();
			}
			function click(el,item){ el.addEventListener(eventType,add.bind({item:item})); }
			triggerData.forEach(function(item){
				item.params.sequence === 'click' && click(G(item.name.split('_')[0]),item);
			});
			for(var key in links){
				var el = G(key),names = links[key];
				for(var i=0,l=names.length;i<l;i++) click(el,this.aniMaps.findAnimation(names[i]));
			}
		},
		getDuration:function(params){
			return params.duration*(parseFloat(params.loop)||this.loopCount);
		},
		getEasing:function(type){
			switch(type){
				case 'ease-in':
					return TWEEN.Easing.Quadratic.EaseIn;
				break;
				case 'ease-out':
					return TWEEN.Easing.Quadratic.EaseOut;
				break;
				case 'ease-in-out':
					return TWEEN.Easing.Quadratic.EaseInOut;
				break;
			}
			return TWEEN.Easing.Linear.EaseNone;
		},
		getmTween:function(start,end,type,percent,loop){
			if(percent>1) percent = 1;
			loop = parseInt(loop) || this.loopCount;
			if(loop>1 && percent<1){
				var mp = percent * loop;
				percent = mp - Math.floor(mp);
			}
			var opt = {startObj:start,endObj:end,easing:this.getEasing(type)};
			var tween = new mTween(opt);
			var result = tween.getResult(percent);
			return result;
		},
		rotate:function(mat,params,percent,el){
			var result = this.getmTween({rotateZ:0},{rotateZ:Math.PI*params.rotateZ/180},params.easing,percent,params.loop);
			var rObj = this.setOrigin(mat,params,el);
			mat._rotate(result.rotateZ);
			this.reverseOrigin(mat,rObj);
		},
		zoom:function(mat,params,percent,el){
			var scale = params.scale, type = params.type;
			var x = type === 'X' ? scale : 1;
			var y = type === 'Y' ? scale : 1;
			if(type===''){
				var arr = scale.toString().split(',');
				x = parseFloat(arr[0]);
				y = arr.length>1 ? parseFloat(arr[1]) : x;
			}
			var result = this.getmTween({mx:1,my:1},{mx:x,my:y},params.easing,percent,params.loop);
			var rObj = this.setOrigin(mat,params,el);
			mat._scale(result.mx,result.my);
			this.reverseOrigin(mat,rObj);
		},
		fadeIn:function(value,params,percent,el,isFadeOut){
			var result = this.getmTween({opacity:~~isFadeOut},{opacity:params.opacity},params.easing,percent,params.loop);
			el.style.opacity = result.opacity;
		},
		fadeOut:function(value,params,percent,el){
			this.fadeIn(value,params,percent,el,true);
		},
		move:function(mat,params,percent,el){
			if(!el) return;
			var translateX = -params.translateX,
				translateY = -params.translateY;
			var result = this.getmTween({mx:0,my:0},{mx:translateX,my:translateY},params.easing,percent,params.loop);
			mat._translate(result.mx,result.my);
		},
		flyIn:function(mat,params,percent,el,isFlyOut){
			var pre = 10;
			var pageEl=el.parentNode;
			if(pageEl.id!=="container" && !pageEl.classList.contains('page')) return;
			var pw = this.getStyle(pageEl,'width'),
				ph = this.getStyle(pageEl,'height'),
				w =  this.getStyle(el,'width'),
				h =  this.getStyle(el,'height'),
				tx0 = parseFloat(el.style.left), 
				ty0 = parseFloat(el.style.top),
				arr = params.dir.split(' ');

			var left = parseInt(arr[0]),
				right = parseInt(arr[1]);
			
			var tx = left<0?-w-tx0-pre:(left>0?pw-w+pre:0);
			var ty = right<0?-h-ty0-pre:(right>0?ph-h+pre:0);

			var beginObj = isFlyOut ? {mx:0,my:0} : {mx:tx,my:ty};
			var endObj = isFlyOut ? {mx:tx,my:ty} : {mx:0,my:0};
			
			var result = this.getmTween(beginObj,endObj,params.easing,percent,params.loop);
			mat._translate(result.mx,result.my);
		},
		flyOut:function(mat,params,percent,el){
			this.flyIn(mat,params,percent,el,true);
		},
		skew:function(mat,params,percent,el){
			var skew = params.skew, type = params.type;
			var x = type === 'X' ? skew : 0;
			var y = type === 'Y' ? skew : 0;
			if(type===''){
				var arr = skew.toString().split(',');
				x = parseFloat(arr[0]);
				y = arr.length>1 ? parseFloat(arr[1]) : x;
			}
			x = x*Math.PI/180;
			y = y*Math.PI/180;
			var result = this.getmTween({mx:0,my:0},{mx:x,my:y},params.easing,percent,params.loop);
			var rObj = this.setOrigin(mat,params,el);
			mat._skew(result.mx,result.my);
			this.reverseOrigin(mat,rObj);
		},
		setOrigin:function(mat,params,el){
			var width = this.getStyle(el,'width'),
				height = this.getStyle(el,'height'),
				arr = params.transformOrigin.split(' '),
				pWidth = parseInt(arr[0])/100,
				pHeight = parseInt(arr[1])/100,
				px = -width*pWidth,
				py = -height*pHeight;
			mat._translate(px,py);
			return {x:px,y:py};
		},
		reverseOrigin:function(mat,obj){
			mat._translate(-obj.x,-obj.y);
		},
		getPreviewEl:function(){
			return PageProperty.getEditObj()[0];
		},
		getStyle:function(el,name){
			return parseFloat(el.style[name]) || parseFloat(getComputedStyle(el)[name]);
		}
	};
	window.animator = animator;
})();
