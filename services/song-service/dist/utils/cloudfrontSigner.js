"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignedCloudFrontUrl = generateSignedCloudFrontUrl;
const cloudfront_signer_1 = require("@aws-sdk/cloudfront-signer");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const privateKeyPath = path.join(
//   __dirname,
//   "../keys/cloudfront-private-key.pem"
// );
// const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
function generateSignedCloudFrontUrl(key) {
    const fullUrl = `${process.env.CLOUDFRONT_DOMAIN}/${key}`;
    console.log(fullUrl);
    return (0, cloudfront_signer_1.getSignedUrl)({
        url: fullUrl,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
        privateKey,
        dateLessThan: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
}
