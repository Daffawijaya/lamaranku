import { SuratDemo } from "../../../components/Builders";
import { supabaseServer } from "../../../lib/supabase/server";
import { hasActivePlus } from "../../../lib/plus-access";
export default async function SuratDashboardPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="dash-feature-panel letter-page">
      <SuratDemo isPlus={user ? hasActivePlus(user) : false} />
    </div>
  );
}
