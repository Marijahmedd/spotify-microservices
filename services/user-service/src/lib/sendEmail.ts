import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, token: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "thelma.yundt@ethereal.email",
      pass: "dkQerwMAK1qFWbPbJ8",
    },
  });

  const verifyURL = `${process.env.BASE_URL}/verify-email?token=${token}`;

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"My Blog App" <no-reply@myblog.com>',
    to,
    subject: "Email Verification",
    text: "Hello world?",
    html: `
      <h1>Verify your Email</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyURL}">${verifyURL}</a>
    `, // html body
  });

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}
