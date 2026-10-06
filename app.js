/* ============================================================
   CHRONOSON — app.js
   1. Données (époques, inventions, courbes, quiz)
   2. Moteur audio — chaque époque a son sequencer
   3. Frise : rail + panneau
   4. Visualiseur
   5. Courbes SVG
   6. Quiz
   7. Scroll, reveal, compteurs, nav
   ============================================================ */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   1. DONNÉES
   ============================================================ */

/* `sound` décrit la musique de l'époque et alimente le sequencer :
   kit      batterie (kick / snare / clap / hats / congas / toms)
   bass     [step, demi-tons, durée en doubles-croches]
   chords   Accord : steps frappés dans la mesure, durée, timbre
   prog     4 mesures, [décalage, qualité]
   arp      16 doubles-croches (décalage en demi-tons, ou null)
   tone     'vinyl' (bande étroite + craquements) | 'tape' | 'clean'
*/
const ERAS = [
  {
    id: '1897', from: 1897, to: 1919,
    name: 'Les premiers disques',
    tagline: 'La voix tient dans un cylindre de cire',
    lede: "En 1887, Edison enregistre une voix ; dix ans plus tard, le phonographe entre dans les salons. On roule, on presse, on emboîte : une chanson devient un objet que l'on peut réécouter. La fin du XIXe siècle, c'est l'âge de la chanson de café-concert et de la chanson réaliste — une chanteuse en scène, au piano, en costume, devant un public qui répète le refrain.",
    france: "Yvette Guilbert et Aristide Bruant portent la chanson de café-concert ; la salle Pleyel devient un temple.",
    change: "Le disque rend le refrain rejouable : on écoute la même chanson deux fois, et on la connaît par cœur.",
    genres: ['Chanson réaliste', 'Café-concert', 'Chanson de music-hall', 'Hymne', 'Humour'],
    artists: ['Yvette Guilbert', 'Aristide Bruant', 'Théodore Botrel', 'Vincent Hyspa', 'Edmond Missa'],
    invention: { year: 1887, title: 'Le phonographe', text: "Une membrane enduite de cire grave le sillon : le son devient enregistrable et rejouable à volonté." },
    vinylStyle: 'Cylindre de cire',
    caption: '1887-1919 — la voix est enregistrée, mais fragile, et la cire s’use vite',
    accent: '#b4532a', accent2: '#5f7a52',
    sound: {
      bpm: 104, steps: 12, swing: 0, root: 53, kit: null,
      tone: 'vinyl', cutoff: 2600, verb: .5, drive: false,
      bass: [[0, 0, 4], [6, 7, 3]],
      chords: { steps: [0, 4], dur: 5, type: 'piano' },
      prog: [[0, 'm'], [-5, 'M'], [2, 'M'], [-3, 'm7']],
      arp: null
    }
  },
  {
    id: '1920', from: 1920, to: 1939,
    name: "L'âge d'or du 78 tours",
    tagline: 'Jazz, swing, et la radio qui emporte tout',
    lede: "Le 78 tours se vend par millions. Chicago et New York imposent le blues, le jazz et le swing ; Paris croise les genres avec Django Reinhardt et la chanson de boulevard. La radio, née en 1922, change la donne : pour la première fois, la chanson se diffuse sans que le public soit là pour l'écouter.",
    france: "Charles Trenet impose le blues à la française : « Y a d'la joie » (1935).",
    change: "La chanson devient un produit de masse, et un produit radiophonique.",
    genres: ['Jazz', 'Swing', 'Blues', 'Chanson réaliste', 'Film musical'],
    artists: ['Louis Armstrong', 'Bessie Smith', 'Django Reinhardt', 'Charles Trenet', 'Maurice Chevalier'],
    invention: { year: 1922, title: 'La radio', text: "Le poste diffuse une chanson à des milliers d'inconnus : la diffusion remplace la vente." },
    vinylStyle: '78 tours',
    caption: '1925-1935 — l’âge d’or du disque, du cabaret et des premières ondes',
    accent: '#c9a227', accent2: '#4a6f7c',
    sound: {
      bpm: 152, steps: 16, swing: .34, root: 50, kit: 'brush',
      tone: 'vinyl', cutoff: 2800, verb: .35, drive: false,
      bass: [[0, 0, 2], [4, 4, 2], [8, 5, 2], [12, 7, 3]],
      chords: { steps: [4, 12], dur: 2, type: 'organ' },
      prog: [[0, '7'], [5, 'm7'], [7, '7'], [0, 'm7']],
      arp: [0, 12, 16, 14, 12, 9, 12, 14, 16, 19, 16, 14, 12, 9, 7, 9]
    }
  },
  {
    id: '1940', from: 1940, to: 1959,
    name: 'Le vinyle prend son échelle',
    tagline: '33 cm, 45 tours, jukebox et rock’n’roll',
    lede: "Le disque 33 cm devient l’outil du salon, le 45 tours celui du hit : trois minutes gravées au recto, on passe à l'autre face. Le transistor (1947) emporte le disque dans la rue, le jukebox dans les bars. Nashville et Memphis inventent le rock'n'roll, la France répond avec ses auteurs et ses idoles.",
    france: "Brassens, Brel, Aznavour : la chanson d'auteur prend le relais du folklore.",
    change: "Le single de trois minutes invente le hit radio — et la star qui le porte.",
    genres: ['Rock’n’roll', 'Chanson', 'Jazz moderne', 'Country', 'Valse'],
    artists: ['Elvis Presley', 'Chuck Berry', 'Little Richard', 'Georges Brassens', 'Charles Aznavour'],
    invention: { year: 1948, title: 'Le 45 tours', text: "Une seule chanson par face : la programmation musicale et le classement apparaissent." },
    vinylStyle: '33 / 45 tours',
    caption: '1948-1959 — le single, le jukebox et la naissance du rock’n’roll',
    accent: '#7d3c2a', accent2: '#7a6a3a',
    sound: {
      bpm: 166, steps: 16, swing: .2, root: 45, kit: 'rock',
      tone: 'tape', cutoff: 3400, verb: .2, drive: true,
      bass: [[0, 0, 1], [2, 7, 1], [3, 9, 1], [5, 9, 1], [7, 7, 1], [8, 0, 1], [10, 7, 1], [11, 9, 1], [13, 9, 1], [15, 7, 1]],
      chords: { steps: [0, 6, 8, 14], dur: 1, type: 'epiano' },
      prog: [[0, 'M'], [10, 'M'], [5, 'M'], [7, 'M']],
      arp: [7, null, null, null, 9, null, null, null, 7, null, null, null, 12, null, null, null]
    }
  },
  {
    id: '1960', from: 1960, to: 1969,
    name: 'La sixties',
    tagline: 'Beat, soul, British Invasion',
    lede: "Deux groupes de Liverpool écrivent le cahier des charges de la pop : la chanson est un enregistrement de studio, pas un spectacle de café. À Détroit, Motown industrialise le son ; à Londres, les Beatles et les Stones montent ; à Kingston, le ska prépare le reggae. En France, les yé-yé trustent Hit-Paradys, et la première chanson transatlantique circule en 33 tours.",
    france: "« La Javanaise » (1967) : la chanson s'invente, s'écoute, se cite — et se joue en boucle.",
    change: "Le studio devient un instrument : le multi-piste fait du mixage une création.",
    genres: ['Pop', 'Rock', 'Soul', 'Motown', 'Reggae (émerge)', 'Yé-yé'],
    artists: ['The Beatles', 'Bob Dylan', 'Otis Redding', 'Johnny Hallyday', 'Serge Gainsbourg'],
    invention: { year: 1965, title: 'Le studio multipiste', text: "On enregistre par bandes séparées, on corrige, on réenregistre : la production fait partie de l'œuvre." },
    vinylStyle: '33 tours · face A',
    caption: '1965-1969 — l’album devient l’unité, la face A devient l’icône',
    accent: '#d1553f', accent2: '#3f6f8c',
    sound: {
      bpm: 148, steps: 16, swing: .12, root: 47, kit: 'beat',
      tone: 'tape', cutoff: 4200, verb: .25, drive: true,
      bass: [[0, 0, 2], [4, 0, 1], [6, 0, 1], [8, 0, 2], [12, 7, 1], [14, 0, 1]],
      chords: { steps: [0, 4, 8, 12], dur: 2, type: 'epiano' },
      prog: [[0, 'm7'], [8, 'M7'], [3, 'M7'], [10, 'M7']],
      arp: [0, null, null, 7, null, null, null, null, 12, null, null, 7, null, null, null, null]
    }
  },
  {
    id: '1970', from: 1970, to: 1979,
    name: 'Disco, funk, punk, hip-hop',
    tagline: 'Cassette, synthé modulaire, rythme machine',
    lede: "La cassette Philips (1963) devient grand public : on copie, on prête, on enregistre son propre mix. New York et Détroit saturent de soul et de funk, Philadelphia invente le disco à quatre temps, Londres casse tout avec le punk, et le Bronx pose la première brique du hip-hop avec « Rapper's Delight » (1979).",
    france: "Polnareff et Michel Delpech : la pop française ose le costume, la moustache et la basse électrique.",
    change: "On devient producteur et collectionneur : la musique se fabrique, se copie et se transporte.",
    genres: ['Disco', 'Funk', 'Punk', 'Prog', 'Kitsch', 'Hip-hop (1979)'],
    artists: ['Donna Summer', 'Stevie Wonder', 'David Bowie', 'Gil Scott-Heron', 'Michel Polnareff'],
    invention: { year: 1970, title: 'La cassette grand public', text: "On enregistre chez soi : le disque perd son monopole et la copie privée apparaît." },
    vinylStyle: 'Cassette C60',
    caption: '1975-1979 — quatre temps au disco, et les tout premiers sons de hip-hop',
    accent: '#b0399a', accent2: '#d9a12b',
    sound: {
      bpm: 120, steps: 16, swing: 0, root: 46, kit: 'disco',
      tone: 'tape', cutoff: 3800, verb: .3, drive: true,
      bass: [[0, 0, 1], [2, 0, 1], [4, 12, 1], [6, 0, 1], [8, 0, 1], [10, 0, 1], [12, 12, 1], [14, 7, 1]],
      chords: { steps: [2, 6, 10, 14], dur: 1, type: 'stab' },
      prog: [[0, 'm7'], [5, 'm7'], [7, 'M7'], [0, 'm7']],
      arp: [12, null, null, null, null, null, null, null, 12, null, null, null, null, null, null, null]
    }
  },
  {
    id: '1980', from: 1980, to: 1989,
    name: 'Le tout-numérique',
    tagline: 'CD, MTV, MIDI, sampler',
    lede: "Le CD (1982) supprime le craquement, le Walkman libère l'écoute, la MTV fait de l'image un argument, le MIDI (1983) relie les synthétiseurs entre eux. Puis le sampler arrive : en 1985, la mélodie, la batterie et la voix du monde entier deviennent de la matière première. Atlanta sort du disco, Londres fait du synthé, Détroit sort du funk.",
    france: "Célébration, Desireless, Goldman : la pop française entre en danse, et la programme.",
    change: "La maquette devient le produit : home studio + sampler, n'importe qui peut sortir un disque.",
    genres: ['Synthpop', 'New wave', 'Hip-hop', 'Freestyle', 'Pop'],
    artists: ['Michael Jackson', 'Jean-Michel Jarre', 'Prince', 'Jeanne Mas', 'Grandmaster Flash'],
    invention: { year: 1982, title: 'Le CD', text: "Laser et zéro contact : 74 minutes, aucun bruit de surface, l'album d'un seul tenant." },
    vinylStyle: 'CD · 74 min',
    caption: '1982-1989 — l’ère du CD, du clip permanent et de la machine à sons',
    accent: '#4d6ff0', accent2: '#d94f9a',
    sound: {
      bpm: 118, steps: 16, swing: 0, root: 47, kit: '80s',
      tone: 'clean', cutoff: 5200, verb: .28, drive: true,
      bass: [[0, 0, 1], [2, 0, 1], [4, 12, 1], [6, 0, 1], [8, 0, 1], [10, 0, 1], [12, 12, 1], [14, 7, 1]],
      chords: { steps: [0, 8], dur: 6, type: 'pad' },
      prog: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']],
      arp: [0, 7, 12, 7, 0, 7, 12, 16, 0, 7, 12, 7, 0, 7, 12, 19]
    }
  },
  {
    id: '1990', from: 1990, to: 1999,
    name: 'L’ère des clones',
    tagline: 'Home studio, internet, MP3',
    lede: "Le CD a laminé le vinyle, le sampler est devenu un ordinateur : à 2 000 €, on compose chez soi. En 1993 arrive le Web, en 1998 le MP3, en 1999 Napster. Londres et Détroit sortent de la techno, Paris exporte la French touch, Marseille invente un rap qui se joue en concert.",
    france: "NTM (1991), IAM, Daft Punk (1993) : la France capte avec les outils américains.",
    change: "On passe du disque au réseau : le morceau devient un fichier, puis une adresse.",
    genres: ['Techno', 'House', 'Grunge', 'Trip-hop', 'French touch', 'Rap français'],
    artists: ['Daft Punk', 'Nirvana', 'Radiohead', 'NTM', 'IAM', 'Björk'],
    invention: { year: 1998, title: 'Le MP3', text: "Compression d'environ 10 pour 1 : un album entier tient dans un poche, sans se dégrader à chaque copie." },
    vinylStyle: 'CD · MP3',
    caption: '1993-1999 — la copie numérique, la French touch et le home studio',
    accent: '#7b52ea', accent2: '#29c2c9',
    sound: {
      bpm: 128, steps: 16, swing: 0, root: 45, kit: 'house',
      tone: 'clean', cutoff: 4200, verb: .3, drive: true,
      bass: [[2, 0, 1], [6, 0, 1], [10, 7, 1], [14, 0, 1]],
      chords: { steps: [2, 6, 10, 14], dur: 1, type: 'stab' },
      prog: [[0, 'm'], [3, 'M'], [5, 'm'], [8, 'M']],
      arp: [12, null, 19, null, 16, null, 12, null, 12, null, 19, null, 24, null, 19, null]
    }
  },
  {
    id: '2000', from: 2000, to: 2009,
    name: 'Numérique',
    tagline: 'iPod, YouTube, et le streaming naissant',
    lede: "En 2001, l'iPod rend la musique nomade ; YouTube (2005) la rend visible ; Spotify (2008) la rend streamaBle. La production se dore au samplage de hi-hats, l'indie ressuscite sans label, et la France découvre qu'un disque peut se construire dans une chambre, avec un ordinateur et des voix empruntées.",
    france: "« Ta fête » (2007) puis « Alors on danse » (2009) : la chanson française revient dans le top.",
    change: "Le format long revient, la pochette redevient un objet, le vinyle ressuscite.",
    genres: ['Pop', 'Electro', 'Indie', 'Crunk', 'Nu-disco', 'Rap'],
    artists: ['Daft Punk', 'Kanye West', 'Timbaland', 'Kate Nash', 'Justice', 'Stromae'],
    invention: { year: 2001, title: 'L’iPod + l’iTunes', text: "Le fichier devient l'unité de vente, et la pochette une image de 300 × 300 pixels." },
    vinylStyle: 'iPod · 4 Go',
    caption: '2004-2009 — le MP3 dans la poche, le clip en ligne, la house en français',
    accent: '#1f9c8a', accent2: '#cf4b39',
    sound: {
      bpm: 118, steps: 16, swing: 0, root: 45, kit: 'electro',
      tone: 'clean', cutoff: 4600, verb: .3, drive: true,
      bass: [[0, 0, 1], [2, 0, 1], [4, 7, 1], [6, 0, 1], [8, 0, 1], [10, 0, 1], [12, 10, 1], [14, 7, 1]],
      chords: { steps: [0, 6, 10], dur: 4, type: 'pad' },
      prog: [[0, 'M7'], [5, 'M7'], [7, 'm7'], [10, 'M7']],
      arp: [0, null, null, null, 7, null, null, null, 12, null, null, null, 16, null, null, null]
    }
  },
  {
    id: '2010', from: 2010, to: 2019,
    name: 'L’ère des algorithmes',
    tagline: 'Streaming, trap, rap français',
    lede: "Le streaming devient majoritaire et l'algorithme programme les écoutes. Le trap impose la 808, le hi-hat qui roule à seize doubles-croches et l'autotune qui fait chanter la voix. Le rap français sort de l'ombre et sature les plateaux de télévision ; TikTok raccourcit le morceau : deux minutes suffisent à percer.",
    france: "PNL, Gims, Damso, Jul : la France sort ses propres poids lourds, et les radios suivent.",
    change: "La durée s’effondre : la chanson doit convaincre en quinze secondes.",
    genres: ['Trap', 'EDM', 'Drill', 'K-pop', 'Afrobeats', 'Pop de flux'],
    artists: ['Kendrick Lamar', 'Beyoncé', 'PNL', 'Orelsan', 'Gims', 'Billie Eilish'],
    invention: { year: 2015, title: 'Le streaming majoritaire', text: "On écoute plus de titres qu'on n'achète de disques : l'écoute devient l'économie de la musique." },
    vinylStyle: 'Flux 320 ko/s',
    caption: '2012-2019 — hi-hats à 16 doubles-croches, autotune et playlist automatique',
    accent: '#d92d63', accent2: '#4d6ff0',
    sound: {
      bpm: 142, steps: 16, swing: 0, root: 40, kit: 'trap',
      tone: 'clean', cutoff: 3600, verb: .22, drive: true,
      bass: [[0, 0, 6], [6, 0, 2], [10, 7, 2], [14, 5, 2]],
      chords: { steps: [0], dur: 8, type: 'pad' },
      prog: [[0, 'm'], [0, 'm'], [5, 'm'], [8, 'm']],
      arp: [12, 12, null, 15, null, 12, null, null, 12, 12, null, 19, null, 15, null, null]
    }
  },
  {
    id: '2020', from: 2020, to: 2026,
    name: 'Le melting-point',
    tagline: 'IA, drill, hyperpop, et le retour du vinyle',
    lede: "La production est une boîte à outils infinie : l'IA génère des stems, les genres se mélangent — afrobeats, phonk, hyperpop, drill — et le sample devient un clin d'œil assumé. Le disque ne meurt jamais tout à fait : le vinyle revient comme objet, la cassette aussi, et la chanson tient à la fois d'un sample de 1997 et d'une plateforme de 2026.",
    france: "Le rap français et l'afrobeats dominent l'export ; le streaming est devenu le premier revenu du label.",
    change: "Tout est samplable, tout est assisté par IA : la barrière d'entrée s'effondre.",
    genres: ['Hyperpop', 'Drill', 'Phonk', 'Afrobeats', 'K-pop', 'Indie bedroom pop'],
    artists: ['Billie Eilish', 'Bad Bunny', 'Tyler, the Creator', 'Taylor Swift', 'Gims'],
    invention: { year: 2023, title: 'L’IA dans la production', text: "Génération de stems, de voix, de mixes : l'artiste mixe avec l'algorithme, et le métier change." },
    vinylStyle: 'Vinyle + IA',
    caption: '2020-2026 — afrobeats en tête, drill partout, et le vinyle en objet de collection',
    accent: '#0e8f5f', accent2: '#d92d63',
    sound: {
      bpm: 156, steps: 16, swing: 0, root: 42, kit: 'phonk',
      tone: 'clean', cutoff: 4000, verb: .26, drive: true,
      bass: [[0, 0, 2], [4, 0, 2], [6, 0, 1], [8, 0, 2], [12, 7, 2], [14, 5, 1]],
      chords: { steps: [0, 8], dur: 5, type: 'stab' },
      prog: [[0, 'm'], [5, 'm7'], [7, 'M7'], [10, 'M7']],
      arp: [0, 7, 12, 19, 12, 7, 0, 7, 0, 7, 12, 19, 24, 19, 12, 7]
    }
  }
];

