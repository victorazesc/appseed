import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/logo";
import {
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudIcon,
  CloudUploadIcon,
  CpuIcon,
  GlobeIcon,
  LayersIcon,
  LineChartIcon,
  ArrowUpIcon,
  LinkIcon,
  ListCheckIcon,
  PenToolIcon,
  MailIcon,
  MapPinIcon,
  RocketIcon,
  PhoneIcon,
  SearchIcon,
  ServerIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  StarIcon,
  SendIcon,
  TestTubeIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "#services", label: "Serviços" },
  { href: "#process", label: "Processo" },
  { href: "#technologies", label: "Tecnologias" },
  { href: "#contact", label: "Contato" },
];

const heroStats = [
  {
    value: "50+",
    label: "MVPs lançados",
    icon: RocketIcon,
  },
  {
    value: "90%",
    label: "Taxa de sucesso",
    icon: CheckCircleIcon,
  },
  {
    value: "15 dias",
    label: "Tempo médio MVP",
    icon: ClockIcon,
  },
];

const heroHighlightBullets = [
  "Planejamento estratégico do discovery ao pós-lançamento",
  "Time dedicado e multidisciplinar para acelerar resultados",
  "Métricas claras, comunicação constante e foco no crescimento",
];

const projectTypes = [
  "MVP do zero",
  "Aplicação web completa",
  "Integrações e APIs",
  "Produto mobile ou PWA",
  "Evolução pós-lançamento",
];

const budgetRanges = [
  "R$ 15k - R$ 30k",
  "R$ 30k - R$ 60k",
  "R$ 60k - R$ 100k",
  "Acima de R$ 100k",
  "Ainda estamos avaliando",
];

const timelineOptions = [
  "Urgente (preciso em até 30 dias)",
  "Em até 3 meses",
  "Em 3-6 meses",
  "Ainda estamos planejando",
];

const contactDetails = [
  {
    label: "Email",
    value: "contato@appseed.com.br",
    icon: MailIcon,
  },
  {
    label: "Telefone",
    value: "+55 47 9 9671-8866",
    icon: PhoneIcon,
  },
  {
    label: "Localização",
    value: "São Paulo, Brasil",
    icon: MapPinIcon,
  },
];

const differentiators = [
  "Proposta personalizada em até 24h",
  "Metodologia ágil comprovada",
  "Equipe de especialistas dedicados",
  "Suporte pós-lançamento contínuo",
  "Orçamento transparente",
  "Entregas dentro do prazo",
];

const faqs = [
  {
    question: "Quanto custa desenvolver um MVP?",
    answer:
      "O investimento depende da complexidade, escopo e integrações necessárias. Depois do discovery inicial, entregamos uma proposta detalhada com estimativa de horas, equipe e cronograma.",
  },
  {
    question: "Quanto tempo leva para desenvolver um MVP?",
    answer:
      "Projetos começam com sprints intensivas de 2 a 4 semanas para discovery e protótipo. A entrega do MVP costuma acontecer entre 4 e 8 semanas, variando conforme as funcionalidades priorizadas.",
  },
  {
    question: "O que é sustentação de sistemas?",
    answer:
      "É o acompanhamento contínuo pós-lançamento, garantindo disponibilidade, monitoramento, correções rápidas e evolução de funcionalidades sem interromper o produto.",
  },
  {
    question: "Vocês atendem empresas de qualquer segmento?",
    answer:
      "Sim. Atuamos com startups, scale-ups e empresas estabelecidas em diversos setores. Adaptamos o discovery e a estratégia conforme o contexto do negócio.",
  },
  {
    question: "Meu projeto fica seguro com vocês?",
    answer:
      "Absolutamente. Assinamos NDAs quando necessário, seguimos boas práticas de segurança, usamos provedores de cloud confiáveis e mantemos backups automáticos ao longo do desenvolvimento.",
  },
  {
    question: "Preciso ter conhecimento técnico para contratar vocês?",
    answer:
      "Não. Guiamos todo o processo com linguagem acessível, traduzindo necessidades de negócio em requisitos técnicos e garantindo que você tenha visibilidade total das entregas.",
  },
];

