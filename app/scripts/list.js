!function(){
	var dialogEl = G('dialog');
	var maskEl = G('mask');
	var createBtn = G('createBtn');

	var dialog = new Dialog({
		'dialogEl':dialogEl,
		'maskEl':maskEl
	});

	AjaxUtil.ajax({
		url:'/pen/list',
		type:'get',
		dataType:'json',
		success:function(data){
			if(data && data.success === false){
				window.location.href="index.html#login";
			}
			applyTemplate(data,'articleTemplate',G('articleList'));
		},
		error:function(info){
			console.log(info);
		}
	});

	function openPenDialog(callback,mdata){
		var data = mdata || {};
		data.ok = "确定";
		data.cancel = "取消";
		dialog.openFromTemplate(data,'createArticleTemplate',350,250,callback);
	}

	function openConfirm(message,closeCallback){
		var data={message:message||'',ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'confirmTemplate',300,150,closeCallback);
	}

	function createPen(){
		openPenDialog(function(result){
			if(!result) return;
			var form = dialogEl.querySelector('form');
			var mdata = form.serialize();
			AjaxUtil.ajax({
				url:'/pen/add',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					if(data.success){
						window.location.reload();
					}
				},
				error:function(info){
					console.log(info);
				}
			});
		});
	}

	createBtn.onclick=function(){
		createPen();
	}

	function penModify(pid,el){
		var penEl = el.closest(function(dom){
			return dom.tagName.toLowerCase()==='section';
		});
		if(!penEl) return;
		var dataEl = penEl.querySelector('.itemData');
		if(!dataEl) return;
		var data = JSON.parse(unescape(dataEl.value));

		openPenDialog(function(result){
			if(!result) return;
			var form = dialogEl.querySelector('form');
			var mdata = form.serialize();
			mdata.pid = pid;
			AjaxUtil.ajax({
				url:'/pen/update',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					if(data.success){
						window.location.reload();
					}
				},
				error:function(info){
					console.log(info);
				}
			});
		},data);
	}
	window.penModify=penModify;

	function penDrop(pid,el){
		openConfirm('是否删除此作品？',function(result){
			if(!result) return;
			var mdata = {'pid':pid};
			AjaxUtil.ajax({
				url:'/pen/delete',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					if(data.success){
						window.location.reload();
					}
				},
				error:function(info){
					console.log(info);
				}
			});
		});
	}
	window.penDrop=penDrop;
}();
