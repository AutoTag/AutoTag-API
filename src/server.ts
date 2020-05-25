import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as bearerToken from 'express-bearer-token';
import { facebookAuth } from './auth'
import { projectRouter } from './api/project';
import config from './config';
import { Container } from 'typedi';
import AwsAccessorService from './services/AWSFileAccesor';

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(bearerToken())
  .use(facebookAuth)
  .use(projectRouter);

const pjson = require('../package.json');

app.get(`${pjson.name}/debug/${pjson.version}/DownloadFromBucket/`, async (req, res) => {
  console.log("DEBUG: DownloadFromBucket");

  var fileLoc = req.body.fileLoc;

  if(!fileLoc){
    res.statusMessage = "Please send the 'fileLoc' as parameter in the Body.";
    return res.status(406).end();
  }

  const awsAccessorServiceInstance = Container.get(AwsAccessorService);

  let awsFile = await awsAccessorServiceInstance.downloadFileAsList(fileLoc);

  return res.status(200).json(awsFile);
});

app.listen(config.port, async () => {
  // Run loaders
  require('./loaders').default();

  return console.log(`${pjson.name} listening on port ${config.port}`);
});