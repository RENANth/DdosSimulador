
# Aplicação de Teste DDoS

Uma aplicação web construída com Express.js e React para executar e monitorar testes DDoS.

## Funcionalidades

- Autenticação de usuário (login/registro)
- Gerenciamento de servidores
- Execução e monitoramento de testes DDoS
- Atualizações em tempo real via WebSocket
- Componentes modernos de UI usando Radix UI e Tailwind CSS

## Stack Tecnológica

- **Backend**: Express.js com TypeScript
- **Frontend**: React com TypeScript
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Autenticação**: Passport.js
- **Comunicação em Tempo Real**: WebSocket
- **Componentes UI**: Radix UI
- **Estilização**: Tailwind CSS

## Como Começar

1. Clique no botão "Run" para iniciar o servidor de desenvolvimento
2. A aplicação estará disponível na porta 5000
3. Registre uma nova conta para começar a usar a aplicação

## Estrutura do Projeto

```
├── client/          # Aplicação React (Frontend)
├── server/          # Aplicação Express (Backend)
├── shared/          # Tipos e schemas compartilhados
```

## Endpoints da API

- `POST /api/login` - Login do usuário
- `POST /api/register` - Registro de usuário
- `GET /api/servers` - Listar servidores
- `POST /api/servers` - Criar servidor
- `POST /api/ddos-tests` - Criar teste DDoS
- `GET /api/ddos-tests/:id/logs` - Obter logs do teste

## Eventos WebSocket

- `NEW_TEST` - Transmitido quando um novo teste é criado
- `NEW_LOG` - Transmitido quando uma nova entrada de log é recebida
