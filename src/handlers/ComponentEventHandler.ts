import {
	Events,
	MessageComponentInteraction,
	ModalSubmitInteraction
} from 'discord.js';
import { GrizClient } from '../GrizClient';
import { ComponentEvent } from '../modules';
import { Utils } from '../utils';
import { BaseHandler } from './BaseHandler';

export class ComponentEventHandler extends BaseHandler {
	private componentEvents: ComponentEvent[] = [];

	constructor(client: GrizClient) {
		super(client);

		this.componentEvents = this.getModules<ComponentEvent>('comp');

		this.client.on(Events.InteractionCreate, (interaction) => {
			if (interaction.isMessageComponent() || interaction.isModalSubmit())
				this.handleComponentEvent(interaction, this.componentEvents);
		});
	}

	private async handleComponentEvent(
		interaction: MessageComponentInteraction | ModalSubmitInteraction,
		componentEvents: ComponentEvent[]
	) {
		componentEvents.forEach(async (comp) => {
			const { customId } = comp.data;
			const utils = await Utils.get(interaction.guildId);

			if (!interaction.customId.match(customId)) return;

			if (interaction.isButton()) return comp.run(utils, interaction);

			if (interaction.isSelectMenu())
				return comp.run(utils, interaction, interaction.values);

			if (interaction.isModalSubmit()) {
				const args: { [key in string]: string } = {};
				interaction.fields.fields.map(
					(field) => (args[field.customId] = field.value)
				);
				return comp.run(utils, interaction, args);
			}
		});
	}
}
