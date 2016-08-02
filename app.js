var express=require('express');
var app=express();
var jwt = require('jwt-simple');
var moment = require('moment');
var Q = require('./server/do');

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.set('jwtTokenSecret', 'liuzhijunToken9527@beijing');

app.use(bodyParser.json());

var staticPath = __dirname + '/app';
app.use(express.static(staticPath));

var routeGetArray = [
	{"key":"/",				"path":"/views/login.html"},
	{"key":"/login",		"path":"/views/login.html"},
	{"key":"/editor",		"path":"/views/editor.html"},
	{"key":"/editor/:aid",	"path":"/views/editor.html"},
	{"key":"/main",			"path":"/views/main.html"},
	{"key":"/home",			"path":"/views/house.html"},
	{"key":"/works",		"path":"/views/works.html"},
	{"key":"/works/:id",	"path":"/views/works.html"},
	{"key":"/articles",		"path":"/views/article.html"},
	{"key":"/articles/:id",	"path":"/views/article.html"}
];

routeGetArray.forEach(obj=>{
	app.get(obj.key,(req,res)=>{
		res.sendFile(`${staticPath}${obj.path}`);
	});
});

app.param(function(name, fn){
	if (fn instanceof RegExp) {
		return function(req, res, next, val){
			var captures;
			if (captures = fn.exec(String(val))) {
				req.params[name] = captures;
				next();
			} else {
				next('route');
			}
		}
	}
});

function checkToken(req){
	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
	if(!token) return;
	try{
		var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
		if (decoded.exp <= Date.now()) return false;
		return decoded;
	}
	catch(err){
		return;
	}
}

function createToken(data){
	if(!data || !data.length) return;
	var user = data[0];
	var expires = moment().add(7,'days').valueOf();
	var token = jwt.encode({ iss: user.uid,exp: expires}, app.get('jwtTokenSecret'));
	return token;
}

var tokenError = {'success':false,'message':'access_token error or expired!'};

app.post('/login',function(req,res){
	var name = req.body.name;
	var pwd = req.body.pwd;
	Q.doLogin(name,pwd,function(data){
		var result = {'success':!!data.length,'token':createToken(data)};
		res.json(result);
	});
});

app.get('/categoryList',function(req,res){
	Q.getCategoryList(function(data){
		res.json(data);
	});
});

app.get('/category',function(req,res){
	Q.getArticleList(function(data){
		res.json(data);
	});
});

app.post('/category',function(req,res){
	var isAll = req.body.type === "all";
	Q.getArticleList(function(data){
		res.json(data);
	},isAll);
});

app.param('aid',/^\d+$/);
app.get('/article/:aid',function(req,res){
	Q.getArticle(req.params.aid,function(data){
		res.json(data);
	},req.query,res);
});

app.param('filename',/^[a-zA-Z0-9_\-]+(?:\.[a-zA-Z0-9]+)?$/);
app.get('/src/:filename',function(req,res){
	Q.getSrc(req.params.filename,function(data){
		res.send(null);
	},res);
});

app.post('/article/add',function(req,res){
	var tokenObj = checkToken(req);
	if(!tokenObj){ res.json(tokenError); return; }
	var cid = req.body.cid;
	var title = req.body.title;
	var content = req.body.content;
	if(!cid || !title || !content) { res.json({'success':false,'message':'参数不足'}); return; }
	var uid = tokenObj.iss;
	Q.addArticle(uid,req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/article/save',function(req,res){
	if(!checkToken(req)){ res.json(tokenError); return; }
	var aid = req.body.aid;
	var title = req.body.title;
	var content = req.body.content;
	if(!aid) { res.json({'success':false,'message':'参数aid不足'}); return; }
	if(!title && !content){ res.json({'success':false,'message':'参数title及content至少有一个'}); return; }
	Q.saveArticle(aid,title,content,function(success){
		res.json({'success':success});
	});
});

app.get('/article/delete',function(req,res){
	if(!checkToken(req)){ res.json(tokenError); return; }
	var aid = req.query.aid;
	if(!aid){ res.json({'success':false,'message':'参数aid不足'}); return; }
	Q.deleteArticle(aid,function(success){
		res.json({'success':success});
	});
});

app.post('/pen/add',function(req,res){
	var tokenObj = checkToken(req);
	if(!tokenObj){ res.json(tokenError); return; }
	var uid = tokenObj.iss;
	Q.addPen(uid,req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/pen/update',function(req,res){
	var tokenObj = checkToken(req);
	if(!tokenObj){ res.json(tokenError); return; }
	var uid = tokenObj.iss;
	Q.updatePen(uid,req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/pen/delete',function(req,res){
	var tokenObj = checkToken(req);
	if(!tokenObj){ res.json(tokenError); return; }
	var uid = tokenObj.iss;
	Q.deletePen(uid,req.body.pid,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.get('/pen/list',function(req,res){
	Q.getPenList(req.query,function(data){
		res.json(data);
	});
});

app.param('pid',/^\d+$/);
app.get('/pen/:pid',function(req,res){
	var pid = req.params.pid;
	Q.getPen(pid,res,req.query);
});

var routeArr = [
	{"url":"/cat/add",		"method":"post",	"fun":"addCategory"			},
	{"url":"/cat/delete",	"method":"post",	"fun":"deleteCategory"		},
	{"url":"/db/get",		"method":"post",	"fun":"getDBTable"			},
	{"url":"/db/getStct",	"method":"post",	"fun":"getDBTableStct"		},
	{"url":"/db/getId",		"method":"post",	"fun":"getDBTableByName"	},
	{"url":"/db/add",		"method":"post",	"fun":"createDBTable"		},
	{"url":"/db/update",	"method":"post",	"fun":"updateDBTable"		},
	{"url":"/db/updateTb",	"method":"post",	"fun":"updateDBTableAll"	},
	{"url":"/db/tblist",	"method":"post",	"fun":"queryTableList"		},
	{"url":"/db/updateStct","method":"post",	"fun":"updateDBTableStct"	},
	{"url":"/db/getObjData","method":"post",	"fun":"queryObjDBData"		},
	{"url":"/blog/list",	"method":"post",	"fun":"getBlogList"			}
];

!function reqfun(routeArr,app){
	routeArr.forEach(obj=>{
		var method = obj.method.toLowerCase();
		app[method](obj.url,(req,res)=>{
			var params = method==='post' && req.body || req.query;
			Q[obj.fun] && Q[obj.fun](params,(success,data)=>{
				res.json({'success':success,'data':data});
			});
		});
	});
}(routeArr,app);

app.listen(80);
