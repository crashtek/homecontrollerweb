const path = require('path');
require('@babel/register');

require(path.join(path.join(__dirname, 'server'), 'index')); // eslint-disable-line import/no-dynamic-require
