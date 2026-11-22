# Animações da landing page

> Registro de design — 21/11/2026. Nenhuma animação foi implementada nesta etapa.

## Conceito principal selecionado — bigode encaixando na logo

A animação do bigode encaixando na logo permanece como o conceito principal selecionado, conforme orientação humana. O modelo disponível é `assets/branding/models/mustache.glb`.

## Conceito: tesoura 3D cortando a tela

**Status: animação futura em avaliação, ainda não aprovada para implementação.**

A tesoura poderá atravessar a viewport conforme o usuário realiza a rolagem, criando uma transição visual semelhante a um corte que revela a próxima seção da landing page.

Recurso disponível: `assets/branding/models/barbers_scissors.glb`.

### Pendências técnicas para implementação futura

- Verificar se as lâminas são objetos separados e podem ser animadas individualmente.
- Avaliar a orientação, escala e origem do modelo.
- Estudar a sincronização entre o movimento da tesoura e uma máscara de revelação.
- Garantir responsividade e desempenho.
- Prever uma alternativa para usuários que preferem movimento reduzido.

Essas verificações ainda não foram realizadas. A proposta não substitui o conceito principal selecionado nem define tecnologia de implementação.

## Protótipo V0.2 — abertura do bigode — 22/11/2026

O conceito principal foi implementado experimentalmente em `prototypes/landing-page/`, evoluindo a composição estática da V0.1. Este registro complementa o conceito de 21/11; não aprova a animação da tesoura nem define a stack do produto.

A abertura apresenta o bigode centralizado sobre o fundo Primary Dark. A rolagem nativa controla redução uniforme de escala, orientação frontal e deslocamento até o recorte da letra `a`. Uma transição de opacidade para a silhueta extraída do próprio SVG preserva a forma final oficial, seguida pela revelação do hero existente. A timeline é reversível.

O recorte foi identificado no SVG com `viewBox="105 145 2000 460"`: limites `x=703`, `y=337`, `largura=201`, `altura=63`. O script valida essas medidas no arquivo e calcula o destino a partir do SVG renderizado, recalculando-o após redimensionamento. O GLB e o recorte têm proporções diferentes; o modelo não é deformado. A cor do material quase preto recebe o verde de destaque apenas em memória, para contraste, sem alterar o GLB.

Há hero estático para movimento reduzido, ausência de JavaScript, abertura por arquivo e falhas de GLB, CDN ou WebGL. O botão de pular a abertura é acessível pelo teclado. A cena é renderizada sob demanda e seus recursos são liberados ao cancelar a experiência.

Carga, avanço/reversão, capturas intermediárias, responsividade, redimensionamento e alternativas estáticas foram verificados em Chromium. O encaixe foi inspecionado visualmente em desktop, tablet e smartphone; a diferença de silhueta é tratada pelo crossfade, sem afirmar perfeição em todos os dispositivos. Avaliação temporal em hardware real, Safari/iOS e revisão fina da transição ficam para V0.3.

As [instruções e limitações do protótipo](../../prototypes/landing-page/README.md) registram versões das ferramentas, medidas do modelo e procedimentos de teste. Nenhuma pendência técnica da tesoura foi resolvida ou implementada nesta versão.

### Ajuste do hero — 22/11/2026

Por solicitação humana posterior, o hero passa a conter somente o SVG oficial centralizado e um slogan abaixo. O texto existente “Seu negócio no ritmo certo.” foi reutilizado como slogan. Foram removidos o painel lateral, textos de apoio, botão e rodapé interno do hero; a navegação fica após a primeira tela. As demais seções foram preservadas.

A animação mantém a medição responsiva do recorte, agora na logo centralizada, e revela apenas o slogan depois do encaixe. A silhueta de transição utiliza Primary Dark para coincidir com o novo fundo uniforme, sem modificar o SVG ou o GLB. A mesma composição é utilizada na versão estática e com movimento reduzido.

## Refinamento V0.3 — 22/11/2026

A V0.3 preserva esse hero e refina iluminação, orientação inicial, escala por proporção e a passagem do verde 3D para a silhueta Primary Dark. O acompanhamento usa `scrub: true`; o pin dura 1,5 alturas da abertura. A malha chega ao destino antes de concluir o crossfade, e o slogan é revelado com deslocamento sutil de 8 px. Não há novos modelos ou efeitos automáticos nas demais seções.

O [relatório de revisão V0.3](landing-v03-review.md) registra os problemas encontrados na V0.2, alterações experimentais, testes, indicadores locais e limitações. Geometria e contorno oficial permanecem diferentes; o alinhamento observado nas capturas não é declarado perfeito em todos os dispositivos. A validação em Safari/iOS e hardware móvel físico continua pendente.

### Extensão interativa da abertura — 22/11/2026

Foi autorizada a rotação acumulada nos três eixos seguindo o ponteiro, sem arraste, enquanto o scroll está no topo. A camada interativa é neutralizada nos primeiros 12% da timeline a partir da pose realmente exibida, permitindo continuar o encaixe mesmo depois de mostrar as costas do modelo. A luz principal existente acompanha o ponteiro e retorna à sua posição original no mesmo intervalo.

Um aviso discreto orienta a rolar após 30 segundos de apresentação pronta no topo, contando somente tempo de aba visível. O [planejamento atualizado e registro](pointer-interaction.md) documenta regras, acessibilidade, testes e limitações dessa extensão. Nenhum SVG ou GLB foi modificado.
