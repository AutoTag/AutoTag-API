import { Service, Inject } from 'typedi';
import config from '../config';
import { S3 } from 'aws-sdk';

@Service()
export default class AWSAccessorService {

  // == Service Injection ==
  @Inject('s3Client')
  s3Client: S3; // S3 Client


  // == HELPER METHODS ==

  /*
    TryDownloadStream

    Helper method to download a file stream from AWS S3
  */
  private async tryDownloadStream(filePath: string): Promise<[boolean, ReadableStream]> {

    console.log("Downloading File Stream");

    let resp;

    const getObject = key => {
      return new Promise((resolve, reject) => {
        this.s3Client.getObject({
          Bucket: config.aws_bucket,
          Key: key
        }, (err, data) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(data.Body);
          }
        })
      })
    }

    try {
      resp = await getObject(filePath);
    } catch (err) {
      console.error(`Error Retrieving Object from 'filePath=${filePath}'`);
      console.error(err);
      return [false, null];
    }

    console.log(`Success Retrieving Object from 'filePath=${filePath}'.`);
    return [true, resp];
  }


  // == PUBLIC SERVICE METHODS ==

  /*
    TryUploadFile

    Sample Use:
      const awsAccessorServiceInstance = Container.get(AwsAccessorService);

      if(await awsAccessorServiceInstance.tryUploadFile("path/to/file"))
      {
        // ...
      }
  */
  public async tryUploadFile(fileDest: string, fileStream: Buffer): Promise<boolean> {
    const s3Params = {
      Bucket: config.aws_bucket,
      Key: fileDest,
      Body: fileStream
    };

    console.log(`Bucket: ${config.aws_bucket}`);
    console.log(`File Dest: ${fileDest}`);

    this.s3Client.upload(s3Params, (err, data) => {
      if (err) {
        console.error(err);
        
        return false;
      }
    });

    console.log(`Success Uploading Buffer to ${fileDest}.`);
    return true;
  }

  /**
   * deleteDirectory
   */
  public async tryDeleteDirectory(directory: string): Promise<boolean> {
    let objsToDelete : any[] = [];

    // List All Objects with Directory Prefix
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property

    const listObjectsV2 = dir => {
      return new Promise<S3.ObjectList>((resolve, reject) => {
        this.s3Client.listObjectsV2({
          Bucket: config.aws_bucket,
          Prefix: dir
        }, (err, data) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(data.Contents);
          }
        })
      })
    };

    try {
      const objects = await listObjectsV2(directory);
      objects.forEach(obj => {
        objsToDelete.push({
          Key: obj.Key
        });
      });
    }
    catch(err){
      console.error(err);
      return false;
    }

    // Delete Listed Objects
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects-property

    const deleteObjects = objects => {
      return new Promise<S3.DeletedObjects>((resolve, reject) => {
        this.s3Client.deleteObjects({
          Bucket: config.aws_bucket,
          Delete: {
            Objects: objsToDelete,
            Quiet: false
          }
        }, (err, data) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(data.Deleted);
          }
        })
      })
    };

    try {
      const deletedObjects = await deleteObjects(objsToDelete);
      console.log(`Success Deleting Objects: `);
      deletedObjects.forEach(obj => {
        console.log(obj);
      });
    }
    catch(err){
      console.log(`Error Occurred While Deleting Objects.`);
      console.error(err);
      return false;
    }

    console.log(`Success Deleting Directory 'directory=${directory}'.`);
    return true;
  }

  /*
    DownloadFileAsString

    Sample Use:
      const awsAccessorServiceInstance = Container.get(AwsAccessorService);

      let awsFileContent = await awsAccessorServiceInstance.downloadFileAsString("path/to/file");
  */
  public async downloadFileAsString(filePath: string): Promise<string> {
    console.log("Downloading File");

    let fileContent : string;

    await this.tryDownloadStream(filePath).then(([success, stream]) => {
      if (!success) {
        console.error(`Error While Trying to Download Stream from 'filePath=${filePath}'.`);
        return null;
      }

      // TODO: Validate File Contents are Parsed Correctly.
      fileContent = stream.toString();
    })
    .catch(err => {
      console.error(err);
      return null;
    });

    console.log(`Successfuly Downloaded Files As String from 'filePath=${filePath}'.`);
    return fileContent;
  }

  /*
    DownloadFileAsList

    Sample Use:
      const awsAccessorServiceInstance = Container.get(AwsAccessorService);

      let awsFileContent = await awsAccessorServiceInstance.downloadFileAsList("path/to/file");
  */
  public async downloadFileAsList(filePath: string): Promise<string[]> {
    console.log("Downloading File");

    let fileContent : string[] = [];

    await this.tryDownloadStream(filePath).then(([success, stream]) => {
      if (!success) {
        console.error(`Error While Trying to Download Stream from 'filePath=${filePath}'.`);
        return null;
      }

      // TODO: Validate File Contents are Parsed Correctly.
      // TODO: Make this more efficient by reading directly from the stream ffs...
      fileContent = stream.toString().split(/(?:\r\n|\r|\n)/g);
    })
    .catch(err => {
      console.error(err);
      return null;
    });

    console.log(`Successfuly Downloaded Files As List from 'filePath=${filePath}'.`);
    return fileContent;
  }
}
