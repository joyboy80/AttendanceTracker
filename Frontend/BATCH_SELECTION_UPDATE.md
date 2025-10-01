# Batch Selection Update - Frontend Changes

## Overview
Updated the "Add Routine" batch selection to display numbers 20-29 without the "batch" prefix in labels.

## Changes Made

### 1. Updated Batch Generation (`fetchStudentBatches` function)
**Before:**
```typescript
// Fetched from API: ['CSE-2021', 'CSE-2022', 'CSE-2023', 'EEE-2021', 'EEE-2022']
```

**After:**
```typescript
// Generated locally: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29']
const generatedBatches = [];
for (let i = 20; i <= 29; i++) {
  generatedBatches.push(i.toString());
}
```

### 2. Updated Course-Batch Mappings
**Before:**
```typescript
const courses = [
  { id: 1, title: 'Computer Science 101', batches: ['CSE-2021', 'CSE-2022'] },
  { id: 2, title: 'Mathematics', batches: ['CSE-2021', 'EEE-2021'] },
  // ...
];
```

**After:**
```typescript
const courses = [
  { id: 1, title: 'Computer Science 101', batches: ['20', '21', '22', '23'] },
  { id: 2, title: 'Mathematics', batches: ['20', '21', '24', '25'] },
  { id: 3, title: 'Physics', batches: ['22', '23', '26', '27'] },
  { id: 4, title: 'Circuit Analysis', batches: ['24', '25', '28', '29'] },
  { id: 5, title: 'Data Structures', batches: ['20', '21', '22'] },
  { id: 6, title: 'Database Systems', batches: ['23', '24', '25'] },
  { id: 7, title: 'Software Engineering', batches: ['26', '27', '28', '29'] }
];
```

### 3. Updated Error Messages
**Before:**
```
"No student batches found. Make sure students are registered first."
```

**After:**
```
"No batches available."
```

## UI Impact

### Batch Selection Dropdown (Add Routine Modal)
- **Label**: "Batch" (unchanged)
- **Options**: Now shows numbers: `20, 21, 22, 23, 24, 25, 26, 27, 28, 29`
- **Placeholder**: "Select Batch" (unchanged)

### Batch Filter Dropdown (Main View)
- **Label**: "Filter by Batch" (unchanged)  
- **Options**: Now shows numbers: `All Batches, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29`

### Course Selection
- Courses are now mapped to the new batch numbers
- Course availability updates based on selected batch number
- More courses added to provide better coverage across all batch numbers

## Benefits
1. **Simplified Display**: Clean numeric display without department prefixes
2. **Consistent Numbering**: Sequential batch numbers from 20-29
3. **Better Course Distribution**: All batch numbers have associated courses
4. **No API Dependency**: Batch list is generated locally for reliability

## Testing
- Batch dropdown in "Add Routine" modal shows numbers 20-29
- Filter dropdown shows "All Batches" plus numbers 20-29
- Course selection works correctly based on batch selection
- Form validation works with new batch number format