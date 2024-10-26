import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Invitation, Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Id } from '@/common/global-dtos/id-query.dto';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) { }

  @Roles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInvitationDto: CreateInvitationDto) {
    const result = await this.invitationService.create(createInvitationDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Invitation created successfully.",
      data: result,
    }
  }

  @Roles(Role.PETSITTER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@CurrentUser() user: User) {
    let result: Partial<Invitation>[] = [];
    if (user.role === Role.ADMIN) result = await this.invitationService.findAll();
    else if (user.role === Role.CUSTOMER) result = await this.invitationService.findAllByPetsitter(user["petsitter"]["id"]);
    return {
      statusCode: HttpStatus.OK,
      message: "Invitations retrieved successfully.",
      data: result,
    }
  }

  @Roles(Role.PETSITTER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') { id }: Id) {
    const result = await this.invitationService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Invitation retrieved successfully.",
      data: result,
    }
  }
}
