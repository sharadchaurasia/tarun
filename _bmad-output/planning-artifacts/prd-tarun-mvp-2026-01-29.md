---
title: "Tarun - WhatsApp Business Platform MVP"
type: PRD
version: 1.0
date: 2026-01-29
author: Sharadchaurasia
status: Draft
inputDocuments: ['brainstorming-session-2026-01-29.md']
---

# Product Requirements Document: Tarun MVP

## Executive Summary

Tarun is a WhatsApp Business Platform that enables SMBs and D2C brands to manage customer conversations, automate sales and support through AI agents and chatbots, track leads through a WhatsApp-first CRM, and intelligently distribute conversations to the right support agents -- all through one unified platform.

The MVP focuses on 5 core pillars: **WhatsApp Business API integration**, **AI Agent**, **Chatbot Builder**, **Sales CRM**, and **Auto-Assignment** of leads to customer support.

**Design Philosophy:** Intelligent multi-layer routing -- classify and route to the optimal path at every layer, from message providers to AI model tiers to agent assignment.

---

## 1. Problem Statement

### The Core Problem

Small and mid-size businesses in India and emerging markets are increasingly dependent on WhatsApp as their primary customer communication channel. However:

- **Manual conversation management** doesn't scale beyond 50-100 daily conversations
- **Existing solutions** (Interakt, WATI, AiSensy) are either too expensive at scale, too limited in AI capabilities, or lock businesses into rigid workflows
- **No WhatsApp-first CRM** exists that treats conversations as the native unit of customer relationship, forcing businesses to stitch together WhatsApp tools + separate CRMs
- **Customer support routing** is manual -- business owners personally triage and forward messages to the right team member, creating bottlenecks
- **AI automation** in current platforms is basic keyword matching, not true intelligent agents that learn and improve

### Problem Impact

- Businesses lose leads because replies come too late (average response time >4 hours without automation)
- Support agents waste 30-40% of time on repetitive FAQ-type queries that could be automated
- No visibility into conversation-to-conversion pipeline -- businesses can't measure WhatsApp ROI
- Customer experience degrades as businesses grow because manual processes break

### Why Existing Solutions Fall Short

| Platform | Key Limitation |
|----------|---------------|
| Interakt | Basic AI agents (new/untested), no smart routing, limited workflow branching, UI complexity |
| WATI | Expensive at scale, limited AI capabilities, no self-improving knowledge base |
| AiSensy | Broadcast-focused, weak CRM, no AI agents |
| Freshchat | Not WhatsApp-first, bolted-on WhatsApp support feels secondary |
| HubSpot | Enterprise pricing, WhatsApp is an afterthought, not native |

---

## 2. Product Vision

**One-liner:** The intelligent WhatsApp operating system for growing businesses.

**Vision:** Build a WhatsApp Business Platform where every component -- from message delivery to AI responses to agent routing -- uses intelligent classification and routing to deliver the right response through the right channel at the right cost. The platform gets smarter and cheaper the longer a business uses it.

---

## 3. Target Users

### Primary: Indian SMBs & D2C Brands (10-200 employees)

- E-commerce sellers on Shopify/WooCommerce using WhatsApp for order updates and support
- D2C brands running WhatsApp marketing campaigns and needing conversion tracking
- Service businesses (education, healthcare, real estate) managing lead inquiries via WhatsApp
- Businesses currently using WhatsApp Business App and hitting its limits

### Secondary: Customer Support Teams

- Support agents handling 50+ conversations daily who need queue management
- Support managers who need assignment rules, SLAs, and performance visibility

### User Personas

**Persona 1: Priya -- D2C Brand Founder**
- Runs a skincare brand with 5 team members
- Gets 200+ WhatsApp inquiries daily, personally triages messages to the right person
- Uses Shopify, wants order updates automated on WhatsApp
- Needs: Automation for FAQs, smart routing to sales vs support, campaign broadcasting

