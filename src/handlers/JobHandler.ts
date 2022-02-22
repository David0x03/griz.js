import { CronJob } from 'cron';
import { Events } from 'discord.js';
import { nanoid } from 'nanoid';
import { GrizClient } from '../GrizClient';
import { Job } from '../modules';
import { Utils } from '../utils';
import { BaseHandler } from './BaseHandler';

interface JobModel {
	_id: string;
	name: string;
	guild: string;
	date: Date;
	data?: any;
}

export class JobHandler extends BaseHandler {
	private jobs = new Map<string, Job>();
	private utils: Utils;

	constructor(client: GrizClient) {
		super(client);

		this.utils = this.client.utils;
		this.init();
	}

	private init() {
		const jobs = this.getModules<Job>('job');

		jobs.forEach((job) => {
			const { name } = job.data;
			if (name) this.jobs.set(name, job);
		});

		this.client.once(Events.ClientReady, async () => {
			jobs.forEach((job) => {
				const { cron, onReady } = job.data;
				if (onReady) job.run(this.utils, {});
				if (cron) this.createJob(cron, () => job.run(this.utils, {}));
			});

			const dbJobs: JobModel[] = await this.utils.db
				.collection('jobs')
				.find()
				.toArray();

			dbJobs.forEach(async (data) => this.createDBJob(data));
		});
	}

	async now<T>(name: string, guild: string, data?: any): Promise<T> {
		const utils = await Utils.get(guild);
		return this.jobs.get(name)?.run(utils, data) as any;
	}

	async schedule(name: string, date: number | Date, guild: string, data?: any) {
		const _id = nanoid(10);
		date = new Date(date);
		this.createDBJob({ _id, name, date, guild, data });
	}

	private async createDBJob({ _id, name, date, guild, data }: JobModel) {
		const runJob = async () => {
			const utils = await Utils.get(guild);
			const jobData = await utils.db.get('jobs', _id);
			if (!jobData) return;

			await this.jobs.get(name)?.run(utils, jobData.data ?? {});
			await utils.db.delete('jobs', _id);
		};

		if (date.getTime() < Date.now()) return runJob();

		await this.utils.db
			.collection('jobs')
			.insertOne({ _id, name, date, guild, data });
		this.createJob(date, runJob);
	}

	private async createJob(cronTime: string | Date, job: () => any) {
		return new CronJob({
			cronTime,
			onTick: job,
			timeZone: this.client.options.timezone,
			unrefTimeout: true,
			start: true
		});
	}
}
