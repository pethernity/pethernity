# Design System — Paradiso Etereo

> Un linguaggio visivo che evoca un mondo sospeso tra cielo e sogno: soffice, luminoso, avvolgente. Ogni elemento deve trasmettere la sensazione di trovarsi in un luogo oltre le nuvole, dove la luce è sempre dorata e l'aria ha il colore dell'arcobaleno.

---

## Filosofia visiva

L'estetica si ispira a un paradiso immaginario: cieli al tramonto che sfumano dal rosa al celeste, nuvole morbide come cuscini, riflessi dorati che ricordano oggetti antichi e preziosi. Non è kitsch, non è infantile — è **etereo, caldo e raffinato**. L'atmosfera è quella di un dipinto romantico del Settecento filtrato attraverso una lente contemporanea.

---

## Palette colori

### Colori primari

| Nome | Hex | Utilizzo |
|------|-----|----------|
| Rosa Aurora | `#E8A0B4` | Sfumature di sfondo, accenti principali, call-to-action secondarie |
| Celeste Paradiso | `#B8D4E3` | Porzioni superiori dei gradienti, aree di respiro, sfondi chiari |
| Crema Divina | `#F5EDE0` | Sfondo base delle sezioni, testo su superfici scure, card |

### Colori di accento

| Nome | Hex | Utilizzo |
|------|-----|----------|
| Rubino Profondo | `#7A1A2E` | Testi titolo ad alto impatto, bottoni primari, elementi di enfasi |
| Oro Antico | `#C9A84C` | Bordi decorativi, dettagli ornamentali, icone premium |
| Corallo Caldo | `#D4736A` | Hover states, notifiche, badge, elementi interattivi |

### Colori funzionali

| Nome | Hex | Utilizzo |
|------|-----|----------|
| Bianco Nuvola | `#FEFAF6` | Sfondo generale, spazi negativi |
| Grigio Seta | `#A89F97` | Testi secondari, didascalie, placeholder |
| Nero Velluto | `#2B1F1F` | Testo body principale quando serve massimo contrasto |

### Colori arcobaleno (uso decorativo)

Questi colori vengono usati esclusivamente per elementi decorativi legati al motivo dell'arcobaleno. Non devono mai apparire in blocchi pieni, ma sempre come sfumature sottili, archi trasparenti o riflessi di luce.

| Nome | Hex |
|------|-----|
| Lavanda Cielo | `#C4A8D4` |
| Pesca Leggero | `#F5C7A0` |
| Giallo Sole | `#F2DC8A` |
| Verde Brezza | `#A8D5B0` |
| Azzurro Etere | `#8EC5E2` |

L'arcobaleno non deve mai sembrare un elemento grafico da cartone animato. Va trattato come un fenomeno naturale: sfumature morbidissime, quasi trasparenti, che si fondono con il cielo dello sfondo.

---

## Tipografia

### Font principale — Titoli display

**Famiglia:** un serif decorativo con tratti calligrafici e curve eleganti, nello stile dei caratteri script ottocenteschi. I titoli devono sembrare scritti a mano da un calligrafo, con aste sottili e occhielli generosi. Riferimenti tipografici: Playfair Display, Cormorant Garamond Italic, oppure un vero script come Pinyon Script per titoli hero di grande formato.

- Peso: Regular o Light per i titoli script
- Dimensione hero: molto grande, occupa almeno il 30% della larghezza della viewport
- Colore: Rubino Profondo o Crema Divina a seconda dello sfondo
- Interlinea: stretta, le righe possono quasi toccarsi per creare un effetto compatto e teatrale

### Font secondario — Titoli strutturali

**Famiglia:** un serif robusto con grazie evidenti e personalità forte, nello stile dei caratteri "western" o "slab decorativi" ma senza mai risultare aggressivo. Il carattere deve avere un'anima vintage e imponente. Riferimenti: Playfair Display Bold, Abril Fatface, o un display serif personalizzato con tratti spessi e grazie pronunciate.

- Peso: Bold o Black
- Stile: tutto maiuscolo con tracking leggermente aumentato
- Colore: Rubino Profondo con un sottile effetto di ombra o profondità
- Può presentare un leggero effetto tridimensionale ottenuto con ombre portate morbide

### Font body

**Famiglia:** un sans-serif geometrico e pulito che bilanci la ricchezza dei titoli. Deve essere moderno, leggibile e neutro. Riferimenti: DM Sans, Inter, Outfit.

- Peso: Regular (400) per il body, Medium (500) per enfasi, Bold (700) per sottotitoli
- Dimensione base: 16px
- Interlinea: 1.6
- Colore: Nero Velluto o Grigio Seta a seconda del contesto

---

## Sfondi e gradienti

### Gradiente cielo principale

Lo sfondo dominante dell'intero sito è un gradiente verticale che simula un cielo al tramonto visto da molto in alto. Parte da un celeste pallido e freddo nella parte superiore, attraversa una zona centrale rosata e calda, e si dissolve in un bianco-crema luminoso verso il basso. La transizione deve essere estremamente morbida — non si devono percepire "scalini" tra i colori.

Direzione: dall'alto verso il basso.
Sequenza indicativa: Celeste Paradiso → Rosa Aurora → Crema Divina → Bianco Nuvola.

### Nuvole

Le nuvole sono un elemento decorativo fondamentale. Appaiono nella parte bassa delle sezioni e lungo i bordi laterali. Devono essere morbide, voluminose, con una leggera luminosità dorata sui bordi superiori (come se fossero illuminate dal sole). Non sono illustrazioni piatte: devono avere profondità e un aspetto quasi fotografico, leggermente sfocato, come viste attraverso un filtro soft-focus.

Le nuvole possono essere ottenute con immagini PNG con trasparenza oppure con grafica generativa, purché mantengano un aspetto naturale e tridimensionale.

