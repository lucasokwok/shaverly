# Shaverly — Registro de uso de IA na engenharia

> Este documento registra contribuição da IA, decisão humana e fundamentos utilizados. Atualizado em 22/11/2026.

## IA-001 — Descoberta dos atores que criam agendamentos

- **Etapa:** descoberta de requisitos (antes de decidir arquitetura ou tecnologia).
- **Contexto:** a visão do produto previa agendamentos sem esclarecer quem os realiza.
- **Contribuição da IA:** identificou a ambiguidade e perguntou se o agendamento seria feito pelo cliente, pela barbearia ou por ambos.
- **Decisão humana:** **ambos** — clientes e barbearia poderão criar agendamentos.
- **Artefato resultante:** RF-001 em `docs/requirements.md`.
- **Validação:** decisão explicitamente confirmada na conversa; critérios de aceitação ainda não foram produzidos, porque falta detalhar os fluxos.
- **Relação com as aulas:**
  - *Engineering Shared Understanding*, páginas 3, 5, 6 e 11: discovery antes de specification; usar IA para revelar ambiguidades (abordagem “Grill-Me”), sem transferir à IA a decisão sobre o domínio.
  - *Aula 3 — Beyond the Code Factory*, páginas 2 e 4: começar pelo comportamento necessário, não por tarefas técnicas.
- **Limitações e pendências:** a equipe não decidiu autenticação, autorização específica, edição, cancelamento nem disponibilidade.

## IA-002 — Identificação no autoagendamento e agendamento em nome de clientes

- **Etapa:** descoberta de requisitos.
- **Contexto:** a questão inicial tratava apenas de obrigatoriedade de conta para o cliente. A resposta da equipe acrescentou um fluxo distinto para usuários autorizados da barbearia.
- **Contribuição da IA:** apresentou alternativas para identificação do cliente no autoagendamento e separou, a partir da resposta humana, os comportamentos dos dois atores. Propôs critérios de aceitação preliminares e identificou a pendência sobre criação automática de cadastro.
- **Decisão humana:** **confirmada** — o cliente que agenda por conta própria deve criar conta; a barbearia poderá agendar selecionando um cliente cadastrado ou informando nome completo e telefone.
- **Artefatos resultantes:** RD-002, RF-002, RF-003 e RF-004 em `docs/requirements.md`.
- **Validação:** decisão explicitamente formulada pela equipe; critérios de aceitação são preliminares e devem ser revisados antes de implementação.
- **Relação com as aulas:**
  - *Engineering Shared Understanding*, páginas 3, 5, 6 e 11: descoberta de ambiguidades, distinção entre descoberta e especificação e critérios de aceitação verificáveis.
  - *Aula 3 — Beyond the Code Factory*, páginas 2, 4 e 5: descrição do comportamento antes das tarefas técnicas e possibilidade de entregas verticais.
  - *Secure Systems Architecture*, página 5: diferenciar autenticação de autorização, sem assumir papéis internos não definidos.
- **Limitações e pendências:** não foi decidido se dados digitados pela barbearia criam cadastro de cliente, como evitar duplicidade, quais são os perfis autorizados, nem como funcionará o login.
- **Próximo passo (realizado em 19/11/2026):** Q-003 esclarecida na RD-003: cadastro reutilizável sem conta e histórico recuperável mediante associação futura.

## IA-003 — Cadastro de cliente sem conta e reaproveitamento de histórico

- **Etapa:** descoberta e modelagem do domínio.
- **Contexto:** a equipe esclareceu que nome completo e telefone serão sempre obrigatórios, e que o cliente poderá criar uma conta após já existir histórico de serviços inserido por funcionários da barbearia.
- **Contribuição da IA:** organizou o comportamento em requisitos e cenários de aceitação; distinguiu cadastro operacional de cliente de conta autenticável; identificou risco de exposição de histórico caso uma conta seja vinculada a um telefone sem comprovação de titularidade.
- **Decisão humana:** **confirmada** — nome completo e telefone são obrigatórios; a barbearia pode cadastrar um cliente sem conta; históricos de serviços devem ser recuperáveis quando o cliente criar sua conta posteriormente usando o mesmo telefone.
- **Recomendação da IA posteriormente aprovada na RD-004:** verificar a posse do telefone antes de associar e exibir o histórico. SMS ou WhatsApp foram aceitos como canais possíveis; detalhes da verificação e da política de vinculação ainda não foram definidos.
- **Artefatos resultantes:** RD-003, RF-005 a RF-008 e cenários preliminares em `docs/requirements.md`.
- **Validação:** baseia-se no requisito informado pela equipe. A especificação e os testes do mecanismo de vinculação ainda dependem da Q-004.
- **Relação com as aulas:**
  - *Engineering Shared Understanding*, páginas 6 a 8: critérios de aceitação, modelagem de domínio e linguagem ubíqua.
  - *Secure Systems Architecture*, páginas 4 e 5: verificação de titularidade de recursos, distinção entre autenticação e autorização.
  - *Architectural Feedback*, página 4: privilegiar testes de comportamento observável, inclusive cenários de associação correta e incorreta.
