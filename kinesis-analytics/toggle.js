const program = require('commander');
const AWS = require('aws-sdk');

const DEFAULT_AWS_REGION = 'us-east-1';

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
        .then((application) => {
            console.log(JSON.stringify(application));
            const status = application.ApplicationDetail.ApplicationStatus;
            switch (status) {
              case 'RUNNING':
                  return stopApplication(application);
              case 'READY':
                  return startApplication(application);
              case 'STARTING':
                  return Promise.reject("Application is still starting...");
              default:
                return Promise.reject("Unexpected status: " + status);
            }
        })
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

function startApplication (application) {
  console.log("Starting application...");
  var params = {
    ApplicationName: program.name,
    InputConfigurations: [
      {
        Id: application.ApplicationDetail.InputDescriptions[0].InputId,
        InputStartingPositionConfiguration: {
          InputStartingPosition: 'TRIM_HORIZON'
        }
      },
    ]
  };
  return kinesisanalytics
    .startApplication(params)
    .promise();
}


function stopApplication (application) {
    console.log("Stopping application...");
    var params = {
      ApplicationName: program.name
    };
    return kinesisanalytics
      .stopApplication(params) 
      .promise();
}
