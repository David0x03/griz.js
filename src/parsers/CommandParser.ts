import { ApplicationCommandType } from 'discord.js';
import {
	BaseCommandData,
	BaseCommandOptions,
	CommandOptions,
	ContextMenuCommandData,
	ContextMenuCommandOptions,
	SlashCommandData,
	SlashCommandOptions
} from '../types/Command';
import { parseCommandOptions } from './CommandOptionParser';

export function parseCommand(options: CommandOptions) {
	if (options.type === ApplicationCommandType.ChatInput)
		return parseSlashCommand(options);
	else return parseContextMenuCommand(options);
}

function parseBaseCommand(options: BaseCommandOptions) {
	const baseCommand: BaseCommandData = {
		name: options.name
	};

	if (options.cooldown !== undefined) {
		const cooldownData = {
			usages: options.cooldown.usages ?? 1,
			interval: options.cooldown.interval * 1000
		};
		baseCommand.cooldown = cooldownData;
	}

	if (options.allowDMs !== undefined) baseCommand.allowDMs = options.allowDMs;

	if (options.devGuildOnly !== undefined)
		baseCommand.devGuildOnly = options.devGuildOnly;

	return baseCommand;
}

function parseSlashCommand(options: SlashCommandOptions) {
	const slashCommand: SlashCommandData = {
		...parseBaseCommand(options),
		type: ApplicationCommandType.ChatInput,
		description: options.description
	};

	const parsedOptions = parseCommandOptions(options.options ?? []);
	slashCommand.options = parsedOptions;

	return slashCommand;
}

function parseContextMenuCommand(options: ContextMenuCommandOptions) {
	const contextMenuCommand: ContextMenuCommandData = {
		...parseBaseCommand(options),
		type: options.type
	};

	return contextMenuCommand;
}
