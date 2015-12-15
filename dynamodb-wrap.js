var AWS = require('aws-sdk');
var async = require('async');
var lo = require('lodash');
var q = require('q');

AWS.config.update({
    region: 'us-west-2',
});

var dataHelper = require('./helpers/dataHelper');

var db = new AWS.DynamoDB();

module.exports = {
    describeTable: describeTable,
    scan: scan,
    scanQ: scanQ,
    getItem: getItem,
    getItemQ: getItemQ,
    putItem: putItem,
    putItemQ: putItemQ,
    deleteItem: deleteItem,
    deleteItemQ: deleteItemQ,
    query: query,
    queryQ: queryQ,
    updateItemQ: updateItemQ,
    updateItem: updateItem
};

function describeTable(input, callback) {
    var params = {
        TableName: input.table
    };

    db.describeTable(params, callback);
}

function updateItem(params, callback) {
    if (!params.key || !params.expression || !params.values || !params.table) {
        deferred.reject('Required parameters: key, expression, values, table');
    } else {
        var settings = {
            TableName: table,
            Key: key,
            UpdateExpression: expression,
            ExpressionAttributeValues: values
        };

        db.updateItem(settings, function(err, data) {
            if (err) {
                callback(err, data);
            } else {
                callback(null, data);
            }
        });
    }
}

function updateItemQ(params) {
    var deferred = q.defer();
    if (!params.key || !params.expression || !params.values || !params.table) {
        deferred.reject('Required parameters: key, expression, values, table');
    } else {
        var settings = {
            TableName: table,
            Key: key,
            UpdateExpression: expression,
            ExpressionAttributeValues: values
        };

        db.updateItem(settings, function(err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }
        });
    }
    return deferred.promise;
}

function query(params, callback) {
    if (!params.table || !params.key) {
        return callback('Required parameters: table, key');
    }
    var settings = {
        TableName: params.table,
        KeyConditions: params.key
            //KeyConditions: {
            //env: {
            //ComparisonOperator: 'EQ',
            //AttributeValueList: [{
            //S: env
            //}]
            //}
            //}
    };
    db.query(settings, function(err, data) {
        if (err) {
            callback(err, data);
        } else {
            dataHelper.removeKey(data.Items);
            callback(null, data.Items);
        }
    });
}

function queryQ(params) {
    var deferred = q.defer();
    if (!params.table || !params.key) {
        deferred.reject('Required parameters: table, key');
    } else {
        var settings = {
            TableName: params.table,
            KeyConditions: params.key
                //KeyConditions: {
                //env: {
                //ComparisonOperator: 'EQ',
                //AttributeValueList: [{
                //S: env
                //}]
                //}
                //}
        };
        db.query(settings, function(err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                dataHelper.removeKey(data.Items);
                deferred.resolve(data.Items);
            }
        });
    }
    return deferred.promise;
}

function deleteItem(params, callback) {
    if (!params.table || !params.key) {
        callback('Required parameters: table, key');
    } else {
        var settings = {
            TableName: params.table,
            Key: params.key
        };

        db.deleteItem(settings, function(err, data) {
            if (err) {
                callback(err, data);
            } else {
                callback(null, data);
            }
        });
    }
}

function deleteItemQ(params) {
    var deferred = q.defer();
    if (!params.table || !params.key) {
        deferred.reject('Required parameters: table, key');
    } else {
        var settings = {
            TableName: params.table,
            Key: params.key
        };

        db.deleteItem(settings, function(err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }
        });
    }
    return deferred.promise;
}

function getItemQ(params) {
    var deferred = q.defer();
    if (!params.table || !params.key) {
        deferred.reject('Required parameters: table, key');
    } else {
        var settings = {
            TableName: params.table,
            Key: params.key
        };

        db.getItem(settings, function(err, data) {
            if (err || lo.isEmpty(data)) {
                deferred.reject(err);
            } else {
                try {
                    dataHelper.removeKey(data.Item);
                    deferred.resolve(data.Item);
                } catch (e) {
                    deferred.reject(e);
                }
            }
        });
    }
    return deferred.promise;
}

