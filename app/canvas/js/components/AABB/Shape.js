/**
 *点
 */
function Point(x,y){
	this.x = x;
	this.y = y;
}

/**
 *向量
 */
function Vector(x,y){
	this.x=x;
	this.y=y;
}

Vector.prototype={
	getMagnitude:function(){
		return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2));
	},
	add:function(vector){
		return new Vector(this.x+vector.x,this.y+vector.y);
	},
	subtract:function(vector){
		return new Vector(this.x-vector.x,this.y-vector.y);
	},
	dotProduct:function(vector){
		return this.x*vector.x+this.y*vector.y;
	},
	edge:function(vector){
		return this.subtract(vector);
	},
	perpendicular:function(){
		return new Vector(this.y,-this.x);
	},
	normalize:function(){
		var v = new Vector(0,0),
			m = this.getMagnitude();
		if(m!==0){
			v.x = this.x / m;
			v.y = this.y / m;
		}
		return v;
	},
	normal:function(){
		var p = this.perpendicular();
		return p.normalize();
	}
}

/**
 *图形（抽象类)
 */
function Shape(){
	this.x = undefined;
	this.y = undefined;
	this.strokeStyle = 'rgba(255,253,208,.9)';
	this.fillStyle = 'rgba(147,197,114,.8)';
}
Shape.prototype={
	collidesWith:function(shape){
		var axes = this.getAxes(shape).concat(shape.getAxes(this));
		return !this.separationOnAxes(axes,shape);
	},
	separationOnAxes:function(axes,shape){
		var axis,projection1,projection2;
		for(var i=0,axis;axes[i];i++){
			axis = axes[i];
			projection1 = this.project(axis);
			projection2 = shape.project(axis);
			if(!projection1.overlaps(projection2)) return true;
		}
		return false;
	},
	getAxes:function(){
		throw 'getAxes() not implemented';
	},
	project:function(axis){
		throw 'project(axis) not implemented';
	},
	move:function(dx,dy){
		throw 'move(dx,dy) not implemented';
	},
	createPath:function(){
		throw 'createPath(context) not implemented';
	},
	getRect:function(){
		throw 'getRect() not implemented';
	},
	fill:function(context){
		context.save();
		context.fillStyle = this.fillStyle;
		this.createPath(context);
		context.fill();
		context.restore();
	},
	stroke:function(context){
		context.save();
		context.fillStyle = this.strokeStyle;
		this.createPath(context);
		context.stroke();
		context.restore();
	},
	isPointInPath:function(context,x,y){
		this.createPath(context);
		return context.isPointInPath(x,y);
	},
	minimumTranslationVector:function(axes,shape){
		var axis,projection1,projection2,minOverlap,minAxis,overlap;
		for(var i=0,axis;axes[i];i++){
			axis = axes[i];
			projection1 = this.project(axis);
			projection2 = shape.project(axis);
			overlap = projection1.overlaps(projection2);
			if(!overlap) return;
			else if(minOverlap===undefined || overlap < minOverlap){
				minOverlap = overlap;
				minAxis = axis;
			}
		}
		return {axis:minAxis,overlap:minOverlap};
	}
}

/**
 *投影
 */
function Projection(min,max){
	this.min = min;
	this.max = max;
}
Projection.prototype={
	overlaps:function(projection){
		var overLen =  Math.min(this.max-projection.min,projection.max-this.min);
		return overLen > 0 ? overLen : 0;
	}
}

/**
 *线段
 */
function Line(){
	this.points = [];
	this.strokeStyle = 'blue';
}
Line.prototype = new Shape();
Line.prototype.getAxes = function(){
	var v1 = new Vector(), v2 = new Vector();
	v1.x = this.points[0].x;
	v1.y = this.points[0].y;
	v2.x = this.points[1].x;
	v2.y = this.points[1].y;
	var v = v1.edge(v2);
	return [v.normal(),v.normalize()];
}
Line.prototype.addPoint = function(x,y){
	if(this.points.length<2) this.points.push(new Point(x,y));
}
Line.prototype.createPath = function(context){
	if(this.points.length!==2) return;
	context.beginPath();
	context.moveTo(this.points[0].x,this.points[0].y);
	context.lineTo(this.points[1].x,this.points[1].y);
	context.closePath();
}
Line.prototype.move = function (dx,dy){
	var points = this.points;
	points[0].x += dx;
	points[0].y += dy;
	points[1].x += dx;
	points[1].y += dy;
}
Line.prototype.project = function(axis){
	var d1 = new Vector(this.points[0].x,this.points[0].y).dotProduct(axis);
	var d2 = new Vector(this.points[1].x,this.points[1].y).dotProduct(axis);
	return new Projection(d1>d2?d2:d1,d1>d2?d1:d2);
}
Line.prototype.getClosestPoint = function(otherPoint){
	var distance,min,minPoint,point;
	for(var i=0,l=this.points.length;i<l;i++){
		point = this.points[i];
		distance = Math.pow(point.x-otherPoint.x,2)+Math.pow(point.y-otherPoint.y,2);
		if(min===undefined || distance<min){
			min = distance;
			minPoint = point;
		}
	}
	return minPoint;
}
Line.prototype.getRect = function(){
	return Polygon.prototype.getRect.call(this);
}
Line.prototype.update = function(point){
	var len = this.points.length;
	if(len<2)this.points.push(new Point(point.x,point.y));
	else Point.call(this.points[1],point.x,point.y);
}

