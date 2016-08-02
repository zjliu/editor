function Q(selector,dom){
	return (dom||document).querySelector(selector);
}
var toggleClass = 'slideleft';
var listMenuEl = G('listMenu');

var firstPageSelector = "#page1";
var orgHash = location.hash;
function hashchange(){
	hash=location.hash || firstPageSelector;
	if(orgHash && Q(orgHash)){
		var orgPage = Q(orgHash);
		orgPage.classList.remove(toggleClass);
		if(hash!=firstPageSelector) Q(firstPageSelector).classList.remove(toggleClass);
	}
	if(hash && Q(hash)){
		var curPage = Q(hash);
		loadPage(curPage);
		setTimeout(function(){
			curPage.classList.add(toggleClass);
		},500);
		var index = curPage.index();
		if(index>-1){
			var aEl = listMenuEl.children[index];
			aEl && listMenuclick(null,aEl);
		}
	}
	orgHash = hash;
}

window.onhashchange=hashchange;

var PageLoader={
	penlist:{ init:loadPenList, loaded:false },
	bloglist:{ init:loadBlogList, loaded:false },
	doclist:{init:loadDocList, loaded:false},
	catlist:{ init:loadCatList, loaded:false }
}

function loadPage(pageEl){
	var fun=pageEl.dataset.fun;
	if(!fun) return;
	var obj = PageLoader[fun];
	var callback = PageLoader[fun].init;
	callback && callback.bind(obj)();
}

hashchange();

var dialogEl = G('dialog');
var maskEl = G('mask');
var dialog = new Dialog({ 'dialogEl':dialogEl, 'maskEl':maskEl });

function openAlert(message,closeCallback){
	var data={message:message||'',ok:'确定'};
	dialog.openFromTemplate(data,'alertTemplate',300,150,closeCallback);
}

function openConfirm(message,closeCallback){
	var data={message:message||'',ok:'确定',cancel:'取消'};
	dialog.openFromTemplate(data,'confirmTemplate',300,150,closeCallback);
}

function notify(title,body){
	if(window.currentNotify) window.currentNotify.close();
	if(Notification.permission !== 'denied') Notification.requestPermission();
	if(Notification.permission === "granted"){
		var option = {'dir':'rtl','icon':'/images/notify.png','body':body};
		window.currentNotify = new Notification(title,option);
		setTimeout(function(){ window.currentNotify.close(); },2000);
	}
}

function loadPenList(){
	var createBtn = G('createBtn');
	AjaxUtil.ajax({
		url:'/pen/list',
		type:'get',
		data:{type:'list'},
		success:function(data){
			if(data && data.success === false) window.location.href="/login";
			applyTemplate(data,'penListTemplate',G('penList'),true);
		},
		error:function(info){console.log(info);}
	});

	function openPenDialog(callback,mdata){
		var isUpdate = !!mdata;
		var data = mdata || {};
		data.ok = "确定";
		data.cancel = "取消";
		data.dialog_title = isUpdate && '修改作品' || '添加作品';
		dialog.openFromTemplate(data,'createArticleTemplate',350,250,callback);
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
				success:function(data){ if(data.success){ window.location.reload(); } },
				error:function(info){ console.log(info); }
			});
		});
	}

	createBtn.onclick=function(){ createPen(); }

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
				success:function(data){ if(data.success){ window.location.reload(); } },
				error:function(info){ console.log(info); }
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
				error:function(info){ console.log(info); }
			});
		});
	}
	window.penDrop=penDrop;
	this.loaded=true;
}

function loadCatList(){
	var formEl = G('catForm');
	var catListEl = G('catlistUl');
	var searchInput = formEl.querySelector('.searchInput');

	var cat = {
		run:function(){
			cat.getList();
			cat.addEvent();
			window.addCat = cat.addCat;
		},
		fillCatData:function(data,flag){
			applyTemplate(data,'catsTemplate',catListEl,!!flag);
		},
		getList:function(){
			AjaxUtil.ajax({
				url:'/categoryList',
				type:'get',
				data:{'_':Math.random()},
				dataType:'json',
				success:function(data){
					cat.fillCatData(data,true);
				}
			});
		},
		addCat:function(){
			var mdata = formEl.serialize();
			AjaxUtil.ajax({
				url:'/cat/add',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					if(data.success){
						var obj = data.data;
						var tdata = [{'text':mdata.text,'count':0,'cid':obj.cid}];
						cat.fillCatData(tdata,false);
						searchInput.value = '';
						searchInput.focus();
					}
				}
			});
		},
		deleteCat:function(cid,el){
			var mdata={'cid': cid};	
			AjaxUtil.ajax({
				url:'/cat/delete',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					if(data.success){ var li = el.parentNode; catListEl.removeChild(li); }
				}
			});
		},
		addEvent:function(){
			catListEl.onclick=function(e){
				var target = e.target;
				var cid = target.dataset.cid;
				if(cid===undefined) return;
				openConfirm('是否确认删除此分类?',function(){
					var count = target.previousSibling.getAttribute('artcount');
					cat.deleteCat(parseInt(cid),target);
				});
			}
		}
	}
	cat.run();
}

function loadBlogList(){
	AjaxUtil.ajax({
		url:'/blog/list',
		type:'post',
		data:{type:'main'},
		success:function(data){
			if(!data || !data.data.length) return;
			applyTemplate(data.data,'articleListTemplate',G('articleList'),true);
		},
		error:function(info){console.log(info);}
	});
	function aritcleDrop(aid,el){
		openConfirm('是否删除此博客？',function(result){
			if(!result) return;
			AjaxUtil.ajax({
				url:'/article/delete',
				type:'get',
				data:{aid},
				dataType:'json',
				success:function(data){
					if(data.success) window.location.reload();
				},
				error:function(info){ console.log(info); }
			});
		});
	}
	window.aritcleDrop=aritcleDrop;
}

function loadDocList(){
	var docTemplate=`
		<ul>
			<%data.forEach(function(doc){%>
				<li atype="<%=doc.type%>" ctype="<%=doc.cname%>"><%=doc.title%>
					<a href="/editor/<%=doc.aid%>" target="_black"></a>
				</li>
			<%});%>
		</ul>
	`;
	var templateFun = template(docTemplate);
	var promise = ajax({url:'/category',type:'post',data:{"type":"all"}});
	promise.then(function(data){
		var result=templateFun(data);
		/*
		var dom=GetHTMLFragment(result);
		G('docList').appendChild(dom);
		*/
		G('docList').innerHTML= result;
	});
}
