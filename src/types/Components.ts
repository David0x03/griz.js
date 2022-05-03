import {
	ButtonStyle,
	ComponentEmojiResolvable,
	TextInputStyle
} from 'discord.js';

export type MessageComponentOptions = ButtonOptions[] | [SelectMenuOptions];

export interface ModalOptions {
	title: string;
	customId?: string;
	components: TextInputOptions[];
}

export interface ButtonOptions {
	label?: string;
	customId?: string;
	style?: ButtonStyle;
	emoji?: ComponentEmojiResolvable;
	url?: string;
	disabled?: boolean;
}

export interface SelectMenuOptions {
	customId?: string;
	options: SelectMenuOptionOptions[];
	placeholder?: string;
	maxValues?: number;
	minValues?: number;
	disabled?: boolean;
}

export interface SelectMenuOptionOptions {
	label: string;
	value: string;
	description?: string;
	emoji?: ComponentEmojiResolvable;
	default?: boolean;
}

export interface TextInputOptions {
	label: string;
	customId: string;
	style?: TextInputStyle;
	placeholder?: string;
	value?: string;
	minLength?: number;
	maxLength?: number;
	required?: boolean;
}
