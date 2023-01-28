import { Module } from "@nestjs/common";
import { UtilsModule } from "src/utils/utils.module";
import { BanService } from "./ban.service";

@Module({
  providers: [BanService],
  exports: [BanService],
  imports: [UtilsModule]
})
export class BanModule { }
