const nodemailer = require("nodemailer");
require("dotenv").config();
const tranporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
function sendMail(to, code) {
  console.log("email to => ", to, " code =>", code);

  const mailOption = {
    from: "muga200301@gmail.com",
    to: to,
    subject: "Код подтверждения",
    html: `
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0;">
  <div style="max-width: 500px; margin: 30px auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    
    <div style="text-align: center; font-size: 22px; font-weight: bold; color: #333333; margin-bottom: 20px;">
      Ваш код подтверждения
    </div>

    <div style="font-size: 16px; color: #555555; line-height: 1.6; text-align: center;">
      Используйте приведённый ниже код для завершения процесса входа или подтверждения действия.
    </div>

    <div style="text-align: center; font-size: 32px; font-weight: bold; color: #4CAF50; background-color: #f0f9f4; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
      ${code}
    </div>

    <div style="font-size: 16px; color: #555555; line-height: 1.6; text-align: center;">
      Код действителен в течение 10 минут. Не сообщайте его никому.
    </div>

    <div style="font-size: 12px; color: #999999; text-align: center; margin-top: 30px;">
      Если вы не запрашивали этот код, просто проигнорируйте это письмо.
    </div>

  </div>
</body>
    `,
  };

  tranporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Успешно");
    }
  });
}

module.exports = sendMail;
