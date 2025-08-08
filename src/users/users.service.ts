import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(private dataSource: DataSource) {}

  async findUserIdByEmail(email: string): Promise<number | null> {
    const result: { id: number }[] = await this.dataSource.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    if (result.length === 0) return null;
    return result[0].id;
  }
}
