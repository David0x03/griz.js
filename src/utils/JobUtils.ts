import { Utils } from '.';
import { GrizClient } from '../GrizClient';

export class JobUtils {
	private client: GrizClient;
	private guildId: string;

	constructor(private utils: Utils) {
		this.client = utils.client;
		this.guildId = this.utils.guildId ?? 'global';
	}

	async schedule(name: string, date: Date | number, data?: any) {
		await this.client.jobHandler.schedule(name, date, this.guildId, data);
	}

	async now<T = any>(name: string, data?: any) {
		return this.client.jobHandler.now<T>(name, this.guildId, data);
	}
}
