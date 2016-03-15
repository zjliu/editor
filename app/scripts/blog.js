!function(){
	'use strict'
	var tableObj={};
	function setActiveLable(radio_id){
		var activeEl = Q('#page3 li.active');
		activeEl && activeEl.classList.remove('active');
		var label = Q(`#page3 label[for=${radio_id}]`);
		label.parentElement.classList.add('active');
	}
	Array.prototype.forEach.call(document.querySelectorAll('#tableList input[name=tbRadio]'),el=>el.onchange=e=>{
		localStorage.setItem('last_tbRadio',e.target.id);
		setActiveLable(e.target.id);
		var tb = el.nextElementSibling.querySelector('x-zjtable');
		tb && tb.table.update();
	});
	var lastTbRadio = localStorage.getItem('last_tbRadio');
	if(lastTbRadio){
		G(lastTbRadio).click();
		setActiveLable(lastTbRadio);
	}

	//--add table--
	var inputName = G('tableName');
	G('addTableBtn').addEventListener('click',(e)=>{
		var value = inputName.value.trim();
		if(!/^[a-zA-Z]+$/.test(value)) return;
		var promise = ajax({ url:'/db/add', type:'POST', data:{name:value} });
		promise.then((info)=>{
			alert(`添加表${value}${info.success?"成功":"失败"}`);
		});
	});

	//--update stct--
	var tableNameInput_stct = G('tableNameInput_stct');
	function queryStct(name){
		var promise = ajax({ url:'/db/getId', type:'POST', data:{pname:name} });
		promise.then((data)=>{
			if(!data.success) return;
			var stct_tb = G('stct_tb'); stct_tb.setAttribute('x_table_id',data.data.id);
			localStorage.setItem('zjTable_tbName_stct',name);
		});
	}
	G('queryTableBtn_stct').addEventListener('click',(e)=>{
		var value = tableNameInput_stct.value.trim();
		if(!/^[a-zA-Z]+$/.test(value)) value='0';
		queryStct(value);
	});
	var localTbName_stct = localStorage.getItem('zjTable_tbName_stct');
	if(localTbName_stct){ tableNameInput_stct.value = localTbName_stct; queryStct(localTbName_stct); }

	//--update data--
	var tableNameInput = G('tableNameInput');
	function queryTable(name){
		var promise = ajax({ url:'/db/getId', type:'POST', data:{pname:name} });
		promise.then((data)=>{
			if(!data.success) return;
			var data_db = G('data_tb');
				data_db.setAttribute('x_table_id',data.data.id);
			localStorage.setItem('zjTable_tbName',name);
		});
	}
	G('queryTableBtn').addEventListener('click',(e)=>{
		var value = tableNameInput.value.trim();
		if(!/^[a-zA-Z]+$/.test(value)) value='0';
		queryTable(value);
	});
	var localTbName = localStorage.getItem('zjTable_tbName');
	if(localTbName){ tableNameInput.value = localTbName; queryTable(localTbName); }
}();
