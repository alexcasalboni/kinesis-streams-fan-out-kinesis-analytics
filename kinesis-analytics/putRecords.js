const program = require('commander');
const AWS = require('aws-sdk');

const DEFAULT_AWS_REGION = 'us-east-1';


program
    .version('0.0.1')
    .option('-R, --region [name]', 'The AWS Region name', DEFAULT_AWS_REGION)
    .option('-N, --number <number>', 'How many records')
    .option('-I, --input <input>', 'The Input Kinesis Stream ARN')
    .parse(process.argv);

if (!program.number) {
    return console.error('Missing records number, use -N or --number\n');
}
if (!program.input) {
    return console.error('Missing input Stream ARN, use -I or --input\n');
}

const kinesis = new AWS.Kinesis({region: program.region});

(function runCommand() {

    return Promise.resolve()
        .then(putRecords)
        .then((res) => {
            console.log("Done", res);
        }).catch((err) => {
            console.error("Error", err);
        });    

})();


function putRecords() {
    var params = {
      Records: Array.from(Array(parseInt(program.number))).map((_, i) => {
        const n = (Math.random() * 100).toFixed(2) * (Math.random() > 0.5 ? 1 : -1);
        console.log("amount: ", n);
        const data = {
            ID: i,
            USERNAME: "admin" + i,
            AMOUNT: n
        }
        return {
          Data: JSON.stringify(data),
          PartitionKey: 'MyPartitionKey',
        };
      }),
      StreamName: program.input,
    };
    return kinesis
        .putRecords(params)
        .promise();
}