- **Próximo passo (resolvido em RD-004):** Q-004 — confirmação por código via SMS ou WhatsApp antes de associar e consultar histórico.

## IA-004 — Validação da posse do telefone para vincular histórico

- **Etapa:** descoberta de requisitos e análise de segurança.
- **Contexto:** a RD-003 prevê que uma conta recém-criada possa recuperar atendimentos cadastrados pela barbearia com o mesmo telefone. Isso poderia expor dados de terceiros se o número informado não fosse verificado.
- **Contribuição da IA:** identificou o risco de associação indevida de histórico e apresentou alternativas de validação, incluindo código de confirmação por SMS ou WhatsApp; transformou a decisão em requisitos e critérios de aceitação preliminares.
- **Decisão humana:** **confirmada** — comprovar a posse do número por código recebido por SMS ou WhatsApp **antes de vincular e visualizar o histórico anterior**.
- **Separação entre fato e sugestão:** a equipe confirmou a necessidade e os canais possíveis. Não decidiu qual canal será prioritário, qual serviço será usado, nem regras de expiração, limitação de tentativas, números reciclados ou contas duplicadas.
- **Artefatos resultantes:** RD-004, RF-009, RF-010 e cenários preliminares em `docs/requirements.md`.
- **Validação:** decisão textualmente confirmada pela equipe; os critérios propostos ainda exigem revisão humana e testes automatizados quando implementados. Nenhum envio de código ou teste de software foi executado nesta etapa.
- **Relação com as aulas:**
  - *Secure Systems Architecture*, páginas 4 e 5: autorização e validação de acesso aos recursos pelo backend, não apenas presença de um telefone igual.
  - *Engineering Shared Understanding*, páginas 5, 6 e 11: esclarecer ambiguidades com IA, transformar descobertas em requisitos testáveis e reservar a decisão de negócio às pessoas.
  - *Architectural Feedback*, página 4: testar comportamento visível e proteção de dados sem acoplar os testes à implementação escolhida.
- **Próximo passo:** Q-005 — esclarecer se a plataforma terá múltiplas barbearias independentes e, consequentemente, o escopo de seus dados e históricos.

## IA-005 — Plataforma para múltiplas barbearias independentes

- **Etapa:** descoberta de requisitos e delimitação do domínio multiestabelecimento.
- **Contexto:** os requisitos anteriores citam cadastros de clientes, históricos e contas, mas não determinavam se a plataforma atenderia a um ou vários estabelecimentos independentes.
- **Contribuição da IA:** apresentou a alternativa entre uma única barbearia e várias; organizou a opção escolhida em requisitos de separação dos dados; apontou a necessidade de verificar autorização entre estabelecimentos e a ambiguidade da relação entre **conta de acesso global** e **cadastro operacional de cliente por barbearia**. Propôs cenários preliminares de aceitação, sem escolher arquitetura.
- **Decisão humana:** **confirmada** — haverá **múltiplas barbearias independentes**, cada qual com seus próprios profissionais, serviços, agendamentos e registros de clientes.
- **Artefato resultante:** RD-005, RF-011 e RF-012 e cenários preliminares em `docs/requirements.md`.
- **Validação:** a decisão de produto foi confirmada textualmente. Os cenários propostos pela IA ainda dependem de revisão pelos dois desenvolvedores; não foram implementados nem executados testes.
- **Relação com as aulas:**
  - *Engineering Shared Understanding*, páginas 7–8 e 11–12: modelagem do domínio, linguagem compartilhada e documentação contextual para agentes de IA.
  - *Aula 6 — The Architecture of Change*, páginas 4 e 10: delimitação de fronteiras e responsabilidade pelos dados, sem confundir separação lógica com uma decisão tecnológica.
  - *Secure Systems Architecture*, páginas 4–5: validação de acesso à informação conforme o estabelecimento autorizado.
  - *Aula 1 — Software as a Product*, páginas 9 e 12: escolhas iterativas e escopo controlado.
