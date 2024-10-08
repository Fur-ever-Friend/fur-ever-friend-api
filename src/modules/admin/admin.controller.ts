import { Controller, Get, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AccountState } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // @Get()
  // getAdmins() {
  //   return this.adminService.getAdmins();
  // }

  // @Get(':id')
  // getAdminById(@Param('id') id: string) {
  //   return this.adminService.getAdminById(id);
  // }

  @Get(':id/set-account-state/:state')
  setAccountState(@Param('id') id: string, @Param('state') state: AccountState) {
    return this.adminService.setAccountState(id, state);
  }

}
