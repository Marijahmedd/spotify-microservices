import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import path from "path";
import fs from "fs";

const privateKeyPath = path.join(
  __dirname,
  "../keys/cloudfront-private-key.pem"
);
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

export function generateSignedCloudFrontUrl(key: string) {
  const fullUrl = `${process.env.CLOUDFRONT_DOMAIN}/${key}`;
  console.log(fullUrl);
  return getSignedUrl({
    url: fullUrl,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey,
    dateLessThan: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
}