- **Pendências:** autenticação global vs. por estabelecimento; visibilidade do histórico para o próprio cliente; tratamento de telefones duplicados entre estabelecimentos; gestão de unidades e filiais; mecanismos concretos de isolamento.
- **Próximo passo (resolvido na RD-006):** Q-006 — a equipe confirmou conta única de cliente utilizável em várias barbearias.

## IA-006 — Conta global do cliente e cadastros locais por barbearia

- **Etapa:** descoberta de requisitos e modelagem de identidade do usuário na plataforma.
- **Contexto:** a RD-005 determinou que diferentes barbearias têm seus próprios profissionais, serviços, agendamentos e cadastros de clientes, mas não definiu se uma pessoa precisaria de contas distintas para agendar em estabelecimentos diferentes.
- **Contribuição da IA:** identificou essa ambiguidade e apresentou duas alternativas: conta única ou conta por barbearia. Depois da resposta da equipe, distinguiu identidade global autenticável de cadastro operacional por estabelecimento, registrou implicações para isolamento de dados, propôs requisitos RF-013 e RF-014 e critérios de aceitação preliminares. A IA **não** escolheu arquitetura, tecnologia ou políticas de visualização dos históricos.
- **Decisão humana:** **confirmada** — um cliente terá **uma única conta Shaverly**, válida para agendar em múltiplas barbearias; cada barbearia preserva a separação de seus dados administrativos.
- **Artefatos resultantes:** RD-006, RF-013 e RF-014, cenários preliminares e Q-007 em `docs/requirements.md`.
- **Validação:** a escolha funcional foi explicitamente confirmada pelo usuário. Os critérios de aceitação foram redigidos pela IA como propostas a revisar pelos dois desenvolvedores. Nenhum teste ou código foi executado para validar o comportamento.
- **Relação com as aulas:**
  - *Engineering Shared Understanding*, páginas 7–8 e 12: modelar comportamentos, dar nomes consistentes a conceitos diferentes e registrar o contexto em documentação compartilhada.
  - *Secure Systems Architecture*, páginas 4–5: identidade autenticada não basta para autorizar acesso aos dados de uma barbearia; a autorização deve proteger os recursos no backend.
  - *Aula 6 — The Architecture of Change*, páginas 4 e 10: preservar fronteiras de responsabilidade entre domínios e dados sem antecipar microsserviços ou segregação física de bancos.
  - *Architectural Feedback*, página 4: futuros testes devem cobrir o uso da mesma conta em barbearias diferentes e a proteção dos registros administrativos.
- **Pendências:** a forma de apresentação de históricos ao cliente; vinculação segura de registros operacionais locais e conta global; casos de números reciclados; mecanismos técnicos de autenticação e isolamento.
- **Próximo passo:** Q-007 — decidir se o cliente verá seus próprios atendimentos de diferentes barbearias reunidos ou separados por estabelecimento.

## Registro de organização de recursos e design — 21/11/2026

- **Etapa:** organização documental e dos recursos de branding.
- **Solicitação e decisão humana:** organizar as duas logos SVG e os modelos GLB; manter o bigode encaixando na logo como conceito principal selecionado; registrar a tesoura cortando a tela como animação futura em avaliação, sem aprovação para implementação.
- **Contribuição da IA:** moveu os quatro arquivos para `assets/branding/`, padronizou os nomes das logos e documentou o conceito e as pendências técnicas fornecidos pela equipe em `docs/design/landing-animation.md`.
- **Validação:** conteúdo dos quatro recursos preservado integralmente, verificado por SHA-256 antes e depois da movimentação. Os registros anteriores de uso da IA foram preservados.
- **Limitações:** não foram inspecionadas nem modificadas geometrias, materiais, texturas ou animações; separação das lâminas, orientação, escala, origem, sincronização com máscara, responsividade, desempenho e alternativa para movimento reduzido permanecem pendentes.
- **Escopo:** nenhuma animação, interface ou código de aplicação foi implementado; nenhuma dependência ou tecnologia foi adicionada. Este registro não confirma Q-007 dos requisitos.

## Registro de identidade visual — 22/11/2026

