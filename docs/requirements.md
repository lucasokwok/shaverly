# Shaverly — Descoberta de requisitos

> Documento vivo. Decisões confirmadas são separadas de hipóteses e questões em aberto.
> Atualizado em 19/11/2026.

## Visão do produto (fornecida pela equipe)

Shaverly é uma plataforma de gestão para barbearias com visão de gerenciamento de agendamentos, clientes e profissionais, assinaturas, pagamentos e lembretes por WhatsApp.

**Atenção:** os elementos da visão não estão automaticamente aprovados para o MVP.

## RD-001 — Quem pode criar agendamentos?

- **Status:** confirmado pela equipe em conversa.
- **Decisão:** tanto clientes quanto a barbearia poderão criar agendamentos.
- **Requisito funcional RF-001:** o sistema deverá permitir a criação de agendamentos por clientes e por usuários autorizados da barbearia.
- **Implicações a explorar:** identificação do cliente, permissões por perfil, regras de disponibilidade e origem do agendamento. A frase “usuários autorizados” não define ainda quais papéis poderão executar a operação.
- **Ainda não definido:** como os clientes se autenticam ou se identificam; quem pode alterar/cancelar agendamentos; como a barbearia seleciona o cliente; quais restrições de horários são aplicadas.
- **Critérios de aceitação:** pendentes até que os fluxos e regras sejam esclarecidos.

## RD-002 — Identificação do cliente conforme a origem do agendamento

- **Status:** confirmado pela equipe em conversa.
- **Decisão:** no autoagendamento, o cliente precisa criar uma conta Shaverly. Quando um usuário autorizado da barbearia cria um agendamento em nome de um cliente, pode (a) selecionar um cliente já cadastrado ou (b) informar nome completo e telefone, sem exigir que esse cliente crie uma conta para esse agendamento.
- **RF-002:** para criar um agendamento por conta própria, o cliente deverá possuir uma conta Shaverly.
- **RF-003:** usuários autorizados da barbearia deverão poder criar agendamentos vinculando um cliente já cadastrado.
- **RF-004:** usuários autorizados da barbearia deverão poder criar agendamentos informando nome completo e telefone do cliente, mesmo sem selecionar uma conta existente.
- **Observação de escopo:** a equipe ainda não definiu quais perfis internos são autorizados a agendar. O fluxo de cadastro/login ainda não foi especificado.

### Critérios de aceitação preliminares

1. **Dado** um usuário sem conta Shaverly, **quando** tentar agendar por conta própria, **então** o sistema não permitirá concluir o agendamento sem a criação de uma conta.
2. **Dado** um usuário autorizado da barbearia e um cliente cadastrado, **quando** criar um agendamento selecionando esse cliente, **então** o agendamento poderá utilizar esse cadastro.
3. **Dado** um usuário autorizado da barbearia, **quando** criar um agendamento sem selecionar um cliente cadastrado, **então** poderá informar o nome completo e o telefone do cliente para o agendamento.

> Os cenários descrevem apenas o comportamento já confirmado. Ainda faltam regras de validação dos dados, persistência, disponibilidade e permissões específicas.

## RD-003 — Cadastro de cliente, telefone obrigatório e histórico recuperável

- **Status:** confirmado pela equipe em conversa de 19/11/2026.
- **Decisão humana:** **nome completo e telefone serão dados obrigatórios de identificação de clientes em todos os fluxos**. Quando a barbearia registra um agendamento para uma pessoa ainda não cadastrada, o Shaverly mantém um **cadastro de cliente sem conta de acesso**. O histórico de serviços efetivamente realizados deve ser associado ao cadastro desse cliente. Se essa pessoa criar posteriormente uma conta no Shaverly com o mesmo telefone, a experiência pretendida é que consiga acessar seu histórico anterior, mesmo quando os agendamentos foram registrados por funcionários.
- **Distinção de domínio:** **cadastro de cliente** = registro operacional e histórico de atendimentos; **conta de acesso** = identidade autenticável para entrar no Shaverly. Um cadastro pode existir sem conta de acesso.
- **RF-005:** exigir nome completo e telefone na identificação/cadastro de cliente, seja no autoagendamento ou nos agendamentos registrados pela barbearia.
- **RF-006:** quando o funcionário cria agendamento para cliente ainda não cadastrado, manter cadastro reutilizável desse cliente sem exigir conta de acesso.
- **RF-007:** associar ao cadastro do cliente os serviços efetivamente realizados, permitindo histórico anterior à criação da conta de acesso.
- **RF-008:** possibilitar, após a criação de uma conta correspondente, o acesso ao histórico desse cliente anteriormente lançado por funcionários; o telefone coincidente é o elo informado pela equipe, mas a **verificação da posse do telefone antes da associação e visualização do histórico foi confirmada na RD-004**; as demais permissões e o processo de vinculação ainda precisam ser detalhados.

