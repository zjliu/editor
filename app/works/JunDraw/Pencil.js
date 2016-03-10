var Pencil = (function() {
	var Pen = function(data) {
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
	Pen.prototype = {
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
		draw: function(ctx) {
			ctx.save();
			ctx.beginPath();
			for (var i = 0, points = this.curve.points, drawLen = points.length; i < drawLen - 1; i++) {
				point1 = points[i];
				ctx.arc(point1.nodex, point1.nodeY, 5, 0, Math.PI * 2);
				point2 = points[i + 1];
				if (i == 0) ctx.moveTo(point1.nodeX, point1.nodeY);
				ctx.bezierCurveTo(point1.forwardX, point1.forwardY, point2.backwardX, point2.backwardY, point2.nodeX, point2.nodeY);
			}
			ctx.stroke();
			ctx.restore();
		},
	}
	return Pen;
})();
