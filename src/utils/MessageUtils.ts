import {
	InteractionReplyOptions,
	InteractionResponse,
	InteractionUpdateOptions,
	Message,
	MessageComponentInteraction,
	MessageEditOptions
} from 'discord.js';
import {
	parseModal,
	parseMsgData,
	parseMsgEditData,
	parseMsgUpdateData
} from '../parsers';
import {
	Editable,
	GrizMessageOptions,
	Modalable,
	ModalOptions,
	Sendable
} from '../types';
import { Utils } from '../utils';

type MsgResponse = Promise<Message | InteractionResponse | undefined>;

export class MessageUtils {
	constructor(private utils: Utils) {}

	async send(sendable: Sendable, msgOptions: GrizMessageOptions) {
		if (typeof sendable === 'string') {
			const channel = await this.utils.getChannel(sendable);
			if (channel?.isTextBased()) sendable = channel;
			else return;
		}

		const parsedMsgData = parseMsgData(msgOptions);

		if (sendable instanceof Message) sendable = sendable.channel;

		if ('reply' in sendable) {
			if (sendable.deferred && !sendable.replied)
				return sendable.editReply(parsedMsgData) as MsgResponse;

			if (!sendable.replied)
				return sendable.reply(
					parsedMsgData as InteractionReplyOptions
				) as MsgResponse;

			if (sendable.replied)
				return sendable.followUp(
					parsedMsgData as InteractionReplyOptions
				) as MsgResponse;
		}

		if ('send' in sendable)
			return sendable.send(parsedMsgData).catch(() => undefined) as MsgResponse;
	}

	async edit(editable: Editable, msgOptions: GrizMessageOptions) {
		const parsedMsgData = parseMsgEditData(msgOptions);

		if ('editReply' in editable && editable.replied)
			return editable.editReply(parsedMsgData) as MsgResponse;

		if ('edit' in editable)
			editable.edit(parsedMsgData as MessageEditOptions) as MsgResponse;
	}

	async update(editable: Editable, msgOptions: GrizMessageOptions) {
		let parsedMsgData;

		if (editable instanceof MessageComponentInteraction)
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

		if ('editReply' in editable && editable.replied)
			return editable.editReply(parsedMsgData) as MsgResponse;

		if ('update' in editable)
			return editable.update(
				parsedMsgData as InteractionUpdateOptions
			) as MsgResponse;

		if ('edit' in editable)
			return editable.edit(parsedMsgData as MessageEditOptions) as MsgResponse;
	}

	async showModal(modalable: Modalable, modalOptions: ModalOptions) {
		const parsedModal = parseModal(modalable, modalOptions);
		return modalable.showModal(parsedModal);
	}
}
