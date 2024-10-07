/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
require('dotenv').config();
const {
	GoogleGenerativeAI,
	HarmCategory,
	HarmBlockThreshold,
} = require("@google/generative-ai");

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
}

export default {
	async fetch(request, env, ctx) {
		// handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders })
		}
		function formatDate(date) {
			const yyyy = date.getFullYear();
			const mm = String(date.getMonth() + 1).padStart(2, '0');
			const dd = String(date.getDate()).padStart(2, '0');
			return `${yyyy}-${mm}-${dd}`;
		}

		function getDateNDaysAgo(n) {
			const now = new Date(); // current date and time
			now.setDate(now.getDate() - n); // subtract n days
			return formatDate(now);
		}

		const dates = {
			startDate: getDateNDaysAgo(30), // alter days to increase/decrease data set
			endDate: getDateNDaysAgo(0) // leave at 1 to get yesterday's data
		}

		const getAPI = async (url) => {
			try {
				const res = await fetch(url, {
					method: 'GET',
				});

				if (!res.ok) {
					return res.json().then(errorData => {
						throw new HttpError(res.status, errorData.message);
					});
				}

				const data = await res.json();
				return data;
			} catch (error) {
				console.error('Failed to fetch api', error);
			}
		}

		const datain = await request.json();
		// return new Response(JSON.stringify(datain));
		// return new Response(datain, { headers: corsHeaders });
		const url = `https://api.polygon.io/v2/aggs/ticker/${datain.ticker}/range/1/day/${dates.startDate}/${dates.endDate}?adjusted=true&sort=asc&apiKey=${env.POLYGON_API}`
		const apiKey = env.GEMINI_API;
		
		const cloudflareGatewayUrl = `https://gateway.ai.cloudflare.com/v1/f1883443a5ac867a686ab05466ec1510/gemini-gateway/google-ai-studio`
		const genAI = new GoogleGenerativeAI(apiKey,{
			baseUrl: cloudflareGatewayUrl
		});

		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-flash",
			
		});
		const generationConfig = {
			temperature: 1.1, // 0-2
			topP: 0.95,
			topK: 64,
			maxOutputTokens: 8192,
			responseMimeType: "text/plain",
			// responseMimeType: "application/json",
		};
		const chatSession = model.startChat({
			generationConfig,
		});
		const mes = 'I give the data on share prices over days, write a report of no more than 300 words describing the stocks performance and recommending whether to buy, hold or sell: '
		const data = await getAPI(url).then(data => { return data })
		const inputdataAsString = JSON.stringify(data)


		const result = await chatSession.sendMessage(mes + inputdataAsString);
		// getAPI(url).then(data=>{

		// 	run(data)
		// })
		return new Response(result.response.text(), { headers: corsHeaders });
	},

};

