"use strict";

var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('./server/db.sqlite3');

var userType={ 'admin':0, 'user':1 };
var catType={ 'public':0, 'private':1 };
var articleType={ 'public':0, 'private':1, 'website':2 };

function queryArticleType(callback){
	var sql = "select data from db where name='keyValue'";
	query(sql,function(data){
		callback && callback(JSON.parse(data[0].data).filter(p=>p[0]==='aType'));
	});
}

function getInsertSql(table,obj,fileds){
	var sql = "insert into "+table+"("+Object.keys(fileds)+") values(";
	var values = [];
	for(var key in fileds){
		var value = obj[key]===undefined ? 'null' : obj[key];
		values.push(fileds[key]?"'"+value+"'":value);
	}
	sql+=values+")";
	return sql;
}

function getUpdateSql(table,obj,fileds,whereSql){
	var sql = "update "+table+" set ";
	var values = [];
	for(var key in fileds){
		var value = obj[key];
		if(obj[key]===undefined) continue;
		values.push(key+"="+(fileds[key]?"'"+value+"'":value));
	}
	return sql+values+' '+(whereSql||'');
}

function doLogin(name,pwd,callback){
	var crypto = require('crypto');
	var md5 = crypto.createHash('md5');
	md5.update(pwd);
	pwd = md5.digest('hex');
	var sql = "select uid from user where name='"+name+"' and pwd='"+pwd+"'";
	query(sql,function(data){
		callback && callback(data);
	});
}

function getCategoryList(callback){
	queryArticleType(function(arr){
		callback && callback(arr.map((p,index)=>{return {cid:index,text:p[1],value:p[2],checked:p[3]};}));
	});
}

function getArticleList(callback){
	queryArticleType(function(arr){
		for(var obj={},i=0,l=arr.length;i<l;i++){
			obj[i]=arr[i][1];
		}
		var sql = "select cid,aid,title from article where type>0";
		query(sql,function(data){
			data.forEach(p=>p.cname=obj[p.cid]);
			callback && callback(data);
		});
	});
}

function doArticle(type,min,value,articleData,res){
	var contentValue = '';
	switch(type.toLowerCase()){
		case 'javascript':
		case 'js':
			contentValue = "application/x-javascript";
			if(min){
				try{
					var UglifyJS = require("uglify-js");
					var result = UglifyJS.minify(value, {fromString: true});
					value = result.code;
				}catch(e){
					console.log(e.message);
				}
			}
		break;
		case 'css':
			contentValue = 'text/css';
			if(min){
				try{
					var uglifycss = require('uglifycss');
					value = uglifycss.processString(value);
				}catch(e){
					console.log(e.message);
				}
			}
		break;
		case 'markdown':
		case 'md':
			try{
				/*
				var md = require('markdown').markdown;
				value = md.toHTML(value);
				*/
				var MarkdownIt = require('markdown-it'),
					md = new MarkdownIt();
					value = md.render(value);
				value = createBlog(articleData.title,value,articleData.cdate,articleData.udate);
			}catch(e){
				console.log(e.message);
			}
			contentValue =  'text/html';
		break;
		case 'html':
			contentValue =  'text/html';
		break;
	}
	if(contentValue){
		res.writeHead(200,{"Content-Type":`${contentValue};charset=utf-8`});
		res.write(value);
		res.end();
	}
}

function getSrc(filename,callback,res){
	queryArticleType(function(arr){
		var sql = `select cid,content from article where title='${filename}'`;
		query(sql,function(data){
			if(data && data.length){
				var articleData = data[0];
				var type = arr[articleData.cid||0][1];
				var value = unescape(articleData.content);
				doArticle(type,false,value,articleData,res);
				return;
			}
			callback(false);
		});
	});
}

