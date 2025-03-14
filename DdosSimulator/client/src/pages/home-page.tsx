import { useAuth } from "@/hooks/use-auth";
import { ServerManagement } from "@/components/server-management";
import { AttackConfig } from "@/components/attack-config";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">DDoS Simulator</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.username}</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Server Management</h2>
            <ServerManagement />
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">Attack Configuration</h2>
            <AttackConfig />
          </section>
        </div>
      </main>
    </div>
  );
}
