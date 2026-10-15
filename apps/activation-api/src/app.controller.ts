import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';

import { AppService } from './app.service.js';

import type { CreateActivationDto } from './dto/create-activation.dto.js';


@Controller('activations')
export class AppController {

  constructor(
    private readonly appService: AppService,
  ) {}


  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  createActivation(
    @Body()
    dto: CreateActivationDto,
  ) {

    return this.appService
      .createActivation(dto);
  }


  @Get(':id')
  getActivation(
    @Param('id')
    id: string,
  ) {

    return this.appService
      .getActivation(id);
  }
}