### Critérios de aceitação preliminares

1. **Dado** um agendamento criado por uma conta autorizada da barbearia para uma pessoa sem conta, **quando** forem informados nome completo e telefone, **então** o sistema mantém um cadastro de cliente reutilizável, associado ao agendamento.
2. **Dado** um cliente com cadastro criado por funcionário, **quando** um serviço for concluído e registrado, **então** o atendimento passa a compor o histórico desse cliente.
3. **Dado** um cliente com histórico anterior criado pela barbearia, **quando** posteriormente criar uma conta com o mesmo telefone e for validada a associação com o cadastro preexistente, **então** poderá consultar o histórico que lhe pertence.
4. **Dado** um fluxo de identificação de cliente, **quando** faltar nome completo ou telefone, **então** não poderá ser concluído com os dados incompletos.

> **Ponto de segurança levantado pela IA e confirmado pela equipe na RD-004:** coincidência de telefone, isoladamente, não autoriza visualizar histórico. A posse do número deve ser confirmada por código via SMS ou WhatsApp antes da vinculação. Continuam em aberto: telefone duplicado, alteração/reutilização de números, detalhes do processo e alcance do histórico entre barbearias distintas.

## RD-004 — Verificação de telefone antes de vincular histórico prévio

- **Status:** confirmado pela equipe em 19/11/2026.
- **Decisão humana:** quando o cliente cria uma conta com um telefone associado a atendimentos registrados anteriormente pela barbearia, o Shaverly **deverá comprovar a posse do número por um código enviado via SMS ou WhatsApp antes de vincular e exibir o histórico**.
- **RF-009:** enviar um código de verificação ao telefone informado, por SMS ou WhatsApp, no fluxo de vinculação do histórico preexistente.
- **RF-010:** exigir verificação bem-sucedida do código antes de associar à conta os registros preexistentes vinculados ao número e antes de disponibilizá-los para consulta.
- **Regra de segurança:** igualdade de telefone **não basta** para conceder acesso. O backend deve impedir a consulta ao histórico anterior enquanto a comprovação do telefone estiver pendente ou falhar.
- **Distinção importante:** confirmar a posse atual do número é uma medida necessária decidida pela equipe, mas **não é, isoladamente, prova absoluta de que a pessoa realizou todos os atendimentos antigos** (por exemplo, um número pode ter sido reciclado). A política para esses casos continua em aberto.
- **Não definido:** escolha definitiva entre SMS, WhatsApp ou ambos; provedor; expiração, tentativas e reenvio de códigos; tratamento de números duplicados, reciclados ou alterados; requisitos de autenticação da conta além da verificação; se o histórico será visível entre barbearias diferentes. Não inventar essas regras na implementação.

### Critérios de aceitação preliminares — RD-004

1. **Dado** um cadastro de cliente com serviços anteriores e o mesmo telefone informado na criação de uma conta, **quando** o titular ainda não tiver confirmado o código, **então** o sistema não deve vincular nem permitir consultar o histórico prévio dessa pessoa.
2. **Dado** um código válido entregue ao telefone informado, **quando** o cliente confirmá-lo com sucesso e não houver outro impedimento de vinculação, **então** o sistema poderá associar a conta ao cadastro correspondente e disponibilizar o histórico autorizado.
3. **Dado** um código incorreto ou uma verificação malsucedida, **quando** houver tentativa de vinculação ou consulta, **então** o histórico anterior deve permanecer inacessível.

> Cenários preliminares: antes da implementação, definir como tratar números duplicados, reciclados e dados de diferentes barbearias. A redação de RF-009 e RF-010 foi elaborada pela IA a partir da decisão humana e deve ser revisada pela equipe.

## RD-005 — Plataforma para múltiplas barbearias independentes

