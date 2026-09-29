import { VacinaCatalogItem, VacinaFonte } from '../types';

export const VACCINE_AGE_GROUPS = [
  { id: 'ao-nascer', label: 'Ao nascer', ageOrder: 0, desc: 'Primeiras 24 horas de vida' },
  { id: '2-meses', label: '2 meses', ageOrder: 2, desc: 'Início da primovacinação básica' },
  { id: '3-meses', label: '3 meses', ageOrder: 3, desc: 'Proteção contra meningites bacterianas' },
  { id: '4-meses', label: '4 meses', ageOrder: 4, desc: 'Segunda etapa da vacinação de 2 meses' },
  { id: '5-meses', label: '5 meses', ageOrder: 5, desc: 'Segunda dose contra meningite' },
  { id: '6-meses', label: '6 meses', ageOrder: 6, desc: 'Terceira etapa e início de vacinas sazonais' },
  { id: '7-meses', label: '7 meses', ageOrder: 7, desc: 'Doses subsequentes de proteção' },
  { id: '9-meses', label: '9 meses', ageOrder: 9, desc: 'Proteção contra febre amarela e covid' },
  { id: '12-meses', label: '12 meses (1 ano)', ageOrder: 12, desc: 'Primeiro aniversário: reforços e tríplice viral' },
  { id: '15-meses', label: '15 meses (1 ano e 3m)', ageOrder: 15, desc: 'Primeiros reforços e hepatite A' },
  { id: '18-meses', label: '18 meses (1 ano e 6m)', ageOrder: 18, desc: 'Consolidação do esquema particular' },
  { id: '4-anos', label: '4 anos', ageOrder: 48, desc: 'Reforços pré-escolares indispensáveis' },
  { id: '9-14-anos', label: '9 a 14 anos', ageOrder: 108, desc: 'Proteção na pré-adolescência (HPV e ACWY)' },
  { id: 'especiais', label: 'Outras & Campanhas', ageOrder: 999, desc: 'Dengue, campanhas anuais e extras' },
];

