# How to Resolve Oracle Database Connection Issues

## What This Alert Indicates

This alert triggers when LVDS (Low Velocity Data Streaming) inbound nodes have an average available database connection count greater than 65. The LVDS inbound module consists of 20 servers (10 Springfield, 10 Riverside) with 3 nodes each, where each node uses metadata stored in Oracle databases to process incoming messages. High available connection counts could indicate application issues.

## When This Alert Triggers

**System**: LVDS Inbound Oracle database connections  
**Severity**: Minor (P3)  
**Alert Duration**: 300 seconds (5 minutes)  
**Scope**: All LVDS inbound servers and nodes  
**Normal Range**: 20-30 available connections per database  
**Alert Threshold**: Greater than 65 available connections  
**Coverage**: 60 total databases (3 nodes × 20 servers: ports 9450, 9451, 9452)

## Common Causes

- **Application Issues**: LVDS inbound processes not properly utilizing database connections
- **Connectivity Problems**: Network issues preventing proper database connection usage
- **Configuration Issues**: Database connection pool misconfiguration or application settings
- **Process Failures**: Individual node processes failing while maintaining idle connections
- **Resource Constraints**: Memory or processing issues affecting connection utilization

## How to Resolve This Issue

### Initial Assessment

1. **Identify server with highest available connections**
   - Access available database connections monitoring dashboard
   - Look for the line at the top of the graph indicating highest connection count
   - Note the server name (spr* for Springfield, riv* for Riverside)
   - Record current available connection count for troubleshooting

### Resolution Steps

2. **Restart the problematic server**
   
   **For Springfield servers (spr*):**
   - Use Remote Desktop to connect to `spripvmasj001.central.corp.acme.com`
   - SSH to the identified spr server using PuTTY
   - Username: `as_acmeid`, Password: `SECURE`
   - Switch to service account: `sudo su - 298456_p_ltr`
   - Navigate to scripts: `cd /opt/akka`
   - Restart all nodes: `./stopall.sh && ./startall.sh`
   
   **For Riverside servers (riv*):**
   - Use Remote Desktop to connect to `rivipvmasj001.central.corp.acme.com`
   - SSH to the identified riv server using PuTTY
   - Username: `as_acmeid`, Password: `SECURE`
   - Switch to service account: `sudo su - 298456_p_ltr`
   - Navigate to scripts: `cd /opt/akka`
   - Restart all nodes: `./stopall.sh && ./startall.sh`

### Verification

3. **Monitor connection improvement**
   - Return to available database connections dashboard
   - Verify available connection count has decreased toward normal range (20-30)
   - Check that the problematic server no longer shows at top of graph
   - Confirm all three node databases (9450, 9451, 9452) show normal connection counts

4. **Validate message processing**
   - Check LVDS Inbound dashboard for normal message processing rates
   - Verify restarted server is processing messages properly
   - Confirm no impact on overall system throughput

## If These Steps Don't Work

If the above steps do not resolve the issue:

1. Escalate the ticket to the **LVDS.Support** assignment group
2. Include server restart details and current connection counts
3. Provide before/after connection metrics from monitoring dashboard
4. Include any error messages observed during restart process
5. Consider investigating database configuration or network connectivity issues

For immediate assistance, contact the LVDS.Support team with specific server information and connection count details.