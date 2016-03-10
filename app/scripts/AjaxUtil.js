var AjaxUtil = {
	// 基础选项
	options : {
		type : "get", // 默认提交的方法,get post
		url : "", // 请求的路径 required
		data : {}, // 请求的参数
		dataType : 'json', // 返回的内容的类型,text,xml,json
		tokenField : 'access-token',
		callback : function() {
		}// 回调函数 required
	},
	// 创建XMLHttpRequest对象
	createRequest : function() {
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");// IE6以上版本
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");// IE6以下版本
			} catch (e) {
				try {
					xmlhttp = new XMLHttpRequest();
					if (xmlhttp.overrideMimeType) {
						xmlhttp.overrideMimeType("text/xml");
					}
				} catch (e) {
					alert("您的浏览器不支持Ajax");
				}
			}
		}
		return xmlhttp;
	},
	// 设置基础选项
	setOptions : function(newOptions) {
		var obj = JSON.parse(JSON.stringify(this.options));
		for ( var pro in newOptions) {
			obj[pro] = newOptions[pro];
		}
		return obj;
	},
	// 格式化请求参数
	formateParameters : function(newOption) {
		var paramsArray = [];
		var params = newOption.data;
		for ( var pro in params) {
			var paramValue = params[pro]; 
			paramsArray.push(pro + "=" + paramValue);
		}
		paramsArray.push("_=" + Date.now()+Math.random()*100);
		return paramsArray.join("&");
	},

	// 状态改变的处理
	readystatechange : function(xmlhttp,option) {
		// 获取返回值
		var returnValue;
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			switch (option.dataType) {
			case "xml":
				returnValue = xmlhttp.responseXML;
				break;
			case "json":
				var jsonText = xmlhttp.responseText;
				if(jsonText){
					returnValue = eval("(" + jsonText + ")");
				}
				break;
			default:
				returnValue = xmlhttp.responseText;
				break;
			}
			if(option.success){
				if (returnValue) {
					option.success.call(this, returnValue);
				} else {
					option.success.call(this);
				}
			}
		}
	},

	// 发送Ajax请求
	ajax : function(options) {
		var ajaxObj = this;

		// 设置参数
		var newOptions = ajaxObj.setOptions.call(ajaxObj, options);

		// 创建XMLHttpRequest对象
		var xmlhttp = ajaxObj.createRequest.call(ajaxObj);

		// 设置回调函数
		xmlhttp.onreadystatechange = function() {
			ajaxObj.readystatechange.call(ajaxObj, xmlhttp, newOptions);
		};

		// 格式化参数
		var formateParams = ajaxObj.formateParameters.call(ajaxObj,newOptions);

		// 请求的方式
		var method = newOptions.type;
		var url = newOptions.url;

		if ("GET" === method.toUpperCase()) {
			url += "?" + formateParams;
		}

		// 建立连接
		xmlhttp.open(method, url, true);

		var tokenKey = this.options.tokenField;
		if(tokenKey && localStorage[tokenKey]) {
			xmlhttp.setRequestHeader('x-'+tokenKey,localStorage[tokenKey]);
		}

		if ("GET" === method.toUpperCase()) {
			//发送请求
			xmlhttp.send(null);
		} else if ("POST" === method.toUpperCase()) {
			// 如果是POST提交，设置请求头信息
			xmlhttp.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded");
			//发送请求
			xmlhttp.send(formateParams);
		}
	}
};