const INVENTIONS = [
  { year: '1877', icon: '◎', title: 'Phonographe', text: "L'enregistrement mécanique : la voix devient un objet rejouable." },
  { year: '1898', icon: '◍', title: 'Disque 78 tours', text: "Le support plat : bon marché, fragile, mais copiable à l'infini." },
  { year: '1922', icon: '((', title: 'La radio', text: "Le son devient un flux : gratuit, public et intemporel." },
  { year: '1931', icon: '▶', title: 'Le film parlant', text: "L'image et le son se marient : la chanson devient un numéro." },
  { year: '1947', icon: '⌁', title: 'Le transistor', text: "Le disque quitte le salon et va dans la poche." },
  { year: '1948', icon: '45', title: 'Le 45 tours', text: "Une chanson par face : le single, et avec lui la programmation." },
  { year: '1954', icon: '▦', title: 'Le jukebox', text: "Le disque devient un objet de rue, vendu à la pièce." },
  { year: '1963', icon: '⊟', title: 'La cassette', text: "La copie privée : on enregistre, on mélange, on échange." },
  { year: '1965', icon: '⧉', title: 'Le studio multipiste', text: "Le mixage devient une création : on peut tout corriger." },
  { year: '1979', icon: '▷', title: 'Le Walkman', text: "L'écoute nomade : la musique sort de la maison." },
  { year: '1982', icon: '◎', title: 'Le CD', text: "Laser, zéro bruit, 74 minutes : l'album d'un seul tenant." },
  { year: '1983', icon: '⌨', title: 'Le MIDI', text: "Les synthétiseurs se parlent : 19 ko/s entre les instruments." },
  { year: '1986', icon: '≋', title: 'Le sampler', text: "N'importe quel son devient matière première à 44,1 ko/s." },
  { year: '2001', icon: '▣', title: 'L’iPod', text: "Le fichier devient l'unité de vente, la pochette un pixel." },
  { year: '2005-08', icon: '☁', title: 'YouTube / Spotify', text: "Le clip et le flux : on n'achète plus un disque, on écoute." },
  { year: '2010-20', icon: '⌗', title: 'Algorithmes & IA', text: "La playlist programme les écoutes, l'IA prépare les stems." }
];