**Persona 2: Rahul -- Customer Support Manager**
- Manages 8 support agents for an ed-tech company
- Agents use personal phones, no visibility into response times or resolution rates
- Needs: Shared inbox, auto-assignment, performance metrics, AI handling L1 queries

**Persona 3: Amit -- Sales Head**
- Runs a real estate agency, leads come in via WhatsApp from property portals
- No system to track which leads are hot, which agent is handling what
- Needs: Lead capture, pipeline stages, auto-assignment by geography/property type

---

## 4. MVP Feature Specifications

### 4.1 WhatsApp Business API Integration

**Goal:** Reliable, scalable message send/receive infrastructure with provider flexibility.

#### MVP Scope

| Feature | Description | Priority |
|---------|-------------|----------|
| WhatsApp Cloud API connection | Connect via Meta's official Cloud API with BSP application | P0 |
| Message send/receive | Text, image, document, video, location, contact messages | P0 |
| Template message management | Create, submit for approval, and send template messages | P0 |
| Webhook ingestion | Receive delivery receipts, read receipts, incoming messages | P0 |
| Provider abstraction interface | Internal API layer that decouples platform from provider (single implementation, designed for multi-provider) | P0 |
| Broadcast campaigns | Send template messages to segmented contact lists | P1 |
| Message queue (Redis-based) | Queue for reliable message processing with retry logic | P0 |
| Rate limiting & throttling | Respect WhatsApp API rate limits, queue excess messages | P0 |

#### MVP Architecture Decisions

- **Single provider** (WhatsApp Cloud API) but behind an abstraction interface so additional providers (on-prem, third-party BSPs) can be added in Phase 2
- **Redis Streams** for message queuing in MVP (Kafka added in Phase 2 for broadcast scale)
- **Webhook endpoint** with signature verification, idempotent processing, and failed delivery retry (3 attempts with exponential backoff)

#### API Data Model

```
Message {
  id: UUID
  tenant_id: UUID
  direction: INBOUND | OUTBOUND
  channel: WHATSAPP
  from: string (phone number)
  to: string (phone number)
  type: TEXT | IMAGE | DOCUMENT | VIDEO | TEMPLATE | INTERACTIVE
  content: JSON
  status: QUEUED | SENT | DELIVERED | READ | FAILED
  provider_message_id: string
  metadata: JSON
  created_at: timestamp
  updated_at: timestamp
}
```

---

### 4.2 AI Agent

**Goal:** Intelligent automated responder that handles routine queries, learns from human agents, and knows when to escalate.

#### MVP Scope

| Feature | Description | Priority |
|---------|-------------|----------|
| Single LLM integration | OpenAI GPT-4o-mini as default model | P0 |
| Business knowledge base (structured) | Guided setup: business info, products/services, FAQs, policies | P0 |
| Document upload + RAG | Upload PDFs/docs, vector search for relevant context at query time | P1 |
| Confidence-based escalation | AI assesses confidence; low confidence = escalate to human agent | P0 |
| Conversation context | AI maintains context within a conversation session (last 20 messages) | P0 |
| AI on/off per conversation | Agents can pause AI and take over manually, resume AI when done | P0 |
| Response tone configuration | Business configures tone (formal/friendly/casual) and language | P1 |
| AI usage dashboard | Token consumption, queries handled vs escalated, cost per conversation | P1 |

#### MVP Architecture Decisions

- **Single model** (GPT-4o-mini) for MVP -- cost-effective and fast. Tiered model routing (small model for FAQs, premium for complex) is Phase 2
- **Structured knowledge base** is P0, **RAG** is P1 -- structured data gives reliable answers faster
- **Confidence scoring** using a simple heuristic: knowledge base match found = high confidence (respond), partial match = medium (respond with disclaimer), no match = low (escalate to human)
- **BYOK (Bring Your Own Key)** deferred to Phase 2

#### AI Escalation Flow

