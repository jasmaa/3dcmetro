// test/index.spec.ts
import { env } from 'cloudflare:workers';
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { http, HttpResponse } from "msw";
import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import worker from '../src/index';
import { server } from './server';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('API worker', () => {

	beforeAll(() => {
		vi.useFakeTimers();
		vi.setSystemTime(1663516715115);

		server.listen({
			onUnhandledRequest: "error",
		});
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	it('responds with train locations when getting /trainlocations', async () => {
		server.use(
			http.get(
				'https://gisservices.wmata.com/gisservices/rest/services/Public/TRAIN_LOC_WMS_PUB/MapServer/0/query?f=json&where=TRACKLINE%3C%3E%20%27Non-revenue%27%20and%20TRACKLINE%20is%20not%20null&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*',
				() => {
					return HttpResponse.json(
						{
							displayFieldName: "TRACKNAME",
						},
						{ status: 200 },
					);
				},
			),
		);

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
