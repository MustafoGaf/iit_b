const bcrypt = require("bcryptjs");

const users = [
  {
    id: 1,
    phone: "+992902000436",
    email: "muga25006@gmail.com",
    password: bcrypt.hashSync("12345", 8), // заранее хэшируем
  },
  {
    id: 2,
    phone: "+992901512323",
    email: "yusufikomron4@gmail.com",
    password: bcrypt.hashSync("admin", 8), // заранее хэшируем
  },
];

module.exports = users;
