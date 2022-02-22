import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	AutocompleteInteraction,
	CommandInteraction
} from 'discord.js';
import { Command } from '../../modules';
import { parseCommandArgs } from '../../parsers';
import { SubCommandData, SubCommandGroupData } from '../../types/Command';
import { Utils } from '../../utils';
import { isOnCooldown } from './CooldownHandler';

export async function handleCommandInteraction(
	interaction: CommandInteraction | AutocompleteInteraction,
	commands: Map<string, Command>
) {
	let command = commands.get(interaction.commandId);
	if (!command) return;

	command = getCommand(interaction, command);
	if (!interaction.inGuild() && !command.data.allowDMs) return;

	const utils = await Utils.get(interaction.guildId);

	if (interaction.isAutocomplete()) {
		return handleAutocomplete(interaction, command, utils);
	}

	if (await isOnCooldown(interaction, command, utils)) return;
	else return handleCommand(interaction, command, utils);
}

function handleCommand(
	interaction: CommandInteraction,
	command: Command,
	utils: Utils
) {
	const args = parseCommandArgs(interaction, command);
	command.run(utils, interaction, args);
}

async function handleAutocomplete(
	interaction: AutocompleteInteraction,
	command: Command,
	utils: Utils
) {
	const focused = interaction.options.getFocused(true);
	const choices = await command.onAutocomplete(utils, interaction, focused);

	if (!interaction.responded && choices) interaction.respond(choices);
}

function getCommand(
	interaction: CommandInteraction | AutocompleteInteraction,
	command: Command
) {
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
			) as SubCommandGroupData;

			const subCmd = group.options!.find(
				({ type, name }) =>
					type === ApplicationCommandOptionType.Subcommand &&
					name === subCmdName
			) as SubCommandData;
			return subCmd.command;
		}

		if (subCmdName) {
			const subCmd = command.data.options!.find(
				({ type, name }) =>
					type === ApplicationCommandOptionType.Subcommand &&
					name === subCmdName
			) as SubCommandData;
			return subCmd.command;
		}
	}
	return command;
}
