import { PrismaClient, UserRole, UserAvailability, ConversationStatus, MessageDirection, AssignmentStrategy } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.workflowLog.deleteMany();
  await prisma.chatbotWorkflow.deleteMany();
  await prisma.conversationNote.deleteMany();
  await prisma.customLeadStatus.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.assignmentRule.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Corp',
    },
  });

  // Create users
  const owner = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'owner@acme.com',
      name: 'Alice Owner',
      passwordHash,
      role: UserRole.OWNER,
      availability: UserAvailability.ONLINE,
    },
  });

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@acme.com',
      name: 'Bob Admin',
      passwordHash,
      role: UserRole.ADMIN,
      availability: UserAvailability.ONLINE,
    },
  });

  const agents = await Promise.all(
    [
      { email: 'agent1@acme.com', name: 'Charlie Agent' },
      { email: 'agent2@acme.com', name: 'Diana Agent' },
      { email: 'agent3@acme.com', name: 'Eve Agent' },
    ].map((a) =>
      prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: a.email,
          name: a.name,
          passwordHash,
          role: UserRole.AGENT,
          availability: UserAvailability.ONLINE,
        },
      }),
    ),
  );

  // Seed custom lead statuses
  const leadStatusData = [
    { name: 'New lead', color: '#3b82f6' },
    { name: 'DNP', color: '#f59e0b' },
    { name: 'DNP1', color: '#f97316' },
    { name: 'Connected', color: '#6366f1' },
    { name: 'Follow up', color: '#eab308' },
    { name: 'February', color: '#ec4899' },
    { name: 'Whatsapp Connect', color: '#22c55e' },
    { name: 'No response', color: '#6b7280' },
    { name: 'Not Interested', color: '#ef4444' },
    { name: 'Negotiation', color: '#8b5cf6' },
    { name: 'Confirmed', color: '#10b981' },
    { name: 'QR Shared', color: '#06b6d4' },
  ];

  for (let i = 0; i < leadStatusData.length; i++) {
    await prisma.customLeadStatus.create({
      data: {
        tenantId: tenant.id,
        name: leadStatusData[i].name,
        color: leadStatusData[i].color,
        sortOrder: i,
      },
    });
  }

  // Create teams
  const supportTeam = await prisma.team.create({
    data: {
      tenantId: tenant.id,
      name: 'Support Team',
    },
  });

  const salesTeam = await prisma.team.create({
    data: {
      tenantId: tenant.id,
      name: 'Sales Team',
    },
  });

  // Add members to teams
  await prisma.teamMember.createMany({
    data: [
      { teamId: supportTeam.id, userId: agents[0].id },
      { teamId: supportTeam.id, userId: agents[1].id },
      { teamId: salesTeam.id, userId: agents[1].id },
      { teamId: salesTeam.id, userId: agents[2].id },
    ],
  });

  // Create contacts
  const contacts = await Promise.all(
    [
      { phone: '+1234567001', name: 'John Customer', tags: ['vip'] },
      { phone: '+1234567002', name: 'Jane Prospect', tags: ['new'] },
      { phone: '+1234567003', name: 'Mike Buyer', tags: ['vip', 'returning'] },
      { phone: '+1234567004', name: 'Sarah Lead', tags: ['new'] },
      { phone: '+1234567005', name: 'Tom Inquirer', tags: [] },
      { phone: '+1234567006', name: 'Lisa Support', tags: ['support'] },
      { phone: '+1234567007', name: 'David VIP', tags: ['vip'] },
      { phone: '+1234567008', name: 'Emma Feedback', tags: [] },
      { phone: '+1234567009', name: 'Chris Query', tags: ['new'] },
      { phone: '+1234567010', name: 'Olivia Return', tags: ['returning'] },
    ].map((c) =>
      prisma.contact.create({
        data: {
          tenantId: tenant.id,
          phone: c.phone,
          name: c.name,
          tags: c.tags,
        },
      }),
    ),
  );

  // Create conversations with messages and lead statuses (now strings)
  const conversationData = [
    { contactIdx: 0, agentId: agents[0].id, status: ConversationStatus.OPEN, leadStatus: 'Connected' },
    { contactIdx: 1, agentId: agents[1].id, status: ConversationStatus.OPEN, leadStatus: 'New lead' },
    { contactIdx: 2, agentId: agents[0].id, status: ConversationStatus.PENDING, leadStatus: 'Follow up' },
    { contactIdx: 3, agentId: null, status: ConversationStatus.OPEN, leadStatus: 'New lead' },
    { contactIdx: 4, agentId: agents[2].id, status: ConversationStatus.RESOLVED, leadStatus: 'Confirmed' },
    { contactIdx: 5, agentId: agents[1].id, status: ConversationStatus.OPEN, leadStatus: 'DNP' },
    { contactIdx: 6, agentId: agents[0].id, status: ConversationStatus.OPEN, leadStatus: 'Negotiation' },
    { contactIdx: 7, agentId: agents[2].id, status: ConversationStatus.OPEN, leadStatus: 'Not Interested' },
    { contactIdx: 8, agentId: agents[1].id, status: ConversationStatus.OPEN, leadStatus: 'New lead' },
    { contactIdx: 9, agentId: agents[2].id, status: ConversationStatus.PENDING, leadStatus: 'Follow up' },
  ];

  const createdConvos: { id: string; agentId: string | null; leadStatus: string }[] = [];

  for (const cd of conversationData) {
    const convo = await prisma.conversation.create({
      data: {
        tenantId: tenant.id,
        contactId: contacts[cd.contactIdx].id,
        assignedAgentId: cd.agentId,
        status: cd.status,
        leadStatus: cd.leadStatus,
        lastMessageAt: new Date(),
      },
    });

    createdConvos.push({ id: convo.id, agentId: cd.agentId, leadStatus: cd.leadStatus });

    // Add messages to each conversation
    const messages = [
      { direction: MessageDirection.INBOUND, body: `Hi, I need help with my order.`, senderId: null },
      { direction: MessageDirection.OUTBOUND, body: `Hello! I'd be happy to help. What's your order number?`, senderId: cd.agentId },
      { direction: MessageDirection.INBOUND, body: `It's ORDER-${1000 + cd.contactIdx}`, senderId: null },
    ];

    for (let i = 0; i < messages.length; i++) {
      await prisma.message.create({
        data: {
          tenantId: tenant.id,
          conversationId: convo.id,
          direction: messages[i].direction,
          body: messages[i].body,
          senderId: messages[i].senderId,
          createdAt: new Date(Date.now() - (messages.length - i) * 60000),
        },
      });
    }
  }

  // Add sample call logs
  const callLogData = [
    { convoIdx: 0, outcome: 'Interested', notes: 'Customer showed interest in premium plan. Wants a follow-up next week.' },
    { convoIdx: 0, outcome: 'Callback Scheduled', notes: 'Scheduled callback for Tuesday 3 PM.' },
    { convoIdx: 2, outcome: 'No Answer', notes: 'Called but no answer. Will try again tomorrow.' },
    { convoIdx: 2, outcome: 'Busy', notes: 'Customer was busy, asked to call back later.' },
    { convoIdx: 4, outcome: 'Interested', notes: 'Customer agreed to purchase. Processing order.' },
    { convoIdx: 5, outcome: 'No Answer', notes: 'First attempt, no answer.' },
    { convoIdx: 6, outcome: 'Callback Scheduled', notes: 'Customer requested callback on Friday.' },
    { convoIdx: 7, outcome: 'Not Interested', notes: 'Customer not interested at this time.' },
    { convoIdx: 9, outcome: 'Busy', notes: 'Will follow up next week.' },
  ];

  for (let i = 0; i < callLogData.length; i++) {
    const cl = callLogData[i];
    const convo = createdConvos[cl.convoIdx];
    if (convo.agentId) {
      await prisma.callLog.create({
        data: {
          tenantId: tenant.id,
          conversationId: convo.id,
          userId: convo.agentId,
          outcome: cl.outcome,
          notes: cl.notes,
          duration: Math.floor(Math.random() * 300) + 30,
          createdAt: new Date(Date.now() - (callLogData.length - i) * 3600000),
        },
      });
    }
  }

  // Add sample conversation notes
  for (let i = 0; i < 3; i++) {
    const convo = createdConvos[i];
    if (convo.agentId) {
      await prisma.conversationNote.create({
        data: {
          tenantId: tenant.id,
          conversationId: convo.id,
          userId: convo.agentId,
          content: `Initial contact note for this lead. Status: ${convo.leadStatus}.`,
        },
      });
    }
  }

  // Create assignment rules
  await prisma.assignmentRule.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'VIP to Support Team',
        priority: 10,
        strategy: AssignmentStrategy.ROUND_ROBIN,
        isActive: true,
        conditions: JSON.parse('{"tags":["vip"]}'),
        teamId: supportTeam.id,
      },
      {
        tenantId: tenant.id,
        name: 'Default Round Robin',
        priority: 0,
        strategy: AssignmentStrategy.ROUND_ROBIN,
        isActive: true,
        conditions: JSON.parse('{}'),
        teamId: null,
      },
    ],
  });

  console.log('Seed complete!');
  console.log(`Tenant: ${tenant.name} (${tenant.id})`);
  console.log(`Users: owner@acme.com, admin@acme.com, agent1-3@acme.com (password: password123)`);
  console.log(`Custom Lead Statuses: ${leadStatusData.map(s => s.name).join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
