/*
 * node-pandoc
 *
 * This is the main, and currently only, file. It wraps the `pandoc` command
 * using node's child_process module. Since we still have to support node 0.4.x
 * (latest stable) we have to use spawn instead of fork().
 */

var spawn = require('child_process').spawn;

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
      var pandoc = spawn('pandoc', [ '-f', type, '-t', types[i] ]);

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
    }
  }
};
