import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class NotificationNest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  receiverId: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column('text')
  message: string;

  @Column('jsonb')
  metadata: Map<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  toResponse(): any {
    return {
      receiverId: this.receiverId,
      type: this.type,
      message: this.message,
      metadata: this.metadata,
      createdAt: this.createdAt,
    };
  }
}
