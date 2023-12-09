import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddFounderDto } from "./dto/add.dto";

@Injectable()
export class FoundersService {

  constructor(
    private readonly prisma: PrismaService,
  ) {
    this.get().then(founders => {
      founders.forEach(founder => {
        this.cache[founder.id] = true;
      });
    });
  }

  cache: { [key: string]: boolean } = {};

  async get() {
    return await this.prisma.founder.findMany();
  }

  async addReferent(dto: AddFounderDto) {
    this.cache[dto.id] = true;
    return await this.prisma.founder.create({
      data: {
        id: dto.id,
        username: dto.username
      }
    });
  }

  async removeReferent(id: string) {
    this.cache[id] = false;
    return await this.prisma.founder.delete({
      where: {
        id,
      }
    });
  }

  async isReferent(id: string): Promise<boolean> {
    const cachedValue = this.cache[id];
    if (cachedValue != null)
      return cachedValue as boolean;
    const ref = await this.prisma.founder.findFirst({
      where: {
        id
      }
    });
    const isReferent = ref != undefined;
    this.cache[id] = isReferent;
    return isReferent;
  }

}