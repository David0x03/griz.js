import { CommandInteraction } from 'discord.js';
import { Command } from '../../modules';
import { Utils } from '../../utils';

interface DBCooldown {
	startedAt: Date;
	usages: number;
}

export async function isOnCooldown(
	interaction: CommandInteraction,
	command: Command,
	utils: Utils
) {
	if (!command.data.cooldown) return false;
	const { interval, usages = 1 } = command.data.cooldown;

	const path = `${interaction.commandId}.cooldowns`;
	const cooldown = await getCooldown(interaction, utils, path);
	const endsAt = cooldown.startedAt.getTime() + interval * 1000;

	if (endsAt <= Date.now()) {
		await utils.db.updateUser(interaction.user.id, {
			$set: { [path]: { startedAt: new Date(), usages: 1 } }
		});
		return false;
	}

	if (cooldown.usages + 1 <= usages) {
		await utils.db.updateUser(interaction.user.id, {
			$inc: { [`${path}.usages`]: 1 }
		});
		return false;
	}

	await command.onCooldown(utils, interaction, new Date(endsAt));
	return true;
}

async function getCooldown(
	interaction: CommandInteraction,
	utils: Utils,
	path: string
): Promise<DBCooldown> {
	const cooldown = await utils.db.user(interaction.user.id, path);
	return cooldown ?? { startedAt: new Date(0), usages: 0 };
}
