import {
	ApplicationCommandOptionChoice,
	AutocompleteInteraction,
	Colors,
	CommandInteraction
} from 'discord.js';
import { parseCommand } from '../parsers';
import { CommandData, CommandOptions } from '../types/Command';
import { Utils } from '../utils';

export abstract class Command {
	readonly data: CommandData;

	constructor(options: CommandOptions) {
		this.data = parseCommand(options);
	}

	run(
		utils: Utils,
		interaction: CommandInteraction,
		args: { [key in string]: any }
	): any {}

	onAutocomplete(
		utils: Utils,
		interaction: AutocompleteInteraction,
		choice: ApplicationCommandOptionChoice
	): ApplicationCommandOptionChoice[] | any {}

	onCooldown(utils: Utils, interaction: CommandInteraction, endsAt: Date): any {
		const formattedTime = `<t:${(endsAt.getTime() / 1000) | 0}:R>`;

		return utils.msg.send(interaction, {
			title: '🕒 Cooldown',
			description: `You can use this command ${formattedTime} again`,
			color: Colors.Red,
			ephemeral: true
		});
	}
}
