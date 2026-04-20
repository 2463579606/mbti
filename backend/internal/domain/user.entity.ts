/**
 * User Entity
 * Represents both anonymous and registered users
 */

export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  DELETED = 'deleted',
}

export class User {
  id: number;
  anonymousId: string | null;
  email: string | null;
  nickname: string | null;
  avatar: string | null;

  // Statistics
  testCount: number;
  lastTestAt: Date | null;

  // System fields
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(props?: Partial<User>) {
    if (props) {
      this.id = props.id || 0;
      this.anonymousId = props.anonymousId || null;
      this.email = props.email || null;
      this.nickname = props.nickname || null;
      this.avatar = props.avatar || null;
      this.testCount = props.testCount || 0;
      this.lastTestAt = props.lastTestAt || null;
      this.status = props.status || UserStatus.ACTIVE;
      this.createdAt = props.createdAt || new Date();
      this.updatedAt = props.updatedAt || new Date();
      this.deletedAt = props.deletedAt || null;
    }
  }

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

export type CreateUserDto = {
  anonymousId?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
};

export type UpdateUserDto = Partial<CreateUserDto>;
