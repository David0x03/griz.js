import {
	ApplicationCommandAutocompleteOption,
	ApplicationCommandChoicesData,
	ApplicationCommandNonOptionsData,
	ApplicationCommandOptionData,
	ApplicationCommandOptionType,
	ApplicationCommandSubCommandData,
	ApplicationCommandSubGroupData,
	ApplicationCommandType,
	BaseApplicationCommandData,
	BaseApplicationCommandOptionsData,
	ChannelType,
	ChatInputApplicationCommandData,
	CommandOptionChannelResolvableType,
	CommandOptionNumericResolvableType
} from 'discord.js';
import { Command } from '../modules/Command';

//
// Options
//

export type CommandOptions = SlashCommandOptions | ContextMenuCommandOptions;

export interface BaseCommandOptions {
	type: ApplicationCommandType;
	name: string;
	cooldown?: CooldownOptions;
	allowDMs?: boolean;
	devGuildOnly?: boolean;
}

export interface SlashCommandOptions extends BaseCommandOptions {
	type: ApplicationCommandType.ChatInput;
	description: string;
	options?: CommandOptionOptions[];
}

export interface ContextMenuCommandOptions extends BaseCommandOptions {
	type: ApplicationCommandType.User | ApplicationCommandType.Message;
}

export interface CooldownOptions {
	usages?: number;
	interval: number;
}

//
// Data
//

export type CommandData = SlashCommandData | ContextMenuCommandData;

export interface BaseCommandData extends BaseApplicationCommandData {
	cooldown?: CooldownData;
	allowDMs?: boolean;
	devGuildOnly?: boolean;
}

export interface SlashCommandData
	extends ChatInputApplicationCommandData,
		BaseCommandData {
	type: ApplicationCommandType.ChatInput;
	options?: CommandOptionData[];
}

export interface ContextMenuCommandData extends BaseCommandData {
	type: ApplicationCommandType.User | ApplicationCommandType.Message;
}

export interface CooldownData {
	usages: number;
	interval: number;
}

//
// OptionOptions
//

export type CommandOptionOptions =
	| SubCommandGroupOptions
	| ApplicationCommandNonOptionsData
	| ChannelOptionData
	| ApplicationCommandChoicesData
	| ApplicationCommandAutocompleteOption
	| NumericOptionData
	| SubCommandOptions;

export type SubCommandOptions = { new (): Command };

export interface SubCommandGroupOptions
	extends Omit<BaseApplicationCommandOptionsData, 'required'> {
	type: ApplicationCommandOptionType.SubcommandGroup;
	options?: SubCommandOptions[];
}

interface NumericOptionData extends ApplicationCommandChoicesData {
	type: CommandOptionNumericResolvableType;
	min?: number;
	max?: number;
}

interface ChannelOptionData extends BaseApplicationCommandOptionsData {
	type: CommandOptionChannelResolvableType;
	channels?: ChannelType[];
}

//
// OptionData
//

export type CommandOptionData =
	| Exclude<
			ApplicationCommandOptionData,
			ApplicationCommandSubCommandData | ApplicationCommandSubGroupData
	  >
	| SubCommandData
	| SubCommandGroupData;

export interface SubCommandData extends ApplicationCommandSubCommandData {
	command: Command;
}

export interface SubCommandGroupData extends ApplicationCommandSubGroupData {
	options?: SubCommandData[];
}
