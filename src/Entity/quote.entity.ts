import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Vote } from './vote.entity';

@Entity({ name: 'quotes' }) //ime tabele v bazi
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @OneToMany(() => Vote, (vote) => vote.quote)
  public vote!: Vote[];
}
