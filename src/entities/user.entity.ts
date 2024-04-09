import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as bcrypt from 'bcrypt';

@Entity()
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Unique(['username'])
    @Column({ length: 50 })
    username: string;

    @Unique(['email'])
    @Column({ length: 100, unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ name: "first_name", nullable: true })
    firstName: string;

    @Column({ name: "last_name", nullable: true })
    lastName: string;

    @Column({ name: "email_verification_token_expiry", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    emailVerificationTokenExpiry: Date;

    @Column({ name: "is_active", default: false })
    isActive: boolean;

    @Column({ name: "failed_attempts", default: 0 })
    failedAttempts: number;

    @Column({ name: "login_count", default: 0 })
    loginCount: number;

    @Column({ name: "email_verified", default: false })
    emailVerified: boolean;

    @Column({ name: "email_verification_token", nullable: true })
    emailVerificationToken: string;

    @Column({ name: 'salt', default: '10' })
    salt: string

    @Column({ name: 'token_salt', default: '22' })
    tokenSalt: string

    async addPassword(password: string, pepper: string): Promise<void> {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password + pepper, salt);
        this.password = hashedPassword;
        this.salt = salt;
    }

    async validatePassword(password: string, pepper: string): Promise<boolean> {
        const hash: string = await bcrypt.hash(password + pepper, this.salt);
        return hash === this.password;
    }

    async generateEVToken(): Promise<void> {
        this.tokenSalt = await bcrypt.genSalt(10);
        this.emailVerificationTokenExpiry = new Date(Date.now() + (15 * 60 * 1000));
        this.emailVerificationToken = await bcrypt.hash(this.email, this.tokenSalt);
    }

    async verifyEVToken(token: string): Promise<boolean> {
        const hash: string = await bcrypt.hash(this.email, this.tokenSalt);
        const isValidToken: boolean = hash === token;
        if (isValidToken && this.emailVerificationTokenExpiry > new Date()) {
            this.emailVerificationToken = null
            this.emailVerificationTokenExpiry = null
            this.emailVerified = true
            return true
        } else {
            return false
        }
    }

}