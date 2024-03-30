import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
@Entity()
@Unique(['username', 'email', 'password'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ length: 50, nullable: false })
  username: string;

  @Column({ length: 100, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ length: 50, nullable: false })
  first_name: string;

  @Column({ length: 50, nullable: false })
  last_name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  failed_attempts: number;

  @Column({ default: 0 })
  login_count: number;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ length: 100, nullable: true })
  email_verification_token: string;

  @Column({ type: 'timestamp', nullable: true })
  email_verification_token_expiry: Date;
}