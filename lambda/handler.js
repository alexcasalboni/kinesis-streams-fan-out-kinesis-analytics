'use strict';

module.exports.processPositive = (event, context, callback) => {
    event.Records.forEach((record) => {
        const payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
        console.log('Decoded positive record:', payload);
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);
};

module.exports.processNegative = (event, context, callback) => {
    event.Records.forEach((record) => {
        const payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
        console.log('Decoded negative record:', payload);
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);
};