/**
 *多边形(包括三角形)
 */
function Polygon(){
	this.points = [];
	this.strokeStyle = 'blue';
	this.fillStyle = 'white';
}
Polygon.prototype = new Shape();
Polygon.prototype.project = function(axis){
	var scalars = [],v = new Vector(),point=null;
	for(var i=0,len=this.points.length;i<len;i++){
		point = this.points[i];
		v.x = point.x;
		v.y = point.y;
		scalars.push(v.dotProduct(axis));
	}
	return new Projection(Math.min.apply(Math,scalars),Math.max.apply(Math,scalars));
}
Polygon.prototype.getAxes = function(){
	var v1 = new Vector(), v2 = new Vector(), axes = [], point = null;
	for(var i=0,len=this.points.length-1;i<len;i++){
		point = this.points[i];
		v1.x = point.x;
		v1.y = point.y;
		point = this.points[i+1];
		v2.x = point.x;
		v2.y = point.y;
		axes.push(v1.edge(v2).normal());
	}
	v1.x = this.points[len].x;
	v1.y = this.points[len].y;
	v2.x = this.points[0].x;
	v2.y = this.points[0].y;
	axes.push(v1.edge(v2).normal());
	return axes;
}
Polygon.prototype.addPoint = function(x,y){
	this.points.push(new Point(x,y));
}
Polygon.prototype.createPath = function(context){
	if(!this.points.length) return;
	context.beginPath();
	context.moveTo(this.points[0].x,this.points[0].y);
	for(var i=1,l=this.points.length;i<l;i++){
		context.lineTo(this.points[i].x,this.points[i].y);
	}
	context.closePath();
}
Polygon.prototype.move = function (dx,dy){
	for(var i=0,point,l=this.points.length;i<l;i++){
		point = this.points[i];
		point.x += dx;
		point.y += dy;
	}
}
Polygon.prototype.getClosestPoint = function(otherPoint){
	var distance,min,minPoint,point;
	for(var i=0,l=this.points.length;i<l;i++){
		point = this.points[i];
		distance = Math.pow(point.x-otherPoint.x,2)+Math.pow(point.y-otherPoint.y,2);
		if(min===undefined || distance<min){
			min = distance;
			minPoint = point;
		}
	}
	return minPoint;
}
Polygon.prototype.getRect = function(){
	var xs = this.points.map(function(item){return item.x;});
	var ys = this.points.map(function(item){return item.y;});
	var left = Math.min.apply(Math,xs),
		right = Math.max.apply(Math,xs),
		top = Math.min.apply(Math,ys),
		bottom = Math.max.apply(Math,ys),
		width = right - left,
		height = bottom - top;
	return {left:left,right:right,top:top,bottom:bottom,width:width,height:height};
}

/**
 *圆
 */
function Circle(x,y,radius){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.strokeStyle = 'rgba(255,253,208,.9)';
	this.fillStyle = 'rgba(147,197,114,.8)';
}
Circle.prototype = new Shape();
Circle.prototype.getAxes = function(shape){
	var closetPoint = shape.getClosestPoint(new Point(this.x,this.y));
	var v1 = new Vector(this.x,this.y);
	var v2 = new Vector(closetPoint.x,closetPoint.y);
	return [v1.subtract(v2).normalize()];
}
Circle.prototype.project = function(axis){
	var dotProduct = new Vector(this.x,this.y).dotProduct(axis);
	return new Projection(dotProduct-this.radius,dotProduct+this.radius);
}
Circle.prototype.move = function(dx,dy){
	this.x += dx;
	this.y += dy;
}
Circle.prototype.createPath = function(context){
	context.beginPath();
	context.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
}
Circle.prototype.getClosestPoint = function(){
	return new Point(this.x,this.y);
}
Circle.prototype.getRect = function(){
	return {
		left:this.x-this.radius,
		right:this.x+this.radius,
		top:this.y-this.radius,
		bottom:this.y+this.radius,
		width:2*this.radius,
		height:2*this.radius
	}
}
Circle.prototype.update = function(x,y,r){
	this.constructor.call(this,x,y,r);
}

