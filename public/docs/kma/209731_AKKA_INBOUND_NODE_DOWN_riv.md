# How to Resolve AKKA Node Down Issues – Riverside Data Center

## What This Alert Indicates

This alert measures each node's inbound message process rate in the Riverside data center. When a node's message process rate equals 0, the alert triggers, indicating that the node is not processing inbound messages. This typically occurs when the JVM encounters an error affecting the actor system.

## When This Alert Triggers

**System**: AKKA Inbound processing nodes  
**Severity**: Minor (P3)  
**Alert Duration**: 300 seconds (5 minutes)  
**Scope**: Riverside data center servers (riv006-riv015)  
**Normal Range**: 200-7,000 requests per second per node  
**Alert Threshold**: 0 requests per second  
**Affected Nodes**: node01, node02, node03 per server (ports 9450, 9451, 9452)

## Common Causes

- **JVM Errors**: Java Virtual Machine encountering errors affecting the actor system
- **Memory Issues**: Insufficient memory causing node failures
- **Process Crashes**: Individual node processes failing or becoming unresponsive
- **Network Connectivity**: Connection issues preventing message processing
- **Resource Exhaustion**: CPU or memory constraints affecting node performance

## How to Resolve This Issue

### Prerequisites

1. **Verify jump server access**
   - If unable to access LVDS Jump Servers, follow LVDS Jump Server Access Guide
   - If access issues persist, reassign ticket to `LVDS.Support` while awaiting access

### Resolution Steps

2. **Connect to Riverside jump server**
   - Use Remote Desktop Connection to log into Riverside Jump Server
   - Server: `rivipvmasj001.central.corp.acme.com`
   - Password: `SECURE`

3. **SSH to affected Riverside server**
   - From Remote Desktop, use PuTTY to SSH into the server specified in incident ticket
   - Target servers: riv006, riv007, riv008, riv009, riv010, riv011, riv012, riv013, riv014, riv015
   - Username: `as_acmeid`
   - Password: `SECURE`

4. **Switch to service account**
   ```bash
   sudo su - 298456_p_ltr
   ```

5. **Navigate to scripts directory**
   ```bash
   cd /opt/akka
   ```

6. **Restart all nodes on the server**
   ```bash
   ./stopall.sh
   ./startall.sh
   ```

### Verification

7. **Verify node recovery**
   - Monitor LVDS Inbound dashboard for message processing resumption
   - Check individual node monitors (should not be red):
     - `:9450` = Node 1
     - `:9451` = Node 2  
     - `:9452` = Node 3
   - Confirm inbound message process rate returns to normal range (200-7K requests/second)

## If These Steps Don't Work

If the above steps do not resolve the issue:

1. Escalate the ticket to the **LVDS.Support** assignment group
2. Include server name and specific nodes affected
3. Provide restart attempt results and current processing rates
4. Include any error messages observed during restart process
5. Consider investigating underlying JVM or infrastructure issues

For immediate assistance, contact the LVDS.Support team with server-specific details and restart results.