> Registro inicial: a pendência de aprovação da Inter foi resolvida na confirmação posterior registrada abaixo.

- **Etapa:** documentação da paleta e do sistema tipográfico do Shaverly.
- **Decisões humanas confirmadas:** aprovação da paleta Primary Dark (`#202734`), Secondary Dark (`#36415A`), Accent Green (`#B7D894`) e Light Green (`#E0F8C7`); escolha da Paytone One como fonte principal; manutenção da Inter como candidata à fonte secundária, sem aprovação oficial.
- **Contribuições da IA:** sugestões de distribuição e aplicação das cores; análise da combinação entre a presença visual da Paytone One e a neutralidade e legibilidade da Inter; recomendação da Inter para textos e interfaces; organização e formalização das diretrizes nos documentos de design.
- **Separação entre decisão e sugestão:** a paleta e a fonte principal estão aprovadas. A Inter permanece recomendada, e os exemplos de aplicação não fixam regras definitivas por componente. Novas cores oficiais exigem aprovação da equipe.
- **Artefatos resultantes:** [visão geral da identidade visual](design/brand-guidelines.md), [paleta de cores](design/colors.md) e [sistema tipográfico](design/typography.md). O [registro de animações](design/landing-animation.md) permanece preservado e referenciado.
- **Relação com as aulas:**
  - *Engineering Shared Understanding*: comunicação clara e registro de decisões compartilhadas, distinguindo aprovação humana, recomendação e pendência.
  - *Designing for Evolution*: escolhas visuais consistentes, com responsabilidades documentais separadas para facilitar refinamentos e evolução futura.
  - *Software as a Product*: construção de uma identidade orientada à experiência do usuário, equilibrando personalidade da marca e legibilidade nas tarefas do produto.
- **Limitações e pendências:** aprovação da fonte secundária; refinamento de aplicações por componente e da escala tipográfica; avaliação de legibilidade e contraste em futuras interfaces. Os conceitos e as pendências técnicas de animação continuam com os estados anteriormente registrados.
- **Escopo:** trabalho exclusivamente documental. Nenhum código de aplicação, componente ou frontend foi gerado; nenhuma fonte ou dependência foi instalada; SVGs, modelos 3D e requisitos funcionais foram preservados; nenhuma stack foi definida e nenhum commit foi criado.

## Aprovação da fonte secundária Inter — 22/11/2026

- **Decisão humana confirmada:** a equipe aprovou a Inter como fonte secundária do Shaverly. Esta confirmação resolve a pendência do registro inicial de identidade visual; Paytone One permanece como fonte principal aprovada.
- **Contribuição da IA:** atualização do status em [tipografia](design/typography.md) e nas [diretrizes da marca](design/brand-guidelines.md), preservando o histórico da recomendação e da decisão humana.
- **Pendências:** refinamento das aplicações por componente e da escala tipográfica; avaliação de legibilidade e contraste em futuras interfaces.
- **Escopo:** atualização exclusivamente documental, sem geração de código, instalação de fontes ou dependências, alteração de recursos visuais ou criação de commits.

## Protótipo visual da landing page V0.1 — 22/11/2026

- **Solicitação humana:** criar exclusivamente um protótipo visual estático, navegável e responsivo em `prototypes/landing-page/`, executável ao abrir `index.html`, com HTML/CSS e sem decisões tecnológicas definitivas.
- **Decisões preservadas:** paleta oficial, Paytone One principal, Inter secundária, SVGs oficiais e conceito do bigode 3D. Nenhuma alteração nos requisitos funcionais, backend, SVGs ou modelos GLB.
- **Contribuição da IA:** composição do hero, cards de funcionalidades, agenda ilustrativa e CTA final; organização dos estilos, acessibilidade básica, adaptação responsiva e inclusão local das fontes com suas licenças. As skills `frontend-design` e `web-design-guidelines` orientaram a composição e a revisão de interface.
- **Limites:** dados da agenda explicitamente fictícios; CTAs navegam somente entre seções. Sem JavaScript, frameworks, bundlers, dependências de aplicação, APIs, autenticação, cadastro ou pagamento. HTML/CSS são recursos descartáveis de prototipação, não uma stack definitiva nem uma decisão arquitetural.
- **Preparação futura:** palco estático e referência ao SVG no hero para integração posterior. Nenhum carregamento de GLB, animação de encaixe, revelação, tesoura, Three.js ou GSAP foi implementado ou simulado.
- **Verificação:** abertura direta em Chromium com rede desabilitada; fontes e logos carregadas; nenhum erro de execução/carregamento; larguras entre 320 e 1440 px sem transbordamento horizontal da página; âncoras, CTA e foco inicial de teclado conferidos; pares de cores de texto com contraste mínimo de 6,44:1. Capturas desktop/mobile inspecionadas visualmente. Testes em outros navegadores e com leitores de tela permanecem pendentes.
- **Relação com as aulas:** *Engineering Shared Understanding*: artefato visual explícito para revisão compartilhada; *Designing for Evolution*: isolamento do protótipo para descarte ou reimplementação; *Software as a Product*: validação incremental da apresentação e da experiência antes da integração 3D.

