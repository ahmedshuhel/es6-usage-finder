var fs = require('fs');
var path = require('path');
var gs = require('glob-stream');

var patterns = {
  'Map': 'Map',
  'Set': 'Set',
  'WeakMap': 'WeakMap',
  'WeakSet': 'WeakSet',
  'Proxy': 'Proxy',
  'Symbol': 'Symbol',
  'Object.assign()': 'Object *\\. *assign *\\(.*\\)',
  'Number.isInteger()': 'Number *\\. *isInteger *\\(.*\\)',
  'Number.isNaN()': 'Number *\\. *isNaN *\\(.*\\)',
  'Number.EPSILON': 'Number *\\. *EPSILON',
  'Math.acosh()': 'Math *\\. *acosh *\\(.*\\)',
  'Math.hypot()': 'Math *\\. *hypot *\\(.*\\)',
  'Math.imul()': 'Math *\\. *imul *\\(.*\\)',
  'String.includes()': '\\. *includes *\\(.*\\)',
  'String.repeat()': '\\. *repeat *\\(.*\\)',
  'Array.from()': 'Array *\\. *from *\\(.*\\)',
  'Array.of()': 'Array *\\. *of *\\(.*\\)',
  '[].fill()': '\\. *fill *\\(.*\\)',
  '[].find()': '\\. *find *\\(.*\\)',
  '[].findIndex()': '\\. *findIndex *\\(.*\\)',
  '[].copyWithin()': '\\. *copyWithin *\\(.*\\)',
  '[].keys()': '\\. *keys *\\(.*\\)',
  '[].values()': '\\. *values *\\(.*\\)',
};

var searchArea = [
  './src/**/*.js',
  './test/**/*.js',
  '!./src/usage-finder.js',
];

function scanDirectory(basePath, dir){
  var opt = {
    cwd: `${basePath}/${dir}/`
  };

  var stream = gs.create(searchArea, opt);
  stream.on('data', (file) => {
    searchFile(file.path);
  });
}

function searchFile(filePath) {
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

  var rx = /(\r\n|\n|\r)/gm;

  var lines = str.substr(0, pos).match(rx);
  return lines ? lines.length + 1 : 1;
};

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

exports.scanDirectory = scanDirectory;
exports.getDirectories = getDirectories;
