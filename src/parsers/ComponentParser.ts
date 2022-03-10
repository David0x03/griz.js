import { APIMessageComponentEmoji } from 'discord-api-types/v10';
import {
	ActionRow,
	ButtonComponent,
	ButtonStyle,
	EmojiIdentifierResolvable,
	Interaction,
	Modal,
	SelectMenuComponent,
	SelectMenuOption,
	TextInputComponent,
	TextInputStyle,
	Util
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
	const modal = new Modal();

	modal.setTitle(modalOptions.title);
	modal.setCustomId(modalOptions.customId ?? interaction.id);

	modalOptions.components.forEach((component) => {
		const actionRow = new ActionRow<TextInputComponent>();
		actionRow.setComponents(parseTextInput(component as any));
		modal.addComponents(actionRow);
	});

	return modal;
}

function parseMessageActionRow(actionRowOptions: MessageComponentOptions) {
	const actionRow = new ActionRow();

	actionRowOptions.forEach((component) => {
		if ('options' in component)
			actionRow.addComponents(parseSelectMenu(component));
		else actionRow.addComponents(parseButton(component));
	});

	return actionRow;
}

function parseButton(buttonOptions: ButtonOptions) {
	const button = new ButtonComponent();

	if (buttonOptions.label) button.setLabel(buttonOptions.label);

	if (buttonOptions.emoji) {
		const emoji = parseEmoji(buttonOptions.emoji);
		if (emoji) button.setEmoji(emoji);
	}

	if (buttonOptions.url) {
		button.setStyle(ButtonStyle.Link);
		button.setURL(buttonOptions.url);
		return button;
	}

	button.setStyle(buttonOptions.style || ButtonStyle.Primary);
	button.setCustomId(buttonOptions.customId ?? nanoid(10));

	if (buttonOptions.disabled) button.setDisabled(buttonOptions.disabled);

	return button;
}

function parseSelectMenu(selectMenuOptions: SelectMenuOptions) {
	const selectMenu = new SelectMenuComponent();

	selectMenu.setCustomId(selectMenuOptions.customId ?? nanoid(10));
	selectMenu.setOptions(...parseSelectMenuOptions(selectMenuOptions.options));

	if (selectMenuOptions.placeholder)
		selectMenu.setPlaceholder(selectMenuOptions.placeholder);

	selectMenu.setMinValues(selectMenuOptions.minValues ?? 1);
	selectMenu.setMaxValues(
		selectMenuOptions.maxValues ?? selectMenuOptions.minValues ?? 1
	);

	if (selectMenuOptions.disabled)
		selectMenu.setDisabled(selectMenuOptions.disabled);

	return selectMenu;
}

function parseSelectMenuOptions(
	selectMenuOptionOptions: SelectMenuOptionOptions[]
) {
	return selectMenuOptionOptions.map((options) => {
		const option = new SelectMenuOption();

		option.setLabel(options.label);
		option.setValue(options.value);

		if (options.description) option.setDescription(options.description);

		if (options.emoji) {
			const emoji = parseEmoji(options.emoji);
			if (emoji) option.setEmoji(emoji);
		}

		if (options.default) option.setDefault(options.default);

		return option;
	});
}

function parseTextInput(textInputOptions: TextInputOptions) {
	const textInput = new TextInputComponent();

	textInput.setLabel(textInputOptions.label);
	textInput.setCustomId(textInputOptions.customId);
	textInput.setStyle(textInputOptions.style ?? TextInputStyle.Short);

	if (textInputOptions.placeholder)
		textInput.setPlaceholder(textInputOptions.placeholder);

	if (textInputOptions.value) textInput.setValue(textInputOptions.value);

	if (textInputOptions.minLength)
		textInput.setMinLength(textInputOptions.minLength);
	if (textInputOptions.maxLength)
		textInput.setMaxLength(textInputOptions.maxLength);

	if (textInputOptions.required)
		textInput.setRequired(textInputOptions.required);

	return textInput;
}

function parseEmoji(emoji: EmojiIdentifierResolvable | undefined) {
	if (emoji) return Util.resolvePartialEmoji(emoji) as APIMessageComponentEmoji;
}
