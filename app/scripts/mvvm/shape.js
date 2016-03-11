function Shape(){
	this.x = undefined;
	this.y = undefined;
	this.strokeStyle = 'rgba(255,253,208,.9)';
	this.fillStyle = 'rgba(147,197,114,.8)';
}
Shape.prototype={
	collidesWith:function(shape){
		var axes = this.getAxes(shape).concat(shape.getAxes(shape));
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
