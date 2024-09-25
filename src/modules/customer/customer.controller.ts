import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll() {
    return this.customerService.getCustomers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.getCustomerById(id);
  }

}
