"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueEmailJob = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const sqs = new client_sqs_1.SQSClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
}); // change region as needed
const enqueueEmailJob = (type, email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const command = new client_sqs_1.SendMessageCommand({
        QueueUrl: process.env.SQS_EMAIL_QUEUE_URL,
        MessageBody: JSON.stringify({ type, email, token }),
    });
    yield sqs.send(command);
    console.log("event queued with this input: ", type, email, token);
});
exports.enqueueEmailJob = enqueueEmailJob;
