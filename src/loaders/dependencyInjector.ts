import { Container } from 'typedi';
import { S3 } from 'aws-sdk';
import config from '../config'

export default () => {
  try {
    
    Container.set('s3Client', new S3({
      accessKeyId: config.aws_access_key_id,
      secretAccessKey: config.aws_secret_access_key,
      region: config.aws_region
    }));
    
    // TODO: Log successful dependency injection
    
    return { success : true };
  
  } catch (e) {
    
    // TODO: Log error.    
    throw e;
  }
};