```
Customer message received
  → Check if AI is enabled for this conversation
  → If enabled: query knowledge base
    → High confidence match → AI responds
    → Medium confidence → AI responds + flags for human review
    → Low confidence / no match → route to human agent (auto-assignment)
  → If disabled: route directly to assigned agent
```

#### Knowledge Base Data Model

```
KnowledgeEntry {
  id: UUID
  tenant_id: UUID
  category: FAQ | PRODUCT | POLICY | CUSTOM
  question: string (for FAQ type)
  answer: string
  keywords: string[]
  metadata: JSON
  is_active: boolean
  source: MANUAL | LEARNED
  created_at: timestamp
}
```

---

### 4.3 Chatbot Builder

**Goal:** Visual flow builder for businesses to create automated conversation workflows without code.

#### MVP Scope

| Feature | Description | Priority |
|---------|-------------|----------|
| Visual flow editor | Drag-and-drop canvas with nodes and connections | P0 |
| Trigger nodes | Start flow on: keyword match, first message, button reply, menu selection | P0 |
| Message nodes | Send text, image, interactive buttons (up to 3), list menus (up to 10 items) | P0 |
| Condition nodes | Branch on: button clicked, keyword match, contact attribute | P0 |
| Action nodes | Assign to agent, add tag, update contact field, trigger AI agent | P0 |
| Delay node | Wait X seconds/minutes/hours before next step | P1 |
| Flow templates | 5-8 pre-built templates (welcome flow, FAQ flow, order status, lead capture, appointment booking) | P1 |
| Flow testing | Test flow in sandbox before publishing | P0 |
| Flow analytics | Messages sent per node, drop-off rates, completion rates | P1 |
| Multi-flow management | Multiple active flows with priority ordering for trigger conflicts | P0 |

#### MVP Architecture Decisions

- **Flow definition** stored as JSON (node graph) -- each node has type, content, connections, and conditions
- **Flow engine** processes one node at a time per conversation, maintaining cursor position in a session state
- **Priority system**: When multiple flows could trigger, highest priority wins. AI Agent acts as fallback when no flow matches
- **No external API call nodes** in MVP -- Phase 2 adds HTTP request nodes for integrations

#### Flow Data Model

```
Flow {
  id: UUID
  tenant_id: UUID
  name: string
  description: string
  status: DRAFT | ACTIVE | PAUSED
  trigger: {
    type: KEYWORD | FIRST_MESSAGE | BUTTON_REPLY | ALWAYS
    value: string (keyword, button_id, etc.)
  }
  priority: integer
  nodes: FlowNode[]
  edges: FlowEdge[]
  version: integer
  created_at: timestamp
  updated_at: timestamp
}

FlowNode {
  id: string
  type: MESSAGE | CONDITION | ACTION | DELAY | TRIGGER
  position: { x: number, y: number }
  data: JSON (type-specific content)
}

FlowEdge {
  id: string
  source_node_id: string
  target_node_id: string
  condition: JSON (optional -- for condition node branches)
}

FlowSession {
  id: UUID
  flow_id: UUID
  contact_id: UUID
  current_node_id: string
  status: ACTIVE | COMPLETED | ABANDONED | ESCALATED
  variables: JSON
  started_at: timestamp
  updated_at: timestamp
}
```

---

### 4.4 Sales CRM

**Goal:** WhatsApp-first CRM where conversations are the native unit of customer relationships.

#### MVP Scope

