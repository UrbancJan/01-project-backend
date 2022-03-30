import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Vote } from './vote.entity';

@Entity({ name: 'quotes' }) //ime tabele v bazi
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  votes: number;

  @OneToOne(() => User, (user) => user.quote)
  user: User;

  @OneToMany(() => Vote, (vote) => vote.quote)
  vote: Vote;
}
