# Noctra Interactive Demo Guide

Noctra features an integrated demo controller accessible by adding `?demo=1` to the URL.

## Walkthrough Journey: The 2:15 AM ICU Nurse

1. **Step 1: The Baseline State (2:15 AM)**
   - Open `http://localhost:5173/planner?demo=1`.
   - The default scenario loads an ICU Nurse leaving AIIMS Nagpur at 2:15 AM heading to Dharampeth by 3:00 AM.
   - The system presents 3 candidates:
     - **Auto-rickshaw (Fastest)**: ROBUST (+18m slack worst case).
     - **Two-Wheeler (Balanced)**: ROBUST (+14m slack).
     - **Walking (Safest)**: INFEASIBLE (-7m past deadline).
   - Observe the **Night Ribbon** showing departure, arrival bands, and the **02:30 AM Decide-by** point.

2. **Step 2: Road Closure Injection**
   - Click **"Inject Closure"** in the Demo Controls.
   - Wardha Road bursts a water pipe.
   - The auto route becomes `AT_RISK` and replans via an alternate detour.
   - Rejection reasons and updated slack are rendered live.

3. **Step 3: Ride Telemetry Drops to UNKNOWN**
   - Click **"Ride UNKNOWN"**.
   - Auto & cab ride availability confidence drops. Evidence labels degrade to `UNKNOWN`.
   - Notice the visual dashed chip and updated risk assessment.

4. **Step 4: Network Kill (Tier 2 Offline Mode)**
   - Click **"Simulate Tier 2"**.
   - Top banner turns red: "Tier 2: Offline Mode (Server Unreachable)".
   - Emergency 112 quick-dial pill appears.
   - The UI continues rendering the last known local plan.

5. **Step 5: Clock Advance + Plan B**
   - Click **"Advance Clock +25m"**.
   - Evidence freshness decays across all observed claims.
   - The decide-by threshold passes, highlighting the Plan B fallback mode.
