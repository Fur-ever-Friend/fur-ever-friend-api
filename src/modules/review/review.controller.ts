import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Id } from '@/common/global-dtos/id-query.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Review, Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReviewDto: CreateReviewDto) {
    const result = await this.reviewService.create(createReviewDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Review created successfully.',
      data: result,
    }
  }

  @Roles(Role.ADMIN, Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@CurrentUser() user: User) {
    let result: Partial<Review>[] = [];
    if (user.role === Role.PETSITTER) {
      result = await this.reviewService.findAllByPetsitterId(user.id);
    } else if (user.role === Role.ADMIN) {
      result = await this.reviewService.findAll();
    } else {
      throw new BadRequestException('Invalid role');
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Reviews fetched successfully.',
      data: result,
    }
  }

  @Roles(Role.ADMIN, Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('petsitter/:id')
  async findAllByPetsitterId(@Param() { id }: Id) {
    const result = await this.reviewService.findAllByPetsitterId(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reviews fetched successfully.',
      data: result,
    }
  }

}
