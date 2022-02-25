import { Interaction } from 'discord.js';
import { Utils } from '../utils';

interface ComponentEventOptions {
	customId: string | RegExp;
}

interface ComponentEventData {
	customId: string | RegExp;
}

export abstract class ComponentEvent {
	data: ComponentEventData;

	constructor(options: ComponentEventOptions) {
		this.data = options;
	}

	run(utils: Utils, interaction: Interaction & { customId: string }): any {}
}
