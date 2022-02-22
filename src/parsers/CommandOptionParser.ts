import { ApplicationCommandOptionType } from 'discord.js';
import {
	CommandOptionData,
	CommandOptionOptions,
	SubCommandData,
	SubCommandGroupOptions,
	SubCommandOptions
} from '../types/Command';

type SimpleOptions<T> = Exclude<T, SubCommandGroupOptions | SubCommandOptions>;

export function parseCommandOptions(
	options: CommandOptionOptions[]
): CommandOptionData[] {
	return options.map((option) => {
		if ('prototype' in option) {
			return parseSubCommandOption(option);
		}

		if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
			return {
				...option,
				options: option.options?.map(parseSubCommandOption) ?? []
			};
		}

		return parseSimpleOption(option);
	});
}

function parseSubCommandOption(SubCommand: SubCommandOptions) {
	const subCommand = new SubCommand();
	return {
		...subCommand.data,
		type: ApplicationCommandOptionType.Subcommand,
		command: subCommand
	} as SubCommandData;
}

function parseSimpleOption(
	option: SimpleOptions<CommandOptionOptions>
): SimpleOptions<CommandOptionData> {
	const optionData: any = {};

	optionData.type = option.type;
	optionData.name = option.name;
	optionData.description = option.description;

	if (optionData.required !== undefined) optionData.required = option.required;

	if ('choices' in option && option.choices !== undefined)
		optionData.choices = option.choices;

	if ('autocomplete' in option && option.autocomplete !== undefined)
		optionData.autocomplete = option.autocomplete;

	if ('min' in option && option.min !== undefined)
		optionData.minValue = option.min;
	if ('max' in option && option.max !== undefined)
		optionData.maxValue = option.max;

	if ('channels' in option && option.channels !== undefined)
		optionData.channelTypes = option.channels;

	return optionData;
}
