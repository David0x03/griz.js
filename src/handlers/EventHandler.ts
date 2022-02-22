import { Collection, Events, Guild } from 'discord.js';
import { GrizClient } from '../GrizClient';
import { Event } from '../modules';
import { Utils } from '../utils';
import { BaseHandler } from './BaseHandler';

export class EventHandler extends BaseHandler {
	constructor(client: GrizClient) {
		super(client);
		this.init();

		console.log(`[Bot] connected as '${this.client.user?.username}'`);
		this.client.emit(Events.ClientReady as string);
	}

	private init() {
		const events = this.getModules<Event>('event');

		events.forEach((event) => {
			this.client.on(event.data.event, async (...args: any[]) => {
				args = await this.fetchPartials(args);
				const utils = await this.getUtils(args);
				event.run(utils, ...args);
			});
		});
	}

	private async getUtils(args: any[]) {
		let guildId, utils: Utils;

		for (const arg of args) {
			if (arg instanceof Collection) guildId = arg.first();
			guildId = arg.guildId ?? arg.guild?.id ?? arg.message?.guildId;
			if (arg instanceof Guild) guildId = arg.id;

			if (typeof guildId !== 'string') continue;

			utils = await Utils.get(guildId);
			break;
		}

		utils ??= await Utils.get();
		return utils;
	}

	private async fetchPartials(args: any[]) {
		return Promise.all(
			args.map(async (arg) =>
				arg.partial ? await arg.fetch().catch(() => arg) : arg
			)
		);
	}
}
