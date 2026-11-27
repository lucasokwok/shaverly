# Landing page Shaverly — Protótipo V0.3

## Executar

Na raiz do repositório:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra <http://127.0.0.1:8000/prototypes/landing-page/> no início da página, sem fragmento `#` na URL. Role para avançar e para voltar. Não há instalação de dependências, gerenciador de pacotes ou build. O servidor precisa servir a raiz do repositório, pois o modelo e os SVGs são referenciados em `../../assets/branding/`.

A abertura requer HTTP, WebGL2 e acesso ao CDN. Abrir `index.html` diretamente por `file://` continua oferecendo o hero estático. Sem JavaScript ou com movimento reduzido, o conteúdo também permanece acessível. Links diretos para seções pulam a abertura.

## Arquivos e bibliotecas experimentais

- `index.html`: hero com a logo oficial centralizada e apenas o slogan “Seu negócio no ritmo certo.” abaixo. Navegação após o hero; funcionalidades, agenda ilustrativa e CTA final preservados. Inclui canvas, botão de pular abertura (visível ao foco) e mapa de módulos.
- `styles.css`: paleta oficial, hero centralizado com altura de viewport, responsividade e estilos da abertura. A composição é a mesma em desktop e smartphones, sem painel de fundo ou botões no hero.
- `script.js`: carregamento opcional, medição do recorte, renderização sob demanda, timeline reversível e alternativas estáticas.
- `fonts/`: Paytone One Regular e Inter variável, com suas licenças SIL Open Font License. Fontes obtidas do repositório oficial [Google Fonts](https://github.com/google/fonts), pastas `ofl/paytoneone` e `ofl/inter`.

Os módulos são importados do jsDelivr com versões fixadas:

| Ferramenta | Versão | Uso neste protótipo |
|---|---|---|
| Three.js e GLTFLoader | `0.180.0` | Cena e carregamento do bigode |
| GSAP e ScrollTrigger | `3.13.0` | Sequência vinculada à rolagem e pin temporário |

São ferramentas experimentais desta versão, sem definição da stack ou arquitetura do produto final. Referências de API: [Three.js](https://threejs.org/docs/) e [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Sequência

1. Um bigode centralizado ocupa a abertura, sobre `#F6F2E7`. Não há rotação automática contínua.
2. Ao rolar, uma timeline GSAP com `scrub: true` reduz uniformemente a escala, ajusta a orientação e move o modelo até a região medida na logo. A abertura fica temporariamente fixada por uma distância de rolagem equivalente a 1,5 alturas da seção de abertura; a rolagem nativa não é interceptada.
3. Após o modelo chegar frontalmente ao destino, sua cor transiciona para Linho e o canvas perde opacidade enquanto a logo oficial e uma silhueta extraída de seu próprio recorte aparecem. A silhueta transitória se dissolve no recorte real. Não há deformação da malha nem substituição do SVG por texto.
4. Depois do encaixe, somente o slogan é revelado sob a logo. A navegação e as demais seções ficam após o hero, disponíveis ao continuar a rolagem, sem animações adicionais.

A mesma timeline funciona ao contrário. Não existe loop permanente de renderização: solicita-se um frame quando a pose ou o tamanho muda. O DPR é limitado a 1,25 em ponteiros de toque e 1,5 nos demais casos; não há pós-processamento, sombras ou outros modelos. Recursos de GPU, observador de tamanho e handlers da cena são liberados ao cancelar a abertura, trocar para movimento reduzido, perder o contexto WebGL ou sair da página.

## Inspeção do GLB e do SVG

O `mustache.glb` tem 83.760 bytes, uma malha, 1.500 vértices e 2.816 triângulos. Não tem texturas, animações ou extensões de compressão. A transformação original da cena converte os eixos; os limites mundiais medidos pelo Three.js têm dimensões aproximadas de `2,253266 × 0,652577 × 0,202000`.

O material original é quase preto (`baseColorFactor` RGB próximo de `0,001027`), com metalicidade zero e rugosidade aproximada de `0,5482`. Para tornar o volume legível no protótipo, sua cor é alterada **apenas em memória** para Café, preservando geometria e demais propriedades. Luz hemisférica e duas luzes direcionais suaves usam cores próprias de renderização.

O SVG oficial tem `viewBox="105 145 2000 460"`, sem transformações nos caminhos. O recorte do bigode é o subcaminho de índice 5 no caminho com `fill-rule="evenodd"`. Seus limites medidos são:

- `x: 703`, `y: 337`, `largura: 201`, `altura: 63`.
- Centro em unidades do SVG: `803,5; 368,5`.

O script extrai esse subcaminho do arquivo original e valida os limites com `getBBox()`. Se a estrutura ou as medidas mudarem, a abertura é cancelada com diagnóstico, sem presumir um novo destino.

O tamanho e a posição reais do SVG são obtidos por `getBoundingClientRect()`, respeitando o `viewBox`. Esses dados são convertidos para as coordenadas da câmera ortográfica. As medidas são recalculadas no refresh do ScrollTrigger e após mudanças de tamanho; não são lidas a cada frame de scroll.

A largura do GLB é normalizada e escalada uniformemente até a largura do recorte. A proporção frontal do modelo é cerca de `3,45:1`; a do recorte é `3,19:1`. Portanto, a coincidência geométrica não é exata. O crossfade para a silhueta original resolve a diferença sem distorcer o modelo. O encaixe foi inspecionado em capturas intermediárias e a posição final foi verificada em diferentes viewports; não é declarado perfeito em todo dispositivo.

## Acessibilidade e falhas

- `prefers-reduced-motion: reduce` apresenta o hero estático, sem importar bibliotecas 3D ou carregar GLB. A mudança da preferência durante a abertura também remove a cena e o pin.
- O link “Pular para o conteúdo” e o botão “Pular abertura” permitem evitar a sequência pelo teclado. Elementos ainda ocultos não recebem foco; ao pular a abertura pelo botão, o foco vai para o título.
- GLB, SVG ou bibliotecas indisponíveis, falha de WebGL, perda de contexto ou carregamento acima de 10 segundos restauram o hero estático e registram um aviso no console.
- O canvas é decorativo e não substitui conteúdo semântico. Nenhuma informação depende da animação.

## Verificação da V0.2 (histórico)

Foram executados `node --check script.js`, verificações de arquivos e inspeção em Chromium headless com renderização WebGL por software:

- Carga real das bibliotecas fixadas e do GLB via HTTP; apresentação centralizada.
- Capturas iniciais, intermediárias e finais em desktop (1440 × 900), tablet (768 × 1024) e smartphone (390 × 844); verificação adicional a 320 × 740.
- Escala, movimento, alinhamento visual com o recorte e retorno ao início ao inverter o scroll.
- Redimensionamento em andamento, inclusive para orientação horizontal de 844 × 390; sem transbordamento horizontal da página.
- Hero sem controles extras; navegação após a primeira tela; “Pular abertura” com foco no slogan. O comportamento de pular pelo teclado foi verificado na implementação inicial da V0.2.
- Preferência de movimento reduzido desde a carga e durante a animação; nenhuma requisição de GLB/CDN quando a preferência já está ativa.
- Bloqueios simulados de GLB e CDN, WebGL indisponível e perda de contexto: conteúdo estático preservado e canvas/pin removidos.
- JavaScript desativado e abertura por `file://`: hero estático acessível.
- Nenhuma exceção não tratada na bateria de verificações. SVGs, GLBs, requisitos e código da aplicação preservados.

A V0.1 já havia sido verificada entre 320 e 1440 px, offline, com navegação por âncoras e contraste mínimo de 6,44:1 entre os pares de cores de texto utilizados. Seus cards, agenda fictícia e CTA final permanecem nesta versão.

## Limitações remanescentes

- Validar a sensação de encaixe, iluminação e duração em dispositivos físicos, especialmente Safari/iOS e GPUs móveis. Capturas estáticas não substituem avaliação temporal por pessoas.
- Refinar o intervalo do crossfade conforme a revisão visual da equipe. A silhueta 3D continua diferente do recorte; não há correspondência geométrica perfeita.
- Validar a composição centralizada em dispositivos físicos com barras de navegador dinâmicas e orientação horizontal.
- Medir custo e fluidez em hardware real. Os testes atuais usaram WebGL por software, sem benchmark de FPS.
- Fazer auditoria com leitores de tela. As verificações de semântica, foco e alternativas estáticas não equivalem a uma auditoria completa de acessibilidade.
- A abertura depende de internet para os módulos CDN. Falhas preservam a página estática; servir as bibliotecas localmente pode ser avaliado posteriormente.

A agenda contém apenas nomes e horários fictícios. Não há cadastro, pagamentos, autenticação, persistência, backend ou APIs de produto. Tesoura, navalha e barber pole não fazem parte desta implementação. Nenhum recurso de branding foi modificado ou duplicado. Este protótipo pode ser descartado ou reimplementado sem impacto na arquitetura do Shaverly.


## Refinamentos e verificação da V0.3

O hero continua contendo somente a logo centralizada e o slogan. A V0.3 refinou iluminação, orientação inicial, redução proporcional de escala, duração do pin e transição do modelo para o recorte oficial. A rolagem controla a timeline diretamente, sem atraso de scrub numérico. O slogan entra com deslocamento de apenas 8 px após o encaixe.

A navegação mobile segue agora a mesma ordem visual e de teclado. Os links têm áreas de toque de pelo menos 44 px, os botões e links possuem feedback discreto de hover/pressão e o contorno dos botões usa Oliva Claro. Os textos dos cards passaram a 16 px e os horários da agenda permanecem visíveis ao rolar horizontalmente. Os cards continuam informativos, sem movimentos que sugiram ação de clique.

O canvas só tem seu buffer redimensionado quando tamanho ou DPR mudam. A saída da página cancela a abertura mesmo durante o carregamento. Resultados atrasados após cancelamento não reativam a cena nem sobrescrevem o estado estático. Nenhuma geometria ou textura derivada foi produzida.

O [relatório da V0.3](../../docs/design/landing-v03-review.md) detalha problemas encontrados, ajustes experimentais, métricas locais e pendências.

### Repetir as verificações

Para validação de sintaxe, a partir da raiz:

```bash
node --check prototypes/landing-page/script.js
node --check prototypes/landing-page/tests/browser-checks.mjs
```

O teste de navegador usa apenas recursos nativos de Node 22+ e o protocolo de depuração do Chromium. Não instala pacotes. Execute o servidor HTTP descrito no início deste documento e abra **um Chromium dedicado a testes**, com perfil separado:

```bash
chromium-browser --headless --disable-gpu --enable-unsafe-swiftshader --remote-debugging-port=9223 --user-data-dir=/tmp/shaverly-v03-tests about:blank
```

Em outro terminal, execute:

```bash
node prototypes/landing-page/tests/browser-checks.mjs
```

O teste navega na primeira aba desse perfil dedicado, varia a viewport, simula falhas e testa teclado/hover/pressão. Ao final restaura as configurações de simulação. O endpoint HTTP, o endpoint de depuração e o diretório de artefatos também podem ser passados, nessa ordem, como argumentos. Capturas e `results.json` ficam por padrão em `/tmp/shaverly-v03-checks/`.

Na execução desta entrega, os sete tamanhos entre 320 e 1920 px passaram, assim como redimensionamento/orientação, reversão, foco, navegação, estados dos botões, leitura dos horários durante rolagem da tabela, movimento reduzido e alternativas para falhas. Não houve exceções não tratadas. A condição de repouso é verificada após estabilizar o carregamento e os recálculos iniciais; um frame de inicialização não é tratado como loop ocioso.

Para inspeção manual, acrescente `?debug=1` à URL: `window.shaverlyDebug.snapshot()` fornece progresso, pose, destino e contadores de renderização/redimensionamento. Esse diagnóstico é apenas do protótipo e é removido ao encerrar a cena; não envia dados a serviços externos.

## Ponteiro, luz interativa e orientação após 30 segundos

No topo, movimente o mouse horizontalmente, verticalmente e em trajetórias circulares para explorar o bigode nos três eixos, inclusive por trás. Não é necessário clicar ou arrastar. A rotação é acumulada com suavização; ao sair da área, a orientação é preservada e a referência de entrada é reiniciada. A luz principal acompanha o ponteiro discretamente.

Ao começar a rolar, a orientação efetivamente exibida é capturada. A camada interativa e o deslocamento de luz são neutralizados nos primeiros 12% da sequência, antes do encaixe. Durante o restante do scroll, o mouse deixa de influenciar a cena. Ao retornar ao topo, a interação é reativada sem deltas antigos. Toque não controla a rotação.

Após 30 segundos no topo, com a apresentação pronta e a aba visível, aparece “Role para baixo para continuar.” no canto inferior direito. Movimentos do mouse não reiniciam o prazo. A aba oculta pausa a contagem; sair do topo antes do prazo reinicia o período. O aviso aparece uma vez por visita/documento, desaparece ao rolar e não bloqueia o ponteiro ou move o foco. Também funciona no hero estático com JavaScript; movimento reduzido elimina sua animação.

O [planejamento atualizado e registro da implementação](../../docs/design/pointer-interaction.md) detalha o mapeamento, a recuperação de orientação, o timer e suas limitações.

Com o mesmo servidor e Chromium de testes descritos acima, execute as duas baterias **em sequência**, pois usam a mesma aba:

```bash
node prototypes/landing-page/tests/browser-checks.mjs
node prototypes/landing-page/tests/pointer-checks.mjs
```

A segunda bateria inclui uma espera real de 30 segundos. Seus artefatos ficam por padrão em `/tmp/shaverly-pointer-checks/`. Ambos os comandos aceitam URL do protótipo, endpoint de depuração e diretório de artefatos como argumentos. `window.shaverlyDebug.snapshot()` inclui orientação e luz; `window.shaverlyHintDebug.snapshot()` fornece o estado do aviso quando `?debug=1` estiver ativo.


## Cores

O protótipo usa somente a [paleta oficial](../../docs/design/colors.md), definida como variáveis no início de `styles.css`. O seletor de comparação foi removido em 27/11/2026, após a escolha da opção 4B. A logo branca é escurecida por filtro CSS, sem alterar o SVG.
