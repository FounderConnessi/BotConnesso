import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

@Injectable()
export class UtilsService {

    private readonly httpService = new HttpService;
    private readonly logger = new Logger(UtilsService.name);

    async getCounters(): Promise<{
        serverCount: number;
        founderCount: number;
        userCount: number;
    }> {
        const response = await lastValueFrom(
          this.httpService.get(process.env.API_ENDPOINT),
        );
        return response.data;
    }

    async getUuid(nickname: string) : Promise<string> {
        let uuid = undefined;
        await lastValueFrom(this.httpService.get("https://api.mojang.com/users/profiles/minecraft/" + nickname))
            .then(response => {
                const id : string = response.data.id;
                uuid=id.substring(0,8) + "-" + id.substring(8,12) + "-" + id.substring(12,16) + "-" + id.substring(16,20) + "-" + id.substring(20,id.length);
            }
            ).catch(error => {
                this.logger.warn(error + " (" + nickname + ")");
            }
        );
        return uuid;
    }
}