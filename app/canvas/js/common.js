function G(id) { return document.getElementById(id); }
function Q(selector,dom) { return (dom||document).querySelector(selector); }
function QA(selector,dom) { return (dom||document).querySelectorAll(selector); }
function E(name,fun,dom) { return (dom||document).addEventListener(name,fun); }
function on(name,selector,fun){ 
	E(name,function(e){ 
		var el = e.target.closest(selector);
		el && fun(el,e);
	}); 
}
function extend(tObj,sObj) { for(var key in sObj) tobj[key] = sObj[key]; }
function applyStyle(el,styleObj){
	var item = null;
	for(var key in styleObj){
		item = styleObj[key];	
		el.style[key] = item.value + (item.unit||'');
	}
}
if(!Array.prototype.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0,l=this.length;i<l;i++){
			if(this[i] === obj) return i;
		}
		return -1;
	}
}
HTMLElement.prototype.is = function(selector) {
	return Array.prototype.indexOf.call(QA(selector),this) > -1;
}
HTMLElement.prototype.closest = function(selector) {
	var doms = QA(selector);
	if(!doms.length) return null;
	function find(dom){
		if(dom === document.documentElement) return null;
		if(Array.prototype.indexOf.call(doms,dom) > -1) return dom;
		if(Array.prototype.indexOf.call(doms,dom.parentNode) > -1) return dom.parentNode;
		else return find(dom.parentNode);
	}
	return find(this);
}
