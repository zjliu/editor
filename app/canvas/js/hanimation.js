var aniData = { shapes:[] };
var obj = {};

var objCanvas = G('canvas'),
	cxt = objCanvas.getContext('2d'),
	canvasWidth = objCanvas.width,
	canvasHeight = objCanvas.height;

addEvent();

function addEvent(){
	E('mousedown',onCanvasMouseDown,objCanvas);
	E('mousemove',onCanvasMouseMove,objCanvas);
	E('mouseup',onCanvasMouseUp,objCanvas);
}

function windowToCanvas(canvas,x,y){
	var bbox = canvas.getBoundingClientRect();
	return {x:x-bbox.left*(canvas.width/bbox.width),
			y:y-bbox.top*(canvas.height/bbox.height)};
}

function getPosition(e){
	return windowToCanvas(objCanvas,e.clientX,e.clientY);
}

function onCanvasMouseDown(e){
	var position = getPosition(e);
	switch(window.aniType){
		case 'Select':
			obj.objSelect = queryShape(cxt,position);
		break;
		case 'Rectangle':
			obj.isDrawing = true;
			obj.startPosition = obj.lastPosition = position;

			obj.objSelect = new Polygon();
			obj.objSelect.addPoint(obj.startPosition.x,obj.startPosition.y);
			aniData.shapes.push(obj.objSelect);
		break;
		case 'Line':
			obj.isDrawing = true;
			obj.startPosition = obj.lastPosition = position;

			obj.objSelect = new Line();
			obj.objSelect.addPoint(obj.startPosition.x,obj.startPosition.y);
			aniData.shapes.push(obj.objSelect);
			break;
		case 'Circle':
			obj.isDrawing = true;
			obj.startPosition = obj.lastPosition = position;

			obj.objSelect = new Circle();
			aniData.shapes.push(obj.objSelect);
		break;
		case 'Ellipse':
			obj.isDrawing = true;
			obj.startPosition = obj.lastPosition = position;

			obj.objSelect = new Ellipse();
			aniData.shapes.push(obj.objSelect);
		break;
	}

	if(window.aniType==='Select'){
		return;
	}
	
}

function onCanvasMouseMove(e){
	var position = getPosition(e);
	switch(window.aniType){
		case 'Select':
			var lastPosition = obj.lastPosition;
			if(obj.objSelect) obj.objSelect.move(position.x-lastPosition.x,position.y-lastPosition.y);
			redrawAll();
		break;
		case 'Rectangle':
			if(!obj.isDrawing) return;
			updatePolygon(position);
			redrawAll();
		break;
		case 'Line':
			if(!obj.isDrawing) return;
			updateLine(position);
			redrawAll();
		break;
		case 'Circle':
			if(!obj.isDrawing) return;
			updateCircle(position);
			redrawAll();
		break;
		case 'Ellipse':
			if(!obj.isDrawing) return;
			updateEllipse(position);
			redrawAll();
		break;
	}
	obj.lastPosition = position;
}

function onCanvasMouseUp(e){
	var position = getPosition(e);
	switch(window.aniType){
		case 'Select':
			delete obj.objSelect;
			return;
		break;
		case 'Rectangle':
			if(!obj.isDrawing) return;
			updatePolygon(position);
			redrawAll();
		break;
		case 'Line':
			if(!obj.isDrawing) return;
			updateLine(position);
			redrawAll();
			break;
		case 'Circle':
			if(!obj.isDrawing) return;
			updateCircle(position);
			redrawAll();
		break;
		case 'Ellipse':
			if(!obj.isDrawing) return;
			updateEllipse(position);
			redrawAll();
		break;
	}
	obj = {};
}

function queryShape(cxt,position){
	//创建一个虚拟的圆，检测是是否与现有图形碰撞，如果碰撞，则为选中
	var ushape = new Circle(position.x,position.y,10);
	for(var i=0,shapes=aniData.shapes,l=shapes.length;i<l;i++){
		var shape = shapes[i];
		if(ushape.collidesWith(shape)) return shape;
	}
}

function updatePolygon(position){
	var shape = obj.objSelect;
	var startP = obj.startPosition;
	var points = shape.points;
	if(points.length <= 1) {
		shape.addPoint(position.x,startP.y);
		shape.addPoint(position.x,position.y);
		shape.addPoint(startP.x,position.y);
		return;
	}
	Point.call(points[1],position.x,startP.y);
	Point.call(points[2],position.x,position.y);
	Point.call(points[3],startP.x,position.y);
}

function updateLine(position){
	var shape = obj.objSelect;
	var startP = obj.startPosition;
	var points = shape.points;
	if(points.length <=1) {
		shape.addPoint(position.x,position.y);
		return;
	}
	Point.call(points[1],position.x,position.y);
}

function updateEllipse(position){
	var shape = obj.objSelect;
	var startP = obj.startPosition;
	shape.r1 = Math.abs(position.x-startP.x)/2;
	shape.r2 = Math.abs(position.y-startP.y)/2;
	shape.x = (position.x+startP.x)/2;
	shape.y = (position.y+startP.y)/2; 
}

function updateCircle(position){
	var shape = obj.objSelect;
	var startP = obj.startPosition;
	var hw = Math.abs(position.x-startP.x)/2,
		hh = Math.abs(position.y-startP.y)/2;
	shape.radius = Math.max(hw,hh);
	shape.x = startP.x + shape.radius;
	shape.y = startP.y + shape.radius;
}

function redrawAll(){
	cxt.clearRect(0,0,canvasWidth,canvasHeight);	
	cxt.save();
	cxt.beginPath();
	aniData.shapes.forEach(function(shape){
		shape.stroke(cxt);
		shape.fill(cxt);
	});
	cxt.closePath();
	cxt.restore();
}
