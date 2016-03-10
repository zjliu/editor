//name 样式名 type(0,1,2) 
HTMLElement.prototype.getStyle = function(name, type) {
	var value = getComputedStyle(this)[name];
	if (value) {
		switch (type) {
		case 1:
			value = parseInt(value);
			break;
		case 2:
			value = parseFloat(value);
			break;
		}
		return value;
	}
}

