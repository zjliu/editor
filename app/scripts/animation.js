(function(){

var pageAniData = {
	anilist:{
		move:{
			prop:[
				{
					name:'translateX',
					title:Lang['Page_aniData_translateX'],
					dataType:'input',
					data:'20',
					reg:'^-?[0-9]+$',
					errorInfo:Lang["Page_aniData_translateX_info"],
					unit:'px',
					unitTitle:Lang["Page_aniData_px"]
				},
				{
					name:'translateY',
					title:Lang['Page_aniData_translateY'],
					dataType:'input',
					data:'20',
					reg:'^-?[0-9]+$',
					errorInfo:Lang["Page_aniData_translateY_info"],
					unit:'px',
					unitTitle:Lang["Page_aniData_px"]
				}
			],
			title:Lang["Page_aniData_translate"]
		},
		flyIn:{
			prop:[
				{
					name:'dir',
					title:Lang["Page_aniData_dir"],
					dataType:'select',
					data:[
						{ key:Lang["Page_aniData_flyInFromLeft"], value:'-1 0' },
						{ key:Lang["Page_aniData_flyInFromRight"], value:'1 0' },
						{ key:Lang["Page_aniData_flyInFromTop"], value:'0 -1' },
						{ key:Lang["Page_aniData_flyInFromBottom"], value:'0 1' }
					]
				}
			],
			title:Lang['Page_aniData_flyIn']
		},
		flyOut:{
			prop:[
				{
					name:'dir',
					title:Lang["Page_aniData_dir"],
					dataType:'select',
					data:[
						{ key:Lang["Page_aniData_flyOutFromLeft"], value:'-1 0' },
						{ key:Lang["Page_aniData_flyOutFromRight"], value:'1 0' },
						{ key:Lang["Page_aniData_flyOutFromTop"], value:'0 -1' },
						{ key:Lang["Page_aniData_flyOutFromBottom"], value:'0 1' }
					]
				}
			],
			title:Lang["Page_aniData_flyOut"]
		},
		fadeIn:{
			prop:[
				{
					name:'opacity',
					title:Lang["Page_aniData_opacity"],
					dataType:'input',
					data:1,
					reg:'^(0)|(1)|(0\\.\\d+)$',
					errorInfo:Lang["Page_aniData_opacity_info"]
				}
			],
			title:Lang["Page_aniData_fadeIn"]
		},
		fadeOut:{
			prop:[
				{
					name:'opacity',
					title:Lang["Page_aniData_opacity"],
					dataType:'input',
					data:0,
					reg:'^(0)|(1)|(0\\.\\d+)$',
					errorInfo:Lang["Page_aniData_opacity_info"]
				}
			],
			title:Lang["Page_aniData_fadeOut"]
		},
		rotate:{
			prop:[
				{
					name:'rotateZ',
					title:Lang["Page_aniData_rotateZ"],
					dataType:'input',
					data:360,
					unitTitle:Lang["Page_aniData_angle"],
					reg:'^-?[0-9]+$',
					errorInfo:Lang["Page_aniData_rotateZ_info"]
				},
				{
					name:'transformOrigin',
					title:Lang["Page_aniData_origin"],
					dataType:'select',
					data:[
						{key:Lang["Page_aniData_origin_c"],value:'0% 0% 0px'},
						{key:Lang["Page_aniData_origin_l"],value:'-50% 0% 0px'},
						{key:Lang["Page_aniData_origin_r"],value:'50% 0% 0px'},
						{key:Lang["Page_aniData_origin_t"],value:'0% -50% 0px'},
						{key:Lang["Page_aniData_origin_b"],value:'0% 50% 0px'},
						{key:Lang["Page_aniData_origin_lt"],value:'-50% -50% 0px'},
						{key:Lang["Page_aniData_origin_lb"],value:'-50% 50% 0px'},
						{key:Lang["Page_aniData_origin_rt"],value:'50% -50% 0px'},
						{key:Lang["Page_aniData_origin_rb"],value:'50% 50% 0px'},
					]
				}
			],
			title:Lang["Page_aniData_rotate"]
		},
		zoom:{
			prop:[
				{
					name:'type',
					title:Lang["Page_aniData_scaleType"],
					dataType:'select',
					data:[
						{key:Lang["Page_aniData_scaleType_hw"],value:''},
						{key:Lang["Page_aniData_scaleType_w"],value:'X'},
						{key:Lang["Page_aniData_scaleType_h"],value:'Y'}
					],
					unitTitle:''
				},
				{
					name:'scale',
					title:Lang["Page_aniData_scaleSize"],
					dataType:'input',
					data:0.5,
					reg:'^[0-9]+(\.[0-9]+)?(,[0-9]+(\.[0-9]+)?)?$',
					errorInfo:Lang["Page_aniData_scaleSize_info"]
				},
				{
					name:'transformOrigin',
					title:Lang["Page_aniData_origin"],
					dataType:'select',
					data:[
						{key:Lang["Page_aniData_origin_c"],value:'0% 0% 0px'},
						{key:Lang["Page_aniData_origin_l"],value:'-50% 0% 0px'},
						{key:Lang["Page_aniData_origin_r"],value:'50% 0% 0px'},
						{key:Lang["Page_aniData_origin_t"],value:'0% -50% 0px'},
						{key:Lang["Page_aniData_origin_b"],value:'0% 50% 0px'},
						{key:Lang["Page_aniData_origin_lt"],value:'-50% -50% 0px'},
						{key:Lang["Page_aniData_origin_lb"],value:'-50% 50% 0px'},
						{key:Lang["Page_aniData_origin_rt"],value:'50% -50% 0px'},
						{key:Lang["Page_aniData_origin_rb"],value:'50% 50% 0px'},
					]
				}
			],
			title:Lang["Page_aniData_scale"]
		},
		skew:{
			prop:[
				{
					name:'type',
					title:Lang["Page_aniData_skewType"],
					dataType:'select',
					data:[
						{key:Lang["Page_aniData_skewType_x"],value:'X'},
						{key:Lang["Page_aniData_skewType_y"],value:'Y'},
						{key:Lang["Page_aniData_skewType_xy"],value:''}
					],
					unitTitle:''
				},
				{
					name:'skew',
					title:Lang["Page_aniData_skewSize"],
					dataType:'input',
					data:45,
					unitTitle:Lang["Page_aniData_angle"],
					reg:'^-?[0-9]+(\.[0-9]+)?(,-?[0-9]+(\.[0-9]+)?)?$',
					errorInfo:Lang["Page_aniData_skewSize_info"]
				},
				{
					name:'transformOrigin',
					title:Lang["Page_aniData_origin"],
					dataType:'select',
					data:[
						{key:Lang["Page_aniData_origin_c"],value:'0% 0% 0px'},
						{key:Lang["Page_aniData_origin_l"],value:'-50% 0% 0px'},
						{key:Lang["Page_aniData_origin_r"],value:'50% 0% 0px'},
						{key:Lang["Page_aniData_origin_t"],value:'0% -50% 0px'},
						{key:Lang["Page_aniData_origin_b"],value:'0% 50% 0px'},
						{key:Lang["Page_aniData_origin_lt"],value:'-50% -50% 0px'},
						{key:Lang["Page_aniData_origin_lb"],value:'-50% 50% 0px'},
						{key:Lang["Page_aniData_origin_rt"],value:'50% -50% 0px'},
						{key:Lang["Page_aniData_origin_rb"],value:'50% 50% 0px'},
					]
				}
			],
			title:Lang["Page_aniData_skew"]
		}
	},
	commonProp:[
		{
			name:'duration',
			title:Lang["Page_aniData_duration"],
			dataType:'input',
			data:1,
			unitTitle:Lang["Page_aniData_second"],
			reg:'^[0-9]+(\.[0-9]+)?$',
			errorInfo:Lang["Page_aniData_duration_info"]
		},
		{
			name:'delay',
			title:Lang["Page_aniData_delay"],
			dataType:'input',
			data:0,
			unitTitle:Lang["Page_aniData_second"],
			reg:'^[0-9]+(\.[0-9]+)?$',
			errorInfo:Lang["Page_aniData_delay_info"]
		},
		{
			name:'loop',
			title:Lang["Page_aniData_loop"],
			dataType:'input',
			data:1,
			unitTitle:Lang["Page_aniData_count"],
			reg:'^[0-9]+$',
			errorInfo:Lang["Page_aniData_loop_info"]
		},
		{
			name:'easing',
			title:Lang["Page_aniData_easing"],
			dataType:'select',
			data:[
				{key:Lang["Page_aniData_ease_in_out"],value:'ease-in-out'},
				{key:Lang["Page_aniData_ease_in"],value:'ease-in'},
				{key:Lang["Page_aniData_ease_out"],value:'ease-out'},
				{key:Lang["Page_aniData_ease"],value:'ease'},
				{key:Lang["Page_aniData_linear"],value:'linear'}
			],
			unitTitle:''
		}
	]
};

window.pageAni = {};
pageAni.data=pageAniData;

function GetHTMLFragment(html){ 
    var divTemp = document.createElement("div"), 
		nodes = null,
		fragment = document.createDocumentFragment();

	divTemp.innerHTML = html;
	nodes = divTemp.childNodes;
	for (var i=0, length=nodes.length; i<length; i+=1) {
      fragment.appendChild(nodes[i].cloneNode(true));
	}
    return fragment;	
}

if(!HTMLElement.prototype.appendHTML){
	HTMLElement.prototype.appendHTML = function(html) {
	var fragment = GetHTMLFragment(html);
		this.appendChild(fragment);
		fragment = null;
	}
}

if(!HTMLElement.prototype.insertBeforeHTML){
	HTMLElement.prototype.insertBeforeHTML = function(html,existingElement) {
		var fragment = GetHTMLFragment(html);
	    this.insertBefore(fragment,existingElement)
	    fragment = null;
	}
}

if(!HTMLElement.prototype.insertAfterHTML){
	HTMLElement.prototype.insertAfterHTML = function(html,existingElement) {
		var el = existingElement.nextElementSibling;
		if(el) this.insertBeforeHTML(html,el);
		else this.appendHTML(html);
	}
}

if(!Object.keys){
	Object.keys=function(obj){
		var arr=[]; for(var key in obj) arr.push(key); return arr;
	}
}

function template(tempStr,dataParam){
	var html='var html="";';
	tempStr.split(/(\<%[^<%]*%\>)/).map(function(item,index){
		var r = /^<%(=?.*)%>$/.exec(item);
		var value = '';
		if(r && r.length){
			value = r[1]; 
			if(value[0]=='=') html+=' html+'+value+';';
			else html+=value;
		}
		else{
			value = item.replace(/[\n\t]/g,'');
			html+=" html+='"+value+"';";
		}
	});
	html+=" return html;";
	var fun = new Function(dataParam || "data",html);
	return fun;
}

function applyTemplate(data,templateId,el,needEmpty){ 
	var scriptTemplate = G(templateId).innerHTML,
		compiled = template(scriptTemplate),
		html = compiled(data);

	needEmpty && (el.innerHTML = '');
	el.appendHTML(html);
}

function applyInsertAfterTemplate(data,templateId,el,existingElement){ 
	var scriptTemplate = G(templateId).innerHTML,
		compiled = template(scriptTemplate),
		html = compiled(data);
	el.insertAfterHTML(html,existingElement);
}


pageAni.applyTemplate=applyTemplate;
pageAni.applyInsertAfterTemplate=applyInsertAfterTemplate;
pageAni.template=template;

})();