## Protótipo V0.2 — abertura 3D do bigode — 22/11/2026

- **Solicitação e autorização humanas:** evoluir a V0.1 com abertura 3D centralizada, transformação vinculada ao scroll, encaixe na região do bigode do SVG e revelação progressiva do hero. Three.js, GSAP e ScrollTrigger foram autorizados exclusivamente para este protótipo, sem decisão de arquitetura definitiva.
- **Contribuição da IA:** inspeção binária do GLB e dos subcaminhos do SVG; medição dos limites; normalização do modelo; iluminação e ajuste da cor em memória para legibilidade; cálculo responsivo da posição do recorte; timeline reversível, transição para a silhueta oficial, foco e alternativas estáticas. Foram utilizadas as skills `threejs-gltf-loading`, `threejs-materials-lighting`, `gsap-timeline` e `gsap-scrolltrigger`.
- **Fatos medidos:** GLB de 83.760 bytes, uma malha, sem texturas ou animações; recorte do SVG em `x=703`, `y=337`, `largura=201`, `altura=63`, validado em execução. A proporção do modelo difere da silhueta; não foi aplicada deformação para tentar igualá-los.
- **Implementação experimental:** Three.js `0.180.0` e GSAP/ScrollTrigger `3.13.0` via CDN, com JavaScript puro e sem instalação de dependências ou build. A renderização ocorre sob demanda, com DPR limitado, sem loop ocioso contínuo, pós-processamento ou sombras.
- **Validação:** sintaxe JavaScript; carga real via HTTP; capturas desktop, tablet e smartphone nos estados inicial, intermediários e final; scroll reverso; redimensionamento e orientação; ausência de transbordamento horizontal entre 320 e 1440 px; navegação do CTA; pular abertura com teclado e foco no título. Foi corrigida a sincronização de `inert` após refresh do pin, preservando acesso aos controles revelados.
- **Alternativas verificadas:** movimento reduzido na carga e alterado durante a abertura; GLB e CDN bloqueados; WebGL indisponível e perda de contexto; JavaScript desativado; abertura por arquivo. O conteúdo estático permanece acessível, com limpeza de canvas/pin e diagnóstico para falhas. Nenhuma exceção não tratada foi identificada na bateria de verificações em Chromium.
- **Limitações e sugestões para V0.3:** revisar a sensação temporal do crossfade e iluminação com a equipe; testar em Safari/iOS, leitores de tela e hardware móvel real; medir fluidez e GPU. As capturas verificam o alinhamento visual observado, sem afirmar coincidência geométrica perfeita entre GLB e SVG ou desempenho validado em todos os dispositivos.
- **Artefatos:** [protótipo e instruções](../prototypes/landing-page/README.md), [registro de animação](design/landing-animation.md) e README principal. A landing V0.1 foi preservada nas funcionalidades, agenda ilustrativa e CTA final; somente sua abertura e composição associada foram evoluídas.
- **Escopo preservado:** sem tesoura, navalha, barber pole, backend, autenticação, dados persistidos ou APIs de produto. SVGs e GLBs originais, requisitos funcionais e código da aplicação não foram modificados. Sem ADR de stack ou commits automáticos.
- **Relação com as aulas:** *Engineering Shared Understanding*: medidas, limites e estados verificáveis tornam o conceito compartilhável; *Designing for Evolution*: melhoria progressiva e isolamento permitem evolução ou descarte; *Software as a Product*: revisão incremental da experiência antes de consolidar escolhas do produto.

## Refinamento do hero — logo centralizada e slogan — 22/11/2026

