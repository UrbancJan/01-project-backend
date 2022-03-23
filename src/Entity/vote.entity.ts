import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Quote } from './quote.entity';

@Entity({ name: 'votes' }) //ime tabele v bazi
export class Vote {
  @PrimaryGeneratedColumn()
  public user_quote!: number;

  @Column()
  public userId!: number;

  @Column()
  public quoteId!: number;

  @Column()
  public numberOfVotes!: number;

  @ManyToOne(() => User, (user) => user.vote)
  public user!: User;

  @ManyToOne(() => Quote, (quote) => quote.vote)
  public quote!: Quote;
}
