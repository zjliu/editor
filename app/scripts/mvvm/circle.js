function Circle(x,y,radius){
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.strokeStyle = 'rgba(255,253,208,.9)';
	this.fillStyle = 'rgba(147,197,114,.8)';
}
Circle.prototype = new Shape();

Circle.prototype.collidesWith = function(shape){
	var axes = shape.getAxes(),distance;
	if(axes===undefined){
		return Math.pow(shape.x-this.x,2)+Math.pow(shape.y-this.y,2) < Math.pow(this.radius+shape.radius,2);
	}
	else {
		return shape.collidesWith(this);
	}
}
Circle.prototype.getAxes = function(shape){
	if(!(shape instanceof Polygon)) return;
	var closetPoint = shape.getClosetPoint(new Point(this.x,this.y));
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

