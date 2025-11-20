import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (Admins) - from Replit Auth blueprint
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isMainAdmin: boolean("is_main_admin").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

// Groups table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

// People/Passports table
export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 32 }).notNull().unique(),
  fullName: text("full_name").notNull(),
  birthDate: date("birth_date").notNull(),
  passportNumber: text("passport_number").notNull(),
  status: boolean("status").default(true).notNull(),
  expirationDate: date("expiration_date").notNull(),
  notes: text("notes").default(""),
  photoUrl: text("photo_url"),
  qrCodeUrl: text("qr_code_url"),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPersonSchema = createInsertSchema(people).omit({
  id: true,
  publicId: true,
  qrCodeUrl: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  birthDate: z.string(),
  expirationDate: z.string(),
});

export const updatePersonSchema = insertPersonSchema.partial().extend({
  id: z.number(),
});

export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type UpdatePerson = z.infer<typeof updatePersonSchema>;
export type Person = typeof people.$inferSelect;

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  performedBy: varchar("performed_by").references(() => users.id).notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdGroups: many(groups),
  createdPeople: many(people),
  activityLogs: many(activityLogs),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  people: many(people),
}));

export const peopleRelations = relations(people, ({ one }) => ({
  group: one(groups, {
    fields: [people.groupId],
    references: [groups.id],
  }),
  createdBy: one(users, {
    fields: [people.createdBy],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  performedBy: one(users, {
    fields: [activityLogs.performedBy],
    references: [users.id],
  }),
}));
