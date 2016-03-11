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
