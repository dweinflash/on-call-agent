# How to Resolve LVDS2 Outbound Message Backlog Issues

## What This Alert Indicates

This alert triggers when the LVDS (Low Velocity Data Streaming) outbound module is having trouble consuming inbound messages from the LVDS_INBOUND topic. The alert indicates that the outbound module has accumulated an inbound message backlog greater than 100,000 messages, suggesting processing issues in the data-stream-manager service.

## When This Alert Triggers

**System**: LVDS Outbound module (data-stream-manager)  
**Severity**: Minor (P3)  
**Alert Duration**: 1,200 seconds (20 minutes)  
**Scope**: LVDS_INBOUND topic consumption  
**Normal Range**: 200 to 1,000 messages  
**Alert Threshold**: Greater than 100,000 messages  
**Topic Location**: `persistent://209731-VDF/CC-NA-LVDS/LVDS_INBOUND`

## Common Causes

- **LVDS Outbound Issues**: Vehicle-drive-manager service experiencing processing difficulties
- **Deployment Issue**: Problems in Kubernetes namespaces affecting LVDS outbound module:
  - `209731-prodk2m-vdf` (Springfield)
  - `209731-prodk2w-vdf` (Riverside)
- **Resource Constraints**: Insufficient processing capacity for message volume
- **Service Health**: Vehicle-drive-manager service pods failing or restarting

## How to Resolve This Issue

### Initial Assessment

1. **Check current inbound message backlog**
   - Access Inbound Message Backlog monitoring graph
   - Look for `persistent://209731-VDF/CC-NA-LVDS/LVDS_INBOUND` in graph legend
   - Verify current backlog size compared to normal range (200-1,000 messages)

### Primary Resolution - Restart Springfield Data Center

2. **Restart data-stream-manager in Springfield**
   - Navigate to K8s Commands Pipeline
   - Click **Run Pipeline** in top right
   - Configure pipeline settings:
     - **Branch**: `main`
     - **Region**: `na`
     - **Team**: `delivery`
     - **Data Center**: `springfield`
     - **Environment**: `vdf-prodk2`
     - **Service**: `data-stream-manager`
     - **Command**: `restart`
     - **Replicas**: `0`
     - **Pod**: `0`

3. **Execute restart operation**
   - Click **Run**
   - Click **Review and Approve** when Review button appears
   - Wait for green check mark next to "Restart data-stream-manager"

4. **Monitor backlog improvement**
   - Return to Inbound Message Backlog graph
   - Click `persistent://209731-VDF/CC-NA-LVDS/LVDS_INBOUND` in graph legend
   - Check if backlog is decreasing toward normal range

### Secondary Resolution - Riverside Data Center

5. **If Springfield restart doesn't work**
   - Repeat restart steps with **Data Center**: `riverside`
   - Configure all other settings the same
   - Monitor backlog improvement after Riverside restart

### Escalation Path

6. **If both data center restarts fail**
   - Backlog should decrease to normal range (200-1,000 messages)
   - If backlog remains high after both restarts
   - Reassign ticket to assignment group `LVDS.Support`
   - Include restart attempts and current backlog status

## If These Steps Don't Work

If the above steps do not resolve the issue:

1. Escalate the ticket to the **LVDS.Support** assignment group
2. Include restart operations attempted for both data centers
3. Provide current backlog metrics and trends
4. Include data-stream-manager service status from both namespaces
5. Consider investigating underlying infrastructure issues

For immediate assistance, contact the LVDS.Support team with restart results and current backlog metrics.