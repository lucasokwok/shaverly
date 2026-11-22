# Landing page V0.3 — Revisão visual e técnica

> 22/11/2026. Refinamentos experimentais do protótipo; nenhuma decisão de stack, arquitetura ou identidade visual definitiva.

## Inspeção da V0.2

A documentação, o código e o comportamento em Chromium foram revisados antes das alterações. A V0.2 já carregava o GLB, media o recorte do SVG, fixava a abertura, executava a timeline reversível e oferecia alternativas estáticas. O hero centralizado com apenas logo e slogan foi preservado, conforme solicitação humana mais recente.

| Problema observado | Ajuste implementado |
|---|---|
| Iluminação muito intensa, deixando o bigode claro e com pouco volume aparente | Luz hemisférica reduzida de 2 para 0,85; chave de 3 para 2,2; preenchimento de 1,5 para 0,65. Orientação inicial um pouco mais oblíqua, sem movimento automático. |
| Modelo verde ainda perceptível dentro do recorte durante parte do encaixe | Movimento termina antes do crossfade. A cor em memória passa de Accent Green para Primary Dark; o modelo perde opacidade e a silhueta original assume a forma final. A sobreposição foi encurtada após revisão das capturas intermediárias. |
| Redução linear em pixels e atraso de acompanhamento numérico | Escala uniforme por razão exponencial, deslocamento com `sine.inOut` e `scrub: true`, sem atraso artificial. Pin reduzido de 1,8 para 1,5 alturas da abertura. |
| Realocação do buffer mesmo em recálculos com dimensões idênticas | Tamanho e DPR são comparados antes de `setDrawingBufferSize`. O primeiro callback do observador não dispara refresh redundante se não houve mudança. |
| Saída durante carregamento não tinha o mesmo tratamento da cena pronta | Listener de saída registrado desde o bootstrap, cancelamento do fetch do SVG, descarte de resultados tardios do GLB e preservação do motivo de cancelamento. A referência à rotina de limpeza é liberada após o uso. |
| Ordem visual da navegação no celular diferente da ordem do DOM | Removido o reordenamento por CSS. Navegação por teclado acompanha a leitura visual. |
| Links pequenos, mudanças de hover abruptas e contorno pouco evidente no botão secundário | Links com altura mínima de 44 px, transições de 100–160 ms, feedback de pressão e contorno Accent Green. Movimento reduzido elimina as transições e o deslocamento de pressão. |
| Texto dos cards menor que o texto corrente e horários que saíam de vista na tabela | Texto dos cards em 16 px e primeira coluna da agenda fixa durante rolagem horizontal. |

Os cards são informativos; não receberam animações de hover que sugiram comportamento de botão. Seções, dados fictícios, logo e slogan não foram substituídos. A versão estática continua sem pin e sem carga das ferramentas 3D.

## Precisão e continuidade do encaixe

O destino continua derivado do `viewBox` oficial e do tamanho/posição renderizados do SVG. Os limites do recorte permanecem `703, 337, 201, 63` em unidades do SVG; são validados em execução. O modelo mantém geometria, escala uniforme, hierarquia, rugosidade e metalicidade. A cor é tratada somente em memória, como já ocorria na V0.2.

A malha frontal tem proporção aproximada de 3,45:1 e o recorte, 3,19:1. As curvas das pontas também diferem. **Não há coincidência geométrica perfeita**; a transição para a silhueta extraída do SVG é o mecanismo de continuidade. O SVG completo permanece intacto no resultado final.

As capturas iniciais, intermediárias e finais de desktop e smartphone foram inspecionadas. O teste numérico confirma centro e escala chegando ao destino medido, inclusive após redimensionamento, mas não prova sozinho correspondência de contornos nem perfeição temporal em hardware real. A revelação continua restrita ao slogan sob a logo; a navegação e o restante da landing aparecem pela rolagem natural.

## Desempenho e recursos

- Um único canvas e uma única malha, sem novas bibliotecas, modelos, texturas, sombras ou pós-processamento.
- Renderização sob demanda, sem loop automático permanente. Após estabilização, as amostras de repouso e de cena fora da abertura não apresentaram novos desenhos.
- DPR limitado a 1,25 para ponteiro de toque e 1,5 nos demais dispositivos.
- Nenhuma leitura de layout no callback de renderização; leituras concentradas no refresh/resize.
- Refresh sem mudança de dimensões não aloca novo buffer, verificado pelo contador de diagnóstico.
- Cancelamento libera timeline, pin, frame pendente, observador, handlers da cena, geometria, materiais e contexto WebGL. Um GLB que termina depois do cancelamento também é descartado.

