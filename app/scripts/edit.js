//进入全屏
function requestFullScreen() {
   var de = document.documentElement;
   if (de.requestFullscreen) {
        de.requestFullscreen();
    } else if (de.mozRequestFullScreen) {
       de.mozRequestFullScreen();
    } else if (de.webkitRequestFullScreen) {
       de.webkitRequestFullScreen();
   }
}

//退出全屏
function exitFullScreen() {
   var de = document;
   if (de.exitFullscreen) {
        de.exitFullscreen();
   } else if (de.mozCancelFullScreen) {
        de.mozCancelFullScreen();
   } else if (de.webkitCancelFullScreen) {
        de.webkitCancelFullScreen();
   }
}

var getParam = function (name) {
	var url = window.location.search;
	var reg = new RegExp('(\\?|&)' + name + '=([^&?]*)', 'i');
	var arr = url.match(reg);
	if (arr) return arr[2];
}

var getAid = function (){
	var arr = /^\/editor\/(\d+)$/.exec(location.pathname);
	if(arr && arr.length===2) return arr[1];
}

//字符替换方法
var replace = function(html){ 
	if(!html || arguments.length<2) return;
	for(var i=1;i<arguments.length;i++){ 
		var reg = new RegExp('\\{'+(i-1)+'\\}','g');
		html = html.replace(reg,arguments[i]);
	}
	return html;
}

function notify(title,body){
	if(window.currentNotify) window.currentNotify.close();
	if(Notification.permission !== 'denied'){
		Notification.requestPermission();
	}
	if(Notification.permission === "granted"){
		var option = {'dir':'rtl','icon':'/images/notify.png','body':body};
		window.currentNotify = new Notification(title,option);
		setTimeout(function(){
			window.currentNotify.close();
		},2000);
	}
}