/* durée moyenne d'un morceau, en secondes (ordre de grandeur) */
const LENGTH = [
  [1900, 240], [1920, 270], [1940, 210], [1955, 165], [1965, 150],
  [1972, 200], [1982, 230], [1992, 255], [2002, 225], [2012, 195], [2022, 168], [2026, 158]
];

/* répartition des revenus mondiaux (%) — ordres de grandeur IFPI */
const REVENUE = [
  [2012, 61, 29, 10],
  [2015, 39, 41, 20],
  [2018, 35, 28, 37],
  [2021, 33, 8, 59],
  [2024, 23, 3, 74]
];

const QUIZ = [
  {
    clue: "Un cylindre de cire, un salon, une chanson qu'on écoute deux fois de suite.",
    hint: "Le tout premier support.",
    answers: [
      { label: '1897-1919 · Les premiers disques', ok: true },
      { label: '1920-1939 · L’âge d’or du 78 tours', ok: false },
      { label: '1950 · Rock’n’roll', ok: false },
      { label: '1980 · CD et MTV', ok: false }
    ],
    tell: "C'est l'époque de la chanson de café-concert : on enregistre avant de diffuser."
  },
  {
    clue: "Un 45 tours d'un côté, un jukebox dans le bar, un transistor dans la poche.",
    hint: "Le single de trois minutes.",
    answers: [
      { label: '1897-1919 · Les premiers disques', ok: false },
      { label: '1940-1959 · Le vinyle prend son échelle', ok: true },
      { label: '1960 · La sixties', ok: false },
      { label: '1980 · Le tout-numérique', ok: false }
    ],
    tell: "Le format court invente le hit radio — et la star qui le porte."
  },
  {
    clue: "Une 808 glisse sous la mesure, le hi-hat roule à seize doubles-croches.",
    hint: "Basse profonde et hats serrés.",
    answers: [
      { label: '1970 · Disco et funk', ok: false },
      { label: '1990 · Techno et MP3', ok: false },
      { label: '2010 · L’ère des algorithmes', ok: true },
      { label: '2020 · Le melting-point', ok: false }
    ],
    tell: "La signature du trap, née dans le Sud des États-Unis, devient mondiale."
  },
  {
    clue: "Un sampler Yamaha DX7, un CD, et MTV qui passe « Billie Jean » en rotation.",
    hint: "La mélodie du monde entier devient un échantillon.",
    answers: [
      { label: '1960 · La sixties', ok: false },
      { label: '1980 · Le tout-numérique', ok: true },
      { label: '2000 · Numérique', ok: false },
      { label: '2020 · IA et revival du vinyle', ok: false }
    ],
    tell: "Le CD supprime le bruit de surface, le sampler rend la musique recyclable."
  },
  {
    clue: "Un kick quatre temps, une basse qui fait « boom-tss-boom-tss », un arpège acidulé.",
    hint: "La piste dansante fait son retour.",
    answers: [
      { label: '1950 · Rock’n’roll', ok: false },
      { label: '1990 · L’ère des clones', ok: true },
      { label: '2010 · Trap', ok: false },
      { label: '2020 · Hyperpop', ok: false }
    ],
    tell: "House et techno : la piste dansante devient la bande-sonde de la décennie."
  },
  {
    clue: "L’IA écrit les stems, l’afrobeats bat le rap, le vinyle redevient un objet.",
    hint: "Plus rien n'est fixe.",
    answers: [
      { label: '1980 · Le tout-numérique', ok: false },
      { label: '2000 · Numérique', ok: false },
      { label: '2010 · L’ère des algorithmes', ok: false },
      { label: '2020 · Le melting-point', ok: true }
    ],
    tell: "La musique entre dans l'ère du melting-point : genres, outils et IA se mélangent."
  }
];

