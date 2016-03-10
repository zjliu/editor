var MugedaCardSignature = (function() {
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
			callback: function(data) {}
		};
		this.data = [];
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
			+ '<input class="toolbtn signToolClear" type="button" value="clear" />' 
			+ '<style>.signDiv{position:relative;}.signTool{position:absolute;bottom:0px;width:130px;height:26px;right:5px;text-align:right;}' 
			+ '.signTool .signToolClear{margin-right:5px;width:55px;}' 
			+ '.signTool .signToolOk{margin-right:5px;width:55px;}' 
			+ '.signTool .toolbtn{border:0.5px solid rgba(0,0,0,.4);height:90%;line-height:26px;background-color:rgba(0,0,0,0.1)}' 
			+ '.signTool .toolbtn:hover{box-shadow:rgba(0,0,0,.4) 0 0 8px;-webkit-box-shadow:rgba(0,0,0,.4) 0 0 8px;}' 
			+ '</style>' 
			+ '<input class="toolbtn signToolOk" type="button" value="ok" />' 
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
			},START, self.canvas);
			E(function(e) {
				if (!self.pencil) return;
				var position = getPointOnCanvas(self.canvas, e);
				self.pencil.setEndPoint(position.x, position.y, 0);
				self.clear();
				self.draw();
			},MOVE, self.canvas);
			E(function(e) {
				self.data.push(self.pencil);
				self.pencil = null;
			},END, self.canvas);
		},
		clear: function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		render: function(data, option) {
			if (this.canvas) {
				var signDiv = this.canvas.parentNode;
				if (signDiv) {
					signDiv.parentNode.removeChild(signDiv);
				}
			}
			this.create(option);
			if (typeof data === "string") {
				data = JSON.parse(data);
			}
			var pencilData = [];
			for (var index in data) {
				var item = data[index];
				pencilData.push(new Pencil(item));
			}
			this.data = pencilData;
			this.draw();
		},
		draw: function() {
			for (var i = 0, l = this.data.length; i < l; i++) {
				var pencil = this.data[i];
				pencil.draw(this.context);
			}
			if (this.pencil) {
				this.pencil.draw(this.context);
			}
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
				E(function() {
					self.clearStart = true;
				},START, clearBtn);
				E(function() {
					if (!self.clearStart) return false;
					self.clear();
					self.data = [];
					self.clearStart = false;
				},END, clearBtn);

				E(function(e) {
					self.okStart = true;
				},START, okBtn);
				E(function(e) {
					if (!self.okStart) return false;
					self.okStart = false;
					self.options.callback(JSON.stringify(self.data));
				},END, okBtn);
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
		}
	}
	return Signature;
})();