function getArticle(aid,callback,queryObj,res){ 
	var sql = `select title,content,cid,cdate,udate from article where aid=${aid}`;
	var type = queryObj.type;
	var min = queryObj.min === "true";
	var blog = queryObj.blog === "true";
	query(sql,function(data){
		//有type则为引用资源
		if(type && data && data.length){
			var articleData = data[0];
			var value = unescape(articleData.content);
			doArticle(type,min,value,articleData,res);
			return;
		}
		//编辑器读取article
		if(data && data.length) callback(data[0]);
		else callback(false);
	});
}

function addArticle(uid,params,callback){
	params.uid = uid;
	params.cdate = "datetime('now','localtime')";
	params.udate = "datetime('now','localtime')";
	var fileds = {
		"cid":false,"uid":false,"title":true,
		"content":true,"cdate":false,"udate":false,
		"type":false
	};
	params.content = escape(params.content);
	queryArticleType(function(arr){
		for(var i=0,l=arr.length;i<l;i++) if(arr[i][2]===params.cid) params.cid=i;
		var sql = getInsertSql('article',params,fileds);
		exec(sql,function(error){
			if(!callback) return;
			if(error===null){
				var sql = "select max(aid) aid from article";
				query(sql,function(data){
					data && data.length && callback(true,data[0]);
				});
			}
			else callback(false);
		});
	});
}

function saveArticle(aid,title,content,callback){
	var titleSql = !!title?"title='"+title+"'":"";
	var splitStr = title && content ? ',' : '';
	var contentSql = !!content?"content='"+escape(content)+"'":"";
	var sql = "update article set "+titleSql+splitStr+contentSql+",udate=datetime('now','localtime') where aid="+aid;
	exec(sql,function(error){
		callback && callback(error===null);
	});
}

function deleteArticle(aid,callback){ 
	var sql = 'delete from article where aid='+aid;
	exec(sql,function(error){
		callback && callback(error===null);
	});
}

function addPen(uid,params,callback){
	params.userId = uid;
	params.type = articleType.public;
	params.sortcode = 0;
	params.cdate = "datetime('now','localtime')";
	params.udate = "datetime('now','localtime')";
	//false 代表不用引号包围
	var fileds = {
		'title':true,'desc':true,
		'userId':false, 'htmlId':false,
		'cssId':false, 'jsId':false,
		'type':false, 'sortcode':false,
		'cdate':false, 'udate':false
	};
	console.log(params);
	var sql = getInsertSql('codepen',params,fileds);
	exec(sql,function(error){
		if(!callback) return;
		if(error===null){
			var sql = "select max(pid) aid from codepen";
			query(sql,function(data){
				data && data.length && callback(true,data[0]);
			});
		}
		else{
			callback && callback(false);
		}
	});
}

function updatePen(uid,params,callback){
	var pid = params.pid;
	var sql = "select userId from codepen where pid="+pid;
	query(sql,function(data){
		if(!data || !data.length) return;
		var userId = data[0].userId;
		if(uid!==userId){
			callback && callback(false,'no permission to update!');
			return;
		}
		var fileds = {
			'title':true,'desc':true,
			'htmlId':false,'cssId':false, 
			'jsId':false,'udate':false
		};
		params.udate = "datetime('now','localtime')";
		var whereSql = 'where pid='+pid;
		var updateSql = getUpdateSql('codepen',params,fileds,whereSql);
		exec(updateSql,function(error){
			callback && callback(error===null);
		});
	});
}

function deletePen(uid,pid,callback){
	var sql = "select userId from codepen where pid="+pid;
	query(sql,function(data){
		if(!data || !data.length) return;
		var userId = data[0].userId;
		if(uid!==userId){
			callback && callback(false,'no permission to update!');
			return;
		}
		var deleteSql = "delete from codepen where pid="+pid;
		exec(deleteSql,function(error){
			callback && callback(error===null);
		});
	});
}

