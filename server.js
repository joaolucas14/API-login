const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");

// Conexão com o MongoDB Atlas
const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://joaolucans:<240466jl>@cluster0.n6ejc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro de conexão:", err));

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Modelo de Usuário
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  favoritos: { type: [Number], default: [] },
});

const User = mongoose.model("User", userSchema);

const SECRET_KEY = "123456789";

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

// ✅ Rota para registrar um novo usuário
app.post("/public/registrar", async (req, res) => {
  const { username, senha } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ message: "Usuário já existe!" });
  }

  const novoUsuario = new User({
    username,
    senha,
    favoritos: [],
  });

  await novoUsuario.save();

  const access_token = createToken({ id: novoUsuario._id, username });

  res
    .status(201)
    .json({ access_token, user: { id: novoUsuario._id, username } });
});

// ✅ Rota para login do usuário
app.post("/public/login", async (req, res) => {
  const { username, senha } = req.body;

  const user = await User.findOne({ username, senha });
  if (!user) {
    return res.status(401).json({ message: "Usuário ou senha incorretos!" });
  }

  const access_token = createToken({ id: user._id, username });

  res.status(200).json({
    access_token,
    user: { id: user._id, username, favoritos: user.favoritos },
  });
});

// ✅ Middleware para proteger rotas privadas
app.use((req, res, next) => {
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
app.get("/user/me", async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado!" });
  }

  res
    .status(200)
    .json({ id: user._id, username: user.username, favoritos: user.favoritos });
});

// ✅ Rota para adicionar um favorito
app.post("/user/favoritos", async (req, res) => {
  const { idFavorito } = req.body;

  if (!idFavorito) {
    return res.status(400).json({ message: "ID do favorito é obrigatório!" });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado!" });
  }

  // Evita duplicatas
  if (!user.favoritos.includes(idFavorito)) {
    user.favoritos.push(idFavorito);
    await user.save();
  }

  res.status(200).json({ favoritos: user.favoritos });
});

// ✅ Rota para remover um item dos favoritos
app.delete("/user/favoritos/:id", async (req, res) => {
  const idFavorito = parseInt(req.params.id, 10);

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado!" });
  }

  // Remove o item da lista de favoritos
  user.favoritos = user.favoritos.filter((fav) => fav !== idFavorito);
  await user.save();

  res.status(200).json({ favoritos: user.favoritos });
});

// Rodar o servidor na porta dinâmica do Railway
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
