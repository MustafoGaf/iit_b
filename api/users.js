const bcrypt = require("bcryptjs");

const users = [
  {
    id: 1,
    phone: "+992902000436",
    email: "gam200301@gmail.com",
    password: bcrypt.hashSync("12345", 8), // заранее хэшируем
  },
  {
    id: 2,
    phone: "+992",
    email: "tajikistan1.98@mail.ru",
    password: bcrypt.hashSync("admin", 8), // заранее хэшируем
  },
];

module.exports = users;
