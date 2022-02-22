import { Message } from 'discord.js';
import { Utils } from '../utils';

interface ConditionOptions {
	allowBots?: boolean;
	allowDMs?: boolean;
}

interface ConditionData {
	allowBots?: boolean;
	allowDMs?: boolean;
}

export abstract class Condition {
	data: ConditionData;

	constructor(options: ConditionOptions = {}) {
		this.data = options;
	}

	check(utils: Utils, message: Message): any {
		return false;
	}

	run(utils: Utils, message: Message, result: any): any {}
}
