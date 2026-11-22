# Abertura — ponteiro, luz e orientação de rolagem

> Extensão experimental da V0.3 — 22/11/2026. Planejamento atualizado a partir da autorização humana para rotação acumulada seguindo o ponteiro, sem necessidade de arraste.

## Planejamento adotado

1. Permitir explorar o modelo nos três eixos enquanto a página está no topo, inclusive mostrando suas costas. O ponteiro fornece duas coordenadas: deslocamento horizontal adiciona rotação em Y, vertical adiciona rotação em X e movimento angular ao redor do centro adiciona rotação em Z. Esses movimentos podem se combinar.
2. Reutilizar a luz principal, com deslocamento pequeno seguindo a posição do ponteiro; manter as luzes de preenchimento fixas.
3. Ao iniciar o scroll, interromper a influência do ponteiro, capturar a orientação efetivamente desenhada e retirar progressivamente seu efeito no início da timeline. O encaixe continua sendo controlado pela animação existente.
4. Após 30 segundos no topo, com apresentação pronta e aba visível, mostrar discretamente “Role para baixo para continuar.” no canto inferior direito.
5. Preservar alternativas estáticas, movimento reduzido, rolagem nativa e o orçamento de renderização. Não modificar arquivos GLB ou SVG.

O arraste foi considerado como alternativa na conversa, mas foi substituído pela solicitação posterior de seguir o ponteiro sem pressionar botões. O limite de pequena inclinação do planejamento inicial também foi substituído pela rotação acumulada, capaz de passar por todas as orientações.

## Rotação e iluminação implementadas

Uma camada de transformação interativa fica entre o grupo controlado pelo scroll e a raiz do modelo. A acumulação usa quaternions normalizados, evitando travamento de eixos por acumulação de ângulos Euler. A geometria original permanece intacta.

Movimentos consecutivos do mouse atualizam a orientação desejada. A pose e a luz acompanham esse alvo com suavização dependente do tempo, de aproximadamente 120 ms. Cada incremento é limitado para evitar saltos por reposicionamento brusco do cursor; não há limite de orientação acumulada. Perto do centro, a contribuição angular de Z é ignorada para evitar a singularidade do ângulo polar.

Ao sair da área da abertura, a referência do último ponto é descartada, preservando a orientação alcançada. A próxima entrada estabelece uma nova referência antes de adicionar giros. Não há captura ou bloqueio do ponteiro e nenhum botão do mouse precisa estar pressionado.

Eventos de mouse habilitam a interação mesmo quando um dispositivo híbrido ou ambiente headless não informa um ponteiro primário preciso nas consultas de mídia. Eventos de toque são ignorados; a rolagem por toque continua nativa.

A luz principal mantém intensidade e cor da V0.3. Sua posição varia até 0,9 unidade em X e 0,7 em Y ao redor da configuração existente. Nenhuma nova luz, textura, biblioteca ou efeito de pós-processamento foi adicionado.

## Passagem para o scroll

- Considera-se topo `scrollY <= 1`, com tolerância a variações subpixel e overscroll negativo.
- Ao sair do topo, são capturadas a orientação e a posição de luz **já exibidas**, em vez dos alvos que ainda poderiam estar em suavização.
- A contribuição interativa é interpolada para a identidade nos primeiros 12% do progresso da timeline, com suavização `smoothstep`. A luz retorna à posição original no mesmo intervalo.
- Depois disso, a orientação depende somente do grupo da animação de scroll, que chega frontalmente ao encaixe existente. Novos movimentos do mouse não alteram essa sequência.
- Na rolagem reversa, a camada interativa recupera a orientação capturada ao retornar ao topo. Uma nova entrada do ponteiro não reutiliza deltas antigos.

Isso permite iniciar o encaixe com o modelo invertido ou de costas. Continua existindo a diferença de silhueta entre GLB e SVG descrita no [relatório da V0.3](landing-v03-review.md); a forma final oficial é preservada pelo crossfade, sem afirmar coincidência geométrica perfeita.

## Aviso de 30 segundos

A contagem começa quando a apresentação está pronta. Movimentar o mouse não reinicia o prazo. Tempo com a aba oculta não é contabilizado.

Sair do topo antes do aviso reinicia a contagem; voltar ao topo começa um novo período. Depois de mostrado, o aviso desaparece ao iniciar o scroll e não reaparece durante aquela visita/documento. Navegação direta com fragmento não agenda o aviso. Pular a abertura o cancela.

O aviso usa Inter e as cores oficiais Secondary Dark e Light Green, respeita margens de área segura e não ocupa espaço no layout nem intercepta o ponteiro. Uma região de status separada comunica a mensagem uma única vez, de forma educada, sem mover o foco. O movimento reduzido elimina a animação de entrada.

O controlador do aviso é independente da cena: pode orientar a navegação no hero estático com JavaScript, inclusive com movimento reduzido ou falha de WebGL/GLB. Sem JavaScript, o hero permanece acessível, mas o aviso temporizado não é executado.

## Recursos e verificação

O mesmo agendador de `requestAnimationFrame` atende scroll, ponteiro e acomodação. Frames adicionais são solicitados somente enquanto orientação/luz convergem; depois o desenho para. Não há um segundo loop permanente. Listeners, timer e diagnósticos são removidos ao encerrar a experiência ou sair da página.

O teste sem dependências `prototypes/landing-page/tests/pointer-checks.mjs` verificou em Chromium:

- Visão traseira obtida por movimento horizontal sem botões pressionados, com captura inspecionada visualmente.
- Rotação em X e contribuição de Z por movimento circular.
- Captura da pose durante suavização, neutralização antes do encaixe, entrada do mouse ignorada durante scroll e retorno coerente ao topo.
- Luz seguindo o ponteiro e retornando à posição original.
- Eventos de toque sem rotação interativa.
- Pausa da contagem por evento de visibilidade simulado, reinício antes do prazo e espera real de 30 segundos para mostrar o aviso.
- Ocultação ao rolar, ausência de repetição e mensagem na região de status.
- Movimento reduzido sem carga de GLB/CDN e sem animação do aviso; esse caso usa relógio simulado, enquanto o teste cinematográfico aguardou o prazo real.
- Nenhuma exceção não tratada nessa bateria.

A regressão geral também passou nas sete larguras entre 320 e 1920 px, incluindo navegação, reversão e alternativas de falha. As capturas da visão traseira, da transição após o giro e do aviso foram inspecionadas. A revisão continua limitada a Chromium com WebGL por software; Safari/iOS, leitores de tela reais e avaliação de sensibilidade por usuários permanecem pendentes. Indicadores locais registrados anteriormente para a V0.3 não são usados como benchmark desta extensão.