- **Status:** confirmado pela equipe em 19/11/2026.
- **Decisão humana:** o Shaverly será uma plataforma para **várias barbearias independentes**. Cada barbearia terá seus **próprios profissionais, serviços, agendamentos e registros de clientes**.
- **RF-011:** permitir o gerenciamento de múltiplas barbearias independentes na plataforma.
- **RF-012:** associar profissionais, serviços, agendamentos e registros de clientes à respectiva barbearia, mantendo os dados de gestão de cada estabelecimento separados.
- **Requisito de proteção de dados derivado pela IA (a validar formalmente):** operações administrativas de uma barbearia não devem conceder acesso aos registros de outra barbearia sem uma regra de autorização explícita. A separação deve ser imposta pelo backend, não só pela interface.
- **Implicação para RD-003 e RD-004:** o mesmo número de telefone pode aparecer em cadastros operacionais de barbearias diferentes. A vinculação de conta e histórico deve respeitar a origem dos registros e as permissões; confirmação de posse de telefone não concede por si só permissão administrativa entre barbearias.
- **Resolvido na RD-006:** o cliente terá **uma conta única global**, reutilizável em várias barbearias. **Ainda não definido:** como apresentar ao próprio cliente os históricos de várias barbearias; administração de unidades/filiais; regras de compartilhamento de dados; modelo físico de isolamento e tecnologia de persistência.

### Critérios de aceitação preliminares — RD-005

1. **Dadas** duas barbearias independentes cadastradas no Shaverly, **quando** cada uma registrar profissionais, serviços, clientes e agendamentos, **então** esses registros devem permanecer associados à respectiva barbearia.
2. **Dado** um usuário administrativo autorizado apenas na Barbearia A, **quando** tentar consultar ou alterar registros privados da Barbearia B, **então** o backend deverá negar acesso, salvo autorização explicitamente definida. *(Critério de segurança proposto pela IA, sujeito à validação humana.)*
3. **Dado** um telefone encontrado em cadastros de mais de uma barbearia, **quando** uma conta buscar vinculação de histórico, **então** o sistema não poderá presumir que os registros administrativos de todas as barbearias são intercambiáveis. *(A forma exata de consulta pelo próprio cliente ainda será decidida.)*

> A equipe decidiu a **separação de negócio** entre estabelecimentos; não foram escolhidos microserviços, bancos separados, schemas separados ou uma arquitetura técnica específica.

## RD-006 — Conta única de cliente para toda a plataforma

- **Status:** confirmado pela equipe em 19/11/2026.
- **Decisão humana:** cada cliente terá **uma conta única Shaverly**, com a qual poderá se autenticar e agendar em **diferentes barbearias** da plataforma. A conta global **não altera** a separação dos dados administrativos dos estabelecimentos, estabelecida na RD-005.
- **RF-013:** permitir que um cliente utilize uma única conta de acesso no Shaverly, independentemente da barbearia em que desejar agendar.
- **RF-014:** permitir que uma conta autenticada de cliente crie agendamentos em diferentes barbearias, respeitando as regras de cada estabelecimento e sem exigir nova conta para cada barbearia.
- **Modelo conceitual inicial (proposto pela IA, ainda sujeito à revisão técnica):** *conta Shaverly* é a identidade de acesso global do cliente; *cadastro de cliente da barbearia* é o registro operacional local, ao qual se associam agendamentos e serviços. A relação entre esses conceitos e as regras de vinculação ainda precisam ser especificadas antes da implementação.
- **Restrição de segurança preexistente (RD-004 e RD-005):** a existência de uma conta global não concede a funcionários de uma barbearia acesso aos dados privados de outras barbearias. Para mostrar históricos preexistentes ao titular, continuam válidas as exigências de verificação do telefone e autorização.
- **Ainda não definido:** como organizar e exibir ao cliente os históricos e agendamentos de diferentes barbearias; se haverá uma visão consolidada; como vincular registros antigos de várias barbearias sem expor dados alheios; regras de telefones reciclados/duplicados; implementação de autenticação e persistência.

### Critérios de aceitação preliminares — RD-006

