import { addHours, addDays } from "date-fns";
import { ActivityType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.pipeline.deleteMany();

  const pipeline = await prisma.pipeline.create({
    data: {
      name: "Default",
      stages: {
        create: [
          { name: "Lead Novo", position: 0 },
          { name: "Contato Inicial", position: 1 },
          { name: "Proposta Enviada", position: 2 },
          { name: "Fechamento", position: 3 },
          { name: "Ganho", position: 4 },
          { name: "Perda", position: 5 },
        ],
      },
    },
    include: { stages: true },
  });

  const stageByName = Object.fromEntries(
    pipeline.stages.map((stage) => [stage.name, stage])
  );

  const leads: Array<{
    name: string;
    email: string;
    phone: string;
    company: string;
    valueCents: number;
    ownerId: string;
    stageName: string;
    activities: Array<{
      type: ActivityType;
      content: string;
      dueAt?: Date;
      createdBy?: string;
    }>;
  }> = [
    {
      name: "Ana Costa",
      email: "ana.costa@example.com",
      phone: "+55 11 91234-5678",
      company: "Costa Tech",
      valueCents: 500000,
      ownerId: "user_ana",
      stageName: "Lead Novo",
      activities: [
        {
          type: ActivityType.note,
          content: "Lead importado do landing page com interesse em demonstração.",
        },
        {
          type: ActivityType.task,
          content: "Agendar ligação de discovery com Ana.",
          dueAt: addHours(new Date(), 2),
          createdBy: "user_ana",
        },
      ],
    },
    {
      name: "Bruno Lima",
      email: "bruno.lima@example.com",
      phone: "+55 21 99876-5432",
      company: "Lima Finance",
      valueCents: 1200000,
      ownerId: "user_bruno",
      stageName: "Contato Inicial",
      activities: [
        {
          type: ActivityType.call,
          content: "Contato inicial realizado, aguardando envio de materiais.",
          createdBy: "user_bruno",
        },
        {
          type: ActivityType.task,
          content: "Enviar proposta preliminar para Bruno.",
          dueAt: addDays(new Date(), 1),
          createdBy: "user_bruno",
        },
      ],
    },
    {
      name: "Carla Mendes",
      email: "carla.mendes@example.com",
      phone: "+55 31 98765-4321",
      company: "Mendes Retail",
      valueCents: 200000,
      ownerId: "user_carla",
      stageName: "Lead Novo",
      activities: [
        {
          type: ActivityType.note,
          content: "Lead cadastrou-se solicitando apresentação via e-mail.",
        },
        {
          type: ActivityType.email,
          content: "Email de apresentação enviado com case relevante.",
          createdBy: "user_carla",
        },
      ],
    },
    {
      name: "Daniel Souza",
      email: "daniel.souza@example.com",
      phone: "+55 41 93456-7890",
      company: "Souza Logistics",
      valueCents: 900000,
      ownerId: "user_daniel",
      stageName: "Proposta Enviada",
      activities: [
        {
          type: ActivityType.email,
          content: "Proposta enviada com follow-up agendado.",
          createdBy: "user_daniel",
        },
        {
          type: ActivityType.task,
          content: "Realizar follow-up pós envio da proposta.",
          dueAt: addDays(new Date(), 2),
          createdBy: "user_daniel",
        },
      ],
    },
    {
      name: "Eduarda Farias",
      email: "eduarda.farias@example.com",
      phone: "+55 51 97654-3210",
      company: "Farias Ventures",
      valueCents: 2000000,
      ownerId: "user_eduarda",
      stageName: "Ganho",
      activities: [
        {
          type: ActivityType.note,
          content: "Contrato enviado para assinatura digital.",
          createdBy: "user_eduarda",
        },
        {
          type: ActivityType.whatsapp,
          content: "Mensagem enviada confirmando recebimento do contrato.",
          createdBy: "user_eduarda",
        },
      ],
    },
    {
      name: "Felipe Tavares",
      email: "felipe.tavares@example.com",
      phone: "+55 71 96543-2109",
      company: "Tavares Logistics",
      valueCents: 350000,
      ownerId: "user_felipe",
      stageName: "Perda",
      activities: [
        {
          type: ActivityType.note,
          content: "Cliente informou que seguirá com outro fornecedor neste trimestre.",
          createdBy: "user_felipe",
        },
        {
          type: ActivityType.task,
          content: "Agendar follow-up em 90 dias para reavaliar necessidades.",
          dueAt: addDays(new Date(), 90),
          createdBy: "user_felipe",
        },
      ],
    },
  ];

  for (const lead of leads) {
    const stage = stageByName[lead.stageName];
    if (!stage) continue;

    await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        valueCents: lead.valueCents,
        ownerId: lead.ownerId,
        pipelineId: pipeline.id,
        stageId: stage.id,
        activities: {
          create: lead.activities.map((activity) => ({
            type: activity.type,
            content: activity.content,
            dueAt: activity.dueAt,
            createdBy: activity.createdBy,
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
