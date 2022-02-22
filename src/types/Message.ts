import {
	AnyChannel,
	BufferResolvable,
	CommandInteraction,
	EmbedFieldData,
	Guild,
	GuildMember,
	InteractionReplyOptions,
	Message,
	MessageComponentInteraction,
	MessageOptions,
	MessageResolvable,
	TextBasedChannelResolvable,
	User,
	Webhook,
	WebhookMessageOptions
} from 'discord.js';
import { Stream } from 'stream';
import { ActionRowData, MessageComponentOptions } from './Components';

export type Sendable =
	| CommandInteraction
	| MessageComponentInteraction
	| TextBasedChannelResolvable
	| Message
	| Webhook
	| User
	| GuildMember;

export type Editable =
	| CommandInteraction
	| MessageComponentInteraction
	| Message;

export interface MessageData
	extends MessageOptions,
		Omit<InteractionReplyOptions, 'flags'>,
		WebhookMessageOptions {
	components?: ActionRowData[];
	users?: string[];
	ttl: number;
}

export interface GrizMessageOptions extends EmbedOptions {
	content?: string | null;
	embeds?: EmbedOptions[];
	components?: MessageComponentOptions | MessageComponentOptions[];
	files?: {
		name: string;
		file: BufferResolvable | Stream;
		description?: string;
	}[];
	stickers?: MessageOptions['stickers'];
	allowedMentions?: MessageOptions['allowedMentions'];
	reply?: MessageResolvable;
	ephemeral?: boolean;
	webhook?: {
		username: string;
		avatar: ImageOptions;
		channel: AnyChannel;
	};
	users?: string[];
	ttl?: number;
}

export interface EmbedOptions {
	title?: string | null;
	url?: string | null;
	author?: { name: string; icon?: ImageOptions | null; url?: string } | null;
	description?: string | null;
	thumbnail?: ImageOptions | null;
	fields?: EmbedFieldData[];
	image?: ImageOptions | null;
	timestamp?: Date | number | null;
	footer?: FooterOptions | null;
	color?: number;
}

export type ImageOptions = string | GuildMember | User | Guild;

export type FooterOptions =
	| string
	| { text: string; icon?: ImageOptions }
	| GuildMember
	| User;
