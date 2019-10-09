const path = require('path');
require('@babel/register');

require(path.join(path.join(__dirname, process.argv[2]))); // eslint-disable-line import/no-dynamic-require
