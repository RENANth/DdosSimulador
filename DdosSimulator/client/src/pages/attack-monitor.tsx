import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DdosTest, TrafficLog } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricsDisplay } from "@/components/metrics-display";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AttackMonitor() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: test, error } = useQuery<DdosTest>({
    queryKey: [`/api/ddos-tests/${id}`],
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "NEW_LOG" && message.data.testId === Number(id)) {
        setLogs(prev => [...prev, message.data]);
      }
    };

    return () => {
      ws.close();
    };
  }, [id]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-destructive/10 border-destructive">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-semibold">Error Loading Test Data</h2>
          </div>
          <p className="text-sm text-destructive mb-4">{error.message}</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-muted rounded" />
            <div className="h-40 bg-muted rounded" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="mt-4">
            <h1 className="text-2xl font-bold">Attack Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Monitoring DDoS test #{id} - {test.attackMethod}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <MetricsDisplay test={test} logs={logs} />
      </main>
    </div>
  );
}
