import { SimpleServer } from "@zooduck/simple-server";

const server = new SimpleServer({ staticPath: 'src' });

server.start();
