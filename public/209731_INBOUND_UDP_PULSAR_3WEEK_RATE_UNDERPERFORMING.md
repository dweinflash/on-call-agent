# How to Resolve UDP Pulsar Performance Issues

## What This Alert Indicates

This alert triggers when there is a growing imbalance between the rate of incoming UDP messages and the rate at which they are processed and published to Pulsar, based on historical performance. The alert fires when the combined performance of inbound message intake and processing drops below 75% of the application's historical performance over the past 3 weeks.

## When This Alert Triggers

**System**: LVDS Inbound UDP to Pulsar processing  
**Severity**: Minor (P3)  
**Alert Duration**: 300 seconds (5 minutes)  
**Scope**: Combined UDP intake and Pulsar publishing performance  
**Normal Range**: 85%-110% of historical average  
**Alert Threshold**: Below 75% of 3-week historical performance  
**Data Flow**: UDP messages → LVDS Inbound processing → LVDS_INBOUND Pulsar topic

## Common Causes

- **Processing Issues**: LVDS Inbound Module experiencing performance degradation
- **Pulsar Publishing Problems**: Issues publishing processed messages to Pulsar destination topic
- **Upstream Network Issues**: Problems affecting UDP message intake rates
- **System-Wide Issues**: Broader infrastructure problems affecting multiple components
- **Resource Constraints**: Memory or CPU limitations affecting message processing capacity

## How to Resolve This Issue

### Initial Assessment

1. **Analyze performance patterns**
   - Compare current performance to 3-week historical average
   - Determine if issue affects UDP intake, Pulsar publishing, or both
   - Check if performance degradation is gradual or sudden

### Diagnostic Steps

2. **Check LVDS Inbound Module health**
   - Access LVDS Inbound dashboard and scroll to second half of page
   - Examine status of each inbound server
   - Look for servers with red highlighting indicating processing issues
   - Note message process rates for each server

3. **Identify problematic servers**
   
   **If Springfield servers (spr*) are highlighted in red:**
   - Follow Springfield server restart procedures:
   - Connect to `spripvmasj001.central.corp.acme.com`
   - SSH to affected spr server, switch to `298456_p_ltr`
   - Run `./stopall.sh && ./startall.sh` from `/opt/akka`
   
   **If Riverside servers (riv*) are highlighted in red:**
   - Follow Riverside server restart procedures:
   - Connect to `rivipvmasj001.central.corp.acme.com`
   - SSH to affected riv server, switch to `298456_p_ltr`
   - Run `./stopall.sh && ./startall.sh` from `/opt/akka`

### Escalation Paths

4. **If inbound servers are healthy**
   - Root cause may be Pulsar-related
   - Create new ticket referencing the performance issue
   - Assign ticket to assignment group `INC-INT-TRANSFER`
   - Include historical performance comparison data

5. **If further investigation needed**
   - Reassign ticket to assignment group `LVDS.Support`
   - Document all resolution steps taken
   - Suggest investigation of issues upstream of LVDS
   - Include performance trend analysis and server status

## If These Steps Don't Work

If the above steps do not resolve the issue:

1. Escalate the ticket to the **LVDS.Support** assignment group
2. Include detailed performance comparison (current vs. 3-week historical)
3. Provide server health status and any restart attempts
4. Include analysis of UDP intake vs. Pulsar publishing rates
5. Consider investigating upstream network or infrastructure issues

For immediate assistance, contact the LVDS.Support team with performance trend data and troubleshooting results.