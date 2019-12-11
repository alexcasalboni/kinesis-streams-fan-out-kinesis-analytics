const program = require('commander');
const AWS = require('aws-sdk');

const DEFAULT_AWS_REGION = 'ap-northeast-1';

program
    .version('0.0.1')
    .option('-R, --region [name]', 'The AWS Region name', DEFAULT_AWS_REGION)
    .option('-N, --name <name>', 'Kinesis Analytics ApplicationName')
    .parse(process.argv);

if (!program.name) {
    return console.error('Missing application name, use -N or --name\n');
}

const kinesisanalytics = new AWS.KinesisAnalytics({region: program.region});

(function runCommand() {

    return Promise.resolve()
        .then(describeApplication)
        .catch((err) => {
            console.error("Application not found:", err);
        })
        .then(deleteApplication)
        .then((res) => {
            console.log("Done", res);
        }).catch((err) => {
            console.error("Something went wrong", err);
        });

})();


function describeApplication() {
    console.log("Describing application...");
    return kinesisanalytics.describeApplication({
        ApplicationName: program.name
    }).promise();
}

function deleteApplication(application) {
    console.log("Deleting application...");
    return kinesisanalytics.deleteApplication({
        ApplicationName: program.name,
        CreateTimestamp: application.ApplicationDetail.CreateTimestamp.getTime() / 1000 | 0
    }).promise();
}