export const VACCINES_CATALOG: VacinaCatalogItem[] = [
  // --- AO NASCER ---
  {
    id: 'bcg-dose-unica',
    nome: 'BCG (Bacilo Calmette-Guérin)',
    dose: 'Dose única',
    idadeRecomendada: 'Ao nascer',
    ageOrder: 0,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege contra as formas mais graves de tuberculose.',
    paraQueServe:
      'A vacina BCG protege os recém-nascidos contra as formas graves da tuberculose, principalmente a meningite tuberculosa e a tuberculose miliar (disseminada por todo o corpo). É essencial ser aplicada o mais cedo possível após o nascimento, preferencialmente na maternidade nas primeiras horas de vida.',
    doencasEvitadas: ['Tuberculose miliar', 'Meningite tuberculosa'],
    reacoesComuns:
      'Normalmente forma uma mancha vermelha que evolui para uma pústula (pequena feridinha com casquinha) entre 3 e 4 semanas após a aplicação, deixando a famosa marquinha no braço direito. Não há febre na maioria dos casos.',
    cuidados:
      'Lave o local apenas com água e sabão durante o banho normal. NUNCA esprema, não coloque pomadas, curativos ou álcool sobre a casquinha. A evolução da marquinha é natural e esperada.',
  },
  {
    id: 'hep-b-ao-nascer',
    nome: 'Hepatite B',
    dose: 'Dose ao nascer',
    idadeRecomendada: 'Ao nascer',
    ageOrder: 0,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege o bebê contra o vírus da Hepatite B.',
    paraQueServe:
      'Previne a infecção crônica pelo vírus da Hepatite B, que causa inflamação grave e danos silenciosos no fígado (podendo levar à cirrose ou câncer hepático no futuro). É aplicada na coxa do bebê idealmente nas primeiras 12 a 24 horas de vida para evitar a transmissão vertical de mãe para filho.',
    doencasEvitadas: ['Hepatite B crônica', 'Cirrose hepática infantil', 'Falência hepática'],
    reacoesComuns: 'Dor e vermelhidão leve no local da injeção. Raras vezes pode causar febrícula passageira.',
    cuidados: 'Compressa fria se o local ficar avermelhado. Não massageie o músculo da coxa.',
  },

  // --- 2 MESES ---
  {
    id: 'penta-1',
    nome: 'Pentavalente (DTP + Hib + Hep B)',
    dose: '1ª Dose',
    idadeRecomendada: '2 meses',
    ageOrder: 2,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Super vacina combinada que protege contra 5 doenças graves.',
    paraQueServe:
      'A Pentavalente protege contra 5 infecções gravíssimas da infância: Difteria (infecção das vias aéreas com sufocamento), Tétano (espasmos musculares severos), Coqueluche (tosse convulsa perigosa em bebês), infecções por Haemophilus influenzae tipo b (meningite e pneumonia) e Hepatite B.',
    doencasEvitadas: ['Difteria', 'Tétano', 'Coqueluche', 'Meningite por Hib', 'Hepatite B'],
    reacoesComuns:
      'Febre (nas primeiras 24 a 48h), irritabilidade, choro e inchaço no local da injeção são relativamente frequentes devido ao componente celular da coqueluche.',
    cuidados:
      'Ofereça mais leite materno ou água se orientado pelo médico. Faça compressa fria no local da aplicação. Antitérmico apenas conforme prescrição do pediatra.',
    particularInfo:
      'Na rede privada existe a versão Hexavalente Acelular (DTPa-VIP-HB-Hib), que produz menos febre, menos dor e inclui a poliomielite na mesma picada.',
  },
  {
    id: 'vip-1',
    nome: 'VIP (Poliomielite Inativada)',
    dose: '1ª Dose',
    idadeRecomendada: '2 meses',
    ageOrder: 2,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege contra o vírus da paralisia infantil.',
    paraQueServe:
      'A Vacina Inativada Poliomielite (VIP) é injetável e protege contra os 3 poliovírus causadores da paralisia infantil. Substituiu em grande parte as gotinhas nos primeiros meses, garantindo máxima eficácia sem riscos de efeitos adversos virais.',
    doencasEvitadas: ['Paralisia infantil (Poliomielite)', 'Mielite flácida'],
    reacoesComuns: 'Geralmente muito bem tolerada. Pode dar leve sensibilidade na perninha.',
    cuidados: 'Manter a rotina de banho e amamentação normalmente.',
  },
  {
    id: 'pneumo-10-1',
    nome: 'Pneumocócica 10-Valente',
    dose: '1ª Dose',
    idadeRecomendada: '2 meses',
    ageOrder: 2,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege contra pneumonias bacterianas, meningites e otites.',
    paraQueServe:
      'Protege o bebê contra 10 dos sorotipos mais perigosos da bactéria Streptococcus pneumoniae (pneumococo), responsável pelas principais causas de pneumonia com internação, meningite bacteriana e otite média aguda em crianças pequenas.',
    doencasEvitadas: ['Pneumonia bacteriana', 'Meningite pneumocócica', 'Otite média', 'Sepse'],
    reacoesComuns: 'Febre baixa, diminuição passageira do apetite e endurecimento leve no local.',
    cuidados: 'Compressa fria se houver dor no local. Muito carinho e amamentação em livre demanda.',
    particularInfo:
      'Na rede particular é oferecida a Pneumocócica 13-Valente ou 15-Valente, que amplia a proteção cobrindo 3 ou 5 sorotipos adicionais de bactérias.',
  },
  {
    id: 'rotavirus-1',
    nome: 'Rotavírus Humano (VRH)',
    dose: '1ª Dose',
    idadeRecomendada: '2 meses',
    ageOrder: 2,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Gotinha oral que previne diarreias graves e desidratação.',
    paraQueServe:
      'Administrada por via oral (gotinha), protege contra o rotavírus, o principal vírus causador de gastrenterite aguda grave, vômitos contínuos e desidratação que levavam milhares de bebês à internação hospitalar antes da vacina.',
    doencasEvitadas: ['Gastroenterite por rotavírus', 'Diarreia aguda infantil com desidratação grave'],
    reacoesComuns: 'Cólicas leves, febrícula ou evacuações amolecidas nos dias seguintes.',
    cuidados:
      'Atenção ao prazo limite da 1ª dose (até 3 meses e 15 dias). Lave muito bem as mãos após trocar fraldas por cerca de 14 dias.',
    particularInfo:
      'Na rede particular, a vacina Pentavalente de Rotavírus protege contra 5 cepas virais diferentes (G1, G2, G3, G4 e P1A).',
  },
  {
    id: 'hexavalente-particular-1',
    nome: 'Hexavalente Acelular (DTPa-VIP-HB-Hib)',
    dose: '1ª Dose (Alternativa particular)',
    idadeRecomendada: '2 meses',
    ageOrder: 2,
    oferta: 'Particular',
    obrigatoria: false,
    descricaoCurta: 'Opção da rede privada com componente acelular (menos efeitos) e 6 vacinas em 1.',
    paraQueServe:
      'Combina no mesmo frasco a proteção contra Difteria, Tétano, Coqueluche Acelular, Poliomielite, Hepatite B e Haemophilus b. Por ser acelular, apresenta taxa drasticamente menor de febre alta, choro inconsolável e dores locais.',
    doencasEvitadas: ['Difteria', 'Tétano', 'Coqueluche', 'Poliomielite', 'Hepatite B', 'Meningite Hib'],
    reacoesComuns: 'Excelente tolerância; dor local branda ou leve sonolência.',
    cuidados: 'Substitui a Penta + VIP do SUS em uma única picada.',
  },
  {
    id: 'pneumo-13-particular-1',
    nome: 'Pneumocócica 13 ou 15-Valente (Conjugada)',
    dose: '1ª Dose (Opção particular)',
    idadeRecomendada: '2 meses',
    ageOrder: 2,
    oferta: 'Particular',
    obrigatoria: false,
    descricaoCurta: 'Proteção ampliada contra pneumonias e meningites (mais sorotipos).',
    paraQueServe:
      'A vacina conjugada 13-valente ou 15-valente amplia a cobertura em relação à pneumocócica 10V do SUS, incluindo sorotipos como o 19A e 3, frequentemente associados a pneumonias complicadas com derrame pleural e otites resistentes.',
    doencasEvitadas: ['Pneumonia por 13/15 cepas', 'Meningite pneumocócica', 'Bacteremia', 'Otite'],
    reacoesComuns: 'Sensibilidade no local da picada, febrícula rara.',
    cuidados: 'Compressa fria se necessário.',
  },

  // --- 3 MESES ---
  {
    id: 'meningo-c-1',
    nome: 'Meningocócica C (Conjugada)',
    dose: '1ª Dose',
    idadeRecomendada: '3 meses',
    ageOrder: 3,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege contra a meningite bacteriana grave causada pelo meningococo C.',
    paraQueServe:
      'Protege contra infecções gravíssimas causadas pela bactéria Neisseria meningitidis do sorogrupo C, que podem evoluir rapidamente para meningite purulenta e meningococcemia (infecção generalizada na corrente sanguínea com alta letalidade).',
    doencasEvitadas: ['Meningite meningocócica sorogrupo C', 'Meningococcemia fulminante'],
    reacoesComuns: 'Dor e vermelhidão leve no local da picada, irritabilidade leve por 24h.',
    cuidados: 'Compressa fria local. Aconchego e aleitamento.',
    particularInfo:
      'Na rede privada recomenda-se a Meningocócica ACWY (que protege contra 4 tipos de bactérias ao invés de 1) e a Meningocócica B (não disponível na rotina do SUS).',
  },
  {
    id: 'meningo-acwy-particular-1',
    nome: 'Meningocócica ACWY (Conjugada)',
    dose: '1ª Dose (Opção particular)',
    idadeRecomendada: '3 meses',
    ageOrder: 3,
    oferta: 'Particular',
    obrigatoria: false,
    descricaoCurta: 'Protege contra 4 tipos perigosos de meningite bacteriana (A, C, W e Y).',
    paraQueServe:
      'Substitui ou amplia a Meningocócica C, conferindo proteção de amplo espectro contra 4 dos sorogrupos de meningococos com maior circulação mundial e associados a surtos graves (A, C, W-135 e Y).',
    doencasEvitadas: ['Meningites bacterianas pelos sorogrupos A, C, W e Y', 'Sepse meningocócica'],
    reacoesComuns: 'Sensibilidade local, irritabilidade leve.',
    cuidados: 'Pode ser feita na mesma consulta junto com a Meningocócica B.',
  },
  {
    id: 'meningo-b-particular-1',
    nome: 'Meningocócica B (Recombinante)',
    dose: '1ª Dose',
    idadeRecomendada: '3 meses',
    ageOrder: 3,
    oferta: 'Particular',
    obrigatoria: false,
    descricaoCurta: 'Não ofertada pelo SUS na rotina. Protege contra meningite pelo sorogrupo B.',
    paraQueServe:
      'A Meningocócica B protege contra o sorogrupo B do meningococo, que hoje é responsável pela maioria dos casos graves de meningite em lactentes e crianças abaixo de 2 anos no Brasil. Não faz parte do calendário regular do SUS por custo, sendo amplamente recomendada pela Sociedade Brasileira de Pediatria (SBP) e SBIm.',
    doencasEvitadas: ['Meningite meningocócica por sorogrupo B', 'Meningococcemia por sorogrupo B'],
    reacoesComuns:
      'Febre relativamente comum nas primeiras 24 horas, além de dor ou inchaço no local da injeção.',
    cuidados:
      'Muitos pediatras recomendam antitérmico profilático logo após a aplicação da vacina para prevenir pico febril. Consulte seu pediatra.',
  },

  // --- 4 MESES ---
  {
    id: 'penta-2',
    nome: 'Pentavalente (DTP + Hib + Hep B)',
    dose: '2ª Dose',
    idadeRecomendada: '4 meses',
    ageOrder: 4,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Segunda dose do esquema básico de difteria, tétano, coqueluche, Hib e Hep B.',
    paraQueServe:
      'Reforça os anticorpos produzidos na primeira dose para alcançar imunidade sólida e duradoura contra essas 5 graves infecções bacterianas e virais.',
    doencasEvitadas: ['Difteria', 'Tétano', 'Coqueluche', 'Meningite Hib', 'Hepatite B'],
    reacoesComuns: 'Febre baixa ou moderada, dorzinha local, sonolência ou agitação leve.',
    cuidados: 'Compressa fria na coxinha. Antitérmico se prescrito pelo médico.',
  },
  {
    id: 'vip-2',
    nome: 'VIP (Poliomielite Inativada)',
    dose: '2ª Dose',
    idadeRecomendada: '4 meses',
    ageOrder: 4,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Segunda dose contra o vírus da paralisia infantil.',
    paraQueServe: 'Fortalece a imunidade intestinal e sistêmica contra os poliovírus tipos 1, 2 e 3.',
    doencasEvitadas: ['Poliomielite'],
    reacoesComuns: 'Muito raras, geralmente assintomática.',
    cuidados: 'Cuidados habituais de higiene.',
  },
  {
    id: 'pneumo-10-2',
    nome: 'Pneumocócica 10-Valente',
    dose: '2ª Dose',
    idadeRecomendada: '4 meses',
    ageOrder: 4,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Segunda dose contra pneumonias bacterianas e meningites.',
    paraQueServe: 'Garante títulos protetores elevados de anticorpos contra as bactérias pneumocócicas.',
    doencasEvitadas: ['Pneumonias', 'Meningite pneumocócica', 'Infecções invasivas'],
    reacoesComuns: 'Vermelhidão leve, febre baixa.',
    cuidados: 'Compressa fria se houver dor local.',
  },
  {
    id: 'rotavirus-2',
    nome: 'Rotavírus Humano (VRH)',
    dose: '2ª Dose',
    idadeRecomendada: '4 meses',
    ageOrder: 4,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Segunda gotinha para completar o esquema contra rotavírus.',
    paraQueServe:
      'Finaliza o ciclo básico de proteção contra infecções por rotavírus. Limite de aplicação: até 7 meses e 29 dias.',
    doencasEvitadas: ['Diarreia grave e desidratação por rotavírus'],
    reacoesComuns: 'Fezes amolecidas ou pequenas cólicas passageiras.',
    cuidados: 'Higienização rigorosa das mãos ao trocar a fralda.',
  },

  // --- 5 MESES ---
  {
    id: 'meningo-c-2',
    nome: 'Meningocócica C (Conjugada)',
    dose: '2ª Dose',
    idadeRecomendada: '5 meses',
    ageOrder: 5,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Segunda dose contra a meningite bacteriana pelo meningococo C.',
    paraQueServe:
      'Consolida a memória imunológica contra a bactéria meningococo C antes do primeiro ano de vida.',
    doencasEvitadas: ['Meningite meningocócica tipo C'],
    reacoesComuns: 'Sensibilidade na perninha, leve indisposição passageira.',
    cuidados: 'Compressas frias se necessário.',
  },
  {
    id: 'meningo-b-particular-2',
    nome: 'Meningocócica B (Recombinante)',
    dose: '2ª Dose',
    idadeRecomendada: '5 meses',
    ageOrder: 5,
    oferta: 'Particular',
    obrigatoria: false,
    descricaoCurta: 'Segunda dose da vacina particular contra meningite B.',
    paraQueServe:
      'Garante que o organismo produza defesas duradouras contra as proteínas da cápsula externa do meningococo B.',
    doencasEvitadas: ['Meningite meningocócica B', 'Meningococcemia fulminante'],
    reacoesComuns: 'Febre nas primeiras 24h e dor no local.',
    cuidados: 'Orientação médica sobre antitérmicos e compressa fria.',
  },

  // --- 6 MESES ---
  {
    id: 'penta-3',
    nome: 'Pentavalente (DTP + Hib + Hep B)',
    dose: '3ª Dose',
    idadeRecomendada: '6 meses',
    ageOrder: 6,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Terceira dose para fechar o esquema primário da Pentavalente.',
    paraQueServe:
      'Garante proteção de longo prazo para difteria, tétano, coqueluche, hepatite B e bactérias invasivas do tipo Hib.',
    doencasEvitadas: ['Difteria', 'Tétano', 'Coqueluche', 'Hepatite B', 'Meningite Hib'],
    reacoesComuns: 'Febre, inchaço na coxinha, agitação.',
    cuidados: 'Compressa fria, manter bebê hidratado.',
  },
  {
    id: 'vip-3',
    nome: 'VIP (Poliomielite Inativada)',
    dose: '3ª Dose',
    idadeRecomendada: '6 meses',
    ageOrder: 6,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Terceira dose para fechar o esquema primário contra a paralisia infantil.',
    paraQueServe: 'Assegura a barreira imunitária completa contra os 3 sorotipos da poliomielite.',
    doencasEvitadas: ['Poliomielite (paralisia infantil)'],
    reacoesComuns: 'Geralmente assintomática.',
    cuidados: 'Cuidados habituais.',
  },
  {
    id: 'covid-1',
    nome: 'Covid-19 Pediátrica',
    dose: '1ª Dose',
    idadeRecomendada: '6 meses',
    ageOrder: 6,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege contra complicações respiratórias e Síndrome Inflamatória Multissistêmica (SIM-P).',
    paraQueServe:
      'Incluída no Calendário Nacional de Vacinação do SUS a partir dos 6 meses de vida, previne hospitalizações, pneumonia viral grave e a Síndrome Inflamatória Multissistêmica Pediátrica associada ao SARS-CoV-2.',
    doencasEvitadas: ['Covid-19 grave', 'Pneumonia por SARS-CoV-2', 'SIM-P'],
    reacoesComuns: 'Sensibilidade no local, sonolência ou febrícula passageira.',
    cuidados: 'Acompanhar temperatura e oferecer bastante líquido.',
  },
  {
    id: 'influenza-1',
    nome: 'Influenza (Gripe)',
    dose: '1ª Dose (Primovacinação)',
    idadeRecomendada: '6 meses',
    ageOrder: 6,
    oferta: 'SUS',
    obrigatoria: false,
    descricaoCurta: 'Protege contra os vírus Influenza A (H1N1, H3N2) e B causadores da gripe forte.',
    paraQueServe:
      'Previne crises respiratórias graves, bronquiolite por influenza, otites secundárias e hospitalizações por gripe forte. No primeiro ano em que a criança recebe a vacina da gripe (a partir dos 6 meses), são necessárias 2 doses com 30 dias de intervalo.',
    doencasEvitadas: ['Gripe sazonal severa', 'Pneumonia pós-influenza', 'Síndrome Respiratória Aguda Grave (SRAG)'],
    reacoesComuns: 'Febre baixa, dor leve local ou coriza passageira.',
    cuidados: 'Manter a criança bem agasalhada e hidratada.',
  },

  // --- 7 MESES ---
  {
    id: 'covid-2',
    nome: 'Covid-19 Pediátrica',
    dose: '2ª Dose',
    idadeRecomendada: '7 meses',
    ageOrder: 7,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Segunda dose (4 semanas após a 1ª dose).',
    paraQueServe: 'Potencializa e consolida a resposta celular de proteção contra a Covid-19.',
    doencasEvitadas: ['Covid-19 grave'],
    reacoesComuns: 'Dor leve no local.',
    cuidados: 'Compressa fria se necessário.',
  },
  {
    id: 'influenza-2',
    nome: 'Influenza (Gripe)',
    dose: '2ª Dose (Primovacinação)',
    idadeRecomendada: '7 meses',
    ageOrder: 7,
    oferta: 'SUS',
    obrigatoria: false,
    descricaoCurta: 'Segunda dose para bebês tomando a vacina da gripe pela primeira vez na vida.',
    paraQueServe:
      'Assegura a cobertura antigênica completa contra as cepas de influenza em circulação.',
    doencasEvitadas: ['Gripe grave por influenza'],
    reacoesComuns: 'Leve indisposição passageira.',
    cuidados: 'Repouso e hidratação.',
  },

  // --- 9 MESES ---
  {
    id: 'febre-amarela-1',
    nome: 'Febre Amarela',
    dose: 'Dose Inicial aos 9 meses',
    idadeRecomendada: '9 meses',
    ageOrder: 9,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege contra o vírus da febre amarela transmitido por mosquitos.',
    paraQueServe:
      'Protege contra a febre amarela, uma doença infecciosa aguda grave com alto risco de hemorragias e insuficiência hepatorrenal. É obrigatória em todo o território nacional.',
    doencasEvitadas: ['Febre amarela urbana e silvestre', 'Hemorragias virais'],
    reacoesComuns: 'Febre baixa, dores no corpinho e irritabilidade por volta do 4º ao 7º dia após a dose.',
    cuidados: 'Não usar medicamentos à base de ácido acetilsalicílico (AAS). Manter boa hidratação.',
  },
  {
    id: 'covid-3',
    nome: 'Covid-19 Pediátrica',
    dose: '3ª Dose / Reforço',
    idadeRecomendada: '9 meses',
    ageOrder: 9,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Dose de reforço (8 semanas após a 2ª dose).',
    paraQueServe: 'Fecha o esquema inicial de vacinação contra a Covid-19 em lactentes.',
    doencasEvitadas: ['Covid-19 grave'],
    reacoesComuns: 'Geralmente leve.',
    cuidados: 'Compressa fria se houver dor no local.',
  },

  // --- 12 MESES (1 ANO) ---
  {
    id: 'triplice-viral-1',
    nome: 'Tríplice Viral (SCR)',
    dose: '1ª Dose',
    idadeRecomendada: '12 meses (1 ano)',
    ageOrder: 12,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege contra Sarampo, Caxumba e Rubéola.',
    paraQueServe:
      'Fundamental para prevenir o Sarampo (doença altamente contagiosa que pode causar cegueira, pneumonia e encefalite fatal), a Caxumba (inflamação das glândulas parótidas e risco de surdez ou orquite) e a Rubéola (que causa manchas e síndrome da rubéola congênita).',
    doencasEvitadas: ['Sarampo', 'Caxumba', 'Rubéola'],
    reacoesComuns:
      'Pode causar febre e pequenas manchinhas vermelhas na pele (rash) cerca de 5 a 12 dias após a aplicação (é o organismo reagindo aos vírus atenuados).',
    cuidados: 'Compressa fria se o braço doer. Antitérmico se houver febre alta tardia.',
  },
  {
    id: 'pneumo-10-reforco',
    nome: 'Pneumocócica 10-Valente',
    dose: 'Dose de Reforço (1 ano)',
    idadeRecomendada: '12 meses (1 ano)',
    ageOrder: 12,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Dose de reforço indispensável aos 12 meses.',
    paraQueServe:
      'Garante que os anticorpos contra bactérias causadoras de pneumonias e meningites se mantenham em níveis protetores durante a primeira infância.',
    doencasEvitadas: ['Pneumonia', 'Meningite pneumocócica'],
    reacoesComuns: 'Dor e calor no local.',
    cuidados: 'Compressa fria.',
  },
  {
    id: 'meningo-c-reforco',
    nome: 'Meningocócica C',
    dose: 'Dose de Reforço (1 ano)',
    idadeRecomendada: '12 meses (1 ano)',
    ageOrder: 12,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Dose de reforço contra meningite bacteriana C.',
    paraQueServe: 'Fixa a memória imunológica contra a bactéria meningococo C.',
    doencasEvitadas: ['Meningite C'],
    reacoesComuns: 'Dorzinha local, agitação passageira.',
    cuidados: 'Compressa fria se necessário.',
    particularInfo:
      'Na rede privada pode ser feito o reforço com a Meningocócica ACWY (conferindo proteção para os outros 3 sorogrupos).',
  },
  {
    id: 'meningo-b-particular-reforco',
    nome: 'Meningocócica B',
    dose: 'Dose de Reforço (1 ano)',
    idadeRecomendada: '12 meses (1 ano)',
    ageOrder: 12,
    oferta: 'Particular',
    obrigatoria: false,
    descricaoCurta: 'Dose de reforço da vacina particular contra meningite B.',
    paraQueServe:
      'Reforço recomendado pela SBIm entre 12 e 15 meses para bebês que iniciaram o esquema aos 3 e 5 meses.',
    doencasEvitadas: ['Meningite meningocócica B'],
    reacoesComuns: 'Febre nas 24h seguintes e dor no local.',
    cuidados: 'Orientação pediátrica para medicação antitérmica.',
  },
  {
    id: 'hepatite-a-particular-1',
    nome: 'Hepatite A',
    dose: '1ª Dose (Opção particular aos 12m)',
    idadeRecomendada: '12 meses (1 ano)',
    ageOrder: 12,
    oferta: 'Particular',
    obrigatoria: false,
    descricaoCurta: 'Início do esquema de 2 doses na rede privada (no SUS é aplicada aos 15 meses).',
    paraQueServe:
      'Protege contra a Hepatite A, infecção viral transmitida por água e alimentos contaminados que provoca inflamação aguda no fígado, icterícia e náuseas fortes.',
    doencasEvitadas: ['Hepatite A'],
    reacoesComuns: 'Muito suave, quase sem reações adversas.',
    cuidados: 'Cuidados normais.',
  },
  {
    id: 'varicela-particular-1',
    nome: 'Varicela (Catapora)',
    dose: '1ª Dose (Opção particular aos 12m)',
    idadeRecomendada: '12 meses (1 ano)',
    ageOrder: 12,
    oferta: 'Particular',
    obrigatoria: false,
    descricaoCurta: 'Protege contra a catapora aos 12 meses (no SUS é ofertada aos 15m).',
    paraQueServe:
      'Previne a catapora e suas complicações (infecção secundária de pele com bactérias, pneumonia varicelosa e encefalite).',
    doencasEvitadas: ['Catapora (Varicela)', 'Infecções cutâneas graves por estafilococo'],
    reacoesComuns: 'Febre baixa tardia e pequenas vesículas isoladas após 1 a 2 semanas.',
    cuidados: 'Não coçar caso surja alguma bolhinha.',
  },

  // --- 15 MESES (1 ANO E 3 MESES) ---
  {
    id: 'dtp-reforco-1',
    nome: 'DTP (Tríplice Bacteriana)',
    dose: '1º Reforço',
    idadeRecomendada: '15 meses',
    ageOrder: 15,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Primeiro reforço contra Difteria, Tétano e Coqueluche.',
    paraQueServe:
      'Mantém os níveis de proteção contra bactérias produtoras de toxinas perigosas como o tétano e a bactéria da tosse comprida (coqueluche).',
    doencasEvitadas: ['Difteria', 'Tétano', 'Coqueluche'],
    reacoesComuns: 'Febre, inchaço e dor no braço ou perninha.',
    cuidados: 'Compressa fria local.',
    particularInfo:
      'Na rede privada pode ser utilizada a DTPa Acelular (muito menos dolorosa e com menos febre).',
  },
  {
    id: 'vip-reforco-1',
    nome: 'VIP (Poliomielite)',
    dose: '1º Reforço',
    idadeRecomendada: '15 meses',
    ageOrder: 15,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Primeiro reforço injetável contra paralisia infantil.',
    paraQueServe: 'Garante que a proteção contra poliomielite permaneça firme na fase em que o bebê começa a andar e interagir com outros ambientes.',
    doencasEvitadas: ['Poliomielite'],
    reacoesComuns: 'Geralmente assintomática.',
    cuidados: 'Habituais.',
  },
  {
    id: 'tetra-viral-1',
    nome: 'Tetra Viral (SCRV) ou Tríplice + Varicela',
    dose: 'Dose única / 1ª Dose da Varicela',
    idadeRecomendada: '15 meses',
    ageOrder: 15,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege contra Sarampo, Caxumba, Rubéola e Catapora (Varicela).',
    paraQueServe:
      'Funciona como segunda dose de proteção contra sarampo, caxumba e rubéola, e primeira dose de proteção contra a catapora no calendário do SUS.',
    doencasEvitadas: ['Sarampo', 'Caxumba', 'Rubéola', 'Varicela (Catapora)'],
    reacoesComuns: 'Febre baixa entre o 5º e o 12º dia após a aplicação, possíveis manchinhas transitórias.',
    cuidados: 'Acompanhamento normal. Não usar AAS.',
  },
  {
    id: 'hepatite-a-sus',
    nome: 'Hepatite A',
    dose: 'Dose única SUS',
    idadeRecomendada: '15 meses',
    ageOrder: 15,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Dose pública fornecida pelo SUS para proteção do fígado contra hepatite A.',
    paraQueServe:
      'Previne a contaminação e surtos de hepatite A em creches e escolas infantis.',
    doencasEvitadas: ['Hepatite A', 'Icterícia viral'],
    reacoesComuns: 'Muito brandas; dorzinha no local.',
    cuidados: 'Compressa fria se houver incômodo.',
    particularInfo:
      'A Sociedade Brasileira de Imunizações (SBIm) recomenda um esquema de 2 doses de Hepatite A para imunidade por décadas.',
  },

  // --- 18 MESES (1 ANO E 6 MESES) ---
  {
    id: 'hepatite-a-particular-2',
    nome: 'Hepatite A (2ª Dose Particular)',
    dose: '2ª Dose (Consolidação)',
    idadeRecomendada: '18 meses',
    ageOrder: 18,
    oferta: 'Particular',
    obrigatoria: false,
    descricaoCurta: 'Segunda dose recomendada pela SBIm (6 meses após a 1ª dose particular).',
    paraQueServe:
      'Assegura níveis de proteção contra o vírus da Hepatite A praticamente para a vida toda.',
    doencasEvitadas: ['Hepatite A de repetição'],
    reacoesComuns: 'Mínimas.',
    cuidados: 'Cuidados habituais.',
  },

  // --- 4 ANOS ---
  {
    id: 'dtp-reforco-2',
    nome: 'DTP (Tríplice Bacteriana)',
    dose: '2º Reforço',
    idadeRecomendada: '4 anos',
    ageOrder: 48,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Segundo reforço contra difteria, tétano e coqueluche antes da fase escolar.',
    paraQueServe:
      'Renova a proteção imunológica que começa a decair aos 4 anos de idade, prevenindo surtos de tosse convulsa e infecções tétano em caso de ferimentos e quedas infantis.',
    doencasEvitadas: ['Difteria', 'Tétano', 'Coqueluche'],
    reacoesComuns: 'Dor, calor ou endurecimento no bracinho.',
    cuidados: 'Compressa fria. Na rede particular há a versão acelular (DTPa).',
  },
  {
    id: 'vip-reforco-2',
    nome: 'VIP (Poliomielite)',
    dose: '2º Reforço',
    idadeRecomendada: '4 anos',
    ageOrder: 48,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Segundo reforço contra a paralisia infantil.',
    paraQueServe: 'Consolida a erradicação do vírus da pólio no organismo da criança.',
    doencasEvitadas: ['Poliomielite'],
    reacoesComuns: 'Geralmente nenhuma reação relevante.',
    cuidados: 'Habituais.',
  },
  {
    id: 'varicela-sus-2',
    nome: 'Varicela (Catapora)',
    dose: '2ª Dose / Reforço',
    idadeRecomendada: '4 anos',
    ageOrder: 48,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Segunda dose da vacina da catapora ofertada pelo SUS aos 4 anos.',
    paraQueServe:
      'Garante eficácia próxima de 100% contra catapora e impede transmissão comunitária em salas de aula e recreações.',
    doencasEvitadas: ['Varicela', 'Cicatrizes cutâneas e herpes-zóster futuro'],
    reacoesComuns: 'Muito rara.',
    cuidados: 'Habituais.',
  },
  {
    id: 'febre-amarela-reforco',
    nome: 'Febre Amarela',
    dose: 'Dose de Reforço aos 4 anos',
    idadeRecomendada: '4 anos',
    ageOrder: 48,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Dose de reforço para quem tomou a primeira dose aos 9 meses.',
    paraQueServe: 'Garante imunidade sustentada para a vida toda contra a febre amarela.',
    doencasEvitadas: ['Febre amarela'],
    reacoesComuns: 'Febre baixa tardia, dor no corpo passageira.',
    cuidados: 'Manter hidratação e repouso.',
  },

  // --- 9 A 14 ANOS ---
  {
    id: 'hpv-quadrivalente',
    nome: 'HPV Quadrivalente (Tipos 6, 11, 16 e 18)',
    dose: 'Dose Única (Conforme nova diretriz PNI)',
    idadeRecomendada: '9 a 14 anos',
    ageOrder: 108,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Protege contra o vírus causador de câncer de colo de útero, garganta e verrugas genitais.',
    paraQueServe:
      'Aplicada em meninas e meninos de 9 a 14 anos, previne mais de 90% dos casos de câncer de colo de útero, câncer de pênis, ânus e orofaringe, além de verrugas genitais condilomatosas. É uma verdadeira vacina preventiva contra o câncer!',
    doencasEvitadas: ['Câncer de colo do útero', 'Câncer de orofaringe', 'Câncer de pênis/ânus', 'Verrugas por HPV'],
    reacoesComuns: 'Dor no braço da aplicação e febre baixa em alguns casos.',
    cuidados: 'Permanecer sentado por 15 minutos após a aplicação para evitar tonturas passageiras.',
    particularInfo:
      'Na rede privada está disponível a vacina HPV Nonavalente (Gardasil 9), que protege contra 9 tipos de HPV ao invés de 4.',
  },
  {
    id: 'meningo-acwy-adolescente',
    nome: 'Meningocócica ACWY (Conjugada)',
    dose: 'Reforço na Adolescência (11 a 14 anos)',
    idadeRecomendada: '9 a 14 anos',
    ageOrder: 108,
    oferta: 'SUS',
    obrigatoria: true,
    descricaoCurta: 'Proteção contra surtos de meningite bacteriana em escolas e adolescentes.',
    paraQueServe:
      'Reforça os anticorpos contra 4 sorotipos fatais de meningite (A, C, W, Y) justamente na idade em que a circulação do agente entre jovens aumenta.',
    doencasEvitadas: ['Meningite meningocócica', 'Infecção generalizada por meningococo'],
    reacoesComuns: 'Dor no braço e cansaço leve.',
    cuidados: 'Compressa fria.',
  },

  // --- ESPECIAIS & CAMPANHAS ---
  {
    id: 'dengue-qdenga',
    nome: 'Dengue (Qdenga)',
    dose: 'Esquema de 2 Doses (Intervalo de 3 meses)',
    idadeRecomendada: 'Campanhas / A partir de 4 anos',
    ageOrder: 999,
    oferta: 'Ambos',
    obrigatoria: false,
    descricaoCurta: 'Protege contra os 4 sorotipos da Dengue em pessoas que já tiveram ou nunca tiveram dengue.',
    paraQueServe:
      'A vacina atenuada tetravalente contra a Dengue protege contra os vírus DENV-1, DENV-2, DENV-3 e DENV-4, reduzindo em mais de 80% as formas graves com hemorragia e hospitalizações. Ofertada pelo SUS para faixas prioritárias de 10 a 14 anos em municípios selecionados, e na rede particular a partir dos 4 anos de idade.',
    doencasEvitadas: ['Dengue grave / hemorrágica', 'Hospitalização por dengue'],
    reacoesComuns: 'Dor de cabeça, dor muscular leve, sensibilidade no local.',
    cuidados: 'Contraindicada em gestantes e imunossuprimidos graves por ser vírus atenuado.',
    particularInfo:
      'Pode ser aplicada em clínicas privadas a partir dos 4 até os 60 anos, independente de sorologia prévia.',
  },
];

