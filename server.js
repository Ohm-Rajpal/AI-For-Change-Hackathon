"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
// Initializing Fastify
// Fastify is the Server framework we'll be using to create the web server that the mobile app will use to interface with the backend. 
// We're just gonna use the logging options for now. 
const server = (0, fastify_1.default)({
    logger: true
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