function getItem(params, callback) {
    if (!params.table || !params.key) {
        callback('Required parameters: table, key');
    } else {
        var settings = {
            TableName: params.table,
            Key: params.key
        };

        db.getItem(settings, function(err, data) {
            if (err) {
                callback(err, data);
            } else {
                try {
                    dataHelper.removeKey(data.Item);
                    callback(null, data.Item);
                } catch (e) {
                    callback(e, data);
                }
            }
        });
    }
}

function scanQ(params) {
    var deferred = q.defer();
    if (!params.table) {
        deferred.reject('Required parameters: table');
    }
    var settings = {
        TableName: params.table
    };
    if (params.limit) {
        settings.Limit = params.limit;
    }
    var response = [];
    var recurse = false;

    async.doWhilst(function(callback) {
            db.scan(settings, function(err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    if (!params.raw) {
                        dataHelper.removeKey(data.Items);
                    }
                    buildArray(response, data.Items);

                    if (!data.LastEvaluatedKey) {
                        recurse = false;
                        callback();
                    } else {
                        recurse = true;
                        settings.ExclusiveStartKey = data.LastEvaluatedKey;
                        if (params.sleep) {
                            setTimeout(function() {
                                callback();
                            }, params.sleep);
                        } else {
                            callback();
                        }
                    }
                }
            });
        },
        function() {
            return recurse;
        },
        function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(response);
            }
        });
    return deferred.promise;
}

function scan(params, callback) {
    describeTable(params, function(err, results) {
        if (err) {
            return callback(err, results);
        }
        if (results.Table.TableSizeBytes > 8000000) {
            params.maxReached = true;
        }
        scanHelper(params, function(err, results) {
            //if (params.maxReached) {
                //if (!err) {
                    //err = {};
                //}
                //err.maxReached = true;
            //}
            callback(err, results);
        });
    });
}

function scanHelper(params, mainCallback) {
    if (!params.table) {
        return callback('Required parameters: table');
    }
    var settings = {
        TableName: params.table
    };
    if (params.limit) {
        settings.Limit = params.limit;
    }
    var response = [];
    var recurse = false;

    async.doWhilst(function(callback) {
            db.scan(settings, function(err, data) {
                if (err) {
                    recurse = false;
                    callback({
                        maxReached: true
                    });
                    //mainCallback(err, data);
                } else {
                    if (!params.raw) {
                        dataHelper.removeKey(data.Items);
                    }
                    buildArray(response, data.Items);

                    if (!data.LastEvaluatedKey) {
                        recurse = false;
                        callback();
                    } else {
                        recurse = true;
                        settings.ExclusiveStartKey = data.LastEvaluatedKey;
                        if (params.sleep) {
                            setTimeout(function() {
                                callback();
                            }, params.sleep);
                        } else {
                            callback();
                        }
                    }
                }
            });
        },
        function() {
            return recurse;
        },
        function(err) {
            mainCallback(err, response);
        });
}

function buildArray(array, newArray) {
    newArray.forEach(function(val) {
        array.push(val);
    });
}

function putItemQ(params) {
    var deferred = q.defer();
    if (!params.table || !params.item) {
        deferred.reject('Required parameters: table, item');
    } else {
        db.putItem({
            TableName: params.table,
            Item: params.item
        }, function(err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }

        });
    }
    return deferred.promise;
}

function putItem(params, callback) {
    if (!params.table || !params.item) {
        return callback('Required parameters: table, item');
    } else {
        db.putItem({
            TableName: params.table,
            Item: params.item
        }, function(err, data) {
            if (err) {
                callback(err, data);
            } else {
                callback(null, data);
            }

        });
    }
}
