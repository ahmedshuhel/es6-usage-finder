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
  'Object.is()': 'Object *\\. *is *\\(.*\\)',
  'Object.getOwnPropertySymbols()': 'Object *\\. *getOwnPropertySymbols *\\(.*\\)',
  'Object.getOwnPropertyDescriptors()': 'Object *\\. *getOwnPropertyDescriptors *\\(.*\\)',

  'Object.values()': 'Object *\\. *values *\\(.*\\)',
  'Object.entries()': 'Object *\\. *entries *\\(.*\\)',
  'Object.observe()': 'Object *\\. *observe *\\(.*\\)',

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
  'String.raw()': 'String *\\. *raw *\\(.*\\)',

  'String.prototype.codePointAt()': '\\. *codePointAt *\\(.*\\)',
  'String.prototype.includes()': '\\. *includes *\\(.*\\)',
  'String.prototype.repeat()': '\\. *repeat *\\(.*\\)',
  'String.prototype.normalize()': '\\. *normalize *\\(.*\\)',
  'String.prototype.startsWith()': '\\. *startsWith *\\(.*\\)',
  'String.prototype.endsWith()': '\\. *endsWith *\\(.*\\)',

  'String.prototype.trimLeft() Alias': '\\. *trimLeft *\\(.*\\)',
  'String.prototype.trimRight() Alias': '\\. *trimRight *\\(.*\\)',

  'String.prototype.trimStart()': '\\. *trimStart *\\(.*\\)',
  'String.prototype.trimEnd()': '\\. *trimEnd *\\(.*\\)',

  'String.prototype.padStart()': '\\. *padStart *\\(.*\\)',
  'String.prototype.padEnd()': '\\. *padEnd *\\(.*\\)',

  'Array.from()': 'Array *\\. *from *\\(.*\\)',
  'Array.observe()': 'Array *\\. *observe *\\(.*\\)',
  'Array.of()': 'Array *\\. *of *\\(.*\\)',
  'Array.prototype.fill()': '\\. *fill *\\(.*\\)',
  'Array.prototype.entries()': '\\. *entries *\\(.*\\)',
  'Array.prototype.find()': '\\. *find *\\(.*\\)',
  'Array.prototype.findIndex()': '\\. *findIndex *\\(.*\\)',
  'Array.prototype.copyWithin()': '\\. *copyWithin *\\(.*\\)',
  'Array.prototype.keys()': '\\. *keys *\\(.*\\)',
  'Array.prototype.values()': '\\. *values *\\(.*\\)',
  'Array.prototype.includes()': '\\. *includes *\\(.*\\)',
  'Exponentiation Operator (**)': '[_a-zA-Z]\\w*\\s+\\*\\*\\s+[_a-zA-Z]\\w*|\\d+\\s+\\*\\*\\s+\\d+|[_a-zA-Z]\\w*\\s+\\*\\*=\\s*\\d+|[_a-zA-Z]\\w*\\s+\\*\\*=\\s*[_a-zA-Z]\\w*',
  'async & await':'\\s*async\\s+function\\s+[_a-zA-Z][_a-zA-Z0-9]*\\(.*?\\)|\\s+async\\s+\\(.*?\\)\\s+=>|\\s+await\\s+[_a-zA-Z][_a-zA-Z0-9]*\\(.*\\)|\\(\\s*async\\s+function\\s*\\(.*\\)\\s*\\{[\\s\\S]*?\\}\\s*\\)\\(.*?\\)',
  'ArrayBuffer': 'ArrayBuffer',
  'DataView': 'DataView',
  'Int8Array': 'Int8Array',
  'Uint8Array': 'Uint8Array',
  'Uint8ClampedArray': 'Uint8ClampedArray',
  'Int16Array': 'Int16Array',
  'Uint16Array': 'Uint16Array',
  'Int32Array': 'Int32Array',
  'Uint32Array': 'Uint32Array',
  'Float32Array': 'Float32Array',
  'Float64Array': 'Float64Array',
};

var searchArea = [
  './src/**/*.js',
  './test/**/*.js',
];

function scanDirectory(basePath, dir){
  var opt = {
    cwd: `${basePath}/${dir}/`
  };

  var stream = gs.create(searchArea, opt);
  stream.on('data', (file) => {
    searchFile(file.path, basePath);
  });
}

function searchFile(filePath, basePath) {
  var src = fs.readFileSync(filePath, 'utf-8');
  Object.keys(patterns).forEach(p => {
    var res, msg;
    var rx = new RegExp(patterns[p], 'g');

    while ((res = rx.exec(src)) !== null) {
      console.log(`Found '${res[0]}' at line: ${getLineFromPos(src, rx.lastIndex)} in '${path.relative(basePath, filePath)}'`);
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
