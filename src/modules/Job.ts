import { Utils } from '../utils';

interface JobOptions {
	name?: string;
	cron?: string;
	onReady?: boolean;
}

interface JobData {
	name?: string;
	cron?: string;
	onReady?: boolean;
}

export abstract class Job {
	data: JobData;

	constructor(options: JobOptions = {}) {
		this.data = options;
	}

	run(utils: Utils, ...args: any): any {}
}
