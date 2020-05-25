import {createConnection, Connection, Repository} from 'typeorm';
import { Project } from './project';
import { User } from './user';
import { Assignment } from './assignment';
import { Tag } from './tag';

let connection:Connection;

export declare type ObjectType<T> = {
  new (): T;
} | Function;

export async function getRepository<Entity>(target: ObjectType<Entity>): Promise<Repository<Entity>> {
  if (connection===undefined) {
    connection = await createConnection({
      type: 'sqlite',
      database: 'AutoTag.sqlite',
      synchronize: true,
      entities: [
        Project,
        User,
        Assignment,
        Tag,
      ],
    });
  }
  return connection.getRepository(target);
}