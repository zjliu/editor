!function(){
	if(!window.CustomElements) return;
	var register = CustomElements.register;

	//pen-btn
	function registerPenBtn(){
		var penBtn_temp = G('penBtnTemplate');
		var pro={
			attachedCallback:function(){
				var data = this.dataset;
				var root = this.shadowRoot;
				var a = root.querySelector('a');
				a.href=data.href||'javascript:void(0)';
				a.innerText = data.value || '';
			},
			attributeChangedCallback:function(attrName, oldVal, newVal){
				var root = this.shadowRoot;
				var a = root.querySelector('a');
				if(attrName==='data-href') a.href=newVal;
				if(attrName==='data-value') a.innerText=newVal;
			}
		}
		register('pen-btn',{template:penBtn_temp, prototype:pro});
	}

	function registerListMenu(){
		window.menuData=[
			{"href":"#page1","value":"作品列表","active":true},
			{"href":"#page2","value":"博客列表"},
			{"href":"#page3","value":"统计信息"},
			{"href":"#page4","value":"表管理"}
		];
		var listmenu_temp = G('listMenuTemplate');
		var pro={
			attachedCallback:function(){
				function aclick(){
					var lastActive = this.parentNode.querySelector('.active');
					lastActive && lastActive.classList.remove('active');
					this.classList.add('active');
				}
				var aEls = this.shadowRoot.querySelectorAll('a');
				Array.prototype.forEach.call(aEls,function(dom){ dom.onclick=aclick; });
			},
			attributeChangedCallback:function(attrName, oldVal, newVal){ }
		}
		register('list-menu',{template:listmenu_temp, prototype:pro});
	}

	registerPenBtn();
	registerListMenu();

}();
