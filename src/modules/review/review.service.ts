import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) { }
  async create(createReviewDto: CreateReviewDto) {
    if (createReviewDto.customerId === createReviewDto.petsitterId) {
      throw new BadRequestException('Customer ID and Petsitter ID cannot be the same.');
    }
    await this.userService.getUserByPetsitterId(createReviewDto.petsitterId);
    await this.userService.getUserByCustomerId(createReviewDto.customerId);

    const review = await this.prismaService.review.create({
      data: createReviewDto,
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                avatar: true,
              },
            }
          },
        },
        petsitter: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                avatar: true,
              },
            }
          },
        },
      }
    });

    await this.userService.updatePetsitterRating(review.petsitter.id);

    return review;
  }

  async findAll() {
    return this.prismaService.review.findMany({
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                avatar: true,
              },
            }
          },
        },
        petsitter: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                avatar: true,
              },
            }
          },
        },
      }
    });
  }

  async findAllByPetsitterId(petsitterId: string) {
    return this.prismaService.review.findMany({
      where: {
        petsitterId,
      },
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                avatar: true,
              },
            }
          },
        },
        petsitter: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                avatar: true,
              },
            }
          },
        }
      }
    });
  }
}
