import { Client, ClientOptions, Events, Guild } from 'discord.js';
import {
	CommandHandler,
	ConditionHandler,
	DatabaseHandler,
	EventHandler,
	InteractionHandler,
	JobHandler
} from './handlers';
import { Utils } from './utils';

interface GrizClientOptions extends ClientOptions {
	databaseURL: string;
	directory: string;
	devGuildId?: string;
	mode: 'production' | 'development';
	timezone?: string;
}

export class GrizClient extends Client {
	utils!: Utils;
	devGuild?: Guild;
	devGuildUtils?: Utils;

	databaseHandler!: DatabaseHandler;
	commandHandler!: CommandHandler;
	interactionHandler!: InteractionHandler;
	conditionHandler!: ConditionHandler;
	jobHandler!: JobHandler;
	eventHandler!: EventHandler;

	constructor(override options: GrizClientOptions) {
		super(options);

		this.once(Events.ClientReady, async () => {
			this.databaseHandler = await DatabaseHandler.setup(this);

			Utils.client = this;
			this.utils = await Utils.get();

			if (this.options.devGuildId) {
				this.devGuildUtils = await Utils.get(this.options.devGuildId);
				this.devGuild = this.devGuildUtils.guild;
			}

			this.commandHandler = await CommandHandler.setup(this);
			this.interactionHandler = new InteractionHandler(this);

			this.conditionHandler = new ConditionHandler(this);
			this.jobHandler = new JobHandler(this);
			this.eventHandler = new EventHandler(this);
		});
	}
}
