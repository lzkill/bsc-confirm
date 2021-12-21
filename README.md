# Biscoint Confirm Service

## Development

### Setup (Linux + Bash)

- Instale [nodenv](https://github.com/nodenv/nodenv#basic-github-checkout) e [node-build](https://github.com/nodenv/node-build#installation);

- Configure o ambiente e o projeto;

```bash
$ nodenv install 14.16.0 && \
  npm install -g @nestjs/cli && \
  nodenv rehash && \
  npm install -f && \
  npm run prepare
```

- Se a IDE de trabalho for VSCode, instale as extensões a seguir:

  - [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
  - [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [Generate Index](https://marketplace.visualstudio.com/items?itemName=JayFong.generate-index)

- Copie `config.example.json` para `config.json`, editando os valores onde necessário.

## Packing

Opcionalmente, pode-se gerar um executável da aplicação com o comando abaixo.

```bash
$ npm run pkg
```

A execução do arquivo gerado ainda depende da existência do `config.json` no diretório corrente.