| Feature | Description | Priority |
|---------|-------------|----------|
| Contact management | Auto-create contacts from incoming messages, merge duplicates by phone number | P0 |
| Contact profile | Name, phone, email, tags, custom fields, conversation history, notes | P0 |
| Conversation inbox | Shared team inbox with filters (unread, assigned to me, unassigned, all) | P0 |
| Conversation status | Open, Pending, Resolved, Spam | P0 |
| Lead pipeline | Configurable pipeline stages (New → Contacted → Qualified → Proposal → Won/Lost) | P0 |
| Pipeline board view | Kanban-style drag-and-drop board for lead stages | P1 |
| Tags and segments | Tag contacts, create segments for broadcast targeting | P0 |
| Quick replies | Pre-saved response templates agents can send with one click | P0 |
| Internal notes | Team members can leave internal notes on conversations (not visible to customer) | P0 |
| Contact import/export | CSV import/export of contacts | P1 |
| Basic analytics | Total conversations, response time, resolution time, conversations per agent | P1 |

#### MVP Architecture Decisions

- **Phone number** is the unique identifier (WhatsApp is phone-first)
- **Conversation** is a rolling 24-hour window per WhatsApp session rules; conversations auto-reopen on new inbound message
- **Pipeline** is single pipeline per tenant in MVP; multiple pipelines in Phase 2
- **No integrations** (Shopify, WooCommerce, etc.) in MVP -- Phase 2

#### CRM Data Model

```
Contact {
  id: UUID
  tenant_id: UUID
  phone: string (E.164 format, unique per tenant)
  name: string
  email: string
  tags: string[]
  custom_fields: JSON
  pipeline_stage: string
  assigned_agent_id: UUID
  source: INBOUND | IMPORT | MANUAL
  last_message_at: timestamp
  created_at: timestamp
}

Conversation {
  id: UUID
  tenant_id: UUID
  contact_id: UUID
  assigned_agent_id: UUID
  status: OPEN | PENDING | RESOLVED | SPAM
  channel: WHATSAPP
  last_message_at: timestamp
  first_response_at: timestamp
  resolved_at: timestamp
  metadata: JSON
  created_at: timestamp
}
```

---

### 4.5 Auto-Assignment

**Goal:** Intelligently distribute incoming conversations to the right support agent based on configurable rules.

#### MVP Scope

| Feature | Description | Priority |
|---------|-------------|----------|
| Round-robin assignment | Distribute conversations equally across available agents | P0 |
| Availability toggle | Agents mark themselves as available/unavailable | P0 |
| Assignment rules engine | Rule-based routing: by keyword, tag, contact attribute, or pipeline stage | P0 |
| Max concurrent conversations | Set per-agent conversation limit; skip agent when at capacity | P0 |
| Team/department routing | Create teams (Sales, Support, Returns); route to team then round-robin within team | P1 |
| Reassignment | Agents can reassign conversations to other agents or teams | P0 |
| Unassigned queue | Conversations that don't match any rule go to unassigned queue | P0 |
| Assignment notifications | Agent gets notified (in-app + optional WhatsApp) when assigned a conversation | P0 |
| SLA timer | Configurable first-response SLA; visual indicator when approaching/breaching SLA | P1 |
| Assignment analytics | Conversations per agent, average response time per agent, SLA compliance rate | P1 |

#### MVP Architecture Decisions

- **Assignment triggers**: New inbound conversation, AI escalation, manual unassignment, chatbot "assign to agent" action
- **Rule evaluation order**: Specific rules first (keyword/tag match → team routing), then fallback to round-robin across available agents
- **Capacity-aware**: Skip agents at max conversation limit; if all agents at capacity, queue as unassigned with alert to admin
- **Sticky assignment**: Once assigned, conversation stays with same agent until resolved or manually reassigned

#### Assignment Flow

```
New conversation / AI escalation
  → Evaluate assignment rules (ordered by priority)
    → Rule match found?
      → Yes: Route to matching team/agent
      → No: Round-robin across all available agents
  → Check agent availability & capacity
    → Agent available & under limit → Assign + notify
    → Agent unavailable/at limit → Try next agent
    → All agents unavailable → Queue as unassigned + alert admin
```

#### Assignment Data Model

