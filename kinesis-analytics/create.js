const program = require('commander');
const fs = require('fs');
const AWS = require('aws-sdk');

const DEFAULT_AWS_REGION = 'us-east-1';
const SQL_QUERY = fs.readFileSync('./kinesis-analytics/query.sql', 'utf8');
const INPUT_SCHEMA = JSON.parse(fs.readFileSync('./kinesis-analytics/input-schema.json', 'utf8'));

program
    .version('0.0.1')
    .option('-R, --region [name]', 'The AWS Region name', DEFAULT_AWS_REGION)
    .option('-N, --name <name>', 'Kinesis Analytics ApplicationName')
    .option('-P, --role <role>', 'The AWS IAM Role ARN for Kinesis Analytics')
    .option('-I, --input <input>', 'The Input Kinesis Stream ARN')
    .option('-O, --output1 <output1>', 'The Output1 Kinesis Stream ARN')
    .option('-U, --output2 <output2>', 'The Output2 Kinesis Stream ARN')
    .parse(process.argv);

if (!program.role) {
    return console.error('Missing IAM Role ARN, use -P or --role\n');
}
if (!program.name) {
    return console.error('Missing application name, use -N or --name\n');
}
if (!program.input) {
    return console.error('Missing input Stream ARN, use -I or --input\n');
}
if (!program.output1) {
    return console.error('Missing first output Stream ARN, use -O or --output1\n');
}
if (!program.output2) {
    return console.error('Missing second output Stream ARN, use -U or --output2\n');
}

const kinesisanalytics = new AWS.KinesisAnalytics({region: program.region});

(function runCommand() {

    return Promise.resolve()
        .then(describeApplication)
        .then((application) => {
            console.error("Application already exists! ", application);
        })
        .catch(() => Promise.resolve("OK"))
        .then(createApplication)
        .then((res) => {
            console.log("Done", res);
        }).catch((err) => {
            console.error("Something went wrong:", err);
        });    

})();


function describeApplication() {
    console.log("Describing application...");
    return kinesisanalytics.describeApplication({
        ApplicationName: program.name
    }).promise();
}

function createApplication() {
    console.log("Creating application...");
    var params = {
      ApplicationName: program.name,
      ApplicationCode: SQL_QUERY,
      Inputs: [
        {
          InputSchema: {
            RecordColumns: INPUT_SCHEMA,
            RecordEncoding: "UTF-8",
            RecordFormat: {
              RecordFormatType: 'JSON'
            }
          },
          NamePrefix: 'SOURCE_SQL_STREAM',
          KinesisStreamsInput: {
            ResourceARN: program.input,
            RoleARN: program.role
          }
        }
      ],
      Outputs: [
        {
          DestinationSchema: {
            RecordFormatType: 'JSON'
          },
          Name: 'POSITIVE_TRANSACTIONS',
          KinesisStreamsOutput: {
            ResourceARN: program.output1,
            RoleARN: program.role
          }
        },
        {
          DestinationSchema: {
            RecordFormatType: 'JSON'
          },
          Name: 'NEGATIVE_TRANSACTIONS',
          KinesisStreamsOutput: {
            ResourceARN: program.output2,
            RoleARN: program.role
          }
        },
      ]
    };

    return kinesisanalytics
        .createApplication(params)
        .promise();
}