/* ============================================================
   2. MOTEUR AUDIO
   ============================================================ */

const KITS = {
  brush:   { kick: [0], snare: [4, 8], snareGain: .16, hat: 'all', hatDiv: 2, hatGain: .1 },
  rock:    { kick: [0, 6, 8], snare: [4, 12], hat: 'all', hatDiv: 2, hatGain: .16 },
  beat:    { kick: [0, 7, 8], snare: [4, 12], hat: 'all', hatDiv: 2, hatGain: .18 },
  disco:   { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], hatOpen: [14], conga: [0, 3, 6, 10] },
  '80s':   { kick: [0, 7, 10], snare: [4, 12], hat: 'all', hatDiv: 1, hatGain: .13, tom: [11, 15] },
  house:   { kick: [0, 4, 8, 12], clap: [4, 12], hat: [2, 6, 10, 14], hatOpen: [10, 14], hatDiv: 1 },
  electro: { kick: [0, 6, 10], snare: [4, 12], hat: [2, 6, 10, 14], hatOpen: [6], hatDiv: 2 },
  trap:    { kick: [0, 7, 10], clap: [8], hat: 'all', hatDiv: 1, hatGain: .17, roll: [15] },
  phonk:   { kick: [0, 3, 8, 11], snare: [8], cowbell: [4, 12], hat: 'all', hatDiv: 1, hatGain: .14 }
};

const A = {
  ctx: null, master: null, tone: null, analyser: null,
  delay: null, delaySend: null, verb: null, verbSend: null,
  drive: null, noise: null, crackle: null,
  playing: false, era: null, step: 0, next: 0, timer: null, freq: null
};

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const QUAL = { M: [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], M7: [0, 4, 7, 11] };
const TIMBRE = { 1897: 'bell', 1920: 'sax', 1940: 'bell', 1960: 'clav', 1970: 'clav', 1980: 'sax', 1990: 'sax', 2000: 'bell', 2010: 'bell', 2020: 'clav' };

function makeNoise(ctx) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function makeImpulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function makeCurve(amount) {
  const n = 1024, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    c[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
  }
  return c;
}

function buildGraph() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  const ctx = new AC();
  A.ctx = ctx;
  A.noise = makeNoise(ctx);

  A.master = ctx.createGain();
  A.master.gain.value = 0.9;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 6; comp.knee.value = 12;

  A.analyser = ctx.createAnalyser();
  A.analyser.fftSize = 256;
  A.analyser.smoothingTimeConstant = 0.78;
  A.freq = new Uint8Array(A.analyser.frequencyBinCount);

  A.tone = ctx.createBiquadFilter();
  A.tone.type = 'lowpass';
  A.tone.frequency.value = 18000;
  A.tone.Q.value = 0.7;

  A.delay = ctx.createDelay(1.2);
  A.delay.delayTime.value = 0.28;
  const fb = ctx.createGain(); fb.gain.value = 0.34;
  const dTone = ctx.createBiquadFilter(); dTone.type = 'lowpass'; dTone.frequency.value = 2600;
  A.delaySend = ctx.createGain(); A.delaySend.gain.value = 0;
  A.delaySend.connect(A.delay);
  A.delay.connect(dTone); dTone.connect(fb); fb.connect(A.delay); dTone.connect(A.tone);

  A.verb = ctx.createConvolver();
  A.verb.buffer = makeImpulse(ctx, 2.1, 3.2);
  A.verbSend = ctx.createGain(); A.verbSend.gain.value = 0;
  A.verbSend.connect(A.verb); A.verb.connect(A.tone);

  A.drive = ctx.createWaveShaper();
  A.drive.curve = makeCurve(6);
  A.drive.connect(A.tone);

  A.tone.connect(A.master);
  A.master.connect(comp);
  comp.connect(A.analyser);
  A.analyser.connect(ctx.destination);
  return true;
}

/* ---- filtre global + effets, selon l'époque ---- */
const TONE = {
  vinyl: { freq: 3200,  q: 1.2 },
  tape:  { freq: 8000,  q: 0.9 },
  clean: { freq: 16000, q: 0.6 }
};

