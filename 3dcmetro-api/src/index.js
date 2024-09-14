// TODO: port to rescript

import { Router } from 'tiny-request-router';

const allowedOrigins = ["http://localhost:8080", "https://jasonmaa.com"];

const router = new Router();

router
	.get('/trainlocations', async () => {
		console.log("Received /trainlocations request")
		const res = await fetch('https://gisservices.wmata.com/gisservices/rest/services/Public/TRAIN_LOC_WMS_PUB/MapServer/0/query?f=json&where=TRACKLINE%3C%3E%20%27Non-revenue%27%20and%20TRACKLINE%20is%20not%20null&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*');
		return new Response(res.body, {
			headers: {
				"Content-Type": "application/json",
			},
		});
	})
	.get('/', async () => {
		return new Response('Hello World!');
	})

async function cors(request, cb) {
	const headers = request.headers;
	const origin = headers.get("Origin");

	// Not CORS request
	if (!origin) {
		return cb();
	}

	// Reject non-allow allowlisted origins
	if (!allowedOrigins.includes(origin)) {
		return new Response(null, {
			status: 404,
		});
	}

	if (request.method === "OPTIONS") {
		if (
			origin &&
			headers.get("Access-Control-Request-Method") &&
			headers.get("Access-Control-Request-Headers")
		) {
			// Handle pre-flight
			let respHeaders = {
				"Access-Control-Allow-Origin": headers.get("Origin"),
				"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
				"Access-Control-Max-Age": "86400",
			}
			return new Response(null, {
				headers: respHeaders,
			});
		}
		else {
			// Handle normal OPTIONS
			return new Response(null, {
				headers: {
					"Allow": "GET, OPTIONS",
				},
			})
		}
	} else {
		const resp = await cb();
		resp.headers.set("Access-Control-Allow-Origin", headers.get("Origin"));
		resp.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
		return resp;
	}
}

export default {
	async fetch(request, env, ctx) {
		return cors(request, async () => {
			const { pathname } = new URL(request.url);
			const match = router.match(request.method, pathname)
			if (match) {
				return match.handler(match.params);
			}
		});
	},
};
