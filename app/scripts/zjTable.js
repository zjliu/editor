function eachList(dom,selector,callback){
	if(!callback) return;
	Array.prototype.forEach.call(dom.querySelectorAll(selector),callback);
}

function getHEX(el,name){
	var rgbaStr = getComputedStyle(el)[name];
	return '#'+rgbaStr.split(/[(,)]/).splice(1,3).map(function(p){var c=(~~p).toString(16); return c.length===1?'0'+c:c;}).join('');
}

HTMLElement.prototype.index=function(){
	return Array.prototype.indexOf.call(this.parentNode.children,this);
}

HTMLElement.prototype.sindex=function(selector){
	return Array.prototype.indexOf.call(this.parentNode.querySelectorAll(selector),this);
}

!(function(){
	"use strict";
	var twObj={'int':70,'shortInt':40,'string':70,'color':70,'shortString':40,'date':120,'datetime':150,'list':120,'listdata':120};
	var checkExpObj={
		'int':/^-?\d+$/,
		'shortInt':/^-?\d+$/,
		'string':/^.+$/,
		'color':/^#[0-9a-fA-F]{6}$/,
		'shortString':/^.+$/,
		'date':/^[12]\d{3}-((0?[1-9])|1[12])-((0?[1-9])|([1-2]\d)|(3[01]))$/,
		'datetime':/^[12]\d{3}-((0?[1-9])|1[12])-((0?[1-9])|([1-2]\d)|(3[01])) (([0-1]?\d)|(2[0-3])):[0-5]?\d:[0-5]?\d$/,
		'list':/^\d+$/,
		'listdata':/^(([^,]+,)*[^,]+)?$/
	};
	function getNowString(ctime){
		var d = new Date;
		var str = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
		return str+(ctime?' '+[d.getHours(),d.getMinutes(),d.getSeconds()].join(':'):'')
	}
	//template
	var selectTemplate = `
		<select>
			<%for(var i=0,l=data.length;i<l;i++){%>
				<option value="<%=i%>"<%=attr('selected',value===i)%>><%=unescape(data[i])%></option>
			<%}%>
		</select>
	`;
	//data,item,edit
	var rowDataTemplate = `
		<tr class="tbData<%=data.edit?" edit newRow":""%>"<%=attr("table_id",!data.edit && data.type==='row' && item[0])%>>
			<td type="index"></td>
			<%if(data.edit){for(var value of item){switch(value.type){%>
				<%case 'color':%>
					<td type="color" class="field"><input type="color" value="<%=value.value%>" /></td>
				<%break;case 'date':%>
					<td type="date" class="field">
						<input type="text" readonly="readonly" class="Wdate" onClick="WdatePicker()" value="<%=value.value%>"/></td>
				<%break;case 'datetime':%>
					<td type="datetime" class="field"><input type="text" readonly="readonly" class="Wdate" 
						onClick="WdatePicker({dateFmt:"yyyy-MM-dd HH:mm:ss"})" value="<%=value.value%>"/></td>
				<%break;case "list":%>
					<td type="list" class="field"><select>
						<%for(var i=0,l=value.value.length;i<l;i++){%>
							<option value="<%=i%>"><%=unescape(value.value[i])%></option>
						<%}%>
					</select></td>
					<%break;default:%>
						<td type="<%=value.type%>" class="field">
							<input type="text" value="<%=unescape(value.value)%>" /> </td>
					<%break;%>
			<%}}}else{var fields=data.fields[data.fields.length-1];for(var i=0,l=item.length;i<l;i++){%>
				<%var field=fields[i];if(item[i]===null) item[i]="";%>
				<%switch(field.type){%>
					<%case "list":%>
						<td type="list" class="field" sindex="<%=item[i]%>"><%=unescape(field.data[item[i]])%></td>
					<%break; case "color":%>
						<td type="color" class="field"><span style="background-color:<%=item[i]%>"></span></td>
					<%break; case "string": case "listdata":%>
						<td type="<%=field.type%>" class="field">
							<input class="stringinput" readonly="readonly" value="<%=unescape(item[i])%>"/>
						</td>
					<%break; default:%>
						<td type="<%=field.type%>" class="field"><%=unescape(item[i])%></td> 
					<%break;%>
			<%}}}%>
			<%if(data.operate){var op=data.operate;if(op.add+op.update+op.drop>0){%>
					<td class="zjtable_opr_data ow<%=op.add+op.update+op.drop%>">
						<%if(op.add){%> <i class="zjtable_row_add fa fa-plus" title="添加"></i> <%}%>
						<%if(op.update){%> 
							<%if(data.edit){%> <i class="zjtable_row_update fa fa-check" title="保存"></i> 
							<%}else{%> <i class="zjtable_row_update fa fa-pencil-square-o" title="修改"></i> <%}%>
						<%}%>
						<%if(op.drop){%> <i class="zjtable_row_delete fa fa-times" title="删除"></i> <%}%>
					</td>
				<%}%>
				<%if(op.up+op.down>0){%>
					<td class="zjtable_opr_move ow<%=op.up+op.down%>">
						<%if(op.up){%> <i class="zjtable_row_up fa fa-arrow-up" title="上移"></i><%}%>
						<%if(op.down){%> <i class="zjtable_row_down fa fa-arrow-down" title="下移"></i> <%}%>
					</td>
				<%}%>
			<%}%>
		</tr>
	`;
	var headerTemptStr = `
		<table class="zjtable" width="<%=data.tableWidth.w%>px">
			<thead>
			<%var fieldLen=data.fields.length;%>
			<%data.fields.forEach(function(jtem,jndex){%>
				<tr<%=attr("class",(jndex===fieldLen-1)?"fields":"header")%>>
					<%if(jndex===0){%>
						<th type="index"<%=attr("rowspan",fieldLen)%>>序号</th>
					<%}%>
					<%jtem.forEach(function(item){%>
						<th<%=attr("type",item.type)%><%=attr("rowspan",item.rowspan)%><%=attr("colspan",item.colspan)%>>
							<%=unescape(item.text)%>
						</th>
					<%});%>
					<%if(jndex===0 && data.operate){var op=data.operate;%>
						<%if(op.add+op.update+op.drop+op.up+op.down>0){%> <th width="<%=data.tableWidth.o+2%>">操作</th> <%}%>
					<%}%>
				</tr>
			<%});%>
			</thead><tfoot>
			<%if(data.operate){var op=data.operate;%>
				<%if(op.add+op.update+op.drop+op.up+op.down>0){%>
				<tr class="tipTr"><td>
					<div class="zjtable_tip_tr" style="width:calc(100% - <%=data.tableWidth.o+3%>px);"></div>
					<div class="zjtable_opr_all" style="width:<%=data.tableWidth.o%>px">
						<i class="zjtable_row_update fa fa-pencil-square-o update_all" title="修改全部"></i>
						<i class="zjtable_row_update fa fa-check save_all" title="保存全部"></i>
						<i class="zjtable_row_delete fa fa-times delete_all" title="清空数据"></i>
					</div>
				</td></tr>
			<%}}%>
			</tfoot><tbody style="width:<%=data.tableWidth.w+2%>px;">
				<%data.data.forEach(function(item){%> ${rowDataTemplate} <%});%>
			</tbody>
		</table>
	`;
	var selectFun = template(selectTemplate,'data,value');
	var headerFun = template(headerTemptStr);
	var rowFun = template(rowDataTemplate,'data,item');
	var options = {
		container:null,
		queryUrl:'/db/get',
		updateUrl:'/db/update',
		showops:true,
		tableId:null,
		//type: table or row 指表是一行为一个表还是整个表是一个表
		type:'table',
		delayInit:false
	};

	class table{
		constructor(opts){
			this.opts = {};
			for(var key in options) this.opts[key]=opts[key]||options[key];
			this.init();
		}
		init(){
			var opt = this.opts;
			if(!opt.container) return;
			var containerType = Object.prototype.toString.call(opt.container);
			if(opt.container instanceof HTMLElement || containerType==="[object ShadowRoot]") this.containerEl = opt.container;
			else this.containerEl = document.querySelector(opt.container);
			if(!this.containerEl) return;
			this.initEvent();
			if(!opt.delayInit) this.initData();
		}
		initData(){
			var self = this;
			this.queryData(function(info){
				if(!info.success) return;
				var data = info.data;
				var tData = JSON.parse(data.stct);
				var operation = JSON.parse(data.operation);
				var data = JSON.parse(data.data||'[]');
				self.operation = operation;
				self.tData = tData;
				var sdata = [],temp=[];
				tData.forEach((p,index,arr)=>{
					temp.push(p);
					if(p.newline) {sdata.push(temp);temp=[];}
					if(temp.length && index===arr.length-1) sdata.push(temp);
				});
				self.dealTData = sdata[sdata.length-1];
				if(!data || !data.length) data = [self.getEmptyTrData().map(p=>p.type==="list"?0:p.value)];
				self.tableData = { fields:sdata, data:data, operate:operation,tableWidth:self.getTableWidth(), type:self.opts.type };
				self.show(self.data);
				if(!info.success){ self.showTip('数据请求失败！'); return; }
				else self.showTip('数据请求成功！'); 
			});
		}
		queryData(callback){
			var data = {pid:this.opts["tableId"]};
			ajax({type:'POST',url:this.opts.queryUrl,data:data}).then(callback);
		}
		showTip(tip){
			var tipEl = this.containerEl.querySelector('.zjtable_tip_tr');
			if(!tipEl) return;
			tipEl.innerText =  tip;
			setTimeout(function(){ tipEl.innerText = ''; },1000);
		}
		show(){ this.containerEl.innerHTML = headerFun(this.tableData); }
		update(){ this.initData(); }
		getColData(tdEl){ return this.tData[tdEl.index()]; }
		getRowData(trEl){
			var tds = trEl.children;
			var tData = this.dealTData;
			var arr = [],td,value;
			for(var i=0,l=tData.length;i<l;i++){
				td = tds[i+1];
				value = td.querySelector('input,select').value;
				switch(tData[i].type){
					case 'int':case'shortInt':case 'list': value = ~~value; break;
					case 'listdata':value=value.split(',').map(p=>escape(p)); break;
					default: value = escape(value); break;
				}
				arr.push(value);
			}
			return arr;
		}
		getTableWidth(){
			var tData = this.dealTData;
			var arr = tData.map(p=>twObj[p.type]);
				arr.push(41);//顺号宽
			var optW = 0; //顺号宽
			var op=this.operation ;
			switch(op.add+op.update+op.drop){ case 3: optW+=100; break; case 2: optW+=80; break; case 1: optW+=60; break; }
			switch(op.up+op.down){ case 2: optW+=80; break; case 1: optW+=60; break; }
			arr.push(optW);
			return {o:optW,w:arr.reduce((a,b)=>a+b)};
		}
		getEmptyTrData(){
			var tData =  this.dealTData;
			var arr=[],obj;
			for(var item of tData){
				obj = {};
				obj.type = item.type;
				switch(item.type){
					case 'shortInt': case 'int': obj.value = 0; break;
					case 'date': obj.value = getNowString(); break;
					case 'datetime': obj.value = getNowString(true); break;
					case 'list': obj.value = item.data; break;
					case 'color': obj.value = '#000000'; break;
					default: obj.value = ''; break;
				}
				arr.push(obj);
			}
			return arr;
		}
		initEvent(){this.initOperate();}
		initOperate(){
			this.containerEl.addEventListener('click',(e)=>{
				var target = e.target,clist=target.classList;
				if(clist.contains('update_all')) {this.update_all();return;}
				if(clist.contains('save_all')) {this.save_all();return;}
				if(clist.contains('delete_all')) {this.delete_all();return;}
				var trEl = this.getTargetTr(target);
				if(clist.contains('zjtable_row_add')) {this.addNewRow(trEl);return;}
				if(clist.contains('zjtable_row_update')){this.modifyRow(trEl);return;}
				if(clist.contains('zjtable_row_delete')) {this.deleteRow(trEl);return;}
				if(clist.contains('zjtable_row_up')) {this.rangeRow(trEl,true);return;}
				if(clist.contains('zjtable_row_down')) {this.rangeRow(trEl);return;}
			});
			this.containerEl.addEventListener('dblclick',(e)=>{
				var el=e.target.closest(p=>p.tagName==='TD'),trEl=el.parentElement;
				if(!el.classList.contains('field') || trEl.classList.contains('edit')) return;
				this.modifyRow(trEl);
			});
		}
		getTargetTr(el){ return el.closest(p=>p.tagName.toLowerCase()==='tr'); }
		getQueryData(data,type,index){ return {data:data,type:type,index:index,id:this.opts["tableId"]}; }
		data_save(data,index,isNew,callback){
			var self = this;
			var promise = ajax({
				url:self.opts.updateUrl,
				type:'POST',
				data:self.getQueryData(JSON.stringify(data),isNew?"add":"update",index)
			});
			promise.then(function(info){
				self.showTip(`数据${isNew?"添加":"更新"}${info.success?"成功":"失败"}`);
				if(info.success && callback) callback();
			});
		}
		resetTableId(trEl){ if(this.opts.type==='row') this.opts.tableId=~~(trEl.getAttribute('table_id')); }
		addNewRow(trEl){
			var temp = document.createElement('tbody');
			temp.innerHTML = rowFun({ tbData:this.tData, edit:true, operate:this.tableData.operate }, this.getEmptyTrData());
			if(trEl.nextElementSibling) trEl.parentElement.insertBefore(temp.firstChild,trEl.nextElementSibling);
			else trEl.parentElement.appendChild(temp.firstChild);
		}
		checkSave(trEl){
			var tds = trEl.querySelectorAll('.field');
			return Array.prototype.filter.call(tds,(td)=>{
				td.classList.remove('error');
				return !checkExpObj[td.getAttribute('type')].test(td.querySelector('input,select').value);
			});
		}
		modifyRow(trEl,genObj){
			var promise = new Promise((resolve,reject)=>{
				var arr = this.dealTData;
				var el = trEl.querySelector('.zjtable_row_update');
				if(trEl.classList.contains('edit')){
					var errorArray = this.checkSave(trEl);
					if(errorArray.length){ errorArray.forEach(el=>el.classList.add('error')); return; }
					var subData=this.getRowData(trEl);
					var index = trEl.sindex('tr.tbData');
					var isNew = trEl.classList.contains('newRow');
					this.resetTableId(trEl);
					this.data_save(subData,index,isNew,function(){
						var tds = trEl.querySelectorAll('.field');
						for(var i=0,l=arr.length;i<l;i++){
							var td = tds[i],value = td.querySelector('input,select').value;
							if(arr[i].type==='color') td.innerHTML = `<span style="background-color:${value}"></span>`;
							else if(arr[i].type==='list') td.innerText = unescape(arr[i].data[~~value]);
							else td.innerText = unescape(value);
						}
						trEl.classList.remove('edit');
						trEl.classList.remove('newRow');
						el.classList.remove('fa-check');
						el.classList.add('fa-pencil-square-o');
						resolve();
					});
					return;
				}
				trEl.classList.add('edit');
				el.classList.remove('fa-pencil-square-o');
				el.classList.add('fa-check');
				el.setAttribute('title','保存');
				for(var i=0,l=arr.length;i<l;i++){
					var item = arr[i];
					var td = trEl.children[i+1];
					switch(item.type){
						case 'list':
							td.innerHTML=selectFun(item.data,~~td.getAttribute('sindex'));
						break;
						case 'datetime':
							td.innerHTML=`<input type="text" class="Wdate" readonly="readonly" 
								onclick="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm:ss'})" value="${td.innerText}" >`;
						break;
						case 'date':
							td.innerHTML=`<input type="text" class="Wdate" readonly="readonly" onclick="WdatePicker()" value="${td.innerText}" >`;
						break;
						case 'color':
							var color = getHEX(td.querySelector('span'),'background-color');
							td.innerHTML=`<input type="color" value="${color}">`;
						break;
						default:
							let input = td.querySelector('input'),value=input && input.value || td.innerText;
							td.innerHTML=`<input type="text" value="${value}">`;
						break;
					}
				}
			});
			genObj && promise.then(()=>genObj.next());
			return promise;
		}
		deleteRow(trEl,genObj){
			var promise = new Promise((resolve,reject)=>{
				if(trEl.parentNode.querySelectorAll('tr.tbData').length===1){ this.showTip('最后一行不能删除'); return; }
				this.resetTableId(trEl);
				var isNew = trEl.classList.contains('newRow');
				if(isNew) { this.removeTr(trEl);return; }
				var index = trEl.sindex('tr.tbData');
				var promise = ajax({
					url:this.opts.updateUrl,
					type:'POST',
					data:this.getQueryData([],'delete',index)
				});
				promise.then(info=>{
					if(info.success) this.removeTr(trEl);
					this.showTip(`删除${info.success?"成功":"失败"}！`);
					resolve();
				});
			});
			genObj && promise.then(()=>genObj.next());
			return promise;
		}
		removeTr(trEl){ trEl.classList.add('deleted'); trEl.parentElement.removeChild(trEl); }
		rangeRow(trEl,isup){
			if(trEl.classList.contains('edit')) return;
			var index = trEl.sindex('tr.tbData');
			if(index===0 && isup || !trEl.nextElementSibling.classList.contains('tbData') && !isup) return;
			this.resetTableId(trEl);
			var queryData = this.getQueryData([],'exchange',index); queryData.isup = ~~isup;
			var promise = ajax({ url:this.opts.updateUrl, type:'POST', data:queryData });
			promise.then(info=>{
				this.showTip(`排序${info.success?"成功":"失败"}！`);
				if(!info.success) return;
				var cpTr = trEl.cloneNode(true);
				var tbody=trEl.parentNode,preEl = trEl.previousElementSibling,nextEl=trEl.nextElementSibling;
				if(!trEl.parentNode) return;
				trEl.parentNode.removeChild(trEl);
				if(isup) { tbody.insertBefore(cpTr,preEl); return;}
				if(nextEl.nextElementSibling) tbody.insertBefore(cpTr,nextEl.nextElementSibling);
				else tbody.appendChild(cpTr);
			});
		}
		update_all(trEl){ eachList(this.containerEl,'.tbData .fa-pencil-square-o',(el,index)=>this.modifyRow(this.getTargetTr(el))); }
		save_all(trEl){
			var self = this;
			var genObj;
			function* iterTree(arr){
				for(let i=0,l=arr.length;i<l;i++) yield self.modifyRow(self.getTargetTr(arr[i]),genObj);
			}
			genObj=iterTree(this.containerEl.querySelectorAll('.tbData .fa-check'));
			genObj.next();
		}
		delete_all(trEl){
			var self = this;
			var genObj;
			function* iterTree(arr){
				for(let i=0,l=arr.length;i<l;i++) yield self.deleteRow(self.getTargetTr(arr[i]),genObj);
			}
			genObj=iterTree(this.containerEl.querySelectorAll('.tbData .zjtable_row_delete'));
			genObj.next();
		}
	}

	var zjTBPro=Object.create(HTMLDivElement.prototype);
	zjTBPro.createdCallback=function(){
		var root = this.createShadowRoot();
		var tbOpt ={
			container:root,
			queryUrl:this.getAttribute("x_get_url"),
			updateUrl:this.getAttribute("x_update_url"),
			showops:true,
			tableId:this.getAttribute("x_table_id")||null,
			type:this.getAttribute("x_table_type"),
			delayInit:this.getAttribute("x_delay_init")==="true"
		};
		this.table = new table(tbOpt);
	}
	zjTBPro.attributeChangedCallback=function(attrName, oldVal, newVal){
		switch(attrName){
			case "x_table_id":
				this.table.opts.tableId = newVal;
				this.table.update();
			break;
		}
	}
	var zjTB=document.registerElement('x-zjtable',{prototype:zjTBPro});
	window.HTMLZJTableElement = zjTB;
})();
