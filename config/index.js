
function read(filename) {
    return JSON.parse(require('fs').readFileSync('./config/' + filename + '.json', 'utf-8'));
}

function merge(obj1, obj2) {
    for (var attrname in obj2) {
        obj1[attrname] = obj2[attrname];
    }
}

var config = read('common');

if (process.env.NODE_ENV !== undefined) {
    merge(config, read(process.env.NODE_ENV))
    exports.config = config;
}
else {
    merge(config, read('development'));
    exports.config = config;
}
