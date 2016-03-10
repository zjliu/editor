(function(scope,win){
	/*
		回调名称			调用时间点
		createdCallback		创建元素实例
		attachedCallback	向文档插入实例
		detachedCallback	从文档中移除实例
		attributeChangedCallback(attrName, oldVal, newVal)	添加，移除，或修改一个属性
	*/
	if(!scope) scope=win.CustomElements={};
	var objClass = Object.prototype;
	var arrclass = Array.prototype;
	var tagName_reg = /[a-zA-Z0-9]+\-([a-zA-Z0-9])([a-zA-Z0-9]*)/;
	var registry = scope.registry = {};
	function extendsObj(targetObj,sourceObj){ for(var key in sourceObj) targetObj[key]=sourceObj[key]; }

	function register(name,options){
		if(registry[name]) return;
		var definition = options || {};
		definition._name=name;
		if(!tagName_reg.test(name)) 
			throw new Error('document.registerElement: illegal tagName "'+name+'".');	
		if(!definition.template)
			throw new Error('Options missing required template property');
		var el = definition.template;
		var content = el.content;
		var pro = Object.create((win[el.dataset.prototype||'HTMLElement']).prototype);
		pro.createdCallback=function(){
			var root = this.createShadowRoot();
			var bindData = this.dataset.bind;
			try{
				if(!bindData){root.appendChild(document.importNode(content,true));return;}
				var dataType = this.dataset.bindType;
				switch(dataType){
					case 'json':
						data = JSON.parse(bindData); success(data);
					break;
					case 'fun':
						data = eval(bindData); success(data);
					break;
					case 'ajax':
						ajax({url:bindData,type:'get'}).then(success);
					break;
				}
			}catch(e){
				console.log('1、data-bind 属性应该为JSON字符串,function,ajax 2、需要template 3、模板错误');
				throw new Error(e.message);
			}
			function success(data){
				if(!data) return;
				var temp = content.querySelector('.temp'); 
				if(!temp) return;
				var html = template(temp.textContent)(data);
				content.removeChild(temp);
				content.appendChild(GetHTMLFragment(html));
				root.appendChild(document.importNode(content, true));
			}
		}
		if(definition.prototype) extendsObj(pro,definition.prototype);
		var Dom = document.registerElement(name,{prototype:pro});
		registerDefinition(name,definition);
		var saveName = name.replace(/\-/g,'_');
		win[saveName]=Dom;
		return Dom;
	}

	scope.register = register;

	function registerAll(){
		var tmps = document.querySelectorAll('[tagName]');
		arrclass.forEach.call(tmps,function(tempItem){
			var name = tempItem.getAttribute('tagName');
			register(name,{template:tempItem});
		});
	}

	scope.registerAll = registerAll;
	function registerDefinition(name, definition) { registry[name] = definition; }

})(window.CustomElements,window);
