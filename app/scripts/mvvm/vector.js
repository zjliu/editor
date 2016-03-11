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
