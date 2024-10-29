import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityState } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) { }
  async create(customerId: string, createReviewDto: CreateReviewDto) {
    const activity = await this.activityService.getActivityById(createReviewDto.activityId);
    if (!activity) {
      throw new BadRequestException('Activity not found');
    }

    if (activity["customer"]["id"] !== customerId) {
      throw new BadRequestException('You are not allowed to review this activity');
    }

    if (activity["petsitter"]["id"] !== createReviewDto.petsitterId) {
      throw new BadRequestException('Invalid petsitter');
    }

    if (activity.state !== ActivityState.COMPLETED) {
      throw new BadRequestException('Activity is not completed yet');
    }

    if (activity["review"]) {
      throw new BadRequestException('Review already exists');
    }

    const review = await this.prismaService.review.create({
      data: {
        rating: createReviewDto.rating,
        content: createReviewDto.content,
        customerId,
        petsitterId: createReviewDto.petsitterId,
        activityId: createReviewDto.activityId,
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
        },
        activityId: true,
      }
    });
  }
}
