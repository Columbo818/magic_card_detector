import throttle from 'promise-parallel-throttle';
import fetch from 'node-fetch';
import lodash from 'lodash';
import fs from 'fs';
import { exit } from 'process';

const getPage = async (page) => {
	console.info(`Fetching page ${page}`);
	const res = await fetch(`https://api.magicthegathering.io/v1/cards?page=${page}`, {
		method: 'GET',
		headers: { accept: 'application/json' },
		body: null,
	});
	const body = await res.json();
	return body.cards;
};
(async () => {
	const res = await fetch(`https://api.magicthegathering.io/v1/cards?page=0`, {
		method: 'GET',
		headers: { accept: 'application/json' },
		body: null,
	});
	const links = res.headers.get('link');
	const link = links.split(';')[0]
	const result = Number(link.substring(link.length-4, link.length-1));
	// starts from 0..
	const queue = Array.from({ length: result })
		.map((_, i) => () => getPage(i));
	console.warn(`generated ${queue.length} pages to fetch...`);
	const results = await throttle.all(queue, {
		maxInProgress: 30,
		progressCallback: res => {
			console.info("Progress update:");
			console.table({
				completed: res.amountDone,
				started: res.amountStarted,
				rejected: res.amountRejected,
			});
		}
	});
	const flatres = lodash.flatten(results);
    console.log(flatres.length);
    await fs.writeFileSync('cards.json', JSON.stringify(flatres));
})();