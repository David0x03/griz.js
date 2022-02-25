import { Events, Interaction } from 'discord.js';
import { GrizClient } from '../../GrizClient';
import { Command, ComponentEvent } from '../../modules';
import { BaseHandler } from '../BaseHandler';
import { handleCommandInteraction } from './CommandInteractionHandler';
import { handleComponentEvent } from './ComponentHandler';

export class InteractionHandler extends BaseHandler {
	private commands = new Map<string, Command>();
	private componentEvents: ComponentEvent[] = [];

	constructor(client: GrizClient) {
		super(client);

		this.commands = this.client.commandHandler.commands;
		this.componentEvents = this.getModules<ComponentEvent>('comp');

		this.client.on(Events.InteractionCreate, (interaction) =>
			this.handleInteraction(interaction)
		);
	}

	private handleInteraction(interaction: Interaction) {
		if (interaction.isCommand() || interaction.isAutocomplete()) {
			handleCommandInteraction(interaction, this.commands);
		}

		if (interaction.isMessageComponent()) {
			handleComponentEvent(interaction, this.componentEvents);
		}
	}
}
