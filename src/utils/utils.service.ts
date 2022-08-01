import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

@Injectable()
export class UtilsService {

    private readonly httpService = new HttpService;
    private readonly logger = new Logger(UtilsService.name);

    /**
     * 
     * @param address 
     * @returns 
     */
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

    /**
     * 
     * @returns 
     */
    async getUtentiConnessi(): Promise<number> {
        let utenti = 0;
        const serverList = process.env.SERVER.split(';');
        for (const server of serverList) {
            utenti += await this.getOnlinePlayers(server);
        }
        return utenti;
    }

    /**
     * 
     * @param nickname 
     * @returns 
     */
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