# AWS-SDK Wrapper
Wrapper for the aws-sdk package. Makes using the package easier.

# Installation
```
$ npm install dynamodb-wrap
```
Be sure to have your AWS credentials in the ~/.aws/credentials file

# Usage
```
var aws = require('dynamodb-wrap');
aws.initialize({region: 'us-west-2'});

var params = {
    table: 'my-table-name',
    raw: true,   // does not parse out the data types with response
    sleep: 2000  // number of ms in between pagination calls (prevents exceeding the table throughput)
};

aws.scan(params, function(err, data){
    if(err){
        return console.log("Error found: " + err);
    }

    console.log(data);
});

```

# Features
- Automated pagination. Scan implements full scan which will pull all table data. (Up to table throughput limits).
- If throughput is exceeded, the response will include a flag "maxReached" to indicate that not all items were retrieved.
- A sleep can be passed in to slow it down and possibly prevent exceeding the throughput. (ie. {sleep: 2000})
- Parameter keys are changed to a friendly lower case version (i.e  ExpressionAttributeValues vs values)
- Data responses have the keys removed

```
{
    "myInteger": 1,
    "myString": "steve leon"
}
```

vs

```
{
    "myInteger": {
        "N": 1
    },
    "myString: {
        "S": "steve leon"
    }
}
```

- Key removal can be turned off by passing {raw: true} into the parameters.

# API Documentation
- To come!

# GitHub
https://github.com/eleon182/dynamodb-wrap


