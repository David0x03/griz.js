import { Events, Interaction } from 'discord.js';
import { GrizClient } from '../../GrizClient';
import { BaseHandler } from '../BaseHandler';
import { handleCommandInteraction } from './CommandInteractionHandler';

export class InteractionHandler extends BaseHandler {
	constructor(client: GrizClient) {
		super(client);

		this.client.on(Events.InteractionCreate, (interaction) =>
			this.handleInteraction(interaction)
		);
	}

	private handleInteraction(interaction: Interaction) {
		if (interaction.isCommand() || interaction.isAutocomplete()) {
			const commands = this.client.commandHandler.commands;
			return handleCommandInteraction(interaction, commands);
		}
	}
}