- **Solicitação humana:** apresentar no hero apenas a logo centralizada e um slogan abaixo dela.
- **Contribuição da IA:** reutilização de “Seu negócio no ritmo certo.” como slogan; composição centralizada com SVG oficial; remoção dos elementos secundários do hero e deslocamento da navegação para depois da primeira tela. A timeline foi simplificada para revelar o slogan após a transição do bigode, com fundo uniforme Primary Dark e destino responsivo.
- **Validação:** capturas desktop e smartphone, estados intermediários do encaixe, scroll reverso, tablet e largura mínima de 320 px sem transbordamento horizontal; movimento reduzido, falhas de GLB/CDN/WebGL e abertura por arquivo mantêm o novo hero estático. Nenhuma exceção não tratada foi observada na bateria em Chromium. O conteúdo das funcionalidades, demonstração e CTA final foi preservado integralmente.
- **Escopo:** sem alterações nos SVGs, GLBs, requisitos ou código de aplicação; sem dependências adicionais, stack definitiva ou commits. As limitações de revisão em dispositivos físicos da V0.2 permanecem registradas.

## Landing page V0.3 — polimento visual, movimento e experiência — 22/11/2026

- **Solicitação humana:** refinar o protótipo existente, priorizando execução da abertura, responsividade, acessibilidade e desempenho, sem novas funcionalidades ou decisão de arquitetura definitiva. Preservado o hero com logo centralizada e apenas o slogan, conforme orientação anterior.
- **Inspeção e problemas identificados:** documentação e código lidos; V0.2 executada em Chromium antes das alterações. Observados iluminação muito clara e volume pouco marcado, permanência do modelo verde durante o encaixe, reordenação visual da navegação mobile e redimensionamentos redundantes do buffer. O tratamento de saída durante carregamento também precisava cobrir a cena ainda não inicializada.
- **Contribuição da IA:** refinamento experimental das luzes/orientação; escala uniforme por razão exponencial; `scrub: true`; pin de 1,5 alturas; cor em memória transicionando para Primary Dark e sobreposição 3D/2D mais curta. Mantidos recorte medido, SVG original e geometria do GLB. Foram usadas as skills de Three.js, GSAP, frontend-design e web-design-guidelines disponíveis no projeto.
- **Interface e acessibilidade:** navegação visual alinhada ao DOM; alvos de toque de 44 px; estados discretos de hover/pressão e foco; contorno do botão em Accent Green; texto dos cards em 16 px; coluna de horários fixa na rolagem da agenda. Cards informativos não ganharam movimento que simule ação de clique. Paleta e famílias tipográficas aprovadas foram preservadas.
- **Recursos e desempenho:** renderização sob demanda, DPR de até 1,25 para toque/1,5 para os demais casos, buffer atualizado apenas quando necessário, observador ignorando notificações sem mudança real, limpeza desde o carregamento e resultados tardios sem reativar a cena. Nenhum arquivo derivado do GLB ou dependência adicional foi criado.
- **Verificação e evidência:** novo teste de navegador sem pacotes externos em `prototypes/landing-page/tests/browser-checks.mjs`; sete tamanhos de 320 a 1920 px, carga, alinhamento, reversão, orientação, teclado, botões, âncoras e tabela passaram. Movimento reduzido, bloqueios de GLB/CDN, falta/perda de WebGL, erro de renderização, cancelamento e watchdog de carga travada preservaram o conteúdo estático. Nenhuma exceção não tratada na bateria final. Capturas de transição e páginas completas desktop/mobile foram inspecionadas.
- **Indicadores e limites:** CLS local observado igual a 0; LCP reportado entre 1.116 e 1.596 ms nas sete navegações automatizadas, sujeito a cache, rolagem programática, capturas e WebGL por software. Canvas não é uma imagem comum para LCP. Esses dados não demonstram desempenho de produção, melhoria percentual ou FPS/INP em hardware físico. Repouso foi medido após estabilização dos recálculos iniciais, sem confundir frame de inicialização com loop ocioso.
- **Artefatos:** [relatório da V0.3](design/landing-v03-review.md), [instruções e testes](../prototypes/landing-page/README.md), registro de animação e README principal atualizados. Todos os registros anteriores de IA foram preservados.
- **Pendências:** sensação temporal e iluminação em dispositivos físicos, Safari/iOS, auditoria com leitores de tela e métricas em hardware representativo. A diferença de silhueta GLB/SVG permanece documentada; não se afirma encaixe geométrico perfeito.
- **Relação com as aulas:** *Engineering Shared Understanding*: distinguir observações, ajustes e resultados verificáveis; *Designing for Evolution*: aperfeiçoar o protótipo isolado e sua recuperação de falhas; *Software as a Product*: revisão incremental da experiência antes de consolidar decisões. Sem backend, requisitos alterados, nova identidade, ADR de stack ou commits automáticos.