1. **Dado** um cliente com conta Shaverly e agendamento na Barbearia A, **quando** desejar marcar um serviço na Barbearia B, **então** poderá utilizar a mesma conta, sem criar outra conta de acesso.
2. **Dado** um cliente autenticado, **quando** realizar agendamentos em barbearias diferentes, **então** cada agendamento deverá permanecer associado à barbearia onde foi criado.
3. **Dado** um funcionário autorizado apenas na Barbearia A, **quando** tentar obter dados internos da Barbearia B por conhecer a identidade global de um cliente, **então** não deverá receber acesso por esse motivo. *(Critério de segurança elaborado pela IA para validação humana; consistente com RD-005.)*

> **Não é uma decisão arquitetural:** este registro não escolhe banco de dados único/separado, esquema multi-tenant, microsserviços, provedor de autenticação ou mecanismos de login. Tais decisões devem ser justificadas somente quando houver informação suficiente.

## Pergunta de descoberta pendente — Q-007

**Na conta única do cliente, seus próprios agendamentos e históricos de atendimentos de diferentes barbearias deverão aparecer em uma visão consolidada ou separados por barbearia?**

**Status:** aberto; é uma decisão de experiência e permissão de visualização do **próprio cliente**, não uma autorização para compartilhar cadastros administrativos entre estabelecimentos.

## Referências às aulas

- **Aula 3 — Beyond the Code Factory:** requisitos são comportamentos observáveis, não tarefas de implementação; backlog e cortes verticais devem derivar desses comportamentos (páginas 2, 4 e 5).
- **Engineering Shared Understanding:** descoberta é diferente de especificação; histórias de usuário iniciam conversas e critérios de aceitação eliminam ambiguidades (páginas 3, 5 e 6).
- **Secure Systems Architecture:** autenticação e autorização são preocupações diferentes; permissões devem ser verificadas no backend (página 5). Essa distinção fundamenta a necessidade de esclarecer quem é autorizado a agendar, sem antecipar a implementação.

- **Engineering Shared Understanding:** modelagem do domínio e linguagem ubíqua (páginas 7 e 8); critérios de aceitação verificáveis (página 6). Nesta decisão, “cadastro de cliente” e “conta de acesso” são conceitos diferentes.
- **Secure Systems Architecture:** autenticação, autorização e verificação de propriedade do recurso (páginas 4 e 5). A validação do telefone antes da associação foi proposta pela IA e **confirmada na RD-004**.
- **Architectural Feedback:** testes orientados a comportamento e proteção contra regressões (página 4). Os cenários de associação de histórico devem se tornar testes quando o fluxo for especificado.

- **Secure Systems Architecture**, páginas 4 e 5: verificações de autorização e propriedade do recurso; associar telefone sem comprovar posse criaria risco de exposição de histórico.
- **Engineering Shared Understanding**, páginas 5, 6 e 11: transformar ambiguidades em cenários verificáveis; a IA propôs a pergunta, a equipe decidiu.
- **Architectural Feedback**, página 4: testes de comportamento, incluindo impedir consulta antes da confirmação e após código inválido.

- **Engineering Shared Understanding**, páginas 7–8 e 11–12: definir o significado de “barbearia”, “cliente”, “cadastro de cliente” e “conta de acesso” antes de modelar a solução; registrar contexto e ambiguidades para a IA.
- **Aula 6 — The Architecture of Change**, páginas 4 e 10: as fronteiras de domínio e a propriedade dos dados devem ser explícitas; os detalhes de implementação ainda não estão escolhidos.
- **Secure Systems Architecture**, páginas 4–5: controle de acesso e verificação de propriedade dos recursos no backend, protegendo informações entre estabelecimentos.
- **Aula 1 — Software as a Product**, páginas 9 e 12: manter a decisão de produto incremental e não antecipar complexidade arquitetural sem necessidade demonstrada.

- **RD-006 — Engineering Shared Understanding**, páginas 7–8 e 12: conta de acesso global e cadastro operacional por estabelecimento são conceitos distintos da linguagem do domínio; a IA deve preservar essa distinção ao gerar código.
- **RD-006 — Secure Systems Architecture**, páginas 4–5: autenticação global não substitui autorização por recurso e estabelecimento; validação deve ocorrer no backend.
- **RD-006 — Aula 6 — The Architecture of Change**, páginas 4 e 10: definir fronteiras de responsabilidade e de dados antes da organização tecnológica.
- **RD-006 — Architectural Feedback**, página 4: testes orientados a comportamento verificam reutilização da conta e isolamento dos dados sem testar detalhes da implementação.
