export class User {
  readonly email: string;
  readonly id?: string;
  readonly emailVerified?: boolean; // 新增字段

  constructor(email: string, id?: string, emailVerified?: boolean) {
    this.email = email;
    this.id = id;
    this.emailVerified = emailVerified;
  }
}