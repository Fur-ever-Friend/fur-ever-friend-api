import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Customer } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private readonly prismaService: PrismaService) { }

  async getCustomers(): Promise<Customer[]> {
    return this.prismaService.customer.findMany({
      include: {
        user: true,
      }
    });
  }

  async getCustomerById(id: string): Promise<Customer> {
    return this.prismaService.customer.findUnique({
      where: {
        id: id
      },
      include: {
        user: true,
      }
    });
  }

  async getCustomerByUserId(userId: string): Promise<Customer> {
    return this.prismaService.customer.findFirst({
      where: {
        userId: userId
      },
      include: {
        user: true,
      }
    });
  }

}
