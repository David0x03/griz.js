import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChatInputCommandInteraction,
	CommandInteraction,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction
} from 'discord.js';
import { Command } from '../modules';

export function parseCommandArgs(
	interaction: CommandInteraction,
	command: Command
) {
	if (interaction.isChatInputCommand())
		return parseSlashCommandArgs(interaction, command);

	if (interaction.isUserContextMenuCommand())
		return parseUserCommandArgs(interaction);

	if (interaction.isMessageContextMenuCommand())
		return parseMessageCommandArgs(interaction);

	return {};
}

function parseSlashCommandArgs(
	interaction: ChatInputCommandInteraction,
	command: Command
) {
	if (command.data.type !== ApplicationCommandType.ChatInput) return {};

	const args: { [key in string]: any } = {};
	const commandArgs = interaction.options;

	command.data.options?.forEach(({ name, type }) => {
		switch (type) {
			case ApplicationCommandOptionType.User:
				args[name] = {
					user: commandArgs.getUser(name),
					member: commandArgs.getMember(name)
				};
				break;
			case ApplicationCommandOptionType.Channel:
				args[name] = commandArgs.getChannel(name);
				break;
			case ApplicationCommandOptionType.Role:
				args[name] = commandArgs.getRole(name);
				break;
			case ApplicationCommandOptionType.Mentionable:
				args[name] = commandArgs.getMentionable(name);
				break;
			case ApplicationCommandOptionType.Attachment:
				args[name] = commandArgs.getAttachment(name);
				break;
			default:
				args[name] = commandArgs.get(name)?.value;
				break;
		}
	});

	return args;
}

function parseUserCommandArgs(interaction: UserContextMenuCommandInteraction) {
	return {
		user: interaction.targetUser,
		member: interaction.targetMember
	};
}

function parseMessageCommandArgs(
	interaction: MessageContextMenuCommandInteraction
) {
	return { message: interaction.targetMessage };
}
