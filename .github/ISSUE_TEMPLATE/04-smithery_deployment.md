---
name: Smithery Deployment Issue
about: Report problems with Smithery cloud deployment, configuration, or tool scanning
title: "[Smithery]: "
labels: ["smithery", "deployment", "triage"]
assignees:
  - manasp21
---

## Smithery Deployment Issue

### Issue Type
<!-- What type of Smithery issue are you experiencing? -->
- [ ] **Deployment Failure** - Build or deployment process fails
- [ ] **Tool Scanning Error** - "failedToFetchConfigSchema" or similar
- [ ] **Runtime Error** - Server starts but tools don't work correctly
- [ ] **Configuration Issue** - Problems with smithery.yaml or container setup
- [ ] **Performance Problem** - Slow startup, timeouts, or resource issues
- [ ] **Integration Issue** - Problems connecting from MCP clients
- [ ] **Other**: _____________________

### Deployment Information

**Smithery Server URL:**
<!-- If applicable, the URL where your server is deployed -->
```
https://server.smithery.ai/@yourusername/event-horizon
```

**Deployment Method:**
- [ ] GitHub integration (automatic deployment)
- [ ] Manual deployment via Smithery CLI
- [ ] Container registry deployment
- [ ] Local development testing

**Runtime Configuration:**
- [ ] TypeScript runtime
- [ ] Container runtime
- [ ] Custom runtime

### Error Details

**Error Message:**
<!-- Copy the exact error message from Smithery dashboard or logs -->
```
Paste error message here
```

**Deployment Status:**
- [ ] Build failed
- [ ] Build succeeded but deployment failed
- [ ] Deployment succeeded but tool scanning failed
- [ ] Tool scanning succeeded but tools don't work
- [ ] Intermittent failures

**When Does This Occur:**
- [ ] During initial deployment
- [ ] After code changes
- [ ] When tools are accessed
- [ ] Randomly during operation
- [ ] After specific user actions

### Configuration Files

**smithery.yaml:**
```yaml
# Paste your smithery.yaml content here (remove any sensitive data)
```

**Dockerfile (if using container runtime):**
```dockerfile
# Paste relevant Dockerfile sections here
```

**package.json scripts:**
```json
{
  "scripts": {
    // Paste relevant script sections
  }
}
```

### Build and Deployment Logs

**Build Output:**
```
# Paste build logs from Smithery dashboard
# Look for errors, warnings, or unusual output
```

**Container Logs (if applicable):**
```
# Paste container startup logs
# Include any error messages or stack traces
```

**Network/HTTP Errors:**
```
# Include any HTTP error codes, timeouts, or connection issues
```

### Tool Discovery and MCP Protocol

**Tool Scanning Result:**
- [ ] No tools discovered
- [ ] Some tools missing
- [ ] All tools discovered but don't work
- [ ] Tools work but performance issues

**MCP Client Testing:**
<!-- Have you tested with different MCP clients? -->
- [ ] Claude Desktop - Works / Doesn't work
- [ ] VS Code MCP extension - Works / Doesn't work  
- [ ] Direct HTTP testing - Works / Doesn't work
- [ ] Other client: _____ - Works / Doesn't work

**HTTP Endpoint Testing:**
```bash
# Share results of testing these endpoints:
curl https://server.smithery.ai/@yourusername/event-horizon/health
curl -X POST https://server.smithery.ai/@yourusername/event-horizon/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Environment and Dependencies

**Node.js Version:**
<!-- What Node.js version is specified in your configuration? -->

**MCP SDK Version:**
<!-- Check your package.json for @modelcontextprotocol/sdk version -->

**TypeScript Version:**
<!-- If using TypeScript runtime -->

**Recent Changes:**
<!-- What changes were made before the issue appeared? -->
- [ ] Updated dependencies
- [ ] Changed smithery.yaml configuration
- [ ] Modified Dockerfile
- [ ] Updated code (specify what changed)
- [ ] No recent changes

### Expected vs Actual Behavior

**Expected Behavior:**
<!-- What should happen with a successful Smithery deployment? -->
1. Deployment should succeed without errors
2. Tool scanning should discover all 5 evolutionary tools
3. Tools should be callable from MCP clients
4. Server should respond quickly and reliably

**Actual Behavior:**
<!-- What's actually happening? -->

### Reproducibility

**How to Reproduce:**
1. 
2. 
3. 
4. 

**Frequency:**
- [ ] Always reproducible
- [ ] Intermittent (happens ___% of the time)
- [ ] Only under specific conditions
- [ ] First time occurrence

### Troubleshooting Attempted

**Steps Already Tried:**
- [ ] Redeployed from scratch
- [ ] Checked Smithery documentation
- [ ] Tested with local Docker build
- [ ] Verified all configuration files
- [ ] Checked GitHub repository settings
- [ ] Contacted Smithery support
- [ ] Other: _____________________

**Workarounds Found:**
<!-- Any temporary solutions or workarounds -->

### System Context

**Operating System (for local testing):**
<!-- Windows, macOS, Linux distribution -->

**Browser (for Smithery dashboard):**
<!-- Chrome, Firefox, Safari, etc. -->

**Network Environment:**
- [ ] Corporate network / firewall
- [ ] Home network
- [ ] Public WiFi
- [ ] VPN connection
- [ ] Mobile connection

### Additional Information

**Related Issues:**
<!-- Link to any related GitHub issues or Smithery discussions -->

**Comparison with Other Deployments:**
<!-- If you have other MCP servers deployed to Smithery, do they work? -->

**Timeline:**
<!-- When did this issue first appear? Any correlation with external events? -->

**Business Impact:**
- [ ] Blocking development work
- [ ] Affecting production users
- [ ] Preventing new feature deployment
- [ ] Minor inconvenience

### Assistance Needed

**Preferred Resolution:**
- [ ] Fix the specific error
- [ ] Guidance on proper configuration
- [ ] Alternative deployment approach
- [ ] Debugging assistance
- [ ] Documentation improvement

**Urgency Level:**
- [ ] Critical (blocking critical work)
- [ ] High (significantly impacts productivity)
- [ ] Medium (moderate impact)
- [ ] Low (minor issue)

---

**Note:** For Smithery-specific platform issues, you may also want to reach out to [Smithery support](https://smithery.ai) directly. This issue template helps us track problems specific to Event Horizon's Smithery integration.