export function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 цифр
}

// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// client.messages
//   .create({
//     body: "Привет, Дима! Это тестовое SMS от Twilio 😊",
//     from: process.env.TWILIO_PHONE, // Номер, выданный Twilio
//     to: "+992902000436", // Твой номер (или пользователя)
//   })
//   .then((message) => console.log("Message SID:", message.sid))
//   .catch((err) => console.error("Error:", err));
