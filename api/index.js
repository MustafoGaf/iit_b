require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const path = require("path");
const twilio = require("twilio");
const users = require("./users");
const { generateCode } = require("../userFunc");
const sendMail = require("../userFunc/sendMail");
const { sql } = require("@vercel/postgres");
// Create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(express.json());
app.use(express.static("public"));

let code = generateCode();
// для cors ========
app.use(
  cors({
    origin: "http://localhost:5173", // Разрешить только этот домен
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// ================= временое

// =================
app.post("/login", async function (req, res) {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user)
    return res
      .status(400)
      .json({ message: "Неверная электронная почта или пароль" });

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch)
    return res
      .status(400)
      .json({ message: "Неверная электронная почта или пароль" });

  code = generateCode();
  try {
    sendMail(user.email, code);
    res.status(200).json({
      message: "Код отправлен",
      code: 1, //auth
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка отправки", error: err.message });
  }
});

app.post("/auth", async (req, res) => {
  const { email, password, vcode } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });
  console.log(email, password, vcode, " code = ", code);
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });
  if (code !== vcode) return res.status(400).json({ message: "Invalid code" });
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
  //  Отправляем СМС
  // await client.messages.create({
  //   body: `Успешный вход на страница админстратора от эл.почта ${email}. Дата входа ${new Date()}`,
  //   from: process.env.TWILIO_PHONE,
  //   to: "+992902000436",
  // });

  res.json({ token });
});
// 🛡️ Middleware для проверки токена
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}

// 🔒 Защищённый маршрут
app.post("/addnews", verifyToken, (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "OK" });
});

app.get("/test", async (req, res) => {
  try {
    const test = await sql`SELECT * FROM test;`;
    if (test && test.rows.length > 0) {
      res.status(200).json({ message: "Ok", data: test.rows });
    } else {
      res.status(404).json({ message: " не существует" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получение данних из БД" });
  }
});

app.listen(3001, () => console.log("Server ready on port 3001."));

module.exports = app;
