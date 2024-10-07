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

export default {
	async fetch(request, env, ctx) {
		const apiKey = env.GEMINI_API;
		const genAI = new GoogleGenerativeAI(apiKey);

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
		const result = await chatSession.sendMessage("Who is the 45th president of US");
		// getAPI(url).then(data=>{

		// 	run(data)
		// })
		return new Response(result.response.text());
	},


};

// async function run(data) {
//     const chatSession = model.startChat({
//         generationConfig,
//     });
//     const inputdataAsString = JSON.stringify(data)

//     const mes = 'I give the data on share prices over days, write a report of no more than 300 words describing the stocks performance and recommending whether to buy, hold or sell: '
//     const result = await chatSession.sendMessage(mes+inputdataAsString);
//     console.log(result.response.text());
// }

// const url = `https://api.polygon.io/v2/aggs/ticker/SAVE/range/1/day/2024-09-01/2024-10-06?adjusted=true&sort=asc&apiKey=R60M8xeij33TKWT2BGVZ10rMMcH0hPL6`