function applyEra(era) {
  if (!A.ctx) return;
  const s = era.sound, t = A.ctx.currentTime, cfg = TONE[s.tone] || TONE.clean;
  A.tone.frequency.setTargetAtTime(cfg.freq, t, 0.05);
  A.tone.Q.setTargetAtTime(cfg.q, t, 0.05);
  A.delay.delayTime.setTargetAtTime((60 / s.bpm) * 0.75, t, 0.05);
  A.verbSend.gain.setTargetAtTime(s.verb * 0.5, t, 0.1);
  startCrackle(s.tone === 'vinyl');
}

function startCrackle(on) {
  if (!A.ctx) return;
  if (A.crackle) { try { A.crackle.stop(); } catch (e) {} A.crackle = null; }
  if (!on) return;
  const src = A.ctx.createBufferSource();
  src.buffer = A.noise; src.loop = true;
  const hp = A.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2400;
  const lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6500;
  const g = A.ctx.createGain(); g.gain.value = 0.013;
  src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(A.tone);
  src.start();
  A.crackle = src;
}

/* ---- helpers ---- */
function env(param, t, a, peak, d, sLevel, dur) {
  param.setValueAtTime(0.0001, t);
  param.exponentialRampToValueAtTime(peak, t + a);
  param.exponentialRampToValueAtTime(Math.max(0.0001, sLevel), t + a + d);
  param.exponentialRampToValueAtTime(0.0001, t + dur);
}

/* ---- voix ---- */
function vKick(t, s, kit) {
  const ctx = A.ctx;
  const long = kit === 'trap' || kit === 'phonk';
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(long ? 155 : 132, t);
  o.frequency.exponentialRampToValueAtTime(44, t + (long ? 0.12 : 0.07));
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(long ? 0.95 : 0.8, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (long ? 0.55 : 0.26));
  o.connect(g); g.connect(A.drive);
  o.start(t); o.stop(t + (long ? 0.6 : 0.3));
}

function vSnare(t, kind, gain = 1) {
  const ctx = A.ctx;
  const n = ctx.createBufferSource(); n.buffer = A.noise;
  n.playbackRate.value = kind === 'brush' ? 0.7 : 1;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.value = kind === 'brush' ? 2600 : 1800;
  bp.Q.value = kind === 'brush' ? 0.8 : 1.1;
  const g = ctx.createGain();
  const dur = kind === 'brush' ? 0.16 : 0.19;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5 * gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(bp); bp.connect(g); g.connect(A.tone); g.connect(A.delaySend);
  n.start(t); n.stop(t + dur + 0.02);

  const o = ctx.createOscillator(), og = ctx.createGain();
  o.type = 'triangle'; o.frequency.value = kind === 'brush' ? 320 : 196;
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(kind === 'brush' ? 0.05 : 0.22 * gain, t + 0.004);
  og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(og); og.connect(A.tone); o.start(t); o.stop(t + dur + 0.02);
}

function vClap(t, gain = 1) {
  const ctx = A.ctx;
  for (let i = 0; i < 3; i++) {
    const tt = t + i * 0.011;
    const n = ctx.createBufferSource(); n.buffer = A.noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 1.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, tt);
    g.gain.exponentialRampToValueAtTime(0.42 * gain, tt + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, tt + (i === 2 ? 0.2 : 0.04));
    n.connect(bp); bp.connect(g); g.connect(A.tone); g.connect(A.delaySend);
    n.start(tt); n.stop(tt + 0.25);
  }
}

function vHat(t, open, gain = 1) {
  const ctx = A.ctx;
  const n = ctx.createBufferSource(); n.buffer = A.noise;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7800;
  const pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 11000; pk.gain.value = 6;
  const g = ctx.createGain();
  const dur = open ? 0.22 : 0.045;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.2 * gain, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(hp); hp.connect(pk); pk.connect(g); g.connect(A.tone);
  n.start(t); n.stop(t + dur + 0.02);
}

function vConga(t, gain = 1) {
  const ctx = A.ctx;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(240, t);
  o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.28 * gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g); g.connect(A.tone); o.start(t); o.stop(t + 0.26);
}

function vTom(t, freq = 180) {
  const ctx = A.ctx;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.12);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.3, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g); g.connect(A.tone); o.start(t); o.stop(t + 0.24);
}

function vCowbell(t) {
  const ctx = A.ctx;
  [540, 800].forEach(f => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g); g.connect(A.tone); o.start(t); o.stop(t + 0.16);
  });
}

function vBass(t, midi, dur, s) {
  const ctx = A.ctx;
  const long = s.kit === 'trap' || s.kit === 'phonk';
  const type = s.kit ? (long ? 'sine' : (s.kit === 'house' || s.kit === 'electro' ? 'sawtooth' : 'square')) : 'triangle';
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(mtof(midi), t);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(Math.min(1400, s.cutoff * 0.4), t);
  f.Q.value = 5;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.44, t + 0.012);
  g.gain.setValueAtTime(0.44, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f); f.connect(g); g.connect(s.drive ? A.drive : A.tone);
  o.start(t); o.stop(t + dur + 0.03);
}

function vChord(t, midis, dur, s, gainScale = 1) {
  const ctx = A.ctx, type = s.chords.type;
  const g = ctx.createGain(), f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.Q.value = 4;
  const isPad = type === 'pad', isStab = type === 'stab';
  f.frequency.setValueAtTime(isPad ? 1300 : Math.min(7000, s.cutoff), t);
  if (!isPad) f.frequency.exponentialRampToValueAtTime(Math.max(400, s.cutoff * 0.32), t + dur * 0.6);
  g.connect(f);

  midis.forEach(m => {
    const o = ctx.createOscillator();
    o.type = type === 'piano' ? 'triangle' : (type === 'organ' ? 'square' : (type === 'epiano' ? 'sine' : 'sawtooth'));
    o.frequency.value = mtof(m);
    o.detune.value = Math.random() * 8 - 4;
    const og = ctx.createGain();
    og.gain.value = 0.9 / midis.length;

    if (type === 'epiano') {          /* FM : la brillance du piano électrique */
      const mod = ctx.createOscillator(), mg = ctx.createGain();
      mod.type = 'sine'; mod.frequency.value = mtof(m) * 3.5;
      mg.gain.setValueAtTime(mtof(m) * 2.2, t);
      mg.gain.exponentialRampToValueAtTime(1, t + dur * 0.5);
      mod.connect(mg); mg.connect(o.frequency); mod.start(t); mod.stop(t + dur + 0.05);
    }
    o.connect(og); og.connect(g);
    o.start(t); o.stop(t + dur + 0.05);
  });

  const level = (isPad ? 0.2 : (isStab ? 0.28 : 0.24)) * gainScale;
  if (isPad) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(level, t + 0.2);
    g.gain.setValueAtTime(level, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(A.verbSend);
  } else if (type === 'organ') {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level * 0.75, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(A.verbSend);
  } else {
    env(g.gain, t, 0.005, level, dur * 0.4, level * 0.3, dur);
    if (isStab) g.connect(A.delaySend); else g.connect(A.verbSend);
  }
  f.connect(A.tone);
}

