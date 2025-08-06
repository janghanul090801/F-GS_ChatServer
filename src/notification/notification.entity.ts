import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity()
export class Notification {
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

  @Column('timestamp')
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
