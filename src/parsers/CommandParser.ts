import {
	ApplicationCommandData,
	ApplicationCommandType,
	ChatInputApplicationCommandData,
	MessageApplicationCommandData,
	UserApplicationCommandData
} from 'discord.js';
import { CommandData } from '../types';
import { parseCommandOptions } from './CommandOptionParser';

export function parseCommand(options: CommandData) {
	switch (options.type) {
		case ApplicationCommandType.ChatInput:
			return parseSlashCommand(options);
		case ApplicationCommandType.User:
		case ApplicationCommandType.Message:
			return parseContextMenuCommand(options);
		default:
			return parseBaseCommand(options);
	}
}

function parseBaseCommand(options: CommandData) {
	if (options.cooldown)
		options.cooldown = {
			usages: options.cooldown.usages ?? 1,
			interval: options.cooldown.interval * 1000
		};

	return options;
}

function parseSlashCommand(options: ChatInputApplicationCommandData) {
	const slashCommand = {
		...parseBaseCommand(options),
		description: options.description,
		options: parseCommandOptions(options.options ?? [])
	};

	return slashCommand;
}

function parseContextMenuCommand(
	options: UserApplicationCommandData | MessageApplicationCommandData
) {
	const contextMenuCommand = { ...parseBaseCommand(options) };

	return contextMenuCommand;
}
