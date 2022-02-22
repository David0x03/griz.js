import { Utils } from '../utils';

interface EventOptions {
	event: string;
}

interface EventData {
	event: string;
}

export abstract class Event {
	data: EventData;

	constructor(options: EventOptions) {
		this.data = options;
	}

	run(utils: Utils, ...args: any): any {}
}
