import type { TopicSeed } from "@/lib/seed/types";
import { countriesStartingWith } from "./geography";

/**
 * New topics with closed, complete answer lists — every correct answer can be listed, so nobody
 * gets marked wrong for knowing something obscure. Keyed by the slug of the category they join.
 * Lists that change over time reflect the end of 2025.
 */
export const NEW_TOPICS: Record<string, TopicSeed[]> = {
  countries: [
    ...["A", "B", "C", "G", "M", "N", "S", "T"].map(
      (l): TopicSeed => ({
        name: `Countries starting with ${l}`,
        slug: `countries-starting-with-${l.toLowerCase()}`,
        difficulty: "medium",
        answers: countriesStartingWith(l),
      }),
    ),
    {
      name: "Middle Eastern countries",
      difficulty: "medium",
      answers: `Bahrain|Cyprus|Egypt|Iran|Iraq|Israel|Jordan|Kuwait|Lebanon|Oman|Palestine|Qatar|Saudi Arabia|Syria|Turkey=Türkiye|United Arab Emirates=UAE|Yemen`,
    },
    {
      name: "Southeast Asian countries",
      difficulty: "medium",
      answers: `Brunei|Cambodia|Indonesia|Laos|Malaysia|Myanmar=Burma|Philippines|Singapore|Thailand|Timor-Leste=East Timor|Vietnam`,
    },
    {
      name: "Caribbean island countries",
      difficulty: "hard",
      answers: `Antigua and Barbuda=Antigua|Bahamas|Barbados|Cuba|Dominica|Dominican Republic|Grenada|Haiti|Jamaica|Saint Kitts and Nevis=St Kitts|Saint Lucia|Saint Vincent and the Grenadines=St Vincent|Trinidad and Tobago=Trinidad`,
    },
    {
      name: "Former Soviet republics",
      difficulty: "hard",
      answers: `Russia|Ukraine|Belarus|Moldova|Estonia|Latvia|Lithuania|Georgia|Armenia|Azerbaijan|Kazakhstan|Kyrgyzstan|Tajikistan|Turkmenistan|Uzbekistan`,
    },
    {
      name: "Arab League members",
      prompt: "Name as many Arab League member countries as you can",
      difficulty: "hard",
      answers: `Algeria|Bahrain|Comoros|Djibouti|Egypt|Iraq|Jordan|Kuwait|Lebanon|Libya|Mauritania|Morocco|Oman|Palestine|Qatar|Saudi Arabia|Somalia|Sudan|Syria|Tunisia|United Arab Emirates=UAE|Yemen`,
    },
    {
      name: "G20 members",
      prompt: "Name as many G20 members as you can",
      difficulty: "medium",
      answers: `Argentina|Australia|Brazil|Canada|China|France|Germany|India|Indonesia|Italy|Japan|Mexico|Russia|Saudi Arabia|South Africa|South Korea|Turkey=Türkiye|United Kingdom=UK|United States=USA|European Union=EU|African Union`,
    },
    {
      name: "OPEC members",
      prompt: "Name as many OPEC member countries as you can",
      difficulty: "hard",
      answers: `Algeria|Republic of the Congo=Congo|Equatorial Guinea|Gabon|Iran|Iraq|Kuwait|Libya|Nigeria|Saudi Arabia|United Arab Emirates=UAE|Venezuela`,
    },
    {
      name: "BRICS members",
      prompt: "Name as many BRICS member countries as you can",
      difficulty: "medium",
      answers: `Brazil|Russia|India|China|South Africa|Egypt|Ethiopia|Iran|United Arab Emirates=UAE|Indonesia`,
    },
    {
      name: "Mediterranean countries",
      prompt: "Name as many countries with a Mediterranean coastline as you can",
      difficulty: "medium",
      answers: `Spain|France|Monaco|Italy|Malta|Slovenia|Croatia|Bosnia and Herzegovina=Bosnia|Montenegro|Albania|Greece|Turkey=Türkiye|Cyprus|Syria|Lebanon|Israel|Palestine|Egypt|Libya|Tunisia|Algeria|Morocco`,
    },
    {
      name: "Countries on the equator",
      prompt: "Name as many countries the equator passes through as you can",
      difficulty: "hard",
      answers: `Ecuador|Colombia|Brazil|São Tomé and Príncipe=Sao Tome|Gabon|Republic of the Congo=Congo|Democratic Republic of the Congo=DRC|Uganda|Kenya|Somalia|Maldives|Indonesia|Kiribati`,
    },
    {
      name: "Countries bordering China",
      difficulty: "hard",
      answers: `Afghanistan|Bhutan|India|Kazakhstan|North Korea|Kyrgyzstan|Laos|Mongolia|Myanmar=Burma|Nepal|Pakistan|Russia|Tajikistan|Vietnam`,
    },
    {
      name: "Countries bordering Russia",
      difficulty: "hard",
      answers: `Norway|Finland|Estonia|Latvia|Lithuania|Poland|Belarus|Ukraine|Georgia|Azerbaijan|Kazakhstan|China|Mongolia|North Korea`,
    },
    {
      name: "Countries bordering Brazil",
      difficulty: "medium",
      answers: `Uruguay|Argentina|Paraguay|Bolivia|Peru|Colombia|Venezuela|Guyana|Suriname|France=French Guiana`,
    },
    {
      name: "Commonwealth countries",
      prompt: "Name as many Commonwealth of Nations member countries as you can",
      difficulty: "hard",
      answers: `Antigua and Barbuda|Australia|Bahamas|Bangladesh|Barbados|Belize|Botswana|Brunei|Cameroon|Canada|Cyprus|Dominica|Eswatini=Swaziland|Fiji|Gabon|Gambia|Ghana|Grenada|Guyana|India|Jamaica|Kenya|Kiribati|Lesotho|Malawi|Malaysia|Maldives|Malta|Mauritius|Mozambique|Namibia|Nauru|New Zealand|Nigeria|Pakistan|Papua New Guinea|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|Seychelles|Sierra Leone|Singapore|Solomon Islands|South Africa|Sri Lanka|Tanzania|Togo|Tonga|Trinidad and Tobago|Tuvalu|Uganda|United Kingdom=UK|Vanuatu|Zambia`,
    },
    {
      name: "FIFA World Cup host countries",
      prompt: "Name as many countries that have hosted the men's FIFA World Cup as you can",
      difficulty: "hard",
      answers: `Uruguay|Italy|France|Brazil|Switzerland|Sweden|Chile|England|Mexico|Germany=West Germany|Argentina|Spain|United States=USA|South Korea|Japan|South Africa|Russia|Qatar|Canada`,
    },
  ],
  "states-regions": [
    {
      name: "Indian state capitals",
      prompt: "Name as many capitals of Indian states and union territories as you can",
      difficulty: "hard",
      answers: `Amaravati|Itanagar|Dispur|Patna|Raipur|Panaji=Panjim|Gandhinagar|Chandigarh|Shimla|Ranchi|Bengaluru=Bangalore|Thiruvananthapuram=Trivandrum|Bhopal|Mumbai=Bombay|Imphal|Shillong|Aizawl|Kohima|Bhubaneswar|Jaipur|Gangtok|Chennai=Madras|Hyderabad|Agartala|Lucknow|Dehradun|Kolkata=Calcutta|Port Blair=Sri Vijaya Puram|Daman|New Delhi=Delhi|Srinagar|Jammu|Leh|Kavaratti|Puducherry=Pondicherry`,
    },
    {
      name: "Canadian provincial and territorial capitals",
      slug: "canadian-capitals",
      difficulty: "hard",
      answers: `Victoria|Edmonton|Regina|Winnipeg|Toronto|Quebec City|Fredericton|Halifax|Charlottetown|St. John's=Saint Johns|Whitehorse|Yellowknife|Iqaluit`,
    },
    {
      name: "US states with an ocean coastline",
      slug: "coastal-us-states",
      difficulty: "hard",
      answers: `Alabama|Alaska|California|Connecticut|Delaware|Florida|Georgia|Hawaii|Louisiana|Maine|Maryland|Massachusetts|Mississippi|New Hampshire|New Jersey|New York|North Carolina|Oregon|Rhode Island|South Carolina|Texas|Virginia|Washington`,
    },
    {
      name: "The thirteen colonies",
      prompt: "Name as many of the original thirteen American colonies as you can",
      difficulty: "medium",
      answers: `Delaware|Pennsylvania|New Jersey|Georgia|Connecticut|Massachusetts=Massachusetts Bay|Maryland|South Carolina|New Hampshire|Virginia|New York|North Carolina|Rhode Island`,
    },
    {
      name: "London boroughs",
      prompt: "Name as many London boroughs as you can",
      difficulty: "hard",
      answers: `Barking and Dagenham|Barnet|Bexley|Brent|Bromley|Camden|Croydon|Ealing|Enfield|Greenwich|Hackney|Hammersmith and Fulham|Haringey|Harrow|Havering|Hillingdon|Hounslow|Islington|Kensington and Chelsea|Kingston upon Thames=Kingston|Lambeth|Lewisham|Merton|Newham|Redbridge|Richmond upon Thames=Richmond|Southwark|Sutton|Tower Hamlets|Waltham Forest|Wandsworth|Westminster=City of Westminster|City of London`,
    },
    {
      name: "Regions of France",
      difficulty: "hard",
      answers: `Auvergne-Rhône-Alpes|Bourgogne-Franche-Comté=Burgundy-Franche-Comte|Brittany=Bretagne|Centre-Val de Loire|Corsica=Corse|Grand Est|Hauts-de-France|Île-de-France=Ile de France|Normandy=Normandie|Nouvelle-Aquitaine|Occitanie=Occitania|Pays de la Loire|Provence-Alpes-Côte d'Azur=PACA|Guadeloupe|Martinique|French Guiana=Guyane|Réunion|Mayotte`,
    },
  ],
  "sports-teams": [
    {
      name: "Champions League winners",
      prompt: "Name as many clubs that have won the European Cup or Champions League as you can",
      difficulty: "hard",
      answers: `Real Madrid|AC Milan=Milan|Bayern Munich|Liverpool|Barcelona|Ajax|Inter Milan=Inter|Manchester United|Juventus|Benfica|Chelsea|Nottingham Forest|Porto|Celtic|Hamburg|Steaua Bucharest=FCSB|Marseille|Borussia Dortmund=Dortmund|Feyenoord|Aston Villa|PSV Eindhoven=PSV|Red Star Belgrade|Manchester City|Paris Saint-Germain=PSG`,
    },
    {
      name: "Formula 1 teams",
      prompt: "Name as many Formula 1 teams (past or present) as you can",
      difficulty: "hard",
      answers: `Ferrari|McLaren|Mercedes|Red Bull Racing=Red Bull|Williams|Aston Martin|Alpine|Haas|Racing Bulls=RB|Sauber|Audi|Cadillac|AlphaTauri|Toro Rosso|Alfa Romeo|Renault|Lotus|Brabham|Tyrrell|Benetton|Jordan|Minardi|Force India|Racing Point|BMW Sauber|Toyota|Honda|Brawn GP|Super Aguri|Jaguar|Stewart|Arrows|Prost|Ligier|March|Footwork|Shadow|Wolf|Hesketh|Cooper|Maserati|Vanwall|BRM|Matra|Marussia|Manor|Caterham|HRT|Virgin|Spyker|Midland|Lola|Simtek|Larrousse|Dallara|Zakspeed|Osella|Spirit|Toleman|ATS|Ensign|Fittipaldi|Surtees|Eagle|Porsche`,
    },
    {
      name: "Test cricket nations",
      prompt: "Name as many Test-playing cricket nations as you can",
      difficulty: "medium",
      answers: `Australia|England|South Africa|West Indies|New Zealand|India|Pakistan|Sri Lanka|Zimbabwe|Bangladesh|Ireland|Afghanistan`,
    },
    {
      name: "WNBA teams",
      difficulty: "hard",
      answers: `Atlanta Dream=Dream|Chicago Sky=Sky|Connecticut Sun=Sun|Dallas Wings=Wings|Golden State Valkyries=Valkyries|Indiana Fever=Fever|Las Vegas Aces=Aces|Los Angeles Sparks=Sparks|Minnesota Lynx=Lynx|New York Liberty=Liberty|Phoenix Mercury=Mercury|Seattle Storm=Storm|Washington Mystics=Mystics`,
    },
  ],
  movies: [
    {
      name: "DreamWorks animated movies",
      difficulty: "medium",
      answers: `Antz|The Prince of Egypt|The Road to El Dorado|Chicken Run|Shrek|Spirit: Stallion of the Cimarron=Spirit|Sinbad: Legend of the Seven Seas=Sinbad|Shrek 2|Shark Tale|Madagascar|Wallace & Gromit: The Curse of the Were-Rabbit|Over the Hedge|Flushed Away|Shrek the Third|Bee Movie|Kung Fu Panda|Madagascar: Escape 2 Africa=Madagascar 2|Monsters vs. Aliens|How to Train Your Dragon|Shrek Forever After|Megamind|Kung Fu Panda 2|Puss in Boots|Madagascar 3: Europe's Most Wanted=Madagascar 3|Rise of the Guardians|The Croods|Turbo|Mr. Peabody & Sherman|How to Train Your Dragon 2|Penguins of Madagascar|Home|Kung Fu Panda 3|Trolls|The Boss Baby|Captain Underpants: The First Epic Movie=Captain Underpants|How to Train Your Dragon: The Hidden World|Abominable|Trolls World Tour|The Croods: A New Age|Spirit Untamed|The Boss Baby: Family Business|The Bad Guys|Puss in Boots: The Last Wish|Ruby Gillman, Teenage Kraken|Trolls Band Together|Kung Fu Panda 4|The Wild Robot|Dog Man|The Bad Guys 2`,
    },
  ],
  characters: [
    {
      name: "Disney princesses",
      difficulty: "easy",
      answers: `Snow White|Cinderella|Aurora=Sleeping Beauty|Ariel|Belle|Jasmine|Pocahontas|Mulan|Tiana|Rapunzel|Merida|Moana|Raya|Elsa|Anna`,
    },
    {
      name: "Game of Thrones houses",
      prompt: "Name as many noble houses from Game of Thrones as you can",
      difficulty: "hard",
      answers: `Stark|Lannister|Targaryen|Baratheon|Greyjoy|Tyrell|Martell|Tully|Arryn|Bolton|Frey|Mormont|Tarly|Karstark|Umber|Reed|Clegane|Dayne|Florent|Hightower|Velaryon|Royce|Manderly|Glover|Mallister|Blackwood|Bracken|Hornwood|Cerwyn|Tarth|Seaworth|Selmy|Strong|Redwyne|Baelish|Dondarrion|Payne|Waynwood|Yronwood`,
    },
    {
      name: "Cluedo characters, weapons and rooms",
      slug: "cluedo",
      prompt: "Name as many Cluedo (Clue) characters, weapons and rooms as you can",
      difficulty: "medium",
      answers: `Miss Scarlett=Scarlett|Colonel Mustard=Mustard|Mrs. White=Mrs White|Reverend Green=Mr. Green=Mr Green|Mrs. Peacock=Mrs Peacock|Professor Plum=Plum|Dr. Orchid=Orchid|Candlestick|Dagger=Knife|Lead pipe|Revolver|Rope|Wrench=Spanner|Kitchen|Ballroom|Conservatory|Dining room|Billiard room|Library|Lounge|Hall|Study`,
    },
  ],
  music: [
    {
      name: "Orchestra instruments",
      prompt: "Name as many instruments found in a symphony orchestra as you can",
      difficulty: "medium",
      answers: `Violin|Viola|Cello|Double bass|Harp|Flute|Piccolo|Oboe|Cor anglais=English horn|Clarinet|Bass clarinet|Bassoon|Contrabassoon|French horn=Horn|Trumpet|Trombone|Bass trombone|Tuba|Timpani|Snare drum|Bass drum|Cymbals|Triangle|Xylophone|Glockenspiel|Tubular bells|Celesta|Piano|Tam-tam=Gong|Marimba|Tambourine|Castanets|Vibraphone|Organ|Harpsichord|Saxophone|Euphonium|Wood block|Whip|Wind machine`,
    },
    {
      name: "Taylor Swift albums",
      difficulty: "medium",
      answers: `Taylor Swift|Fearless|Speak Now|Red|1989|Reputation|Lover|Folklore|Evermore|Midnights|The Tortured Poets Department=TTPD|The Life of a Showgirl`,
    },
  ],
  games: [
    {
      name: "Pokémon types",
      slug: "pokemon-types",
      difficulty: "medium",
      answers: `Normal|Fire|Water|Grass|Electric|Ice|Fighting|Poison|Ground|Flying|Psychic|Bug|Rock|Ghost|Dragon|Dark|Steel|Fairy`,
    },
    {
      name: "Monopoly board spaces",
      prompt: "Name as many spaces on a Monopoly board (US or UK edition) as you can",
      difficulty: "hard",
      answers: `Go|Jail|Free Parking|Go to Jail|Chance|Community Chest|Income Tax|Luxury Tax|Super Tax|Electric Company|Water Works|Mediterranean Avenue|Baltic Avenue|Oriental Avenue|Vermont Avenue|Connecticut Avenue|St. Charles Place|States Avenue|Virginia Avenue|St. James Place|Tennessee Avenue|New York Avenue|Kentucky Avenue|Indiana Avenue|Illinois Avenue|Atlantic Avenue|Ventnor Avenue|Marvin Gardens|Pacific Avenue|North Carolina Avenue|Pennsylvania Avenue|Park Place|Boardwalk|Reading Railroad|Pennsylvania Railroad|B&O Railroad|Short Line|Old Kent Road|Whitechapel Road|The Angel Islington|Euston Road|Pentonville Road|Pall Mall|Whitehall|Northumberland Avenue|Bow Street|Marlborough Street|Vine Street|Strand|Fleet Street|Trafalgar Square|Leicester Square|Coventry Street|Piccadilly|Regent Street|Oxford Street|Bond Street|Park Lane|Mayfair|King's Cross Station|Marylebone Station|Fenchurch Street Station|Liverpool Street Station`,
    },
    {
      name: "Tarot major arcana",
      prompt: "Name as many tarot Major Arcana cards as you can",
      difficulty: "hard",
      answers: `The Fool|The Magician|The High Priestess|The Empress|The Emperor|The Hierophant|The Lovers|The Chariot|Strength|The Hermit|Wheel of Fortune|Justice|The Hanged Man|Death|Temperance|The Devil|The Tower|The Star|The Moon|The Sun|Judgement=Judgment|The World`,
    },
  ],
  science: [
    {
      name: "Chemical symbols",
      prompt: "Name as many chemical element symbols as you can (e.g. Fe)",
      difficulty: "hard",
      answers: `H|He|Li|Be|B|C|N|O|F|Ne|Na|Mg|Al|Si|P|S|Cl|Ar|K|Ca|Sc|Ti|V|Cr|Mn|Fe|Co|Ni|Cu|Zn|Ga|Ge|As|Se|Br|Kr|Rb|Sr|Y|Zr|Nb|Mo|Tc|Ru|Rh|Pd|Ag|Cd|In|Sn|Sb|Te|I|Xe|Cs|Ba|La|Ce|Pr|Nd|Pm|Sm|Eu|Gd|Tb|Dy|Ho|Er|Tm|Yb|Lu|Hf|Ta|W|Re|Os|Ir|Pt|Au|Hg|Tl|Pb|Bi|Po|At|Rn|Fr|Ra|Ac|Th|Pa|U|Np|Pu|Am|Cm|Bk|Cf|Es|Fm|Md|No|Lr|Rf|Db|Sg|Bh|Hs|Mt|Ds|Rg|Cn|Nh|Fl|Mc|Lv|Ts|Og`,
    },
    {
      name: "SI units",
      prompt: "Name as many SI base and named derived units as you can",
      difficulty: "hard",
      answers: `Metre=Meter|Kilogram|Second|Ampere=Amp|Kelvin|Mole|Candela|Radian|Steradian|Hertz|Newton|Pascal|Joule|Watt|Coulomb|Volt|Farad|Ohm|Siemens|Weber|Tesla|Henry|Degree Celsius=Celsius|Lumen|Lux|Becquerel|Gray|Sievert|Katal`,
    },
  ],
  "human-body": [
    {
      name: "Human body systems",
      prompt: "Name as many organ systems of the human body as you can",
      difficulty: "medium",
      answers: `Circulatory system=Cardiovascular system|Respiratory system|Digestive system|Nervous system|Skeletal system|Muscular system|Endocrine system|Immune system|Lymphatic system|Urinary system=Excretory system|Reproductive system|Integumentary system`,
    },
  ],
  "tech-internet": [
    {
      name: "Apple products",
      prompt: "Name as many Apple product lines as you can",
      difficulty: "easy",
      answers: `iPhone|iPad|iPad Pro|iPad Air|iPad mini|Mac|MacBook|MacBook Air|MacBook Pro|iMac|iMac Pro|Mac mini|Mac Pro|Mac Studio|Apple Watch|AirPods|AirPods Pro|AirPods Max|Apple TV|HomePod|HomePod mini|Apple Vision Pro=Vision Pro|AirTag|Apple Pencil|Magic Mouse|Magic Keyboard|Magic Trackpad|Studio Display|Pro Display XDR|iPod|iPod Touch|iPod Nano|iPod Shuffle|iPod Classic|Apple II|Macintosh|Lisa|Newton|eMac|iBook|PowerBook|Power Mac|Xserve|AirPort|Time Capsule|iPhone SE`,
    },
    {
      name: "Keyboard keys",
      prompt: "Name as many keys on a computer keyboard as you can",
      difficulty: "easy",
      answers: `Enter=Return|Shift|Control=Ctrl|Alt|Tab|Caps Lock|Escape=Esc|Backspace|Delete=Del|Insert|Home|End|Page Up|Page Down|Space bar=Space|Up arrow|Down arrow|Left arrow|Right arrow|Num Lock|Scroll Lock|Print Screen|Pause=Break|Windows key|Command=Cmd|Option|Function=Fn|Menu key|F1|F2|F3|F4|F5|F6|F7|F8|F9|F10|F11|F12|AltGr`,
    },
  ],
  "history-leaders": [
    {
      name: "UK prime ministers",
      prompt: "Name as many British prime ministers as you can",
      difficulty: "hard",
      answers: `Robert Walpole=Walpole|Spencer Compton=Earl of Wilmington|Henry Pelham=Pelham|Duke of Newcastle=Thomas Pelham-Holles|Duke of Devonshire|Earl of Bute=Bute|George Grenville|Marquess of Rockingham=Rockingham|William Pitt the Elder=Pitt the Elder|Duke of Grafton=Grafton|Lord North=North|Earl of Shelburne=Shelburne|Duke of Portland=Portland|William Pitt the Younger=Pitt the Younger|Henry Addington=Addington|Lord Grenville=William Grenville|Spencer Perceval=Perceval|Earl of Liverpool=Lord Liverpool|George Canning=Canning|Viscount Goderich=Goderich|Duke of Wellington=Wellington|Earl Grey=Grey|Viscount Melbourne=Melbourne|Robert Peel=Peel|Lord John Russell=John Russell|Earl of Derby=Derby|Earl of Aberdeen=Aberdeen|Viscount Palmerston=Palmerston|Benjamin Disraeli=Disraeli|William Gladstone=Gladstone|Marquess of Salisbury=Salisbury|Earl of Rosebery=Rosebery|Arthur Balfour=Balfour|Henry Campbell-Bannerman=Campbell-Bannerman|H. H. Asquith=Asquith|David Lloyd George=Lloyd George|Bonar Law|Stanley Baldwin=Baldwin|Ramsay MacDonald=MacDonald|Neville Chamberlain=Chamberlain|Winston Churchill=Churchill|Clement Attlee=Attlee|Anthony Eden=Eden|Harold Macmillan=Macmillan|Alec Douglas-Home=Douglas-Home|Harold Wilson=Wilson|Edward Heath=Heath|James Callaghan=Callaghan|Margaret Thatcher=Thatcher|John Major=Major|Tony Blair=Blair|Gordon Brown=Brown|David Cameron=Cameron|Theresa May=May|Boris Johnson=Johnson|Liz Truss=Truss|Rishi Sunak=Sunak|Keir Starmer=Starmer`,
    },
    {
      name: "Indian presidents",
      prompt: "Name as many presidents of India as you can",
      difficulty: "hard",
      answers: `Rajendra Prasad|Sarvepalli Radhakrishnan=Radhakrishnan|Zakir Husain=Zakir Hussain|V. V. Giri=VV Giri|Fakhruddin Ali Ahmed|Neelam Sanjiva Reddy|Zail Singh|R. Venkataraman=Venkataraman|Shankar Dayal Sharma|K. R. Narayanan=KR Narayanan|A. P. J. Abdul Kalam=Abdul Kalam=APJ Abdul Kalam|Pratibha Patil|Pranab Mukherjee|Ram Nath Kovind|Droupadi Murmu`,
    },
    {
      name: "Mughal emperors",
      difficulty: "hard",
      answers: `Babur|Humayun|Akbar|Jahangir|Shah Jahan|Aurangzeb|Bahadur Shah I|Jahandar Shah|Farrukhsiyar|Rafi ud-Darajat|Shah Jahan II|Muhammad Shah|Ahmad Shah Bahadur|Alamgir II|Shah Jahan III|Shah Alam II|Akbar II|Bahadur Shah Zafar=Bahadur Shah II`,
    },
  ],
  mythology: [
    {
      name: "The twelve apostles",
      prompt: "Name as many of Jesus's apostles as you can",
      difficulty: "medium",
      answers: `Peter=Simon Peter|Andrew|James|John|Philip|Bartholomew=Nathanael|Thomas|Matthew=Levi|James son of Alphaeus|Thaddeus=Jude|Simon the Zealot|Judas Iscariot=Judas|Matthias`,
    },
    {
      name: "The twelve Olympians",
      prompt: "Name as many of the twelve Olympian gods as you can",
      difficulty: "medium",
      answers: `Zeus|Hera|Poseidon|Demeter|Athena|Apollo|Artemis|Ares|Aphrodite|Hephaestus|Hermes|Dionysus|Hestia`,
    },
    {
      name: "Avatars of Vishnu",
      prompt: "Name as many of the ten avatars of Vishnu (Dashavatara) as you can",
      difficulty: "hard",
      answers: `Matsya|Kurma|Varaha|Narasimha|Vamana|Parashurama|Rama|Krishna|Balarama|Buddha|Kalki`,
    },
    {
      name: "Sikh Gurus",
      prompt: "Name as many of the ten Sikh Gurus as you can",
      difficulty: "hard",
      answers: `Guru Nanak=Guru Nanak Dev|Guru Angad=Guru Angad Dev|Guru Amar Das|Guru Ram Das|Guru Arjan=Guru Arjan Dev|Guru Hargobind|Guru Har Rai|Guru Har Krishan|Guru Tegh Bahadur|Guru Gobind Singh|Guru Granth Sahib`,
    },
  ],
};
