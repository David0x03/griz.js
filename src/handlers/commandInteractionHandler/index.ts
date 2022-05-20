import {
	ApplicationCommandOptionType,
	ApplicationCommandSubGroupData,
	ApplicationCommandType,
	AutocompleteInteraction,
	CommandInteraction,
	Events
} from 'discord.js';
import { GrizClient } from '../../GrizClient';
import { Command } from '../../modules';
import { parseCommandArgs } from '../../parsers';
import { Utils } from '../../utils';
import { BaseHandler } from '../BaseHandler';
import { isOnCooldown } from './cooldownUtils';

export class CommandInteractionHandler extends BaseHandler {
	constructor(client: GrizClient) {
		super(client);

		const commands = this.client.commandHandler.commands;

		this.client.on(Events.InteractionCreate, (interaction) => {
			if (interaction.isCommand() || interaction.isAutocomplete())
				this.handleCommandInteraction(interaction, commands);
		});
	}

	private async handleCommandInteraction(
		interaction: CommandInteraction | AutocompleteInteraction,
		commands: Map<string, Command>
	) {
		let command = commands.get(interaction.commandId);
		if (!command) return;

		command = this.getCommand(interaction, command);
		if (!interaction.inGuild() && !command.data.allowDMs) return;

		const utils = await Utils.get(interaction.guildId);

		if (interaction.isAutocomplete()) {
			return this.handleAutocomplete(interaction, command, utils);
		}

		if (await isOnCooldown(interaction, command, utils)) return;
		else return this.handleCommand(interaction, command, utils);
	}

	private handleCommand(
		interaction: CommandInteraction,
		command: Command,
		utils: Utils
	) {
		const args = parseCommandArgs(interaction, command);
		command.run(utils, interaction, args);
	}

	private async handleAutocomplete(
		interaction: AutocompleteInteraction,
		command: Command,
		utils: Utils
	) {
		const focused = interaction.options.getFocused(true);
		const choices = await command.onAutocomplete(utils, interaction, focused);

		if (!interaction.responded && choices) interaction.respond(choices);
	}

	private getCommand(
		interaction: CommandInteraction | AutocompleteInteraction,
		command: Command
	): Command {
		if (
			(interaction.isChatInputCommand() || interaction.isAutocomplete()) &&
			command.data.type === ApplicationCommandType.ChatInput
		) {
			const groupName = interaction.options.getSubcommandGroup(false);
			const subCmdName = interaction.options.getSubcommand(false);

			if (groupName) {
				const group = command.data.options!.find(
					({ type, name }) =>
						type === ApplicationCommandOptionType.SubcommandGroup &&
						name === groupName
				) as ApplicationCommandSubGroupData;

				const subCmd = group.options!.find(
					({ type, name }) =>
						type === ApplicationCommandOptionType.Subcommand &&
						name === subCmdName
				);

				return (subCmd as any)?.command || command;
			}

			if (subCmdName) {
				const subCmd = command.data.options!.find(
					({ type, name }) =>
						type === ApplicationCommandOptionType.Subcommand &&
						name === subCmdName
				);
				return (subCmd as any)?.command || command;
			}
		}
		return command;
	}
}
