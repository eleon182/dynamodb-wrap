var lo = require('lodash');

function removeKey(data) {
    if (!lo.isArray(data)) {
        removeIndividualKey(data);
    } else {
        data.forEach(function(outer) {
            removeIndividualKey(outer);
        });
    }
}

function removeIndividualKey(data) {
    for (var key in data) {
        for (var innerKey in data[key]) {
            data[key] = data[key][innerKey];
        }
    }
}

module.exports = {
    removeKey: removeKey
};
