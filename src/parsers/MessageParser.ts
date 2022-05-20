import { Colors, EmbedBuilder, Message } from 'discord.js';
import {
	EmbedOptions,
	FooterOptions,
	GrizMessageOptions,
	ImageOptions,
	MessageData
} from '../types/Message';
import { parseMessageComponents } from './ComponentParser';

export function parseMsgData(msgOptions: GrizMessageOptions) {
	const message: MessageData = { fetchReply: true };

	// Content
	if (msgOptions.content !== undefined) message.content = msgOptions.content;

	// Embeds
	if (msgOptions.embeds !== undefined)
		message.embeds = msgOptions.embeds.map((embed) => parseEmbed(embed)!);
	else {
		const msgEmbed = parseEmbed(msgOptions);
		if (msgEmbed) message.embeds = [msgEmbed];
	}

	// Components
	if (msgOptions.components !== undefined)
		message.components = parseMessageComponents(msgOptions.components);

	// Files
	if (msgOptions.files !== undefined)
		message.files = msgOptions.files.map(({ file, name, description }) => {
			return { attachment: file, name, description };
		});

	// Stickers
	if (msgOptions.stickers !== undefined) message.stickers = msgOptions.stickers;

	// Reply
	if (msgOptions.reply)
		message.reply = {
			messageReference: msgOptions.reply,
			failIfNotExists: false
		};

	// MessageMentions
	if (msgOptions.allowedMentions === undefined && message.reply !== undefined)
		message.allowedMentions = { repliedUser: false };

	// Ephemeral
	if (msgOptions.ephemeral !== undefined)
		message.ephemeral = msgOptions.ephemeral;

	// Webhook
	if ('webhook' in msgOptions) {
		message.username = msgOptions.webhook?.username;
		message.avatarURL = parseImage(msgOptions.webhook?.avatar);

		const channel = msgOptions.webhook?.channel;
		if (channel?.isThread()) message.threadId = channel.id;
		else if (typeof channel === 'string') message.threadId = channel;
	}

	return message;
}

export function parseMsgEditData(msgOptions: GrizMessageOptions) {
	const parsedData = parseMsgData(msgOptions);

	parsedData.content ??= null;
	parsedData.embeds ??= [];
	parsedData.components ??= [];
	parsedData.files ??= [];

	return parsedData;
}

export function parseMsgUpdateData(
	msgOptions: GrizMessageOptions,
	msg: Message
) {
	const msgData = parseMsgData(msgOptions);

	msgData.embeds = msgData.embeds?.map(
		(embed, i) => new EmbedBuilder({ ...msg.embeds[i].data, ...embed.data })
	);

	return msgData;
}

function parseEmbed(embedOptions: EmbedOptions) {
	const embed = new EmbedBuilder();

	if (embedOptions.title !== undefined) embed.setTitle(embedOptions.title);

	if (embedOptions.url !== undefined) embed.setURL(embedOptions.url);

	if (embedOptions.author !== undefined) {
		if (embedOptions.author)
			embed.setAuthor({
				name: embedOptions.author.name,
				iconURL: parseImage(embedOptions.author.icon),
				url: embedOptions.author.url
			});
		else embed.setAuthor(embedOptions.author);
	}

	if (embedOptions.description !== undefined)
		embed.setDescription(embedOptions.description);

	if (embedOptions.thumbnail !== undefined)
		embed.setThumbnail(parseImage(embedOptions.thumbnail) ?? null);

	if (embedOptions.fields !== undefined) embed.setFields(embedOptions.fields);

	if (embedOptions.image !== undefined)
		embed.setImage(parseImage(embedOptions.image) ?? null);

	if (embedOptions.timestamp !== undefined)
		embed.setTimestamp(embedOptions.timestamp);

	if (embedOptions.footer !== undefined)
		embed.setFooter(parseFooter(embedOptions.footer) ?? null);

	embed.setColor(embedOptions.color ?? Colors.Blue);

	if (
		embed.data.title ||
		embed.data.author ||
		embed.data.description ||
		embed.data.fields ||
		embed.data.thumbnail ||
		embed.data.image
	)
		return embed;
}

function parseImage(imageOptions: ImageOptions | undefined | null) {
	if (!imageOptions) return;

	if (typeof imageOptions === 'string') return imageOptions;
	if ('iconURL' in imageOptions) return imageOptions.iconURL() ?? undefined;
	return imageOptions.displayAvatarURL();
}

function parseFooter(footerOptions: FooterOptions | null) {
	if (!footerOptions) return;

	if (typeof footerOptions === 'string') return { text: footerOptions };

	if ('user' in footerOptions)
		return { text: `${footerOptions.id} | ${footerOptions.user.tag}` };

	if ('tag' in footerOptions)
		return { text: `${footerOptions.id} | ${footerOptions.tag}` };

	return {
		text: footerOptions.text,
		icon_url: parseImage(footerOptions.icon)
	};
}