const services = [
  {
    title: "Desenvolvimento MVP",
    description:
      "Criamos seu Produto Mínimo Viável em tempo recorde, validando sua ideia no mercado com funcionalidades essenciais.",
    icon: RocketIcon,
    items: [
      "Prototipagem rápida",
      "Validação com usuários reais",
      "Arquitetura escalável",
      "Entrega em 15-30 dias",
    ],
  },
  {
    title: "Crescimento Pós-MVP",
    description:
      "Evoluímos seu MVP com novas funcionalidades, otimizações e escalabilidade para sustentar o crescimento.",
    icon: TrendingUpIcon,
    items: [
      "Novas funcionalidades",
      "Otimização de performance",
      "Escalabilidade automática",
      "Analytics e métricas",
    ],
  },
  {
    title: "Aplicações Web Completas",
    description:
      "Desenvolvemos sistemas web robustos e personalizados para empresas que precisam de soluções sob medida.",
    icon: GlobeIcon,
    items: [
      "Frontend moderno",
      "Backend escalável",
      "Banco de dados otimizado",
      "APIs REST/GraphQL",
    ],
  },
  {
    title: "Progressive Web Apps",
    description:
      "PWAs que combinam a experiência de apps nativos com a acessibilidade da web, prontas para qualquer dispositivo.",
    icon: SmartphoneIcon,
    items: [
      "Experiência nativa",
      "Funciona offline",
      "Notificações push",
      "Instalação simplificada",
    ],
  },
  {
    title: "Integrações e APIs",
    description:
      "Conectamos seus sistemas existentes com novas soluções através de integrações seguras e flexíveis.",
    icon: LinkIcon,
    items: [
      "APIs personalizadas",
      "Integrações com terceiros",
      "Automação de processos",
      "Sincronização de dados",
    ],
  },
  {
    title: "Manutenção e Suporte",
    description:
      "Mantemos sua aplicação sempre atualizada, segura e funcionando com alta performance.",
    icon: ShieldCheckIcon,
    items: [
      "Monitoramento 24/7",
      "Atualizações contínuas",
      "Backup automático",
      "Suporte técnico dedicado",
    ],
  },
];

const processSteps = [
  {
    title: "Descoberta & Análise",
    description:
      "Entendemos profundamente seu negócio, público e objetivos para criar a solução ideal.",
    icon: SearchIcon,
    items: [
      "Análise de mercado e concorrência",
      "Definição de personas e jornadas",
      "Mapeamento de funcionalidades",
      "Estratégia de produto e roadmap",
    ],
  },
  {
    title: "Prototipagem & Design",
    description:
      "Criamos protótipos interativos e um design system que guiam todo o desenvolvimento.",
    icon: PenToolIcon,
    items: [
      "Wireframes e fluxos",
      "Design system personalizado",
      "Protótipo interativo",
      "Validação com usuários",
    ],
  },
  {
    title: "Desenvolvimento Ágil",
    description:
      "Transformamos seu MVP com entregas semanais, mantendo total transparência do progresso.",
    icon: BoltIcon,
    items: [
      "Metodologia ágil",
      "Entregas incrementais",
      "Testes automatizados",
      "Código revisado continuamente",
    ],
  },
  {
    title: "Testes & Validação",
    description:
      "Garantimos qualidade, performance e segurança antes de cada lançamento.",
    icon: TestTubeIcon,
    items: [
      "Testes funcionais",
      "Testes de performance",
      "Testes de usabilidade",
      "Testes de segurança",
    ],
  },
  {
    title: "Lançamento & Deploy",
    description:
      "Colocamos sua aplicação no ar com infraestrutura robusta e monitoramento contínuo.",
    icon: CloudUploadIcon,
    items: [
      "Deploy automatizado",
      "Configuração de infraestrutura",
      "Monitoramento em tempo real",
      "Backup e recuperação",
    ],
  },
  {
    title: "Crescimento & Evolução",
    description:
      "Acompanhamos métricas e evoluímos sua aplicação com novas releases baseadas em dados.",
    icon: LineChartIcon,
    items: [
      "Análises e métricas",
      "Novas funcionalidades",
      "Otimização de performance",
      "Suporte consultivo",
    ],
  },
];

