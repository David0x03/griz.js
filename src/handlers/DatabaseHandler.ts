import {
	DeleteOptions,
	Filter,
	FindOptions,
	MongoClient,
	UpdateFilter,
	UpdateOptions
} from 'mongodb';
import { GrizClient } from '../GrizClient';
import { BaseHandler } from './BaseHandler';

export class DatabaseHandler extends BaseHandler {
	dbClient!: MongoClient;

	static async setup(client: GrizClient) {
		const databaseHandler = new DatabaseHandler(client);
		await databaseHandler.init();
		return databaseHandler;
	}

	private async init() {
		const databaseURL = this.client.options.databaseURL;
		this.dbClient = new MongoClient(databaseURL);
		await this.dbClient.connect();

		console.log(`[Database] connected to '${this.dbClient.db().databaseName}'`);
	}

	collection<Model = any>(name: string) {
		return this.dbClient.db().collection<Model>(name);
	}

	async find<Model = any>(
		collection: string,
		filter: Filter<Model>,
		options?: FindOptions
	) {
		return this.collection<Model>(collection).findOne(filter, options);
	}

	async update<Model = any>(
		collection: string,
		filter: Filter<Model>,
		update: Partial<Model> | UpdateFilter<Model>,
		options: UpdateOptions = {}
	) {
		options.upsert ??= true;
		return this.collection<Model>(collection).updateOne(
			filter,
			update,
			options
		);
	}

	async delete<Model = any>(
		collection: string,
		filter: Filter<Model>,
		options: DeleteOptions = {}
	) {
		return this.collection<Model>(collection).deleteOne(filter, options);
	}
}
