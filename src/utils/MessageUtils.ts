import {
	InteractionReplyOptions,
	InteractionUpdateOptions,
	Message,
	MessageEditOptions
} from 'discord.js';
import { registerComponents } from '../handlers/interactionHandler/ComponentHandler';
import { parseMsgData, parseMsgEditData, parseMsgUpdateData } from '../parsers';
import { Editable, GrizMessageOptions, Sendable } from '../types/Message';
import { Utils } from '../utils';

export class MessageUtils {
	constructor(private utils: Utils) {}

	async send(sendable: Sendable, msgOptions: GrizMessageOptions) {
		if (typeof sendable === 'string') {
			const channel = await this.utils.getChannel(sendable);
			if (channel?.isTextBased()) sendable = channel;
			else return;
		}

		let message;
		const parsedMsgData = parseMsgData(msgOptions);

		if (sendable instanceof Message) sendable = sendable.channel;

		if ('reply' in sendable) {
			if (sendable.deferred && !sendable.replied)
				message = await sendable.editReply(parsedMsgData);
			else if (!sendable.replied)
				message = await sendable.reply(
					parsedMsgData as InteractionReplyOptions
				);
			else if (sendable.replied)
				message = await sendable.followUp(
					parsedMsgData as InteractionReplyOptions
				);
		} else if ('send' in sendable) {
			const promise = sendable.send(parsedMsgData).catch(() => undefined);
			message = (await promise) as Message | undefined;
		}

		if (message instanceof Message) {
			registerComponents(message, parsedMsgData);
			return message;
		}
	}

	async edit(editable: Editable, msgOptions: GrizMessageOptions) {
		let message;
		const parsedMsgData = parseMsgEditData(msgOptions);

		if ('editReply' in editable) {
			if (editable.replied) message = await editable.editReply(parsedMsgData);
		} else if ('edit' in editable) {
			editable.edit(parsedMsgData as MessageEditOptions);
		}

		if (message instanceof Message) {
			registerComponents(message, parsedMsgData);
			return message;
		}
	}

	async update(editable: Editable, msgOptions: GrizMessageOptions) {
		let message, parsedMsgData;

		if ('message' in editable)
			parsedMsgData = parseMsgUpdateData(
				msgOptions,
				editable.message as Message
			);
		else if ('fetchReply' in editable)
			parsedMsgData = parseMsgUpdateData(
				msgOptions,
				(await editable.fetchReply()) as Message
			);
		else parsedMsgData = parseMsgUpdateData(msgOptions, editable);

		if ('editReply' in editable) {
			if (editable.replied) message = await editable.editReply(parsedMsgData);
			else if ('update' in editable)
				message = await editable.update(
					parsedMsgData as InteractionUpdateOptions
				);
		} else if ('edit' in editable) {
			editable.edit(parsedMsgData as MessageEditOptions);
		}

		if (message instanceof Message) {
			registerComponents(message, parsedMsgData);
			return message;
		}
	}
}
