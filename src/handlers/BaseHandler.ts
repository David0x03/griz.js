import { sync } from 'glob';
import { relative } from 'path';
import { GrizClient } from '../GrizClient';

export abstract class BaseHandler {
	constructor(public client: GrizClient) {}

	protected getModules<T>(name: string): T[] {
		const directory = this.client.options.directory;
		const files = sync(`${directory}/**/*.${name}.js`);

		return files.map((file) => {
			const Module = require(relative(__dirname, file)).default;
			return new Module();
		});
	}
}
