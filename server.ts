import Fastify from "fastify";
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import z from "zod";

// Author: Arnab Ghosh
// Date: 6/28/2024
// Initializing Fastify
// Fastify is the Server framework we'll be using to create the web server that the mobile app will use to interface with the backend.
// We're just gonna use the logging options for now, as well as some type stuff.
const server = Fastify({
  logger: true,
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Handling a GET request. 
server.withTypeProvider<ZodTypeProvider>().route({
	method: "GET", 
	url: "demo", 
	schema: {
		querystring: z.object({
			message: z.string()
		}), 
		response: {
			200: z.string() // 200 is the OK HTTP code
		}
	}, 
	handler: async (request, response) => {
		// Get data!!! Notice query is how we get the body
		const messageExtraction = request.query.message;
		
		// Return stuff
		response.send(`${messageExtraction} : Based Goat Dissapproves`);
	}
})

// Handling a POST request. Notice we have automatic data validation, now we can use typescript to infer the shape of the data
server.withTypeProvider<ZodTypeProvider>().route({ 
	method: "GET", 
	url: "/demo", 
	schema: { 
		querystring: z.object({ 
			message: z.string() 
		}),
		response: { 
			200: z.string()
		}
	},
	handler: async (request, response) => {
		response.send("I hate you");
	}
});

// Don't touch this, we're gonna fix the port later
server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
