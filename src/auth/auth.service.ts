import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(@Inject('BETTER_AUTH') private auth: any) {}

  // Example: Use this.auth for authentication operations
}