function template(tempStr,dataParam){
	var apiFun = [
		function attr(name,value){ return value?[' ',name,'="',value,'"',' '].join(''):''; }
	];
	var html = apiFun+' var html="";';
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
		  if(value!=='') html+=" html+='"+value+"';";
		}
	});
	html+=" return html;";
	return new Function(dataParam || "data",html);
}


function createBlog(title,content,cdate,udate){
	//去除对html标签的转义
	content = content.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ');
	//添加目录
	var cheerio = require('cheerio');
	var $ = cheerio.load(content);
	var els = $('h1,h2,h3,h4,h5,h6');
	var menuTemplate = `
		<%var getIndex=name=>name && parseInt(/^h(\d)$/.exec(name)[1]);%>
		<ul class="menu">
			<%if(data.length){%><li class="root"><a href="#h0"><%=data[0].children[0].data%></a></li><%}%>
			<%for(var i=1,l=data.length;i<l;i++){%>
				<%var item=data[i],nItem=data[i+1],ic=item && ~~item.name[1],nc=nItem && ~~nItem.name[1];%>
				<li><a href="#h<%=i%>" target="_self"><%=item.children[0].data%></a>
					<%if(nc && ic<nc){%><ul><%}%>
					<%if(nc && ic>nc){%></ul><%}%>
				</li>
			<%}%>
		</ul>
	`;
	var menu = template(menuTemplate)(els);
	var htmlTemplate = `
		<!DOCTYPE html>
		<html>
			<head>
				<title><%=data.title%>--小鱼空间</title>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=320, user-scalable=no, initial-scale=1.0, maximum-scale=1.0">
				<!--markdown.css-->
				<link href="/src/github-markdown.css" rel="stylesheet">
			</head>
			<body>
				<div id="top"></div>
				<article>
					<p class="check_menu_p"><label for="check_menu">目录</label></p>
					<input type="checkbox" id="check_menu" />
					<div class="markdown-menu"><%=data.menu%></div>
					<div class="markdown-body"> <%=data.content%> </div>
					<span class="udate_span"><i>更新时间：</i><%=data.udate%></span>
				</article>
				<a class="toTopBtn" href="#top" title="返回顶部"></a>
			</body>
			<script src="/src/markdown_blog.js"></script>
		</html>
	`;
	return template(htmlTemplate)({title,content,cdate,udate,menu});
}

function getPenList(param,callback){
	var index = ~~param.index || 0;
	var pageSize = 6;
	query('select count(*) count from codepen where userId=1',function(data){
		var obj = {page_count:data[0].count,page_size:pageSize};
		var sql = `select * from codepen where userId=1 limit ${pageSize} offset ${pageSize*index}`;
		query(sql,function(data){
			obj.data = data;
			callback && callback(obj);
		});
	});
}

function getBlogList(params,callback){
	var sql = 'select aid,title,udate from article where cid=3 and type=0 order by udate desc';
	query(sql,function(data){
		callback && callback(true,data);
	});
}

function getPen(pid,res,params){
	var htmlSql = "(select content from article where aid=c.htmlId) html,";
	var sql = "select "+htmlSql+"cssId,jsId from codepen c where pid="+pid;
	query(sql,function(data){
		if(!data || !data.length){
			callback && callback(false);
			return;
		}
		var obj = data[0];
		var html = unescape(obj.html);
		var cssId = obj.cssId;
		var cssText = '<link class="csslink" href="/article/'+cssId+'?type=css&min=true" rel="stylesheet">';
		var jsId = obj.jsId;
		var jsText = '<script class="jsscriptlink" src="/article/'+jsId+'?type=js&min=true"></script>';
		var stopJs = '<script class="noscriptlink" src="/src/StopIframe.js?min=true"></script>';
		
		var cheerio = require('cheerio');
		var $ = cheerio.load(html);

		var isIframe = params.type==="iframe";
		var $head = $('head');
		if($head){
			$head.append(cssText);
			isIframe && $head.append(stopJs);
		}
		var $body = $('body');
		if($head){
			$body.append(jsText);
		}
		var value = $.html();
		if(!$('link.csslink').length) value=cssText+value;
		if(isIframe && !$('script.noscriptlink').length) value=stopJs+value;
		if(!$('script.jsscriptlink').length) value+=jsText;

		res.writeHead(200,{"Content-Type":"text/html"});
		res.write(value);
		res.end();
	});
}

