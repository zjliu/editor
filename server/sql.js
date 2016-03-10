var sqlHelper={
	select:function(opt){
		/* opt示例
			table_name:'cat',
			columns:['id','name','count(*) count'],
			where 'cid=1'
		*/
		var field = opt.field && opt.field.length ? opt.field : '*';
		var where = opt.where ? ' where '+opt.where : '';
		return 'select '+field+' from '+opt.table_name+where;
	},
	function insert(opt){
		/* opt示例
			table_name:'cat',
			values:{
				'id':{quote:false,value:1},
				'name':{quote:true,value:'liuzhijun'}
			}
		*/
		if(!opt.table_name || !opt.values) return;
		var sql = "insert into "+opt.table_name+"("+Object.keys(opt.values)+") values(";
		var values = [];
		for(var key in opt.values){
			var obj = opt.values[key];
			values.push(obj.quote?"'"+obj.value+"'":obj.value);
		}
		sql+=values+")";
		return sql;
	},
	function update(opt){
		/* opt示例
			table_name:'cat',
			values:{
				'id':{quote:false,value:1},
				'name':{quote:true,value:'liuzhijun'}
			},
			where:'cid=1'
		*/
		var sql = "update "+opt.table_name+" set ";
		var values = [];
		for(var key in opt.values){
			var obj = opt.values[key];
			values.push(key+"="+(obj.quote?"'"+obj.value+"'":obj.value));
		}
		return sql+values+' '+(where||'');
	},
	function delete(opt){
		return "delete from "+opt.table_name+" where "+opt.where;
	}
}

function exportObj(obj){
	for(var key in obj){
		exports[key]=obj[key];
	}
}

var sqliteDb3={
	init:function(sqlite3,dbFile){
		this.db = new sqlite3.Database(dbFile);
	},
	select:function(opt){
		var sql = sqlHelper.select(opt);
		this.query(sql,opt.callback);
	},
	insert:function(opt){
		var sql = sqlHelper.insert(opt);
		this.exec(sql,opt.callback);
	},
	update:function(opt){
		var sql = sqlHelper.update(opt);
		this.exec(sql,opt.callback);
	},
	delete:function(opt){
		var sql = sqlHelper.delete(opt);
		this.exec(sql,opt.callback);
	},
	query:function(sql,callback){
		this.db.serialize(function(){
			db.all(sql,function(err,rows){
				callback && callback(err,rows);
			});
		});
	},
	exec:function(sql,callback){
		db.serialize(function(){
			db.exec(sql,function(err,data){
				callback && callback(err,data);
			});
		});
	}
};

exportObj(sqlHelper);
exports.sqliteDb3 = sqliteDb3;
