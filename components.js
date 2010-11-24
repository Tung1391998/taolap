/*************************************
Native Components for Crafty Library	
*************************************/
(function(Crafty) {

Crafty.c("2D", {
	x: 0,
	y: 0,
	w: 0,
	h: 0,
	z: 0,
	
	area: function() {
		return this.w * this.h;
	},
	
	/**
	* Does a rect intersect this
	*/
	intersect: function(x,y,w,h) {
		var rect;
		if(typeof x === "object") {
			rect = x;
		} else {
			rect = {x: x, y: y, w: w, h: h};
		}
		
		return this.x < rect.x + rect.w && this.x + this.w > rect.x &&
			   this.y < rect.y + rect.h && this.h + this.y > rect.y;
	},
	
	/**
	* Is object at point
	*/
	isAt: function(x,y) {
		return this.x <= x && this.x + this.w >= x &&
			   this.y <= y && this.y + this.h >= y;
	},
	
	move: function(dir, by) {
		this.trigger("change");
		if(dir.charAt(0) === 'n') this.y -= by;
		if(dir.charAt(0) === 's') this.y += by;
		if(dir === 'e' || dir.charAt(1) === 'e') this.x += by;
		if(dir === 'w' || dir.charAt(1) === 'w') this.x -= by;
	}
});

Crafty.c("gravity", {
	_gravity: 0.2,
	_gy: 0,
	_falling: true,
	_anti: null,
	
	init: function() {
		if(!this.has("2D")) this.addComponent("2D");		
	},
	
	gravity: function(comp) {
		this._anti = comp;
		
		this.bind("enterframe", function() {
			if(this._falling) {
				var old = this.pos();
				this._gy += this._gravity * 2;
				this.y += this._gy;
				this.trigger("change",old);
			} else {
				this._gy = 0;
			}
			
			var obj = this, hit = false;
			Crafty(comp).each(function() {
				if(this.intersect(obj)) {
					hit = this;
				}
			});
			if(hit) {
				this.stopFalling(hit);
			} else {
				this._falling = true;
			}
		});
		return this;
	},
	
	stopFalling: function(e) {
		var old = this.pos(); //snapshot of old position
		if(e) this.y = e.y - this.h ; //move object
		this._gy = 0;
		this._falling = false;
		if(this.__move && this.__move.up) this.__move.up = false;
		this.trigger("change", old);
	}
});

Crafty.c("DOM", {
	_element: null,
	
	DOM: function(elem) {
		if(!this.has("2D")) this.addComponent("2D");
		this._element = elem;
		this._element.style.position = 'absolute';
		return this;
	},
	
	draw: function() {
		this._element.style.top = Math.ceil(this.y) + "px";
		this._element.style.left = Math.ceil(this.x) + "px";
	}
});

/********************
* UTILITY EXTENSIONS
*********************/
Crafty.extend({
	tile: 16,
	
	/**
	* Sprite generator.
	*
	* Extends Crafty for producing components
	* based on sprites and tiles
	*/
	sprite: function(tile, url, map) {
		var pos, temp, x, y, w, h;
		
		//if no tile value, default to 16
		if(typeof tile === "string") {
			map = url;
			url = tile;
			tile = 16;
		}
		this.tile = tile;
		
		for(pos in map) {
			if(!map.hasOwnProperty(pos)) continue;
			
			temp = map[pos];
			x = temp[0] * tile;
			y = temp[1] * tile;
			w = temp[2] * tile || tile;
			h = temp[3] * tile || tile;
			
			//create a component
			Crafty.c(pos, {
				__image: url,
				__coord: [x,y,w,h],
				
				init: function() {
					this.addComponent("sprite");
					this.img = new Image();
					this.img.src = this.__image;
					//draw when ready
					Crafty.addEvent(this, this.img, 'load', function() {
						DrawBuffer.add(this); //send to buffer to keep Z order
					});
					this.w = this.__coord[2];
					this.h = this.__coord[3];
				},
				
				sprite: function(x,y,w,h) {
					this.__coord = [x*tile,y*tile,w*tile || tile,h*tile || tile];
				}
			});
		}
		
		return this;
	},
	
	/**
	* Window Events credited to John Resig
	* http://ejohn.org/projects/flexible-javascript-events
	*/
	addEvent: function(ctx, obj, type, fn) {
		if(arguments.length === 3) {
			fn = type;
			type = obj;
			obj = window;
		}
		if (obj.attachEvent ) {
			obj['e'+type+fn] = fn;
			obj[type+fn] = function(){ obj['e'+type+fn]( obj.event );}
			obj.attachEvent( 'on'+type, obj[type+fn] );
		} else obj.addEventListener( type, function(e) { fn.call(ctx,e) }, false );
	},
	
	removeEvent: function(obj, type, fn) {
		if (obj.detachEvent) {
			obj.detachEvent('on'+type, obj[type+fn]);
			obj[type+fn] = null;
		} else obj.removeEventListener(type, fn, false);
	},
	
	window: {
		width: window.innerWidth || (window.document.documentElement.clientWidth || window.document.body.clientWidth),
		height: window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight)
	},
	
	/**
	* Map key names to key codes
	*/
	keys: {'BSP':8, 'TAB':9, 'ENT':13, 'SHF':16, 'CTR':17, 'ALT':18, 'PAU':19, 'CAP':20, 'ESC':27, 'SP':32, 'PGU':33, 'PGD':34, 'END':35, 'HOM':36, 'LA':37, 'UA':38, 'RA':39, 'DA':40, 'INS':45, 'DEL':46, 'D0':48, 'D1':49, 'D2':50, 'D3':51, 'D4':52, 'D5':53, 'D6':54, 'D7':55, 'D8':56, 'D9':57, 'SEM':59, 'EQL':61, 'A':65, 'B':66, 'C':67, 'D':68, 'E':69, 'F':70, 'G':71, 'H':72, 'I':73, 'J':74, 'K':75, 'L':76, 'M':77, 'N':78, 'O':79, 'P':80, 'Q':81, 'R':82, 'S':83, 'T':84, 'U':85, 'V':86, 'W':87, 'X':88, 'Y':89, 'Z':90, 'LWN':91, 'RWN':92, 'SEL':93, 'N0':96, 'N1':97, 'N2':98, 'N3':99, 'N4':100, 'N5':101, 'N6':102, 'N7':103, 'N8':104, 'N9':105, 'MUL':106, 'ADD':107, 'SUB':109, 'DEC':110, 'DIV':111, 'F1':112, 'F2':113, 'F3':114, 'F4':115, 'F5':116, 'F6':117, 'F7':118, 'F8':119, 'F9':120, 'F10':121, 'F11':122, 'F12':123, 'NUM':144, 'SCR':145, 'COM':188, 'PER':190, 'FSL':191, 'ACC':192, 'OBR':219, 'BSL':220, 'CBR':221, 'QOT':222}
});

/**
* Canvas Components and Extensions
*/
Crafty.c("canvas", {
	drawn: false,
	entry: null,
	
	init: function() {
		//add the object to the RTree
		//this.entry = tree.put(this);
		
		//on change, redraw
		this.bind("change", function(e) {
			e = e || this;
			
			//clear self
			Crafty.context.clearRect(e.x, e.y, e.w, e.h);
			
			//update position in RTree
			var pos = this.pos();
			//this.entry.update(pos.x,pos.y,pos.w,pos.h);
			
			//add to the DrawBuffer
			DrawBuffer.add(this,e);
		});
	},
	
	pos: function() {
		return {
			x: Math.ceil(this.x),
			y: Math.ceil(this.y),
			w: Math.ceil(this.w),
			h: Math.ceil(this.h)
		};
	},
	
	draw: function(x,y,w,h) {
		var co = {},
			coord = this.__coord || this.pos(),
			pos = this.pos();
		
		//if offset
		co.x = coord[0];
		if(x && typeof x === "number") {
			co.x = coord[0] + x;
			pos.x += x;
		}
		co.y = coord[1];
		if(y && typeof y === "number") {
			co.y = coord[1] + y;
			pos.y += y;
		}
		co.w = coord[2];
		if(w) {
			co.w = w;
			pos.w = w;
		}
		co.h = coord[3];
		if(h) {
			co.h = h
			pos.h = h;
		}
		
		if(this.has("sprite")) {
			//draw the image on the canvas element
			if(!this.img) return;
			//console.log(this.img);
			Crafty.context.drawImage(this.img, //image element
									 co.x, //x position on sprite
									 co.y, //y position on sprite
									 co.w, //width on sprite
									 co.h, //height on sprite
									 pos.x, //x position on canvas
									 pos.y, //y position on canvas
									 pos.w, //width on canvas
									 pos.h //height on canvas
			);
		} else if(this.has("color")) {
			Crafty.context.fillStyle = this.color;
			Crafty.context.fillRect(pos.x,pos.y,pos.w,pos.h);
		} else if(this.has("image")) {
			if(!this.img) return;
			var i = 0, l, j = 0, k;
			switch(this._repeat) {
				case "repeat-x":
					if(this.img.width === 0) return;
					for(l = Math.floor(this.w / this.img.width); i < l; i++) {
						Crafty.context.drawImage(this.img, this.x + this.img.width * i, this.y);
					}
					break;
				case "repeat-y":
					if(this.img.height === 0) return;
					for(l = Math.floor(this.h / this.img.height); i <= l; i++) {
						Crafty.context.drawImage(this.img, this.x, this.y + this.img.height * i);
					}
					break;
				default:
					if(this.img.width === 0 || this.img.height === 0) return;
					for(l = Math.floor(this.w / this.img.width); i < l; i++) {
						Crafty.context.drawImage(this.img, this.x + this.img.width * i, this.y);
						for(j = 0, k = Math.floor(this.h / this.img.height); j <= k; j++) {
							Crafty.context.drawImage(this.img, this.x + this.img.width * i, this.y + this.img.height * j);
						}
					}
					
					break;
			}
		}
	}
});

Crafty.extend({
	context: null,
	
	/**
	* Set the canvas element and 2D context
	*/
	canvas: function(elem) {
		if(!('getContext' in elem)) return;
		this.context = elem.getContext('2d');
	},
});

Crafty.c("collision", {
	collision: function(comp, fn) {
		var obj = this;
		//on change, check for collision
		this.bind("change", function() {
			//for each collidable entity
			Crafty(comp).each(function() {
				if(this.intersect(obj)) { //check intersection
					fn.call(obj,this);
				}
			});
		});
		
		return this;
	}
});

var DrawBuffer = {

	/**
	* Find all objects intersected by this
	* and redraw them in order of Z
	*/
	add: function add(obj,e) {
		var q, 
			i = 0, 
			j = 0, 
			keylength,
			zlength,
			box, 
			z, 
			layer,
			total = 0,
			keys = [],
			sorted = {}; //bucket sort
		
		e = e || obj;
		
		//sort the query results with bucket sort
		Crafty("canvas").each(function() {
			box = this;//q[i];
			
			if(box.intersect(e)) {
				if(!sorted[box.z]) sorted[box.z] = [];
				sorted[box.z].push(box);
				total++;
			}
		});
		
		//for each z index, draw
		for(z in sorted) {
			if(!sorted.hasOwnProperty(z)) continue;
			keys.push(+z);
		}
		keylength = keys.length;
		keys.sort(function(a,b) {return a-b;}); //FFS!
		
		for(i=0;i<keylength;i++) {	
			layer = sorted[keys[i]];
			zlength = layer.length;
			
			for(j=0;j<zlength;j++) {
				var todraw = layer[j];
				//only draw visible area
				if(todraw[0] !== obj[0]) { //don't redraw partial self
					var x = (Math.min(e.x,obj.x) - todraw.x <= 0) ? 0 : (Math.min(e.x,obj.x) - todraw.x),
						y = Math.ceil((Math.min(e.y, obj.y) - todraw.y < 0) ? 0 : (Math.min(e.y, obj.y) - todraw.y)),
						w = Math.min(todraw.w - x, e.w - (todraw.x - Math.max(e.x,obj.x))),
						h = Math.ceil(Math.min(todraw.h - y, e.h - (todraw.y - Math.max(e.y,obj.y))));
					
					layer[j].draw(x,y,w,h);
					
				} else layer[j].draw(); //redraw self
			}
		}
	}	
};

Crafty.c("controls", {
	__move: {left: false, right: false, up: false, down: false},	
	_speed: 3,
	
	init: function() {
		
		Crafty.addEvent(this, "keydown", function(e) {
			this.trigger("keydown", e);
		});
		
		Crafty.addEvent(this, "keyup", function(e) {
			this.trigger("keyup", e);
		});
		
		return this;
	}
});

Crafty.c("fourway", {
	
	
	fourway: function(speed) {
		if(speed) this._speed = speed;
		var move = this.__move;
		
		this.bind("enterframe", function() {
			var old = this.pos(),
				changed = false;
			if(move.right) {
				this.x += this._speed;
				changed = true;
			}
			if(move.left) {
				this.x -= this._speed;
				changed = true;
			}
			if(move.up) {
				this.y -= this._speed;
				changed = true;
			}
			if(move.down) {
				this.y += this._speed;
				changed = true;
			}
			
			if(changed) this.trigger("change", old);
		}).bind("keydown", function(e) {
			if(e.keyCode === Crafty.keys.RA || e.keyCode === Crafty.keys.D) {
				move.right = true;
			}
			if(e.keyCode === Crafty.keys.LA || e.keyCode === Crafty.keys.A) {
				move.left = true;
			}
			if(e.keyCode === Crafty.keys.UA || e.keyCode === Crafty.keys.W) {
				move.up = true;
			}
			if(e.keyCode === Crafty.keys.DA || e.keyCode === Crafty.keys.S) {
				move.down = true;
			}
		}).bind("keyup", function(e) {
			if(e.keyCode === Crafty.keys.RA || e.keyCode === Crafty.keys.D) {
				move.right = false;
			}
			if(e.keyCode === Crafty.keys.LA || e.keyCode === Crafty.keys.A) {
				move.left = false;
			}
			if(e.keyCode === Crafty.keys.UA || e.keyCode === Crafty.keys.W) {
				move.up = false;
			}
			if(e.keyCode === Crafty.keys.DA || e.keyCode === Crafty.keys.S) {
				move.down = false;
			}
		});
		
		return this;
	}
});

Crafty.c("twoway", {
	__move: {left: false, right: false, up: false, falling: false},
	
	twoway: function(speed,jump) {
		if(speed) this._speed = speed;
		jump = jump || this._speed * 2;
		
		var move = this.__move;
		
		this.bind("enterframe", function() {
			var old = this.pos(),
				changed = false;
			if(move.right) {
				this.x += this._speed;
				changed = true;
			}
			if(move.left) {
				this.x -= this._speed;
				changed = true;
			}
			if(move.up) {
				console.log("JUMP");
				this.y -= jump;
				this._falling = true;
				changed = true;
			}
			
			if(changed) this.trigger("change", old);
		}).bind("keydown", function(e) {
			if(e.keyCode === Crafty.keys.RA || e.keyCode === Crafty.keys.D) {
				move.right = true;
			}
			if(e.keyCode === Crafty.keys.LA || e.keyCode === Crafty.keys.A) {
				move.left = true;
			}
			if(e.keyCode === Crafty.keys.UA || e.keyCode === Crafty.keys.W) {
				console.log("JUMP");
				move.up = true;
			}
		}).bind("keyup", function(e) {
			if(e.keyCode === Crafty.keys.RA || e.keyCode === Crafty.keys.D) {
				move.right = false;
			}
			if(e.keyCode === Crafty.keys.LA || e.keyCode === Crafty.keys.A) {
				move.left = false;
			}
		});
		
		return this;
	}
});

/**
* Animation component
*
* Crafty(player).animate("walk_left", 0, 1, 4, 100);
* Crafty(player).animate("walk_left");
* Crafty(player).stop();
*/
Crafty.c("animate", {
	_reels: {},
	_interval: null,
	_current: null,

	animate: function(id, fromx, y, tox, duration) {
		//play a reel
		if(arguments.length === 2 && typeof fromx === "number") {
			//make sure not currently animating
			clearInterval(this._interval);
			this._current = id;
			
			duration = fromx;
			var reel = this._reels[id],
				self = this,
				frameTime = Math.ceil(duration / reel.length),
				frame = 0;
				
			//create recursive timeout
			this._interval = setInterval(function() {
				var pos = reel[frame++];
				
				self.__coord[0] = pos[0];
				self.__coord[1] = pos[1];
				
				if(frame === reel.length) {
					frame = 0;
					self.stop();
					return;
				}
			}, frameTime);
			
			return this;
		}
		if(typeof fromx === "number") {
			var frames = tox + 1 - fromx, i = fromx,
				reel = [],
				tile = Crafty.tile;
			for(;i<=tox;i++) {
				reel.push([i * tile, y * tile]);
			}
			this._reels[id] = reel;
		} else if(typeof fromx === "array") {
			this._reels[id] = fromx;
		}
		
		return this;
	},
	
	stop: function() {
		clearInterval(this._interval);
		this._current = null;
		this._interval = null;
	},
	
	isPlaying: function(id) {
		if(!id) return !!this._interval;
		return this._current === id; 
	}
});

Crafty.c("color", {
	color: "",
	
	color: function(color) {
		this.color = color;
		return this;
	}
});

Crafty.c("image", {
	_repeat: "",
	
	image: function(url, repeat) {
		this.img = new Image();
		this.img.src = url;
		this._repeat = repeat || "repeat";
		//draw when ready
		Crafty.addEvent(this, this.img, 'load', function() {
			DrawBuffer.add(this); //send to buffer to keep Z order
		});
		
		return this;
	}
});

var tree = new Crafty.RTree();

/**
* Collection of objects to be drawn on each
* frame
*/
window.DrawBuffer = DrawBuffer;
window.tree = tree;
})(Crafty);