```
AssignmentRule {
  id: UUID
  tenant_id: UUID
  name: string
  priority: integer
  conditions: [
    { field: string, operator: string, value: string }
  ]
  target_type: AGENT | TEAM
  target_id: UUID
  is_active: boolean
}

Team {
  id: UUID
  tenant_id: UUID
  name: string
  description: string
  agent_ids: UUID[]
}

AgentStatus {
  agent_id: UUID
  tenant_id: UUID
  is_available: boolean
  current_conversation_count: integer
  max_conversations: integer
  last_assigned_at: timestamp
}
```

---

## 5. Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| Message processing latency (inbound) | < 500ms from webhook to agent/AI |
| Message send latency (outbound) | < 1s from user action to API call |
| Chatbot flow node execution | < 200ms per node |
| AI response time | < 3s for knowledge base query + LLM response |
| Dashboard page load | < 2s |
| Concurrent conversations per tenant | 10,000+ |

### Scalability

- Multi-tenant architecture from day one
- Horizontal scaling of message processing workers
- Database per-tenant sharding strategy designed (single DB in MVP with tenant_id isolation)
- Stateless API servers behind load balancer

### Security

| Requirement | Implementation |
|-------------|---------------|
| Data encryption at rest | AES-256 for database, S3 server-side encryption for media |
| Data encryption in transit | TLS 1.3 for all API communication |
| Authentication | JWT-based auth with refresh tokens |
| Authorization | Role-based access control (Owner, Admin, Agent) |
| Webhook security | Meta signature verification on all incoming webhooks |
| API key management | Encrypted storage for WhatsApp API tokens and LLM API keys |
| Data isolation | Strict tenant_id filtering on every database query |
| PII handling | Phone numbers and messages stored encrypted, access logged |

### Reliability

- 99.5% uptime target for MVP
- Message delivery retry with exponential backoff (3 attempts)
- Dead letter queue for failed messages with admin visibility
- Webhook idempotency via message ID deduplication
- Database backups: daily full + hourly incremental

---

## 6. Technical Architecture (MVP)

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + TypeScript | Component ecosystem, TypeScript safety |
| UI Framework | Ant Design or Shadcn/ui | Production-ready components, good for dashboards |
| Flow Editor | React Flow | Purpose-built for node-based editors |
| Backend API | Node.js (NestJS) | TypeScript end-to-end, strong ecosystem for real-time + REST |
| Real-time | Socket.io | WebSocket abstraction for live inbox updates |
| Message Queue | Redis Streams (BullMQ) | Reliable queuing with retry, delay, priority. Sufficient for MVP scale |
| Database | PostgreSQL | JSONB for flexible schemas, strong relational support |
| Vector DB (P1) | pgvector extension | RAG search without separate infrastructure |
| Cache | Redis | Session state, flow state, agent availability |
| Object Storage | S3 / Cloudflare R2 | Media files (images, documents, videos) |
| Search | PostgreSQL full-text (MVP) | Contact/conversation search without Elasticsearch complexity |
| Hosting | AWS or Railway | Start simple, migrate to k8s when needed |
| CI/CD | GitHub Actions | Standard, free for small teams |

### System Architecture (MVP)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                  │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐ │
│  │  Inbox   │ │   CRM    │ │Chatbot │ │  Dashboard   │ │
│  │  View    │ │ Pipeline │ │Builder │ │  Analytics   │ │
│  └──────────┘ └──────────┘ └────────┘ └──────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API + WebSocket
┌───────────────────────┴─────────────────────────────────┐
│                  API Gateway (NestJS)                     │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐ │
│  │  Auth    │ │ Tenant   │ │  Rate  │ │   Webhook    │ │
│  │  Guard   │ │ Context  │ │ Limit  │ │   Handler    │ │
│  └──────────┘ └──────────┘ └────────┘ └──────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────────┐
        │               │                   │
