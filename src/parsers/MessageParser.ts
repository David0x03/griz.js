import { APIEmbed } from 'discord-api-types/v10';
import { Colors, Embed, Message } from 'discord.js';
import {
	EmbedOptions,
	FooterOptions,
	GrizMessageOptions,
	ImageOptions,
	MessageData
} from '../types/Message';
import { parseMessageComponents } from './ComponentParser';

export function parseMsgData(msgOptions: GrizMessageOptions) {
	const message: MessageData = {
		fetchReply: true,
		ttl: 300
	};

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

	// MessageMentions
	message.allowedMentions = {
		repliedUser: false,
		...msgOptions.allowedMentions
	};

	// Reply
	if (msgOptions.reply)
		message.reply = {
			messageReference: msgOptions.reply,
			failIfNotExists: false
		};

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

	// Users
	if (msgOptions.users) message.users = msgOptions.users;

	// TTL
	if (msgOptions.ttl) message.ttl = msgOptions.ttl;

	return message;
}

export function parseMsgEditData(msgOptions: GrizMessageOptions) {
	msgOptions.content ??= null;
	msgOptions.embeds ??= [];
	msgOptions.components ??= [];
	msgOptions.files ??= [];

	return parseMsgData(msgOptions);
}

export function parseMsgUpdateData(
	msgOptions: GrizMessageOptions,
	msg: Message
) {
	const msgData = parseMsgData(msgOptions);

	if (!msgData.embeds) msgData.embeds = msg.embeds;
	else if (msgData.embeds.length == msg.embeds.length) {
		msgData.embeds = msgData.embeds.map((embed, i) => ({
			...msg.embeds[i].data,
			...(embed as APIEmbed)
		}));
	}

	return msgData;
}

function parseEmbed(embedOptions: EmbedOptions) {
	const embed = new Embed();

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

	if (embedOptions.fields !== undefined)
		embed.setFields(...embedOptions.fields);

	if (embedOptions.image !== undefined)
		embed.setImage(parseImage(embedOptions.image) ?? null);

	if (embedOptions.timestamp !== undefined)
		embed.setTimestamp(embedOptions.timestamp);

	if (embedOptions.footer !== undefined)
		embed.setFooter(parseFooter(embedOptions.footer) ?? null);

	embed.setColor(embedOptions.color ?? Colors.Blue);

	if (embed.length > 0 || embed.image || embed.thumbnail) return embed.toJSON();
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
