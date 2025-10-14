import { Controller, Get, Patch, Body, Param, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  @AllowAnonymous()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  updateMe(
    @Body() data: { name?: string; image?: string },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.usersService.update(userId, data);
  }

  @Get(':id/stats')
  @AllowAnonymous()
  getStats(@Param('id') id: string) {
    return this.usersService.getStats(id);
  }
}
