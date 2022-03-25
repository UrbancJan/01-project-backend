import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

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
}
