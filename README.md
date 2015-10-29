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

var params = {
    table: 'my-table-name'
};

aws.scan(params, function(err, data){
    if(err){
        console.log("Error found: " + err);
    }
    else {
        console.log(data);
    }
});
```

# Features
- All functions have Q versions that will return a promise instead of using callback (i.e scan vs scanQ)
- Scan implements full scan which will pull all data regardless of size limit. (Automated pagination).
- Parameter keys are changed to a friendly lower case version (i.e  ExpressionAttributeValues vs values)

# API Documentation
- To come!

# GitHub
https://github.com/eleon182/dynamodb-wrap