Foram coletados indicadores com `PerformanceObserver` nas sete navegações automatizadas da bateria final. **CLS observado: 0**. O LCP reportado variou de **1.116 a 1.596 ms** nessas execuções locais, com servidor local, cache de bibliotecas, rolagem programática, capturas e WebGL por software. Canvas não participa da medição de LCP como uma imagem comum; esses valores não representam necessariamente o tempo até o bigode aparecer.

Essas observações não são métricas de produção, não estabelecem ganho percentual contra a V0.2 e não garantem comportamento em dispositivos móveis reais. INP e FPS em hardware físico não foram medidos. Os contadores de tarefas longas também são registrados no JSON de diagnóstico, sem interpretá-los como benchmark de campo.

## Verificações executadas

Comandos e pré-requisitos estão no [README do protótipo](../../prototypes/landing-page/README.md). O teste `tests/browser-checks.mjs` não depende de pacotes externos.

| Verificação | Resultado |
|---|---|
| Sintaxe do JavaScript da página e do teste | Passou |
| 320×740, 390×844, 430×932, 768×1024, 1024×768, 1440×900 e 1920×1080; DPR de dispositivo 2 | Passou, sem transbordamento horizontal da página |
| Carga real do modelo, 2.816 triângulos, centralização, redução e retorno ao início | Passou |
| Destino e escala em pontos intermediários/finais e após mudar para 390×844 e 844×390 | Passou |
| Capturas da animação e páginas completas em 390, 768 e 1440 px | Capturadas; páginas desktop/mobile e estados de transição inspecionados visualmente |
| Teclado: pular abertura, foco no slogan e sequência dos links de navegação | Passou, foco visível |
| Âncoras, hover/pressão de botão e coluna de horários durante rolagem horizontal | Passou |
| Movimento reduzido na carga e alterado durante a abertura | Hero estático, sem pin; na carga reduzida, nenhuma requisição de GLB/CDN |
| GLB bloqueado, CDN bloqueado, WebGL indisponível, perda de contexto e erro simulado no desenho | Hero estático utilizável, sem canvas/pin restantes |
| Cancelar enquanto o GLB carrega e falha/resposta tardia após cancelamento | Estado estático preservado |
| Carregamento travado por mais de 10 segundos | Recuperação pelo watchdog, sem reativação tardia |
| Link direto para seção e JavaScript desativado | Conteúdo acessível; título presente na árvore de acessibilidade |
| Exceções não tratadas na bateria final | Nenhuma; avisos dos cenários de falha são esperados |

A primeira execução do teste encontrou um frame adicional durante o assentamento inicial de resize em tablet. O teste de repouso passou a aguardar a estabilização, e o observador foi ajustado para ignorar notificações iniciais sem mudança real de tamanho. Isso não foi registrado como loop contínuo nem como ganho de FPS.

O cálculo dos pares de texto da paleta continua apresentando contraste mínimo de 6,44:1. O contorno Accent Green sobre Primary Dark tem contraste de aproximadamente 9,47:1. Esses cálculos e a checagem de semântica/foco não equivalem a uma auditoria completa WCAG com leitores de tela.

## Pendências

- Avaliar a sensação temporal do encaixe com a equipe em celulares físicos e Safari/iOS, incluindo barras dinâmicas do navegador.
- Medir fluidez, uso de GPU e responsividade das interações em hardware representativo; não há validação de INP de campo.
- Revisar com leitores de tela e outras combinações de navegador/tecnologia assistiva.
- Reavaliar o equilíbrio de iluminação e o crossfade a partir dessa revisão humana; as diferenças de silhueta entre os arquivos permanecem.
- A abertura depende de internet para os módulos CDN. A página estática é a alternativa quando não estão disponíveis; distribuição local das bibliotecas continua como possibilidade futura.

Nenhum requisito funcional, SVG, GLB, fonte oficial, cor oficial, backend ou código do produto definitivo foi alterado. Não foram criados ADRs de stack nem commits.
