import {
	AnyChannel,
	Collection,
	Guild,
	GuildMemberResolvable,
	Message,
	TextBasedChannel,
	ThreadChannel,
	ThreadManager,
	UserResolvable
} from 'discord.js';
import { GrizClient } from '../GrizClient';
import { DatabaseUtils } from './DatabaseUtils';
import { JobUtils } from './JobUtils';
import { MessageUtils } from './MessageUtils';

type WebHookChannel = Extract<AnyChannel, { fetchWebhooks: Function }>;
type HasThreadsChannel = Extract<AnyChannel, { threads: ThreadManager<any> }>;

export class Utils {
	static client: GrizClient;
	private static utils = new Map<string, Utils>();

	client: GrizClient;
	guild?: Guild;
	guildId?: string;
	db: DatabaseUtils;
	msg: MessageUtils;
	job: JobUtils;

	constructor(guild?: Guild) {
		this.client = Utils.client;
		this.guild = guild;
		this.guildId = guild?.id;
		this.db = new DatabaseUtils(this);
		this.msg = new MessageUtils(this);
		this.job = new JobUtils(this);
	}

	static async get(guildId?: string | null) {
		guildId ??= 'global';
		if (this.utils.has(guildId)) return this.utils.get(guildId)!;

		const guild = await this.getGuild(guildId);
		const utils = new Utils(guild);

		this.utils.set(guild?.id ?? 'global', utils);
		return utils;
	}

	static async getGuild(guildId: string) {
		if (!guildId) return;
		return this.client.guilds.fetch(guildId).catch(() => undefined);
	}

	async getChannel(channel: string, global = false) {
		if (!channel.match(/^\d+$/)) {
			const dbChannel = await this.db.settings(`channels.${channel}`);
			if (dbChannel) channel = dbChannel;
		}

		if (this.guild && !global)
			return this.guild.channels.fetch(channel).catch(() => undefined);

		return this.client.channels.fetch(channel).catch(() => undefined);
	}

	async getUser(user: UserResolvable) {
		if (!user) return;
		return this.client.users.fetch(user).catch(() => undefined);
	}

	async getMember(member: GuildMemberResolvable) {
		if (!member) return;
		return this.guild?.members.fetch(member).catch(() => undefined);
	}

	async getRole(role: string) {
		if (!role) return;
		return this.guild?.roles.fetch(role).catch(() => undefined);
	}

	async getWebhook(
		channel: WebHookChannel | ThreadChannel | string,
		name: string
	) {
		if (typeof channel == 'string')
			channel = await this.parseChannel<WebHookChannel | ThreadChannel>(
				channel
			);

		if (channel?.isThread()) channel = channel.parent as WebHookChannel;
		if (!channel || !('fetchWebhooks' in channel)) return;

		const whs = await channel.fetchWebhooks();
		let wh = whs.find(
			(wh) => wh.owner?.id === this.client.user?.id && wh.name === name
		);

		return wh ?? channel.createWebhook(name);
	}

	async getActiveThreads(channel: HasThreadsChannel | string) {
		channel = await this.parseChannel<HasThreadsChannel>(channel);
		if (!channel || !('threads' in channel)) return;

		let hasMore;
		const threads: ThreadChannel[] = [];

		do {
			const batch = await channel.threads.fetchActive();
			threads.push(...batch.threads.values());
			hasMore = batch.hasMore;
		} while (hasMore);

		return threads;
	}

	async getPrivateThreads(channel: HasThreadsChannel) {
		channel = await this.parseChannel<HasThreadsChannel>(channel);
		if (!channel || !('threads' in channel)) return;

		let hasMore;
		const threads: ThreadChannel[] = [];

		do {
			const batch = await channel.threads.fetchArchived();
			threads.push(...batch.threads.values());
			hasMore = batch.hasMore;
		} while (hasMore);

		return threads;
	}

	async getMessages(
		channel: TextBasedChannel | string,
		options: { limit?: number; includePinned?: boolean } = {}
	) {
		const { limit = 1, includePinned = false } = options;

		channel = await this.parseChannel<TextBasedChannel>(channel);
		if (!channel) return;

		const messages: Array<Message> = [];
		let batch: Collection<string, Message>;
		do {
			const lastId = messages.at(-1)?.id ?? channel.lastMessageId;

			if (lastId)
				batch = await channel.messages.fetch({ limit: 100, before: lastId });
			else batch = await channel.messages.fetch({ limit: 100 });

			if (!includePinned) batch = batch.filter((m) => !m.pinned);

			messages.push(...batch.values());
		} while (batch.size && messages.length < limit);

		return messages.slice(0, limit);
	}

	async getMessage(channel: TextBasedChannel, message: string) {
		if (typeof message != 'string') return;
		channel = await this.parseChannel<TextBasedChannel>(channel);

		return channel?.messages.fetch(message).catch(() => undefined);
	}

	async deleteMessages(messages: Array<Message>) {
		const channel = messages?.[0]?.channel;
		if (!channel || !('bulkDelete' in channel)) return;

		const promises = [];
		for (let i = 0; i < messages.length / 100; i++) {
			promises.push(
				channel.bulkDelete(messages.slice(i * 100, (i + 1) * 100), true)
			);
		}

		await Promise.all(promises);
	}

	private async parseChannel<T extends AnyChannel>(channel: T | string) {
		let parsedChannel: AnyChannel | undefined | null;
		if (typeof channel == 'string')
			parsedChannel = await this.getChannel(channel);
		return (parsedChannel ?? channel) as T;
	}
}
