import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import { Project } from './project';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  tag: string;

  @ManyToOne(type => Project, project => project.tags)
  project: Project;
}
