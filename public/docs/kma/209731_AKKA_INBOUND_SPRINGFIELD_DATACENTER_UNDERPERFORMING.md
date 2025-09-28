# How to Resolve Data Center Performance Issues – Springfield Data Center

## What This Alert Indicates

This alert determines if the LVDS (Low Velocity Data Streaming) application is processing inbound messages in the Springfield data center. The alert measures the inbound message process rate, and triggers when the rate falls below 1 message per second, indicating that LVDS inbound servers in Springfield are not processing messages properly.

## When This Alert Triggers

**System**: LVDS Inbound servers - Springfield data center  
**Severity**: Major (P2)  
**Alert Duration**: 420 seconds (7 minutes)  
**Scope**: All Springfield LVDS inbound servers  
**Normal Range**: 15,000-200,000 requests per second  
**Alert Threshold**: Less than 1 message per second  
**Peak Processing**: Late afternoon (~4 PM), Lowest: Early morning (~2 AM)

## Common Causes

- **Patching Issues**: LVDS not properly shut down during patching window or failed to start after maintenance
- **DPS/ADS Connection Issues**: Connection problems with Vehicle Profile Service or Analytical Data Store affecting message processing
- **Springfield Data Center Issues**: Significant infrastructure problems affecting LVDS Inbound performance
- **Application Failures**: LVDS inbound server processes failing or becoming unresponsive
- **Resource Constraints**: Memory or CPU issues preventing message processing

## How to Resolve This Issue

### Prerequisites - Verify LEO Access

1. **Check LEO access**
   - Navigate to LEO SA Home
   - Check if FLEXIO298456 is visible in dropdown
   - If visible, continue to step 4 (Application Restart)

2. **Request LEO access if needed**
   - From LEO SA Home, click "Request Access to LEO AD Groups"
   - Fill out request form:
     - **ASMS**: `298456`
     - **LEO AD Groups**: `298456-LEOAdmin`, `298456-LEOExecNonProd`, `298456-LEOExecProd`
     - **Action**: `Request to Add Access`
   - Click Submit

3. **Monitor access request status**
   - Navigate to A2 Access Administration
   - Click your name in top right corner → Accounts tab → Group Memberships tab
   - Search for `298456`
   - Look for `298456-LEOExecProd` group membership
   - If not found, contact LVDS Primary on-call for `LVDS.Support`

### Application Restart Process

4. **Execute Springfield data center restart**
   - On Application Maintenance page, configure:
     - **Application**: `FLEXIO298456`
     - **Environment**: `PROD`
     - **Change/Incident**: Enter incident ticket number
     - **Data Center**: `PROD-SPRINGFIELD`
     - **Action**: `App Restart`
     - **Schedule Job**: `No`

5. **Run execution flow**
   - Click "Run Execution Flow"
   - Wait for restart process to complete

### Verification Steps

6. **Verify server recovery**
   - Navigate to LVDS 2 - Inbound dashboard
   - Check individual process rate graphs for each LVDS inbound server
   - Confirm servers processing 1,000-10,000 requests per second

7. **Validate overall throughput**
   - Monitor Inbound Message Throughput graph
   - Confirm graph shows 15,000-200,000 requests per second for Springfield
   - Verify graph is no longer flat-lined at 0 req/s

## If These Steps Don't Work

If the above steps do not resolve the issue:

1. Escalate the ticket to the **LVDS.Support** assignment group
2. Include LEO access status and restart attempt results
3. Provide current throughput metrics and server processing rates
4. Include any error messages from restart process
5. Consider investigating DPS/ADS connection status or infrastructure issues

For immediate assistance, contact the LVDS.Support team with restart results and current processing metrics.