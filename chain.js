var dummyconsole = {
	log: function(){},
	warn: function(){}
}
if(!console){
	console = dummyconsole;
}

Object.prototype.findloop = function (a){
	var arr = a || [this];
	if(this.chainage){
		for(var i = 0; i < this.chainage.length; i++){
			if(arr.indexOf(this.chainage[i])>-1){
				console.warn('Looping',this.chainage[i]);	throw new Error('loop in chain tree');
			}else{
				arr.push(this.chainage[i]);
				this.chainage[i].findloop(arr);
			}
		}
	}else{
		return false;
	}
}

Object.prototype.chain = function (){
	if(!this.chainage){
		this.chainage = [];
	}
	for(var i = 0; i < arguments.length; i++){
		this.chainage.push(arguments[i]);
		if(Object.prototype.chain.allowloops == false){
			this.findloop();
		}
	}
	return this;
}
Object.prototype.chain.allowloops = false;

Object.prototype.get = function (p,own){
	var prop = this[p];
	var that = this;
	if(this.chainage){
		var i = 0;
		while(typeof prop === 'undefined' && i < this.chainage.length){
			if(!own){that = this.chainage[i]}
			prop = this.chainage[i][p];
			i ++;
		}
	}
	if(prop instanceof Function){
		return function (){
			var args = [];
			for(var i = 0; i < arguments.length; i ++){
				args.push(arguments[i]);
			}
			return prop.apply(that,args);
		}
	}
	return prop;
}

Object.prototype.getget = function (p,own,recursion){
	if(typeof p != 'string'){throw new Error('Getget: property name cannot be '+p+'.');}
	if(Object.prototype.chain.allowloops == true){console.warn('Getget called while chain.allowloops is set to '+chain.allowloops+'.')}
	var prop = this[p];
	var that = (recursion && own)?own:this;
	if(this.chainage){
		var i = 0;
		while(typeof prop === 'undefined' && i < this.chainage.length){
			if(!own){that = this.chainage[i]}
			prop = this.chainage[i].getget(p,(own?that:false),true);
			i ++;
		}
	}
	if(prop instanceof Function){
		return function (){
			var args = [];
			for(var i = 0; i < arguments.length; i ++){
				args.push(arguments[i]);
			}
			return prop.apply(that,args);
		}
	}
	return prop;
}

Object.prototype.raw = function (p,own){
	var raw = [this[p]];
	var that = [this];
	if(this.chainage){
		for(var i = 0; i < this.chainage.length; i ++){
			own ? that.push(this) : that.push(this.chainage[i]);
			raw.push(this.chainage[i][p]);
			console.log(this.chainage[i][p]);
		}
	}
	var raw2 = [];
	for(var ii = 0; ii < raw.length; ii ++){
		if(raw[ii] instanceof Function){
			var meth = raw[ii];
			var vic = that[ii];
			raw2.push(function (){
				var args = [];
				for(var i = 0; i < arguments.length; i ++){
					args.push(arguments[i]);
					console.log(arguments[i]);
				}
				return meth.apply(vic,args);
			});
		}else{
			raw2.push(raw[ii]);
		}
	}
	return raw2;
}

Object.prototype.rawraw = function (p,own){
	if(typeof p != 'string'){throw new Error('Rawraw: property name cannot be '+p+'.');}
	var rawraw = [];
	rawraw.push(this.getget(p,own?this:false,true));
	if(this.chainage){
		for(var i = 0; i < this.chainage.length; i ++){
			rawraw.push(this.chainage[i].getget(p,own?this:false,true));
		}
	}
	return rawraw;
}

Object.prototype.dechain = function (){
	if(this.chainage){
		if(!arguments.length){
			this.chainage = [];
		}else{
			for(var i = 0; i < arguments.length; i ++){
				while(this.chainage.indexOf(arguments[i]) > -1){
					this.chainage.splice(this.chainage.indexOf(arguments[i]),1);
				}
			}
		}
	}
	return this;
}

Object.prototype.rechain = function (x,o){
	if(!this.chainage){
		this.chainage = [];
	}
	if(!(this.chainage.indexOf(x) < 0)){
		this.chainage.splice(this.chainage.indexOf(x),1,o);
	}
	return this;
}

Object.prototype.inchain = function (){
	if(!this.chainage){
		this.chainage = [];
	}
	for(var i = arguments.length; i > 0; i --){
		this.chainage.unshift(arguments[i-1]);
	}
}