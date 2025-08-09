# Campus Level Distribution System

## Overview

The Campus Pulse dashboard uses a **Level Distribution** system to categorize and visualize campus performance based on competency evaluations. This system provides a clear, intuitive way to understand how campuses are performing across different competency areas.

## How Level Distribution Works

### 🎯 **Level Calculation**

Each campus receives a **Level** based on their average competency score:

```
Campus Level = Floor(Average Competency Score)
```

**Example:**
- Campus with score 2.7 → **Level 2**
- Campus with score 3.1 → **Level 3** 
- Campus with score 1.9 → **Level 1**

### 📊 **Level Scale (0-7)**

| Level | Score Range | Color | Performance Description |
|-------|-------------|-------|------------------------|
| **Level 7** | 7.0 - 7.9 | 🟢 Emerald | Exceptional Performance |
| **Level 6** | 6.0 - 6.9 | 🟢 Green | Advanced Performance |
| **Level 5** | 5.0 - 5.9 | 🟢 Lime | Strong Performance |
| **Level 4** | 4.0 - 4.9 | 🔵 Blue | Good Performance |
| **Level 3** | 3.0 - 3.9 | 🔵 Cyan | Developing Performance |
| **Level 2** | 2.0 - 2.9 | 🟡 Yellow | Basic Performance |
| **Level 1** | 1.0 - 1.9 | 🟠 Orange | Beginning Performance |
| **Level 0** | 0.0 - 0.9 | 🔴 Red | Needs Immediate Attention |

## Dashboard Components

### 1. **Level Distribution Pie Chart**

**Location:** Campus Overview → Level Distribution (right side)

**Purpose:** Shows the distribution of campuses across different performance levels

**How to Read:**
- Each slice represents campuses at a specific level
- Labels show: `"X Campuses at Level Y"`
- Larger slices indicate more campuses at that level
- Colors correspond to performance levels (green = higher, red = lower)

**Example Interpretation:**
```
"7 Campuses at Level 1" = Seven campuses are performing at Level 1
"2 Campuses at Level 2" = Two campuses are performing at Level 2
```

### 2. **Campus Performance Chart**

**Location:** Campus Overview → Campus Performance (left side)

**Features:**
- **Y-axis:** Shows scale 0-7 with all numbers visible
- **Competency Filter:** Dropdown to view specific competency performance
- **Minor Grid Lines:** Help identify precise scores (e.g., 2.4, 2.7)

**How to Use:**
1. **Overall View:** Select "Overall Score" to see general campus performance
2. **Specific Competency:** Choose any competency (e.g., "Vipassana") to see campus performance in that area
3. **Precise Reading:** Use grid lines to identify exact scores

### 3. **Campus Levels Table**

**Location:** Campus Overview → Campus Levels (bottom)

**Information Displayed:**
- Campus name and location
- Exact numerical score
- Visual progress bar (scaled 0-7)
- **Level badge** with color coding
- Number of resolvers
- Last evaluation date

**Level Badge Colors:**
- 🟢 **Emerald/Green:** Level 6-7 (Top performers)
- 🔵 **Blue/Cyan:** Level 3-5 (Good to developing)
- 🟡 **Yellow:** Level 2 (Basic performance)
- 🟠 **Orange:** Level 1 (Beginning)
- 🔴 **Red:** Level 0 (Needs attention)

### 4. **Summary Cards**

**Top Level Campuses Card:**
- Shows count of campuses at Level 6-7
- Indicates your highest-performing campuses
- Helps track excellence across the network

## Practical Usage

### 📈 **For Campus Improvement**

1. **Identify Focus Areas:**
   - Campuses at Level 0-1: Immediate intervention needed
   - Campuses at Level 2-3: Development support required
   - Campuses at Level 4+: Share best practices

2. **Track Progress:**
   - Monitor level changes over time
   - Set targets for level advancement
   - Celebrate campuses moving up levels

3. **Resource Allocation:**
   - Prioritize support for lower-level campuses
   - Allocate mentoring resources based on level distribution
   - Plan capacity building programs

### 🎯 **For Strategic Planning**

1. **Network Health:**
   - Balanced distribution across levels indicates healthy growth
   - Too many campuses at low levels may indicate systemic issues
   - High concentration at upper levels shows network maturity

2. **Goal Setting:**
   - Set realistic targets: "Move 3 campuses from Level 1 to Level 2"
   - Track network-wide improvement
   - Benchmark against previous periods

### 📊 **For Competency-Specific Analysis**

1. **Use Competency Filter:**
   - Select specific competencies from dropdown
   - Compare campus performance in different areas
   - Identify competency-specific strengths and gaps

2. **Example Analysis:**
   ```
   Vipassana Competency:
   - Campus A: Level 3 (Strong in meditation practices)
   - Campus B: Level 1 (Needs meditation program support)
   ```

## Best Practices

### ✅ **Do's**

- **Regular Monitoring:** Check level distribution monthly
- **Competency Deep-Dives:** Use filters to analyze specific areas
- **Trend Analysis:** Track level changes over time
- **Action Planning:** Create improvement plans for lower-level campuses
- **Recognition:** Celebrate campuses advancing levels

### ❌ **Don'ts**

- **Don't Compare Unfairly:** Consider campus context and resources
- **Don't Ignore Level 0-1:** These campuses need immediate support
- **Don't Focus Only on Averages:** Use competency filters for detailed insights
- **Don't Set Unrealistic Targets:** Level advancement takes time and support

## Interpretation Examples

### Example 1: Balanced Network
```
Level Distribution:
- Level 3: 2 campuses
- Level 2: 5 campuses  
- Level 1: 3 campuses
- Level 0: 0 campuses
```
**Interpretation:** Healthy distribution with most campuses developing well, no critical cases.

### Example 2: Development Needed
```
Level Distribution:
- Level 2: 1 campus
- Level 1: 7 campuses
- Level 0: 2 campuses
```
**Interpretation:** Network needs significant support, focus on moving Level 0 campuses up.

### Example 3: High-Performing Network
```
Level Distribution:
- Level 4: 3 campuses
- Level 3: 4 campuses
- Level 2: 2 campuses
```
**Interpretation:** Strong network performance, focus on sharing best practices.

## Technical Notes

### Data Source
- Levels calculated from Google Sheets evaluation data
- Real-time updates when new evaluations are submitted
- Automatic recalculation when competency scores change

### Calculation Method
```javascript
// Level calculation formula
const level = Math.floor(averageScore);
const campusLevel = `Level ${Math.min(7, Math.max(0, level))}`;
```

### Color Coding System
- **Performance-based:** Higher levels = greener colors
- **Intuitive:** Red (needs attention) → Green (excellent)
- **Consistent:** Same colors across all dashboard components

---

## Quick Reference

| Component | Purpose | Key Insight |
|-----------|---------|-------------|
| **Pie Chart** | Overall distribution | Network health at a glance |
| **Performance Chart** | Detailed scores | Precise performance measurement |
| **Levels Table** | Individual campus status | Specific campus information |
| **Summary Cards** | Key metrics | Quick network overview |

**Remember:** The Level Distribution system is designed to provide actionable insights for campus improvement and network development. Use it as a tool for continuous enhancement rather than just measurement.