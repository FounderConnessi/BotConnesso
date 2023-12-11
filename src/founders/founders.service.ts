import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddFounderDto } from "./dto/add.dto";
import { FounderProps } from "./dto/founder.props";

@Injectable()
export class FoundersService {

  cache: { [key: string]: FounderProps } = {};

  constructor(
    private readonly prisma: PrismaService
  ) {
    this.get().then(founders => {
      founders.forEach(founder => {
        this.cache[founder.id] = { referent: true, banRole: founder.banRole };
      });
    });
  }

  async get() {
    return await this.prisma.founder.findMany();
  }

  private async getFounder(id: string) {
    return await this.prisma.founder.findFirst({
      where: {
        id
      }
    });
  }

  async addReferent(dto: AddFounderDto) {
    const founder = await this.getFounder(dto.id);
    this.cache[dto.id] = { referent: true, banRole: dto.banRole };

    if(founder != null)
      return this.setBlacklist(dto.id, dto.banRole);

    return await this.prisma.founder.create({
      data: {
        id: dto.id,
        username: dto.username,
        banRole: dto.banRole
      }
    });
  }

  async removeReferent(id: string) {
    this.cache[id] = { referent: false };

    return await this.prisma.founder.delete({
      where: {
        id
      }
    });
  }

  async getFounderProps(id: string): Promise<FounderProps> {
    const cachedValue = this.cache[id];

    if (cachedValue != null)
      return cachedValue;

    const ref = await this.prisma.founder.findFirst({
      where: {
        id
      }
    });
    const founderProperties = { referent: ref != undefined, blacklist: ref?.banRole == true };
    this.cache[id] = founderProperties;

    return founderProperties;
  }

  async setBlacklist(id: string, banRole: boolean) {
    this.cache[id] = { referent: true, banRole: banRole };
    return await this.prisma.founder.update({
      where: {
        id
      },
      data: {
        banRole
      }
    });
  }

  async canVote(id: string) {
    const props = await this.getFounderProps(id);
    return props.referent && props.banRole;
  }

}