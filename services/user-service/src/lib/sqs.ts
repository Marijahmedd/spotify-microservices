import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}); // change region as needed

export const enqueueEmailJob = async (
  type: "verify" | "reset",
  email: string,
  token: string
) => {
  const command = new SendMessageCommand({
    QueueUrl: process.env.SQS_EMAIL_QUEUE_URL!,
    MessageBody: JSON.stringify({ type, email, token }),
  });
  await sqs.send(command);
  console.log("event queued with this input: ", type, email, token);
};
