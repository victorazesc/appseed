import Link from "next/link";

const sections = [
  {
    title: "1. Definições",
    content: [
      "Para os fins desta Política, consideramos dado pessoal qualquer informação que identifique ou possa identificar uma pessoa natural, isoladamente ou em conjunto com outros dados disponíveis.",
      "Dados pessoais sensíveis, como origem racial ou étnica, convicção religiosa, opinião política, dados relacionados à saúde ou orientação sexual, são tratados com rigor adicional e somente quando estritamente necessários.",
    ],
  },
  {
    title: "2. Categorias de dados coletados",
    content: [
      "Coletamos dados de contato (nome, e-mail, telefone, cargo e empresa), dados de conta e de inscrição em eventos, informações profissionais compartilhadas em processos seletivos, dados técnicos gerados automaticamente (endereço IP, geolocalização aproximada, logs de navegação, dispositivo e navegador) e inferências sobre preferências de produtos e serviços.",
      "Determinados cookies e tecnologias semelhantes podem ser desabilitados no navegador ou via painel disponibilizado no site. A desativação, contudo, pode afetar funcionalidades essenciais da AppSeed.",
    ],
  },
  {
    title: "3. Papéis no tratamento",
    content: [
      "A AppSeed pode atuar como controladora ou operadora dos dados pessoais, a depender da finalidade da coleta e das obrigações contratuais assumidas com clientes, parceiros e fornecedores.",
      "Sempre que necessário, indicaremos expressamente o papel desempenhado no tratamento, em cumprimento ao artigo 6º, inciso VI, da Lei Geral de Proteção de Dados (LGPD).",
    ],
  },
  {
    title: "4. Como obtemos os dados",
    content: [
      "Os dados pessoais são coletados diretamente quando você interage com nossos sites, produtos e canais de atendimento; solicita materiais, demonstrações ou suporte; participa de pesquisas, eventos, webinars ou processos seletivos; ou nos envia mensagens de qualquer natureza.",
      "Também coletamos dados automaticamente relativos ao uso do AppSeed, para análise de performance, segurança e personalização de conteúdo. Esses dados podem ser combinados com informações fornecidas offline, sempre respeitando a legislação aplicável.",
    ],
  },
  {
    title: "5. Uso dos dados pessoais",
    content: [
      "Utilizamos dados pessoais para: (i) identificar e autenticar acessos; (ii) viabilizar a contratação e entrega de nossos produtos e serviços; (iii) cumprir obrigações legais e regulatórias; (iv) prevenir fraudes, garantir segurança da informação e gerir riscos; (v) enviar comunicações institucionais, de marketing e conteúdos relevantes; (vi) avaliar candidatos em processos seletivos; e (vii) melhorar continuamente nossas experiências digitais.",
      "As bases legais utilizadas incluem execução de contrato, consentimento, cumprimento de obrigação legal/regulatória, exercício regular de direitos e legítimo interesse, sempre com avaliação de impacto e respeito aos direitos do titular.",
    ],
  },
  {
    title: "6. Compartilhamento e transferências",
    content: [
      "Os dados podem ser compartilhados com empresas do mesmo grupo econômico, provedores cloud, parceiros comerciais e consultores especializados que atuam em nome da AppSeed, mediante contratos que asseguram confidencialidade e proteção adequada.",
      "Podemos divulgar dados pessoais para autoridades governamentais ou judiciais quando houver obrigação legal, ordem judicial, requisição de autoridade competente ou necessidade de proteger direitos da AppSeed e de terceiros.",
      "Transferências internacionais podem ocorrer em razão do uso de serviços hospedados fora do Brasil. Nesses casos, adotamos salvaguardas contratuais e técnicas compatíveis com a LGPD e demais normas aplicáveis.",
    ],
  },
  {
    title: "7. Direitos do titular",
    content: [
      "Você pode solicitar confirmação da existência de tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, informação sobre compartilhamentos, revogação do consentimento e revisão de decisões automatizadas.",
      "As solicitações podem ser encaminhadas por meio do e-mail privacidade@appseed.com.br. Responderemos dentro dos prazos previstos na legislação, observando hipóteses de recusa justificável previstas em lei.",
    ],
  },
  {
    title: "8. Período de retenção",
    content: [
      "Os dados pessoais são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta Política, cumprir obrigações legais e regulatórias, resguardar direitos e atender exigências de autoridades. Após esse período, realizamos o descarte ou anonimização, conforme o artigo 15 da LGPD.",
    ],
  },
  {
    title: "9. Segurança da informação",
    content: [
      "Implementamos controles técnicos e organizacionais alinhados às melhores práticas de mercado para proteger os dados contra acessos não autorizados, destruição acidental ou ilegal, perda, alteração, comunicação ou difusão indevida.",
      "Nossos ambientes são monitorados continuamente e contamos com processos de resposta a incidentes, gestão de vulnerabilidades e políticas internas de segurança e privacidade aplicáveis a colaboradores e terceiros.",
    ],
  },
  {
    title: "10. Atualizações",
    content: [
      "Esta Política pode ser revisada a qualquer tempo para refletir mudanças legislativas, tecnológicas ou nas operações da AppSeed. A data da última atualização constará ao final do documento.",
      "Notificaremos alterações materiais por meio dos nossos canais oficiais. Antes de usar dados pessoais para novas finalidades, solicitaremos consentimento quando exigido em lei.",
    ],
  },
  {
    title: "11. Contato",
    content: [
      "Encarregado de Proteção de Dados (DPO): Bernardo Alves.",
      "Endereço: Rua XV de Novembro, 245, Centro, Blumenau/SC, CEP 89010-001.",
      "E-mail: privacidade@appseed.com.br.",
    ],
  },
  {
    title: "12. Foro e legislação aplicável",
    content: [
      "Esta Política é regida pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de Blumenau, Estado de Santa Catarina, como competente para dirimir quaisquer controvérsias decorrentes desta Política, com renúncia a qualquer outro, por mais privilegiado que seja.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 pb-24">
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6 lg:pt-24">
        <div className="mb-12 space-y-4 text-center">
          <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-4 py-1 text-sm font-medium text-emerald-700">
            Política de Privacidade
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Como a AppSeed protege seus dados pessoais
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
            Transparência é a base dos nossos relacionamentos. Aqui explicamos de forma clara
            como coletamos, utilizamos, compartilhamos e protegemos seus dados em conformidade
            com a Lei Geral de Proteção de Dados (LGPD).
          </p>
        </div>
        <div className="space-y-8 rounded-[32px] border border-slate-200/70 bg-white p-8 shadow-sm sm:p-12">
          <div className="space-y-5 text-slate-600">
            <p>
              Somos a AppSeed Tecnologia Ltda., CNPJ 55.623.287/0001-06, com sede online. Esta Política descreve como tratamos dados pessoais em nossos sites,
              produtos digitais, landing pages, aplicativos e demais canais de atendimento.
            </p>
            <p>
              Mantemos um Sistema de Gestão de Segurança da Informação e Privacidade inspirado nas normas ISO/IEC 27001 e ISO/IEC 27701,
              adotando salvaguardas técnicas e organizacionais para proteger os dados pessoais.
            </p>
          </div>
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title} className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                <div className="space-y-3 text-sm leading-7 text-slate-600">
                  {section.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="rounded-2xl bg-emerald-50 px-6 py-5 text-sm text-emerald-700">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
            <span>AppSeed © {new Date().getFullYear()} - Todos os direitos reservados.</span>
            <Link href="/" className="font-medium text-emerald-600 hover:text-emerald-500">
              Voltar para a página inicial →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
