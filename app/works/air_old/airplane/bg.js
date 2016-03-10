var airDiv = document.getElementById("airDiv");
var images = airDiv.querySelectorAll("img.bgimg");
var currentImg = airDiv.querySelector("img.bgimg.current");
function scroll(){
	var top = parseInt(getComputedStyle(currentImg)["top"]);
	currentImg.style.top = (top - 5)+"px";
	requestAnimationFrame(scroll);
}
scroll();

var pictureSroll=(function(){
	var picR = function(){
		
	}
	picR.prototype={
		
	}
	return picR;
})();
