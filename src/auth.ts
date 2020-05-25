import { Request, Response, NextFunction} from 'express';
import FB from 'fb';
import config from './config';
import { getRepository } from './model/repository';
import { User } from './model/user';

FB.options({version: 'v2.4'});
FB.extend({appId: config.facebook_api_key, appSecret: config.facebook_api_secret});

export async function facebookAuth(req:Request, res:Response, next:NextFunction) {
  try {
    const token = req.token;
    console.log(token);
    if (!token) {
      return res.status(401).send('Not authorized');
    }
    FB.setAccessToken(token);
    FB.api('me', { fields: 'id,name' }, async function (res) {
      if(!res || res.error) {
        console.log(!res ? 'Error occurred' : res.error);
        return;
      }
      (req as any).user = {
        id: res.id,
        name: res.name
      };
      const repository = await getRepository(User);
      const user = await repository.findOne({ 
        where: {
            id: res.id,
        },
      });
      if (!user) {
        const user = new User();
        user.id = res.id;
        repository.save(user);
      }
      next();
    });
  }
  catch (err) {
    return res.status(401).send(err.message);
  }
}
