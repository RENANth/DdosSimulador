import { DdosTest, TrafficLog } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow } from "date-fns";

interface MetricsDisplayProps {
  test: DdosTest;
  logs: TrafficLog[];
}

export function MetricsDisplay({ test, logs }: MetricsDisplayProps) {
  const elapsedTime = test.startTime ? Math.min(
    (Date.now() - new Date(test.startTime).getTime()) / 1000,
    test.duration
  ) : 0;

  const progress = (elapsedTime / test.duration) * 100;

  const chartData = logs.map(log => ({
    time: formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }),
    sent: log.packetsSent,
    received: log.packetsReceived,
    responseTime: log.responseTime,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {Math.round(elapsedTime)}s / {test.duration}s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Packets Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {logs.reduce((sum, log) => sum + log.packetsSent, 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              of {test.totalRequests} planned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {logs.length
                ? Math.round(
                    logs.reduce((sum, log) => sum + log.responseTime, 0) /
                      logs.length
                  )
                : 0}
              ms
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  name="Packets Sent"
                />
                <Area
                  type="monotone"
                  dataKey="received"
                  stackId="2"
                  stroke="hsl(var(--destructive))"
                  fill="hsl(var(--destructive))"
                  fillOpacity={0.2}
                  name="Packets Received"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
