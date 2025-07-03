# Contributing to Event Horizon MCP Server

Thanks for taking the time to contribute to Event Horizon! All types of contributions are encouraged and valued.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Ask Questions

Before you ask a question, it is best to search for existing [Issues](https://github.com/manasp21/EventHorizon/issues) that might help you. If you have found a suitable issue and still need clarification, you can write your question in this issue.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/manasp21/EventHorizon/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (Node.js, TypeScript, MCP SDK version).

## Development Setup

### Prerequisites

- **Node.js**: Ensure Node.js (LTS version 18.x or 20.x) and npm are installed
- **TypeScript**: Knowledge of TypeScript is required
- **MCP Knowledge**: Familiarity with [Model Context Protocol](https://modelcontextprotocol.io/) is helpful

### Quick Start

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/EventHorizon.git
   cd EventHorizon
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Test Local Installation**
   ```bash
   # Test stdio server (for Claude Desktop)
   node dist/index.js
   
   # Test HTTP server (for Smithery)
   node dist/http_server.js
   ```

## Project Structure

```
EventHorizon/
├── src/
│   ├── index.ts          # Stdio MCP server (Claude Desktop)
│   ├── http_server.ts    # HTTP MCP server (Smithery)
│   └── mcp_core.ts       # Evolutionary algorithm engine
├── dist/                 # Compiled JavaScript
├── smithery.yaml         # Smithery deployment config
├── Dockerfile           # Container deployment
└── README.md
```

## MCP Server Development Guidelines

### Understanding Event Horizon

Event Horizon implements **evolutionary algorithms** through 5 core MCP tools:

1. **`start_evolution`**: Initialize evolutionary system with problem and consistency checks
2. **`add_solution`**: Add solution candidates to current generation
3. **`score_solution`**: Evaluate solutions against consistency checks (0.0-1.0 scale)
4. **`evolve_generation`**: Analyze performance and provide crossover recommendations
5. **`get_evolution_status`**: Monitor progress and view evolution statistics

### Evolutionary Algorithm Concepts

- **Generations**: Multiple iterations of solution evolution
- **Population**: Set of solutions in each generation
- **Consistency Checks**: Evaluation criteria for solutions
- **Crossover**: Combining best aspects of different solutions
- **Convergence**: Reaching optimal solution scores

## Contributing Guidelines

### Bug Reports

Use GitHub issues to track public bugs. When filing a bug report, please include:

- **MCP Server Version**: Check `package.json` version
- **Environment**: Node.js version, deployment method (local/Smithery)
- **Tool Context**: Which of the 5 evolutionary tools is affected
- **Steps to Reproduce**: Minimal example to demonstrate the issue
- **Expected vs Actual Behavior**: Clear description of the problem
- **Client Used**: Claude Desktop, VS Code, or other MCP client

### Feature Requests

We welcome suggestions for:

- **New Evolutionary Algorithms**: Enhanced genetic algorithms, different selection strategies
- **Additional MCP Tools**: New tools for the evolutionary process
- **Performance Improvements**: Optimization for large populations or complex problems
- **Integration Features**: Better Smithery deployment, new client support

### Pull Request Process

1. **Fork** the repo and create your branch from `main`
2. **Make Changes** following our coding standards
3. **Add Tests** if you've added code that should be tested
4. **Update Documentation** if you've changed APIs or added features
5. **Ensure Tests Pass** and code builds successfully
6. **Run Linting** and fix any issues
7. **Create Pull Request** with clear description

#### PR Requirements

- [ ] Code builds without errors (`npm run build`)
- [ ] All tests pass (if applicable)
- [ ] TypeScript compilation succeeds
- [ ] Both stdio and HTTP servers work correctly
- [ ] MCP protocol compliance maintained
- [ ] Documentation updated for new features
- [ ] Smithery deployment compatibility verified

### Code Style Guidelines

#### TypeScript Standards

- Use **TypeScript strict mode** - all code must compile without errors
- **Explicit types** for all function parameters and returns
- **No `any` types** - use proper typing or generic constraints
- **Async/await** for all asynchronous operations
- **Error handling** with proper try/catch blocks

#### MCP Protocol Standards

- **Tool definitions** must include complete `inputSchema`
- **Error responses** must follow MCP error format
- **Response format** must match MCP specification
- **Tool execution** must be deterministic where possible

#### Evolutionary Algorithm Standards

- **Scoring functions** must return values between 0.0 and 1.0
- **Generation tracking** must be consistent and accurate
- **Solution IDs** must be unique and traceable
- **Crossover logic** must preserve parent relationship tracking

### Testing Guidelines

#### Unit Testing

- Test **individual evolutionary algorithm functions**
- Test **MCP tool input validation**
- Test **scoring and convergence logic**
- Mock **external dependencies**

#### Integration Testing

- Test **complete evolutionary workflows**
- Test **MCP protocol compliance**
- Test **both stdio and HTTP transports**
- Test **error handling and edge cases**

#### Performance Testing

- Test with **large populations** (100+ solutions)
- Test **complex consistency checks** (10+ criteria)
- Test **long evolution runs** (20+ generations)
- Monitor **memory usage** and **processing time**

### Algorithm Contributions

When contributing evolutionary algorithm improvements:

#### Genetic Algorithm Enhancements

- **Selection strategies**: Tournament, roulette wheel, rank-based
- **Crossover methods**: Single-point, multi-point, uniform
- **Mutation operators**: Random, guided, adaptive
- **Fitness evaluation**: Multi-objective, constraint handling

#### Performance Optimizations

- **Parallel evaluation**: Concurrent solution scoring
- **Caching strategies**: Memoization of expensive calculations
- **Early termination**: Smart convergence detection
- **Memory management**: Efficient solution storage

#### New Features

- **Problem templates**: Pre-configured problem types
- **Visualization tools**: Progress tracking and analysis
- **Export capabilities**: Solution history and statistics
- **Configuration presets**: Common algorithm configurations

## Deployment Testing

### Local Testing

```bash
# Test stdio server with Claude Desktop
npm run build
node dist/index.js

# Test HTTP server for Smithery
PORT=8000 node dist/http_server.js
curl http://localhost:8000/health
```

### Smithery Testing

```bash
# Test container build
docker build -t event-horizon-test .
docker run -p 8000:8000 event-horizon-test

# Test MCP endpoints
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

## Release Process

1. **Version Bump**: Update version in `package.json`
2. **Changelog**: Document all changes
3. **Testing**: Verify all functionality
4. **Build**: Ensure clean build
5. **Tag**: Create git tag for release
6. **Deploy**: Update Smithery deployment

## Getting Help

- **Documentation**: [MCP Protocol Docs](https://modelcontextprotocol.io/)
- **Issues**: [GitHub Issues](https://github.com/manasp21/EventHorizon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/manasp21/EventHorizon/discussions)
- **Smithery**: [Event Horizon on Smithery](https://smithery.ai)

## Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **Project documentation** for major features

Thank you for helping make Event Horizon better!