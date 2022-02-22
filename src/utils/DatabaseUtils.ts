import {
	DeleteOptions,
	Document,
	Filter,
	FindOptions,
	UpdateFilter,
	UpdateOptions
} from 'mongodb';
import { Utils } from '.';

type DBFilter<T> = Filter<T> | string;
type DBUpdate<T> = Partial<T> | UpdateFilter<T>;
type DBUserFilter = string | { user: string; guild?: string };

export class DatabaseUtils {
	private dbHandler;
	private guildId;

	constructor(private utils: Utils) {
		this.dbHandler = this.utils.client.databaseHandler;
		this.guildId = this.utils.guildId ?? 'global';
	}

	collection(name: string) {
		return this.dbHandler.collection(name);
	}

	async get<T = Document, O = any>(
		collection: string,
		filter: DBFilter<T>,
		query?: string,
		options?: FindOptions
	): Promise<O> {
		filter = this.parseFilter(filter) as Filter<T>;
		let data = (await this.dbHandler.find(collection, filter, options)) as any;
		const queries = query?.split('.');
		queries?.forEach((q) => (data = data?.[q]));
		return data;
	}

	async update<T = Document>(
		collection: string,
		filter: DBFilter<T>,
		update: DBUpdate<T>,
		options?: UpdateOptions
	) {
		filter = this.parseFilter(filter) as Filter<T>;
		return this.dbHandler.update(collection, filter, update, options);
	}

	async delete<T = Document>(
		collection: string,
		filter: DBFilter<T>,
		options?: DeleteOptions
	) {
		filter = this.parseFilter(filter) as Filter<T>;
		return this.dbHandler.delete(collection, filter, options);
	}

	async settings<T = any>(query?: string, options?: FindOptions): Promise<T> {
		return this.get('settings', this.guildId, query, options);
	}

	async updateSettings<T = Document>(
		update: DBUpdate<T>,
		options?: UpdateOptions
	) {
		return this.update('settings', this.guildId, update, options);
	}

	async deleteSettings(options?: DeleteOptions) {
		return this.delete('settings', this.guildId, options);
	}

	async user<T = any>(
		user: DBUserFilter,
		query?: string,
		options?: FindOptions
	): Promise<T> {
		user = this.parseUserFilter(user);
		return this.get('users', user, query, options);
	}

	async updateUser<T = Document>(
		user: DBUserFilter,
		update: DBUpdate<T>,
		options?: UpdateOptions
	) {
		user = this.parseUserFilter(user);
		return this.update('users', user as Filter<T>, update, options);
	}

	async deleteUser(user: DBUserFilter, options?: DeleteOptions) {
		user = this.parseUserFilter(user);
		return this.delete('users', user, options);
	}

	private parseFilter(filter: DBFilter<Document>) {
		if (typeof filter === 'string') return { _id: filter };
		return filter;
	}

	private parseUserFilter(user: DBUserFilter) {
		if (typeof user === 'string') user = { user };
		user.guild ??= this.guildId;
		return { _id: `${user.guild}|${user.user}`, ...user };
	}
}
