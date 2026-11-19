# Contexto do Shaverly

O Shaverly é uma plataforma de gestão de agendamentos, clientes e profissionais para múltiplas barbearias independentes. O projeto está em levantamento de requisitos, sem definição de tecnologias ou arquitetura.

## Termos confirmados

- **Cliente:** pessoa para quem são registrados agendamentos e atendimentos. Nome completo e telefone são obrigatórios na sua identificação.
- **Cadastro de cliente:** registro operacional mantido pela barbearia, ao qual se associa o histórico de serviços efetivamente realizados. Pode existir sem conta de acesso.
- **Conta de Acesso:** conta única Shaverly do cliente, reutilizável para se autenticar e agendar em diferentes barbearias. É exigida para o autoagendamento.
- **Barbearia:** estabelecimento independente, com seus próprios profissionais, serviços, agendamentos e registros de clientes. A conta global do cliente não elimina essa separação.
- **Agendamento:** marcação criada pelo próprio cliente ou por um usuário autorizado da barbearia. A barbearia pode selecionar um cliente cadastrado ou informar nome completo e telefone, mantendo um cadastro reutilizável sem exigir conta de acesso do cliente.

A vinculação e a visualização de histórico anterior exigem comprovação da posse do telefone por código via SMS ou WhatsApp, conforme RD-004. As demais regras de vinculação e autorização ainda precisam ser detalhadas.

## Referências e limites

Os [requisitos](docs/requirements.md) preservam as decisões confirmadas RD-001 a RD-006, propostas da IA e critérios preliminares com seus respectivos estados de validação. Os registros devem ser lidos em sequência: decisões posteriores esclarecem pendências dos registros anteriores.

Q-007 permanece em aberto: ainda não foi decidido se o cliente verá seus próprios agendamentos e históricos reunidos ou separados por barbearia. Assinaturas, pagamentos e lembretes por WhatsApp fazem parte da visão futura, sem aprovação automática para o MVP.

As contribuições da IA, decisões humanas e relações com as aulas estão em [docs/ai-usage.md](docs/ai-usage.md). Não há decisões arquiteturais registradas nesta organização inicial.
