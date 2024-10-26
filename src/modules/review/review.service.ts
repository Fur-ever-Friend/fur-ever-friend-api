import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createReviewDto: CreateReviewDto) {
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