## Interação por ponteiro e orientação de scroll — 22/11/2026

- **Decisão humana:** executar o planejamento de rotação inicial, iluminação interativa e aviso após 30 segundos. Após esclarecer limites e a alternativa de arraste, o usuário escolheu atualizar o plano para rotação acumulada nos três eixos seguindo o ponteiro, sem pressionar botões, incluindo visão das costas do bigode.
- **Contribuição da IA:** grupo interativo com quaternions separado do grupo de scroll; mapeamento horizontal/vertical/angular, suavização temporal e limite por incremento; captura da pose exibida ao iniciar scroll e neutralização nos primeiros 12% da timeline. A luz principal existente acompanha discretamente o ponteiro. Sem alterações na geometria ou nos recursos oficiais.
- **Aviso:** controlador independente da cena, com 30 segundos de tempo visível no topo após a apresentação estar pronta. Movimento do mouse não reinicia a contagem; aba oculta pausa; sair antes do prazo reinicia. Após aparecer, é ocultado ao rolar e não se repete na visita/documento. Não intercepta o ponteiro ou foco; região de status educada e movimento reduzido preservados.
- **Verificação:** nova bateria nativa de navegador em `tests/pointer-checks.mjs`: visão traseira sem botões, giros nos três eixos, luz, início de scroll durante suavização, encaixe após rotação, reversão, retorno ao topo, toque e movimento reduzido. O aviso foi validado com espera real de 30 segundos; pausa de visibilidade e relógio reduzido foram simulados separadamente. Capturas do verso, transição e aviso inspecionadas; nenhuma exceção não tratada nessa bateria. A regressão geral também passou nas sete larguras entre 320 e 1920 px, com navegação e alternativas de falha preservadas.
- **Ajustes de verificação:** o teste de carga geral passou a aguardar o estado esperado de falha de renderização, que pode ocorrer no frame posterior ao estado `ready`; as consultas de navegação toleram o documento ainda não criado. Scripts de simulação são removidos mesmo se uma asserção falhar. Esses casos são sincronização da automação, não defeitos atribuídos à landing.
- **Artefatos e limites:** [planejamento atualizado](design/pointer-interaction.md), instruções do protótipo e registro de animação. Validação em Chromium/WebGL por software; sensibilidade em dispositivos físicos, Safari/iOS e leitores de tela reais permanecem pendentes. Sem dependências adicionais, requisitos alterados, mudança de identidade, arquitetura definitiva ou commits automáticos.

## Nova paleta oficial — 27/11/2026

- **Decisão humana:** adotar a opção 4B · Linho, oliva e café como paleta do projeto, substituindo a de 22/11/2026. A escolha partiu da preferência pelo verde oliva, com pedidos de um tom branco, de um marrom mais escuro no bigode e de uma agenda branca para facilitar a leitura.
- **Contribuição da IA:** propostas das variações 4A, 4B e 4C no protótipo; separação da cor do bigode; painel branco da agenda na 4B; atualização da [documentação da paleta](design/colors.md).
- **Verificação e limites:** variações inspecionadas por capturas em desktop. A agenda branca não foi revisada em mobile nem submetida novamente às baterias de teste. A bateria geral falha no teste de teclado porque não considera o seletor de paleta. Permanece pendente uma versão oficial da logo para fundo claro.

## Cores operacionais e paleta fixa no protótipo — 27/11/2026

- **Decisão humana:** fixar o protótipo na paleta oficial e definir cores de status, prioridade e demais usos operacionais para dashboards.
- **Contribuição da IA:** remoção do seletor e das paletas de comparação; tokens em [`tokens.css`](design/tokens.css); [cores operacionais](design/operational-colors.md) e mostruário. Os nomes de status de agendamento e de prioridade são propostas ainda não validadas pela equipe.
- **Verificação e limites:** cores categóricas e sequenciais verificadas por script e contraste calculado para as semânticas; divergente sem validação automática e sem tema escuro. Com a paleta fixa, as baterias geral e de ponteiro passaram em Chromium, incluindo o teste de teclado, e a agenda mobile foi inspecionada por captura.
