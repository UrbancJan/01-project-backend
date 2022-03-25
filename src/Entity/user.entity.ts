import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Quote } from './quote.entity';

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

  @OneToOne(() => Quote, (quote) => quote.user)
  @JoinColumn()
  quote: Quote;
}
