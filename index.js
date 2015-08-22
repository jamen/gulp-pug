'use strict';

var extend = require('util')._extend;

var through = require('through2');
var defaultJade = require('jade');
var ext = require('gulp-util').replaceExtension;
var PluginError = require('gulp-util').PluginError;

module.exports = function(options){
  var opts = extend({}, options);
  var jade = opts.jade || defaultJade;

  function CompileJade(file, enc, cb){
    opts.filename = file.path;

    if (opts.client)
    {
      var templateFuncName = 'render_template_' + file.relative.replace(/[\/\\\-]/g, '_').replace(/[\.](jade|js)/g, '');
      templateFuncName = templateFuncName.replace(/(_)([a-zA-Z0-9])([a-zA-Z0-9-\\\/]+)/g, function (a, b, c, d) {
        return c.toUpperCase() + d;
      });
      opts.name = templateFuncName;
    }

    if(file.data){
      opts.data = file.data;
    }

    file.path = ext(file.path, opts.client ? '.js' : '.html');

    if(file.isStream()){
      return cb(new PluginError('gulp-jade', 'Streaming not supported'));
    }

    if(file.isBuffer()){
      try {
        var compiled;
        var contents = String(file.contents);
        if(opts.client){
          compiled = jade.compileClient(contents, opts);
        } else {
          compiled = jade.compile(contents, opts)(opts.locals || opts.data);
        }
        file.contents = new Buffer(compiled);
      } catch(e) {
        return cb(new PluginError('gulp-jade', e));
      }
    }
    cb(null, file);
  }

  return through.obj(CompileJade);
};