!function(win){
	var G=(id)=>document.getElementById(id);
	var Q=(selector)=>document.querySelector(selector);
	HTMLElement.prototype.Q=function(selector){ return this.querySelector(selector); }
	HTMLElement.prototype.QA=function(selector){ return this.querySelectorAll(selector); }

	var tokenFiled = 'access-token';
	AjaxUtil.options.tokenFiled = tokenFiled;

	function animate(el){
		var animateName = el.dataset.animate;
		if(!animateName) return;
		el.classList.remove('hidden');
		el.classList.add('animated');
		el.classList.add(animateName);
	}

	var code = G('code');
	var defOpt = {
		lineNumbers: true,
		mode: 'javascript',
		lineWrapping: true,
		extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
		foldGutter: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		autoCloseTags: true,
		//styleActiveLine: true,
		//matchBrackets: true,
		theme:'3024-night'
	}
	var editor = CodeMirror.fromTextArea(code,defOpt);
	win.editor = editor;

	function setValue(value){ editor.setValue(unescape(value)); }
	function getValue(){ return editor.getValue(); }

	var lang = G('lang');
	var titleEl = G('title');
	var dialogEl = G('dialog');
	var colorEl = G('color');
	var resetBtn = G('reset');
	var vimEl = G('vim');
	var userInfoUl = G('userInfoUl');
	var dialogCloseEls = dialogEl.querySelectorAll('.close');
	var maskEl = G('mask');

	//遮罩
	doMask();
	var messageTip = Q('.messageTip');

	function showMessageTip(html){
		messageTip.innerHTML = html;
		animate(messageTip);
		setTimeout(function(){
			messageTip.classList.add('hidden');
		},2000);
	}

	var TypeObj={
		'js':'javascript',
		'css':'css',
		'html':'text/html',
		'less':'css',
		'sass':'sass',
		'haml':'text/html',
		'md':'text/x-markdown'
	};

	var reTypeObj={
		'javascript':'js',
		'css':'css',
		'text/html':'html',
		'markdown':'md'
	};

	function setTitle(value){
		titleEl.value = value;
		var type = value.match(/[^\./]+$/)[0];
		lang.value = TypeObj[type] || TypeObj.js;
		changeMode.bind(lang)();
	}

	function getTitle(){ return titleEl.value; }

	function getType(){ return document.getElementById('articleType').value; }

	var defColor = '#000000';

	function changeMode(){
		editor.setOption("mode",this.value);
		if(this.value==="markdown"){
			editor.setOption("theme","default");
			Q('.CodeMirror').style.backgroundColor = "#ffffff";
			setBlogView();
		}
		else{
			editor.setOption("theme","3024-night");
			Q('.CodeMirror').classList.remove('markdown');
			Q('.CodeMirror').style.backgroundColor = "#000000";
		}
		document.body.className = this.value;
	}

	function setBlogView(){
		if(lang.value != 'markdown') return;
		var viewBlogEl = Q('.view-blog');
		viewBlogEl.classList[aid && 'remove' || 'add']('new_markdown');
		if(aid) viewBlogEl.setAttribute('href',`/article/${aid}?type=md`);
	}

	lang.onchange = changeMode;
	changeMode.bind({'value':'javascript'})();

	function changeColor(){
		Q('.CodeMirror').style.backgroundColor=this.value;
		localStorage.codemirrorbg=this.value;
	}

	colorEl.onchange = changeColor;

	function vimChange(){
		editor.setOption('keyMap',vimEl.checked?"vim":"default");
		editor.setOption('matchBrackets',vimEl.checked);
		editor.setOption('showCursorWhenSelecting',vimEl.checked);
		localStorage.isVim = vimEl.checked;
	}

	vimEl.onchange = vimChange;

	function reset(){
		lang.value = defOpt.mode;
		colorEl.value = defColor;
		colorEl.onchange();
		lang.onchange();
	}

	resetBtn.onclick = reset;

	function toolsCBChange(){
		localStorage.showTools = ~~this.checked;
	}

	var toolsCBEl = G('toolsCB');
	toolsCBEl.addEventListener('change',toolsCBChange,false);

	function init(){
		if(localStorage.codemirrorbg) {
			var el_color = G('color');
			el_color.value = localStorage.codemirrorbg || defColor;
			el_color.onchange();
		}
		if(localStorage.showTools){
			toolsCBEl.checked = !!~~localStorage.showTools;
		}
		if(localStorage.isVim){
			vimEl.checked = localStorage.isVim==="true";	
			vimEl.onchange();
		}
	}

	var ajaxCompleteObj={count:0,'category':false,'article':false};

	//初使化分类树
	AjaxUtil.ajax({
		url:'/category',
		type:'get',
		data:{'_':Math.random()},
		dataType:'json',
		success:function(data){
			var containner = G('frame');
			var obj={},arr=[];
			data.forEach(function(item){
				var cid = item.cid;
				if(!obj[cid]){
					var cObj = {'text':item.cname,'url':'javascript:void(0);'};
					cObj.children=[];
					obj[cid]=cObj;
				}
				obj[cid].children.push({'text':item.title, 'url':'/editor/'+item.aid});
			});
			for(var key in obj) arr.push(obj[key]);
			applyTemplate(arr,'tree_template',containner);
			ajaxCompleteObj.category=true;
			ajaxCompleteObj.count++;
			unMask();
		}
	});

	function initArticle(aid){
		if(!aid) {
			ajaxCompleteObj.count++;
			unMask();
			return;
		}
		AjaxUtil.ajax({
			url:'/article/'+aid,
			type:'get',
			dataType:'json',
			success:function(data){
				if(data){
					var title = data.title;
					setTitle(title);
					setValue(data.content);
					function setLang(){
						var option = lang.getOption(data.cid+1);
						if(option) lang.value = option.value;
					}
					if(lang.loaded) setLang();
					else lang.onload = setLang;
				}
				else{
					notify('读取文档','读取文档失败！');
					window.location.href = "/editor";
				}
				ajaxCompleteObj.article=true;
				ajaxCompleteObj.count++;
				unMask();
			}
		});
	}

	function unMask(){
		if(ajaxCompleteObj.count>=2){
			maskEl.style.display='none';
			maskEl.classList.remove('active');
		}
	}

	function doMask(){
		maskEl.style.display='block';
		maskEl.classList.add('active');
	}

	var aid = getAid() || getParam('aid');
	initArticle(aid);
	unMask();
	init();

	var rightMenu = G('rightMenu');
	var baseLiHeight = 35;
	var rightMenuHeight = rightMenu.querySelectorAll('li').length * baseLiHeight;
	win.oncontextmenu=e=>e.preventDefault();
	G('edit').oncontextmenu=function(e){
		e.preventDefault();
		if(/^(mask)|(dialog)$/.test(e.target.className)) return;
		var clientObject = document.body.getBoundingClientRect();
		var contextStyleObj = getComputedStyle(rightMenu);
		var bodyW = clientObject.width;
		var bodyH = clientObject.height;
		var contextW = parseInt(contextStyleObj['width']);
		var contextH = parseInt(contextStyleObj['height']) || rightMenuHeight;
		//默认在鼠标位置右下方
		rightMenu.style.top = e.pageY+'px';
		rightMenu.style.left = e.pageX+'px';
		//显示在左方
		if(e.pageX+contextW>bodyW) rightMenu.style.left = (e.pageX-contextW)+'px';
		//显示在上方
		if(e.pageY+contextH>bodyH) rightMenu.style.top = (e.pageY-contextH)+'px';
		showContextMenu();
	}

	function showContextMenu(){
		rightMenu.style.display='block';
	}

	function hideContextMenu(){
		rightMenu.style.display='none';
	}

	var dialog = new Dialog({
		'dialogEl':dialogEl,
		'maskEl':maskEl
	});

	function openAlert(message,closeCallback){
		var data={message:message||'',ok:'确定'};
		dialog.openFromTemplate(data,'alertTemplate',300,150,closeCallback);
	}

	function openConfirm(message,closeCallback){
		var data={message:message||'',ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'confirmTemplate',300,150,closeCallback);
	}

	function openPrompt(tip,callback,closeCallback){
		var data={message:tip||'',ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'promptTemplate',300,150,closeCallback);
		callback && callback();
	}

	function openFileOpen(tip,callback,closeCallback){
		var data={message:tip||'',ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'openFileTemplate',300,150,closeCallback);
		callback && callback();
	}

	function openLogin(callback,closeCallback){
		var data={ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'loginTemplate',300,150,closeCallback);
		callback && callback();
	}

	var rightMenuEvents = {
		newPage:function(){
			hideContextMenu();
			openConfirm('如果未保存的文件,确定打开新页面?',function(isOk){
				isOk &&	(win.location.href="/editor");
			});
		},
		openFile:function(){
			hideContextMenu();
			var fileText = '';
			var fileName = '';
			openFileOpen('选择文件',function(){
				var input = G('openFileInput');
				input.addEventListener('change',function(e){
					fileName = this.value.match(/[^\\\/]+$/)[0];
					var label = dialogEl.querySelector('.openFileBtn');
					label.innerHTML = '文件读取中';
					var files = e.target.files;
					var readFile = files[0];
					var reader = new FileReader();
					reader.onload=function(e){
						fileText = this.result;
						input.value='';
						label.innerHTML = '读取完毕';
					}
					reader.readAsText(readFile);
				});
			},function(isOk){
				if(!isOk) return;
				setTitle(fileName);
				setValue(fileText);
			});
		},
		save:function(){
			if(!aid) return this.saveAs();
			var title = getTitle();
			var content = encodeURIComponent(getValue());
			var mdata = {'aid':aid,'title':title,'content':content};
			AjaxUtil.ajax({
				url:'/article/save',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					hideContextMenu();
					notify('保存文件',data.success?'文件保存成功！':data.message);
				}
			});
		},
		saveAs:function(){
			hideContextMenu();
			var cid = lang.el.selectedIndex;
			var data={'ok':'确定','cancel':'取消','list':null,'title':getTitle()||'','cid':cid||''};
			var content = encodeURIComponent(getValue());
			var mdata = {'content':content};
			function complete_callback(container){
				var sel = container.querySelector('#articleCategory');
				sel.onload=()=>sel.value=lang.value;
			}
			dialog.openFromTemplate(data,'saveAsTemplate',300,200,function(isOk){
				if(!isOk) return;
				mdata.cid = G('articleCategory').value;
				mdata.title = dialogEl.querySelector('.articleTitle').value;
				mdata.type = getType();
				AjaxUtil.ajax({
					url:'/article/add',
					type:'post',
					data:mdata,
					dataType:'json',
					success:function(data){
						hideContextMenu();
						notify('另存文件',data.success?'文件保存成功！':'文件保存失败！');
						if(data.success) {
							aid = data.data.aid;
							win.history.pushState({},document.title,`/editor/${data.data.aid}`);
							setBlogView();
						}
					}
				});
			},complete_callback);
		},
		delete:function(){
			hideContextMenu();
			if(!aid) return;
			openConfirm('如果确定删除此文件?',function(isOk){
				if(!isOk) return;
				var mdata = {'aid':aid};
				AjaxUtil.ajax({
					url:'/article/delete',
					type:'get',
					data:mdata,
					dataType:'json',
					success:function(data){
						notify('删除文件',data.success?'文件删除成功！':data.message);
						data.success && (win.location.href='/editor');
					}
				});
			});
		},
		reload:function(){
			hideContextMenu();
			openConfirm('如果未保存的文件,确定重新加载?',function(isOk){
				isOk && (win.location.reload());
			});
		},
		download:function(){
			hideContextMenu();
			openPrompt('文件名',function(){
				var title = getTitle();
				if(!title) return;
				var index = title.lastIndexOf('.');
				if(index===-1) title +='.'+ reTypeObj[lang.value];
				dialogEl.querySelector('input').value = title;
			},function(isOk){
				if(!isOk || !win.saveText) return;
				var fileName = dialogEl.querySelector('.promptInput').value || getTitle() || 'download.text';
				win.saveText(fileName,getValue());
			});
		}
	};

	var rightClick = false;	
	rightMenu.onclick=function(e){
		var target = e.target;
		if(target.tagName.toLowerCase()=="span"){
			rightClick = true;
			var type = target.getAttribute('data-type');
			if(rightMenuEvents[type]) rightMenuEvents[type]();
		}
	}

	document.addEventListener('click',function(e){
		if(!rightClick){
			hideContextMenu();
		}
		rightClick=false;
	});

	document.addEventListener('keydown',function(e){
		if(e.keyCode===122){
			var editorFullScreen = G('editorFullScreen');
			editorFullScreen.checked = !editorFullScreen.checked;
			return;
		}
		if(!e.ctrlKey) return;
		var type = '';
		switch(String.fromCharCode(e.keyCode)){
			case 'U':
				type = 'newPage';
				break;
			case 'O':
				type = 'openFile';
				break;
			case 'S':
				type = e.altKey ? 'saveAs' : 'save';
				break;
			case 'D':
				if(e.altKey) type="delete";
				break;
			case 'M':
				type = 'download';
				break;
			case 'R':
				type = 'reload';
				break;
		}
		if(type){
			e.preventDefault();
			rightMenuEvents[type]();
		}
	});

	function exitLogin(){
		delete localStorage[tokenFiled];
		delete localStorage.userName;
		window.location.href="#login";
	}

	function initLogin(){
		var userInfo = G('userInfo');
		var isLogin = !!localStorage[tokenFiled];
		var loginEl = userInfo.querySelector('.login');
		var noLoginEl = userInfo.querySelector('.noLogin');
		if(isLogin){
			loginEl.firstElementChild.innerHTML = localStorage.userName;
			loginEl.classList.add('active');
			noLoginEl.classList.remove('active');
		}
		else{
			noLoginEl.classList.add('active');
			loginEl.classList.remove('active');
		}
	}
	initLogin();

	var userEvents={
		exit:function(){
			delete localStorage[tokenFiled];
			delete localStorage.userName;
			win.location.href="/login";
		},
		admin:function(){
			win.location.href="/main";
		}
	}

	userInfoUl.addEventListener('click',function(e){
		var target = e.target;
		if(target.tagName.toLowerCase()!=='li') return;
		var type=target.getAttribute('type');
		userEvents[type] && userEvents[type]();
	});

}(window);
