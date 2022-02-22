import {
	APIActionRowComponent,
	APIButtonComponent,
	APISelectMenuComponent
} from 'discord-api-types/v10';
import {
	ButtonInteraction,
	ButtonStyle,
	EmojiIdentifierResolvable,
	SelectMenuInteraction
} from 'discord.js';

export type MessageComponentOptions = ButtonOptions[] | [SelectMenuOptions];

export type ActionRowData = APIActionRowComponent<ButtonData | SelectMenuData>;

export interface ButtonOptions {
	label?: string;
	customId?: string;
	style?: ButtonStyle;
	emoji?: EmojiIdentifierResolvable;
	url?: string;
	disabled?: boolean;
	onAction?: ButtonAction;
}

export type ButtonData = APIButtonComponent & {
	onAction?: ButtonAction;
};

export interface ButtonAction {
	(interaction: ButtonInteraction): any;
}

export interface SelectMenuOptions {
	customId?: string;
	placeholder?: string;
	min?: number;
	max?: number;
	options: SelectMenuOptionOptions[];
	disabled?: boolean;
	onAction?: SelectMenuAction;
}

export interface SelectMenuOptionOptions {
	default?: boolean;
	description?: string;
	emoji?: EmojiIdentifierResolvable;
	label: string;
	value: string;
}

export interface SelectMenuData extends APISelectMenuComponent {
	onAction?: SelectMenuAction;
}

export interface SelectMenuAction {
	(interaction: SelectMenuInteraction, values: string[]): any;
}