┌───────┴──────┐ ┌──────┴───────┐ ┌────────┴────────┐
│  Message     │ │  Business    │ │   Assignment    │
│  Service     │ │  Logic       │ │   Engine        │
│              │ │              │ │                 │
│ - Send/Recv  │ │ - CRM        │ │ - Rule eval     │
│ - Queue      │ │ - Contacts   │ │ - Round-robin   │
│ - Provider   │ │ - Pipeline   │ │ - Capacity      │
│   Adapter    │ │ - Knowledge  │ │ - Notification  │
│ - Flow Engine│ │ - AI Agent   │ │                 │
└───────┬──────┘ └──────┬───────┘ └────────┬────────┘
        │               │                   │
┌───────┴───────────────┴───────────────────┴────────┐
│              Data Layer                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐  │
│  │ PostgreSQL │ │   Redis    │ │   S3 / R2      │  │
│  │ (primary)  │ │ (queue +   │ │ (media files)  │  │
│  │            │ │  cache +   │ │                │  │
│  │            │ │  sessions) │ │                │  │
│  └────────────┘ └────────────┘ └────────────────┘  │
└─────────────────────────────────────────────────────┘
        │
┌───────┴─────────────────────────────────────────────┐
│           External Services                          │
│  ┌────────────┐ ┌────────────┐                      │
│  │ WhatsApp   │ │  OpenAI    │                      │
│  │ Cloud API  │ │  API       │                      │
│  └────────────┘ └────────────┘                      │
└─────────────────────────────────────────────────────┘
```

### Message Processing Flow

```
WhatsApp Cloud API
  → Webhook POST /api/webhooks/whatsapp
  → Signature verification
  → Idempotency check (message_id dedup)
  → Enqueue to Redis Stream (BullMQ)
  → Message Worker picks up:
    1. Upsert Contact (by phone number)
    2. Upsert Conversation (by contact + tenant)
    3. Store Message
    4. Check active Chatbot Flow
       → If flow active: execute flow engine
       → If no flow: check AI Agent enabled
         → If AI enabled: query knowledge base + LLM
         → If AI disabled: route to assignment engine
    5. Emit WebSocket event to frontend (real-time inbox update)
