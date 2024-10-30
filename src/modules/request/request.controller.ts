import { Controller, Post, Get, Body, Param, UseGuards, Patch, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateRequestDto } from './dto/request/create-request.dto';
import { GetRequestResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RequestService } from './request.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Role, User } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';
import { Id } from '@/common/global-dtos/id-query.dto';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestController {
  constructor(
    private readonly requestService: RequestService
  ) { }

  @Post()
  @Roles(Role.PETSITTER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createRequest(
    @CurrentUser() user: User,
    @Body() createRequestDto: CreateRequestDto,
  ): Promise<CreateRequestDto> {
    return this.requestService.createRequest(user["petsitter"]["id"], createRequestDto);
  }

  @Get('petsitter')
  @Roles(Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getRequestsByPetsitter(@CurrentUser() user: User) {
    const response = await this.requestService.getRequestsByPetsitter(user["petsitter"]["id"]);
    return {
      statusCode: HttpStatus.OK,
      message: 'Requests fetched successfully',
      data: response,
    }
  }

  @Roles(Role.CUSTOMER, Role.ADMIN, Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':activityId')
  async getRequestsByActivity(
    @Param('activityId') activityId: string,
  ): Promise<GetRequestResponseDto[]> {
    return this.requestService.getRequestsByActivity(activityId);
  }

  @Patch(':id/accept')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async acceptRequest(
    @CurrentUser() user: User,
    @Param() { id }: Id,
  ) {
    const result = await this.requestService.acceptRequest(id, user["customer"]["id"]);
    return {
      statusCode: HttpStatus.OK,
      message: 'Request accepted successfully.',
      data: result,
    };
  }

  @Roles(Role.CUSTOMER, Role.PETSITTER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllRequests(): Promise<GetRequestResponseDto[]> {
    return this.requestService.getAllRequests();
  }
}
