import {createConnection, Connection, Repository} from 'typeorm';
import { Project } from './project';
import { User } from './user';
import { Assignment } from './assignment';
import { Tag } from './tag';
import config from '../config';

let connection:Connection;

const ENTITIES = [
  Project,
  User,
  Assignment,
  Tag,
];

export declare type ObjectType<T> = {
  new (): T;
} | Function;

export async function getRepository<Entity>(target: ObjectType<Entity>): Promise<Repository<Entity>> {
  if (connection===undefined) {
    if (config.db_type === 'postgres') {
      connection = await createConnection({
        type: 'postgres',
        url: config.db_url,
        entities: ENTITIES,
        extra: {
              ssl: true
        }
      });
    } else {
      connection = await createConnection({
        type: 'sqlite',
        database: 'AutoTag.sqlite',
        synchronize: true,
        entities: ENTITIES,
      });
    }
  }
  return connection.getRepository(target);
}