# Projeto: "Vale a pena esse tênis?"
### Documento de visão — v1

> Documento vivo. Foi construído a partir de uma conversa de garimpo de ideia.
> Serve pra você abrir do lado enquanto constrói no Claude Code e não se perder.
> Quando bater a vontade de "fazer tudo de uma vez", volta aqui e lê a parte das fases.

---

## 1. A ideia em uma frase

Uma ferramenta web, em português, que ajuda o corredor a decidir **se vale a pena comprar um tênis específico** — antes de gastar e se arrepender.

Não é "mais um analisador de pisada". É um **veredito de compra** sob a ótica de quem odeia gastar errado.

---

## 2. De onde nasceu (a dor real)

A dor não é "qual tênis comprar". A dor é **"como eu sei se um tênis vale a compra ANTES de gastar e me arrepender?"**

Isso veio de uma experiência concreta: comprar um tênis na promoção achando que era bom negócio, testar em casa (pareceu ok), caminhar 8 km e sentir dor (fáscia plantar, tornozelo, sensação do pé caindo pra dentro), depois descobrir que o tênis era de trilha e não de asfalto — e ter que devolver. Tempo perdido, quase dinheiro perdido, de volta à estaca zero.

Essa é uma dor **financeira** (arrependimento de compra), não esportiva. É justamente o cruzamento que torna o projeto diferente.

---

## 3. Por que isso é diferente (a interseção)

Os apps existentes respondem "qual seu tipo de pisada". As lojas respondem "compre esse tênis". **Ninguém responde a pergunta do dinheiro.**

A vantagem não está numa ideia inédita — está na combinação que poucas pessoas conseguem fazer:

- **Finanças** → "isso vale a pena pelo que entrega?"
- **Corrida** → "serve pro meu uso real?"
- **Moda / estética** → "fica bem em mais de um contexto, sem destoar?"
- **Em português, pra realidade brasileira** (tênis e preços nacionais)

O critério da estética ("versátil sem parecer estranho") é o diferencial secreto: nenhum app de tênis tem isso, porque vem de um usuário que liga pra moda *e* pra dinheiro *e* corre.

---

## 4. O coração do produto

**O veredito de compra.** Se só isso existisse, já valeria.

A pessoa responde algumas perguntas, informa o tênis que está namorando, e recebe um veredito raciocinado: vale a pena pra você, ou provavelmente vai se arrepender — e por quê.

Tudo o mais (acompanhamento, quilometragem, Strava) é **fase 2 em diante**. Não construa antes de o coração estar de pé.

---

## 5. O cérebro do app (os critérios de decisão)

Em ordem de peso, conforme a lógica real de decisão:

### 1º — Versatilidade (o critério mais importante)
Tem duas camadas:
- **Funcional:** dá pra usar em mais de um ambiente? (asfalto, esteira, dia a dia)
- **Estética:** combina com mais de um contexto/look, sem destoar nem chamar atenção errada? *(diferencial único)*

### 2º — Custo-benefício relativo
Não é "barato ou caro". É comparação de valor:
- Pelo que esse tênis entrega, o preço compensa?
- Existem opções iguais ou melhores na mesma faixa de preço?

### 3º — Durabilidade (secundário)
Importa, mas não é decisivo. Entra como peso menor na conta.

> Esses critérios ainda vão ser aprofundados. Isto é o esqueleto inicial, não a versão final.

---

## 6. As fases (faça UMA de cada vez)

A regra de ouro: **cada fase só começa quando a anterior está funcionando e no ar.** É o oposto de olhar o monte de opções e travar.

### Fase 0 — Aprender a base (você está aqui)
Instalar Node.js, Claude Code, criar conta na Vercel. Montar um projeto React + Vite + Tailwind com uma tela inicial. Só ver funcionando no navegador.

### Fase 1 — O CORAÇÃO: veredito de compra
- Tela com perguntas (peso, tipo de uso, quanto corre por semana, faixa de preço, histórico de dor/lesão)
- Campo pra informar o tênis avaliado
- Lógica de regras (o "cérebro" da seção 5) que devolve um veredito raciocinado
- Tela de resultado com o veredito + **disclaimer honesto** (não substitui avaliação profissional)
- No ar, de graça. **Fim da fase 1.**

### Fase 2 — Inventário + quilometragem manual
- Pessoa registra os tênis que tem
- Anota km rodados na mão
- App mostra custo por km e alerta quando o tênis se aproxima do fim da vida útil

### Fase 3 — Integração com Strava (automática)
- Conectar com o Strava pra puxar quilometragem e atividades sozinho
- Exige cadastro/aprovação do app junto ao Strava — mais complexo, fica pro fim
- Você selecionaria no "inventário" o tênis em uso, e o acompanhamento seria automático

### (Eventual) Fase 4 — Monetização
- **Não** comece por propaganda (rende pouco, exige volume enorme)
- Caminho mais provável e mais coerente com seu perfil: **relatório em PDF pago** (análise na tela grátis, PDF completo custa barato)
- Monetização é problema da fase 4. Não deixe ela travar a fase 1.

---

## 7. Stack técnica

- **React + Vite** (base do app)
- **Tailwind** (estilo)
- **MediaPipe Pose via TensorFlow.js** — *só se/quando* entrar análise de vídeo; roda 100% no navegador
- **Vercel** (publicar, de graça)
- **Sem backend no começo** — mais barato e resolve privacidade (vídeo/dados nunca saem do dispositivo)

### Decisão de privacidade (importante pro marketing)
Processar tudo no navegador. Se houver vídeo, ele **nunca** é enviado a servidor. Isso resolve LGPD de graça e vira argumento de venda: "seus dados nunca saem do seu aparelho".

---

## 8. Como conduzir o Claude Code

Cole este contexto no início:

> "Estou construindo uma ferramenta web que ajuda o corredor a decidir se vale a pena comprar um tênis específico, rodando 100% no navegador (dados nunca enviados a servidor, por privacidade/LGPD). Stack: React + Vite + Tailwind. O resultado nunca é diagnóstico médico — é um veredito com recomendação de validar com profissional. Vamos construir em fases, uma de cada vez. Comece pela tela inicial apenas."

Depois peça **uma fase por vez**, teste, só então avance. Pedir "faça o app inteiro" é o caminho mais rápido pro caos.

### Onde você provavelmente vai travar (avisado de antemão)
- Permissão de câmera/recursos no navegador local pode exigir rodar em `localhost` ou `https`. Normal.
- Se entrar MediaPipe, os modelos carregam pesado na primeira vez. Vai parecer lento; é esperado.

---

## 9. Lembrete final (pra quando bater a dúvida existencial)

Você não precisa de uma ideia que "ninguém nunca teve". Precisa executar **bem**, pra um público específico, do **seu** jeito. Originalidade é supervalorizada; posicionamento e execução é que ganham.

E sobre o critério "versátil sem parecer estranho": como decisão de *produto*, é ótimo. Só não deixe ele virar reforço de um desconforto pessoal — design e ansiedade são coisas diferentes.

O coração é o veredito de compra. Comece por ele. O resto vem depois.
