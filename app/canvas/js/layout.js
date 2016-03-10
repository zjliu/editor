function getTools(callback){
	callback([
		{url:'images/Select-icon.png',uname:'Select',commandId:"Command_01"},
		{url:'images/Scale-icon.png',uname:'Scale',commandId:"Command_02"},
		{url:'images/Rectangle-icon.png',uname:'Rectangle',commandId:"Command_03"},
		{url:'images/Ellipse-icon.png',uname:'Circle',commandId:"Command_04"},
		{url:'images/Ellipse-icon.png',uname:'Ellipse',commandId:"Command_05"},
		{url:'images/Line-icon.png',uname:'Line',commandId:"Command_06"},
		{url:'images/Pencil-icon.png',uname:'Pencil',commandId:"Command_07"},
		{url:'images/Text-icon.png',uname:'Text',commandId:"Command_08"},
		{url:'images/Picture-icon.png',uname:'Picture',commandId:"Command_09"}
	]);
}
var tmp = new JunTemp();

var CommandObj = {
	Select:function(){
		window.isDrawing = false;
	},
	Rectangle:function(){
		window.isDrawing = true;
	},
	Line:function(){
		window.isDrawing = true;
	},
	Ellipse:function(){
		window.isDrawing = true;
	}
};

on('click','.tools_left .icon',function(el,e){
	var command = el.getAttribute('uname');
	if(CommandObj[command]) CommandObj[command]();
	window.aniType = command;
});

