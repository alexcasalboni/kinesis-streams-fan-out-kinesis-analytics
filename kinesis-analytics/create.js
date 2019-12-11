const program = require('commander');
const fs = require('fs');
const AWS = require('aws-sdk');

const DEFAULT_AWS_REGION = 'ap-northeast-1';
const INPUT_SCHEMA = JSON.parse(fs.readFileSync('./kinesis-analytics/input-schema.json', 'utf8'));

program
    .version('0.0.1')
    .option('-R, --region [name]', 'The AWS Region name', DEFAULT_AWS_REGION)
    .option('-N, --name <name>', 'Kinesis Analytics ApplicationName')
    .option('-P, --role <role>', 'The AWS IAM Role ARN for Kinesis Analytics')
    .option('-I, --input <input>', 'The Input Kinesis Stream ARN')
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
    const sql_query = fs.readFileSync(`./${program.name}/query.sql`, 'utf8');
    fs.readFile(`./${program.name}/streams.json`, 'utf8', function(err, json) {
      if (err) {
        console.log('Error: ' + err);
        return;
      }

      const data = JSON.parse(json);
      const names = data.streams.map(function(item){ return item.name; });
      const arns = data.streams.map(function(item){ return item.arn; });

      var params = {
        ApplicationName: program.name,
        ApplicationCode: sql_query,
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
            Name: names[0],
            KinesisStreamsOutput: {
              ResourceARN: arns[0],
              RoleARN: program.role
            }
          },
          {
            DestinationSchema: {
              RecordFormatType: 'JSON'
            },
            Name: names[1],
            KinesisStreamsOutput: {
              ResourceARN: arns[1],
              RoleARN: program.role
            }
          },
          {
            DestinationSchema: {
              RecordFormatType: 'JSON'
            },
            Name: names[2],
            KinesisStreamsOutput: {
              ResourceARN: arns[2],
              RoleARN: program.role
            }
          },
        ]
      };

      return kinesisanalytics
          .createApplication(params)
          .promise();
      });
}