function addCategory(params,callback){
	params.udate = "datetime('now','localtime')";
	var fileds = {
		'text':true,'udate':false
	};
	var sql = getInsertSql('cat',params,fileds);
	exec(sql,function(error){
		if(!callback) return;
		if(error===null){
			var sql = "select max(cid) cid from cat";
			query(sql,function(data){
				data && data.length && callback(true,data[0]);
			});
		}
		else{
			callback && callback(false);
		}
	});
}

function deleteCategory(params,callback){
	var cid = params.cid;
	var sql = 'select count(*) count from article where cid='+cid;
	query(sql,function(data){
		var count = data[0].count;
		if(count>0){
			callback && callback(false,'只能删除无文件的分类!');
			return;
		}
		var msql = 'delete from cat where cid='+cid;
		exec(msql,function(error){
			callback && callback(error===null);
		});
	});
}

function array_lastIndexOf(arr,item){
	var lastIndex = -1;
	var isfun = typeof item === 'function';
	arr.forEach((p,index)=>{
		if(isfun && item(p) || !isfun && p===item)  lastIndex = index;
	});
	return lastIndex;
}

function createDBTable(params,callback){
	var querySql = 'select * from db where id=1';
	query(querySql,(data)=>{
		let row=data[0],stct=JSON.parse(row.stct),mdata=JSON.parse(row.data);
		let lastIndex = array_lastIndexOf(stct,a=>!!a.newline);
		let tbData = stct.slice(lastIndex===-1?0:lastIndex,stct.length);
		let rData = mdata.map(row=>{
			var obj={};
			row.forEach((col,index)=>{
				let c = tbData[index];
				obj[c.name]=(c.name==='type'?c.data[col]:col);
			});
			return obj;
		});
		params.udate = "datetime('now','localtime')";
		params.data = "";
		params.stct = JSON.stringify(rData);
		params.type = 1;
		params.operation = '{"add":1,"update":1,"drop":1,"up":1,"down":1}';
		var fileds = {'stct':true,'data':true,'type':false,'udate':false,'operation':true,'name':true};
		var sql = getInsertSql('db',params,fileds);
		exec(sql,function(error){
			if(!callback) return;
			if(error===null){
				var sql = "select max(id) id from db";
				query(sql,function(data){
					data && data.length && callback(true,data[0]);
				});
			}
			else{
				callback && callback(false);
			}
		});
	});
}

function getDBTable(param,callback){
	if(param.pid==='') param.pid = 1;
	var sql = `select id,stct,operation,data from db where id=${param.pid}`;
	query(sql,function(rows){
		callback && callback(~~rows.length,rows[0]);
	});
}

function getDBTableStct(param,callback){
	if(!param.pid){ console.log('getDBTableStct',param);callback && callback(false); return; }
	var sql = `select stct from db where id=1 or id=${param.pid}`;
	query(sql,function(rows){
		var stct = rows[0].stct;
		var stctNameArr = JSON.parse(stct);
		var row1=rows.length===1 && rows[0] || rows[1];
		var data = JSON.parse(row1.stct);
		data = JSON.stringify(data.map(row=>stctNameArr.map((col,index)=>{
			var value = row[col.name];
			switch(col.name){
				case 'type':
					value=col.data.indexOf(value);
				break;
				case 'hidden':
				case 'colspan':
				case 'rowspan':
				case 'newline':
					value = ~~value;
				break;
				case 'data':
					if(value) value = value.join(',');
					else value = '';
				break;
				default:
				break;
			}
			return value;
		})));
		var reObj={ 
			stct:stct,
			data:data,
			operation:JSON.stringify({"add":1,"update":1,"drop":1,"up":1,"down":1})
		};
		callback && callback(~~rows.length,reObj);
	});
}

