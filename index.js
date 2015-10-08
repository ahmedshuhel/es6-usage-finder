var finder = require('./usage-finder');

var basePath = '..';

//finder.scanDirectory(basePath, 'es6-usage-finder');

finder.getDirectories(basePath).forEach((d) => {
  finder.scanDirectory(basePath, d);
});
