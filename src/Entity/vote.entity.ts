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
  state: number;

  @Column({
    nullable: true,
  })
  quote_id: number;

  @Column({
    nullable: true,
  })
  user_id: number;

  @ManyToOne(() => Quote, (quote) => quote.vote)
  @JoinColumn({ name: 'quote_id' })
  quote: Quote;

  @ManyToOne(() => User, (user) => user.vote)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
