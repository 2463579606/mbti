/**
 * User Entity (TypeORM)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { UserStatus } from '../domain/user.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  @Index()
  anonymousId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  @Index()
  email: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  // Statistics
  @Column({ type: 'int', default: 0 })
  testCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTestAt: Date | null;

  // System fields
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @Index()
  deletedAt: Date | null;

  // Helper methods
  isAnonymous(): boolean {
    return !!this.anonymousId && !this.email;
  }

  isRegistered(): boolean {
    return !!this.email;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}
