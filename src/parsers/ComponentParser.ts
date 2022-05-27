import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	Interaction,
	ModalBuilder,
	SelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { nanoid } from 'nanoid';
import {
	ButtonData,
	GrizModalData,
	MessageComponentData,
	SelectMenuData,
	TextInputData
} from '../types';

export function parseMessageComponents(
	componentOptions: MessageComponentData | MessageComponentData[]
) {
	if (componentOptions.length === 0) return [];

	if (Array.isArray(componentOptions[0]))
		return componentOptions.map((actionRow) =>
			parseMessageActionRow(actionRow as MessageComponentData)
		);
	else return [parseMessageActionRow(componentOptions as MessageComponentData)];
}

export function parseModal(interaction: Interaction, modalData: GrizModalData) {
	modalData.customId ??= modalData.customId ?? interaction.id;

	modalData.components = modalData.components.map((component) => {
		const actionRowData: any = {
			type: ComponentType.ActionRow,
			components: [parseTextInput(component as any)]
		};

		return new ActionRowBuilder<TextInputBuilder>(actionRowData) as any;
	});

	return new ModalBuilder(modalData as any);
}

function parseMessageActionRow(actionRowOptions: MessageComponentData) {
	const actionRowData: any = {
		type: ComponentType.ActionRow,
		components: actionRowOptions.map((component) => {
			switch (component.type) {
				case ComponentType.Button:
					return parseButton(component);
				case ComponentType.SelectMenu:
					return parseSelectMenu(component as any);
			}
		})
	};

	return new ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>(actionRowData);
}

function parseButton(buttonData: ButtonData) {
	if (buttonData.url !== undefined) {
		buttonData.style = ButtonStyle.Link;
	} else {
		buttonData.customId ??= nanoid(10);
		buttonData.style ??= ButtonStyle.Primary;
	}

	return buttonData;
}

function parseSelectMenu(selectMenuOptions: SelectMenuData) {
	selectMenuOptions.customId ??= nanoid(10);
	return new SelectMenuBuilder(selectMenuOptions);
}

function parseTextInput(textInputOptions: TextInputData) {
	textInputOptions.customId ??= nanoid(10);
	textInputOptions.style ??= TextInputStyle.Short;

	return new TextInputBuilder(textInputOptions);
}
