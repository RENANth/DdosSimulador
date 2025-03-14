import { User, Server, DdosTest, TrafficLog, InsertUser, InsertServer, InsertDdosTest, InsertTrafficLog } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Server operations
  getServers(): Promise<Server[]>;
  getServer(id: number): Promise<Server | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  
  // DDoS Test operations
  createDdosTest(test: InsertDdosTest): Promise<DdosTest>;
  getDdosTest(id: number): Promise<DdosTest | undefined>;
  updateDdosTestStatus(id: number, status: string): Promise<DdosTest>;
  
  // Traffic Log operations
  createTrafficLog(log: InsertTrafficLog): Promise<TrafficLog>;
  getTestLogs(testId: number): Promise<TrafficLog[]>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private servers: Map<number, Server>;
  private ddosTests: Map<number, DdosTest>;
  private trafficLogs: Map<number, TrafficLog>;
  private currentIds: { [key: string]: number };
  readonly sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.servers = new Map();
    this.ddosTests = new Map();
    this.trafficLogs = new Map();
    this.currentIds = { users: 1, servers: 1, tests: 1, logs: 1 };
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getServers(): Promise<Server[]> {
    return Array.from(this.servers.values());
  }

  async getServer(id: number): Promise<Server | undefined> {
    return this.servers.get(id);
  }

  async createServer(server: InsertServer): Promise<Server> {
    const id = this.currentIds.servers++;
    const newServer = { 
      ...server, 
      id, 
      registeredAt: new Date() 
    };
    this.servers.set(id, newServer);
    return newServer;
  }

  async createDdosTest(test: InsertDdosTest): Promise<DdosTest> {
    const id = this.currentIds.tests++;
    const newTest = { ...test, id };
    this.ddosTests.set(id, newTest);
    return newTest;
  }

  async getDdosTest(id: number): Promise<DdosTest | undefined> {
    return this.ddosTests.get(id);
  }

  async updateDdosTestStatus(id: number, status: string): Promise<DdosTest> {
    const test = await this.getDdosTest(id);
    if (!test) throw new Error("Test not found");
    
    const updatedTest = { ...test, status };
    this.ddosTests.set(id, updatedTest);
    return updatedTest;
  }

  async createTrafficLog(log: InsertTrafficLog): Promise<TrafficLog> {
    const id = this.currentIds.logs++;
    const newLog = { ...log, id };
    this.trafficLogs.set(id, newLog);
    return newLog;
  }

  async getTestLogs(testId: number): Promise<TrafficLog[]> {
    return Array.from(this.trafficLogs.values())
      .filter(log => log.testId === testId);
  }
}

export const storage = new MemStorage();
