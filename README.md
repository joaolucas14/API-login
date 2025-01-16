API de Gerenciamento de Livros e Usuários
Esta API permite o gerenciamento de usuários e livros com as operações CRUD (Criar, Ler, Atualizar, Excluir). As funcionalidades incluem o registro de novos usuários, login, e consulta de livros lançados e mais vendidos.

Índice
Tecnologias
Instalação
Endpoints
Usuários
Livros
Exemplo de Requisições
Estrutura do Projeto
Contribuições
Licença
Tecnologias
Node.js: Ambiente de execução para JavaScript no servidor.
Express.js: Framework para criação da API RESTful.
bcryptjs: Biblioteca para criptografia de senhas.
UUID: Biblioteca para geração de identificadores únicos.
Instalação
Clone o repositório:

bash
Copiar
Editar
git clone https://github.com/seuusuario/seu-repositorio.git
cd seu-repositorio
Instale as dependências:

bash
Copiar
Editar
npm install
Execute o servidor:

bash
Copiar
Editar
npm start
O servidor estará rodando na porta 3000 por padrão.

Endpoints
Usuários
POST /public/registrar
Cria um novo usuário.

Requisição:

Corpo (JSON):
json
Copiar
Editar
{
"email": "novoemail@example.com",
"senha": "123456",
"nome": "Novo Usuário",
"endereco": "Rua Exemplo, 123",
"complemento": "Apto 2",
"cep": "12345-678"
}
Resposta:

Código de status: 201 Created
Corpo (JSON):
json
Copiar
Editar
{
"mensagem": "Usuário criado com sucesso"
}
POST /public/login
Realiza login de um usuário.

Requisição:

Corpo (JSON):
json
Copiar
Editar
{
"email": "usuario@example.com",
"senha": "123456"
}
Resposta:

Código de status: 200 OK
Corpo (JSON):
json
Copiar
Editar
{
"mensagem": "Login realizado com sucesso",
"token": "JWT_Token_Aqui"
}
GET /public/me
Retorna informações do usuário autenticado.

Requisição:
Cabeçalhos:
Authorization: Bearer <JWT_Token_Aqui>
Resposta:
Código de status: 200 OK
Corpo (JSON):
json
Copiar
Editar
{
"email": "usuario@example.com",
"nome": "Nome do Usuário",
"endereco": "Rua Exemplo, 123",
"cep": "12345-678"
}
Livros
GET /public/lancamentos
Retorna uma lista de livros lançados.

Resposta:
Código de status: 200 OK
Corpo (JSON):
json
Copiar
Editar
[
{
"id": "uuid-do-livro",
"titulo": "Título do Livro",
"autor": "Autor do Livro",
"dataLancamento": "2025-01-01"
},
...
]
GET /public/mais-vendidos
Retorna uma lista de livros mais vendidos.

Resposta:
Código de status: 200 OK
Corpo (JSON):
json
Copiar
Editar
[
{
"id": "uuid-do-livro",
"titulo": "Título do Livro",
"autor": "Autor do Livro",
"quantidadeVendas": 1500
},
...
]
Exemplo de Requisições
Criar Usuário
bash
Copiar
Editar
curl -X POST http://localhost:3000/public/registrar \
-H "Content-Type: application/json" \
-d '{
"email": "novoemail@example.com",
"senha": "123456",
"nome": "Novo Usuário",
"endereco": "Rua Exemplo, 123",
"complemento": "Apto 2",
"cep": "12345-678"
}'
Login de Usuário
bash
Copiar
Editar
curl -X POST http://localhost:3000/public/login \
-H "Content-Type: application/json" \
-d '{
"email": "usuario@example.com",
"senha": "123456"
}'
Consultar Livros Lançados
bash
Copiar
Editar
curl -X GET http://localhost:3000/public/lancamentos
Consultar Livros Mais Vendidos
bash
Copiar
Editar
curl -X GET http://localhost:3000/public/mais-vendidos
Estrutura do Projeto
bash
Copiar
Editar
/src
/controllers
usuarioController.js
livroController.js
/models
usuarioModel.js
livroModel.js
/routes
usuarioRoutes.js
livroRoutes.js
/middleware
authMiddleware.js
/utils
jwtUtils.js
/database
database.json
/server.js
/package.json
Contribuições
Sinta-se à vontade para fazer contribuições! Para isso:

Faça o fork do repositório.
Crie uma branch para a sua feature (git checkout -b feature/nome-da-feature).
Commit suas alterações (git commit -am 'Adiciona nova feature').
Envie para a branch (git push origin feature/nome-da-feature).
Abra um pull request.
Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para mais detalhes.
