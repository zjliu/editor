function Point(x,y){
	this.x = x;
	this.y = y;
}

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
Polygon.prototype.getClosetPoint = function(otherPoint){
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
