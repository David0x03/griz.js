import {
	ButtonInteraction,
	ComponentType,
	GuildMember,
	Interaction,
	InteractionCollector,
	InteractionType,
	Message,
	MessageComponentInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	User
} from 'discord.js';
import { Utils } from '.';

interface MessageComponentOptions {
	time?: number;
	user?: GuildMember | User | string;
	max?: number;
}

interface OnButtonOptions extends MessageComponentOptions {
	filter?: OnButtonFunc;
	onPress?: OnButtonFunc;
}
interface OnButtonFunc {
	(interaction: ButtonInteraction): any;
}

interface OnSelectMenuOptions extends MessageComponentOptions {
	filter?: OnSelectMenuFunc;
	onSelect?: OnSelectMenuFunc;
}
interface OnSelectMenuFunc {
	(interaction: SelectMenuInteraction, values: string[]): any;
}

interface OnModalOptions {
	onSubmit?: (interaction: ModalSubmitInteraction, args: ModalArgs) => any;
}
type ModalArgs = { [key in string]: string };

export class InteractionCollectorUtils {
	constructor(private utils: Utils) {}

	onButton(message: Message, options: OnButtonOptions) {
		const { time = 0, max, user, filter, onPress } = options;

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: time * 1000,
			dispose: true,
			max,
			filter: (i) => {
				if (!this.isAllowed(i, user)) return;
				if (filter) return filter(i);
				return true;
			}
		});

		if (onPress) collector.on('collect', (i) => onPress(i));

		return collector;
	}

	onSelectMenu(message: Message, options: OnSelectMenuOptions) {
		const { time = 0, max, user, filter, onSelect } = options;

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.SelectMenu,
			time: time * 1000,
			dispose: true,
			max,
			filter: (i) => {
				if (!this.isAllowed(i, user)) return;
				if (filter) return filter(i, i.values);
				return true;
			}
		});

		if (onSelect) collector.on('collect', (i) => onSelect(i, i.values));

		return collector;
	}

	onModal(interaction: Interaction, { onSubmit }: OnModalOptions) {
		const collector = new InteractionCollector(interaction.client, {
			interactionType: InteractionType.ModalSubmit,
			time: 60 * 60 * 1000,
			dispose: true,
			max: 1,
			filter: (i: ModalSubmitInteraction) => i.customId === interaction.id
		});

		if (onSubmit)
			collector.on('collect', (i) => {
				const args: ModalArgs = {};
				i.fields.fields.forEach((field) => {
					args[field.customId] = field.value;
				});
				onSubmit(i, args);
			});

		return collector;
	}

	private isAllowed(
		interaction: MessageComponentInteraction,
		user?: GuildMember | User | string
	) {
		if (typeof user === 'string') {
			if (interaction.user.id !== user) return false;
		} else if (user && 'id' in user) {
			if (interaction.user.id !== user.id) return false;
		}
		return true;
	}
}
