import React from "react";

export const helpFaqs = [
  {
    question: "Porque não consigo editar este registo linguístico?",
    answer: "O registo pode estar fora do seu perfil de acesso, já aprovado, ou atribuído a outro supervisor. Apenas registos no estado 'Rascunho' (DRAFT) ou que pertençam à sua autoria (identificador de criador) podem ser editados diretamente."
  },
  {
    question: "O que significam os estados Rascunho, Aguarda Aprovação ou Necessita Correção?",
    answer: "Rascunho é a fase inicial de criação. Aguarda Aprovação significa que o vocábulo submetido aguarda revisão de um superior. Necessita Correção indica que um Supervisor analisou o vocábulo e o devolveu com um motivo (justificação) exigindo ajustes antes de uma nova submissão."
  },
  {
    question: "Porque estou a receber erros ao pesquisar muito rápido?",
    answer: "O nosso sistema possui uma política de limitação de pedidos para manter a estabilidade global. Existe um limite de 60 pedidos por minuto para a maioria das acções, e 30 pedidos por minuto especificamente nas pesquisas textuais intensivas."
  },
  {
    question: "Como extrair os dados de produtividade da plataforma?",
    answer: "A plataforma permite gerar relatórios globais de produtividade e manter um histórico, podendo exportar os dados tanto em formato de Documento PDF como em folha de cálculo Excel (XLSX) através da secção de relatórios nativa."
  },
  {
    question: "Porque não consigo cadastrar um vocábulo repetido?",
    answer: "Entradas, topónimos, antropónimos e estrangeirismos exigem um vocábulo principal único dentro do mesmo módulo para garantir a integridade da base de dados e não gerar duplicações."
  },
  {
    question: "Posso criar um artigo no Blog e um Evento com o mesmo nome?",
    answer: "Sim, os módulos de Comunicação são distintos e têm os seus próprios identificadores no endereço web. No Blog pode criar publicações em formato de Artigo ou Vídeo, enquanto nos Eventos pode criar bilheteiras com limite máximo de inscritos."
  },
  {
    question: "Como anexar uma imagem ou ficheiro de áudio?",
    answer: "Nos formulários que suportam esta funcionalidade, o sistema utiliza pontos de submissão seguros para multimédia e associa-os diretamente ao identificador da entidade. Os vídeos, por motivos de performance, são integrados como links do YouTube."
  },
  {
    question: "Quem tem acesso ao histórico de quem modificou os dados?",
    answer: "A plataforma mantém um registo inalterável de Auditoria de Sistema para qualquer alteração sensível. Este registo indica quem efectuou a acção e a entidade afectada, sendo restrito exclusivamente à equipa de Administração."
  }
];

export interface RoleContent {
  ADMIN: React.ReactNode;
  SUPERVISOR: React.ReactNode;
  OPERATOR: React.ReactNode;
}

export interface HelpCardItem {
  id: string;
  icon: any; // We can't import IconName directly easily, let's use any for icon prop. It will be passed to name={card.icon}
  title: string;
  description: string;
  searchKeywords: string;
  dialogTitle: string;
  dialogDescription: string;
  dialogBody: React.ReactNode;
  roleIcon: any;
  roleContent: RoleContent;
}

