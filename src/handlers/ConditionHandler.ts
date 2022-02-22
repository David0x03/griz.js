import { Events } from 'discord.js';
import { GrizClient } from '../GrizClient';
import { Condition } from '../modules';
import { Utils } from '../utils';
import { BaseHandler } from './BaseHandler';

export class ConditionHandler extends BaseHandler {
	constructor(client: GrizClient) {
		super(client);
		this.init();
	}

	private init() {
		const conditions = this.getModules<Condition>('cond');

		this.client.on(Events.MessageCreate, async (message) => {
			const utils = await Utils.get(message.guildId);

			conditions.forEach(async (condition) => {
				const { allowDMs, allowBots } = condition.data;

				if (!message.guildId && !allowDMs) return;
				if (message.author.bot && !allowBots) return;

				const result = await condition.check(utils, message);
				if (result) condition.run(utils, message, result);
			});
		});
	}
}
