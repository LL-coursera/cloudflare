const {GoogleGenerativeAI,} = require("@google/generative-ai");

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
}
const cloudflareGatewayUrl = `https://gateway.ai.cloudflare.com/v1/f1883443a5ac867a686ab05466ec1510/gemini-gateway/google-ai-studio`

export default {
	async fetch(request, env, ctx) {
		// handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders })
		}
		try {
			const apiKey = env.GEMINI_API;
		
			const genAI = new GoogleGenerativeAI(apiKey,{
				baseUrl: cloudflareGatewayUrl
			});
			const mes = 'I give the data on share prices over days, write a report of no more than 500 words describing the stocks performance and recommending whether to buy, hold or sell: '
			const datain = await request.json();
			const inputdataAsString = JSON.stringify(datain)

			const model = genAI.getGenerativeModel({model: "gemini-1.5-flash",});
			const generationConfig = {
				temperature: 1.1, // 0-2
				topP: 0.95,
				topK: 64,
				maxOutputTokens: 8192,
				responseMimeType: "text/plain",
			};
			const chatSession = model.startChat({
				generationConfig,
			});

			const result = await chatSession.sendMessage(mes + inputdataAsString);
			return new Response(result.response.text(), { headers: corsHeaders });
		} catch (error) {
			return new Response(JSON.stringify({error:error}), { headers: corsHeaders });
		}
	},
};

