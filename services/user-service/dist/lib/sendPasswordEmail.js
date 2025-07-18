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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordEmail = sendPasswordEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
function sendPasswordEmail(to, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: "thelma.yundt@ethereal.email",
                pass: "dkQerwMAK1qFWbPbJ8",
            },
        });
        const verifyURL = `${process.env.BASE_URL}/password-reset?token=${token}`;
        // send mail with defined transport object
        const info = yield transporter.sendMail({
            from: '"My Blog App" <no-reply@myblog.com>',
            to,
            subject: "Password Recover",
            text: "Hello world?",
            html: `
      <h1>Recover your password by clicking on the link below</h1>
      <p>recover password:</p>
      <a href="${verifyURL}">${verifyURL}</a>
    `, // html body
        });
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info)); // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    });
}
