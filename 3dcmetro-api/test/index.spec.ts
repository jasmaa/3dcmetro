// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, fetchMock } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('API worker', () => {

	beforeAll(() => {
		fetchMock.activate();
		fetchMock.disableNetConnect();
	});

	it('responds with train locations when getting /trainlocations', async () => {
		const origin = fetchMock.get('https://gisservices.wmata.com');
		origin
			.intercept({ path: `/gisservices/rest/services/Public/TRAIN_LOC_WMS_PUB/MapServer/0/query?f=json&where=TRACKLINE%3C%3E%20%27Non-revenue%27%20and%20TRACKLINE%20is%20not%20null&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*`, method: 'GET' })
			.reply(200, {
				displayFieldName: "TRACKNAME",
			});

		const request = new IncomingRequest('http://example.com/trainlocations');

		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);

		await waitOnExecutionContext(ctx);

		expect(await response.status).toBe(200);
		expect(await response.json()).not.toBeUndefined();
	});

	it('responds with not found for unknown path', async () => {
		const request = new IncomingRequest('http://example.com/path/to/the/unknown');

		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);

		await waitOnExecutionContext(ctx);
		expect(await response.status).toBe(404);
	});
});