/**
 *椭圆
 */
function Ellipse(x,y,r1,r2){
	this.x=x;
	this.y=y;
	this.r1=r1;
	this.r2=r2;
	this.strokeStyle = 'rgba(255,253,208,.9)';
	this.fillStyle = 'rgba(147,197,114,.8)';
}
Ellipse.prototype = new Shape();
Ellipse.prototype.getAxes = function(shape){
	var closetPoint = shape.getClosestPoint(new Point(this.x,this.y));
	var v1 = new Vector(this.x,this.y);
	var v2 = new Vector(closetPoint.x,closetPoint.y);
	return [v1.subtract(v2).normalize()];
}
Ellipse.prototype.move = function(dx,dy){
	this.x += dx;
	this.y += dy;
}
Ellipse.prototype.createPath = function(context){
	var x= this.x,y=this.y,w = this.r1,h = this.r2,k=w/0.75;
	context.beginPath();
    context.moveTo(x, y-h);
	context.bezierCurveTo(x+k, y-h, x+k, y+h, x, y+h);
    context.bezierCurveTo(x-k, y+h, x-k, y-h, x, y-h);
}
Ellipse.prototype.project = function(axis){
	var a = this.r1,b=this.r2,x=this.x,y=this.y;
	var k = -axis.x/axis.y,dk=Math.sqrt(a*a*k*k+b*b);
	var pA = k,pB=-1,pC=y-k*x;
	var tx1 = x-a*a*k/dk,ty1 = y+b*b/dk;
	var tx2 = x+a*a*k/dk,ty2 = y-b*b/dk;
	var pC1 = ty1-k*tx1,pC2 = ty2-k*tx2;
	//直线（一般式）：Ax＋By＋C＝0坐标（Xo，Yo）这点到这直线的距离就为：（AXo＋BYo＋C）的绝对值除以根号下（A的平方加上B的平方)
	//平等直线间距离公式: |C1-C2|/Math.sqrt(k*k+1);
	var dr = Math.abs(pC1-pC2)/Math.sqrt(k*k+1)/2;
	
	/*
	drawLine(x-100,k*(x-100)+pC,x+100,k*(x+100)+pC);
	drawLine(tx1-100,k*(tx1-100)+ty1-k*tx1,tx1+100,k*(tx1+100)+ty1-k*tx1);
	drawLine(tx2-100,k*(tx2-100)+ty2-k*tx2,tx2+100,k*(tx2+100)+ty2-k*tx2);
	*/

	var dotProduct = new Vector(this.x,this.y).dotProduct(axis);
	return new Projection(dotProduct-dr,dotProduct+dr);
}
/*
function drawLine(x1,y1,x2,y2){
	cxt.save();
	cxt.moveTo(x1,y1);
	cxt.lineTo(x2,y2);
	cxt.stroke();
	cxt.restore();
}
*/
Ellipse.prototype.getEllipseData = function(){
	var r1 = this.r1,
		r2=this.r2,
		r12=Math.sqrt(r1*r1+r2*r2),	//斜边
		dr12=(r12+r2-r1)/2;			//中垂线底边一半

	var ra = r12*(dr12+r1-r2)/r2,	//长轴半径
		rb = r12*dr12/r1;			//短轴半径

	//四个扇形的圆心坐标
	var raTopx=this.x,
		raTopy=this.y-ra+r2,
		raBottomx=this.x,
		raBottomy=this.y+ra-r2;
		rbLeftx=this.x-r1+rb,
		rbLefty=this.y,
		rbRightx=this.x+r1-rb,
		rbRighty=this.y;

	//四个扇形的弧度
	var radegree = Math.atan(r2/r1),
		rbdegree = Math.PI/2-radegree;

	return {
		ra:ra,rb:rb,
		ra_c1:new Point(raTopx,raTopy),
		ra_c2:new Point(raBottomx,raBottomy),
		rb_c1:new Point(rbLeftx,rbLefty),
		rb_c2:new Point(rbRightx,rbRighty),
		ra_deg:radegree,
		rb_deg:rbdegree
	}

}
Ellipse.prototype.getClosestPoint = function(){
	return new Point(this.x,this.y);
}
Ellipse.prototype.getRect = function(){
	return {
		left:this.x-this.r1,
		right:this.x+this.r1,
		top:this.y-this.r2,
		bottom:this.y+this.r2,
		width:2*this.r1,
		height:2*this.r2
	}
}
Ellipse.prototype.update = function(x,y,r1,r2){
	this.constructor.call(this,x,y,r1,r2);
}
