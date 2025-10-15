import { NextResponse } from "next/server";
import { 
  getUserPlanFeaturesServer, 
  getUserPlanServer, 
  hasFeatureServer, 
  canCreateCompanionServer, 
  canStartInterviewServer,
  getUserUsageServer
} from "@/lib/billing.server";
import { FeatureType } from "@/lib/billing.server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    switch (action) {
      case 'plan':
        const plan = await getUserPlanServer();
        return NextResponse.json({ plan });
        
      case 'features':
        const features = await getUserPlanFeaturesServer();
        return NextResponse.json({ features });
        
      case 'can-create-companion':
        const canCreate = await canCreateCompanionServer();
        return NextResponse.json({ canCreate });
        
      case 'can-start-interview':
        const canStart = await canStartInterviewServer();
        return NextResponse.json({ canStart });
        
      case 'has-feature':
        const feature = searchParams.get('feature');
        if (!feature) {
          return NextResponse.json({ error: "Feature parameter is required" }, { status: 400 });
        }
        // Validate that the feature is a valid FeatureType
        const validFeatures: FeatureType[] = [
          'companions_limit',
          'interviews_per_month',
          'resume_analysis',
          'advanced_reporting',
          'priority_support'
        ];
        
        if (!validFeatures.includes(feature as FeatureType)) {
          return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
        }
        
        const hasFeature = await hasFeatureServer(feature as FeatureType);
        return NextResponse.json({ hasFeature });
        
      case 'usage':
        // Get both companions and interviews count
        const usage = await getUserUsageServer();
        return NextResponse.json(usage);
        
      case 'companions-count':
        const usage1 = await getUserUsageServer();
        return NextResponse.json({ count: usage1.companions });
        
      case 'interviews-count':
        const usage2 = await getUserUsageServer();
        return NextResponse.json({ count: usage2.interviews });
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    // Handle unauthorized access
    if (error instanceof Error && error.message.includes('auth/unauthorized')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.error("Error in billing API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}