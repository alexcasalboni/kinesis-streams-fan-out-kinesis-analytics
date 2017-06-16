const program = require('commander');
const AWS = require('aws-sdk');

const DEFAULT_AWS_REGION = 'us-east-1';

program
    .version('0.0.1')
    .option('-R, --region [name]', 'The AWS Region name', DEFAULT_AWS_REGION)
    .option('-P, --role <role>', 'The AWS IAM Role ARN for Kinesis Analytics')
    .option('-I, --input <input>', 'The Input Kinesis Stream ARN')
    .parse(process.argv);

if (!program.role) {
    return console.error('Missing IAM Role ARN, use -P or --role\n');
}
if (!program.input) {
    return console.error('Missing input Stream ARN, use -I or --input\n');
}

const kinesisanalytics = new AWS.KinesisAnalytics({region: program.region});

(function runCommand() {

    return Promise.resolve()
        .then(discoverSchema)
        .then((res) => {
            console.log("Done", JSON.stringify(res));
        }).catch((err) => {
            console.error("Error", err);
        });    

})();


function discoverSchema() {
    var params = {
      InputStartingPositionConfiguration: {
        InputStartingPosition: 'TRIM_HORIZON'
      },
      ResourceARN: program.input,
      RoleARN: program.role,
    };
    return kinesisanalytics
        .discoverInputSchema(params)
        .promise();
}