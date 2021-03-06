# node-pandoc

Version 0.2.0

https://github.com/sbisbee/node-pandoc

A node module that wraps the [Pandoc tool](http://johnmacfarlane.net/pandoc/),
allowing you to covert between markup types in node.

## Compatability

node-pandoc is tested against Node v0.6.x and v0.7.x.

## Examples

At a very basic level this library allows you to convert one markup type into
one or many. Supported markup types depends on how you installed Pandoc.

### Convert markdown into HTML

```js
var pandoc = require('pandoc');

pandoc.convert('markdown', mdText, [ 'html' ], function(result, err) {
  console.log(result.html); //outputs html
  console.log(result.markdown); //outputs the original markdown
});
```

### Convert HTML into reStructredTest and plain text

```js
var pandoc = require('pandoc');

pandoc.convert('html', htmlText, [ 'rst', 'plain' ], function(result, err) {
  console.log(result.rst); //outputs the reStructured Text
  console.log(result.plain); //outputs the plain text
  console.log(result.html); //outputs the HTML text
});
```

### Deal with errors (err is the exit status code from pandoc)

```js
var pandoc = require('pandoc');

pandoc.convert('invalid', moreInvalid, [], function(result, err) {
  if(err) {
    console.log('pandoc exited with status code ' + err);
  }
  else {
    //do stuff
  }
});
```

## License

node-pandoc is released under the Apache License, version 2.0. See the file
named LICENSE for more information.

Copyright information is in the [NOTICE](NOTICE) file.
