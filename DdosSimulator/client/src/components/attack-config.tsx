import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Server, insertDdosTestSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const ATTACK_METHODS = ["UDP Flood", "SYN Flood", "HTTP Flood"];

export function AttackConfig() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: servers } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const form = useForm({
    resolver: zodResolver(insertDdosTestSchema),
    defaultValues: {
      serverId: 0,
      attackMethod: "",
      packetSize: 0,
      duration: 0,
      totalRequests: 0,
      status: "pending",
      startTime: new Date(),
    },
  });

  const startAttackMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/ddos-tests", {
        ...data,
        startTime: new Date(),
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Attack Started",
        description: "Redirecting to monitoring page...",
      });
      setLocation(`/monitor/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Start Attack",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!servers?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please add at least one target server before configuring an attack.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => startAttackMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="serverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Server</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a server" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {servers.map((server) => (
                        <SelectItem key={server.id} value={server.id.toString()}>
                          {server.hostname} ({server.ipAddress})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attackMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attack Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select attack method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ATTACK_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packetSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packet Size (bytes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="300" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Requests</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={startAttackMutation.isPending}>
              {startAttackMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Attack
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