function vArp(t, midi, dur, s, timbre) {
  const ctx = A.ctx;
  const o = ctx.createOscillator();
  o.type = timbre === 'bell' ? 'sine' : (timbre === 'clav' ? 'square' : 'sawtooth');
  o.frequency.value = mtof(midi);

  const g = ctx.createGain(), f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.Q.value = 3;
  f.frequency.value = timbre === 'sax' ? 2400 : Math.min(7000, s.cutoff);

  const lfo = ctx.createOscillator(), lg = ctx.createGain();
  lfo.type = 'sine'; lfo.frequency.value = 5.2;
  lg.gain.value = timbre === 'sax' ? 7 : 3;
  lfo.connect(lg); lg.connect(o.detune);
  lfo.start(t); lfo.stop(t + dur + 0.05);

  if (timbre === 'bell') {           /* FM : la clochette de fin de siècle */
    const mod = ctx.createOscillator(), mg = ctx.createGain();
    mod.type = 'sine'; mod.frequency.value = mtof(midi) * 7;
    mg.gain.setValueAtTime(mtof(midi) * 1.6, t);
    mg.gain.exponentialRampToValueAtTime(1, t + dur * 0.6);
    mod.connect(mg); mg.connect(o.frequency); mod.start(t); mod.stop(t + dur + 0.05);
  }

  o.connect(f); f.connect(g); g.connect(A.tone); g.connect(A.verbSend);

  if (timbre === 'sax') {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.12, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  } else {
    env(g.gain, t, 0.005, timbre === 'bell' ? 0.15 : 0.12, dur * 0.5, 0.02, dur);
  }
  o.start(t); o.stop(t + dur + 0.05);
}

/* ---- sequencer ---- */
const stepDur = s => 60 / s.bpm / 4;

function schedule(step, t) {
  const era = A.era, s = era.sound;
  const inBar = step % s.steps;
  const bar = Math.floor(step / s.steps) % 4;
  const sd = stepDur(s);
  const at = t + (inBar % 2 === 1 ? sd * s.swing : 0);

  /* batterie */
  const kit = s.kit ? KITS[s.kit] : null;
  if (kit) {
    if (kit.kick && kit.kick.includes(inBar)) vKick(at, s, s.kit);
    if (kit.snare && kit.snare.includes(inBar)) vSnare(at, s.kit === 'brush' ? 'brush' : 'snare', kit.snareGain || 1);
    if (kit.clap && kit.clap.includes(inBar)) vClap(at);
    if (kit.hat === 'all') { if (inBar % kit.hatDiv === 0) vHat(at, false, kit.hatGain || .15); }
    else if (kit.hat && kit.hat.includes(inBar)) vHat(at, false, kit.hatGain || .15);
    if (kit.hatOpen && kit.hatOpen.includes(inBar)) vHat(at, true, (kit.hatGain || .15) * .8);
    if (kit.roll && kit.roll.includes(inBar)) {
      vHat(at, false, (kit.hatGain || .15) * .6);
      vHat(at + sd * 0.5, false, (kit.hatGain || .15) * .9);
    }
    if (kit.conga && kit.conga.includes(inBar)) vConga(at);
    if (kit.tom && kit.tom.includes(inBar)) vTom(at, inBar === 11 ? 180 : 240);
    if (kit.cowbell && kit.cowbell.includes(inBar)) vCowbell(at);
  }

  /* basse */
  if (s.bass) {
    for (const [bs, off, dur] of s.bass) {
      if (bs === inBar) vBass(at, s.root - 12 + off, dur * sd * 0.95, s);
    }
  }

  /* accords */
  if (inBar === 0) {
    const [off, q] = s.prog[bar];
    const tones = QUAL[q] || QUAL.M;
    const midis = tones.map(n => s.root + off + n);
    vChord(at, midis, Math.max(sd * s.chords.dur, 0.2), s, s.arp ? 0.55 : 1);
    for (const cs of s.chords.steps) {
      if (cs === 0) continue;
      vChord(at + cs * sd, midis, Math.max(sd * s.chords.dur, 0.15), s, s.arp ? 0.4 : 0.9);
    }
  }

  /* arpège */
  if (s.arp && s.arp[inBar] != null) {
    const off = s.prog[Math.floor(step / s.steps) % 4][0];
    vArp(at, s.root + off + s.arp[inBar] - 12, sd * 1.6, s, TIMBRE[era.id] || 'clav');
  }
}

function loop() {
  if (!A.playing) return;
  const s = A.era.sound;
  const lookahead = A.ctx.currentTime + 0.2;
  const total = s.steps * 4;
  while (A.next < lookahead) {
    schedule(A.step % total, A.next);
    A.next += stepDur(s);
    A.step++;
  }
}

function start(era) {
  if (!A.ctx && !buildGraph()) return;
  if (A.ctx.state === 'suspended') A.ctx.resume();
  A.era = era;
  applyEra(era);
  if (!A.playing) {
    A.playing = true;
    A.next = A.ctx.currentTime + 0.08;
    A.step = 0;
    A.timer = setInterval(loop, 25);
    document.body.classList.add('is-playing');
    $$('[data-action="play"]').forEach(b => b.setAttribute('aria-pressed', 'true'));
  } else {
    A.next = A.ctx.currentTime + 0.05;
  }
}

