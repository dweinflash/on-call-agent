# How to Resolve LVDS2 Inbound Message Ratio Issues

## What This Alert Indicates

This alert measures the health of the LVDS (Low Velocity Data Streaming) Inbound module by monitoring the ratio between processed messages and messages sent to the destination topic. The alert triggers when the LVDS_INBOUND destination topic receives less than 10% of all processed messages, indicating a significant drop in message delivery efficiency.

## When This Alert Triggers

**System**: LVDS Inbound module message processing ratio  
**Severity**: Minor (P3)  
**Alert Duration**: 1,200 seconds (20 minutes)  
**Scope**: Message flow from LVDS Inbound to LVDS_INBOUND topic  
**Normal Range**: Destination topic receives ~90-110% of processed messages  
**Alert Threshold**: Destination topic receives less than 10% of processed messages  
**Data Flow**: Inbound messages → LVDS processing → LVDS_INBOUND topic

## Common Causes

- **Inbound Server Issues**: LVDS Inbound servers or their nodes encountering errors affecting message processing rates
- **Pulsar Issues**: Pulsar platform problems affecting message delivery to destination topic
- **Network Connectivity**: Connection issues between LVDS Inbound and Pulsar topic
- **Resource Constraints**: Processing capacity limitations affecting message throughput
- **Configuration Problems**: Message routing or topic configuration issues

## How to Resolve This Issue

### Initial Assessment

1. **Compare message rates**
   - Check current rate of messages received by LVDS Inbound
   - Check current rate of messages sent to LVDS_INBOUND destination topic
   - Calculate the ratio to confirm alert condition (< 10% delivery rate)

### Diagnostic Steps

2. **Check LVDS Inbound server health**
   - Access LVDS Inbound dashboard and scroll to second half of page
   - Examine status of each inbound server
   - Look for servers with red highlighting indicating processing issues
   - Note message process rates for problematic servers

### Resolution Based on Server Status

3. **If servers show processing issues (red highlighting)**
   
   **For Springfield servers (spr*):**
   - Connect to `spripvmasj001.central.corp.acme.com` via Remote Desktop
   - SSH to affected spr server using PuTTY (Username: `as_acmeid`, Password: `SECURE`)
   - Switch to service account: `sudo su - 298456_p_ltr`
   - Navigate to scripts: `cd /opt/akka`
   - Restart all nodes: `./stopall.sh && ./startall.sh`
   
   **For Riverside servers (riv*):**
   - Connect to `rivipvmasj001.central.corp.acme.com` via Remote Desktop
   - SSH to affected riv server using PuTTY (Username: `as_acmeid`, Password: `SECURE`)
   - Switch to service account: `sudo su - 298456_p_ltr`
   - Navigate to scripts: `cd /opt/akka`
   - Restart all nodes: `./stopall.sh && ./startall.sh`

### Escalation Paths

4. **If all inbound servers are healthy**
   - Root cause likely related to Pulsar platform
   - Create new ticket referencing the message ratio issue
   - Assign ticket to assignment group `INC-INT-TRANSFER`
   - Include message rate comparison data

5. **If further investigation needed**
   - Reassign ticket to assignment group `LVDS.Support`
   - Document all resolution steps taken
   - Suggest investigation of inbound server logs
   - Include message ratio trends and server health status

### Verification

6. **Monitor ratio improvement**
   - Check message rates after any server restarts
   - Verify destination topic delivery ratio returns to normal (90-110%)
   - Confirm overall message processing stability

## If These Steps Don't Work

If the above steps do not resolve the issue:

1. Escalate the ticket to the **LVDS.Support** assignment group
2. Include detailed message ratio analysis and trends
3. Provide server health status and any restart attempts
4. Include comparison of inbound vs. destination topic rates
5. Consider investigating server logs or configuration issues

For immediate assistance, contact the LVDS.Support team with message ratio data and troubleshooting results.