# Security Policy

## Supported Versions

We actively support the following versions of Event Horizon MCP Server with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Event Horizon MCP Server seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email security concerns to: **themanaspandey@gmail.com**

Include the following information in your report:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths** of source file(s) related to the manifestation of the issue
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit the issue

### Response Timeline

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 7 days
- **Progress Updates**: We will send progress updates at least every 7 days
- **Resolution**: We aim to resolve critical vulnerabilities within 90 days

### Disclosure Policy

- We will coordinate disclosure of the vulnerability with you
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We will publish a security advisory after the vulnerability is patched
- We request that you do not publicly disclose the issue until we have addressed it

## Security Considerations

### MCP Server Security

Event Horizon MCP Server operates as a bridge between LLM applications and computational resources. Key security areas:

#### Input Validation
- **Problem Statements**: All user-provided problem statements are treated as untrusted input
- **Consistency Checks**: Validation of consistency check descriptions and weights
- **Solution Content**: Sanitization of solution content to prevent injection attacks
- **Scoring Data**: Validation of score values and ranges (0.0-1.0)

#### Resource Management
- **Memory Limits**: Protection against excessive memory usage from large populations
- **CPU Limits**: Prevention of infinite loops or excessive computation
- **Generation Limits**: Built-in safeguards against runaway evolution processes
- **Solution Storage**: Secure handling of potentially sensitive solution data

#### Protocol Security
- **MCP Compliance**: Adherence to Model Context Protocol security guidelines
- **Transport Security**: Secure handling of stdio and HTTP transports
- **Error Handling**: Prevention of information leakage through error messages
- **Authentication**: Proper handling of client authentication (when applicable)

### Deployment Security

#### Local Deployment (Claude Desktop)
- **Filesystem Access**: Limited to designated directories only
- **Process Isolation**: Server runs in isolated process context
- **Resource Monitoring**: Built-in monitoring for resource usage
- **Logging Security**: Secure logging without exposing sensitive data

#### Smithery Cloud Deployment
- **Container Security**: Hardened Docker container with minimal attack surface
- **Network Security**: Proper HTTP security headers and CORS configuration
- **Environment Variables**: Secure handling of configuration data
- **Health Checks**: Secure health check endpoints without information disclosure

#### HTTP Server Security
- **Input Sanitization**: All HTTP requests are validated and sanitized
- **CORS Configuration**: Appropriate Cross-Origin Resource Sharing settings
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Error Responses**: Standardized error responses without sensitive information

### Evolutionary Algorithm Security

#### Data Integrity
- **Solution Tracking**: Secure tracking of solution lineage and parent relationships
- **Score Integrity**: Prevention of score manipulation or tampering
- **Generation Consistency**: Maintaining consistent generation state
- **Convergence Validation**: Proper validation of convergence criteria

#### Algorithmic Security
- **Deterministic Behavior**: Ensuring reproducible results when required
- **Random Number Generation**: Use of cryptographically secure randomness where appropriate
- **Crossover Security**: Secure handling of solution combination processes
- **Mutation Safety**: Safe application of solution mutations

### Third-Party Dependencies

We regularly monitor and update our dependencies for security vulnerabilities:

- **@modelcontextprotocol/sdk**: Core MCP functionality
- **chalk**: Terminal output styling
- **yargs**: Command-line argument parsing
- **TypeScript**: Compilation and type safety

Automated dependency scanning is performed through:
- GitHub Dependabot alerts
- npm audit checks
- Regular dependency updates

### Common Vulnerabilities

#### Known Attack Vectors

1. **Malicious Problem Statements**
   - Large input strings causing memory exhaustion
   - Strings containing script injection attempts
   - Crafted inputs attempting to break parsing logic

2. **Algorithm Manipulation**
   - Attempts to manipulate scoring mechanisms
   - Invalid generation state modifications
   - Malformed consistency check definitions

3. **Resource Exhaustion**
   - Extremely large population sizes
   - Excessive generation counts
   - Complex consistency checks causing CPU exhaustion

4. **Protocol Abuse**
   - Malformed MCP requests
   - Rapid-fire request flooding
   - Invalid tool parameter combinations

#### Mitigations

- **Input validation** at all entry points
- **Resource limits** enforced at runtime
- **Rate limiting** for HTTP endpoints
- **Graceful error handling** with secure error messages
- **Logging and monitoring** for suspicious activity
- **Container isolation** for Smithery deployments

### Best Practices for Users

#### Secure Deployment
- Keep Event Horizon MCP Server updated to the latest version
- Monitor resource usage when running large evolutionary processes
- Use appropriate network security when deploying HTTP server
- Regularly review and rotate any authentication credentials

#### Safe Usage
- Validate problem statements and consistency checks before use
- Monitor evolution processes for unexpected behavior
- Use reasonable population sizes and generation limits
- Report any suspicious behavior or unexpected results

#### Configuration Security
- Secure storage of Smithery deployment configurations
- Proper handling of environment variables
- Regular backup of important evolution results
- Secure logging configuration

## Security Updates

Security updates will be distributed through:

- **GitHub Releases**: Tagged releases with security patches
- **Smithery Registry**: Automatic updates for Smithery deployments
- **Security Advisories**: Published on GitHub Security tab
- **Notification**: Email notification to vulnerability reporters

Subscribe to repository releases and security advisories to stay informed about security updates.

## Contact

For general security questions about Event Horizon MCP Server:

- **Email**: themanaspandey@gmail.com
- **GitHub Issues**: [General questions only](https://github.com/manasp21/EventHorizon/issues)
- **Documentation**: [MCP Security Guidelines](https://modelcontextprotocol.io/)

**Remember**: Always use the private email for actual vulnerability reports, never public channels.

## Acknowledgments

We appreciate the security research community's efforts to improve the security of Event Horizon MCP Server. Responsible disclosure helps us protect all users of the system.

---

*This security policy is based on industry best practices and is regularly updated to reflect new threats and mitigations.*