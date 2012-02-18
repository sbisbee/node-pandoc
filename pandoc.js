/*
 * node-pandoc
 *
 * This is the main, and currently only, file. It wraps the `pandoc` command
 * using node's child_process module. Since we still have to support node 0.4.x
 * (latest stable) we have to use spawn instead of fork().
 */

var spawn = require('child_process').spawn;

// The global command line args for pandocs.
var globalArgs = {
  //what the user provided
  provided: null,

  //whether to persist between convert() calls
  persist: false,

  //resets back to defaults
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
 * types is an array of markup types to convert to or a single type as a string
 *
 * callback will be passed an object mapping markup type to markup, unless
 * there was an error in which case it gets passed (null, statusCode)
 */
exports.convert = function(type, input, types, callback) {
  var res = {};
  var numResponses = 0;
  var targetResponses;

  var pandoc;
  var args;

  var i;

  if(!type || typeof type !== 'string') {
    throw 'Invalid source markup type: must be a string.';
  }

  if(!input || typeof input !== 'string') {
    throw 'Invalid markup type: must be a string.';
  }

  if(typeof types !== 'string' && !Array.isArray(types)) {
    throw 'Invalid destination types: must be a string or an array of strings.';
  }

  if(types.length <= 0) {
    throw 'No destination types provided (empty array).';
  }

  if(typeof callback !== 'function') {
    if(callback) {
      throw 'Invalid callback provided: must be a function.';
    }
    else {
      throw 'No callback provided: must be a function.';
    }
  }

  //what we're going to send to the callback if there are no pandoc errors
  res[type] = input;

  targetResponses = types.length;

  if(typeof types === 'string') {
    types = [ types ];
  }

  for(i in types) {
    if(types.hasOwnProperty(i)) {
      if(typeof types[i] !== 'string') {
        throw 'Invalid destination type provided: non-string value found in array.';
      }

      /*
       * This if-block filters out the target markup type because we already set
       * it on the res object.
       */
      if(!res[types[i]]) {
        args = globalArgs.provided || [];
        args.push('-f', type, '-t', types[i]);

        pandoc = spawn('pandoc', args);

        //so that we have the target type in scope on('data') - love ya some asynch
        pandoc.stdout.targetType = types[i];

        pandoc.stdout.on('data', function(data) {
          //data will be a binary stream if you don't cast it to a string
          res[this.targetType] = data + '';
        });

        pandoc.on('exit', function(code, signal) {
          numResponses++;

          if(code !== 0) {
            callback(null, code);
          }
          else if(numResponses === targetResponses) {
            callback(res);
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
