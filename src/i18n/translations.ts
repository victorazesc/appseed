export type Language = "pt" | "en" | "es";

export type ThemeOption = "light" | "dark";

export const languageToLocale: Record<Language, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

type CrmTranslations = {
  sidebar: {
    productName: string;
  };
  buttons: {
    newLead: string;
    createLead: string;
    creatingLead: string;
    save: string;
    saving: string;
    cancel: string;
    addActivity: string;
    sendEmail: string;
    markDone: string;
    applyFilters: string;
    applyingFilters: string;
    clearFilters: string;
  };
  statuses: {
    attention: string;
    overdue: string;
    dueSoon: string;
    dueOn: string;
    inProgress: string;
    noTasks: string;
    noStage: string;
    none: string;
  };
  placeholders: {
    searchLeads: string;
    searchClients: string;
    leadName: string;
    leadEmail: string;
    leadPhone: string;
    leadCompany: string;
    leadValue: string;
    owner: string;
    notes: string;
    activityContent: string;
  };
  pipelineSwitcher: {
    title: string;
    create: string;
    edit: string;
    manage: string;
    empty: string;
    active: string;
    loading: string;
  };
  pipelineModal: {
    title: string;
    editTitle?: string;
    description?: string;
    editDescription?: string;
    nameLabel: string;
    namePlaceholder?: string;
    colorLabel: string;
    stagesLabel: string;
    stagesHelper: string;
    addStage: string;
    stagePlaceholder: string;
    deleteStage: string;
    create: string;
    save: string;
    cancel: string;
    nameRequired: string;
    stageNameRequired: string;
    created?: string;
    saved?: string;
    error?: string;
    tabs: {
      details: string;
      webhook: string;
    };
    stageRules: {
      title: string;
      subtitle: string;
      stageName: string;
      triggerLabel: string;
      triggerDescription: string;
      modeLabel: string;
      manual: string;
      auto: string;
      targetPipeline: string;
      targetStage: string;
      selectPipeline: string;
      selectStage: string;
      copyActivities: string;
      archiveSource: string;
      moveUp: string;
      moveDown: string;
      remove: string;
    };
    webhook: {
      disabled: string;
      endpointTitle: string;
      idLabel: string;
      slugLabel: string;
      methodHint: string;
      tokenLabel: string;
      tokenHelper: string;
      copy: string;
      rotate: string;
      rotateConfirm: string;
      rotateSuccess: string;
      rotateError: string;
      copied: string;
      tokenCopied: string;
      copyError: string;
      defaultStageLabel: string;
      defaultStageFallback: string;
      stageUpdated: string;
      stageError: string;
      exampleTitle: string;
      exampleSubtitle: string;
      testButton: string;
      error: string;
      test: {
        title: string;
        description: string;
        payloadLabel: string;
        payloadHelper: string;
        invalidJson: string;
        missingToken: string;
        error: string;
        statusLabel: string;
        cancel: string;
        submit: string;
        submitting: string;
      };
    };
  };
  leadTransition: {
    title: string;
    description: string;
    pipelineLabel: string;
    stageLabel: string;
    copyActivities: string;
    archiveOriginal: string;
    submit: string;
    submitting: string;
    success: string;
    duplicate: string;
    error: string;
    open: string;
    trigger: string;
    empty: string;
    cancel: string;
  };
  settings: {
    tabs: {
      pipelines: string;
      users: string;
      preferences: string;
    };
    pipelines: {
      title: string;
      subtitle: string;
      empty: string;
      deleted: string;
      deleteConfirm: string;
    };
    members: {
      title: string;
      subtitle: string;
    };
    preferences: {
      title: string;
      subtitle: string;
      workspace: {
        title: string;
        subtitle: string;
        nameLabel: string;
        namePlaceholder: string;
        nameDescription: string;
        colorLabel: string;
        colorDescription: string;
        save: string;
        saving: string;
        updatedToast: string;
        noChangesToast: string;
        invalidWorkspace: string;
        permissionWarning: string;
        validation: {
          nameRequired: string;
        };
      };
      account: {
        title: string;
        subtitle: string;
        name: string;
        email: string;
        login: string;
        loginSocial: string;
        loginCredentials: string;
        lastLogin: string;
        providers: string;
        noProviders: string;
        empty: string;
        error: string;
      };
      experience: {
        title: string;
        subtitle: string;
        themeLabel: string;
        themeDescription: string;
        themeUpdatedDark: string;
        themeUpdatedLight: string;
        languageLabel: string;
        languageDescription: string;
        languageUpdated: string;
      };
    };
  };
  dashboard: {
    title: string;
    subtitle: string;
    ownerFilterAll: string;
    stats: {
      leads: string;
      stages: string;
    };
    emptyPipelines: {
      title: string;
      description: string;
      cta: string;
    };
    emptyStages: {
      title: string;
      description: string;
      cta: string;
    };
    emptyLeads: string;
  };
  stageColumn: {
    leadCount: string;
    dropHere: string;
    totalValue: string;
    ruleManual: string;
    ruleAuto: string;
  };
  leadCard: {
    createdAt: string;
    activities: string;
    attention: string;
    addActivity: string;
  };
  clients: {
    title: string;
    subtitle: string;
    summary: {
      total: string;
      value: string;
      overdue: string;
      results: string;
      gain: string;
      loss: string;
    };
    empty: string;
    table: {
      customer: string;
      company: string;
      stage: string;
      value: string;
      status: string;
      owner: string;
      createdAt: string;
      actions: string;
      details: string;
      noStage: string;
      noEmail: string;
      noOwner: string;
    };
    statuses: {
      overdue: string;
      inProgress: string;
      noTasks: string;
    };
  };
  metrics: {
    title: string;
    filters: {
      from: string;
      to: string;
      apply: string;
      applying: string;
      clear: string;
    };
    cards: {
      leadsPerStage: string;
      conversion: string;
      conversionHint: string;
      timeInPipeline: string;
      timeHint: string;
      timeUnit: string;
    };
    chart: {
      distribution: string;
    };
    table: {
      title: string;
      stage: string;
      total: string;
      value: string;
    };
    empty: string;
  };
  leadDetail: {
    badges: {
      overdue: string;
      dueSoon: string;
    };
    form: {
      name: string;
      email: string;
      phone: string;
      company: string;
      value: string;
      owner: string;
      moveStage: string;
      quickNote: string;
    };
    summaryTitle: string;
    pipelineTitle: string;
    pipelineDescription: string;
    metrics: {
      stage: string;
      value: string;
      createdAt: string;
      owner: string;
      overdueTasks: string;
      nextTask: string;
    };
    timeline: {
      title: string;
      empty: string;
    };
    buttons: {
      sendEmail: string;
      addActivity: string;
      save: string;
      saving: string;
      cancel: string;
    };
    stageListTitle: string;
  };
  dialogs: {
    newLead: {
      title: string;
      fields: {
        name: string;
        email: string;
        phone: string;
        company: string;
        value: string;
        owner: string;
        notes: string;
        stage: string;
      };
      placeholders: {
        name: string;
        email: string;
        phone: string;
        company: string;
        value: string;
        owner: string;
        notes: string;
      };
      validation: {
        nameRequired: string;
        emailInvalid: string;
      };
      submit: string;
      submitting: string;
      cancel: string;
    };
    activity: {
      title: string;
      titleWithLead: string;
      fields: {
        type: string;
        content: string;
        dueAt: string;
      };
      types: {
        note: string;
        call: string;
        email: string;
        whatsapp: string;
        task: string;
      };
      placeholders: {
        content: string;
      };
      validation: {
        contentRequired: string;
      };
      submit: string;
      submitting: string;
      cancel: string;
    };
  };
  toasts: {
    leadCreated: string;
    activityLogged: string;
    leadUpdated: string;
    taskCompleted: string;
  };
};