### Arcobaleni

Gli archi dell'arcobaleno compaiono come elementi decorativi sullo sfondo. Sono sempre molto trasparenti (opacità tra il 10% e il 25%), ampi, e posizionati dietro il contenuto principale. Non devono mai competere con il testo o le immagini. Possono apparire come archi completi o come frammenti che entrano ed escono dai bordi della pagina.

---

## Forme e contenitori

### Filosofia delle forme

Tutto è morbido. Non esistono angoli vivi nel sistema. Ogni contenitore, bottone, card o area interattiva ha angoli arrotondati generosi. Le forme dominanti sono ovali, cuori stilizzati e cerchi.

### Card e contenitori

Le card hanno angoli arrotondati ampi (raggio minimo 16px, ideale 24px). Lo sfondo è Bianco Nuvola o Crema Divina con una leggerissima ombra portata diffusa che dà l'impressione di galleggiare. Nessun bordo visibile — la separazione dallo sfondo è affidata solo all'ombra e alla differenza di luminosità.

### Elementi decorativi in stile "cornice antica"

Per contenere immagini o elementi di rilievo si usano cornici con un'estetica da oggetto antico e prezioso. Pensare a medaglioni, cammei, cornici ovali dorate, locket vintage. Questi elementi hanno una texture metallica dorata con leggere imperfezioni (graffi, patina) che conferiscono autenticità. La forma è ovale o a cuore, con bordi tridimensionali in rilievo.

### Forme per immagini

Le immagini degli utenti o i contenuti visivi principali vengono ritagliati in forme circolari o ovali, mai rettangolari. Il ritaglio è sempre centrato sul soggetto.

---

## Bottoni

### Bottone primario

Sfondo pieno in Rubino Profondo, testo in Crema Divina, angoli arrotondati molto ampi (pill shape — raggio pari alla metà dell'altezza). Ombra portata morbida. Allo stato hover il colore si schiarisce leggermente e l'ombra si espande.

### Bottone secondario

Sfondo trasparente con bordo in Rubino Profondo (spessore 2px), testo in Rubino Profondo, stessa forma pill. Allo hover lo sfondo si riempie con un rosa molto tenue.

### Dimensioni

I bottoni sono generosi nel padding orizzontale — devono sembrare comodi e invitanti, mai compressi. Altezza minima: 48px. Padding orizzontale: almeno 32px per lato.

---

## Iconografia

Le icone seguono uno stile lineare sottile (stroke width 1.5px) con angoli arrotondati. Il colore di default è Rubino Profondo o Oro Antico. Quando sono interattive, presentano un cerchio di sfondo in Crema Divina.

Per gli elementi informativi (tooltip, info) si usano cerchietti piccoli con bordo e lettera "i" al centro, in stile minimale.

---

## Immagini e fotografia

### Stile fotografico

Le immagini devono avere una tonalità calda e leggermente desaturata, come se fossero illuminate da una luce dorata del tardo pomeriggio. L'aspetto ideale è quello di una fotografia scattata durante la golden hour con un leggero filtro vintage.

### Trattamento

Sopra le immagini si può applicare un overlay molto tenue nel colore Rosa Aurora o Crema Divina per uniformare i toni con il resto del sito. Le immagini non appaiono mai con bordi netti — sono sempre inserite in contenitori con forme morbide o maschere arrotondate.

---

## Effetti e animazioni

### Principi generali

Ogni animazione deve essere lenta, fluida e delicata. Niente movimenti bruschi o rimbalzi. L'easing ideale è di tipo ease-in-out con durate tra 400ms e 800ms. L'obiettivo è che tutto sembri galleggiare, muoversi come sospinto da una brezza leggera.

### Nuvole in movimento

Le nuvole di sfondo si muovono orizzontalmente a velocità molto bassa, creando un effetto di parallasse sottile. Diverse nuvole a diverse profondità si muovono a velocità differenti.

### Arcobaleni

Gli arcobaleni possono apparire con un effetto di dissolvenza lenta quando la sezione entra nella viewport. L'opacità cresce gradualmente da 0% al valore target.

### Elementi dorati

Gli elementi con texture dorata possono avere un leggero riflesso di luce che si muove lentamente sulla superficie, simulando il modo in cui la luce gioca su una superficie metallica.

### Hover sui bottoni

Transizione morbida di 300ms. Il bottone si solleva leggermente (translateY negativo di 2px) e l'ombra si espande.

---

## Spaziatura e ritmo

Il layout respira. Lo spazio bianco è generoso e intenzionale. Tra le sezioni principali si lascia molto margine verticale — il contenuto non deve mai sembrare affollato. L'utente deve avere la sensazione di attraversare un paesaggio aperto, non di essere in una stanza piena di oggetti.

- Margine tra sezioni: ampio, equivalente ad almeno 80-120px
- Padding interno delle sezioni: 40-64px verticale, 24-48px orizzontale
- Spazio tra titolo e sottotitolo: 16-24px
- Spazio tra sottotitolo e contenuto: 32-48px

---

## Tono di voce nei testi UI

Il microcopy del sito è giocoso, affettuoso e leggermente teatrale, senza essere infantile. Usa esclamazioni dolci, inviti calorosi e un linguaggio che fa sentire l'utente speciale e accolto. I titoli possono essere enfatici e poetici. I testi di supporto sono chiari e diretti ma sempre gentili.

---

## Riepilogo dell'atmosfera

Immagina di fluttuare sopra un mare di nuvole dorate al tramonto. L'aria è tiepida, la luce è morbida, e in lontananza un arcobaleno appare e scompare tra le brume. Tutto è lento, tutto è bello, tutto è avvolgente. Questo è il mondo che il sito deve evocare in ogni sua pagina.
