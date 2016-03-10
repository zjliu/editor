/*===============login=============*/
!(function(win){
	var G=(id)=>document.getElementById(id);
	var Q=(selector)=>document.querySelector(selector);
	HTMLElement.prototype.Q=function(selector){ return this.querySelector(selector); }
	HTMLElement.prototype.QA=function(selector){ return this.querySelectorAll(selector); }

	var tokenFiled = 'access-token';
	AjaxUtil.options.tokenFiled = tokenFiled;

	function doLogin(){
		var el = G('login');
		var nameEl = el.Q('input[name="username"]');
		var pwdEl= el.Q('input[name="password"]');
		var name = nameEl.value.trim();
		var pwd = pwdEl.value.trim();
		if(!name) {
			nameEl.focus();
			return;
		}
		if(!pwd){
			pwdEl.focus();
			return;
		}
		var mdata={'name':name,'pwd':pwd,'_':Math.random()};
		AjaxUtil.ajax({
			url:'/login',
			type:'post',
			data:mdata,
			dataType:'json',
			success:function(data){
				if(data.success) {
					localStorage[tokenFiled] = data.token;
					localStorage.userName = name;
					notify('用户登录',data.success?'用户登录成功！':data.message);
					window.location.href='/main';
				}
				else pwdEl.focus();
			}
		});
	}
	win.login = doLogin;

	function notify(title,body){
		if(window.currentNotify) window.currentNotify.close();
		if(Notification.permission !== 'denied'){
			Notification.requestPermission();
		}
		if(Notification.permission === "granted"){
			var option = {'dir':'rtl','icon':'images/notify.png','body':body};
			window.currentNotify = new Notification(title,option);
			setTimeout(function(){
				window.currentNotify.close();
			},2000);
		}
	}

	setTimeout(function(){
		Q('.loginwrapper').classList.add('active');
	},10000);

})(this);
