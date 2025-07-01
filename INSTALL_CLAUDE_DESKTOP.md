# Event Horizon MCP Server - Claude Desktop Installation

## Quick Setup (Just Copy & Paste!)

### Step 1: Add to Claude Desktop Config

1. **Open Claude Desktop** 
2. **Go to Settings** (gear icon in bottom left)
3. **Click "Developer"** tab
4. **Click "Edit Config"** button
5. **Paste this configuration:**

```json
{
  "mcpServers": {
    "event-horizon": {
      "command": "node",
      "args": [
        "C:/Users/Manas Pandey/Documents/github/EventHorizon/dist/index.js"
      ]
    }
  }
}
```

### Step 2: Restart Claude Desktop

- Close Claude Desktop completely
- Reopen Claude Desktop
- You should see a small hammer/tools icon in the input area when the server is connected

## Verify Installation

1. Start a new conversation in Claude Desktop
2. Type: "What MCP tools do you have available?"
3. You should see 5 Event Horizon tools:
   - `start_evolution`
   - `add_solution` 
   - `score_solution`
   - `evolve_generation`
   - `get_evolution_status`

## Quick Test

Try this in Claude Desktop:

```
Use the start_evolution tool to begin evolving a solution for this problem:

Problem: "Create a simple recipe for chocolate chip cookies"
Consistency Checks: 
- "Recipe must include exact measurements"
- "Instructions must be clear and easy to follow"
- "Recipe should work for beginners"
```

## Troubleshooting

**Issue**: Tools not showing up
- **Solution**: Make sure you completely restarted Claude Desktop after adding the config

**Issue**: "Cannot find module" error
- **Solution**: Verify the file path `C:/Users/Manas Pandey/Documents/github/EventHorizon/dist/index.js` exists

**Issue**: Permission errors
- **Solution**: The file already has correct permissions (executable), but if needed run:
  ```bash
  chmod +x "C:/Users/Manas Pandey/Documents/github/EventHorizon/dist/index.js"
  ```

## What This Server Does

The Event Horizon MCP Server provides evolutionary solution generation tools that allow Claude to:

1. **Start Evolution**: Define a problem and evaluation criteria
2. **Generate Solutions**: Create multiple solution candidates  
3. **Score Solutions**: Evaluate each solution against consistency checks
4. **Evolve Generations**: Use genetic algorithm principles to improve solutions
5. **Track Progress**: Monitor the evolution process and results

This creates a powerful system for iteratively improving solutions to complex problems!