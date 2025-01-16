const fs = require("fs");
const bodyParser = require("body-parser");
const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");

const server = jsonServer.create();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = "123456789";
let userdb = JSON.parse(fs.readFileSync("./usuarios.json", "UTF-8"));

function createToken(payload, expiresIn = "12h") {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function usuarioExiste({ email, senha }) {
  return (
    userdb.usuarios.findIndex(
      (user) => user.email === email && user.senha === senha
    ) !== -1
  );
}

function emailExiste(email) {
  return userdb.usuarios.findIndex((user) => user.email === email) !== -1;
}

server.post("/public/registrar", (req, res) => {
  const { email, senha, nome } = req.body;

  if (emailExiste(email)) {
    res.status(401).json({ status: 401, message: "E-mail já foi utilizado!" });
    return;
  }

  fs.readFile("./usuarios.json", (err, data) => {
    if (err) {
      res.status(401).json({ status: 401, message: err });
      return;
    }

    const json = JSON.parse(data.toString());
    const last_item_id =
      json.usuarios.length > 0 ? json.usuarios[json.usuarios.length - 1].id : 0;
    json.usuarios.push({ id: last_item_id + 1, email, senha, nome });

    fs.writeFile("./usuarios.json", JSON.stringify(json), (err) => {
      if (err) {
        res.status(401).json({ status: 401, message: err });
        return;
      }
    });
    userdb = json;
  });

  const access_token = createToken({ email, senha });
  res.status(200).json({ access_token });
});

server.post("/public/login", (req, res) => {
  const { email, senha } = req.body;

  if (!usuarioExiste({ email, senha })) {
    res
      .status(401)
      .json({ status: 401, message: "E-mail ou senha incorretos!" });
    return;
  }

  const access_token = createToken({ email, senha });
  const user = {
    ...userdb.usuarios.find(
      (user) => user.email === email && user.senha === senha
    ),
  };
  delete user.senha;

  res.status(200).json({ access_token, user });
});

server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