function getDBTableByName(param,callback){
	var sql = `select id from db where name='${param.pname}'`;
	query(sql,function(rows){
		callback && callback(!!rows.length,rows[0]);
	});
}

function updateDBTable(param,callback){
	var index = parseInt(param.index);
	var type = param.type;
	var sql = 'select data from db where id='+param.id;
	query(sql,function(rows){
		if(rows.length){
			var rowArr = JSON.parse(rows[0].data||'[]');
			switch(type){
				case 'add': rowArr.splice(index,0,JSON.parse(param.data)); break;
				case 'update': rowArr[index]=JSON.parse(param.data); break;
				case 'delete': rowArr.splice(index,1); break;
				case 'exchange':
					var isup = ~~param.isup;
					if(index===0 && isup || index===rowArr.length-1 && !isup) callbak && callback(false);
					rowArr.splice(index+(isup?-1:1),0,rowArr.splice(index,1)[0]);
				break;
				default:
				break;
			}
			var fields = {'data':true,'udate':false};
			var pd = {udate:"datetime('now','localtime')",data:JSON.stringify(rowArr)};
			var whereSql = 'where id='+param.id;
			var updateSql = getUpdateSql('db',pd,fields,whereSql);
			exec(updateSql,(error)=>callback && callback(error===null));
		}else{
			callback && callback(false);
		}
	});
}

var updateStctFun = {
	'add':function(data,index,type){
		var typeDefaultObj={
			int:0, shortInt:0, string:"", shortString:"",
			list:0, color:'#000000', date:"1970-01-01",
			datetime:"1970-01-01 00:00:00"
		};
		var value = typeDefaultObj[type];
		data.forEach((row,i)=>{
			row.splice(index,0,value);
		});
		return data;
	},
	'update':function(data,index,type){
		return [];
	},
	'delete':function(data,index){
		data.forEach((row,i)=>{
			row.splice(index,1);
		});
		return data;
	},
	'exchange':function(data,index,isup){
		if(index===0 && isup || index===data.length-1 && !isup) return data;
		var i=index,j=isup?i-1:i+1;
		data.forEach(row=>{
			let vi = row[i];
			row[i]=row[j];
			row[j]=vi;
		});
		return data;
	}
};

function updateDBTableStct(param,callback){
	var index = parseInt(param.index);
	var type = param.type;
	if(!param.id){ console.log('updateDBTableStct',param);callback && callback(false); return; }
	var sql = `select stct,data from db where id=1 or id=${param.id}`;
	query(sql,function(rows){
		if(rows.length){
			var obj = {},row = [];
			var row0 = rows[0],row1=rows[rows.length-1];
			if(param.data){
				row = JSON.parse(param.data);
				var tbData = JSON.parse(rows[0].stct);
				tbData.forEach((rowObj,index)=>{
					obj[rowObj.name]=rowObj.name==='type'?rowObj.data[row[index]]:row[index];
				});
			}
			var rowArr = JSON.parse(row1.stct);
			var realType = '';
			switch(type){
				case 'add': rowArr.splice(index,0,obj); realType=obj.type; break;
				case 'update': rowArr[index]=obj; realType=obj.type; break;
				case 'delete': rowArr.splice(index,1); break;
				case 'exchange':
					var isup = ~~param.isup;
					if(index===0 && isup || index===rowArr.length-1 && !isup) callbak && callback(false);
					rowArr.splice(index+(isup?-1:1),0,rowArr.splice(index,1)[0]);
					realType=isup; 
				break;
				default:
				break;
			}
			var realData = updateStctFun[type] && updateStctFun[type](JSON.parse(row1.data||'[]'),index,obj && realType);
			var fields = {"stct":true,"udate":false,"data":true};
			var pd = {udate:"datetime('now','localtime')",stct:JSON.stringify(rowArr),data:JSON.stringify(realData)};
			var whereSql = 'where id='+param.id;
			var updateSql = getUpdateSql('db',pd,fields,whereSql);
			exec(updateSql,(error)=>callback && callback(error===null));
		}else{
			callback && callback(false);
		}
	});
}

