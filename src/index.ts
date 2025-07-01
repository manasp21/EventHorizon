#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { EvolutionaryEngine } from './mcp_core.js';

const START_EVOLUTION_TOOL: Tool = {
  name: "start_evolution",
  description: `Initialize an evolutionary solution system for a given problem with consistency checks.

This tool sets up the framework for evolving solutions across multiple generations. The LLM will:
1. Generate initial population of solutions
2. Evaluate solutions against consistency checks
3. Use crossover recommendations to create better solutions
4. Repeat until convergence or max generations

Use this tool to begin the evolutionary process with a clear problem statement and evaluation criteria.`,
  inputSchema: {
    type: "object",
    properties: {
      problemStatement: {
        type: "string",
        description: "The problem or challenge to solve"
      },
      consistencyChecks: {
        type: "array",
        description: "Array of consistency checks (strings or objects with description and weight)",
        items: {
          oneOf: [
            { type: "string" },
            {
              type: "object",
              properties: {
                description: { type: "string" },
                weight: { type: "number", minimum: 0 }
              },
              required: ["description"]
            }
          ]
        }
      },
      populationSize: {
        type: "integer",
        description: "Number of solutions per generation (default: 3)",
        minimum: 1,
        default: 3
      },
      maxGenerations: {
        type: "integer", 
        description: "Maximum number of generations (default: 5)",
        minimum: 1,
        default: 5
      },
      convergenceThreshold: {
        type: "number",
        description: "Score threshold for convergence (default: 0.95)",
        minimum: 0,
        maximum: 1,
        default: 0.95
      }
    },
    required: ["problemStatement", "consistencyChecks"]
  }
};

const ADD_SOLUTION_TOOL: Tool = {
  name: "add_solution",
  description: `Add a new solution to the current generation of the evolutionary system.

Use this tool to contribute solutions to the current generation. Solutions can be:
- Initial solutions (generation 0)
- Evolved solutions based on crossover recommendations
- Variations or mutations of existing solutions

The solution content should directly address the problem statement.`,
  inputSchema: {
    type: "object",
    properties: {
      content: {
        type: "string",
        description: "The solution content addressing the problem statement"
      },
      parentSolutions: {
        type: "array",
        description: "Optional array of parent solution IDs if this is a crossover",
        items: { type: "string" }
      }
    },
    required: ["content"]
  }
};

const SCORE_SOLUTION_TOOL: Tool = {
  name: "score_solution", 
  description: `Score a solution against a specific consistency check.

Use this tool to evaluate how well a solution performs against each consistency check.
Scores should be between 0.0 (poor) and 1.0 (excellent).

The LLM should evaluate the solution content against the consistency check description and provide an objective score.`,
  inputSchema: {
    type: "object",
    properties: {
      solutionId: {
        type: "string",
        description: "ID of the solution to score"
      },
      checkId: {
        type: "string", 
        description: "ID of the consistency check to evaluate against"
      },
      score: {
        type: "number",
        description: "Score between 0.0 and 1.0",
        minimum: 0,
        maximum: 1
      },
      reasoning: {
        type: "string",
        description: "Optional explanation of the scoring rationale"
      }
    },
    required: ["solutionId", "checkId", "score"]
  }
};

const EVOLVE_GENERATION_TOOL: Tool = {
  name: "evolve_generation",
  description: `Evolve to the next generation using crossover analysis.

This tool analyzes the current generation's performance and provides crossover recommendations.
It identifies the best-performing solution for each consistency check and suggests how to combine
these aspects into new solutions for the next generation.

Use this after all solutions in the current generation have been fully scored.`,
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  }
};

const GET_STATUS_TOOL: Tool = {
  name: "get_evolution_status",
  description: `Get the current status of the evolutionary system.

Returns detailed information about the current state including:
- Current generation and progress
- Population statistics
- Best solution found so far
- Evolution history

Use this tool to track progress and understand the current state of the evolution.`,
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false
  }
};

const server = new Server(
  {
    name: "event-horizon-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const evolutionEngine = new EvolutionaryEngine();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [START_EVOLUTION_TOOL, ADD_SOLUTION_TOOL, SCORE_SOLUTION_TOOL, EVOLVE_GENERATION_TOOL, GET_STATUS_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "start_evolution":
      return evolutionEngine.startEvolution(request.params.arguments);
    case "add_solution":
      return evolutionEngine.addSolution(request.params.arguments);
    case "score_solution":
      return evolutionEngine.scoreSolution(request.params.arguments);
    case "evolve_generation":
      return evolutionEngine.evolveGeneration(request.params.arguments);
    case "get_evolution_status":
      return evolutionEngine.getEvolutionStatus();
    default:
      return {
        content: [{
          type: "text",
          text: `Unknown tool: ${request.params.name}`
        }],
        isError: true
      };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Event Horizon MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});