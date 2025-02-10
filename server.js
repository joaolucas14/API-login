import fs from "fs";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import jsonServer from "json-server";
import cors from "cors";

// Configuração do JSON Server
const server = jsonServer.create();
const router = jsonServer.router("./database.json");
const SECRET_KEY = "123456789";
let userdb = JSON.parse(fs.readFileSync("./usuarios.json", "UTF-8"));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());
server.use(
  cors({
    origin: "*", // 🔹 Permite qualquer origem (para produção, substitua pelo domínio específico)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Função para criar um token JWT
function createToken(payload, expiresIn = "12h") {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Função para verificar um token JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}

// Verifica se o usuário existe no banco
function usuarioExiste(username, senha) {
  return userdb.usuarios.some(
    (user) => user.username === username && user.senha === senha
  );
}

// ✅ Rota para registrar um novo usuário
server.post("/public/registrar", (req, res) => {
  const { username, senha } = req.body;

  if (usuarioExiste(username, senha)) {
    return res.status(400).json({ message: "Usuário já existe!" });
  }

  const novoUsuario = {
    id:
      userdb.usuarios.length > 0
        ? userdb.usuarios[userdb.usuarios.length - 1].id + 1
        : 1,
    username,
    senha,
    favoritos: [],
  };

  userdb.usuarios.push(novoUsuario);
  fs.writeFileSync("./usuarios.json", JSON.stringify(userdb, null, 2));

  const access_token = createToken({ id: novoUsuario.id, username });

  res
    .status(201)
    .json({ access_token, user: { id: novoUsuario.id, username } });
});

// ✅ Rota para login do usuário
server.post("/public/login", (req, res) => {
  const { username, senha } = req.body;

  const user = userdb.usuarios.find(
    (user) => user.username === username && user.senha === senha
  );

  if (!user) {
    return res.status(401).json({ message: "Usuário ou senha incorretos!" });
  }

  const access_token = createToken({ id: user.id, username });

  // Retorna os dados do usuário, sem a senha
  res.status(200).json({
    access_token,
    user: { id: user.id, username, favoritos: user.favoritos },
  });
});

// ✅ Middleware para proteger rotas privadas
server.use((req, res, next) => {
  if (req.path.startsWith("/user/")) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido!" });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Token inválido ou expirado!" });
    }

    req.user = decoded;
  }
  next();
});

// ✅ Rota para obter os dados do usuário autenticado
server.get("/user/me", (req, res) => {
  const user = userdb.usuarios.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado!" });
  }

  res
    .status(200)
    .json({ id: user.id, username: user.username, favoritos: user.favoritos });
});

// ✅ Rota para adicionar um favorito
server.post("/user/favoritos", (req, res) => {
  const { idFavorito } = req.body; // ID do item a ser favoritado

  if (!idFavorito) {
    return res.status(400).json({ message: "ID do favorito é obrigatório!" });
  }

  const userIndex = userdb.usuarios.findIndex((u) => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: "Usuário não encontrado!" });
  }

  // Evita duplicatas
  if (!userdb.usuarios[userIndex].favoritos.includes(idFavorito)) {
    userdb.usuarios[userIndex].favoritos.push(idFavorito);
    fs.writeFileSync("./usuarios.json", JSON.stringify(userdb, null, 2));
  }

  res.status(200).json({ favoritos: userdb.usuarios[userIndex].favoritos });
});

// ✅ Rota para remover um item dos favoritos
server.delete("/user/favoritos/:id", (req, res) => {
  const idFavorito = parseInt(req.params.id, 10); // ID do item a ser removido

  const userIndex = userdb.usuarios.findIndex((u) => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: "Usuário não encontrado!" });
  }

  // Remove o item da lista de favoritos
  userdb.usuarios[userIndex].favoritos = userdb.usuarios[
    userIndex
  ].favoritos.filter((fav) => fav !== idFavorito);

  fs.writeFileSync("./usuarios.json", JSON.stringify(userdb, null, 2));

  res.status(200).json({ favoritos: userdb.usuarios[userIndex].favoritos });
});

// Adiciona o roteador do jsonServer para as rotas adicionais (como /posts, /comments, etc.)
server.use(router);

// Rodar a API
server.listen(8000, () => {
  console.log("API disponível em http://localhost:8000");
});
