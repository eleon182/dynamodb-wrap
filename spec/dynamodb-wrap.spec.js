var test = require('../dynamodb-wrap.js');

describe('initialize', function() {
    it('exists', function() {
        expect(test.initialize).toBeDefined();
    });

    it('check callback gets called', function() {
        var spy = {
            callback: function() {}
        };
        spyOn(spy, 'callback');
        test.initialize('', spy.callback);
        expect(spy.callback).toHaveBeenCalled();
    });

});

describe('describeTable', function(next) {

    it('exists', function() {
        expect(test.describeTable).toBeDefined();
    });

    it('bogus table name will not return a result and return an error', function(next) {
        test.describeTable({
            table: 's111'
        }, function(err, results) {
            expect(err).toBeDefined();
            expect(results).toBeNull();
            next();
        });
    });

    it('real table name will return a result and not return an error', function(next) {
        test.describeTable({
            table: 'AutomationLog'
        }, function(err, results) {
            expect(err).toBeNull();
            expect(results).toBeDefined();
            expect(results.Table).toBeDefined();
            expect(results.Table.ItemCount).toBeDefined();
            expect(results.Table.ItemCount > 0).toBe(true);
            next();
        });
    });
});

describe('updateItem', function() {
    it('exists', function() {
        expect(test.updateItem).toBeDefined();
    });

    it('bad input', function() {
        test.updateItem({
            key: 12
        }, function(err, results) {
            expect(err).toBeDefined();
            expect(results).not.toBeDefined();
        });
    });

    it('good input', function(next) {

        var table = 'mytest';
        var key = {
            testid: {
                'S': '1'
            },
            date: {
                'S': '1234567'
            }
        };
        var expression = "set password = :val1";
        var values = {
            ':val1': {
                'S': 'mypassword'
            },
        };
        var params = {
            table: table,
            key: key,
            expression: expression,
            values: values
        };
        test.updateItem(params, function(err, results) {
            expect(err).toBeNull();
            expect(results).toBeDefined();
            next();
        });
    });
});

ddescribe('query', function() {
    it('exists', function() {
        expect(test.query).toBeDefined();
    });

    it('bad input', function(next) {

        var table = 'mytest';
        var key = {
            testid: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [{
                    S: '1234567'
                }]
            },
            date: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [{
                    S: '234567'
                }]
            },

        };
        var params = {
            table: table,
            key: key
        };
        test.query(params, function(err, results) {
            expect(err).toBeDefined();
            expect(results.length).toBe(0);
            next();
        });
    });
    it('good input', function(next) {

        var table = 'mytest';
        var key = {
            testid: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [{
                    S: '1'
                }]
            },
            date: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [{
                    S: '1234567'
                }]
            },

        };
        var params = {
            table: table,
            key: key
        };
        test.query(params, function(err, results) {
            expect(err).toBeNull();
            expect(results.length > 0).toBe(true);
            next();
        });
    });
});
