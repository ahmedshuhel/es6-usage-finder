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
  'Reflect': 'Reflect',

  'Object.assign()': 'Object *\\. *assign *\\(.*\\)',
  'Object.setPrototypeOf()': 'Object *\\. *setPrototypeOf *\\(.*\\)',
  'Object.getOwnPropertySymbols()': 'Object *\\. *getOwnPropertySymbols *\\(.*\\)',

  'Number.isInteger()': 'Number *\\. *isInteger *\\(.*\\)',
  'Number.isFinite()': 'Number *\\. *isFinite *\\(.*\\)',
  'Number.isNaN()': 'Number *\\. *isNaN *\\(.*\\)',
  'Number.EPSILON': 'Number *\\. *EPSILON',
  'Number.parseInt()': 'Number *\\. *parseInt *\\(.*\\)',
  'Number.parseFloat()': 'Number *\\. *parseFloat *\\(.*\\)',
  'Number.isSafeInteger()': 'Number *\\. *isSafeInteger *\\(.*\\)',
  'Number.MAX_SAFE_INTEGER': 'Number *\\. *MAX_SAFE_INTEGER',
  'Number.MIN_SAFE_INTEGER': 'Number *\\. *MIN_SAFE_INTEGER',

  'Math.hypot()': 'Math *\\. *hypot *\\(.*\\)',
  'Math.imul()': 'Math *\\. *imul *\\(.*\\)',
  'Math.trunc()': 'Math *\\. *trunc *\\(.*\\)',
  'Math.sign()': 'Math *\\. *sign *\\(.*\\)',
  'Math.clz32()': 'Math *\\. *clz32 *\\(.*\\)',
  'Math.fround()': 'Math *\\. *fround *\\(.*\\)',
  'Math.fround()': 'Math *\\. *fround *\\(.*\\)',
  'Math.log10()': 'Math *\\. *log10 *\\(.*\\)',
  'Math.log2()': 'Math *\\. *log2 *\\(.*\\)',
  'Math.log1p()': 'Math *\\. *log1p *\\(.*\\)',
  'Math.expm1()': 'Math *\\. *expm1 *\\(.*\\)',
  'Math.cosh()': 'Math *\\. *cosh *\\(.*\\)',
  'Math.sinh()': 'Math *\\. *sinh *\\(.*\\)',
  'Math.tanh()': 'Math *\\. *tanh *\\(.*\\)',
  'Math.acosh()': 'Math *\\. *acosh *\\(.*\\)',
  'Math.asinh()': 'Math *\\. *asinh *\\(.*\\)',
  'Math.atanh()': 'Math *\\. *atanh *\\(.*\\)',
  'Math.cbrt()': 'Math *\\. *cbrt *\\(.*\\)',

  'String.fromCodePoint()': 'String *\\. *fromCodePoint *\\(.*\\)',
  'String.includes()': '\\. *includes *\\(.*\\)',
  'String.repeat()': '\\. *repeat *\\(.*\\)',

  'Array.from()': 'Array *\\. *from *\\(.*\\)',
  'Array.observe()': 'Array *\\. *observe *\\(.*\\)',
  'Array.of()': 'Array *\\. *of *\\(.*\\)',
  '[].fill()': '\\. *fill *\\(.*\\)',
  '[].entries()': '\\. *entries *\\(.*\\)',
  '[].find()': '\\. *find *\\(.*\\)',
  '[].findIndex()': '\\. *findIndex *\\(.*\\)',
  '[].copyWithin()': '\\. *copyWithin *\\(.*\\)',
  '[].keys()': '\\. *keys *\\(.*\\)',
  '[].values()': '\\. *values *\\(.*\\)',
  '[].startsWith()': '\\. *startsWith *\\(.*\\)',
  '[].endsWith()': '\\. *endsWith *\\(.*\\)',
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
