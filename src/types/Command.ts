import {
	ApplicationCommandData,
	ApplicationCommandOptionData
} from 'discord.js';
import { Command } from '../modules/Command';

export interface CooldownData {
	usages?: number;
	interval: number;
}

export interface BaseCommandData {
	cooldown?: CooldownData;
	allowDMs?: boolean;
	devGuildOnly?: boolean;
}

export type CommandOptionData =
	| ApplicationCommandOptionData
	| { new (): Command };

export type CommandData = ApplicationCommandData &
	BaseCommandData & { options?: CommandOptionData[] };
