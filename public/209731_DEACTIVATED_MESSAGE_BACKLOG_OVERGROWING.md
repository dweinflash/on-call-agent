# How to Resolve Deactivated Vehicle Data Message Backlog Issues

## What This Alert Indicates

This alert triggers when the LVDS (Low Velocity Data Streaming) Pulsar2Kafka subscription has a message backlog greater than 4,000 messages. This suggests that LVDS's Pulsar to Kafka Bridge is having trouble consuming messages from the DEACTIVATED-VEHICLE-DATA Pulsar topic, which handles vehicle deactivation events.

## When This Alert Triggers

**System**: LVDS Pulsar2Kafka subscription  
**Severity**: Minor (P3)  
**Alert Duration**: 1,200 seconds (20 minutes)  
**Scope**: DEACTIVATED-VEHICLE-DATA topic  
**Normal Range**: Below 20 messages  
**Alert Threshold**: Greater than 4,000 messages  
**Topic Location**: `persistent://209731-VDF/CC-PROD-NA-LVDS-P2K/DEACTIVATED-VEHICLE-DATA`

## Common Causes

- **Deployment Issue**: Kubernetes pods with the pulsar-to-kafka-bridge application failing to start properly
- **Pulsar Platform Issues**: Upstream Pulsar system problems affecting LVDS's bridge connectivity
- **Kafka Platform Issues**: Downstream Kafka system problems preventing message delivery
- **Resource Constraints**: Insufficient processing capacity for deactivated vehicle data
- **Network Connectivity**: Connection issues between Pulsar and Kafka components

## How to Resolve This Issue

### Initial Assessment

1. **Check current message backlog**
   - Access monitoring dashboard to view current backlog status
   - Look for `persistent://209731-VDF/CC-PROD-NA-LVDS-P2K/DEACTIVATED-VEHICLE-DATA` in graph legend
   - Verify current backlog size compared to normal range (< 20 messages)

### Primary Resolution Steps

2. **Escalate to LVDS Support team**
   - Assign incident to assignment group `LVDS.Support`
   - Request investigation of pulsar-to-kafka-bridge application pods
   - Specify namespaces: `298456-prodk2w-maxio-mms-shared` and `298456-prodk2m-maxio-mms-shared`
   - Request manual restart if needed to clear message backlog

3. **Monitor restart effectiveness**
   - Watch message backlog metrics after restart
   - Verify backlog decreases to normal levels (< 20 messages)
   - Confirm deactivated vehicle data processing resumes

### Secondary Resolution Steps (If Primary Fails)

4. **Investigate Pulsar platform issues**
   - If application restart doesn't resolve the issue
   - Create new ticket referencing original incident
   - Assign ticket to assignment group `INC-INT-TRANSFER`
   - Include pulsar-to-kafka-bridge restart results and current status

5. **Investigate Kafka platform issues**
   - If Pulsar investigation rules out upstream issues
   - Create new ticket referencing original incident
   - Assign ticket to relevant Kafka support group
   - Provide all troubleshooting details from previous steps

## If These Steps Don't Work

If the above steps do not resolve the issue:

1. Escalate the ticket to the **LVDS.Support** assignment group
2. Include all troubleshooting steps completed
3. Provide current system status and backlog metrics
4. Include namespace and pod status information
5. Consider impact on vehicle deactivation processing

For immediate assistance, contact the LVDS.Support team with the ticket details and current backlog status.