export const helpCardsData: HelpCardItem[] = [
  {
    id: "primeiros-passos",
    icon: "Rocket",
    title: "Primeiros Passos",
    description: "Aprenda a configurar a sua conta, explorar as principais funcionalidades e tirar o máximo partido do sistema.",
    searchKeywords: "primeiros passos conta plataforma início",
    dialogTitle: "Primeiros Passos na Plataforma",
    dialogDescription: "Bem-vindo à API Linguística (v2.0). A plataforma é acedida através de uma arquitetura central que processa todos os formulários.",
    dialogBody: (
      <p>
        As suas interacções com a plataforma estão protegidas e monitorizadas. A nossa API suporta métodos padronizados e aplica automaticamente um limite global de <strong>60 pedidos por minuto</strong>, ou 30 no caso de pesquisas textuais pesadas, garantindo assim que a plataforma permaneça estável para todos.
      </p>
    ),
    roleIcon: "Briefcase",
    roleContent: {
      ADMIN: <p>Como Administrador, tem acesso completo a todas as áreas. Pode realizar a gestão global do sistema, configurar permissões base e gerir relatórios do sistema.</p>,
      SUPERVISOR: <p>Como Supervisor, o seu foco principal é o acesso e a revisão avançada de conteúdo. Encontra no seu <em>dashboard</em> os itens que aguardam aprovação e poderá gerir diretamente a produção da sua equipa.</p>,
      OPERATOR: <p>Como Operador, é o principal responsável pela inserção de dados. Tem restrições sobre a edição de registos: os seus itens ficam sob controlo de revisão e só pode editar registos que sejam da sua autoria ou que se encontrem no estado "Rascunho".</p>
    }
  },
  {
    id: "seguranca",
    icon: "ShieldCheck",
    title: "Segurança e Proteção",
    description: "Mantenha a sua conta e os dados gerados seguros com as nossas medidas de segurança avançadas.",
    searchKeywords: "segurança protecção autenticação token jwt",
    dialogTitle: "A nossa política de Segurança",
    dialogDescription: "A protecção dos dados linguísticos está desenhada de raiz em todas as rotas e comunicações.",
    dialogBody: (
      <p>
        Todas as suas ligações estão asseguradas por autenticação baseada em chaves de sessão protegidas. 
        Adicionalmente, os formulários submetidos possuem um processo de triagem ("Lista Branca") rigoroso: 
        quaisquer campos maliciosos ou desconhecidos enviados para a plataforma são imediatamente bloqueados pelo servidor.
      </p>
    ),
    roleIcon: "LockKeyhole",
    roleContent: {
      ADMIN: <p>Tem a capacidade de aceder e analisar as rotas de Auditoria de Sistema, permitindo cruzar identificadores ("autor"), acções e entidades modificadas por qualquer membro do sistema.</p>,
      SUPERVISOR: <p>As suas permissões conferem a capacidade de transitar a informação entre os estados do sistema, nomeadamente para Aguarda Aprovação, Aprovado, Rejeitado e Necessita Correção.</p>,
      OPERATOR: <p>Ao nível da protecção da informação, qualquer alteração drástica necessitará de aprovação e todas as consultas são filtradas implicitamente para proteger conteúdos de rascunhos alheios (filtros de autoria).</p>
    }
  },
  {
    id: "conta",
    icon: "User",
    title: "Conta e Perfil",
    description: "Faça a gestão das definições da sua conta, actualize o seu perfil, permissões e outros detalhes essenciais.",
    searchKeywords: "conta perfil gestão sessão",
    dialogTitle: "Gestão do seu Perfil",
    dialogDescription: "A gestão de contas, renovação de sessões e parametrizações operacionais.",
    dialogBody: (
      <p>
        A sua sessão digital tem uma duração limitada, contudo a plataforma tentará sempre realizar a renovação de forma invisível via chaves de renovação. 
        Para consultar os seus próprios dados actualizados, o sistema contacta os nossos serviços em total segurança.
      </p>
    ),
    roleIcon: "Settings",
    roleContent: {
      ADMIN: <p>A gestão de registo de novos membros é exclusiva do Administrador. Para registar um novo membro, ser-lhe-á exigido indicar o nome, endereço eletrónico e atribuir explicitamente a função (cargo) do utilizador.</p>,
      SUPERVISOR: <p>No seu perfil, o agrupamento de informações estará vinculado à relação hierárquica que mantém com os Operadores. Lembre-se sempre de garantir o encerramento da sessão (Terminar Sessão) em computadores partilhados no momento em que termina as suas aprovações.</p>,
      OPERATOR: <p>Quando cria dados e formulários (ex: Entradas do dicionário), a sua identificação autoral fica permanentemente registada na base de dados. Tenha atenção ao preenchimento dos campos essenciais assinalados com asterisco.</p>
    }
  },
  {
    id: "linguistica",
    icon: "BookOpen",
    title: "Gestão Linguística",
    description: "Guia sobre os modelos de Entradas, Topónimos, Antropónimos e Estrangeirismos.",
    searchKeywords: "gestão linguística entradas topónimos antropónimos estrangeirismos dicionário",
    dialogTitle: "Módulos Linguísticos",
    dialogDescription: "A espinha dorsal da plataforma: Entradas, Topónimos, Antropónimos e Estrangeirismos.",
    dialogBody: (
      <>
        <p className="mb-4">
          Cada módulo possui regras próprias de preenchimento. Por exemplo, ao criar uma <strong>Entrada</strong>, o vocábulo principal e a primeira definição são estritamente obrigatórios. Em <strong>Topónimos</strong>, exige-se o vocábulo e a província. Em <strong>Antropónimos</strong> o nome, e em <strong>Estrangeirismos</strong> o vocábulo original.
        </p>
        <p>
          Todas as pesquisas linguísticas podem ser filtradas através de parâmetros avançados, permitindo procurar por vocábulos textuais, estado de aprovação atual e autor (quem criou).
        </p>
      </>
    ),
    roleIcon: "FileText",
    roleContent: {
      ADMIN: <p>Tem o poder de forçar edições ou arquivar permanentemente qualquer vocábulo em qualquer módulo linguístico, independentemente do autor e do estado de aprovação em que este se encontre.</p>,
      SUPERVISOR: <p>Utilize as rotas de revisão para transitar os vocábulos da sua equipa do estado "Aguarda Aprovação" para "Aprovado". Se necessitar rejeitar ou enviar para correção, o preenchimento do motivo (justificação) é sempre obrigatório.</p>,
      OPERATOR: <p>Lembre-se: os campos assinalados com asterisco no documento de referência são obrigatórios na submissão. Se um vocábulo submetido voltar para o estado "Necessita Correcção", verifique o motivo deixado pelo seu Supervisor e submeta as alterações solicitadas.</p>
    }
  },
  {
    id: "comunicacao",
    icon: "Megaphone",
    title: "Comunicação e Eventos",
    description: "Como gerir artigos do Blog, Eventos da comunidade e inscrições.",
    searchKeywords: "comunicação eventos blog artigos publicações inscrições",
    dialogTitle: "Módulos de Comunicação",
    dialogDescription: "Publicações institucionais (Blog) e gestão de conferências/encontros (Eventos).",
    dialogBody: (
      <>
        <p className="mb-4">
          A plataforma possui um sistema nativo de Publicações e Eventos. 
          Os artigos de blog exigem um título, uma ligação permanente única (identificador no endereço web) e um tipo (por exemplo: Artigo ou Vídeo). 
        </p>
        <p>
          Os Eventos possuem capacidades nativas de inscrição, permitindo definir limites de capacidade (lotação máxima), datas de início e de fim, bem como gerir o ciclo de vida através dos estados Rascunho, Publicado, Cancelado e Concluído.
        </p>
      </>
    ),
    roleIcon: "Calendar",
    roleContent: {
      ADMIN: <p>Tem o controlo total sobre a publicação de eventos e a gestão (aprovação, cancelamento e controlo de presenças) das pessoas inscritas nas actividades.</p>,
      SUPERVISOR: <p>Pode gerir e editar rascunhos de artigos e auxiliar na gestão operacional de um evento se as regras da instituição o permitirem, analisando as métricas de inscrição através dos relatórios de Eventos.</p>,
      OPERATOR: <p>Geralmente o foco será a secção linguística, mas poderá estar habilitado para criar rascunhos de artigos ou submeter eventos dependendo das permissões granulares dadas pela administração. As inscrições públicas no portal são enviadas sem exigir início de sessão aos participantes.</p>
    }
  },
  {
    id: "relatorios",
    icon: "ChartBar",
    title: "Relatórios e Métricas",
    description: "Métricas globais, geração de relatórios (XLSX/PDF) e auditoria técnica.",
    searchKeywords: "relatórios métricas estatísticas excel pdf auditoria logs",
    dialogTitle: "Métricas e Extração de Dados",
    dialogDescription: "Ferramentas para acompanhar o desempenho e auditar a evolução do projeto.",
    dialogBody: (
      <>
        <p className="mb-4">
          O sistema integra mecanismos robustos de exportação. Pode exportar a produção global acedendo à secção de geração de relatórios, escolhendo o formato final (Documento PDF ou Folha de Cálculo Excel).
        </p>
        <p>
          As comunicações assíncronas do sistema e alertas de actividade estão cobertas pelo painel de Notificações, com suporte para leitura individual de mensagens ou marcação rápida de "Todas Lidas".
        </p>
      </>
    ),
    roleIcon: "Eye",
    roleContent: {
      ADMIN: <p>A exclusividade do painel de Auditoria de Sistema permite-lhe fazer uma filtragem poderosa (por utilizador, acção realizada, entidade ou intervalo temporal), assegurando que o sistema cumpre as estritas normativas de integridade e transparência da instituição.</p>,
      SUPERVISOR: <p>O seu <i>dashboard</i> (Painel de Controlo) alimenta-se através das estatísticas globais para mapear a performance da sua equipa e verificar o histórico de relatórios gerados (que guarda um registo de cada exportação processada e por quem).</p>,
      OPERATOR: <p>O seu painel principal mostra as suas próprias métricas de submissão (entradas criadas, taxa de rejeição/correção), ajudando-o a identificar onde é necessário retificar dados para subir o volume de registos devidamente Aprovados.</p>
    }
  }
];
