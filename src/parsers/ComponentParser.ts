import {
	APIButtonComponent,
	APIMessageComponentEmoji,
	APISelectMenuComponent,
	APISelectMenuOption
} from 'discord-api-types/v10';
import {
	ButtonStyle,
	ComponentType,
	EmojiIdentifierResolvable,
	Util
} from 'discord.js';
import { nanoid } from 'nanoid';
import {
	ActionRowData,
	ButtonOptions,
	MessageComponentOptions,
	SelectMenuOptionOptions,
	SelectMenuOptions
} from '../types/Components';

export function parseMessageComponents(
	componentOptions: MessageComponentOptions | MessageComponentOptions[]
) {
	if (componentOptions.length === 0) return [];

	if (Array.isArray(componentOptions[0]))
		return componentOptions.map((actionRow) =>
			parseMessageActionRow(actionRow as MessageComponentOptions)
		);
	else
		return [parseMessageActionRow(componentOptions as MessageComponentOptions)];
}

function parseMessageActionRow(actionRowOptions: MessageComponentOptions) {
	const components = actionRowOptions.map((component) => {
		if ('options' in component) return parseSelectMenu(component);
		return parseButton(component);
	});

	return { type: ComponentType.ActionRow, components } as ActionRowData;
}

function parseButton(buttonOptions: ButtonOptions) {
	if (buttonOptions.url)
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			url: buttonOptions.url,
			label: buttonOptions.label,
			emoji: parseEmoji(buttonOptions.emoji)
		} as APIButtonComponent;

	const button: APIButtonComponent = {
		type: ComponentType.Button,
		style: (buttonOptions.style as any) ?? ButtonStyle.Primary,
		custom_id: buttonOptions.customId ?? nanoid(10),
		label: buttonOptions.label,
		emoji: parseEmoji(buttonOptions.emoji),
		disabled: buttonOptions.disabled
	};

	return { ...button, onAction: buttonOptions.onAction };
}

function parseSelectMenu(selectMenuOptions: SelectMenuOptions) {
	const selectMenu: APISelectMenuComponent = {
		type: ComponentType.SelectMenu,
		custom_id: selectMenuOptions.customId ?? nanoid(10),
		options: parseSelectMenuOptions(selectMenuOptions.options),
		placeholder: selectMenuOptions.placeholder,
		min_values: selectMenuOptions.min ?? 1,
		max_values: selectMenuOptions.max ?? selectMenuOptions.min ?? 1,
		disabled: selectMenuOptions.disabled
	};

	return { ...selectMenu, onAction: selectMenuOptions.onAction };
}

function parseSelectMenuOptions(
	selectMenuOptionOptions: SelectMenuOptionOptions[]
) {
	return selectMenuOptionOptions.map((options) => {
		return {
			label: options.label,
			value: options.value,
			description: options.description,
			default: options.default,
			emoji: parseEmoji(options.emoji)
		} as APISelectMenuOption;
	});
}

function parseEmoji(emoji: EmojiIdentifierResolvable | undefined) {
	if (emoji) return Util.resolvePartialEmoji(emoji) as APIMessageComponentEmoji;
}
