import {
	AnyChannel,
	BufferResolvable,
	CommandInteraction,
	EmbedBuilder,
	EmbedFieldData,
	Guild,
	GuildMember,
	InteractionReplyOptions,
	Message,
	MessageComponentInteraction,
	MessageOptions,
	MessageResolvable,
	ModalSubmitInteraction,
	TextBasedChannelResolvable,
	User,
	Webhook,
	WebhookMessageOptions
} from 'discord.js';
import { Stream } from 'stream';
import { MessageComponentData } from './Components';

export type Sendable =
	| CommandInteraction
	| MessageComponentInteraction
	| ModalSubmitInteraction
	| TextBasedChannelResolvable
	| Message
	| Webhook
	| User
	| GuildMember;

export type Editable =
	| CommandInteraction
	| MessageComponentInteraction
	| ModalSubmitInteraction
	| Message;

export type Modalable = CommandInteraction | MessageComponentInteraction;

export interface MessageData
	extends Omit<MessageOptions, 'embeds'>,
		Omit<InteractionReplyOptions, 'embeds' | 'flags'>,
		Omit<WebhookMessageOptions, 'embeds'> {
	embeds?: EmbedBuilder[];
}

export interface GrizMessageOptions extends EmbedOptions {
	content?: string | null;
	embeds?: EmbedOptions[];
	components?: MessageComponentData | MessageComponentData[];
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
		username?: string;
		avatar?: ImageOptions;
		channel?: AnyChannel;
	};
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
