	var JunClock=(function(){
		var Clock=function(opts){
			for(var key in opts){
				this[key]=opts[key];
			}
			var clock = this.clock;
			this.sPointer=clock.querySelector(".s-pointer");
			this.mPointer=clock.querySelector(".m-pointer");
			this.hPointer=clock.querySelector(".h-pointer");

			this.sTail= this.sPointer.querySelector(".p_tail");
			this.sHead= this.sPointer.querySelector(".p_head");
			this.mTail= this.mPointer.querySelector(".p_tail");
			this.mHead= this.mPointer.querySelector(".p_head");
			this.hTail= this.hPointer.querySelector(".p_tail");
			this.hHead= this.hPointer.querySelector(".p_head");
			this.centerPointEl = clock.querySelector(".center");

			this.bgCanvas = this.clock.querySelector(".bgCanvas");

			this.centerPointR = parseInt(getComputedStyle(this.centerPointEl)["width"]) / 2;
			this.R= parseInt(getComputedStyle(this.clock)["width"]) / 2;

			this.tick_color = "rgba(100, 140, 230, 0.7)";
			this.num_size = 22;
			this.num_color="rgba(0, 0, 230, 0.9)";

			this.num_hour_height=12;

			this.num_minute_height = 8;
			
			this.ringWidth=25;
		}
		Clock.prototype={
			init:function(){
				//添加刻度背景
				var canvas = this.bgCanvas,
					context = canvas.getContext("2d");

				canvas.width = this.R*2;
				canvas.height= this.R*2;
				
				context.translate(this.R,this.R);	

				//画图景图片
				this.drawBg(context);
				//画外部阴影
				this.drawRing(context);
				//画时刻度
				this.drawHourTick(context);
				//画内圈
				this.drawTickInnerCircle(context);
				//画时针数字
				this.drawMainNumber(context);


				//设置圆心位置
				this.centerPointEl.style.top=this.R-this.centerPointR;	
				this.centerPointEl.style.left=this.R-this.centerPointR;

				//设置秒针旋转位置
				this.sPointer.style.webkitTransformOrigin=this.getTransformOrigin(this.sTail,this.sHead);
				//设置分针旋转位置
				this.mPointer.style.webkitTransformOrigin=this.getTransformOrigin(this.mTail,this.mHead);
				//设置时针旋转位置
				this.hPointer.style.webkitTransformOrigin=this.getTransformOrigin(this.hTail,this.hHead);
				
				//设置针位置
				var sPosition = this.getPointerPosition(this.sTail,this.sHead);
				var mPosition = this.getPointerPosition(this.mTail,this.mHead);
				var hPosition = this.getPointerPosition(this.hTail,this.hHead);

				this.sPointer.style.top=sPosition.top +"px";
				this.sPointer.style.left=sPosition.left +"px";
				this.mPointer.style.top=mPosition.top +"px";
				this.mPointer.style.left=mPosition.left +"px";
				this.hPointer.style.top=hPosition.top +"px";
				this.hPointer.style.left=hPosition.left +"px";
				this.run();
			},
			drawBg:function(context){
				var self=this;
				var bgSrc= self.bgImg;
				if(bgSrc){
					var img=document.createElement("img");
					img.onload=function(){
						var r = self.R-self.ringWidth - self.num_hour_height - self.num_size;
						context.drawImage(img,0,0,img.width,img.height,-r,-r,2*r,2*r);
					}
					img.src=bgSrc;
				}
			},
			drawTickInnerCircle:function(context){
				context.save();
				context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
				context.arc(0,0,this.R-this.num_hour_height-this.ringWidth,0,Math.PI*2);
				context.stroke();
				context.restore();
			},
			drawRing:function(context){
				context.save();
				context.shadowColor='rgba(0,0,0,1)';
				context.shadowOffsetX = 3;
				context.shadowOffsetY = 3;
				context.shadowBlur = 6;
				context.strokeStyle='rgba(100,140,230,.5)';
				context.beginPath();
				context.arc(0,0,this.R-this.ringWidth,0,Math.PI*2,true);

				context.strokeStyle='rgba(0,0,0,.1)';
				context.arc(0,0,this.R,0,Math.PI*2,false);
				context.fillStyle='rgba(100,140,230,.1)';
				context.fill();
				context.stroke();

				context.restore();
			},
			drawMainNumber:function(context){
				context.save();
				var fontSize = this.num_size;
				context.fillStyle=this.num_color;
				context.font = fontSize + 'px Helvetica'; 
				context.shadowColor = 'rgba(0, 0, 0, 0.7)';
				context.shadowOffsetX = 3;
				context.shadowOffsetY = 3;
				context.shadowBlur = 6;
				for(var i=1;i<=12;i++){
					var angle = (i/6-0.5)*Math.PI;
					var x = Math.cos(angle)*(this.R-this.ringWidth-this.num_hour_height-this.num_size/2);
					var y = Math.sin(angle)*(this.R-this.ringWidth-this.num_hour_height-this.num_size/2);
					var rx = Math.cos(angle)*this.R;
					var ry = Math.sin(angle)*this.R;
					var text=i.toString();
					var tLength = context.measureText(text).width;
					context.fillText(i,x-tLength/2,y+fontSize/3);
				}
				context.restore();
			},
			drawHourTick:function(context){
				context.save();
				context.strokeStyle=this.tick_color;
				for(var i=0;i<60;i++){
					context.save();
					context.rotate(i*Math.PI/30);
					var height = 0;
					height = i%5 === 0 ? this.num_hour_height :this.num_minute_height;
					context.beginPath();
					context.moveTo(0,this.R-this.ringWidth);
					context.lineTo(0,this.R-height-this.ringWidth);
					context.stroke();
					context.closePath();
					context.restore();
				}
				context.restore();
			},
			run:function(){
				var self=this;
				setInterval(function(){
					var date = new Date();
					var h = date.getHours();
					var m = date.getMinutes();
					var s = date.getSeconds();
					
					var realHour = h%12 + (m+s/60)/60;
					var hourAngle = realHour * 30;
					var realMinute = m + s/60;
					var minuteAngle = realMinute * 6;
					var secondAngle = s * 6;
					
					self.sPointer.style.webkitTransform="rotateZ("+secondAngle+"deg)";
					self.mPointer.style.webkitTransform="rotateZ("+minuteAngle+"deg)";
					self.hPointer.style.webkitTransform="rotateZ("+hourAngle+"deg)";

				},1000);
			},
			getTransformOrigin:function(tail,head){
				var headWidth = this.getStyle(head,"borderBottomWidth",true);
				var tailTopWidth = this.getStyle(tail,"borderTopWidth",true);
				return "50% " + 100*headWidth/(tailTopWidth+headWidth)+"%";
			},
			getPointerPosition:function(tail,head){
				var headWidth = this.getStyle(head,"borderBottomWidth",true);
				var tailLeftWidth = this.getStyle(tail,"borderLeftWidth",true);
				return {"top":this.R-headWidth,"left":this.R-tailLeftWidth};
			},
			getStyle:function(el,name,needInt){
				var value = getComputedStyle(el)[name];
				return needInt?parseInt(value):value;
			}
		}
		return Clock;
	})();

	window.onload=function(){
		var clockEl = document.getElementById("clock");
		var clock=new JunClock({
			"clock":clockEl,
			"bgImg":'clockBg.png'
		});
		clock.init();
	}
