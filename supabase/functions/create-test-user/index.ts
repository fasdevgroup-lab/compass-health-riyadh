import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: string;
  department: string;
  phone: string;
}

const TEST_USERS: TestUser[] = [
  { email: "test@compass-health.sa", password: "Test123456", name: "الجمعية السعودية لمكافحة السرطان", role: "association", department: "إدارة", phone: "+966-50-1234567" },
  { email: "admin@compass-health.sa", password: "Admin123456", name: "إدارة المبادرة", role: "admin", department: "الإدارة التنفيذية", phone: "+966-11-9876543" },
  { email: "supervisor@compass-health.sa", password: "Super123456", name: "مشرف الجهة الإشرافية", role: "supervisor", department: "الإشراف والمتابعة", phone: "+966-11-1111111" },
  { email: "consultant@compass-health.sa", password: "Consult123456", name: "الفريق الاستشاري", role: "consultant", department: "التحليل والتطوير", phone: "+966-11-2222222" },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results: { email: string; status: string }[] = [];

    for (const testUser of TEST_USERS) {
      // Check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u: { email: string }) => u.email === testUser.email);

      if (existing) {
        // Update initiative_users with user_id
        await supabase
          .from("initiative_users")
          .update({ user_id: existing.id })
          .eq("email", testUser.email);

        results.push({ email: testUser.email, status: "exists" });
        continue;
      }

      // Create auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          name: testUser.name,
          role: testUser.role,
        },
      });

      if (createError) {
        console.error(`Error creating ${testUser.email}:`, createError);
        results.push({ email: testUser.email, status: "error" });
        continue;
      }

      // Update initiative_users with user_id
      let role: "admin" | "supervisor" | "consultant" | "association" = "association";
      if (testUser.role === "admin") role = "admin";
      else if (testUser.role === "supervisor") role = "supervisor";
      else if (testUser.role === "consultant") role = "consultant";

      await supabase
        .from("initiative_users")
        .upsert({
          user_id: newUser.user.id,
          email: testUser.email,
          full_name: testUser.name,
          role: role,
          department: testUser.department,
          phone: testUser.phone,
        }, { onConflict: "email" });

      // For association user, create the association record
      if (testUser.role === "association") {
        const { data: categories } = await supabase
          .from("association_categories")
          .select("id")
          .eq("name_ar", "السرطان")
          .single();

        await supabase.from("associations").upsert({
          user_id: newUser.user.id,
          name: "الجمعية السعودية لمكافحة السرطان",
          license_number: "12345",
          category_id: categories?.id,
          establishment_year: 2005,
          city: "الرياض",
          address: "الرياض - حي الصحافة",
          phone: "+966-11-1234567",
          email: "info@cancer-society.sa",
          website: "https://cancer-society.sa",
          description: "جمعية خيرية متخصصة في مكافحة مرض السرطان وتقديم الدعم للمرضى وذويهم",
          employee_count: 85,
          volunteer_count: 250,
          beneficiary_count: 5000,
          annual_budget: 15000000,
          status: "active",
        }, { onConflict: "user_id" });
      }

      results.push({ email: testUser.email, status: "created" });
    }

    const usersList = TEST_USERS.map(u => ({ email: u.email, password: u.password, role: u.role }));

    return new Response(
      JSON.stringify({
        message: "تم إنشاء/تحديث جميع المستخدمين",
        users: usersList,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "حدث خطأ أثناء إنشاء المستخدمين" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
