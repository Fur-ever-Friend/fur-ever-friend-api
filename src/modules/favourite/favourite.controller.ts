import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Favourite, Role, User } from '@prisma/client';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Id } from '@/common/global-dtos/id-query.dto';

@Controller('favourites')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) { }

  @Roles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFavouriteDto: CreateFavouriteDto) {
    const result = await this.favouriteService.create(createFavouriteDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Favourite created successfully.",
      data: result,
    }
  }

  @Roles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@CurrentUser() user: User) {
    let result: Partial<Favourite>[] = [];
    if (user.role === Role.ADMIN) result = await this.favouriteService.findAll();
    else if (user.role === Role.CUSTOMER) result = await this.favouriteService.findAllByCustomer(user["customer"]["id"]);
    return {
      statusCode: HttpStatus.OK,
      message: "Favourites retrieved successfully.",
      data: result,
    }
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param() { id }: Id, @CurrentUser() user: User) {
    await this.favouriteService.remove(id, user["customer"]["id"]);
    return {
      statusCode: HttpStatus.OK,
      message: "Favourite removed successfully.",
    }
  }
}
