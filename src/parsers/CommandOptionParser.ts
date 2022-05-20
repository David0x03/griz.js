import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../modules';
import { CommandOptionData } from '../types';

export function parseCommandOptions(options: CommandOptionData[]): any {
	return options.map((option) => {
		if ('prototype' in option) return parseSubCommand(option);

		if (option.type === ApplicationCommandOptionType.SubcommandGroup)
			return { ...option, options: parseCommandOptions(option.options ?? []) };

		return option;
	});
}

function parseSubCommand(SubCommand: { new (): Command }) {
	const subCommand = new SubCommand();

	return {
		...subCommand.data,
		type: ApplicationCommandOptionType.Subcommand,
		command: subCommand
	};
}