const technologyGroups = [
  {
    title: "Frontend",
    icon: CpuIcon,
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "Angular"],
  },
  {
    title: "Backend",
    icon: ServerIcon,
    stack: ["Node.js", "Python", "PostgreSQL", "MongoDB", "Edge Functions", "REST/GraphQL"],
  },
  {
    title: "Cloud & DevOps",
    icon: CloudIcon,
    stack: ["AWS", "Google Cloud", "Docker", "Kubernetes", "Vercel", "Netlify"],
  },
  {
    title: "Mobile & PWA",
    icon: SmartphoneIcon,
    stack: ["React Native", "Expo", "Ionic", "Flutter", "PWA", "WebRTC"],
  },
];

const capabilities = [
  {
    title: "Desenvolvimento Full-Stack",
    icon: UsersIcon,
    description: "Equipe completa para frontend e backend",
  },
  {
    title: "Arquitetura Escalável",
    icon: LayersIcon,
    description: "Soluções que crescem com seu negócio",
  },
  {
    title: "Metodologia Ágil",
    icon: BoltIcon,
    description: "Entregas rápidas com qualidade garantida",
  },
  {
    title: "Suporte Contínuo",
    icon: ShieldCheckIcon,
    description: "Acompanhamento pós-lançamento",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="#" className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full">
              <Logo className="h-8" />
            </span>
            <span className="text-lg">AppSeed</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex">
            <Button asChild>
              <Link href="#contact">Começar Projeto</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pb-24 pt-16 sm:px-6 lg:gap-32 lg:pb-32">
        <section
          id="hero"
          className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start"
        >
          <div className="space-y-10">
            <Badge className="w-fit gap-2 rounded-full bg-emerald-100/80 px-5 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
              <SparklesIcon className="h-4 w-4 text-emerald-500" />
              Especialistas em MVPs e Crescimento Pós-Lançamento
            </Badge>
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
                Desenvolvemos <span className="text-emerald-500">aplicativos web</span> que fazem sua empresa
                {" "}
                <span className="text-emerald-500">crescer</span>
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
                Do MVP ao crescimento sustentável. Criamos soluções web sob medida que se adaptam aos objetivos da sua
                empresa, usando tecnologias modernas e metodologias ágeis.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="#contact">
                  Começar Meu MVP
                  <span aria-hidden className="ml-2 text-xl">→</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="#services">Ver Nossos Serviços</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <IconBubble className="h-9 w-9 rounded-2xl bg-emerald-100 text-emerald-600">
                      <stat.icon className="h-4 w-4" />
                    </IconBubble>
                    {stat.label}
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
          <aside className="rounded-[32px] border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/80 p-8 text-emerald-800 shadow-[0_30px_80px_-40px_rgba(16,185,129,0.65)] lg:sticky lg:top-32">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              <IconBubble className="h-9 w-9 rounded-2xl bg-white/90 text-emerald-500 shadow">
                <StarIcon className="h-5 w-5" />
              </IconBubble>
              Resultados comprovados
            </div>
            <h2 className="mt-6 text-2xl font-semibold leading-tight text-emerald-900">
              Parceiro estratégico para o seu próximo lançamento digital
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-emerald-700">
              Planejamos, desenvolvemos e acompanhamos seu produto com uma equipe especialista em MVPs e produtos
              digitais de alto impacto.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-emerald-700">
              {heroHighlightBullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs uppercase tracking-[0.26em] text-emerald-600/80">
              Processos claros · Comunicação constante · Foco em métricas
            </p>
          </aside>
        </section>

        <section id="services" className="space-y-12">
          <header className="text-center">
            <Badge className="mx-auto bg-emerald-50/80 text-emerald-700">
              Serviços que impulsionam seu crescimento
            </Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Soluções completas que fazem sua empresa crescer
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              Oferecemos serviços end-to-end para levar sua ideia do conceito à escala,
              com tecnologia moderna e um time focado em resultados.
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title} className="h-full">
                <CardHeader>
                  <IconBubble>
                    <service.icon className="h-5 w-5 text-emerald-500" />
                  </IconBubble>
                  <div className="space-y-1">
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {service.items.map((item) => (
                      <BulletItem key={item}>{item}</BulletItem>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="#contact">Falar com Especialista</Link>
            </Button>
          </div>
        </section>

        <section id="process" className="space-y-12">
          <header className="text-center">
            <Badge className="mx-auto bg-emerald-50/80 text-emerald-700">
              Como transformamos sua ideia em realidade
            </Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Uma metodologia ágil para entregar resultados rápidos
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              Nossa metodologia comprovada garante entregas rápidas sem abrir mão da
              qualidade, acompanhando sua equipe durante todas as etapas do projeto.
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-2">
            {processSteps.map((step, index) => (
              <Card key={step.title} className="h-full">
                <CardHeader className="items-start">
                  <div className="flex items-start gap-4">
                    <div className="text-emerald-500">
                      <span className="text-3xl font-semibold">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IconBubble>
                          <step.icon className="h-5 w-5 text-emerald-500" />
                        </IconBubble>
                        <CardTitle className="text-2xl">{step.title}</CardTitle>
                      </div>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {step.items.map((item) => (
                      <BulletItem key={item}>{item}</BulletItem>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Badge className="bg-white text-sm text-emerald-600 shadow-sm ring-1 ring-inset ring-emerald-200">
              Processo completo: 2-8 semanas dependendo da complexidade
            </Badge>
          </div>
        </section>

        <section id="technologies" className="space-y-12">
          <header className="text-center">
            <Badge className="mx-auto bg-emerald-50/80 text-emerald-700">
              Tecnologias de ponta para seu projeto
            </Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Ferramentas modernas para construir aplicações seguras e escaláveis
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              Selecionamos tecnologias líderes de mercado para garantir qualidade,
              performance e escalabilidade, sempre alinhadas aos objetivos do seu negócio.
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-2">
            {technologyGroups.map((group) => (
              <Card key={group.title} className="h-full">
                <CardHeader className="flex-row items-center gap-4">
                  <IconBubble>
                    <group.icon className="h-5 w-5 text-emerald-500" />
                  </IconBubble>
                  <CardTitle>{group.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {group.stack.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"
              >
                <IconBubble>
                  <capability.icon className="h-5 w-5 text-emerald-500" />
                </IconBubble>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {capability.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {capability.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="space-y-10 rounded-[40px] bg-slate-800 px-6 py-16 text-slate-100 shadow-[0_80px_120px_-60px_rgba(15,23,42,0.7)] sm:px-10 lg:px-16">
          <header className="space-y-3 text-center">
            <Badge className="mx-auto bg-slate-700 text-slate-100">Perguntas Frequentes</Badge>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Esclarecemos as principais dúvidas sobre nossos serviços e processo
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-300">
              Cada projeto é único. Caso não encontre a resposta que procura, fale com nosso time e teremos prazer em compartilhar mais detalhes.
            </p>
          </header>
          <Accordion>
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                title={faq.question}
                defaultOpen={index === 0}
              >
                <p>{faq.answer}</p>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section id="contact" className="space-y-12">
          <header className="text-center">
            <Badge className="mx-auto bg-emerald-100 text-emerald-700">
              Atendimento especializado em produtos digitais
            </Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Vamos conversar sobre <span className="text-emerald-500">seu próximo projeto</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              Entre em contato conosco e receba uma proposta personalizada em até 24 horas. Vamos entender sua ideia,
              mapear objetivos e propor o caminho ideal para lançar ou evoluir seu produto.
            </p>
          </header>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_1fr]">
            <Card className="h-full space-y-6 bg-white p-8 shadow-lg sm:p-10">
              <div className="flex items-center gap-3">
                <IconBubble className="h-11 w-11 rounded-2xl bg-emerald-500 text-white shadow">
                  <SendIcon className="h-5 w-5" />
                </IconBubble>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Fale com nossos especialistas
                  </h3>
                  <p className="text-sm text-slate-500">
                    Preencha o formulário e retornaremos em até 24 horas úteis.
                  </p>
                </div>
              </div>
              <ContactForm
                projectTypes={projectTypes}
                budgetRanges={budgetRanges}
                timelineOptions={timelineOptions}
              />
            </Card>
            <div className="space-y-6">
              <Card className="space-y-6 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <IconBubble className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-600">
                    <ListCheckIcon className="h-5 w-5" />
                  </IconBubble>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Informações de Contato</h3>
                    <p className="text-sm text-slate-500">Escolha o canal que preferir para falar com a gente.</p>
                  </div>
                </div>
                <ul className="space-y-4 text-sm">
                  {contactDetails.map((detail) => (
                    <li key={detail.label} className="flex items-start gap-3 text-slate-600">
                      <IconBubble className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600">
                        <detail.icon className="h-4 w-4" />
                      </IconBubble>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{detail.label}</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">{detail.value}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="space-y-5 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <IconBubble className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-600">
                    <CheckCircleIcon className="h-5 w-5" />
                  </IconBubble>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Por que escolher a AppSeed?</h3>
                    <p className="text-sm text-slate-500">Resultados consistentes do MVP ao crescimento.</p>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  {differentiators.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-slate-800 bg-slate-900 text-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-14 sm:px-6 lg:flex-row lg:gap-16">
          <div className="flex-1 space-y-6">
            <Link href="#hero" className="flex items-center gap-3 text-slate-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Logo className="h-5" />
              </span>
              <span className="text-xl font-semibold">AppSeed</span>
            </Link>
            <p className="max-w-sm text-sm text-slate-400">
              Desenvolvemos aplicações web que fazem sua empresa crescer. Do MVP ao crescimento sustentável, criamos soluções que se adaptam às necessidades do seu negócio.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <IconBubble className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <MailIcon className="h-4 w-4" />
                </IconBubble>
                contato@appseed.com.br
              </li>
              <li className="flex items-center gap-3">
                <IconBubble className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <PhoneIcon className="h-4 w-4" />
                </IconBubble>
                +55 47 9 9671-8866
              </li>
              <li className="flex items-center gap-3">
                <IconBubble className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <MapPinIcon className="h-4 w-4" />
                </IconBubble>
                São Paulo, Brasil
              </li>
            </ul>
          </div>
          <div className="grid flex-1 gap-10 sm:grid-cols-2 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Links rápidos
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link className="transition-colors hover:text-emerald-400" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Legal & redes
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <Link className="transition-colors hover:text-emerald-400" href="#">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link className="transition-colors hover:text-emerald-400" href="#">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link className="transition-colors hover:text-emerald-400" href="#">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
              <div className="flex items-center gap-3 pt-2 text-slate-500">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-800/60 text-emerald-400">
                  in
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-800/60 text-emerald-400">
                  ig
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-800/60 text-emerald-400">
                  <Logo className="h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>© {new Date().getFullYear()} AppSeed. Todos os direitos reservados.</span>
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700/80 bg-slate-800/80 text-slate-200 hover:border-emerald-500/60 hover:bg-slate-800 sm:w-auto"
            >
              <Link href="#hero" className="flex items-center gap-2">
                <ArrowUpIcon className="h-4 w-4" />
                Voltar ao topo
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function IconBubble({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50",
        className,
      )}
    >
      {children}
    </span>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  );
}
