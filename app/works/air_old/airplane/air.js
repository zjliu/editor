var jAir=(function(){
		var direction = {left:37,right:39,up:38,down:40};
		var position = function(x,y){
			this.x = x;
			this.y = y;
		}
		var Air = function(x,y,w,h){
			this.x=x;
			this.y=y;
			this.w=w;
			this.h=h;
			this.draw = function(context,bgCanvas){
				context.drawImage(bgCanvas,this.x,this.y,this.w,this.h,this.position.x,this.position.y,this.w,this.h);
			}
		}
		var Bulet = function(x,y,speed,direction){
			this.x=x;
			this.y=y;
			this.speed = speed;
			this.direction = direction;
		}
		var JunAir = function(option){
			this.bg = option.bg;
			this.canvas = option.canvas;
			this.context = this.canvas.getContext("2d");
			this.W = this.canvas.width;
			this.H = this.canvas.height;
	
			//子弹声音
			this.bulletMp3 = option.bulletMp3;	

			//子弹速度
			this.bulletSpeed = option.bulletSpeed || 5;
			this.autoShoot = option.autoShoot || true;

			//air 移动速度
			this.airSpeed = option.airSpeed || 5;
			//air 是否自动射击	
			this.autoShoot = option.autoShoot || true;

			this.air = new Air(255,215,50,60);
			this.commonAir = new Air(112,125,50,60);
			this.goldAir = new Air(225,125,50,60);
			this.bullet = new Air(275,129,10,17);

			this.airData={};
			this.init();
			
			this.isGameRun = false;
			this.score = 0;
		}
		JunAir.prototype={
			init:function(){
				self =this;
				var bgImg = document.createElement("img");
				bgImg.onload=function(){
					var bgCanvas = document.createElement("canvas");
					bgCanvas.width = bgImg.width;
					bgCanvas.height = bgImg.height;
					var bgContext = bgCanvas.getContext("2d");
					bgContext.drawImage(bgImg,0,0);
					self.bgCanvas = bgCanvas;
					self.bgContext = bgContext;

					//document.body.appendChild(bgCanvas);
					
					self.initData();
					self.bindEvent();
					self.start();
					self.dataChange();
				}
				bgImg.src=self.bg;
			},
			gameStart:function(){
				this.isGameRun = true;
				self.commonAirDataChange();
			},
			gameEnd:function(){
				this.isGameRun = false;
				self.stopCommonAirMove();
			},
			start:function(){
				var self = this;
				requestAnimationFrame(function(){
					self.bulletMove();
					self.draw();
					self.start();
				},true);
			},
			bulletMove:function(){
				for(var i=0,bullets=this.airData.bullets;i<bullets.length;i++){
					var bullet = bullets[i];
						bullet.position.y-=this.bulletSpeed;
					if(bullet.position.y<0 || this.collision(bullet)){
						bullets.splice(i,1);
						continue;
					}
				}
			},
			collision:function(bullet,index){
				for(var i=0,commonAir = this.airData.commonAir;i<commonAir.length;i++){
					var air = commonAir[i];
					var bPosition = bullet.position;
					var aPosition = air.position;
					if(bPosition.x>=aPosition.x && bPosition.x<aPosition.x+air.w && bPosition.y>=aPosition.y && bPosition.y<=aPosition.y+air.h-2){
						commonAir.splice(i,1);
						this.score += 50;
						return true;
					}
				}
			},
			draw:function(){
				var airData = this.airData;
				var context = this.context;
				var bgCanvas = this.bgCanvas;
				//clear canvas
				this.clearCanvas();
				
				//draw score
				this.drawScore();			

				//draw Star
				var stars = airData.stars;
				for(var i=0,l=stars.length;i<l;i++){
					stars[i].draw(context);
				}

				//draw air
				airData.air.draw(context,bgCanvas);
				
				//draw common air
				for(var i=0,commonAir=airData.commonAir,l=commonAir.length;i<l;i++){
					commonAir[i].draw(context,bgCanvas);
				}
				//draw Bullet
				var bullets = airData.bullets;
				for(var i=0,l = bullets.length;i<l;i++){
					bullets[i].draw(context,bgCanvas);
				}
			},
			drawScore:function(){
				var context = this.context;
				context.save();
				context.font="30px Verdana";
				var gradient=context.createLinearGradient(100,0,100,50);
				gradient.addColorStop("0","magenta");
				gradient.addColorStop("0.5","blue");
				gradient.addColorStop("1.0","red");
				context.fillStyle = gradient;
				context.fillText("Your score: "+this.score,250,30);
				context.restore();
			},
			initData:function(){
				//init air
				var position = {x:(self.W-self.air.w)/2,y:self.H-self.air.h};
				var air = new Air(this.air.x,this.air.y,this.air.w,this.air.h);
					air.position = position;
				this.airData.air = air;
				
				//init commonAir
				var commonAirs = this.airData.commonAir = [];
				var sp = 5;
				var top = 50;
				var airWidth = this.commonAir.w;
				var airHeight = this.commonAir.h;
				var rowCount = 3;
				for(var j=0;j<rowCount;j++){
					var maxCount = Math.floor(this.W / (airWidth + sp))-(rowCount-j);
					var marginLeft = (this.W- (maxCount*(airWidth+sp)-sp))/2;
					for(var i=0;i<maxCount;i++){
						var newCommonAir = new Air(this.commonAir.x,this.commonAir.y,this.commonAir.w,this.commonAir.h);
						var left = i===0 ? marginLeft : (marginLeft+sp);
						newCommonAir.position ={x: (airWidth+sp)*i + left,y:top+j*(airHeight+sp)};
						commonAirs.push(newCommonAir);
					}	
				}
				this.airData.bullets = [];

				//init star
				this.airData.stars = [];
				for(var i=0;i<100;i++){
					this.airData.stars.push(new randomStar(this.W,this.H,5,10,0.05));
				}
			},
			bindEvent:function(){
				var self = this;
				document.addEventListener("keydown",function(e){
					if(e.keyCode < 36 || e.keyCode > 41) return;
					self.keyObj = self.keyObj || {};
					var type = self.getDirectionByKeyCode(e.keyCode);
					self.keyObj[e.keyCode] = {"type":type};
				},false);

				document.addEventListener("keyup",function(e){
					if(e.keyCode < 36 || e.keyCode > 41) return;
					if(self.keyObj){
						delete self.keyObj[e.keyCode];
					}
				},false);

				self.canvas.addEventListener("contextmenu",function(e){
					e.preventDefault();	
				});
			},
			commonAirDataChange:function(){
				var self =this;
				function change(){
					var cp = self.airData.commonAir[0].position;
					var ap = self.airData.air.position;
					var moveTan = (cp.y-ap.y)/(cp.x-ap.x);
					var angle = Math.atan(moveTan);
					cp.x = cp.x + Math.abs(Math.cos(angle)*10);
					cp.y = cp.y + Math.abs(Math.sin(angle)+10);
					this.requestId = requestAnimationFrame(change);
				}
				this.requestId = requestAnimationFrame(change);
			},
			stopCommonAirMove:function(){
				if(this.requestId){
					cancelAnimationFrame(this.requestId);
				}
			},
			dataChange:function(){
				var self = this;
				function change(){
					if(self.keyObj){
						for(key in self.keyObj){
							var type = self.keyObj[key].type;
							self.dealKeyEvent(type);
						}
					}
					var stars = self.airData.stars;
					for(var i=0,l=stars.length;i<l;i++){
						var star = stars[i];
						star.changeColor();
						star.move();
					}
					requestAnimationFrame(change);
				}
				requestAnimationFrame(change);
			},
			dealKeyEvent:function(type){
				var speed = this.airSpeed;
				var position = this.airData.air.position;
				switch(type){
					case "left":
						if(position.x>=speed)
							this.airMoveLeft();
					break;
					case "right":
						if(position.x<=this.W-this.air.w-speed)
							this.airMoveRight();
					break;
					case "up":
						this.shoot();
					break;
				}
			},
			shoot:function(){
				var air = this.airData.air;
				var bullets = this.airData.bullets;
				this.lastShortTime = self.lastShortTime || 0;
				var currentValue = Date.now();
				var value = currentValue - this.lastShortTime;
				if(value<=1000) {
					return false;
				}else{
					this.lastShortTime = currentValue;
				}
				var bullet = this.bullet;
				var newBullet = new Air(bullet.x,bullet.y,bullet.w,bullet.h);
				newBullet.position = {x:air.position.x+20,y:air.position.y};
				bullets.push(newBullet);
				if(this.bulletMp3){
					this.bulletMp3.play();
				}
			},
			airMove:function(type){
				this.airData.air.position.x += type*this.airSpeed;
			},
			airMoveLeft:function(){
				this.airMove(-1);
			},
			airMoveRight:function(){
				this.airMove(1);
			},
			getDirectionByKeyCode:function(keyCode){
				for(key in direction){
					if(direction[key] === keyCode){
						return key;
					}
				}
			},
			clearCanvas:function(){
				this.context.clearRect(0,0,this.W,this.H);
			},
			getFPS:function(){
				var now = (+new Date());
				if(!this.lastFpsTime){
					this.lastFpsTime = now;
					return 0;
				}
				var fps = 1000 / (now - this.lastFpsTime);
				this.lastFpsTime = now;
				return fps;
			}
		}
		return JunAir;
})();
