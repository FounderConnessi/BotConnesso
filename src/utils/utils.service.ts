import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

@Injectable()
export class UtilsService {

    private readonly httpService = new HttpService;
    private readonly logger = new Logger(UtilsService.name);

    async getOnlinePlayers(address: String): Promise<number> {
        let utenti = 0;
        await lastValueFrom(this.httpService.get("https://api.mcsrvstat.us/2/" + address))
            .then(response => {
                if (response.data.online)
                    utenti= response.data.players.online;
            }
            ).catch(error => {
                this.logger.warn(error + " (" + address + ")");
            });
        return utenti;
    }

    async getUtentiConnessi(): Promise<number> {
        let utenti = 0;
        const serverList = process.env.SERVER.split(';');
        for (const server of serverList) {
            utenti += await this.getOnlinePlayers(server);
        }
        return utenti;
    }

}