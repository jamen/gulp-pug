'use strict';

var through = require('through2');
var compile = require('jade').compile;
var compileClient = require('jade').compileClient;
var ext = require('gulp-util').replaceExtension;
var PluginError = require('gulp-util').PluginError;

function handleCompile(contents, opts, data){
  if(opts.client){
    return compileClient(contents, opts);
  }

  return compile(contents, opts)(data);
}

function handleExtension(filepath, opts){
  if(opts.client){
    return ext(filepath, '.js');
  }

  return ext(filepath, '.html');
}

module.exports = function(options){
  var opts = options || {};

  function CompileJade(file, enc, cb){
    opts.filename = file.path;
    file.path = handleExtension(file.path, opts);
        

    if(file.isStream()){
      this.emit('error', new PluginError('gulp-jade', 'Streaming not supported'));
      return cb();
    }
    
    //normalize locals so we can figure out if it's a function
    opts.data = opts.data||opts.locals;
    delete opts.locals;
   
    //make both synchronous and asynchronous data parameters act the same way
    var dataFunction = opts.data;
    if(typeof dataFunction !='function'){
    	dataFunction = function(filepath,_cb){    		
    		_cb(opts.data);
    	};
    }
    
    //do this async with file.path used to give difference possible data results
    var self = this;
    dataFunction(file.path,function(data){
    	
    	if(file.isBuffer()){
    	      try {
    	        file.contents = new Buffer(handleCompile(String(file.contents), opts, data));
    	      } catch(e) {
    	    	  self.emit('error', e);
    	      }
    	}

    	self.push(file);
    	cb();
    });
    
    
  }

  return through.obj(CompileJade);
};
