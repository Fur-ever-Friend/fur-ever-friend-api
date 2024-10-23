import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Get, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateRequestDto } from './dto/request/create-request.dto';
import { GetRequestResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RequestService } from './request.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Role, User } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('requests')
@ApiBearerAuth()
@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @ApiOperation({ summary: 'Create a request to join an activity' })
  @ApiResponse({ status: 201 })
  @Post()
  @Roles(Role.PETSITTER)
  async createRequest(
    @CurrentUser() user: User,
    @Body() createRequestDto: CreateRequestDto,
  ): Promise<CreateRequestDto> {
    return this.requestService.createRequest(user.id, createRequestDto);
  }

  @ApiOperation({ summary: 'Get requests by petsitter' })
  @ApiResponse({ status: 200 })
  @Get('petsitter')
  async getRequestsByPetsitter(@CurrentUser() user: User): Promise<GetRequestResponseDto[]> {
    return this.requestService.getRequestsByPetsitter(user.id);
  }

  @ApiOperation({ summary: 'Get requests by activity' })
  @ApiResponse({ status: 200 })
  @Get(':activityId')
  async getRequestsByActivity(
    @Param('activityId') activityId: string,
  ): Promise<GetRequestResponseDto[]> {
    return this.requestService.getRequestsByActivity(activityId);
  }

  @ApiOperation({ summary: 'Accept a request' })
  @ApiResponse({ status: 200 })
  @Patch(':requestId/accept')
  @Roles(Role.CUSTOMER)
  async acceptRequest(@CurrentUser() user: User, @Param('requestId') requestId: string) {
    return this.requestService.acceptRequest(user.id, requestId);
  }
}