/**
 * Retorna a origem oficial da informação, órgão regulador e link direto
 * para acesso pelo responsável (Ministério da Saúde, SBIm, SBP).
 */
export function getVaccineSource(item: VacinaCatalogItem): VacinaFonte {
  if (item.fonte) return item.fonte;

  const id = (item.id || '').toLowerCase();
  const nome = (item.nome || '').toLowerCase();

  // BCG
  if (id.includes('bcg') || nome.includes('bcg')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina BCG (Tuberculose)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-bcg',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Nacional de Vacinação do SUS',
      descricao: 'Informações oficiais do Programa Nacional de Imunizações (PNI) e da Sociedade Brasileira de Imunizações.',
    };
  }

  // Hepatite B
  if (id.includes('hep-b') || (nome.includes('hepatite b') && !nome.includes('hepatite a'))) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina Hepatite B (Recombinante)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-hepatite-b',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Diretrizes do Ministério da Saúde e SBIm sobre prevenção da hepatite B desde o nascimento.',
    };
  }

  // Rotavírus
  if (id.includes('rota') || nome.includes('rotavírus') || nome.includes('rotavirus')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina Rotavírus Humano (VRH e VR5)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-rotavirus',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Esquema vacinal contra gastroenterites graves por rotavírus.',
    };
  }

  // Pneumocócica (10, 13, 15, 23)
  if (id.includes('pneumo') || nome.includes('pneumocócica') || nome.includes('pneumococica')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacinas Pneumocócicas Conjugadas (VPC10, VPC13, VPC15)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-pneumococica-conjugada',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Proteção contra pneumonias bacterianas, meningites e bacteremias causadas por pneumococo.',
    };
  }

  // Meningocócica B
  if (id.includes('meningo-b') || nome.includes('meningocócica b') || nome.includes('meningite b')) {
    return {
      orgao: 'Sociedade Brasileira de Imunizações (SBIm) & SBP',
      nome: 'Vacina Meningocócica B (Recombinante)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-meningococica-b',
      urlSecundaria: 'https://sbim.org.br/calendarios-de-vacinacao',
      nomeSecundaria: 'Calendário de Vacinação da Criança (SBIm)',
      descricao: 'Recomendada pela SBIm e Sociedade Brasileira de Pediatria (SBP) contra o meningococo B.',
    };
  }

  // Meningite C e ACWY
  if (id.includes('meningo') || nome.includes('meningo')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacinas Meningocócicas Conjugadas (C e ACWY)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacinas-meningococicas-conjugadas',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Proteção essencial contra sorotipos circulantes de meningite meningocócica no Brasil.',
    };
  }

  // Pentavalente ou Hexavalente
  if (id.includes('penta') || id.includes('hexa') || nome.includes('pentavalente') || nome.includes('hexavalente')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina Pentavalente / Hexavalente Acelular',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-pentavalente',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Combinação imunológica de alta eficácia contra Difteria, Tétano, Coqueluche, Hepatite B e Hib.',
    };
  }

  // Poliomielite (VIP / VOP)
  if (id.includes('vip') || id.includes('vop') || id.includes('polio') || nome.includes('poliomielite')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina Poliomielite (Inativada VIP)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-poliomielite-vip-vop',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Proteção contra o poliovírus (paralisia infantil), com esquema exclusivo 100% injetável (VIP).',
    };
  }

  // Febre Amarela
  if (id.includes('febre-amarela') || nome.includes('febre amarela')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina Febre Amarela (Atenuada)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-febre-amarela',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Dose recomendada aos 9 meses e reforço aos 4 anos pelo Ministério da Saúde.',
    };
  }

  // Tríplice Viral / Tetraviral
  if (id.includes('triplice-viral') || id.includes('tetraviral') || nome.includes('tríplice viral') || nome.includes('sarampo')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina Tríplice Viral (Sarampo, Caxumba, Rubéola)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-triplice-viral',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Imunização fundamental para o controle do sarampo, rubéola e caxumba.',
    };
  }

  // Hepatite A
  if (id.includes('hep-a') || nome.includes('hepatite a')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina Hepatite A (Inativada)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-hepatite-a',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Proteção hepática recomendada pelo SUS aos 15 meses e na rede privada com 2ª dose.',
    };
  }

  // Varicela (Catapora)
  if (id.includes('varicela') || nome.includes('varicela') || nome.includes('catapora')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina Varicela (Catapora)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-varicela-catapora',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Prevenção contra o vírus varicela-zoster e suas complicações na infância.',
    };
  }

  // DTP / DTPa
  if (id.includes('dtp') || nome.includes('dtp') || nome.includes('coqueluche')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina DTP / DTPa (Tríplice Bacteriana Infantil)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-dtpa',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Reforços recomendados aos 15 meses e 4 anos de idade.',
    };
  }

  // HPV
  if (id.includes('hpv') || nome.includes('hpv')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina HPV (Papilomavírus Humano)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-hpv',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Oficial do SUS',
      descricao: 'Prevenção de cânceres induzidos por HPV (colo uterino, pênis, orofaringe) e verrugas genitais.',
    };
  }

  // Dengue
  if (id.includes('dengue') || nome.includes('dengue')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacina Dengue (Qdenga / Takeda)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacina-dengue',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Portal Oficial do Ministério da Saúde',
      descricao: 'Proteção contra os 4 sorotipos da dengue autorizada pela Anvisa e incorporada ao SUS.',
    };
  }

  // Influenza / Gripe
  if (id.includes('gripe') || id.includes('influenza') || nome.includes('gripe') || nome.includes('influenza')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacinas Gripe / Influenza (Trivalente e Tetravalente)',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacinas-gripe',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Campanha Nacional do SUS',
      descricao: 'Atualizada anualmente com as cepas circulantes para prevenção de internações respiratórias.',
    };
  }

  // Covid-19
  if (id.includes('covid') || nome.includes('covid')) {
    return {
      orgao: 'Ministério da Saúde (PNI) & SBIm Família',
      nome: 'Vacinas Covid-19 Pediátricas',
      url: 'https://familia.sbim.org.br/vacinas/vacinas-disponiveis/vacinas-covid-19',
      urlSecundaria: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
      nomeSecundaria: 'Calendário Básico de Imunização Infantil do SUS',
      descricao: 'Esquema primário contra as novas variantes da Covid-19 a partir dos 6 meses.',
    };
  }

  // Caso genérico baseado na oferta
  if (item.oferta === 'Particular') {
    return {
      orgao: 'Sociedade Brasileira de Imunizações (SBIm) & SBP',
      nome: 'Calendário de Vacinação da Criança (SBIm / SBP)',
      url: 'https://sbim.org.br/calendarios-de-vacinacao',
      urlSecundaria: 'https://www.sbp.com.br',
      nomeSecundaria: 'Sociedade Brasileira de Pediatria (SBP)',
      descricao: 'Recomendação técnica baseada nos consensos científicos da SBIm e da Sociedade Brasileira de Pediatria.',
    };
  }

  return {
    orgao: 'Ministério da Saúde (Brasil) - PNI',
    nome: 'Calendário Nacional de Vacinação da Criança',
    url: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
    urlSecundaria: 'https://sbim.org.br/calendarios-de-vacinacao',
    nomeSecundaria: 'Calendário da Sociedade Brasileira de Imunizações (SBIm)',
    descricao: 'Informações retiradas das tabelas oficiais do Ministério da Saúde do Brasil e do Programa Nacional de Imunizações.',
  };
}
