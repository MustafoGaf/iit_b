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
app.use(express.static("public"));
app.use(express.json({ limit: "10mb" }));
let code = generateCode();
// для cors ========
app.use(
  cors({
    origin: "https://iit-eight.vercel.app", // Разрешить только этот домен
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
  try {
    sendMail("muga200301@gmail.com", email);
  } catch (error) {}

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

app.get("/sliders", async (req, res) => {
  try {
    const sliders = await sql`SELECT * FROM sliders;`;
    if (sliders && sliders.rows.length > 0) {
      res.status(200).json({ message: "Ok", data: sliders.rows });
    } else {
      res.status(404).json({ message: " не существует" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получение данних из БД" });
  }
});
app.get("/news", async (req, res) => {
  try {
    const news = await sql`SELECT * FROM news order by id desc;`;
    if (news && news.rows.length > 0) {
      res.status(200).json({ message: "Ok", data: news.rows });
    } else {
      res.status(404).json({ message: " не существует" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получение данних из БД" });
  }
});

// 🔒 Защищённый маршрут
app.post("/addnews", verifyToken, (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.post("/refresh", verifyToken, async (req, res) => {
  const decode = jwt.verify(req.body.token, process.env.JWT_SECRET);
  const token = jwt.sign(
    { id: decode.id, email: decode.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.json({ token });
});

app.post("/slider", verifyToken, async (req, res) => {
  console.log(">>>1");

  try {
    await sql`INSERT INTO sliders (link, image, title_ru, title_en, title_tj, order_number) VALUES (${req.body.link}, ${req.body.image}, ${req.body.title_ru},  ${req.body.title_en},  ${req.body.title_tj},  ${req.body.order_number});`;
    res.status(200).json({ message: "Успешно" });
  } catch (error) {
    res.status(500).send("Error!!");
  }
});

app.delete("/slider/:id", verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await sql`DELETE FROM sliders WHERE id=${id}`;
    res.status(200).json({ message: "Успешно" });
  } catch (error) {
    res.status(500).send("Error!!");
  }
});
app.put("/slider/:id", verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await sql`UPDATE sliders set link = ${req.body.link}, image = ${req.body.image}, title_ru = ${req.body.title_ru}, title_en = ${req.body.title_en}, title_tj = ${req.body.title_tj}, order_number = ${req.body.order_number}  WHERE id=${id}`;
    res.status(200).json({ message: "Успешно" });
  } catch (error) {
    res.status(500).send("Error!!");
  }
});

// for News

app.post("/news", verifyToken, async (req, res) => {
  console.log(">>>1");

  try {
    await sql`INSERT INTO news (
  image, 
  title_ru,
  title_en,
  title_tj, 
  desc_ru,
  desc_en,
  desc_tj,
  created_at, 
  order_number,
  is_active) VALUES 
  (${req.body.image}, ${req.body.title_ru}, ${req.body.title_en},  ${req.body.title_tj},  ${req.body.desc_ru},  ${req.body.desc_en},  ${req.body.desc_tj},  TO_TIMESTAMP(${req.body.created_at}, 'YYYY-MM-DD"T"HH24:MI')::TIMESTAMP,  ${req.body.order_number},  ${req.body.is_active});`;
    res.status(200).json({ message: "Успешно" });
  } catch (error) {
    res.status(500).send("Error!!");
  }
});

app.delete("/news/:id", verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await sql`DELETE FROM news WHERE id=${id}`;
    res.status(200).json({ message: "Успешно" });
  } catch (error) {
    res.status(500).send("Error!!");
  }
});
app.put("/news/:id", verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await sql`UPDATE news set image = ${req.body.image}, 
  title_ru = ${req.body.title_ru},
  title_en = ${req.body.title_en},
  title_tj = ${req.body.title_tj}, 
  desc_ru = ${req.body.desc_ru},
  desc_en = ${req.body.desc_en},
  desc_tj = ${req.body.desc_tj},
  created_at = TO_TIMESTAMP(${req.body.created_at}, 'YYYY-MM-DD"T"HH24:MI')::TIMESTAMP, 
  order_number = ${req.body.order_number} ,
  is_active = ${req.body.is_active}  WHERE id=${id}`;
    res.status(200).json({ message: "Успешно" });
  } catch (error) {
    res.status(500).send("Error!!");
  }
});

app.listen(3001, () => console.log("Server ready on port 3001."));

module.exports = app;
