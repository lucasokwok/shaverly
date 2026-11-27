# Shaverly — Cores operacionais

> Definidas em 27/11/2026 para dashboards e telas de trabalho. Complementam a [paleta oficial](colors.md). Valores em [`tokens.css`](tokens.css); amostras no [mostruário](../../prototypes/cores-operacionais/index.html).

## Regras

1. Cor semântica comunica estado. Não usar em decoração nem como série de gráfico.
2. Nunca depender só da cor: acompanhar de rótulo em texto e, quando possível, ícone.
3. Texto usa `-text`, sobre `-soft` ou Branco. `-solid` é para ícones, pontos, faixas e barras.
4. Superfícies continuam brancas; a cor aparece em selos, faixas e marcas.
5. Verde de sucesso e oliva da marca têm funções diferentes: oliva indica ação ou seleção, não resultado.

## Semânticas

| Token | Significado | Sólido | Texto | Fundo suave |
|---|---|---|---|---|
| `success` | Concluído, deu certo | `#1E7F52` | `#14603D` | `#E5F4EB` |
| `warning` | Requer atenção | `#B7791F` | `#7A4E0B` | `#FCF1D9` |
| `serious` | Problema relevante | `#C4521A` | `#93390C` | `#FCE9DE` |
| `critical` | Erro, ação destrutiva, urgência | `#B3261E` | `#8F1D17` | `#FBE7E5` |
| `info` | Informação, em andamento | `#2563A8` | `#1B4B82` | `#E6EFF9` |
| `neutral` | Sem destaque, encerrado | `#6B7062` | `#474B40` | `#EEEFEA` |

## Status de agendamento (proposta)

Os requisitos ainda não definem os estados de um agendamento. A lista abaixo é uma proposta da IA, a validar pela equipe; as cores se aplicam aos estados que forem confirmados.

| Status | Token |
|---|---|
| Agendado | `neutral` |
| Confirmado | `info` |
| Em atendimento | `warning` |
| Concluído | `success` |
| Não compareceu | `serious` |
| Cancelado | `critical` |

“Horário livre” não é status: permanece como texto `--ink-muted`, sem selo.

## Prioridade

| Prioridade | Token | Sinal adicional |
|---|---|---|
| Baixa | `neutral` | 1 barra |
| Média | `warning` | 2 barras |
| Alta | `serious` | 3 barras |
| Urgente | `critical` | 4 barras |

## Pagamentos (visão futura)

Fora do MVP até aprovação. Referência: Pago `success`, Pendente `warning`, Atrasado `critical`, Estornado `neutral`.

## Feedback e formulários

- Mensagens de sucesso, aviso, erro e informação usam `success`, `warning`, `critical` e `info`.
- Campo inválido: borda `--critical-solid` e mensagem em `--critical-text`.
- Botão destrutivo: fundo `--critical-solid` com texto Branco.
- Foco: contorno `--olive-action`. Desabilitado: `--neutral-soft` com `--neutral-text`.

## Gráficos

- **Categóricas (`--chart-1` a `--chart-6`):** identidade de séries, em ordem fixa. A cor acompanha a entidade, mesmo após filtros. Da sétima em diante, agrupar em “Outros” (`--chart-other`) ou dividir o gráfico.
- **Sequencial (`--chart-seq-*`):** intensidade, como ocupação por horário.
- **Divergente (`--chart-div-*`):** variação em torno de um ponto central, como meta.
- Com duas ou mais séries, exibir legenda; manter rótulos ou tabela alternativa. Textos usam `--ink`, nunca a cor da série.

## Verificação e limites

- Categóricas aprovadas por validador sobre Branco e Linho: luminosidade, croma, contraste mínimo de 3:1 e separação entre vizinhas (menor ΔE 15,1 em deuteranopia; 4,9 em tritanopia, por isso rótulos são obrigatórios). A verificação considera pares vizinhos, não todas as combinações.
- Sequencial aprovada como rampa ordinal sobre Branco. A divergente não passou por validador.
- Pares `-text` sobre `-soft`: contraste mínimo de 6,30:1. Cores `-solid` sobre Branco: mínimo de 3,64:1.
- Não há tema escuro definido. Falta avaliar os componentes em uso real.
