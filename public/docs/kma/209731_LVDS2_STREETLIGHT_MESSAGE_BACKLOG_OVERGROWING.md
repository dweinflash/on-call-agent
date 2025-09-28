# How to Resolve StreetLight Message Backlog Issues

## What This Alert Indicates

This alert triggers when StreetLight is having trouble consuming messages from LVDS's (Low Velocity Data Streaming) external topic LVDSEXTERNAL_LOC_BLUR. When StreetLight cannot process messages effectively, a message backlog accumulates. The alert is triggered when StreetLight's consumer message backlog grows larger than 1 million messages.

## When This Alert Triggers

**System**: StreetLight consumer  
**Severity**: Minor (P3)  
**Alert Duration**: 1,200 seconds (20 minutes)  
**Scope**: LVDSEXTERNAL_LOC_BLUR topic  
**Normal Range**: 5,000 to 45,000 messages  
**Alert Threshold**: Greater than 1,000,000 messages  
**Subscription**: `209731-VDF-STREETLIGHT-EXT-SUB`

## Common Causes

- **StreetLight Consumer Issues**: StreetLight application having trouble consuming messages (most common cause)
- **Pulsar Platform Issues**: Upstream Pulsar system problems affecting message consumption
- **Resource Constraints**: Insufficient processing capacity on StreetLight side
- **Network Connectivity**: Connection issues between StreetLight and Pulsar topic
- **Authentication Problems**: StreetLight consumer credential issues

## How to Resolve This Issue

### Initial Assessment

1. **Check current message backlog trends**
   - Access StreetLight message backlog monitoring dashboard
   - Analyze current backlog size compared to normal range (5K-45K messages)
   - Determine if backlog is increasing, decreasing, or steady
   - Note patterns or sudden changes in consumption rate

### Primary Resolution - StreetLight Team Coordination

2. **Escalate to LVDS Support**
   - Reassign incident ticket to assignment group `LVDS.Support`
   - Include message backlog patterns and current trends in ticket notes
   - Suggest that reaching out to StreetLight team may be necessary
   - Provide current backlog metrics and historical comparison

3. **Monitor backlog patterns**
   - Document if backlog is:
     - **Increasing**: Suggests ongoing consumption issues
     - **Decreasing**: May indicate temporary problem resolving
     - **Steady**: Could indicate capacity limits reached

### Secondary Resolution - Pulsar Platform Investigation

4. **Check for Pulsar platform issues**
   - If StreetLight team indicates their systems are healthy
   - Look for any ongoing Pulsar platform issues or outages
   - Check if other consumers are experiencing similar problems

5. **Escalate Pulsar issues if identified**
   - Create new ticket referencing StreetLight's message backlog issue
   - Assign ticket to assignment group `INC-INT-TRANSFER`
   - Include connection between Pulsar issues and StreetLight consumption problems
   - Provide timeline of when consumption issues began

## If These Steps Don't Work

If the above steps do not resolve the issue:

1. Escalate the ticket to the **LVDS.Support** assignment group
2. Include detailed backlog trends and consumption patterns
3. Document all coordination attempts with StreetLight team
4. Provide investigation results for Pulsar platform issues
5. Consider impact on location blur data delivery to StreetLight

For immediate assistance, contact the LVDS.Support team with current backlog status and team coordination results.