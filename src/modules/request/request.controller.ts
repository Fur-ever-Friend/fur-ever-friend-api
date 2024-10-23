import { Controller, Post, Get, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestService } from './request.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateRequestDto } from './dto/create-request.dto';
import { User } from '@prisma/client';

@ApiTags('requests')
@ApiBearerAuth()
@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @ApiOperation({ summary: 'Create a request to join an activity' })
  @ApiResponse({ status: 201 })
  @Post()
  async createRequest(
    @CurrentUser() user: User,
    @Body() createRequestDto: CreateRequestDto,
  ): Promise<CreateRequestDto> {
    return this.requestService.createRequest(user.id, createRequestDto);
  }

  @ApiOperation({ summary: 'Get requests by petsitter' })
  @ApiResponse({ status: 200 })
  @Get('petsitter')
  async getRequestsByPetsitter(@CurrentUser() user: User) {
    return this.requestService.getRequestsByPetsitter(user.id);
  }

  @ApiOperation({ summary: 'Get requests by activity' })
  @ApiResponse({ status: 200 })
  @Get(':activityId')
  async getRequestsByActivity(@Param('activityId') activityId: string) {
    return this.requestService.getRequestsByActivity(activityId);
  }
  
  @ApiOperation({ summary: 'Accept a request and assign the petsitter to the activity' })
  @ApiResponse({ status: 200})
  @Patch(':requestId/accept')
  async acceptRequest(
    @CurrentUser() user: User,
    @Param('requestId') requestId: string,
  ) {
    return this.requestService.acceptRequest(user.id, requestId);
  }
}
