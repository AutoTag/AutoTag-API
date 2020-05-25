import {Entity, PrimaryGeneratedColumn, Column, createConnection, Connection, Repository, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, PrimaryColumn} from 'typeorm';
import { User } from './user';
import { Project } from './project';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  facebookId: Number;

  @CreateDateColumn()
  created: Date;

  @ManyToOne(type => User, user => user.assignments)
  user: User;

  @ManyToOne(type => Project, project => project.assignments)
  project: Project;
}
