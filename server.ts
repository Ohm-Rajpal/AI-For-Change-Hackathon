import Fastify from "fastify";
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import z from "zod";
import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';


// Helper code for handling images with zod
const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const imageType = z.any().refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`).refine(
  (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
  "Only .jpg, .jpeg, .png and .webp formats are supported."
)

// Non-fastify, backend code. 
// This section has a few functions for running models. 

// Author: Ben
const loadImage = async (imagePath: string): Promise<tf.Tensor3D> => {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageTensor = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D;
    return imageTensor;
}

const loadModel = async (modelPath: string): Promise<tf.GraphModel> => {
    const model = await tf.loadGraphModel(`file://${path.resolve(modelPath)}`);
    return model;
}

const runModel = async (modelPath: string, imagePath: string): Promise<tf.Tensor> => {
    const model = await loadModel(modelPath);
    const imageTensor = await loadImage(imagePath);
    
    // Preprocess the image if necessary
    const resizedImage = tf.image.resizeBilinear(imageTensor, [400, 400]); // Example resize, adjust as needed
    const expandedImage = resizedImage.expandDims(0); // Add batch dimension
    
    const prediction = model.predict(expandedImage) as tf.Tensor;
    
    return prediction;
}




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
	url: "/demo", 
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
	},
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

// Test route for touching the model reading
server.withTypeProvider<ZodTypeProvider>().route({
	method: "GET", 
	url: "/modeltest", 
	handler: async (request, response) => {
		const data = await runModel("trained_model.pkl", "test.jpg");
		fs.writeFile("output.txt", data.as3D.toString(), () => {});
	}
})

// Don't touch this, we're gonna fix the port later
server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
