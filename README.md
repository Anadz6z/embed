# Discord Bot with Advanced Menu System

Um bot do Discord moderno e robusto com sistema avançado de menus, construído com TypeScript e arquitetura melhorada.

## ✨ Características

- **Arquitetura Modular**: Estrutura bem organizada e escalável
- **Type Safety**: TypeScript completo com tipos rigorosos
- **Sistema de Logging Avançado**: Logging estruturado com níveis e contexto
- **Sistema de Cache**: Cache inteligente com TTL e limpeza automática
- **Tratamento de Erros Robusto**: Sistema de erros tipado e específico
- **Configuração Flexível**: Suporte a variáveis de ambiente e arquivos de configuração
- **Validação de Dados**: Validação com Zod para entrada de dados
- **Performance Monitoring**: Monitoramento de performance integrado
- **Graceful Shutdown**: Desligamento gracioso com limpeza de recursos
- **Testes**: Configuração completa para testes unitários

## 🚀 Instalação

### Pré-requisitos

- Node.js 18.0.0 ou superior
- npm ou yarn
- Bot do Discord configurado

### Configuração

1. **Clone o repositório**
   ```bash
   git clone https://github.com/yourusername/discord-bot-menus.git
   cd discord-bot-menus
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   # Discord Configuration
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_GUILD_ID=your_guild_id_for_development
   
   # Environment
   NODE_ENV=development
   
   # Logging (optional)
   LOG_LEVEL=debug
   LOG_FORMAT=text
   LOG_FILE_ENABLED=false
   
   # Cache (optional)
   CACHE_ENABLED=true
   CACHE_TTL=300
   CACHE_MAX_SIZE=1000
   ```

4. **Compile o projeto**
   ```bash
   npm run build
   ```

5. **Execute o bot**
   ```bash
   npm start
   ```

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Executa em modo desenvolvimento com hot reload
npm run build        # Compila o projeto
npm run start        # Executa o bot em produção
```

### Qualidade de Código
```bash
npm run lint         # Executa o linter
npm run lint:fix     # Corrige problemas do linter automaticamente
npm run format       # Formata o código com Prettier
npm run format:check # Verifica se o código está formatado
npm run type-check   # Verifica tipos TypeScript
```

### Testes
```bash
npm run test         # Executa os testes
npm run test:watch   # Executa testes em modo watch
npm run test:coverage # Executa testes com relatório de cobertura
```

### Docker
```bash
npm run docker:build # Constrói a imagem Docker
npm run docker:run   # Executa o container
npm run docker:stop  # Para e remove o container
npm run docker:logs  # Mostra logs do container
```

## 📁 Estrutura do Projeto

```
src/
├── discord/
│   ├── base/           # Classes base e tipos
│   ├── commands/       # Comandos slash
│   ├── events/         # Eventos do Discord
│   └── responders/     # Respondedores de interações
├── settings/           # Configurações e validação
├── shared/             # Utilitários compartilhados
└── index.ts           # Ponto de entrada
```

## 🔧 Arquitetura

### Sistema de Configuração
- **Configuração Hierárquica**: Variáveis de ambiente têm prioridade sobre arquivos
- **Validação com Zod**: Validação de tipos e valores em tempo de execução
- **Tipos TypeScript**: Configuração totalmente tipada

### Sistema de Logging
- **Níveis de Log**: ERROR, WARN, INFO, DEBUG, TRACE
- **Contexto Estruturado**: Metadados automáticos para cada log
- **Formato Flexível**: JSON para produção, texto para desenvolvimento
- **Logging de Arquivo**: Suporte opcional para logs em arquivo

### Sistema de Cache
- **TTL Automático**: Expiração automática de entradas
- **Limpeza Inteligente**: Limpeza periódica de entradas expiradas
- **Operações em Lote**: Suporte para operações múltiplas
- **Estatísticas**: Monitoramento de uso do cache

### Tratamento de Erros
- **Erros Tipados**: Classes de erro específicas para diferentes situações
- **Contexto Rico**: Informações detalhadas sobre erros
- **Recuperação Graceful**: Tratamento de erros sem quebrar a aplicação

## 📝 Comandos Disponíveis

### `/separators`
Cria separadores de canal com diferentes estilos.

**Opções:**
- `name` (obrigatório): Nome do separador
- `style` (opcional): Estilo do separador (simple, decorated, minimal, bold, fancy)
- `position` (opcional): Posição do separador (0 = topo)

**Permissões:** Gerenciar Canais

## 🔒 Segurança

- **Validação de Entrada**: Todas as entradas são validadas
- **Verificação de Permissões**: Verificação rigorosa de permissões
- **Rate Limiting**: Cooldown automático para comandos
- **Sanitização**: Limpeza de dados de entrada

## 🧪 Testes

O projeto inclui configuração completa para testes:

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm test -- --testNamePattern="separators"

# Executar com cobertura
npm run test:coverage
```

## 📊 Monitoramento

### Métricas Disponíveis
- **Performance**: Tempo de resposta dos comandos
- **Uso**: Estatísticas de uso por comando
- **Erros**: Taxa de erro e tipos de erro
- **Cache**: Hit rate e utilização do cache

### Logs Estruturados
```json
{
  "level": "INFO",
  "message": "Command executed: separators (150.25ms, success: true)",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "context": "Command",
  "userId": "123456789",
  "guildId": "987654321",
  "channelId": "555666777",
  "duration": 150.25,
  "success": true
}
```

## 🚀 Deploy

### Docker
```bash
# Construir imagem
docker build -t discord-bot .

# Executar container
docker run -d \
  --name discord-bot \
  --env-file .env \
  discord-bot
```

### Produção
```bash
# Instalar dependências de produção
npm ci --only=production

# Compilar
npm run build

# Executar
npm start
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação](docs/)
2. Procure por [issues existentes](https://github.com/yourusername/discord-bot-menus/issues)
3. Crie uma nova [issue](https://github.com/yourusername/discord-bot-menus/issues/new)

## 🔄 Changelog

### v1.0.0
- ✨ Arquitetura completamente reescrita
- 🔧 Sistema de configuração robusto
- 📊 Sistema de logging avançado
- 🚀 Sistema de cache inteligente
- 🛡️ Tratamento de erros melhorado
- 🧪 Configuração de testes
- 📝 Documentação completa