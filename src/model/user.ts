import {Entity, CreateDateColumn, OneToMany, PrimaryColumn, Long} from 'typeorm';
import { Project } from './project';
import { Assignment } from './assignment';

@Entity()
export class User {
  @PrimaryColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @OneToMany(type => Project, project => project.owner)
  owns: Project[];

  @OneToMany(type => Assignment, assignment => assignment.user)
  assignments: Assignment[];
}
