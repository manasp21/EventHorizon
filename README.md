# Event Horizon MCP Server

[![Smithery](https://img.shields.io/badge/Smithery-Available-blue?style=flat&logo=smithery)](https://smithery.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

An MCP server implementation that provides evolutionary solution generation and optimization capabilities for LLMs. Event Horizon enables LLMs to evolve solutions across multiple generations using consistency check evaluations and genetic algorithm principles.

## Features

- **Multi-generational Evolution**: Evolve solutions across multiple generations
- **Consistency Check Evaluation**: Score solutions against multiple criteria
- **Crossover Analysis**: Identify best aspects from different solutions
- **Convergence Detection**: Automatically detect when solutions reach optimal scores
- **Progress Tracking**: Monitor evolution progress and statistics
- **Flexible Configuration**: Customize population size, generations, and thresholds

## How It Works

1. **Initialize Evolution**: Define a problem statement and consistency checks
2. **Generate Population**: Create initial solutions for generation 0
3. **Evaluate Solutions**: Score each solution against all consistency checks
4. **Evolution Analysis**: Identify best-performing aspects per consistency check
5. **Crossover Guidance**: Get recommendations for combining best aspects
6. **Next Generation**: Create new solutions based on crossover recommendations
7. **Repeat**: Continue until convergence or max generations reached

## Tools

### start_evolution

Initialize an evolutionary solution system with a problem and consistency checks.

**Parameters:**
- `problemStatement` (string): The problem or challenge to solve
- `consistencyChecks` (array): Array of evaluation criteria (strings or objects with description/weight)
- `populationSize` (integer, optional): Solutions per generation (default: 3)
- `maxGenerations` (integer, optional): Maximum generations (default: 5)
- `convergenceThreshold` (number, optional): Score threshold for completion (default: 0.95)

### add_solution

Add a new solution to the current generation.

**Parameters:**
- `content` (string): The solution content addressing the problem
- `parentSolutions` (array, optional): Parent solution IDs if this is a crossover

### score_solution

Score a solution against a specific consistency check.

**Parameters:**
- `solutionId` (string): ID of the solution to score
- `checkId` (string): ID of the consistency check
- `score` (number): Score between 0.0 and 1.0
- `reasoning` (string, optional): Explanation of the scoring rationale

### evolve_generation

Evolve to the next generation using crossover analysis.

Returns crossover recommendations identifying the best-performing solution for each consistency check and guidance for creating new solutions.

### get_evolution_status

Get the current status of the evolutionary system including progress, statistics, and best solution found.

## Installation

### Smithery (Recommended)

Install directly from the Smithery registry for the easiest setup:

```bash
npx @smithery/cli install event-horizon --client claude
```

This automatically configures the server for Claude Desktop. You can also customize the installation:

```bash
npx @smithery/cli install event-horizon --client claude --config '{"disableLogging": true, "populationSize": 5}'
```

### Manual Installation

If you prefer manual installation, add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "event-horizon": {
      "command": "node",
      "args": [
        "/path/to/EventHorizon/dist/index.js"
      ]
    }
  }
}
```

### Clone and Build

For development or customization:

```bash
git clone https://github.com/manasp21/EventHorizon.git
cd EventHorizon
npm install
npm run build
```

## Advanced Configuration

### Configuration Options

The Event Horizon server supports several configuration options:

- `disableLogging` (boolean): Disable evolution progress logging (default: false)
- `populationSize` (integer): Default population size for generations (default: 3)
- `maxGenerations` (integer): Default maximum generations (default: 5)
- `convergenceThreshold` (number): Default convergence threshold (default: 0.95)

### Docker

Build and run with Docker:

```bash
docker build -t event-horizon-mcp .
docker run --rm -i event-horizon-mcp
```

Or use in Claude Desktop config:

```json
{
  "mcpServers": {
    "event-horizon": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "event-horizon-mcp"
      ]
    }
  }
}
```

### VS Code & Other MCP Clients

For other MCP clients, you can use Smithery CLI or manual configuration. Check the [Smithery documentation](https://smithery.ai/docs) for client-specific instructions.

## Usage Example

Here's a typical evolutionary workflow:

### 1. Start Evolution

```json
{
  "tool": "start_evolution",
  "arguments": {
    "problemStatement": "Design an efficient sorting algorithm",
    "consistencyChecks": [
      "Algorithm must have optimal time complexity",
      "Implementation must be memory efficient",
      "Code must be readable and maintainable"
    ],
    "populationSize": 3,
    "maxGenerations": 5
  }
}
```

### 2. Add Initial Solutions

```json
{
  "tool": "add_solution",
  "arguments": {
    "content": "Implement quicksort with random pivot selection..."
  }
}
```

### 3. Score Solutions

```json
{
  "tool": "score_solution",
  "arguments": {
    "solutionId": "generated_solution_id",
    "checkId": "check_1",
    "score": 0.8
  }
}
```

### 4. Evolve Generation

```json
{
  "tool": "evolve_generation",
  "arguments": {}
}
```

The system will provide crossover recommendations like:
```json
{
  "crossoverRecommendations": [
    {
      "checkId": "check_1",
      "bestSolutionId": "solution_a",
      "score": 0.9,
      "relevantContent": "Use random pivot selection for optimal performance..."
    }
  ]
}
```

### 5. Create Next Generation

Based on recommendations, create new solutions combining the best aspects from previous generation.

## Environment Variables

- `DISABLE_EVOLUTION_LOGGING`: Set to `"true"` to disable progress logging

## Building

```bash
npm run build
npm run prepare
```

## Docker

```bash
docker build -t mcp/event-horizon -f Dockerfile .
```

## Example Use Cases

- **Algorithm Design**: Evolve optimal algorithms for specific problems
- **Code Optimization**: Improve code performance across multiple metrics
- **Creative Writing**: Evolve stories or content meeting multiple criteria
- **Problem Solving**: Generate solutions optimized for multiple constraints
- **System Design**: Evolve architectural solutions balancing various requirements

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License.