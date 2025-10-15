# Billing System Implementation

This document describes the billing system implementation for the RehearsAI platform using Clerk's billing features and Supabase for usage tracking.

## Overview

The billing system implements feature restrictions based on user subscription plans:
- **Free Plan**: Limited features and usage
- **Basic Plan**: Enhanced features with usage limits
- **Pro Plan**: Unlimited access to all features

## Key Components

### 1. Billing Utility (`lib/billing.ts`)

Central utility for checking user permissions and plan features:

```typescript
// Check if user can create a new companion
const canCreate = await canCreateCompanion();

// Check if user can start an interview
const canStart = await canStartInterview();

// Check if user has access to a specific feature
const hasAccess = await hasFeature('resume_analysis');

// Get user's current plan
const plan = await getUserPlan();

// Get all plan features
const features = await getUserPlanFeatures();
```

### 2. Billing Hook (`hooks/useBilling.ts`)

React hook for easy access to billing information in components:

```typescript
import { useBilling } from "@/hooks/useBilling";

const MyComponent = () => {
  const { plan, features, loading, hasFeature } = useBilling();
  
  // Check feature access
  const canAccess = await hasFeature('resume_analysis');
  
  // Render based on plan
  if (plan === 'pro') {
    // Pro features
  }
};
```

### 3. Plan Restriction Component (`components/PlanRestriction.tsx`)

Wrapper component to conditionally render content based on user plan:

```tsx
<PlanRestriction 
  currentPlan={currentPlan} 
  requiredPlan="basic" 
  featureName="Resume Analysis"
>
  <ResumeAnalysisFeature />
</PlanRestriction>
```

### 4. Usage Limits Component (`components/UsageLimits.tsx`)

Display component showing current usage vs plan limits:

```tsx
<UsageLimits />
```

## Feature Restrictions

### Companions (AI Tutors)
- **Free**: 1 companion limit
- **Basic**: 10 companions limit
- **Pro**: 50 companions limit

### Interviews per Month
- **Free**: 2 interviews
- **Basic**: 10 interviews
- **Pro**: Unlimited interviews

### Advanced Features
- **Resume Analysis**: Basic & Pro plans
- **Mock Tests**: Basic & Pro plans
- **Flashcards**: Basic & Pro plans
- **Advanced Reporting**: Pro plan only
- **Priority Support**: Pro plan only

## Implementation Examples

### Checking Permissions in Server Actions

```typescript
import { canCreateCompanion } from "@/lib/billing";

export const createCompanion = async (formData: CreateCompanion) => {
  // Check if user can create a companion
  const canCreate = await canCreateCompanion();
  if (!canCreate) {
    throw new Error("You've reached your companion limit for your current plan.");
  }
  
  // Proceed with creation
};
```

### Checking Permissions in Client Components

```typescript
import { useBilling } from "@/hooks/useBilling";

const InterviewClient = () => {
  const { canStartInterview } = useBilling();
  
  const handleStartInterview = async () => {
    const canStart = await canStartInterview();
    if (!canStart) {
      alert("You've reached your interview limit. Please upgrade.");
      return;
    }
    
    // Start interview
  };
};
```

### Feature-Based Rendering

```tsx
import PlanRestriction from "@/components/PlanRestriction";
import { useBilling } from "@/hooks/useBilling";

const ResumeAnalysis = () => {
  const { plan } = useBilling();
  
  return (
    <PlanRestriction 
      currentPlan={plan} 
      requiredPlan="basic" 
      featureName="Resume Analysis"
    >
      <ResumeAnalysisComponent />
    </PlanRestriction>
  );
};
```

## Usage Tracking

The system tracks usage through Supabase:

1. **Companions Count**: Number of AI tutors created
2. **Interviews Count**: Number of interviews conducted per month

Usage data is displayed in the My Journey page through the `UsageLimits` component.

## Integration with Clerk

The system leverages Clerk's built-in billing features:

- `has({ plan: 'pro' })` - Check if user has Pro plan
- `has({ plan: 'basic' })` - Check if user has Basic plan
- `has({ feature: 'feature_name' })` - Check if user has specific feature

## Future Enhancements

1. **Webhooks**: Implement Clerk webhooks for real-time subscription updates
2. **Usage Analytics**: Enhanced analytics dashboard
3. **Feature Toggles**: Dynamic feature enabling/disabling
4. **Trial Periods**: Implement free trial functionality
5. **Coupon Codes**: Add discount code support

## Testing

To test the billing system:

1. Create test users with different plans in Clerk
2. Verify feature access restrictions
3. Check usage limit enforcement
4. Test upgrade/downgrade flows
5. Validate error handling

## Troubleshooting

Common issues and solutions:

1. **Permission Errors**: Ensure Clerk plans are properly configured
2. **Usage Count Mismatches**: Check Supabase query accuracy
3. **UI Not Updating**: Verify revalidation paths in server actions