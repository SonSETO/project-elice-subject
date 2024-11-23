import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';

import { IImagesService } from './interface/images.service.interface';

@Controller('images')
export class ImagesController {
  constructor(
    @Inject('IImagesService')
    private readonly imagesService: IImagesService,
  ) {}
}
