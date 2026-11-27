# Shaverly — Paleta de cores

> Status: paleta oficial do projeto, definida em 27/11/2026 a partir da opção **4B · Linho, oliva e café** do protótipo. Substitui a paleta azul e verde registrada em 22/11/2026.

## Cores oficiais

| Nome | HEX | Função |
|---|---|---|
| Linho | `#F6F2E7` | Fundo principal e texto sobre oliva. |
| Oliva Escuro | `#333D1F` | Textos sobre Linho e fundo de seções escuras. |
| Oliva Ação | `#55602F` | Botões principais, itens selecionados, textos de destaque e marcação dos agendamentos. |
| Oliva Médio | `#66713F` | Superfícies secundárias e bordas. |
| Oliva Claro | `#7D8750` | Ícones, contornos e foco. Não usar em texto pequeno. |
| Café | `#3B2213` | Marrom do bigode 3D. |
| Branco | `#FFFFFF` | Fundo da agenda e de áreas operacionais. |

Não adicionar novas cores à paleta oficial sem aprovação da equipe.

## Áreas operacionais

Em agendas, tabelas e outras telas de trabalho, a legibilidade vem primeiro: fundo Branco, linhas neutras e um único estilo de agendamento. Cor serve para orientar a leitura, como no item selecionado e na faixa lateral do agendamento, e não para decorar.

| Neutro de apoio | HEX | Uso na agenda |
|---|---|---|
| Texto | `#252A1B` | Texto principal. |
| Texto secundário | `#5C6152` | Horários, legendas e horários livres. |
| Borda | `#DADCD2` | Contorno do painel. |
| Linha | `#E3E4DD` | Divisões da grade. |
| Superfície de agendamento | `#F4F5EF` | Fundo dos agendamentos. |
| Superfície de avatar | `#ECEEE3` | Fundo das iniciais. |

## Aplicação na landing page

- Hero e funcionalidades com fundo Linho e textos em Oliva Escuro.
- Seção da agenda com fundo Oliva Escuro e painel Branco. Textos de apoio sobre esse fundo usam `#E4E1CC`.
- CTAs em Oliva Ação com texto Linho.

A implementação de referência está em [`styles.css`](../../prototypes/landing-page/styles.css). As cores das luzes da cena 3D são ajustes de renderização e não integram a paleta.

## Limites e referências

Estados, prioridades e gráficos seguem as [cores operacionais](operational-colors.md). Não foi definida uma variação oficial da logo para fundo claro. O protótipo escurece a logo branca com um filtro CSS, solução provisória que não altera os SVGs. As combinações devem ser avaliadas no contexto de uso; este registro não representa validação de acessibilidade de componentes.

Consulte a [visão geral da identidade](brand-guidelines.md), inclusive a distinção entre a paleta oficial e as cores presentes nos SVGs existentes, e o [sistema tipográfico](typography.md).