function queryTableList(param,callback){
	var stctData = [
		{"name":"id","text":"ID","type":"int"},
		{"name":"name","text":"表名","type":"string"},
		{"name":"type","text":"类型","type":"int"},
		{"name":"udate","text":"更新日期","type":"datetime"}
	];
	var sql = 'select id,name,type,udate from db where id>1';
	query(sql,function(rows){
		var arr = rows.map(p=>[p.id,p.name,p.type,p.udate]);
		var obj = {};
		obj.stct = JSON.stringify(stctData);
		obj.data = JSON.stringify(arr);
		obj.type = 1;
		obj.operation = JSON.stringify({"add":0,"update":1,"drop":1,"up":0,"down":0});
		obj.udate = "";
		callback && callback(true,obj);
	});
}

function updateDBTableAll(params,callback){
	var type = params.type;
	if(type==='update'){
		let data = JSON.parse(params.data);
		params.name = data[1];
		params.type = data[2];
		params.udate = "datetime('now','localtime')";
		let fileds = { 'name':true,'udate':false,'type':false };
		let whereSql = 'where id='+params.id;
		let updateSql = getUpdateSql('db',params,fileds,whereSql);
		exec(updateSql,error=>callback && callback(error===null));
		return;
	}
	if(type==='delete'){
		let sql = 'delete from db where id='+params.id;
		exec(sql,error=>callback && callback(error===null));
	}
}

//转化为DB数据[{key:value,key1:value1}]形式
function queryObjDBData(params,callback){
	if(!params.name) { callback(false); return; }
	var sql = `select stct,data from db where name='${params.name}'`;
	query(sql,function(rows){
		if(!rows.length){ callback(false); return;}
		let stct = JSON.parse(rows[0].stct);
		let data = JSON.parse(rows[0].data);
		//处理列
		let lastIndex = array_lastIndexOf(stct,a=>!!a.newline);
		let tbData = stct.slice(lastIndex===-1?0:lastIndex,stct.length);
		let rData = data.map(row=>{
			var obj={};
			row.forEach((col,index)=>{
				let c = tbData[index];
				obj[c.name]=(c.name==='type'?c.data[col]:col);
			});
			return obj;
		});
		//处理where
		try{ var whereObj = JSON.parse(params.where||'{}'); }
		catch(e){callback(false); return;}
		let reData = rData.filter(row=>{
			for(var key in whereObj) if(whereObj[key]!==row[key]) return false;
			return true;
		});
		callback(true,reData);
	});
}

function query(sql,callback){
	db.serialize(function(){
		db.all(sql,function(err,rows){
			callback && callback(rows);
		});
	});
}

function exec(sql,callback){
	db.serialize(function(){
		db.exec(sql,function(err,data){
			callback && callback(err,data);
		});
	});
}

var funsObj={
	doLogin,
	getArticleList,getArticle,addArticle,saveArticle,deleteArticle,
	addPen,getPenList,getPen,updatePen,deletePen,
	createDBTable,updateDBTable,updateDBTableStct,updateDBTableAll,
	getDBTableByName,queryTableList,getDBTableStct,queryObjDBData,getDBTable,
	getSrc,getBlogList
};

for(var key in funsObj) exports[key]=funsObj[key];

//exports.getCategoryList = getCategoryList;
//exports.addCategory = addCategory;
//exports.deleteCategory = deleteCategory;
