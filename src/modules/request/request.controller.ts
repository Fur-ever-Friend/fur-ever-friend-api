import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Get, Body, Param, UseGuards, Patch, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateRequestDto } from './dto/request/create-request.dto';
import { GetRequestResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RequestService } from './request.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Role, User } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaymentInfoDto } from './dto/request/payment-info.dto';
import { Id } from '@/common/global-dtos/id-query.dto';

@ApiTags('requests')
@ApiBearerAuth()
@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) { }

  @ApiOperation({ summary: 'Create a request to an activity' })
  @ApiResponse({ status: 201 })
  @Post()
  @Roles(Role.PETSITTER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createRequest(
    @CurrentUser() user: User,
    @Body() createRequestDto: CreateRequestDto,
  ): Promise<CreateRequestDto> {
    return this.requestService.createRequest(user["petsitter"]["id"], createRequestDto);
  }

  @ApiOperation({ summary: 'Get requests by petsitter' })
  @ApiResponse({ status: 200 })
  @Roles(Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('petsitter')
  async getRequestsByPetsitter(@CurrentUser() user: User): Promise<GetRequestResponseDto[]> {
    return this.requestService.getRequestsByPetsitter(user["petsitter"]["id"]);
  }

  @ApiOperation({ summary: 'Get requests by activity' })
  @ApiResponse({ status: 200 })
  @Get(':activityId')
  async getRequestsByActivity(
    @Param('activityId') activityId: string,
  ): Promise<GetRequestResponseDto[]> {
    return this.requestService.getRequestsByActivity(activityId);
  }

  @ApiOperation({ summary: 'Accept a request with optional payment' })
  @ApiResponse({ status: 200 })
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