function pause() {
  if (!A.playing) return;
  A.playing = false;
  clearInterval(A.timer); A.timer = null;
  document.body.classList.remove('is-playing');
  $$('[data-action="play"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
  if (A.ctx) A.master.gain.setTargetAtTime(0.0001, A.ctx.currentTime, 0.08);
}

function toggle(era) {
  if (A.playing) { pause(); return; }
  if (!A.ctx && !buildGraph()) return;
  A.master.gain.cancelScheduledValues(A.ctx.currentTime);
  A.master.gain.setTargetAtTime(0.9, A.ctx.currentTime, 0.04);
  start(era || A.era);
}

/* ============================================================
   3. FRISE : rail + panneau
   ============================================================ */

let current = 0;
const rail = $('#rail');
const panel = $('#panel');

function buildRail() {
  rail.innerHTML = ERAS.map((e, i) => `
    <button class="rail-tab" role="tab" id="tab-${e.id}" aria-controls="panel"
            aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-era="${i}">
      <span class="yr">${e.from}</span>
      <span class="nm">${e.name}</span>
    </button>`).join('');
}

function renderPanel(i) {
  const e = ERAS[i];
  panel.setAttribute('aria-labelledby', `tab-${e.id}`);
  panel.innerHTML = `
    <div>
      <p class="panel-years"><span>${e.from} — ${e.to}</span></p>
      <h3 class="panel-title">${e.name}</h3>
      <p class="panel-tagline">${e.tagline}</p>
      <p class="panel-lede">${e.lede}</p>
      <div class="panel-facts">
        <div class="fact"><span class="fact-k">En France</span><span class="fact-v">${e.france}</span></div>
        <div class="fact"><span class="fact-k">Ce qui change</span><span class="fact-v is-accent">${e.change}</span></div>
      </div>
    </div>
    <div>
      <div class="inv-card">
        <span class="ic-year">${e.invention.year}</span>
        <h3>${e.invention.title}</h3>
        <p>${e.invention.text}</p>
      </div>
      <div class="chips">${e.genres.map(g => `<span class="chip">${g}</span>`).join('')}</div>
      <div class="artist-box">
        <h4>Noms de l'époque</h4>
        <div class="artists">${e.artists.map(a => `<span class="artist">${a}</span>`).join('')}</div>
      </div>
      <button class="btn btn-primary panel-cta" data-action="play" data-scroll="ecouter">
        <span class="ico" aria-hidden="true">▶</span> Écouter l'ambiance
      </button>
    </div>`;
}

function setEra(i, opts = {}) {
  current = (i + ERAS.length) % ERAS.length;
  const e = ERAS[current];

  document.body.dataset.era = e.id;
  document.documentElement.style.setProperty('--accent', e.accent);
  document.documentElement.style.setProperty('--accent-2', e.accent2);

  $$('.rail-tab').forEach((t, k) => {
    t.setAttribute('aria-selected', k === current);
    t.tabIndex = k === current ? 0 : -1;
  });
  if (!opts.noScroll) {
    const active = $$('.rail-tab')[current];
    active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
  }

  renderPanel(current);
  $('#vinyl-year').textContent = e.from;
  $('#vinyl-style').textContent = e.vinylStyle;
  $('#art-caption').textContent = e.caption;
  $('#studio-era').textContent = `${e.from}-${e.to} · ${e.name}`;
  $('#studio-tags').innerHTML = e.genres.slice(0, 5).map(g => `<span class="chip">${g}</span>`).join('');

  if (A.playing) { A.era = e; applyEra(e); }
}

rail.addEventListener('click', ev => {
  const tab = ev.target.closest('.rail-tab');
  if (tab) setEra(+tab.dataset.era);
});

rail.addEventListener('keydown', ev => {
  const moves = { ArrowRight: 1, ArrowLeft: -1 };
  if (ev.key === 'Home') { ev.preventDefault(); setEra(0); $$('.rail-tab')[0].focus(); return; }
  if (ev.key === 'End') { ev.preventDefault(); setEra(ERAS.length - 1); $$('.rail-tab')[current].focus(); return; }
  if (!(ev.key in moves)) return;
  ev.preventDefault();
  setEra(current + moves[ev.key]);
  $$('.rail-tab')[current].focus();
});

/* ============================================================
   4. VISUALISEUR
   ============================================================ */

const canvas = $('#viz');
const cctx = canvas.getContext('2d');

function fitCanvas() {
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawViz() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const era = ERAS[current];
  cctx.clearRect(0, 0, w, h);

  if (!A.playing || !A.ctx) {
    cctx.strokeStyle = 'rgba(244,239,228,.22)';
    cctx.lineWidth = 1.5;
    cctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = h / 2 + Math.sin(x / 40 + performance.now() / 900) * (h * 0.2);
      if (x === 0) cctx.moveTo(x, y); else cctx.lineTo(x, y);
    }
    cctx.stroke();
    requestAnimationFrame(drawViz);
    return;
  }

  A.analyser.getByteFrequencyData(A.freq);
  const bars = 64, gap = 2;
  const bw = (w - gap * (bars - 1)) / bars;
  const nyq = A.ctx.sampleRate / 2, bins = A.freq.length;

  for (let i = 0; i < bars; i++) {
    const lo = Math.floor(Math.pow(i / bars, 1.7) * bins);
    const hi = Math.max(lo + 1, Math.floor(Math.pow((i + 1) / bars, 1.7) * bins));
    let sum = 0;
    for (let k = lo; k < hi; k++) sum += A.freq[k];
    const v = sum / (hi - lo) / 255;
    const bh = Math.max(2, v * h * 0.92);
    const x = i * (bw + gap);
    const g = cctx.createLinearGradient(0, h - bh, 0, h);
    g.addColorStop(0, i % 5 === 0 ? era.accent : era.accent2);
    g.addColorStop(1, 'rgba(244,239,228,.12)');
    cctx.fillStyle = g;
    cctx.fillRect(x, h - bh, bw, bh);

    if (i % 16 === 0) {
      const hz = Math.round((nyq * lo) / bins);
      cctx.fillStyle = 'rgba(244,239,228,.4)';
      cctx.font = '10px "JetBrains Mono", monospace';
      cctx.fillText(hz >= 1000 ? (hz / 1000).toFixed(1) + 'k' : String(hz), x, h - 2);
    }
  }
  requestAnimationFrame(drawViz);
}

/* ============================================================
   5. COURBES SVG
   ============================================================ */

const SVGNS = 'http://www.w3.org/2000/svg';
const mk = (tag, attrs = {}) => {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
};
const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

