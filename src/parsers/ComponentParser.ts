import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Interaction,
	ModalBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { nanoid } from 'nanoid';
import {
	ButtonOptions,
	MessageComponentOptions,
	ModalOptions,
	SelectMenuOptionOptions,
	SelectMenuOptions,
	TextInputOptions
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

export function parseModal(
	interaction: Interaction,
	modalOptions: ModalOptions
) {
	const modal = new ModalBuilder();

	modal.setTitle(modalOptions.title);
	modal.setCustomId(modalOptions.customId ?? interaction.id);

	modalOptions.components.forEach((component) => {
		const actionRow = new ActionRowBuilder<TextInputBuilder>();
		actionRow.setComponents(parseTextInput(component as any));
		modal.addComponents(actionRow);
	});

	return modal;
}

function parseMessageActionRow(actionRowOptions: MessageComponentOptions) {
	const actionRow = new ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>();

	actionRowOptions.forEach((component) => {
		if ('options' in component)
			actionRow.addComponents(parseSelectMenu(component));
		else actionRow.addComponents(parseButton(component));
	});

	return actionRow;
}

function parseButton(buttonOptions: ButtonOptions) {
	const button = new ButtonBuilder();

	if (buttonOptions.label !== undefined) button.setLabel(buttonOptions.label);
	if (buttonOptions.emoji !== undefined) button.setEmoji(buttonOptions.emoji);

	if (buttonOptions.url !== undefined) {
		button.setStyle(ButtonStyle.Link);
		button.setURL(buttonOptions.url);
		return button;
	}

	button.setStyle(buttonOptions.style || ButtonStyle.Primary);
	button.setCustomId(buttonOptions.customId ?? nanoid(10));

	if (buttonOptions.disabled !== undefined)
		button.setDisabled(buttonOptions.disabled);

	return button;
}

function parseSelectMenu(selectMenuOptions: SelectMenuOptions) {
	const selectMenu = new SelectMenuBuilder();

	selectMenu.setCustomId(selectMenuOptions.customId ?? nanoid(10));
	selectMenu.setOptions(...parseSelectMenuOptions(selectMenuOptions.options));

	if (selectMenuOptions.placeholder !== undefined)
		selectMenu.setPlaceholder(selectMenuOptions.placeholder);

	selectMenu.setMinValues(selectMenuOptions.minValues ?? 1);
	selectMenu.setMaxValues(
		selectMenuOptions.maxValues ?? selectMenuOptions.minValues ?? 1
	);

	if (selectMenuOptions.disabled !== undefined)
		selectMenu.setDisabled(selectMenuOptions.disabled);

	return selectMenu;
}

function parseSelectMenuOptions(
	selectMenuOptionOptions: SelectMenuOptionOptions[]
) {
	return selectMenuOptionOptions.map((options) => {
		const option = new SelectMenuOptionBuilder();

		option.setLabel(options.label);
		option.setValue(options.value);

		if (options.description !== undefined)
			option.setDescription(options.description);

		if (options.emoji !== undefined) option.setEmoji(options.emoji);

		if (options.default !== undefined) option.setDefault(options.default);

		return option;
	});
}

function parseTextInput(textInputOptions: TextInputOptions) {
	const textInput = new TextInputBuilder();

	textInput.setLabel(textInputOptions.label);
	textInput.setCustomId(textInputOptions.customId);
	textInput.setStyle(textInputOptions.style ?? TextInputStyle.Short);

	if (textInputOptions.placeholder !== undefined)
		textInput.setPlaceholder(textInputOptions.placeholder);

	if (textInputOptions.value !== undefined)
		textInput.setValue(textInputOptions.value);

	if (textInputOptions.minLength !== undefined)
		textInput.setMinLength(textInputOptions.minLength);
	if (textInputOptions.maxLength !== undefined)
		textInput.setMaxLength(textInputOptions.maxLength);

	if (textInputOptions.required !== undefined)
		textInput.setRequired(textInputOptions.required);

	return textInput;
}
