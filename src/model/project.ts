import {Entity, PrimaryGeneratedColumn, Column, createConnection, Connection, Repository, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, PrimaryColumn} from 'typeorm';
import { Assignment } from './assignment';
import { User } from './user';
import { Tag } from './tag';

@Entity()
export class Project {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  name?: string;

  @Column()
  description?: string;

  @Column()
  type: number = 0;

  @Column()
  dataFormat: string = "";

  @Column()
  projectDataFormat: string = "";

  @Column()
  projectDataLoc: string = "";

  @Column()
  tagsLoc: string = "";

  @Column()
  taggedByLoc: string = "";

  @Column()
  silverStandardLoc: string = "";
  
  @Column()
  status: number = 0;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  lastUpdate: Date;

  @Column({ nullable: true })
  lastLabelSubmission?: Date;

  @OneToMany(type => Assignment, assignment => assignment.project)
  assignments: Assignment[];

  @OneToMany(type => Tag, tag => tag.project)
  tags: Tag[];

  @ManyToOne(type => User, user => user.owns)
  owner: User;
}