function chartLength() {
  const W = 760, H = 300, P = { t: 30, r: 24, b: 42, l: 48 };
  const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Durée moyenne d’un morceau, de 1900 à 2026' });
  const xs = yr => P.l + ((yr - 1900) / (2026 - 1900)) * (W - P.l - P.r);
  const ys = sec => H - P.b - ((sec - 120) / 180) * (H - P.t - P.b);

  [150, 210, 270].forEach(v => {
    svg.appendChild(mk('line', { class: 'grid-line', x1: P.l, x2: W - P.r, y1: ys(v), y2: ys(v) }));
    const t = mk('text', { class: 'axis', x: P.l - 10, y: ys(v) + 4, 'text-anchor': 'end' });
    t.textContent = fmtTime(v);
    svg.appendChild(t);
  });

  const pts = LENGTH.map(([yr, sec]) => [xs(yr), ys(sec)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  svg.appendChild(mk('path', {
    d: `${d} L${pts[pts.length - 1][0].toFixed(1)} ${H - P.b} L${pts[0][0].toFixed(1)} ${H - P.b} Z`,
    fill: 'var(--accent)', opacity: '.12'
  }));
  svg.appendChild(mk('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));

  let lastLabX = -999;
  LENGTH.forEach(([yr, sec]) => {
    const c = mk('circle', { class: 'dot', cx: xs(yr), cy: ys(sec), r: 5, fill: 'var(--accent)' });
    const t = mk('title');
    t.textContent = `${yr} : environ ${fmtTime(sec)}`;
    c.appendChild(t);
    svg.appendChild(c);
    if (xs(yr) - lastLabX > 52) {          /* on saute les années trop proches */
      lastLabX = xs(yr);
      const lab = mk('text', { class: 'axis', x: xs(yr), y: H - P.b + 18, 'text-anchor': 'middle' });
      lab.textContent = yr;
      svg.appendChild(lab);
    }
  });

  const last = LENGTH[LENGTH.length - 1];
  const v = mk('text', { class: 'lbl', x: xs(last[0]) - 12, y: H - P.b - 14, 'text-anchor': 'end', fill: 'var(--ink)' });
  v.textContent = `${fmtTime(last[1])} aujourd’hui`;
  svg.appendChild(v);
  return svg;
}

function chartRevenue() {
  const W = 760, H = 300, P = { t: 26, r: 24, b: 48, l: 48 };
  const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Répartition des revenus : disque, téléchargement, streaming' });
  const gw = (W - P.l - P.r) / REVENUE.length;
  const bh = H - P.t - P.b;
  const ys = p => H - P.b - (p / 100) * bh;

  [0, 25, 50, 75, 100].forEach(v => {
    svg.appendChild(mk('line', { class: 'grid-line', x1: P.l, x2: W - P.r, y1: ys(v), y2: ys(v) }));
    const t = mk('text', { class: 'axis', x: P.l - 10, y: ys(v) + 4, 'text-anchor': 'end' });
    t.textContent = v + '%';
    svg.appendChild(t);
  });

  REVENUE.forEach(([yr, phys, down, stream], i) => {
    const x = P.l + i * gw + gw * 0.18, w = gw * 0.64;
    const seg = [
      { v: stream, cls: 'bar-stream', name: 'streaming' },
      { v: phys, cls: 'bar-phys', name: 'disque & vinyle' },
      { v: down, cls: 'bar-down', name: 'téléchargement' }
    ];
    let acc = 0;
    seg.forEach(s => {
      const h = (s.v / 100) * bh;
      const r = mk('rect', { class: s.cls, x, y: H - P.b - acc - h, width: w, height: h, rx: 2 });
      const t = mk('title');
      t.textContent = `${yr} · ${s.name} : ${s.v} %`;
      r.appendChild(t);
      svg.appendChild(r);
      if (s.v >= 10) {
        const lb = mk('text', { class: 'axis', x: x + w / 2, y: H - P.b - acc - h / 2 + 4, 'text-anchor': 'middle', fill: 'rgba(255,255,255,.9)' });
        lb.textContent = s.v + '%';
        svg.appendChild(lb);
      }
      acc += h;
    });
    const t = mk('text', { class: 'axis', x: x + w / 2, y: H - P.b + 20, 'text-anchor': 'middle' });
    t.textContent = yr;
    svg.appendChild(t);
  });

  const legend = mk('g');
  [['bar-stream', 'streaming'], ['bar-phys', 'disque & vinyle'], ['bar-down', 'téléchargement']].forEach(([cls, name], i) => {
    const lx = P.l + i * 150;
    legend.appendChild(mk('rect', { class: cls, x: lx, y: H - 16, width: 11, height: 11, rx: 2 }));
    const t = mk('text', { class: 'axis', x: lx + 18, y: H - 7 });
    t.textContent = name;
    legend.appendChild(t);
  });
  svg.appendChild(legend);
  return svg;
}

$('#chart-length').appendChild(chartLength());
$('#chart-revenue').appendChild(chartRevenue());

/* ============================================================
   6. QUIZ
   ============================================================ */

let qi = 0, score = 0, answered = false;
const quiz = $('#quiz');

function renderQuiz() {
  const q = QUIZ[qi];
  answered = false;
  quiz.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-top">
        <span class="quiz-step">Question ${qi + 1} / ${QUIZ.length}</span>
        <span class="quiz-score">Score : ${score}</span>
      </div>
      <p class="quiz-clue">${q.clue}</p>
      <p class="quiz-hint">${q.hint}</p>
      <div class="quiz-answers">
        ${q.answers.map((a, i) => `<button class="quiz-btn" data-i="${i}">${a.label}</button>`).join('')}
      </div>
      <p class="quiz-verdict" id="quiz-verdict" role="status" aria-live="polite"></p>
      <button class="btn btn-primary quiz-next" id="quiz-next" hidden>Question suivante →</button>
    </div>`;
}

function renderQuizDone() {
  const msg =
    score === QUIZ.length ? "Oreille d’exception : tu reconnais une époque à une seule note."
    : score >= 4 ? "Très bonne oreille. Un ou deux détails supplémentaires et tu dates tout."
    : score >= 2 ? "Bonne base : les technos font vraiment le plus dur à dater."
    : "Reviens à la frise : chaque époque a son détail qui la date.";
  quiz.innerHTML = `
    <div class="quiz-card quiz-done">
      <p class="big">${score} / ${QUIZ.length}</p>
      <p>${msg}</p>
      <button class="btn btn-ghost quiz-next" data-action="quiz-reset">Recommencer</button>
    </div>`;
}

quiz.addEventListener('click', ev => {
  const btn = ev.target.closest('.quiz-btn');
  if (btn) {
    if (answered) return;
    answered = true;
    const q = QUIZ[qi];
    const i = +btn.dataset.i;
    if (q.answers[i].ok) score++;
    $$('.quiz-btn', quiz).forEach(b => {
      b.disabled = true;
      if (q.answers[+b.dataset.i].ok) b.classList.add('is-good');
      else if (b === btn) b.classList.add('is-bad');
    });
    $('#quiz-verdict').innerHTML = q.answers[i].ok
      ? `<strong>Oui.</strong> ${q.tell}`
      : `<strong>Pas tout à fait.</strong> ${q.tell}`;
    $('.quiz-score', quiz).textContent = `Score : ${score}`;
    const next = $('#quiz-next');
    next.hidden = false;
    next.textContent = qi === QUIZ.length - 1 ? 'Voir le résultat' : 'Question suivante →';
    next.focus();
    return;
  }
  if (ev.target.id === 'quiz-next') {
    if (qi === QUIZ.length - 1) renderQuizDone();
    else { qi++; renderQuiz(); }
  }
});

/* ============================================================
   7. ACTIONS, SCROLL, COMPTEURS, NAV
   ============================================================ */

document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-action]');
  if (!b) return;
  const act = b.dataset.action;
  if (act === 'play') {
    const wasPlaying = A.playing;
    toggle(ERAS[current]);
    /* le bouton du panneau amène vers la salle d'écoute quand la lecture démarre */
    if (!wasPlaying && b.dataset.scroll) $('#' + b.dataset.scroll).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
  else if (act === 'prev') setEra(current - 1);
  else if (act === 'next') setEra(current + 1);
  else if (act === 'quiz-reset') { qi = 0; score = 0; renderQuiz(); }
});

const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('is-stuck', scrollY > 30), { passive: true });

$('#inv-grid').innerHTML = INVENTIONS.map(i => `
  <li class="inv-item" data-reveal>
    <span class="ico-big" aria-hidden="true">${i.icon}</span>
    <span class="yr">${i.year}</span>
    <h3>${i.title}</h3>
    <p>${i.text}</p>
  </li>`).join('');

/* reveal + compteurs.
   IntersectionObserver fait le travail normal ; le repli scroll/rAF garantit
   qu'un bloc déjà visible s'affiche même si l'observer ne se déclenche pas
   (onglet en arrière-plan, capture full-page, navigateur exotique). */
const revealables = $$('[data-reveal]');
const counters = $$('[data-count]');

function show(el) {
  el.classList.add('is-in');
  const target = +el.dataset.count;
  if (target) countUp(el, target);
}

function countUp(el, target) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  if (reduced) { el.textContent = target; return; }
  const dur = 1100, t0 = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  /* filet de sécurité : si les frames sont suspendues (onglet en arrière-plan),
     la valeur finale est posée quand même */
  setTimeout(() => { el.textContent = target; }, dur + 400);
}

const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    show(en.target);
    io.unobserve(en.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
revealables.forEach(el => io.observe(el));

/* repli : ce qui est déjà à l'écran s'affiche d'office */
function sweepReveal() {
  const h = innerHeight;
  for (const el of revealables) {
    if (el.classList.contains('is-in')) continue;
    const r = el.getBoundingClientRect();
    if (r.top < h * 0.92 && r.bottom > 0) { show(el); io.unobserve(el); }
  }
  for (const el of counters) {           /* les compteurs du hero */
    const r = el.getBoundingClientRect();
    if (r.top < h && r.bottom > 0) countUp(el, +el.dataset.count);
  }
}
let sweepQueued = false;
addEventListener('scroll', () => {
  if (sweepQueued) return;
  sweepQueued = true;
  requestAnimationFrame(() => { sweepQueued = false; sweepReveal(); });
}, { passive: true });
sweepReveal();

/* nav active */
const nio = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const id = `#${en.target.id}`;
    $$('.nav-links a').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => nio.observe(s));

/* raccourcis clavier : lecture/pause.
   Les flèches ne sont actives que dans le rail (le focus doit être dessus),
   sinon elles servent à faire défiler la page tranquillement. */
addEventListener('keydown', ev => {
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  if (ev.target.matches('input,textarea,select')) return;
  if (ev.target.closest && ev.target.closest('#rail')) return;
  if (ev.key === 'p' || ev.key === 'P') toggle(ERAS[current]);
});

addEventListener('resize', fitCanvas);

/* impression : on révèle tout, sinon la page sort vide */
addEventListener('beforeprint', () => $$('[data-reveal]').forEach(el => el.classList.add('is-in')));

/* ---- démarrage ---- */
buildRail();
setEra(0, { noScroll: true });
renderQuiz();
fitCanvas();
drawViz();
