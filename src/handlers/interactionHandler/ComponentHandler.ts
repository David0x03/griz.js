import {
	InteractionCollector,
	Message,
	MessageComponentInteraction
} from 'discord.js';
import { ButtonAction, SelectMenuAction } from '../../types/Components';
import { MessageData } from '../../types/Message';

const componentCollectors = new Map<
	string,
	InteractionCollector<MessageComponentInteraction>
>();

export function registerComponents(
	message: Message,
	{ components, users, ttl }: MessageData
) {
	if (!components) return;
	componentCollectors.get(message.id)?.stop();

	const actions = new Map<string, ButtonAction | SelectMenuAction>();

	components.forEach((actionRow) =>
		actionRow.components.forEach((component) => {
			const hasCustomId = 'custom_id' in component && component.custom_id;
			const hasOnAction = 'onAction' in component && component.onAction;

			if (hasCustomId && hasOnAction)
				actions.set(component.custom_id!, component.onAction!);
		})
	);
	if (actions.size === 0) return;

	const collector = message.createMessageComponentCollector({
		time: ttl * 1000,
		dispose: true,
		filter: (interaction) => !users || users.includes(interaction.user.id)
	});

	collector.on('collect', (interaction) => {
		const action = actions.get(interaction.customId);
		if (!action) return;

		if (interaction.isButton()) return (action as ButtonAction)(interaction);

		if (interaction.isSelectMenu())
			return (action as SelectMenuAction)(interaction, interaction.values);
	});

	collector.on('end', () => {
		componentCollectors.delete(message.id);
	});

	componentCollectors.set(message.id, collector);
}
