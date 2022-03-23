import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Vote } from './vote.entity';

@Entity({ name: 'users' }) //ime tabele v bazi
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  lastname: string;

  @Column()
  password: string;

  @OneToMany(() => Vote, (vote) => vote.user)
  public vote!: Vote[];
}
