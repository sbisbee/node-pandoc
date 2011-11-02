var spawn = require('child_process').spawn;

var globalArgs = {
  provided: null,
  persist: false,
  reset: function() {
    this.provided = null;
    this.persist = false;
  }
};

/*
 * type is the input markup's type
 *
 * input is the input markup
 *
 * types is an array of markup types to convert to
 *
 * callback will be passed an object mapping markup type to markup, unless
 * there was an error in which case it gets passed (null, statusCode)
 */
exports.convert = function(type, input, types, callback) {
  console.log(type, input, types, callback);

  var res = {};
  res[type] = input;

  var targetResponses = types.length - 1;
  var numResponses = 0;

  for(var i in types) {
    /*
     * This if-block filters out the target markup type because we already set
     * it on the res object.
     */
    if(!res[types[i]]) {
      var args = globalArgs.provided || [];
      args.push('-f', type, '-t', types[i]);

      var pandoc = spawn('pandoc', args);

      //so that we have the target type in scope on('data') - love ya some asynch
      pandoc.stdout.targetType = types[i];

      pandoc.stdout.proc = pandoc;

      pandoc.stdout.on('data', function(data) {
        //data will be a binary stream if you don't cast it to a string
        res[this.targetType] = data + '';
      });

      pandoc.on('exit', function(code, signal) {
        console.log('pandoc just exited with code ' + code + ' and signal ' + signal);

        numResponses++;

        if(typeof callback === 'function') {
          if(code !== 0) {
            callback(null, code);
          }
          else if(numResponses === targetResponses) {
            callback(res);
          }
        }
      });

      //pipe them the input
      pandoc.stdin.write(input, 'utf8');
      pandoc.stdin.end();

      if(!globalArgs.persist) {
        globalArgs.reset();
      }
    }
  }
};

/*
 * args is an array of command line arguments that should be passed to pandoc
 * on the next call. If set to a non-array value, then default args will be
 * used. The default behavior is that they will be thrown away before the next
 * call.
 *
 * persist is a boolean that when set to true will persist the provided args
 * for future calls.
 *
 * Returns this module so you can chain this funciton with convert().
 */
exports.args = function(args, persist) {
  if(Array.isArray(args)) {
    globalArgs.provided = args;
    globalArgs.persist = persist;
  }
  else {
    globalArgs.reset();
  }

  return exports;
};
