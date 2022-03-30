import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Quote } from './quote.entity';
import { User } from './user.entity';

@Entity({ name: 'votes' }) //ime tabele v bazi
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  state: number;

  @ManyToOne(() => Quote, (quote) => quote.vote)
  @JoinColumn({ name: 'quote_id' })
  quote: Quote;
}
