#!/usr/bin/env node

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Import the evolutionary engine for tool execution
import { EvolutionaryEngine, TOOLS } from './mcp_core.js';

const PORT = process.env.PORT || 8000;

// Static tool definitions for fast discovery (no heavy imports needed)
const STATIC_TOOLS: Tool[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  }
];

class MCPHttpServer {
  private evolutionEngine: EvolutionaryEngine;

  constructor() {
    // Initialize evolution engine lazily for fast startup
    this.evolutionEngine = new EvolutionaryEngine();
  }

  private setCorsHeaders(res: ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  private sendJson(res: ServerResponse, data: any, statusCode: number = 200): void {
    this.setCorsHeaders(res);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data, null, 2));
  }

  private async handleMcpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method === 'OPTIONS') {
      this.setCorsHeaders(res);
      res.statusCode = 200;
      res.end();
      return;
    }

    if (req.method === 'GET') {
      // Health check and server info
      this.sendJson(res, {
        server: {
          name: "Event Horizon MCP Server",
          version: "1.0.0",
          description: "Evolutionary solution generation using genetic algorithms"
        },
        capabilities: {
          tools: {}
        }
      });
      return;
    }

    if (req.method === 'DELETE') {
      // Connection close
      this.sendJson(res, { status: "connection_closed" });
      return;
    }

    if (req.method !== 'POST') {
      this.sendJson(res, { error: "Method not allowed" }, 405);
      return;
    }

    // Parse JSON request body
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const method = data.method;
        const id = data.id || 0;

        switch (method) {
          case 'initialize':
            this.sendJson(res, {
              jsonrpc: "2.0",
              id,
              result: {
                protocolVersion: "2024-11-05",
                capabilities: { tools: {} },
                serverInfo: {
                  name: "event-horizon-server",
                  version: "1.0.0"
                }
              }
            });
            break;

          case 'ping':
            // CRITICAL: Must return empty result per MCP spec
            this.sendJson(res, {
              jsonrpc: "2.0", 
              id,
              result: {}
            });
            break;

          case 'tools/list':
            this.sendJson(res, {
              jsonrpc: "2.0",
              id,
              result: { tools: STATIC_TOOLS }
            });
            break;

          case 'tools/call':
            const toolResult = await this.executeTool(data.params);
            this.sendJson(res, {
              jsonrpc: "2.0",
              id,
              result: toolResult
            });
            break;

          case 'resources/list':
            this.sendJson(res, {
              jsonrpc: "2.0",
              id,
              result: { resources: [] }
            });
            break;

          case 'prompts/list':
            this.sendJson(res, {
              jsonrpc: "2.0",
              id,
              result: { prompts: [] }
            });
            break;

          default:
            this.sendJson(res, {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32601,
                message: `Method not found: ${method}`
              }
            });
        }
      } catch (error) {
        this.sendJson(res, {
          jsonrpc: "2.0",
          id: 0,
          error: {
            code: -32700,
            message: "Parse error",
            data: error instanceof Error ? error.message : String(error)
          }
        }, 400);
      }
    });
  }

  private async executeTool(params: any) {
    const toolName = params.name;
    const args = params.arguments || {};

    // Execute tool using evolution engine
    switch (toolName) {
      case "start_evolution":
        return this.evolutionEngine.startEvolution(args);
      case "add_solution":
        return this.evolutionEngine.addSolution(args);
      case "score_solution":
        return this.evolutionEngine.scoreSolution(args);
      case "evolve_generation":
        return this.evolutionEngine.evolveGeneration(args);
      case "get_evolution_status":
        return this.evolutionEngine.getEvolutionStatus();
      default:
        return {
          content: [{
            type: "text",
            text: `Unknown tool: ${toolName}`
          }],
          isError: true
        };
    }
  }

  public start(): void {
    const server = createServer(async (req, res) => {
      const url = req.url || '';
      
      // Handle all MCP-related paths
      if (url === '/' || url === '/health') {
        this.sendJson(res, { 
          status: 'healthy',
          server: 'Event Horizon MCP Server',
          version: '1.0.0'
        });
      } else if (url === '/mcp' || url.startsWith('/mcp/') || url.startsWith('/mcp')) {
        await this.handleMcpRequest(req, res);
      } else {
        this.sendJson(res, { error: 'Not Found' }, 404);
      }
    });

    server.listen(PORT, () => {
      console.error(`Event Horizon MCP HTTP Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.error('Received SIGTERM, shutting down gracefully');
      server.close(() => {
        process.exit(0);
      });
    });
  }
}

// Start the server
const httpServer = new MCPHttpServer();
httpServer.start();