export const translations: Record<Language, {
  common: {
    languageLabel: string;
    languages: Record<Language, string>;
    themeToggle: {
      light: string;
      dark: string;
      ariaLabel: string;
    };
    actions: {
      startProject: string;
      startMvp: string;
      viewServices: string;
      talkToSpecialist: string;
      backToTop: string;
      signIn: string;
    };
    contactForm: {
      labels: {
        name: string;
        email: string;
        company: string;
        phone: string;
        projectType: string;
        budget: string;
        timeline: string;
        message: string;
      };
      placeholders: {
        name: string;
        email: string;
        company: string;
        phone: string;
        message: string;
      };
      selects: {
        projectType: string;
        budget: string;
        timeline: string;
      };
      feedback: {
        success: string;
        error: string;
      };
      buttons: {
        submit: string;
        submitting: string;
      };
    };
  };
  appShell: {
    defaultTitle: string;
    navLinks: {
      funnel: string;
      clients: string;
      metrics: string;
    };
    signInCta: string;
  };
  home: {
    navigation: Array<{ href: string; label: string }>;
    hero: {
      badge: string;
      title: {
        prefix: string;
        highlightOne: string;
        middle: string;
        highlightTwo: string;
      };
      description: string;
      stats: Array<{ value: string; label: string }>;
      ctaPrimary: string;
      ctaSecondary: string;
      highlight: {
        title: string;
        subtitle: string;
        bullets: string[];
        footnote: string;
      };
    };
    services: {
      badge: string;
      title: string;
      description: string;
      cards: Array<{ title: string; description: string; items: string[] }>;
      cta: string;
    };
    process: {
      badge: string;
      title: string;
      description: string;
      timeline: Array<{ number: string; title: string; description: string }>;
      steps: Array<{ title: string; description: string; items: string[] }>;
      timelineBadge: string;
    };
    technologies: {
      badge: string;
      title: string;
      description: string;
      groups: Array<{ title: string; stack: string[] }>;
    };
    capabilities: Array<{ title: string; description: string }>;
    faq: {
      badge: string;
      title: string;
      description: string;
      items: Array<{ question: string; answer: string }>;
    };
    contact: {
      badge: string;
      title: {
        prefix: string;
        highlight: string;
      };
      description: string;
      formCard: {
        title: string;
        subtitle: string;
      };
      contactCard: {
        title: string;
        subtitle: string;
      };
      contactDetails: Array<{ label: string; value: string }>;
      differentiatorsCard: {
        title: string;
        subtitle: string;
        items: string[];
      };
      formOptions: {
        projectTypes: string[];
        budgetRanges: string[];
        timelineOptions: string[];
      };
    };
    footer: {
      description: string;
      quickLinksTitle: string;
      legalTitle: string;
      legalLinks: Array<{ label: string; href: string }>;
      copy: string;
    };
  };
  crm: CrmTranslations;
}> = {
  pt: {
    common: {
      languageLabel: "Idioma",
      languages: {
        pt: "Português",
        en: "Inglês",
        es: "Espanhol",
      },
      themeToggle: {
        light: "Modo claro",
        dark: "Modo escuro",
        ariaLabel: "Alternar tema",
      },
      actions: {
        startProject: "Começar Projeto",
        startMvp: "Começar Meu MVP",
        viewServices: "Ver Nossos Serviços",
        talkToSpecialist: "Falar com Especialista",
        backToTop: "Voltar ao topo",
        signIn: "Entrar",
      },
      contactForm: {
        labels: {
          name: "Nome",
          email: "Email",
          company: "Empresa",
          phone: "Telefone",
          projectType: "Tipo de Projeto",
          budget: "Orçamento Previsto",
          timeline: "Prazo Desejado",
          message: "Conte-nos sobre seu projeto",
        },
        placeholders: {
          name: "Seu nome completo",
          email: "seu@email.com",
          company: "Nome da sua empresa",
          phone: "(11) 99999-9999",
          message: "Descreva sua ideia, objetivos e qualquer informação relevante...",
        },
        selects: {
          projectType: "Selecione o tipo",
          budget: "Faixa de orçamento",
          timeline: "Quando precisa ficar pronto?",
        },
        feedback: {
          success: "Mensagem enviada com sucesso!",
          error: "Não foi possível enviar sua mensagem.",
        },
        buttons: {
          submit: "Enviar Proposta",
          submitting: "Enviando...",
        },
      },
    },
    appShell: {
      defaultTitle: "Painel",
      navLinks: {
        funnel: "Funil",
        clients: "Clientes",
        metrics: "Métricas",
      },
      signInCta: "Entrar",
    },
    home: {
      navigation: [
        { href: "#services", label: "Serviços" },
        { href: "#process", label: "Processo" },
        { href: "#technologies", label: "Tecnologias" },
        { href: "#contact", label: "Contato" },
      ],
      hero: {
        badge: "Especialistas em MVPs e Crescimento Pós-Lançamento",
        title: {
          prefix: "Desenvolvemos",
          highlightOne: "aplicativos web",
          middle: "que fazem sua empresa",
          highlightTwo: "crescer",
        },
        description:
          "Do MVP ao crescimento sustentável. Criamos soluções web sob medida que se adaptam aos objetivos da sua empresa, usando tecnologias modernas e metodologias ágeis.",
        stats: [
          { value: "50+", label: "MVPs lançados" },
          { value: "90%", label: "Taxa de sucesso" },
          { value: "15 dias", label: "Tempo médio MVP" },
        ],
        ctaPrimary: "Começar Meu MVP",
        ctaSecondary: "Ver Nossos Serviços",
        highlight: {
          title: "Parceiro estratégico para o seu próximo lançamento digital",
          subtitle:
            "Planejamos, desenvolvemos e acompanhamos seu produto com uma equipe especialista em MVPs e produtos digitais de alto impacto.",
          bullets: [
            "Planejamento estratégico do discovery ao pós-lançamento",
            "Time dedicado e multidisciplinar para acelerar resultados",
            "Métricas claras, comunicação constante e foco no crescimento",
          ],
          footnote: "Processos claros · Comunicação constante · Foco em métricas",
        },
      },
      services: {
        badge: "Serviços que impulsionam seu crescimento",
        title: "Soluções completas que fazem sua empresa crescer",
        description:
          "Oferecemos serviços end-to-end para levar sua ideia do conceito à escala, com tecnologia moderna e um time focado em resultados.",
        cards: [
          {
            title: "Desenvolvimento MVP",
            description:
              "Criamos seu Produto Mínimo Viável em tempo recorde, validando sua ideia no mercado com funcionalidades essenciais.",
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
            items: [
              "Monitoramento 24/7",
              "Atualizações contínuas",
              "Backup automático",
              "Suporte técnico dedicado",
            ],
          },
        ],
        cta: "Falar com Especialista",
      },
      process: {
        badge: "Como transformamos sua ideia em realidade",
        title: "Uma metodologia ágil para entregar resultados rápidos",
        description:
          "Nossa metodologia comprovada garante entregas rápidas sem abrir mão da qualidade, acompanhando sua equipe durante todas as etapas do projeto.",
        timeline: [
          {
            number: "01",
            title: "Discovery",
            description: "Entendemos sua visão e definimos o escopo do MVP",
          },
          {
            number: "02",
            title: "Design & Prototipação",
            description: "Criamos a experiência do usuário e validamos conceitos",
          },
          {
            number: "03",
            title: "Desenvolvimento",
            description: "Construímos seu MVP com tecnologias modernas",
          },
          {
            number: "04",
            title: "Launch & Growth",
            description: "Lançamos e implementamos estratégias de crescimento",
          },
        ],
        steps: [
          {
            title: "Descoberta & Análise",
            description:
              "Entendemos profundamente seu negócio, público e objetivos para criar a solução ideal.",
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
            items: [
              "Análises e métricas",
              "Novas funcionalidades",
              "Otimização de performance",
              "Suporte consultivo",
            ],
          },
        ],
        timelineBadge: "Processo completo: 2-8 semanas dependendo da complexidade",
      },
      technologies: {
        badge: "Tecnologias de ponta para seu projeto",
        title: "Ferramentas modernas para construir aplicações seguras e escaláveis",
        description:
          "Selecionamos tecnologias líderes de mercado para garantir qualidade, performance e escalabilidade, sempre alinhadas aos objetivos do seu negócio.",
        groups: [
          {
            title: "Frontend",
            stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "Angular"],
          },
          {
            title: "Backend",
            stack: ["Node.js", "Python", "PostgreSQL", "MongoDB", "Edge Functions", "REST/GraphQL"],
          },
          {
            title: "Cloud & DevOps",
            stack: ["AWS", "Google Cloud", "Docker", "Kubernetes", "Vercel", "Netlify"],
          },
          {
            title: "Mobile & PWA",
            stack: ["React Native", "Expo", "Ionic", "Flutter", "PWA", "WebRTC"],
          },
        ],
      },
      capabilities: [
        {
          title: "Desenvolvimento Full-Stack",
          description: "Equipe completa para frontend e backend",
        },
        {
          title: "Arquitetura Escalável",
          description: "Soluções que crescem com seu negócio",
        },
        {
          title: "Metodologia Ágil",
          description: "Entregas rápidas com qualidade garantida",
        },
        {
          title: "Suporte Contínuo",
          description: "Acompanhamento pós-lançamento",
        },
      ],
      faq: {
        badge: "Perguntas Frequentes",
        title: "Esclarecemos as principais dúvidas sobre nossos serviços e processo",
        description:
          "Cada projeto é único. Caso não encontre a resposta que procura, fale com nosso time e teremos prazer em compartilhar mais detalhes.",
        items: [
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
        ],
      },
      contact: {
        badge: "Atendimento especializado em produtos digitais",
        title: {
          prefix: "Vamos conversar sobre",
          highlight: "seu próximo projeto",
        },
        description:
          "Entre em contato conosco e receba uma proposta personalizada em até 24 horas. Vamos entender sua ideia, mapear objetivos e propor o caminho ideal para lançar ou evoluir seu produto.",
        formCard: {
          title: "Fale com nossos especialistas",
          subtitle: "Preencha o formulário e retornaremos em até 24 horas úteis.",
        },
        contactCard: {
          title: "Informações de Contato",
          subtitle: "Escolha o canal que preferir para falar com a gente.",
        },
        contactDetails: [
          { label: "Email", value: "contato@appseed.com.br" },
          { label: "Telefone", value: "+55 47 9 9671-8866" },
          { label: "Localização", value: "São Paulo, Brasil" },
        ],
        differentiatorsCard: {
          title: "Por que escolher a AppSeed?",
          subtitle: "Resultados consistentes do MVP ao crescimento.",
          items: [
            "Proposta personalizada em até 24h",
            "Metodologia ágil comprovada",
            "Equipe de especialistas dedicados",
            "Suporte pós-lançamento contínuo",
            "Orçamento transparente",
            "Entregas dentro do prazo",
          ],
        },
        formOptions: {
          projectTypes: [
            "MVP do zero",
            "Aplicação web completa",
            "Integrações e APIs",
            "Produto mobile ou PWA",
            "Evolução pós-lançamento",
          ],
          budgetRanges: [
            "R$ 15k - R$ 30k",
            "R$ 30k - R$ 60k",
            "R$ 60k - R$ 100k",
            "Acima de R$ 100k",
            "Ainda estamos avaliando",
            "Algo rápido e muito barato"
          ],
          timelineOptions: [
            "Urgente (preciso em até 30 dias)",
            "Em até 3 meses",
            "Em 3-6 meses",
            "Ainda estamos planejando",
          ],
        },
      },
      footer: {
        description:
          "Desenvolvemos aplicações web que fazem sua empresa crescer. Do MVP ao crescimento sustentável, criamos soluções que se adaptam às necessidades do seu negócio.",
        quickLinksTitle: "Links rápidos",
        legalTitle: "Legal & redes",
        legalLinks: [
          { label: "Política de Privacidade", href: "/politica-de-privacidade" },
          { label: "Termos de Uso", href: "/termos-de-uso" },
          { label: "Política de Cookies", href: "#" },
          { label: "Admin", href: "/dashboard" },
        ],
        copy: "© {{year}} AppSeed. Todos os direitos reservados.",
      },
    },
    crm: {
      sidebar: {
        productName: "AppSeed CRM",
      },
      buttons: {
        newLead: "+ Novo Lead",
        createLead: "Salvar lead",
        creatingLead: "Salvando...",
        save: "Salvar alterações",
        saving: "Salvando...",
        cancel: "Cancelar",
        addActivity: "+ Atividade",
        sendEmail: "Enviar e-mail",
        markDone: "Concluir",
        applyFilters: "Aplicar",
        applyingFilters: "Atualizando...",
        clearFilters: "Limpar",
      },
      statuses: {
        attention: "Atenção",
        overdue: "Atrasado",
        dueSoon: "Vence em breve",
        dueOn: "Vence em {{date}}",
        inProgress: "Em andamento",
        noTasks: "Sem tarefas",
        noStage: "Sem etapa",
        none: "—",
      },
      placeholders: {
        searchLeads: "Buscar por nome ou email",
        searchClients: "Buscar por nome ou email",
        leadName: "Nome do lead",
        leadEmail: "lead@empresa.com",
        leadPhone: "(11) 99999-9999",
        leadCompany: "Empresa",
        leadValue: "5000",
        owner: "user@email.com",
        notes: "Detalhes ou contexto",
        activityContent: "Descreva a atividade",
      },
      pipelineSwitcher: {
        title: "Funil ativo",
        create: "Criar funil",
        edit: "Editar funil",
        manage: "Gerenciar funis",
        empty: "Nenhum funil disponível",
        active: "Atual",
        loading: "Atualizando...",
      },
      pipelineModal: {
        title: "Novo funil",
        editTitle: "Editar funil",
        description: "Defina um nome, cor e etapas iniciais para organizar seu processo.",
        editDescription: "Atualize informações do funil e ajuste a ordem das etapas.",
        nameLabel: "Nome do funil",
        namePlaceholder: "Ex.: Funil de Vendas",
        colorLabel: "Cor",
        stagesLabel: "Etapas",
        stagesHelper: "Adicione ou reordene as etapas de acordo com o seu processo.",
        addStage: "Adicionar etapa",
        stagePlaceholder: "Nome da etapa",
        deleteStage: "Remover",
        create: "Criar",
        save: "Salvar mudanças",
        cancel: "Cancelar",
        nameRequired: "Informe o nome do funil",
        stageNameRequired: "Informe o nome das etapas",
        created: "Funil criado com sucesso",
        saved: "Funil atualizado",
        error: "Não foi possível salvar o funil.",
        tabs: {
          details: "Detalhes",
          webhook: "Webhook",
        },
        stageRules: {
          title: "Regras por etapa",
          subtitle: "Configure gatilhos de transição para cada etapa do funil.",
          stageName: "Nome da etapa",
          triggerLabel: "Dispara transição",
          triggerDescription: "Aciona movimentação automática ou modal ao entrar na etapa.",
          modeLabel: "Modo",
          manual: "Manual",
          auto: "Automática",
          targetPipeline: "Funil destino",
          targetStage: "Etapa inicial no destino",
          selectPipeline: "Selecione um funil",
          selectStage: "Selecione uma etapa",
          copyActivities: "Copiar atividades (últimos 30 dias)",
          archiveSource: "Arquivar lead original após mover",
          moveUp: "Mover etapa para cima",
          moveDown: "Mover etapa para baixo",
          remove: "Remover etapa",
        },
        webhook: {
          disabled: "Salve o funil para configurar o webhook.",
          endpointTitle: "Endpoint",
          idLabel: "URL por ID",
          slugLabel: "URL por slug",
          methodHint: "Envie requisições HTTP POST com JSON no corpo.",
          tokenLabel: "Token de autenticação",
          tokenHelper: "Use como Bearer token no header Authorization.",
          copy: "Copiar",
          rotate: "Rotacionar token",
          rotateConfirm: "Deseja gerar um novo token? O token atual deixará de funcionar.",
          rotateSuccess: "Token rotacionado com sucesso.",
          rotateError: "Não foi possível rotacionar o token.",
          copied: "Copiado para a área de transferência.",
          tokenCopied: "Token copiado para a área de transferência.",
          copyError: "Falha ao copiar. Tente novamente.",
          defaultStageLabel: "Etapa padrão",
          defaultStageFallback: "Primeira etapa do funil",
          stageUpdated: "Etapa padrão atualizada.",
          stageError: "Não foi possível atualizar a etapa padrão.",
          exampleTitle: "Exemplo de requisição",
          exampleSubtitle:
            "Use este cURL como referência para integrar formulários ou serviços externos.",
          testButton: "Enviar teste",
          error: "Não foi possível carregar as informações do webhook.",
          test: {
            title: "Testar webhook",
            description: "Envie uma requisição de teste usando o payload abaixo.",
            payloadLabel: "Payload JSON",
            payloadHelper:
              "Edite os dados antes de enviar. Campos obrigatórios: name, email ou phone.",
            invalidJson: "JSON inválido. Verifique o formato do payload.",
            missingToken: "Token não disponível. Gere um novo token e tente novamente.",
            error: "Não foi possível enviar o teste. Tente novamente.",
            statusLabel: "Status HTTP",
            cancel: "Cancelar",
            submit: "Enviar teste",
            submitting: "Enviando...",
          },
        },
      },
      leadTransition: {
        title: "Mover lead para outro funil",
        description: "Selecione o funil de destino e a etapa inicial para continuar o acompanhamento.",
        pipelineLabel: "Funil destino",
        stageLabel: "Etapa inicial",
        copyActivities: "Copiar atividades dos últimos 30 dias",
        archiveOriginal: "Arquivar lead original após mover",
        submit: "Mover",
        submitting: "Movendo...",
        success: "Lead enviado para {{pipeline}}",
        duplicate: "Esse lead já foi enviado recentemente para {{pipeline}}.",
        error: "Não foi possível mover o lead. Tente novamente.",
        open: "Abrir",
        trigger: "Enviar para outro funil",
        empty: "Nenhum outro funil disponível.",
        cancel: "Cancelar",
      },
      settings: {
        tabs: {
          pipelines: "Funis",
          users: "Usuários",
          preferences: "Preferências",
        },
        pipelines: {
          title: "Funis",
          subtitle: "Gerencie seus funis, cores e etapas para cada processo.",
          empty: "Nenhum funil cadastrado ainda.",
          deleted: "Funil removido.",
          deleteConfirm: "Tem certeza que deseja excluir este funil?",
        },
        members: {
          title: "Membros",
          subtitle: "Convide e gerencie usuários com acesso ao workspace.",
        },
        preferences: {
          title: "Preferências",
          subtitle: "Personalize o workspace, tema e idioma do produto.",
          workspace: {
            title: "Workspace",
            subtitle: "Atualize o nome e a cor principal utilizados na interface.",
            nameLabel: "Nome do workspace",
            namePlaceholder: "Ex.: Vendas Brasil",
            nameDescription: "Esse nome aparece na barra lateral, convites e notificações.",
            colorLabel: "Cor principal",
            colorDescription: "Essa cor é usada nos destaques, gráficos e indicadores do workspace.",
            save: "Salvar alterações",
            saving: "Salvando...",
            updatedToast: "Workspace atualizado com sucesso.",
            noChangesToast: "Nenhuma alteração para salvar.",
            invalidWorkspace: "Workspace não encontrado.",
            permissionWarning: "Você precisa ser administrador para editar essas informações.",
            validation: {
              nameRequired: "Informe o nome do workspace.",
            },
          },
          account: {
            title: "Sua conta",
            subtitle: "Consulte suas informações e o método de acesso utilizado.",
            name: "Nome",
            email: "E-mail",
            login: "Método de login",
            loginSocial: "Social ({{provider}})",
            loginCredentials: "E-mail e senha",
            lastLogin: "Último acesso",
            providers: "Contas conectadas",
            noProviders: "Nenhuma conta social conectada.",
            empty: "—",
            error: "Não foi possível carregar os dados da conta.",
          },
          experience: {
            title: "Experiência",
            subtitle: "Escolha como deseja visualizar o produto.",
            themeLabel: "Tema",
            themeDescription: "Altere entre tema claro ou escuro conforme sua preferência.",
            themeUpdatedDark: "Tema escuro ativado.",
            themeUpdatedLight: "Tema claro ativado.",
            languageLabel: "Idioma",
            languageDescription: "Defina o idioma da interface.",
            languageUpdated: "Idioma alterado para {{language}}.",
          },
        },
      },
      dashboard: {
        title: "Funil de Vendas",
        subtitle: "Acompanhe leads, atividades e organize o pipeline.",
        ownerFilterAll: "Todos os responsáveis",
        stats: {
          leads: "Leads: {{count}}",
          stages: "Etapas: {{count}}",
        },
        emptyPipelines: {
          title: "Você ainda não tem funis",
          description: "Crie um funil para organizar seu processo de vendas e pós-vendas.",
          cta: "Criar funil",
        },
        emptyStages: {
          title: "Configure as etapas",
          description: "Este funil não possui etapas ainda. Adicione etapas para começar a organizar os leads.",
          cta: "Adicionar etapa",
        },
        emptyLeads: "Sem leads por aqui ainda. Clique em Criar lead para começar.",
      },
      stageColumn: {
        leadCount: "{{count}} leads",
        dropHere: "Solte aqui",
        totalValue: "Total: {{total}}",
        ruleManual: "Regra: Manual",
        ruleAuto: "Regra: Automática",
      },
      leadCard: {
        createdAt: "Criado {{date}}",
        activities: "{{count}} atividades",
        attention: "Atenção",
        addActivity: "Atividade",
      },
      clients: {
        title: "Clientes e Leads",
        subtitle:
          "Visualize todos os contatos cadastrados, status no funil e próximos passos.",
        summary: {
          total: "Total de registros",
          value: "Valor potencial",
          overdue: "Tarefas em atraso",
          results: "Resultados",
          gain: "Ganho",
          loss: "Perda",
        },
        empty: "Nenhum cliente encontrado.",
        table: {
          customer: "Cliente",
          company: "Empresa",
          stage: "Etapa",
          value: "Valor",
          status: "Status",
          owner: "Responsável",
          createdAt: "Criado em",
          actions: "Ações",
          details: "Detalhes",
          noStage: "Sem etapa",
          noEmail: "Sem email",
          noOwner: "Sem responsável",
        },
        statuses: {
          overdue: "Atrasado",
          inProgress: "Em andamento",
          noTasks: "Sem tarefas",
        },
      },
      metrics: {
        title: "Métricas do funil",
        filters: {
          from: "De",
          to: "Até",
          apply: "Aplicar",
          applying: "Atualizando...",
          clear: "Limpar",
        },
        cards: {
          leadsPerStage: "Leads por etapa",
          conversion: "Taxa de conversão",
          conversionHint: "Até a etapa \"Fechamento\"",
          timeInPipeline: "Tempo médio no funil",
          timeHint: "Entre criação e hoje",
          timeUnit: "{{days}} dias",
        },
        chart: {
          distribution: "Distribuição por etapa",
        },
        table: {
          title: "Tabela detalhada",
          stage: "Etapa",
          total: "Total",
          value: "Valor",
        },
        empty: "Nenhuma métrica disponível.",
      },
      leadDetail: {
        badges: {
          overdue: "{{count}} atrasada(s)",
          dueSoon: "Atenção: vencerá em breve",
        },
        form: {
          name: "Nome",
          email: "Email",
          phone: "Telefone",
          company: "Empresa",
          value: "Valor (R$)",
          owner: "Responsável",
          moveStage: "Mover etapa",
          quickNote: "Adicionar nota rápida",
        },
        summaryTitle: "Resumo",
        pipelineTitle: "Pipeline",
        pipelineDescription: "Etapas do funil:",
        metrics: {
          stage: "Etapa",
          value: "Valor",
          createdAt: "Criado em",
          owner: "Responsável",
          overdueTasks: "Tarefas atrasadas",
          nextTask: "Próxima tarefa",
        },
        timeline: {
          title: "Timeline de atividades",
          empty: "Sem atividades registradas.",
        },
        buttons: {
          sendEmail: "Enviar e-mail",
          addActivity: "+ Atividade",
          save: "Salvar alterações",
          saving: "Salvando...",
          cancel: "Cancelar",
        },
        stageListTitle: "Etapas do funil",
      },
      dialogs: {
        newLead: {
          title: "Novo Lead",
          fields: {
            name: "Nome",
            email: "Email",
            phone: "Telefone",
            company: "Empresa",
            value: "Valor (R$)",
            owner: "Responsável",
            notes: "Notas iniciais",
            stage: "Etapa",
          },
          placeholders: {
            name: "Nome do lead",
            email: "lead@empresa.com",
            phone: "(11) 99999-9999",
            company: "Empresa",
            value: "5000",
            owner: "user@email.com",
            notes: "Detalhes ou contexto",
          },
          validation: {
            nameRequired: "Informe o nome",
            emailInvalid: "Email inválido",
          },
          submit: "Salvar lead",
          submitting: "Salvando...",
          cancel: "Cancelar",
        },
        activity: {
          title: "Nova atividade",
          titleWithLead: "Nova atividade para {{lead}}",
          fields: {
            type: "Tipo",
            content: "Conteúdo",
            dueAt: "Vencimento",
          },
          types: {
            note: "Nota",
            call: "Ligação",
            email: "E-mail",
            whatsapp: "WhatsApp",
            task: "Tarefa",
          },
          placeholders: {
            content: "Descreva a atividade",
          },
          validation: {
            contentRequired: "Informe o conteúdo",
          },
          submit: "Salvar",
          submitting: "Salvando...",
          cancel: "Cancelar",
        },
      },
      toasts: {
        leadCreated: "Lead criado com sucesso.",
        activityLogged: "Atividade registrada.",
        leadUpdated: "Lead atualizado.",
        taskCompleted: "Tarefa concluída.",
      },
    },
  },
  en: {
    common: {
      languageLabel: "Language",
      languages: {
        pt: "Portuguese",
        en: "English",
        es: "Spanish",
      },
      themeToggle: {
        light: "Light mode",
        dark: "Dark mode",
        ariaLabel: "Toggle theme",
      },
      actions: {
        startProject: "Start a Project",
        startMvp: "Start My MVP",
        viewServices: "View Our Services",
        talkToSpecialist: "Talk to a Specialist",
        backToTop: "Back to top",
        signIn: "Sign in",
      },
      contactForm: {
        labels: {
          name: "Name",
          email: "Email",
          company: "Company",
          phone: "Phone",
          projectType: "Project Type",
          budget: "Estimated Budget",
          timeline: "Desired Timeline",
          message: "Tell us about your project",
        },
        placeholders: {
          name: "Your full name",
          email: "you@email.com",
          company: "Your company name",
          phone: "(555) 000-0000",
          message: "Describe your idea, goals, and any relevant information...",
        },
        selects: {
          projectType: "Choose a type",
          budget: "Budget range",
          timeline: "When should it be ready?",
        },
        feedback: {
          success: "Message sent successfully!",
          error: "We couldn't send your message.",
        },
        buttons: {
          submit: "Send Proposal",
          submitting: "Sending...",
        },
      },
    },
    appShell: {
      defaultTitle: "Dashboard",
      navLinks: {
        funnel: "Pipeline",
        clients: "Clients",
        metrics: "Metrics",
      },
      signInCta: "Sign in",
    },
    home: {
      navigation: [
        { href: "#services", label: "Services" },
        { href: "#process", label: "Process" },
        { href: "#technologies", label: "Technologies" },
        { href: "#contact", label: "Contact" },
      ],
      hero: {
        badge: "MVP and post-launch growth experts",
        title: {
          prefix: "We build",
          highlightOne: "web applications",
          middle: "that help your company",
          highlightTwo: "grow",
        },
        description:
          "From MVP to sustainable growth. We craft tailored web solutions that adapt to your business goals using modern technologies and agile methods.",
        stats: [
          { value: "50+", label: "MVPs launched" },
          { value: "90%", label: "Success rate" },
          { value: "15 days", label: "Average MVP timeline" },
        ],
        ctaPrimary: "Start My MVP",
        ctaSecondary: "View Our Services",
        highlight: {
          title: "Strategic partner for your next digital launch",
          subtitle:
            "We plan, build, and support your product with a team specialized in high-impact MVPs and digital products.",
          bullets: [
            "Strategic planning from discovery to post-launch",
            "Dedicated cross-functional team to accelerate results",
            "Clear metrics, ongoing communication, and growth focus",
          ],
          footnote: "Clear processes · Continuous communication · Metric driven",
        },
      },
      services: {
        badge: "Services that fuel your growth",
        title: "End-to-end solutions that help your business scale",
        description:
          "We deliver end-to-end services to take your idea from concept to scale with modern technology and a team focused on outcomes.",
        cards: [
          {
            title: "MVP Development",
            description:
              "We build your Minimum Viable Product at record speed, validating your idea with the essential features.",
            items: [
              "Rapid prototyping",
              "User validation",
              "Scalable architecture",
              "Delivery in 15-30 days",
            ],
          },
          {
            title: "Post-MVP Growth",
            description:
              "We evolve your MVP with new features, optimizations, and scalability to sustain growth.",
            items: [
              "New feature delivery",
              "Performance optimization",
              "Automatic scalability",
              "Analytics and metrics",
            ],
          },
          {
            title: "Full Web Applications",
            description:
              "We build robust, tailored web systems for companies that need custom solutions.",
            items: [
              "Modern frontend",
              "Scalable backend",
              "Optimized databases",
              "REST/GraphQL APIs",
            ],
          },
          {
            title: "Progressive Web Apps",
            description:
              "PWAs that combine native app experiences with web accessibility, ready for any device.",
            items: [
              "Native-like experience",
              "Offline support",
              "Push notifications",
              "Easy installation",
            ],
          },
          {
            title: "Integrations & APIs",
            description:
              "We connect your existing systems to new solutions through secure, flexible integrations.",
            items: [
              "Custom APIs",
              "Third-party integrations",
              "Process automation",
              "Data synchronization",
            ],
          },
          {
            title: "Maintenance & Support",
            description:
              "We keep your application up to date, secure, and performing at its best.",
            items: [
              "24/7 monitoring",
              "Continuous updates",
              "Automatic backups",
              "Dedicated technical support",
            ],
          },
        ],
        cta: "Talk to a Specialist",
      },
      process: {
        badge: "How we bring your idea to life",
        title: "An agile methodology to deliver fast results",
        description:
          "Our proven process ensures fast delivery without sacrificing quality, guiding your team through every project phase.",
        timeline: [
          {
            number: "01",
            title: "Discovery",
            description: "We understand your vision and define the MVP scope",
          },
          {
            number: "02",
            title: "Design & Prototyping",
            description: "We craft the user experience and validate concepts",
          },
          {
            number: "03",
            title: "Development",
            description: "We build your MVP with modern technologies",
          },
          {
            number: "04",
            title: "Launch & Growth",
            description: "We launch and implement growth strategies",
          },
        ],
        steps: [
          {
            title: "Discovery & Analysis",
            description:
              "We dive deep into your business, audience, and goals to design the right solution.",
            items: [
              "Market and competitor research",
              "Persona and journey definition",
              "Feature mapping",
              "Product strategy and roadmap",
            ],
          },
          {
            title: "Prototyping & Design",
            description:
              "We build interactive prototypes and a design system that guides development.",
            items: [
              "Wireframes and flows",
              "Custom design system",
              "Interactive prototype",
              "User validation",
            ],
          },
          {
            title: "Agile Development",
            description:
              "We deliver your MVP in weekly increments with full transparency on progress.",
            items: [
              "Agile methodology",
              "Incremental releases",
              "Automated testing",
              "Continuous code review",
            ],
          },
          {
            title: "Testing & Validation",
            description:
              "We ensure quality, performance, and security before each launch.",
            items: [
              "Functional testing",
              "Performance testing",
              "Usability testing",
              "Security testing",
            ],
          },
          {
            title: "Launch & Deployment",
            description:
              "We take your application live with robust infrastructure and monitoring.",
            items: [
              "Automated deployment",
              "Infrastructure setup",
              "Real-time monitoring",
              "Backup and recovery",
            ],
          },
          {
            title: "Growth & Evolution",
            description:
              "We track metrics and evolve your application with data-informed releases.",
            items: [
              "Insights and analytics",
              "New feature delivery",
              "Performance optimization",
              "Advisory support",
            ],
          },
        ],
        timelineBadge: "Complete process: 2-8 weeks depending on complexity",
      },
      technologies: {
        badge: "Cutting-edge technologies for your project",
        title: "Modern tools to build secure, scalable applications",
        description:
          "We use industry-leading technologies to ensure quality, performance, and scalability aligned with your business goals.",
        groups: [
          {
            title: "Frontend",
            stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "Angular"],
          },
          {
            title: "Backend",
            stack: ["Node.js", "Python", "PostgreSQL", "MongoDB", "Edge Functions", "REST/GraphQL"],
          },
          {
            title: "Cloud & DevOps",
            stack: ["AWS", "Google Cloud", "Docker", "Kubernetes", "Vercel", "Netlify"],
          },
          {
            title: "Mobile & PWA",
            stack: ["React Native", "Expo", "Ionic", "Flutter", "PWA", "WebRTC"],
          },
        ],
      },
      capabilities: [
        {
          title: "Full-stack Development",
          description: "End-to-end team for frontend and backend",
        },
        {
          title: "Scalable Architecture",
          description: "Solutions that grow with your business",
        },
        {
          title: "Agile Methodology",
          description: "Fast delivery with guaranteed quality",
        },
        {
          title: "Continuous Support",
          description: "Post-launch partnership",
        },
      ],
      faq: {
        badge: "Frequently Asked Questions",
        title: "We answer the key questions about our services and process",
        description:
          "Every project is unique. If you can't find the answer you're looking for, contact our team and we'll be happy to help.",
        items: [
          {
            question: "How much does it cost to build an MVP?",
            answer:
              "Investment depends on complexity, scope, and required integrations. After the initial discovery we deliver a detailed proposal with time, team, and roadmap estimates.",
          },
          {
            question: "How long does it take to launch an MVP?",
            answer:
              "Projects begin with 2-4 week discovery and prototyping sprints. MVP delivery usually happens within 4 to 8 weeks depending on prioritized features.",
          },
          {
            question: "What is product maintenance?",
            answer:
              "It is continuous post-launch support, ensuring availability, monitoring, quick fixes, and feature evolution without downtime.",
          },
          {
            question: "Do you work with any industry?",
            answer:
              "Yes. We support startups, scale-ups, and established companies across multiple verticals, adapting discovery and strategy to each context.",
          },
          {
            question: "Is my project safe with you?",
            answer:
              "Absolutely. We sign NDAs when needed, follow security best practices, leverage trusted cloud providers, and maintain automated backups throughout development.",
          },
          {
            question: "Do I need technical knowledge to hire you?",
            answer:
              "No. We guide the entire process in clear language, translating business needs into technical requirements and keeping you fully informed.",
          },
        ],
      },
      contact: {
        badge: "Specialized support for digital products",
        title: {
          prefix: "Let's talk about",
          highlight: "your next project",
        },
        description:
          "Get in touch and receive a tailored proposal within 24 hours. We'll understand your idea, map your goals, and suggest the ideal path to launch or evolve your product.",
        formCard: {
          title: "Talk to our specialists",
          subtitle: "Fill out the form and we'll get back within one business day.",
        },
        contactCard: {
          title: "Contact information",
          subtitle: "Choose the channel that works best for you.",
        },
        contactDetails: [
          { label: "Email", value: "contato@appseed.com.br" },
          { label: "Phone", value: "+55 (47) 9 9671-8866" },
          { label: "Location", value: "Remote" },
        ],
        differentiatorsCard: {
          title: "Why choose AppSeed?",
          subtitle: "Consistent results from MVP to growth.",
          items: [
            "Tailored proposal in under 24h",
            "Proven agile methodology",
            "Dedicated team of specialists",
            "Continuous post-launch support",
            "Transparent budgets",
            "On-time deliveries",
          ],
        },
        formOptions: {
          projectTypes: [
            "MVP from scratch",
            "Complete web application",
            "Integrations and APIs",
            "Mobile product or PWA",
            "Post-launch evolution",
          ],
          budgetRanges: [
            "$15k - $30k",
            "$30k - $60k",
            "$60k - $100k",
            "Above $100k",
            "Still evaluating",
            "Something quick and very cheap"
          ],
          timelineOptions: [
            "Urgent (need it within 30 days)",
            "Within 3 months",
            "In 3-6 months",
            "Still planning",
          ],
        },
      },
      footer: {
        description:
          "We build web applications that help your company grow. From MVP to sustainable scale, we create solutions tailored to your business needs.",
        quickLinksTitle: "Quick links",
        legalTitle: "Legal & social",
        legalLinks: [
          { label: "Privacy Policy", href: "/politica-de-privacidade" },
          { label: "Terms of Use", href: "/termos-de-uso" },
          { label: "Cookie Policy", href: "#" },
          { label: "Admin", href: "/dashboard" },
        ],
        copy: "© {{year}} AppSeed. All rights reserved.",
      },
    },
    crm: {
      sidebar: {
        productName: "AppSeed CRM",
      },
      buttons: {
        newLead: "+ New Lead",
        createLead: "Save lead",
        creatingLead: "Saving...",
        save: "Save changes",
        saving: "Saving...",
        cancel: "Cancel",
        addActivity: "+ Activity",
        sendEmail: "Send email",
        markDone: "Mark done",
        applyFilters: "Apply",
        applyingFilters: "Updating...",
        clearFilters: "Clear",
      },
      statuses: {
        attention: "Attention",
        overdue: "Overdue",
        dueSoon: "Due soon",
        dueOn: "Due on {{date}}",
        inProgress: "In progress",
        noTasks: "No tasks",
        noStage: "No stage",
        none: "—",
      },
      placeholders: {
        searchLeads: "Search by name or email",
        searchClients: "Search by name or email",
        leadName: "Lead name",
        leadEmail: "lead@company.com",
        leadPhone: "(555) 000-0000",
        leadCompany: "Company",
        leadValue: "5000",
        owner: "owner@email.com",
        notes: "Details or context",
        activityContent: "Describe the activity",
      },
      pipelineSwitcher: {
        title: "Active pipeline",
        create: "Create pipeline",
        edit: "Edit pipeline",
        manage: "Manage pipelines",
        empty: "No pipelines available",
        active: "Active",
        loading: "Updating...",
      },
      pipelineModal: {
        title: "New pipeline",
        editTitle: "Edit pipeline",
        description: "Set a name, color, and starting stages to organize your workflow.",
        editDescription: "Update pipeline details and stage order.",
        nameLabel: "Pipeline name",
        namePlaceholder: "e.g. Sales Funnel",
        colorLabel: "Color",
        stagesLabel: "Stages",
        stagesHelper: "Add, rename, or reorder the stages to match your process.",
        addStage: "Add stage",
        stagePlaceholder: "Stage name",
        deleteStage: "Remove",
        create: "Create",
        save: "Save changes",
        cancel: "Cancel",
        nameRequired: "Provide the pipeline name",
        stageNameRequired: "Provide the stage names",
        created: "Pipeline created successfully",
        saved: "Pipeline updated",
        error: "We couldn't save the pipeline.",
        tabs: {
          details: "Details",
          webhook: "Webhook",
        },
        stageRules: {
          title: "Stage rules",
          subtitle: "Configure transition triggers for each stage.",
          stageName: "Stage name",
          triggerLabel: "Trigger transition",
          triggerDescription:
            "Open the modal or move automatically when a lead enters this stage.",
          modeLabel: "Mode",
          manual: "Manual",
          auto: "Automatic",
          targetPipeline: "Destination pipeline",
          targetStage: "Destination starting stage",
          selectPipeline: "Select a pipeline",
          selectStage: "Select a stage",
          copyActivities: "Copy activities (last 30 days)",
          archiveSource: "Archive original lead after moving",
          moveUp: "Move stage up",
          moveDown: "Move stage down",
          remove: "Remove stage",
        },
        webhook: {
          disabled: "Save the pipeline to configure the webhook.",
          endpointTitle: "Endpoint",
          idLabel: "URL by ID",
          slugLabel: "URL by slug",
          methodHint: "Send HTTP POST requests with a JSON payload.",
          tokenLabel: "Authentication token",
          tokenHelper: "Use it as a Bearer token in the Authorization header.",
          copy: "Copy",
          rotate: "Rotate token",
          rotateConfirm: "Generate a new token? The current token will stop working.",
          rotateSuccess: "Token rotated successfully.",
          rotateError: "We couldn't rotate the token.",
          copied: "Copied to clipboard.",
          tokenCopied: "Token copied to clipboard.",
          copyError: "Could not copy. Try again.",
          defaultStageLabel: "Default stage",
          defaultStageFallback: "First stage of the pipeline",
          stageUpdated: "Default stage updated.",
          stageError: "We couldn't update the default stage.",
          exampleTitle: "Request example",
          exampleSubtitle: "Use this cURL snippet as a reference for external integrations.",
          testButton: "Send test",
          error: "We couldn't load the webhook configuration.",
          test: {
            title: "Test webhook",
            description: "Send a test request with the payload below.",
            payloadLabel: "JSON payload",
            payloadHelper:
              "Edit the data before sending. Required fields: name plus email or phone.",
            invalidJson: "Invalid JSON. Check the payload format.",
            missingToken: "Token unavailable. Generate a new token and try again.",
            error: "We couldn't send the test. Try again.",
            statusLabel: "HTTP status",
            cancel: "Cancel",
            submit: "Send test",
            submitting: "Sending...",
          },
        },
      },
      leadTransition: {
        title: "Move lead to another pipeline",
        description: "Choose the destination pipeline and starting stage to keep the follow-up on track.",
        pipelineLabel: "Destination pipeline",
        stageLabel: "Starting stage",
        copyActivities: "Copy activities from the last 30 days",
        archiveOriginal: "Archive original lead after move",
        submit: "Move",
        submitting: "Moving...",
        success: "Lead sent to {{pipeline}}",
        duplicate: "This lead was already moved recently to {{pipeline}}.",
        error: "We couldn't move the lead. Try again.",
        open: "Open",
        trigger: "Send to another pipeline",
        empty: "No other pipelines available.",
        cancel: "Cancel",
      },
      settings: {
        tabs: {
          pipelines: "Pipelines",
          users: "Users",
          preferences: "Preferences",
        },
        pipelines: {
          title: "Pipelines",
          subtitle: "Manage pipelines, colors, and stages for each workflow.",
          empty: "No pipelines yet.",
          deleted: "Pipeline removed.",
          deleteConfirm: "Are you sure you want to delete this pipeline?",
        },
        members: {
          title: "Members",
          subtitle: "Invite and manage the people who can access this workspace.",
        },
        preferences: {
          title: "Preferences",
          subtitle: "Customize workspace details, theme, and language.",
          workspace: {
            title: "Workspace",
            subtitle: "Update the workspace name and main color used across the interface.",
            nameLabel: "Workspace name",
            namePlaceholder: "E.g. Sales Brazil",
            nameDescription: "This name appears in the sidebar, invites, and notifications.",
            colorLabel: "Primary color",
            colorDescription: "Used for highlights, charts, and workspace status indicators.",
            save: "Save changes",
            saving: "Saving...",
            updatedToast: "Workspace updated successfully.",
            noChangesToast: "No changes to apply.",
            invalidWorkspace: "Workspace not found.",
            permissionWarning: "You need to be an administrator to edit these settings.",
            validation: {
              nameRequired: "Enter the workspace name.",
            },
          },
          account: {
            title: "Your account",
            subtitle: "Review your information and how you sign in.",
            name: "Name",
            email: "Email",
            login: "Login method",
            loginSocial: "Social ({{provider}})",
            loginCredentials: "Email and password",
            lastLogin: "Last sign-in",
            providers: "Connected accounts",
            noProviders: "No social accounts connected.",
            empty: "—",
            error: "We couldn't load your account data.",
          },
          experience: {
            title: "Experience",
            subtitle: "Choose how you want to use the product.",
            themeLabel: "Theme",
            themeDescription: "Switch between light and dark modes whenever you like.",
            themeUpdatedDark: "Dark theme enabled.",
            themeUpdatedLight: "Light theme enabled.",
            languageLabel: "Language",
            languageDescription: "Select the interface language.",
            languageUpdated: "Language changed to {{language}}.",
          },
        },
      },
      dashboard: {
        title: "Sales Pipeline",
        subtitle: "Track leads, activities, and keep your pipeline organized.",
        ownerFilterAll: "All owners",
        stats: {
          leads: "Leads: {{count}}",
          stages: "Stages: {{count}}",
        },
        emptyPipelines: {
          title: "You don't have any pipelines yet",
          description: "Create a pipeline to organize your sales or post-sales process.",
          cta: "Create pipeline",
        },
        emptyStages: {
          title: "Configure the stages",
          description: "This pipeline has no stages yet. Add stages to start organizing leads.",
          cta: "Add stage",
        },
        emptyLeads: "No leads here yet. Click Create lead to get started.",
      },
      stageColumn: {
        leadCount: "{{count}} leads",
        dropHere: "Drop here",
        totalValue: "Total: {{total}}",
        ruleManual: "Rule: Manual",
        ruleAuto: "Rule: Automatic",
      },
      leadCard: {
        createdAt: "Created {{date}}",
        activities: "{{count}} activities",
        attention: "Attention",
        addActivity: "Activity",
      },
      clients: {
        title: "Clients & Leads",
        subtitle: "See every contact, pipeline status, and next steps.",
        summary: {
          total: "Total records",
          value: "Potential value",
          overdue: "Tasks overdue",
          results: "Results",
          gain: "Won",
          loss: "Lost",
        },
        empty: "No clients found.",
        table: {
          customer: "Client",
          company: "Company",
          stage: "Stage",
          value: "Value",
          status: "Status",
          owner: "Owner",
          createdAt: "Created at",
          actions: "Actions",
          details: "Details",
          noStage: "No stage",
          noEmail: "No email",
          noOwner: "No owner",
        },
        statuses: {
          overdue: "Overdue",
          inProgress: "In progress",
          noTasks: "No tasks",
        },
      },
      metrics: {
        title: "Funnel metrics",
        filters: {
          from: "From",
          to: "To",
          apply: "Apply",
          applying: "Updating...",
          clear: "Clear",
        },
        cards: {
          leadsPerStage: "Leads per stage",
          conversion: "Conversion rate",
          conversionHint: "Up to the \"Closing\" stage",
          timeInPipeline: "Average time in pipeline",
          timeHint: "From creation to today",
          timeUnit: "{{days}} days",
        },
        chart: {
          distribution: "Stage distribution",
        },
        table: {
          title: "Detailed table",
          stage: "Stage",
          total: "Total",
          value: "Value",
        },
        empty: "No metrics available.",
      },
      leadDetail: {
        badges: {
          overdue: "{{count}} overdue",
          dueSoon: "Attention: due soon",
        },
        form: {
          name: "Name",
          email: "Email",
          phone: "Phone",
          company: "Company",
          value: "Value (R$)",
          owner: "Owner",
          moveStage: "Move stage",
          quickNote: "Add quick note",
        },
        summaryTitle: "Summary",
        pipelineTitle: "Pipeline",
        pipelineDescription: "Pipeline stages:",
        metrics: {
          stage: "Stage",
          value: "Value",
          createdAt: "Created at",
          owner: "Owner",
          overdueTasks: "Overdue tasks",
          nextTask: "Next task",
        },
        timeline: {
          title: "Activity timeline",
          empty: "No activities yet.",
        },
        buttons: {
          sendEmail: "Send email",
          addActivity: "+ Activity",
          save: "Save changes",
          saving: "Saving...",
          cancel: "Cancel",
        },
        stageListTitle: "Pipeline stages",
      },
      dialogs: {
        newLead: {
          title: "New Lead",
          fields: {
            name: "Name",
            email: "Email",
            phone: "Phone",
            company: "Company",
            value: "Value (R$)",
            owner: "Owner",
            notes: "Initial notes",
            stage: "Stage",
          },
          placeholders: {
            name: "Lead name",
            email: "lead@company.com",
            phone: "(555) 000-0000",
            company: "Company",
            value: "5000",
            owner: "owner@email.com",
            notes: "Details or context",
          },
          validation: {
            nameRequired: "Name is required",
            emailInvalid: "Invalid email",
          },
          submit: "Save lead",
          submitting: "Saving...",
          cancel: "Cancel",
        },
        activity: {
          title: "New activity",
          titleWithLead: "New activity for {{lead}}",
          fields: {
            type: "Type",
            content: "Content",
            dueAt: "Due date",
          },
          types: {
            note: "Note",
            call: "Call",
            email: "Email",
            whatsapp: "WhatsApp",
            task: "Task",
          },
          placeholders: {
            content: "Describe the activity",
          },
          validation: {
            contentRequired: "Content is required",
          },
          submit: "Save",
          submitting: "Saving...",
          cancel: "Cancel",
        },
      },
      toasts: {
        leadCreated: "Lead created successfully.",
        activityLogged: "Activity recorded.",
        leadUpdated: "Lead updated.",
        taskCompleted: "Task completed.",
      },
    },
  },
  es: {
    common: {
      languageLabel: "Idioma",
      languages: {
        pt: "Portugués",
        en: "Inglés",
        es: "Español",
      },
      themeToggle: {
        light: "Modo claro",
        dark: "Modo oscuro",
        ariaLabel: "Cambiar tema",
      },
      actions: {
        startProject: "Iniciar Proyecto",
        startMvp: "Comenzar mi MVP",
        viewServices: "Ver Nuestros Servicios",
        talkToSpecialist: "Hablar con un Especialista",
        backToTop: "Volver arriba",
        signIn: "Iniciar sesión",
      },
      contactForm: {
        labels: {
          name: "Nombre",
          email: "Email",
          company: "Empresa",
          phone: "Teléfono",
          projectType: "Tipo de Proyecto",
          budget: "Presupuesto Estimado",
          timeline: "Plazo Deseado",
          message: "Cuéntanos sobre tu proyecto",
        },
        placeholders: {
          name: "Tu nombre completo",
          email: "tu@email.com",
          company: "Nombre de tu empresa",
          phone: "(55) 0000-0000",
          message: "Describe tu idea, objetivos y cualquier información relevante...",
        },
        selects: {
          projectType: "Elige un tipo",
          budget: "Rango de presupuesto",
          timeline: "¿Cuándo debe estar listo?",
        },
        feedback: {
          success: "¡Mensaje enviado con éxito!",
          error: "No pudimos enviar tu mensaje.",
        },
        buttons: {
          submit: "Enviar Propuesta",
          submitting: "Enviando...",
        },
      },
    },
    appShell: {
      defaultTitle: "Panel",
      navLinks: {
        funnel: "Embudo",
        clients: "Clientes",
        metrics: "Métricas",
      },
      signInCta: "Iniciar sesión",
    },
    home: {
      navigation: [
        { href: "#services", label: "Servicios" },
        { href: "#process", label: "Proceso" },
        { href: "#technologies", label: "Tecnologías" },
        { href: "#contact", label: "Contacto" },
      ],
      hero: {
        badge: "Especialistas en MVP y crecimiento post-lanzamiento",
        title: {
          prefix: "Desarrollamos",
          highlightOne: "aplicaciones web",
          middle: "que ayudan a tu empresa a",
          highlightTwo: "crecer",
        },
        description:
          "Del MVP al crecimiento sostenible. Creamos soluciones web a medida que se adaptan a los objetivos de tu negocio con tecnología moderna y metodologías ágiles.",
        stats: [
          { value: "50+", label: "MVPs lanzados" },
          { value: "90%", label: "Tasa de éxito" },
          { value: "15 días", label: "Tiempo medio de MVP" },
        ],
        ctaPrimary: "Comenzar mi MVP",
        ctaSecondary: "Ver Nuestros Servicios",
        highlight: {
          title: "Socio estratégico para tu próximo lanzamiento digital",
          subtitle:
            "Planificamos, desarrollamos y acompañamos tu producto con un equipo experto en MVPs y productos digitales de alto impacto.",
          bullets: [
            "Planificación estratégica desde el discovery hasta el post-lanzamiento",
            "Equipo dedicado y multidisciplinar para acelerar resultados",
            "Métricas claras, comunicación constante y foco en el crecimiento",
          ],
          footnote: "Procesos claros · Comunicación constante · Enfoque en métricas",
        },
      },
      services: {
        badge: "Servicios que impulsan tu crecimiento",
        title: "Soluciones completas que hacen crecer a tu empresa",
        description:
          "Ofrecemos servicios de punta a punta para llevar tu idea del concepto a la escala, con tecnología moderna y un equipo enfocado en resultados.",
        cards: [
          {
            title: "Desarrollo de MVP",
            description:
              "Creamos tu Producto Mínimo Viable en tiempo récord, validando tu idea en el mercado con las funcionalidades esenciales.",
            items: [
              "Prototipado rápido",
              "Validación con usuarios reales",
              "Arquitectura escalable",
              "Entrega en 15-30 días",
            ],
          },
          {
            title: "Crecimiento Post-MVP",
            description:
              "Evolucionamos tu MVP con nuevas funcionalidades, optimizaciones y escalabilidad para sostener el crecimiento.",
            items: [
              "Nuevas funcionalidades",
              "Optimización de performance",
              "Escalabilidad automática",
              "Analytics y métricas",
            ],
          },
          {
            title: "Aplicaciones Web Completas",
            description:
              "Desarrollamos sistemas web robustos y personalizados para empresas que necesitan soluciones a medida.",
            items: [
              "Frontend moderno",
              "Backend escalable",
              "Base de datos optimizada",
              "APIs REST/GraphQL",
            ],
          },
          {
            title: "Progressive Web Apps",
            description:
              "PWAs que combinan la experiencia de aplicaciones nativas con la accesibilidad de la web, listas para cualquier dispositivo.",
            items: [
              "Experiencia nativa",
              "Funciona sin conexión",
              "Notificaciones push",
              "Instalación simplificada",
            ],
          },
          {
            title: "Integraciones y APIs",
            description:
              "Conectamos tus sistemas existentes con nuevas soluciones mediante integraciones seguras y flexibles.",
            items: [
              "APIs personalizadas",
              "Integraciones con terceros",
              "Automatización de procesos",
              "Sincronización de datos",
            ],
          },
          {
            title: "Mantenimiento y Soporte",
            description:
              "Mantendremos tu aplicación siempre actualizada, segura y con alto rendimiento.",
            items: [
              "Monitoreo 24/7",
              "Actualizaciones continuas",
              "Backup automático",
              "Soporte técnico dedicado",
            ],
          },
        ],
        cta: "Hablar con un Especialista",
      },
      process: {
        badge: "Cómo transformamos tu idea en realidad",
        title: "Una metodología ágil para entregar resultados rápidos",
        description:
          "Nuestra metodología comprobada garantiza entregas rápidas sin sacrificar la calidad, acompañando a tu equipo en cada etapa del proyecto.",
        timeline: [
          {
            number: "01",
            title: "Discovery",
            description: "Entendemos tu visión y definimos el alcance del MVP",
          },
          {
            number: "02",
            title: "Diseño y Prototipado",
            description: "Creamos la experiencia de usuario y validamos conceptos",
          },
          {
            number: "03",
            title: "Desarrollo",
            description: "Construimos tu MVP con tecnologías modernas",
          },
          {
            number: "04",
            title: "Lanzamiento y Crecimiento",
            description: "Lanzamos e implementamos estrategias de crecimiento",
          },
        ],
        steps: [
          {
            title: "Descubrimiento y Análisis",
            description:
              "Entendemos en profundidad tu negocio, público y objetivos para diseñar la solución ideal.",
            items: [
              "Análisis de mercado y competencia",
              "Definición de personas y jornadas",
              "Mapeo de funcionalidades",
              "Estrategia de producto y roadmap",
            ],
          },
          {
            title: "Prototipado y Diseño",
            description:
              "Creamos prototipos interactivos y un design system que guía todo el desarrollo.",
            items: [
              "Wireframes y flujos",
              "Design system personalizado",
              "Prototipo interactivo",
              "Validación con usuarios",
            ],
          },
          {
            title: "Desarrollo Ágil",
            description:
              "Entregamos tu MVP con iteraciones semanales y total transparencia del progreso.",
            items: [
              "Metodología ágil",
              "Entregas incrementales",
              "Tests automatizados",
              "Código revisado continuamente",
            ],
          },
          {
            title: "Tests y Validación",
            description:
              "Garantizamos calidad, rendimiento y seguridad antes de cada lanzamiento.",
            items: [
              "Tests funcionales",
              "Tests de performance",
              "Tests de usabilidad",
              "Tests de seguridad",
            ],
          },
          {
            title: "Lanzamiento y Deploy",
            description:
              "Ponemos tu aplicación en producción con infraestructura robusta y monitoreo continuo.",
            items: [
              "Deploy automatizado",
              "Configuración de infraestructura",
              "Monitoreo en tiempo real",
              "Backup y recuperación",
            ],
          },
          {
            title: "Crecimiento y Evolución",
            description:
              "Acompañamos métricas y evolucionamos tu aplicación con nuevas releases basadas en datos.",
            items: [
              "Análisis y métricas",
              "Nuevas funcionalidades",
              "Optimización de performance",
              "Soporte consultivo",
            ],
          },
        ],
        timelineBadge: "Proceso completo: 2-8 semanas según la complejidad",
      },
      technologies: {
        badge: "Tecnologías de punta para tu proyecto",
        title: "Herramientas modernas para construir aplicaciones seguras y escalables",
        description:
          "Seleccionamos tecnologías líderes para garantizar calidad, rendimiento y escalabilidad, siempre alineadas con los objetivos de tu negocio.",
        groups: [
          {
            title: "Frontend",
            stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "Angular"],
          },
          {
            title: "Backend",
            stack: ["Node.js", "Python", "PostgreSQL", "MongoDB", "Edge Functions", "REST/GraphQL"],
          },
          {
            title: "Cloud y DevOps",
            stack: ["AWS", "Google Cloud", "Docker", "Kubernetes", "Vercel", "Netlify"],
          },
          {
            title: "Mobile y PWA",
            stack: ["React Native", "Expo", "Ionic", "Flutter", "PWA", "WebRTC"],
          },
        ],
      },
      capabilities: [
        {
          title: "Desarrollo Full-Stack",
          description: "Equipo completo para frontend y backend",
        },
        {
          title: "Arquitectura Escalable",
          description: "Soluciones que crecen con tu negocio",
        },
        {
          title: "Metodología Ágil",
          description: "Entregas rápidas con calidad garantizada",
        },
        {
          title: "Soporte Continuo",
          description: "Acompañamiento post-lanzamiento",
        },
      ],
      faq: {
        badge: "Preguntas Frecuentes",
        title: "Respondemos las principales dudas sobre nuestros servicios y proceso",
        description:
          "Cada proyecto es único. Si no encuentras la respuesta que buscas, habla con nuestro equipo y con gusto te ayudaremos.",
        items: [
          {
            question: "¿Cuánto cuesta desarrollar un MVP?",
            answer:
              "La inversión depende de la complejidad, el alcance y las integraciones necesarias. Después del discovery inicial entregamos una propuesta detallada con estimaciones de tiempo, equipo y cronograma.",
          },
          {
            question: "¿Cuánto tiempo lleva lanzar un MVP?",
            answer:
              "Los proyectos comienzan con sprints intensivos de 2 a 4 semanas para discovery y prototipo. La entrega del MVP suele ocurrir entre 4 y 8 semanas, según las funcionalidades priorizadas.",
          },
          {
            question: "¿Qué es la sustentación de sistemas?",
            answer:
              "Es el acompañamiento continuo post-lanzamiento, garantizando disponibilidad, monitoreo, correcciones rápidas y evolución de funcionalidades sin interrumpir el producto.",
          },
          {
            question: "¿Atienden empresas de cualquier sector?",
            answer:
              "Sí. Trabajamos con startups, scale-ups y empresas establecidas de diversos sectores, adaptando el discovery y la estrategia al contexto del negocio.",
          },
          {
            question: "¿Mi proyecto está seguro con ustedes?",
            answer:
              "Absolutamente. Firmamos NDAs cuando es necesario, seguimos buenas prácticas de seguridad, usamos proveedores de nube confiables y mantenemos backups automáticos durante todo el desarrollo.",
          },
          {
            question: "¿Necesito conocimiento técnico para contratarlos?",
            answer:
              "No. Guiamos todo el proceso con lenguaje claro, traduciendo necesidades de negocio en requisitos técnicos y garantizando visibilidad total de las entregas.",
          },
        ],
      },
      contact: {
        badge: "Atención especializada en productos digitales",
        title: {
          prefix: "Hablemos de",
          highlight: "tu próximo proyecto",
        },
        description:
          "Ponte en contacto y recibe una propuesta personalizada en menos de 24 horas. Entenderemos tu idea, mapearemos objetivos y propondremos el camino ideal para lanzar o evolucionar tu producto.",
        formCard: {
          title: "Habla con nuestros especialistas",
          subtitle: "Completa el formulario y responderemos en un día hábil.",
        },
        contactCard: {
          title: "Información de contacto",
          subtitle: "Elige el canal que prefieras para hablar con nosotros.",
        },
        contactDetails: [
          { label: "Email", value: "contato@appseed.com.br" },
          { label: "Teléfono", value: "+55 47 9 9671-8866" },
          { label: "Ubicación", value: "Remoto" },
        ],
        differentiatorsCard: {
          title: "¿Por qué elegir AppSeed?",
          subtitle: "Resultados consistentes del MVP al crecimiento.",
          items: [
            "Propuesta personalizada en menos de 24h",
            "Metodología ágil comprobada",
            "Equipo dedicado de especialistas",
            "Soporte continuo post-lanzamiento",
            "Presupuestos transparentes",
            "Entregas puntuales",
          ],
        },
        formOptions: {
          projectTypes: [
            "MVP desde cero",
            "Aplicación web completa",
            "Integraciones y APIs",
            "Producto móvil o PWA",
            "Evolución post-lanzamiento",
          ],
          budgetRanges: [
            "$15k - $30k",
            "$30k - $60k",
            "$60k - $100k",
            "Más de $100k",
            "Aún evaluando",
            "Algo rápido y muy barato"
          ],
          timelineOptions: [
            "Urgente (lo necesito en 30 días)",
            "En hasta 3 meses",
            "En 3-6 meses",
            "Aún planificando",
          ],
        },
      },
      footer: {
        description:
          "Desarrollamos aplicaciones web que hacen crecer tu empresa. Del MVP al crecimiento sostenible, creamos soluciones que se adaptan a las necesidades de tu negocio.",
        quickLinksTitle: "Enlaces rápidos",
        legalTitle: "Legal y redes",
        legalLinks: [
          { label: "Política de Privacidad", href: "/politica-de-privacidade" },
          { label: "Términos de Uso", href: "/termos-de-uso" },
          { label: "Política de Cookies", href: "#" },
          { label: "Admin", href: "/dashboard" },
        ],
        copy: "© {{year}} AppSeed. Todos los derechos reservados.",
      },
    },
    crm: {
      sidebar: {
        productName: "AppSeed CRM",
      },
      buttons: {
        newLead: "+ Nuevo lead",
        createLead: "Guardar lead",
        creatingLead: "Guardando...",
        save: "Guardar cambios",
        saving: "Guardando...",
        cancel: "Cancelar",
        addActivity: "+ Actividad",
        sendEmail: "Enviar correo",
        markDone: "Marcar como hecho",
        applyFilters: "Aplicar",
        applyingFilters: "Actualizando...",
        clearFilters: "Limpiar",
      },
      statuses: {
        attention: "Atención",
        overdue: "Atrasado",
        dueSoon: "Próximo a vencer",
        dueOn: "Vence el {{date}}",
        inProgress: "En progreso",
        noTasks: "Sin tareas",
        noStage: "Sin etapa",
        none: "—",
      },
      placeholders: {
        searchLeads: "Buscar por nombre o email",
        searchClients: "Buscar por nombre o email",
        leadName: "Nombre del lead",
        leadEmail: "lead@empresa.com",
        leadPhone: "(55) 0000-0000",
        leadCompany: "Empresa",
        leadValue: "5000",
        owner: "owner@email.com",
        notes: "Detalles o contexto",
        activityContent: "Describe la actividad",
      },
      pipelineSwitcher: {
        title: "Embudo activo",
        create: "Crear embudo",
        edit: "Editar embudo",
        manage: "Gestionar embudos",
        empty: "No hay embudos disponibles",
        active: "Activo",
        loading: "Actualizando...",
      },
      pipelineModal: {
        title: "Nuevo embudo",
        editTitle: "Editar embudo",
        description: "Define un nombre, color y etapas iniciales para organizar tu proceso.",
        editDescription: "Actualiza la información del embudo y ajusta el orden de las etapas.",
        nameLabel: "Nombre del embudo",
        namePlaceholder: "Ej.: Embudo de ventas",
        colorLabel: "Color",
        stagesLabel: "Etapas",
        stagesHelper: "Agrega o reordena las etapas según tu proceso.",
        addStage: "Agregar etapa",
        stagePlaceholder: "Nombre de la etapa",
        deleteStage: "Eliminar",
        create: "Crear",
        save: "Guardar cambios",
        cancel: "Cancelar",
        nameRequired: "Ingresa el nombre del embudo",
        stageNameRequired: "Ingresa los nombres de las etapas",
        created: "Embudo creado con éxito",
        saved: "Embudo actualizado",
       error: "No pudimos guardar el embudo.",
        tabs: {
          details: "Detalles",
          webhook: "Webhook",
        },
        stageRules: {
          title: "Reglas por etapa",
          subtitle: "Configura disparos de transición para cada etapa del embudo.",
          stageName: "Nombre de la etapa",
          triggerLabel: "Dispara transición",
          triggerDescription: "Abre el modal o mueve automáticamente al entrar en la etapa.",
          modeLabel: "Modo",
          manual: "Manual",
          auto: "Automática",
          targetPipeline: "Embudo destino",
          targetStage: "Etapa inicial en el destino",
          selectPipeline: "Selecciona un embudo",
          selectStage: "Selecciona una etapa",
          copyActivities: "Copiar actividades (últimos 30 días)",
          archiveSource: "Archivar lead original después de mover",
          moveUp: "Mover etapa hacia arriba",
          moveDown: "Mover etapa hacia abajo",
          remove: "Eliminar etapa",
        },
        webhook: {
          disabled: "Guarda el embudo para configurar el webhook.",
          endpointTitle: "Endpoint",
          idLabel: "URL por ID",
          slugLabel: "URL por slug",
          methodHint: "Envía solicitudes HTTP POST con JSON en el cuerpo.",
          tokenLabel: "Token de autenticación",
          tokenHelper: "Úsalo como Bearer token en el header Authorization.",
          copy: "Copiar",
          rotate: "Rotar token",
          rotateConfirm: "¿Generar un nuevo token? El token actual dejará de funcionar.",
          rotateSuccess: "Token rotado con éxito.",
          rotateError: "No pudimos rotar el token.",
          copied: "Copiado al portapapeles.",
          tokenCopied: "Token copiado al portapapeles.",
          copyError: "No se pudo copiar. Intenta nuevamente.",
          defaultStageLabel: "Etapa predeterminada",
          defaultStageFallback: "Primera etapa del embudo",
          stageUpdated: "Etapa predeterminada actualizada.",
          stageError: "No pudimos actualizar la etapa predeterminada.",
          exampleTitle: "Ejemplo de solicitud",
          exampleSubtitle:
            "Usa este cURL como referencia para integrar formularios o servicios externos.",
          testButton: "Enviar prueba",
          error: "No pudimos cargar la configuración del webhook.",
          test: {
            title: "Probar webhook",
            description: "Envía una solicitud de prueba usando el payload siguiente.",
            payloadLabel: "Payload JSON",
            payloadHelper:
              "Edita los datos antes de enviar. Campos obligatorios: name más email o teléfono.",
            invalidJson: "JSON inválido. Verifica el formato del payload.",
            missingToken: "Token no disponible. Genera uno nuevo e inténtalo nuevamente.",
            error: "No pudimos enviar la prueba. Intenta nuevamente.",
            statusLabel: "Estado HTTP",
            cancel: "Cancelar",
            submit: "Enviar prueba",
            submitting: "Enviando...",
          },
        },
      },
      leadTransition: {
        title: "Mover lead a otro embudo",
        description: "Elige el embudo de destino y la etapa inicial para continuar el seguimiento.",
        pipelineLabel: "Embudo destino",
        stageLabel: "Etapa inicial",
        copyActivities: "Copiar actividades de los últimos 30 días",
        archiveOriginal: "Archivar lead original después de mover",
        submit: "Mover",
        submitting: "Moviendo...",
        success: "Lead enviado a {{pipeline}}",
        duplicate: "Este lead ya fue enviado recientemente a {{pipeline}}.",
        error: "No pudimos mover el lead. Intenta nuevamente.",
        open: "Abrir",
        trigger: "Enviar a otro embudo",
        empty: "No hay otros embudos disponibles.",
        cancel: "Cancelar",
      },
      settings: {
        tabs: {
          pipelines: "Embudos",
          users: "Usuarios",
          preferences: "Preferencias",
        },
        pipelines: {
          title: "Embudos",
          subtitle: "Gestiona embudos, colores y etapas para cada proceso.",
          empty: "Aún no hay embudos.",
          deleted: "Embudo eliminado.",
          deleteConfirm: "¿Seguro que deseas eliminar este embudo?",
        },
        members: {
          title: "Miembros",
          subtitle: "Invita y administra a las personas con acceso al workspace.",
        },
        preferences: {
          title: "Preferencias",
          subtitle: "Personaliza el workspace, el tema y el idioma del producto.",
          workspace: {
            title: "Espacio de trabajo",
            subtitle: "Actualiza el nombre y el color principal utilizados en la interfaz.",
            nameLabel: "Nombre del workspace",
            namePlaceholder: "Ej.: Ventas Brasil",
            nameDescription: "Este nombre aparece en la barra lateral, invitaciones y notificaciones.",
            colorLabel: "Color principal",
            colorDescription: "Se utiliza en destacados, gráficos e indicadores del workspace.",
            save: "Guardar cambios",
            saving: "Guardando...",
            updatedToast: "Workspace actualizado correctamente.",
            noChangesToast: "No hay cambios para guardar.",
            invalidWorkspace: "Workspace no encontrado.",
            permissionWarning: "Necesitas ser administrador para editar esta información.",
            validation: {
              nameRequired: "Ingresa el nombre del workspace.",
            },
          },
          account: {
            title: "Tu cuenta",
            subtitle: "Consulta tus datos y el método de acceso utilizado.",
            name: "Nombre",
            email: "Correo electrónico",
            login: "Método de acceso",
            loginSocial: "Social ({{provider}})",
            loginCredentials: "Correo y contraseña",
            lastLogin: "Último acceso",
            providers: "Cuentas conectadas",
            noProviders: "Ninguna cuenta social conectada.",
            empty: "—",
            error: "No pudimos cargar los datos de la cuenta.",
          },
          experience: {
            title: "Experiencia",
            subtitle: "Define cómo quieres ver el producto.",
            themeLabel: "Tema",
            themeDescription: "Cambia entre tema claro u oscuro cuando quieras.",
            themeUpdatedDark: "Tema oscuro activado.",
            themeUpdatedLight: "Tema claro activado.",
            languageLabel: "Idioma",
            languageDescription: "Selecciona el idioma de la interfaz.",
            languageUpdated: "Idioma cambiado a {{language}}.",
          },
        },
      },
      dashboard: {
        title: "Embudo de ventas",
        subtitle: "Sigue los leads, actividades y organiza tu pipeline.",
        ownerFilterAll: "Todos los responsables",
        stats: {
          leads: "Leads: {{count}}",
          stages: "Etapas: {{count}}",
        },
        emptyPipelines: {
          title: "Aún no tienes embudos",
          description: "Crea un embudo para organizar tu proceso comercial o de postventa.",
          cta: "Crear embudo",
        },
        emptyStages: {
          title: "Configura las etapas",
          description: "Este embudo no tiene etapas todavía. Añade etapas para comenzar a organizar los leads.",
          cta: "Agregar etapa",
        },
        emptyLeads: "Sin leads por aquí todavía. Haz clic en Crear lead para empezar.",
      },
      stageColumn: {
        leadCount: "{{count}} leads",
        dropHere: "Suelta aquí",
        totalValue: "Total: {{total}}",
        ruleManual: "Regla: Manual",
        ruleAuto: "Regla: Automática",
      },
      leadCard: {
        createdAt: "Creado {{date}}",
        activities: "{{count}} actividades",
        attention: "Atención",
        addActivity: "Actividad",
      },
      clients: {
        title: "Clientes y Leads",
        subtitle:
          "Visualiza todos los contactos, su estado en el embudo y próximos pasos.",
        summary: {
          total: "Total de registros",
          value: "Valor potencial",
          overdue: "Tareas atrasadas",
          results: "Resultados",
          gain: "Ganado",
          loss: "Perdido",
        },
        empty: "No se encontraron clientes.",
        table: {
          customer: "Cliente",
          company: "Empresa",
          stage: "Etapa",
          value: "Valor",
          status: "Estado",
          owner: "Responsable",
          createdAt: "Creado el",
          actions: "Acciones",
          details: "Detalles",
          noStage: "Sin etapa",
          noEmail: "Sin email",
          noOwner: "Sin responsable",
        },
        statuses: {
          overdue: "Atrasado",
          inProgress: "En progreso",
          noTasks: "Sin tareas",
        },
      },
      metrics: {
        title: "Métricas del embudo",
        filters: {
          from: "Desde",
          to: "Hasta",
          apply: "Aplicar",
          applying: "Actualizando...",
          clear: "Limpiar",
        },
        cards: {
          leadsPerStage: "Leads por etapa",
          conversion: "Tasa de conversión",
          conversionHint: "Hasta la etapa \"Cierre\"",
          timeInPipeline: "Tiempo promedio en el embudo",
          timeHint: "Entre la creación y hoy",
          timeUnit: "{{days}} días",
        },
        chart: {
          distribution: "Distribución por etapa",
        },
        table: {
          title: "Tabla detallada",
          stage: "Etapa",
          total: "Total",
          value: "Valor",
        },
        empty: "No hay métricas disponibles.",
      },
      leadDetail: {
        badges: {
          overdue: "{{count}} atrasadas",
          dueSoon: "Atención: vencerá pronto",
        },
        form: {
          name: "Nombre",
          email: "Email",
          phone: "Teléfono",
          company: "Empresa",
          value: "Valor (R$)",
          owner: "Responsable",
          moveStage: "Mover etapa",
          quickNote: "Agregar nota rápida",
        },
        summaryTitle: "Resumen",
        pipelineTitle: "Pipeline",
        pipelineDescription: "Etapas del embudo:",
        metrics: {
          stage: "Etapa",
          value: "Valor",
          createdAt: "Creado el",
          owner: "Responsable",
          overdueTasks: "Tareas atrasadas",
          nextTask: "Próxima tarea",
        },
        timeline: {
          title: "Cronología de actividades",
          empty: "Sin actividades registradas.",
        },
        buttons: {
          sendEmail: "Enviar correo",
          addActivity: "+ Actividad",
          save: "Guardar cambios",
          saving: "Guardando...",
          cancel: "Cancelar",
        },
        stageListTitle: "Etapas del embudo",
      },
      dialogs: {
        newLead: {
          title: "Nuevo lead",
          fields: {
            name: "Nombre",
            email: "Email",
            phone: "Teléfono",
            company: "Empresa",
            value: "Valor (R$)",
            owner: "Responsable",
            notes: "Notas iniciales",
            stage: "Etapa",
          },
          placeholders: {
            name: "Nombre del lead",
            email: "lead@empresa.com",
            phone: "(55) 0000-0000",
            company: "Empresa",
            value: "5000",
            owner: "owner@email.com",
            notes: "Detalles o contexto",
          },
          validation: {
            nameRequired: "Ingresa el nombre",
            emailInvalid: "Correo inválido",
          },
          submit: "Guardar lead",
          submitting: "Guardando...",
          cancel: "Cancelar",
        },
        activity: {
          title: "Nueva actividad",
          titleWithLead: "Nueva actividad para {{lead}}",
          fields: {
            type: "Tipo",
            content: "Contenido",
            dueAt: "Vencimiento",
          },
          types: {
            note: "Nota",
            call: "Llamada",
            email: "Correo",
            whatsapp: "WhatsApp",
            task: "Tarea",
          },
          placeholders: {
            content: "Describe la actividad",
          },
          validation: {
            contentRequired: "Ingresa el contenido",
          },
          submit: "Guardar",
          submitting: "Guardando...",
          cancel: "Cancelar",
        },
      },
      toasts: {
        leadCreated: "Lead creado con éxito.",
        activityLogged: "Actividad registrada.",
        leadUpdated: "Lead actualizado.",
        taskCompleted: "Tarea completada.",
      },
    },
  },
};

export type TranslationContent = (typeof translations)[Language];
