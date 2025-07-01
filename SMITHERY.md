# Event Horizon MCP Server - Smithery Installation Guide

## Quick Start with Smithery

Event Horizon is available on [Smithery](https://smithery.ai), the official MCP server registry. Install it with one command:

```bash
npx @smithery/cli install event-horizon --client claude
```

## What is Event Horizon?

Event Horizon is an evolutionary algorithm MCP server that enables Claude and other LLMs to evolve solutions across multiple generations using genetic algorithm principles. It's perfect for:

- **Algorithm Design**: Evolve optimal algorithms for specific problems
- **Code Optimization**: Improve code performance across multiple metrics  
- **Creative Problem Solving**: Generate solutions optimized for multiple constraints
- **System Architecture**: Evolve designs balancing various requirements

## Configuration Options

### Basic Configuration

```bash
# Install with default settings
npx @smithery/cli install event-horizon --client claude
```

### Advanced Configuration

```bash
# Custom configuration
npx @smithery/cli install event-horizon --client claude --config '{
  "disableLogging": false,
  "populationSize": 5,
  "maxGenerations": 8,
  "convergenceThreshold": 0.9
}'
```

#### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `disableLogging` | boolean | `false` | Disable evolution progress logging |
| `populationSize` | integer | `3` | Default population size per generation |
| `maxGenerations` | integer | `5` | Default maximum generations |
| `convergenceThreshold` | number | `0.95` | Default convergence threshold (0.0-1.0) |

## Complete Workflow Example

Here's a complete example of using Event Horizon to evolve a solution:

### 1. Start an Evolution

```
Use the start_evolution tool with:
- Problem: "Design a caching strategy for a high-traffic web application"
- Consistency Checks:
  * "Must minimize cache miss ratio"
  * "Must handle memory constraints efficiently"  
  * "Must be simple to implement and maintain"
- Population Size: 4
- Max Generations: 6
```

### 2. Generate Initial Solutions

```
Use add_solution to create initial solutions like:
- "Implement LRU (Least Recently Used) cache with TTL expiration"
- "Use Redis with consistent hashing for distributed caching"
- "Implement two-tier cache with in-memory L1 and Redis L2"
- "Use write-through cache with background refresh"
```

### 3. Score Each Solution

```
Use score_solution for each solution against each check:
- Solution 1 vs "minimize cache miss": 0.7
- Solution 1 vs "memory efficiency": 0.8
- Solution 1 vs "implementation simplicity": 0.9
(Continue for all solutions and all checks)
```

### 4. Evolve to Next Generation

```
Use evolve_generation to get crossover recommendations like:
- Check 1 recommends: "Take LRU algorithm from Solution 1"
- Check 2 recommends: "Take memory pooling from Solution 3"  
- Check 3 recommends: "Take simple interface from Solution 4"
```

### 5. Create Evolved Solutions

```
Use add_solution to create new solutions combining best aspects:
- "LRU cache with memory pooling and simple key-value interface"
- "Hybrid LRU-LFU with efficient memory allocation"
```

### 6. Continue Until Convergence

Repeat scoring and evolution until you achieve convergence (high scores) or reach max generations.

## Available Tools

Event Horizon provides 5 tools for evolutionary optimization:

1. **`start_evolution`** - Initialize the evolutionary system
2. **`add_solution`** - Add solution candidates to current generation
3. **`score_solution`** - Evaluate solutions against consistency checks
4. **`evolve_generation`** - Get crossover recommendations for next generation
5. **`get_evolution_status`** - Monitor progress and view best solutions

## Tips for Effective Evolution

### Designing Good Consistency Checks

- **Be Specific**: "Must handle 10,000 requests/second" vs "Must be fast"
- **Be Measurable**: Use criteria that can be objectively scored 0.0-1.0
- **Cover Different Aspects**: Include performance, maintainability, security, etc.
- **Weight Important Checks**: Use `{"description": "...", "weight": 2.0}` for critical criteria

### Scoring Best Practices

- **Consistent Scale**: Always use 0.0 (poor) to 1.0 (excellent)
- **Relative Scoring**: Score within the context of the specific problem
- **Objective Evaluation**: Base scores on measurable criteria when possible
- **Document Reasoning**: Use the optional `reasoning` parameter

### Evolution Strategy

- **Start Diverse**: Create varied initial solutions exploring different approaches
- **Gradual Improvement**: Expect small incremental improvements each generation  
- **Watch for Convergence**: Evolution naturally converges on optimal solutions
- **Restart if Stuck**: Start fresh if evolution plateaus at poor scores

## Troubleshooting

### Installation Issues

**Problem**: `Command not found: @smithery/cli`
```bash
# Solution: Install Smithery CLI first
npm install -g @smithery/cli
```

**Problem**: Permission errors during installation
```bash
# Solution: Use npx instead of global install
npx @smithery/cli install event-horizon --client claude
```

### Runtime Issues

**Problem**: Tools not appearing in Claude Desktop
- **Solution**: Restart Claude Desktop completely after installation
- **Check**: Verify installation with `npx @smithery/cli list`

**Problem**: Evolution not progressing
- **Solution**: Ensure all solutions are fully scored before calling `evolve_generation`
- **Check**: Use `get_evolution_status` to see current state

**Problem**: Scores seem inconsistent
- **Solution**: Review consistency check descriptions for clarity
- **Tip**: Use the same evaluation criteria across all solutions

## Advanced Usage

### Multiple Parallel Evolutions

You can run multiple evolution sessions for different aspects of a problem:

```
Session 1: Optimize for performance
Session 2: Optimize for maintainability  
Session 3: Optimize for security
```

Then manually combine the best aspects from each session.

### Integration with Other MCP Servers

Event Horizon works great with other MCP servers:

- **Code Analysis Tools**: Use static analysis results as consistency check inputs
- **Benchmark Tools**: Get objective performance scores for evaluation
- **Documentation Tools**: Ensure evolved solutions are well-documented

## Support and Community

- **Documentation**: [Event Horizon GitHub](https://github.com/manasp21/EventHorizon)
- **Smithery Registry**: [Event Horizon on Smithery](https://smithery.ai/server/event-horizon)
- **Issues**: [GitHub Issues](https://github.com/manasp21/EventHorizon/issues)

## License

Event Horizon is open source under the MIT License. You're free to use, modify, and distribute it.