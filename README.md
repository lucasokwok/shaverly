# Shaverly

Plataforma de gestão para barbearias, voltada ao gerenciamento de agendamentos, clientes e profissionais.

O projeto acadêmico está em fase inicial de levantamento de requisitos. Tecnologias e arquitetura ainda não foram definidas.

## Integrantes

- Lucas de Oliveira Kwok — RA 163939
- João Pedro Andrade Carneiro — RA 168806

## Documentação

- [Requisitos e decisões de produto](docs/requirements.md)
- [Registros de uso da IA e relações com as aulas](docs/ai-usage.md)
- [Contexto e termos do domínio](CONTEXT.md)

Em `docs/`, as pastas `architecture/` e `adr/` estão reservadas para futuros documentos de arquitetura e registros de decisões arquiteturais. As decisões de produto confirmadas vão até RD-006; Q-007 permanece em aberto.

## Protótipo visual da landing page — V0.3

Na raiz do repositório, execute `python3 -m http.server 8000 --bind 127.0.0.1` e abra <http://127.0.0.1:8000/prototypes/landing-page/> para testar a abertura 3D. Não é necessário instalar dependências ou executar build. A abertura usa Three.js e GSAP/ScrollTrigger por CDN, em versões fixadas; abrir o arquivo diretamente mantém a versão estática acessível.

O protótipo utiliza HTML, CSS e JavaScript exclusivamente para validar composição, identidade visual, responsividade e a transição do bigode 3D para o SVG oficial. Não representa uma escolha de stack ou arquitetura para o produto definitivo. Veja as [instruções, verificações e limitações](prototypes/landing-page/README.md).
