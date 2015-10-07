var fs = require('fs');
var path = require('path');
var globby = require('globby');
var gs = require('glob-stream');

var patterns = {
  'Object.assign': 'Object *\\. *assign *\\(',
  'Map': 'Map',
};

var stream = gs.create([
  '../**/*.js',
  '!../**/node_modules/**/*',
  '!../**/jspm_packages/**/*',
  '!../**/build/**/*',
  '!../**/dist/**/*'
]);


stream.on('data', (file) => {
  searchFile(file.path);
});

function searchFile(filePath) {

  console.log(`Searching '${filePath}'`);

  var src = fs.readFileSync(filePath, 'utf-8');
  Object.keys(patterns).forEach(p => {
    var res, msg;
    var rx = new RegExp(patterns[p], 'g');

    while ((res = rx.exec(src)) !== null) {
      msg = `Found '${res[0]}' at line: ${getLineFromPos(src, rx.lastIndex)} in '${path.resolve(filePath)}'`;
      console.log(msg);
    }
  });
}

function getLineFromPos(str, pos) {
  if (pos === 0) {
    return 1;
  }
  //adjust for negative pos
  if (pos < 0) {
    pos = str.length + pos;
  }
  var lines = str.substr(0, pos).match(/[\n\r]/g);
  return lines ? lines.length + 1 : 1;
};
