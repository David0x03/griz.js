import {
	ButtonComponentData,
	ButtonStyle,
	ModalData,
	SelectMenuComponentData,
	TextInputComponentData,
	TextInputStyle
} from 'discord.js';

export type MessageComponentData = ButtonData[] | [SelectMenuData];

export interface GrizModalData
	extends Omit<ModalData, 'customId' | 'components'> {
	customId?: string;
	components: TextInputData[];
}

export type ButtonData = Omit<
	ButtonComponentData,
	'customId' | 'style' | 'url'
> & {
	customId?: string;
	style?: ButtonStyle;
	url?: string;
};

export interface SelectMenuData
	extends Omit<SelectMenuComponentData, 'customId'> {
	customId?: string;
}

export interface TextInputData
	extends Omit<TextInputComponentData, 'customId' | 'style'> {
	customId?: string;
	style?: TextInputStyle;
}
