!(function(win){
	function G(id){ 
		return document.getElementById(id);
	}
	if(!HTMLElement.prototype.appendHTML){
		HTMLElement.prototype.appendHTML = function(html) {
			var fragment = GetHTMLFragment(html);
			this.appendChild(fragment);
			fragment = null;
		}
	}
	if(!HTMLElement.prototype.insertBeforeHTML){
		HTMLElement.prototype.insertBeforeHTML = function(html,existingElement) {
			var fragment = GetHTMLFragment(html);
			this.insertBefore(fragment,existingElement)
			fragment = null;
		}
	}
	if(!HTMLElement.prototype.insertAfterHTML){
		HTMLElement.prototype.insertAfterHTML = function(html,existingElement) {
			var el = existingElement.nextElementSibling;
			if(el) this.insertBeforeHTML(html,el);
			else this.appendHTML(html);
		}
	}

	function GetHTMLFragment(html){ 
		var divTemp = document.createElement("div"), 
			nodes = null,
			fragment = document.createDocumentFragment();

		divTemp.innerHTML = html;
		nodes = divTemp.childNodes;
		for (var i=0, length=nodes.length; i<length; i+=1) {
		   fragment.appendChild(nodes[i].cloneNode(true));
		}
		return fragment;	
	}

	function JunTemplate(ajaxObj){
		this.ajaxHelper = ajaxObj;
		this.init();
	}
	JunTemplate.prototype={
		init:function(){
			var tmpDom = document.querySelectorAll('script[type="template/script"]');
			var self = this;
			Array.prototype.forEach.call(tmpDom,function(dom){
				var str = dom.innerHTML;
				var type = dom.getAttribute('data-fun');
				var fun = window[type];
				if(fun && typeof fun ==='function'){
					fun(function(result){
						dom.parentNode.insertAfterHTML(self.template(str)(result),dom);
						dom.parentNode.removeChild(dom);
					});
					return;
				}
				var url = dom.getAttribute('data-url');
				if(url && self.ajaxHelper){
					self.ajaxHelper.ajax({
						type:'get',
						url:url,
						success:function(data){
							dom.parentNode.insertAfterHTML(self.template(str)(data),dom);
							dom.parentNode.removeChild(dom);
						}
					});
					return;
				}
				dom.parentNode.insertAfterHTML(self.template(str)(),dom);
				dom.parentNode.removeChild(dom);
			});
		},
		template:function(tempStr,dataParam){
			var html='var html="";';
			tempStr.split(/(<%.+?%>)/).map(function(item){
				if(!item) return;
				var r = /^<%(=?.*)%>$/.exec(item);
				var value = '';
				if(r && r.length){
					value = r[1]; 
					if(value[0]=='=') html+=' html+'+value+';';
					else html+=value;
				}
				else{
					value = item.replace(/[\n\t]/g,'');
					html+=" html+='"+value+"';";
				}
			});
			html+=" return html;";
			var fun = new Function(dataParam || "data",html);
			return fun;
		},
		compiled:function(tempStr,data){
			var fun = this.template(tempStr);
			return fun(data);
		},
		applyTemplate:function(data,templateId,el,needEmpty){ 
			var scriptTemplate = G(templateId).innerHTML,
				compiled = this.template(scriptTemplate),
				html = compiled(data);
			needEmpty && (el.innerHTML = '');
			el.appendHTML(html);
		},
		applyInsertAfterTemplate:function(data,templateId,el,existingElement){ 
			var scriptTemplate = G(templateId).innerHTML,
				compiled = this.template(scriptTemplate),
				html = compiled(data);
			el.insertAfterHTML(html,existingElement);
		}
	}
	win.JunTemp = JunTemplate;
})(window);
