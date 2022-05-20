import {
	ApplicationCommand,
	ApplicationCommandData,
	ApplicationCommandManager,
	Collection,
	GuildApplicationCommandManager
} from 'discord.js';
import { GrizClient } from '../GrizClient';
import { Command } from '../modules';
import { BaseHandler } from './BaseHandler';

export class CommandHandler extends BaseHandler {
	commands = new Map<string, Command>();

	static async setup(client: GrizClient) {
		const commandHandler = new CommandHandler(client);
		await commandHandler.init();
		return commandHandler;
	}

	private async init() {
		const commands = this.getModules<Command>('cmd');
		const { mode } = this.client.options;
		const { devGuild } = this.client;

		if (devGuild) {
			const toAdd = commands.filter(
				(command) => mode === 'development' || command.data.devGuildOnly
			);

			if (devGuild) await this.addCommandsTo(devGuild.commands, toAdd);
		}

		if (mode === 'production') {
			const toAdd = commands.filter((command) => !command.data.devGuildOnly);
			if (this.client.application)
				await this.addCommandsTo(this.client.application.commands, toAdd);
		}
	}

	private async addCommandsTo(
		commandManager: GuildApplicationCommandManager | ApplicationCommandManager,
		commands: Command[]
	) {
		const commandData = commands.map((command) => command.data);
		let appCommands = await commandManager.fetch({}).catch(() => undefined);

		if (!appCommands || this.commandsOutdated(appCommands, commandData))
			appCommands = await commandManager
				.set(commandData)
				.catch((e) => (console.error(e), undefined));

		appCommands?.forEach((command) => {
			const cmd = commands.find(({ data }) => command.equals(data));
			if (cmd) this.commands.set(command.id, cmd);
		});
	}

	private commandsOutdated(
		appCommands: Collection<string, ApplicationCommand>,
		commandData: ApplicationCommandData[]
	) {
		if (commandData.length !== appCommands.size) return true;
		return !commandData.every((data) =>
			appCommands.some((command) => command.equals(data))
		);
	}
}
