import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (from auth blueprint)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Server schema
export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  hostname: text("hostname").notNull(),
  ipAddress: text("ip_address").notNull(),
  location: text("location").notNull(),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

// DDoS Test schema
export const ddosTests = pgTable("ddos_tests", {
  id: serial("id").primaryKey(),
  serverId: integer("server_id").notNull(),
  attackMethod: text("attack_method").notNull(),
  packetSize: integer("packet_size").notNull(),
  duration: integer("duration").notNull(),
  totalRequests: integer("total_requests").notNull(),
  status: text("status").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
});

// Traffic Log schema
export const trafficLogs = pgTable("traffic_logs", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  packetsSent: integer("packets_sent").notNull(),
  packetsReceived: integer("packets_received").notNull(),
  responseTime: integer("response_time").notNull(),
  sourceIp: text("source_ip").notNull(),
  destinationIp: text("destination_ip").notNull(),
});

// Schema for insert operations
export const insertUserSchema = createInsertSchema(users);
export const insertServerSchema = createInsertSchema(servers).omit({ registeredAt: true });
export const insertDdosTestSchema = createInsertSchema(ddosTests).omit({ id: true });
export const insertTrafficLogSchema = createInsertSchema(trafficLogs).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;
export type DdosTest = typeof ddosTests.$inferSelect;
export type InsertDdosTest = z.infer<typeof insertDdosTestSchema>;
export type TrafficLog = typeof trafficLogs.$inferSelect;
export type InsertTrafficLog = z.infer<typeof insertTrafficLogSchema>;
