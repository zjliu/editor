var Dialog=(function(win){
	var option = {
		dialogEl:null,
		maskEl:null
	};
	function dialog(opt){
		this.opt = option;
		for(var key in opt){
			if(option[key]!==undefined){
				this.opt[key]=opt[key] || option[key];
			}
		}
		this.init();
	}
	dialog.prototype={
		init:function(){
			this.checkOpt();
		},
		checkOpt:function(){
			var opt = this.opt;
			if(!opt.dialogEl) throw new Error('dialogEl empty!')
			if(!opt.maskEl) throw new Error('maskEl empty!')
		},
		show:function(){
			var opt = this.opt;
			opt.dialogEl.style.display='block';
			opt.maskEl.style.display='block';
			setTimeout(function(){
				opt.dialogEl.classList.add('active');
				opt.maskEl.classList.add('active');
			});
		},
		close:function(){
			var opt = this.opt;
			opt.dialogEl.classList.remove('active');
			opt.maskEl.classList.remove('active');
			setTimeout(function(){
				opt.dialogEl.style.display='none';
				opt.maskEl.style.display='none';
			},500);
		},
		openFromTemplate:function(data,tempId,width,height,callback,complete_callback){
			var opt = this.opt;
			if(width) opt.dialogEl.style.width = width + 'px';
			if(height) opt.dialogEl.style.height = height + 'px';
			var container = opt.dialogEl.querySelector('.container');
			container.innerHTML = '';
			applyTemplate(data,tempId,container);
			this.show();
			this.addEvent(callback);
			complete_callback && complete_callback(container);
		},
		addEvent:function(closeCallback){
			var opt = this.opt;
			opt.dialogEl.onclick=function(e){
				var el = e.target;
				if(el.classList.contains('close')){
					var type = el.getAttribute('data-type');
					this.close();
					closeCallback && closeCallback(type==='ok');
					closeCallback = null;
				}
			}.bind(this);
		}
	}
	return dialog;
})(window);
