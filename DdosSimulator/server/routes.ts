import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertServerSchema, insertDdosTestSchema, insertTrafficLogSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Middleware to ensure user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Server management endpoints
  app.get("/api/servers", requireAuth, async (req, res) => {
    const servers = await storage.getServers();
    res.json(servers);
  });

  app.post("/api/servers", requireAuth, async (req, res) => {
    try {
      const serverData = insertServerSchema.parse(req.body);
      const server = await storage.createServer(serverData);
      res.status(201).json(server);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid server data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create server" });
      }
    }
  });

  // DDoS test endpoints
  app.post("/api/ddos-tests", requireAuth, async (req, res) => {
    try {
      const testData = insertDdosTestSchema.parse(req.body);
      const test = await storage.createDdosTest(testData);
      
      // Notify all connected clients about new test
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "NEW_TEST", data: test }));
        }
      });
      
      res.status(201).json(test);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid test data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create DDoS test" });
      }
    }
  });

  app.get("/api/ddos-tests/:id/logs", requireAuth, async (req, res) => {
    const testId = parseInt(req.params.id);
    const logs = await storage.getTestLogs(testId);
    res.json(logs);
  });

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "NEW_LOG") {
          const logData = insertTrafficLogSchema.parse(data.payload);
          const log = await storage.createTrafficLog(logData);
          
          // Broadcast log to all connected clients
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "NEW_LOG", data: log }));
            }
          });
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: "ERROR", message: "Invalid message format" }));
      }
    });
  });

  return httpServer;
}