```

---

## 7. MVP Phasing

### Phase 1A: Foundation (Must-have for launch)

- WhatsApp Cloud API integration (send/receive/templates)
- Provider abstraction interface (single implementation)
- Message queuing with Redis Streams
- Multi-tenant auth (JWT + RBAC)
- Contact management (auto-create, profile, tags)
- Shared conversation inbox with real-time updates
- Conversation status management
- Round-robin auto-assignment with availability toggle
- Basic assignment rules (by tag, keyword)
- Agent capacity limits

### Phase 1B: Intelligence Layer

- AI Agent with structured knowledge base
- Confidence-based escalation to human
- AI on/off toggle per conversation
- Chatbot flow builder (visual editor)
- Trigger, message, condition, and action nodes
- Flow testing sandbox
- Quick replies for agents
- Internal notes

### Phase 1C: Growth Features

- Broadcast campaigns (template messages to segments)
- Lead pipeline with stages (Kanban view)
- Team/department routing
- SLA timers
- Document upload + RAG for AI knowledge
- AI usage dashboard
- Flow analytics
- Contact import/export
- Basic analytics dashboard

---

## 8. Phase 2 Roadmap (Post-MVP)

Features deferred from brainstorming to keep MVP focused:

| Feature | Origin | Rationale for Deferral |
|---------|--------|----------------------|
| Multi-provider abstraction (failover, cost routing) | API #1, #2, #3 | Need volume to negotiate; single provider sufficient for launch |
| Kafka for broadcast pipeline | API #4, #5 | Redis Streams handles MVP scale; Kafka when broadcast volume justifies ops cost |
| Triple-channel events (WebSocket + pub/sub) | API #8, #9, #10 | Webhooks + WebSocket for MVP; pub/sub for developer API tier |
| Tiered AI model routing | AI #1 | Single model in MVP; tiered when token costs justify optimization |
| BYOK (Bring Your Own Key) | AI #2 | Enterprise feature; add when enterprise tier launches |
| Self-improving knowledge loop | AI #6 | Needs volume of human resolutions to be meaningful |
| Conversation learning layer | AI #4 (layer 3) | Structured + RAG sufficient for MVP; learning layer adds complexity |
| Shopify / WooCommerce integration | Market need | High value but significant scope; needs dedicated sprint |
| Click-to-WhatsApp Ads integration | Market need | Requires Meta Ads API integration; separate workstream |
| Advanced flow nodes (HTTP request, API call) | Chatbot | Opens security/reliability concerns; needs sandboxing |
| Multiple pipelines per tenant | CRM | Single pipeline covers 90% of SMB needs |
| AI-powered smart assignment (skill-based, sentiment) | Auto-Assignment | Round-robin + rules covers MVP needs |

---

## 9. Success Metrics

### North Star Metric

**Monthly Active Business Conversations** -- total conversations handled through the platform across all tenants.

### MVP Launch Targets (First 90 Days)

| Metric | Target |
|--------|--------|
| Businesses onboarded | 50 |
| Monthly conversations processed | 100,000 |
| AI resolution rate (no human needed) | 40%+ |
| Average first response time | < 2 minutes |
| Chatbot flow completion rate | 60%+ |
| Auto-assignment accuracy (correct agent/team) | 85%+ |
| NPS from onboarded businesses | 40+ |

### Business Metrics

| Metric | Target |
|--------|--------|
| Activation rate (complete setup within 7 days) | 60% |
| Week 4 retention | 70% |
| Time to first AI-handled conversation | < 1 hour from signup |
| Support tickets per business per month | < 3 |

---

## 10. Monetization (MVP)

### Pricing Model

| Tier | Price | Includes |
|------|-------|----------|
| **Starter** | Free (14-day trial) | 1 agent, 500 conversations/month, basic chatbot, no AI |
| **Growth** | INR 2,499/month (~$30) | 5 agents, 5,000 conversations/month, AI agent, chatbot builder, CRM |
| **Pro** | INR 4,999/month (~$60) | 15 agents, 20,000 conversations/month, all features, priority support |
| **Enterprise** | Custom | Unlimited agents, custom limits, SLA, dedicated support |

**Note:** WhatsApp conversation charges (Meta's per-conversation fees) are passed through at cost. Platform pricing covers platform features only.

---

## 11. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Meta API policy changes | High | Medium | Abstraction layer isolates from provider; monitor Meta developer blog |
| AI hallucination in customer conversations | High | Medium | Confidence scoring + escalation; structured KB prioritized over free-form generation |
| WhatsApp BSP application rejected | Critical | Low | Apply early; have backup BSP partner identified |
| Redis capacity limits at scale | Medium | Low | Designed for Kafka migration; Redis handles 10K+ msg/sec which covers MVP |
| Competitor price war | Medium | High | Differentiate on intelligence (AI + smart routing) not just price |
| Data privacy compliance (India DPDPA) | High | Medium | Encrypt PII, audit logging, data retention policies, consent management |

---

## 12. Open Questions

1. **BSP vs Cloud API:** Apply as BSP (revenue share from Meta) or start with Cloud API direct (simpler, faster)?
2. **Self-hosted vs cloud-only:** Should MVP offer any self-hosted option, or cloud-only?
3. **Mobile app:** Is a mobile app needed for MVP (agents checking conversations on phone) or web-only?
4. **Multi-language AI:** Should AI agent support Hindi and regional languages in MVP, or English-only?
5. **WhatsApp Commerce (catalog/payments):** Include basic catalog sync in MVP or defer entirely?

---

*This PRD incorporates architectural decisions from the brainstorming session (2026-01-29) where the "intelligent multi-layer routing" design philosophy was established across API infrastructure and AI agent architecture.*
