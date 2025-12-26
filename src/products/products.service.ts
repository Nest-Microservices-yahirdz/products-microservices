import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto
    })
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    let { page, limit } = paginationDto
    console.log(page)
    page = !page ? 1 : page
    limit = !limit ? 10 : limit

    const totalPages = await this.prisma.product.count({ where: { available: true } })
    const lastPage = Math.ceil(totalPages / limit)

    return {
      data: await this.prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true }
      }),
      meta: {
        page,
        total: totalPages,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({ where: { id, available: true } });
    if (!product) throw new NotFoundException(`Produt with id ${id} not found`)

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id:_, ...data} = updateProductDto;
    await this.findOne(id);
    return await this.prisma.product.update({
      where: { id },
      data
    })
  }

  async remove(id: number) {
    await this.findOne(id)
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        available: false
      }
    })
    return product
  }
}
