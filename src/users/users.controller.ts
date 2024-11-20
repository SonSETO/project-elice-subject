import { Controller, Get, Param, Inject } from '@nestjs/common';
import { IUserService } from './interface/user.interface';

@Controller('users')
export class UserController {
  constructor(
    @Inject('IUserService') private readonly userService: IUserService,
  ) {}

  @Get()
  async findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userService.findById(id);
  }

  @Get(':id/orders')
  async findUserOrders(@Param('id') id: number) {
    return this.userService.findUserOrders(id);
  }

  @Get(':id/products')
  async findUserProducts(@Param('id') id: number) {
    return this.userService.findUserProducts(id);
  }
}
