import type { CategorySeed } from "@/lib/seed/types";

/**
 * Master country table: Name=aliases ; Capital=aliases ; continents ; flags
 *   continents: AF AS EU NA SA OC (transcontinental countries list several)
 *   flags: L landlocked · E EU member · N NATO member · S Spanish is official · I island nation
 * Membership reflects the end of 2025 (EU-27, NATO-32).
 */
const COUNTRY_TABLE = `
Afghanistan;Kabul;AS;L
Albania;Tirana=Tirane;EU;N
Algeria;Algiers;AF;
Andorra;Andorra la Vella;EU;L
Angola;Luanda;AF;
Antigua and Barbuda=Antigua;Saint John's=St Johns;NA;I
Argentina;Buenos Aires;SA;S
Armenia;Yerevan;AS EU;L
Australia;Canberra;OC;
Austria;Vienna=Wien;EU;L E
Azerbaijan;Baku;AS EU;L
Bahamas=The Bahamas;Nassau;NA;I
Bahrain;Manama;AS;I
Bangladesh;Dhaka=Dacca;AS;
Barbados;Bridgetown;NA;I
Belarus;Minsk;EU;L
Belgium;Brussels=Bruxelles;EU;E N
Belize;Belmopan;NA;
Benin;Porto-Novo;AF;
Bhutan;Thimphu;AS;L
Bolivia;Sucre=La Paz;SA;L S
Bosnia and Herzegovina=Bosnia=Bosnia-Herzegovina;Sarajevo;EU;
Botswana;Gaborone;AF;L
Brazil;Brasília;SA;
Brunei=Brunei Darussalam;Bandar Seri Begawan;AS;I
Bulgaria;Sofia;EU;E N
Burkina Faso;Ouagadougou;AF;L
Burundi;Gitega=Bujumbura;AF;L
Cabo Verde=Cape Verde;Praia;AF;I
Cambodia;Phnom Penh;AS;
Cameroon;Yaoundé;AF;
Canada;Ottawa;NA;N
Central African Republic=CAR;Bangui;AF;L
Chad;N'Djamena;AF;L
Chile;Santiago;SA;S
China=People's Republic of China=PRC;Beijing=Peking;AS;
Colombia;Bogotá;SA;S
Comoros;Moroni;AF;I
Republic of the Congo=Congo=Congo-Brazzaville;Brazzaville;AF;
Democratic Republic of the Congo=DRC=DR Congo=Congo-Kinshasa=Zaire;Kinshasa;AF;
Costa Rica;San José;NA;S
Côte d'Ivoire=Ivory Coast;Yamoussoukro;AF;
Croatia;Zagreb;EU;E N
Cuba;Havana=La Habana;NA;S I
Cyprus;Nicosia;EU AS;E I
Czechia=Czech Republic;Prague=Praha;EU;L E N
Denmark;Copenhagen;EU;E N
Djibouti;Djibouti City;AF;
Dominica;Roseau;NA;I
Dominican Republic;Santo Domingo;NA;S I
Ecuador;Quito;SA;S
Egypt;Cairo;AF;
El Salvador;San Salvador;NA;S
Equatorial Guinea;Malabo;AF;S
Eritrea;Asmara;AF;
Estonia;Tallinn;EU;E N
Eswatini=Swaziland;Mbabane=Lobamba;AF;L
Ethiopia;Addis Ababa;AF;L
Fiji;Suva;OC;I
Finland;Helsinki;EU;E N
France;Paris;EU;E N
Gabon;Libreville;AF;
Gambia=The Gambia;Banjul;AF;
Georgia;Tbilisi;AS EU;
Germany=Deutschland;Berlin;EU;E N
Ghana;Accra;AF;
Greece;Athens;EU;E N
Grenada;St. George's=Saint Georges;NA;I
Guatemala;Guatemala City;NA;S
Guinea;Conakry;AF;
Guinea-Bissau;Bissau;AF;
Guyana;Georgetown;SA;
Haiti;Port-au-Prince;NA;I
Honduras;Tegucigalpa;NA;S
Hungary;Budapest;EU;L E N
Iceland;Reykjavík;EU;N I
India=Bharat;New Delhi=Delhi;AS;
Indonesia;Jakarta;AS;I
Iran=Persia;Tehran=Teheran;AS;
Iraq;Baghdad;AS;
Ireland=Republic of Ireland=Eire;Dublin;EU;E I
Israel;Jerusalem;AS;
Italy;Rome=Roma;EU;E N
Jamaica;Kingston;NA;I
Japan;Tokyo;AS;I
Jordan;Amman;AS;
Kazakhstan;Astana=Nur-Sultan;AS EU;L
Kenya;Nairobi;AF;
Kiribati;South Tarawa=Tarawa;OC;I
Kosovo;Pristina=Prishtina;EU;L
Kuwait;Kuwait City;AS;
Kyrgyzstan=Kyrgyz Republic;Bishkek;AS;L
Laos;Vientiane;AS;L
Latvia;Riga;EU;E N
Lebanon;Beirut;AS;
Lesotho;Maseru;AF;L
Liberia;Monrovia;AF;
Libya;Tripoli;AF;
Liechtenstein;Vaduz;EU;L
Lithuania;Vilnius;EU;E N
Luxembourg;Luxembourg City;EU;L E N
Madagascar;Antananarivo;AF;I
Malawi;Lilongwe;AF;L
Malaysia;Kuala Lumpur=KL;AS;
Maldives;Malé;AS;I
Mali;Bamako;AF;L
Malta;Valletta;EU;E I
Marshall Islands;Majuro;OC;I
Mauritania;Nouakchott;AF;
Mauritius;Port Louis;AF;I
Mexico;Mexico City;NA;S
Micronesia=Federated States of Micronesia;Palikir;OC;I
Moldova;Chișinău;EU;L
Monaco;Monaco City;EU;
Mongolia;Ulaanbaatar=Ulan Bator;AS;L
Montenegro;Podgorica;EU;N
Morocco;Rabat;AF;
Mozambique;Maputo;AF;
Myanmar=Burma;Naypyidaw=Nay Pyi Taw;AS;
Namibia;Windhoek;AF;
Nauru;Yaren;OC;I
Nepal;Kathmandu;AS;L
Netherlands=Holland=The Netherlands;Amsterdam;EU;E N
New Zealand=Aotearoa;Wellington;OC;I
Nicaragua;Managua;NA;S
Niger;Niamey;AF;L
Nigeria;Abuja;AF;
North Korea=DPRK;Pyongyang;AS;
North Macedonia=Macedonia;Skopje;EU;L N
Norway;Oslo;EU;N
Oman;Muscat;AS;
Pakistan;Islamabad;AS;
Palau;Ngerulmud;OC;I
Palestine=State of Palestine;;AS;
Panama;Panama City;NA;S
Papua New Guinea=PNG;Port Moresby;OC;I
Paraguay;Asunción;SA;L S
Peru;Lima;SA;S
Philippines;Manila;AS;I
Poland;Warsaw=Warszawa;EU;E N
Portugal;Lisbon=Lisboa;EU;E N
Qatar;Doha;AS;
Romania;Bucharest;EU;E N
Russia=Russian Federation;Moscow;EU AS;
Rwanda;Kigali;AF;L
Saint Kitts and Nevis=St Kitts and Nevis=St Kitts;Basseterre;NA;I
Saint Lucia;Castries;NA;I
Saint Vincent and the Grenadines=St Vincent;Kingstown;NA;I
Samoa;Apia;OC;I
San Marino;City of San Marino;EU;L
São Tomé and Príncipe=Sao Tome;São Tomé;AF;I
Saudi Arabia;Riyadh;AS;
Senegal;Dakar;AF;
Serbia;Belgrade=Beograd;EU;L
Seychelles;Victoria;AF;I
Sierra Leone;Freetown;AF;
Singapore;Singapore City;AS;I
Slovakia;Bratislava;EU;L E N
Slovenia;Ljubljana;EU;E N
Solomon Islands;Honiara;OC;I
Somalia;Mogadishu;AF;
South Africa;Pretoria=Cape Town=Bloemfontein;AF;
South Korea=Republic of Korea;Seoul;AS;
South Sudan;Juba;AF;L
Spain=España;Madrid;EU;E N S
Sri Lanka=Ceylon;Sri Jayawardenepura Kotte=Kotte=Colombo;AS;I
Sudan;Khartoum;AF;
Suriname=Surinam;Paramaribo;SA;
Sweden;Stockholm;EU;E N
Switzerland;Bern=Berne;EU;L
Syria;Damascus;AS;
Taiwan;Taipei;AS;I
Tajikistan;Dushanbe;AS;L
Tanzania;Dodoma;AF;
Thailand=Siam;Bangkok;AS;
Timor-Leste=East Timor;Dili;AS;I
Togo;Lomé;AF;
Tonga;Nukuʻalofa=Nukualofa;OC;I
Trinidad and Tobago=Trinidad;Port of Spain;NA;I
Tunisia;Tunis;AF;
Turkey=Türkiye;Ankara;AS EU;N
Turkmenistan;Ashgabat;AS;L
Tuvalu;Funafuti;OC;I
Uganda;Kampala;AF;L
Ukraine;Kyiv=Kiev;EU;
United Arab Emirates=UAE=Emirates;Abu Dhabi;AS;
United Kingdom=UK=Great Britain=Britain;London;EU;N I
United States=United States of America=USA=US=America;Washington, D.C.=Washington DC=Washington;NA;N
Uruguay;Montevideo;SA;S
Uzbekistan;Tashkent;AS;L
Vanuatu;Port Vila;OC;I
Vatican City=Holy See=Vatican;Vatican City State;EU;L
Venezuela;Caracas;SA;S
Vietnam=Viet Nam;Hanoi;AS;
Yemen;Sanaa=Sana'a;AS;
Zambia;Lusaka;AF;L
Zimbabwe;Harare;AF;L
`;

interface CountryRow {
  name: string; // includes aliases (= separated)
  capital: string; // includes aliases
  continents: string[];
  flags: Set<string>;
}

const COUNTRIES: CountryRow[] = COUNTRY_TABLE.trim()
  .split("\n")
  .map((line) => {
    const [name, capital, cont, flags] = line.split(";");
    return {
      name: name.trim(),
      capital: capital.trim(),
      continents: cont.trim().split(/\s+/),
      flags: new Set((flags ?? "").trim().split(/\s+/).filter(Boolean)),
    };
  });

const countryList = (pred: (c: CountryRow) => boolean) =>
  COUNTRIES.filter(pred)
    .map((c) => c.name)
    .join("|");

// Capitals whose city name equals the country name get "City" in the table so they stay distinct
// answers; accept the bare city name as an alias too.
const capitalList = (pred: (c: CountryRow) => boolean) =>
  COUNTRIES.filter((c) => c.capital && pred(c))
    .map((c) => {
      const bare = c.capital.replace(/ (City|City State)$/, "").replace(/^City of /, "");
      return bare !== c.capital.split("=")[0] ? `${c.capital}=${bare}` : c.capital;
    })
    .join("|");

const inCont = (code: string) => (c: CountryRow) => c.continents.includes(code);
const hasFlag = (flag: string) => (c: CountryRow) => c.flags.has(flag);

/** US states with capitals: State=aliases;Capital;Region */
const US_STATES = `
Alabama=AL;Montgomery;S
Alaska=AK;Juneau;W
Arizona=AZ;Phoenix;W
Arkansas=AR;Little Rock;S
California=CA=Cali;Sacramento;W
Colorado=CO;Denver;W
Connecticut=CT;Hartford;NE
Delaware=DE;Dover;S
Florida=FL;Tallahassee;S
Georgia=GA;Atlanta;S
Hawaii=HI=Hawai'i;Honolulu;W
Idaho=ID;Boise;W
Illinois=IL;Springfield;MW
Indiana=IN;Indianapolis;MW
Iowa=IA;Des Moines;MW
Kansas=KS;Topeka;MW
Kentucky=KY;Frankfort;S
Louisiana=LA;Baton Rouge;S
Maine=ME;Augusta;NE
Maryland=MD;Annapolis;S
Massachusetts=MA=Mass;Boston;NE
Michigan=MI;Lansing;MW
Minnesota=MN;Saint Paul=St Paul;MW
Mississippi=MS;Jackson;S
Missouri=MO;Jefferson City;MW
Montana=MT;Helena;W
Nebraska=NE;Lincoln;MW
Nevada=NV;Carson City;W
New Hampshire=NH;Concord;NE
New Jersey=NJ;Trenton;NE
New Mexico=NM;Santa Fe;W
New York=NY=New York State;Albany;NE
North Carolina=NC;Raleigh;S
North Dakota=ND;Bismarck;MW
Ohio=OH;Columbus;MW
Oklahoma=OK;Oklahoma City;S
Oregon=OR;Salem;W
Pennsylvania=PA;Harrisburg;NE
Rhode Island=RI;Providence;NE
South Carolina=SC;Columbia;S
South Dakota=SD;Pierre;MW
Tennessee=TN;Nashville;S
Texas=TX;Austin;S
Utah=UT;Salt Lake City;W
Vermont=VT;Montpelier;NE
Virginia=VA;Richmond;S
Washington=WA=Washington State;Olympia;W
West Virginia=WV;Charleston;S
Wisconsin=WI;Madison;MW
Wyoming=WY;Cheyenne;W
`
  .trim()
  .split("\n")
  .map((l) => {
    const [state, capital] = l.split(";");
    return { state, capital };
  });

export const geography: CategorySeed[] = [
  {
    name: "Countries",
    slug: "countries",
    icon: "globe",
    description: "Sovereign nations, grouped by continent and alliance.",
    source: "Compiled from UN membership lists plus widely recognised states (Vatican City, Palestine, Kosovo, Taiwan).",
    topics: [
      { name: "Countries of the world", slug: "countries-of-the-world", prompt: "Name as many countries as you can", difficulty: "easy", answers: countryList(() => true) },
      { name: "Countries in Africa", difficulty: "medium", answers: countryList(inCont("AF")) },
      { name: "Countries in Asia", difficulty: "medium", answers: countryList(inCont("AS")) },
      { name: "Countries in Europe", difficulty: "easy", answers: countryList(inCont("EU")) },
      { name: "Countries in North America and the Caribbean", slug: "countries-in-north-america", difficulty: "hard", answers: countryList(inCont("NA")) },
      { name: "Countries in South America", difficulty: "medium", answers: countryList(inCont("SA")) },
      { name: "Countries in Oceania", difficulty: "hard", answers: countryList(inCont("OC")) },
      { name: "Landlocked countries", difficulty: "hard", answers: countryList(hasFlag("L")) },
      { name: "European Union member states", slug: "eu-member-states", prompt: "Name as many EU member countries as you can", difficulty: "medium", answers: countryList(hasFlag("E")) },
      { name: "NATO member countries", slug: "nato-members", difficulty: "hard", answers: countryList(hasFlag("N")) },
      { name: "Spanish-speaking countries", difficulty: "medium", prompt: "Name as many countries where Spanish is an official language as you can", answers: countryList(hasFlag("S")) },
      { name: "Island nations", difficulty: "hard", prompt: "Name as many island countries as you can", answers: countryList(hasFlag("I")) },
    ],
  },
  {
    name: "Capitals & Cities",
    slug: "capitals-cities",
    icon: "building-2",
    description: "Capital cities and the world's great metropolises.",
    topics: [
      { name: "World capitals", slug: "world-capitals", prompt: "Name as many capital cities as you can", difficulty: "medium", answers: capitalList(() => true) },
      { name: "European capitals", difficulty: "medium", answers: capitalList(inCont("EU")) },
      { name: "Asian capitals", difficulty: "hard", answers: capitalList(inCont("AS")) },
      { name: "African capitals", difficulty: "hard", answers: capitalList(inCont("AF")) },
      { name: "Capitals in the Americas", slug: "capitals-of-the-americas", difficulty: "hard", answers: capitalList((c) => inCont("NA")(c) || inCont("SA")(c)) },
      {
        name: "US cities",
        difficulty: "easy",
        answers: `New York City=New York=NYC|Los Angeles=LA|Chicago|Houston|Phoenix|Philadelphia=Philly|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Charlotte|Indianapolis|San Francisco=SF|Seattle|Denver|Washington, D.C.=Washington DC|Oklahoma City|Nashville|El Paso|Boston|Portland|Las Vegas=Vegas|Detroit|Memphis|Louisville|Baltimore|Milwaukee|Albuquerque|Tucson|Fresno|Sacramento|Mesa|Kansas City|Atlanta|Omaha|Colorado Springs|Raleigh|Long Beach|Virginia Beach|Miami|Oakland|Minneapolis|Tulsa|Bakersfield|Wichita|Arlington|Aurora|Tampa|New Orleans|Cleveland|Honolulu|Anaheim|Lexington|Stockton|Corpus Christi|Henderson|Riverside|Newark|Saint Paul=St Paul|Santa Ana|Cincinnati|Irvine|Orlando|Pittsburgh|St. Louis=Saint Louis|Greensboro|Jersey City|Anchorage|Lincoln|Plano|Durham|Buffalo|Chandler|Chula Vista|Toledo|Madison|Gilbert|Reno|Fort Wayne|North Las Vegas|St. Petersburg=Saint Petersburg|Lubbock|Irving|Laredo|Winston-Salem|Chesapeake|Glendale|Garland|Scottsdale|Norfolk|Boise|Fremont|Spokane|Santa Clarita|Baton Rouge|Richmond|Hialeah|San Bernardino|Tacoma|Modesto|Huntsville|Des Moines|Yonkers|Rochester|Moreno Valley|Fayetteville|Fontana|Worcester|Port St. Lucie|Little Rock|Augusta|Oxnard|Birmingham|Montgomery|Frisco|Amarillo|Salt Lake City|Grand Rapids|Huntington Beach|Overland Park|Tallahassee|Grand Prairie|McKinney|Cape Coral|Sioux Falls|Peoria|Providence|Vancouver|Knoxville|Akron|Shreveport|Mobile|Brownsville|Newport News|Fort Lauderdale|Chattanooga|Tempe|Santa Rosa|Eugene|Elk Grove|Salem|Ontario|Cary|Rancho Cucamonga|Oceanside|Lancaster|Garden Grove|Pembroke Pines|Fort Collins|Palmdale|Springfield|Clarksville|Rockford|Alexandria|Savannah|Charleston|Pasadena|Syracuse|Hartford|Albany|Burlington|Boulder|Ann Arbor|Berkeley|Palo Alto|Santa Barbara|Santa Fe|Key West|Atlantic City|Miami Beach|Palm Springs|Malibu|Beverly Hills|Hollywood|Cambridge|Princeton|New Haven|Juneau|Cheyenne|Bismarck|Fargo|Billings|Missoula|Duluth|Green Bay|Dayton|Erie|Scranton|Allentown|Wilmington|Asheville|Myrtle Beach|Gainesville|Pensacola|Sarasota|Naples|Galveston|Waco|Flagstaff|Sedona|Yuma|Tuscaloosa|Biloxi|Jackson|Lafayette|Bloomington|Champaign|Iowa City|Cedar Rapids|Topeka|Norman|Provo|Ogden|Carson City|Olympia|Bellevue|Redmond|Hilo`,
      },
      {
        name: "European cities",
        difficulty: "easy",
        answers: `London|Paris|Berlin|Madrid|Rome|Barcelona|Amsterdam|Vienna|Prague|Budapest|Lisbon|Dublin|Brussels|Copenhagen|Stockholm|Oslo|Helsinki|Athens|Warsaw|Kraków=Krakow|Munich=München|Hamburg|Frankfurt|Cologne=Köln|Milan=Milano|Naples=Napoli|Florence=Firenze|Venice=Venezia|Turin=Torino|Bologna|Verona|Pisa|Genoa|Palermo|Seville=Sevilla|Valencia|Málaga|Bilbao|Granada|Porto=Oporto|Lyon|Marseille|Nice|Bordeaux|Toulouse|Strasbourg|Lille|Nantes|Cannes|Monaco|Geneva|Zurich=Zürich|Basel|Bern|Lausanne|Rotterdam|The Hague=Den Haag|Utrecht|Eindhoven|Antwerp|Bruges=Brugge|Ghent|Luxembourg|Edinburgh|Glasgow|Manchester|Liverpool|Birmingham|Leeds|Bristol|Oxford|Cambridge|Cardiff|Belfast|Cork|Galway|Reykjavík|Bergen|Gothenburg=Göteborg|Malmö|Aarhus|Tallinn|Riga|Vilnius|St. Petersburg=Saint Petersburg|Moscow|Kyiv=Kiev|Lviv|Odesa=Odessa|Minsk|Bucharest|Sofia|Belgrade|Zagreb|Split|Dubrovnik|Ljubljana|Sarajevo|Bratislava|Salzburg|Innsbruck|Dresden|Leipzig|Stuttgart|Düsseldorf|Hanover=Hannover|Nuremberg=Nürnberg|Bremen|Heidelberg|Thessaloniki|Istanbul|Valletta|Nicosia|Tirana|Skopje|Podgorica|Chișinău=Chisinau|Gdańsk=Gdansk|Wrocław=Wroclaw|Brno|Graz|Andorra la Vella|San Marino|Vaduz|Marbella|Ibiza|Palma|Santiago de Compostela|Toledo|Salamanca|Zaragoza|Córdoba|Siena|Lucca|Trieste|Bari|Catania|Montpellier|Avignon|Rouen|Reims|Le Havre|Bath|York|Brighton|Newcastle|Sheffield|Nottingham|Aberdeen|Inverness|Swansea`,
      },
      {
        name: "Asian cities",
        difficulty: "medium",
        answers: `Tokyo|Delhi=New Delhi|Shanghai|Beijing|Mumbai=Bombay|Dhaka|Osaka|Karachi|Chongqing|Istanbul|Kolkata=Calcutta|Manila|Guangzhou|Shenzhen|Lahore|Bangalore=Bengaluru|Jakarta|Chennai=Madras|Seoul|Bangkok|Hyderabad|Ho Chi Minh City=Saigon|Hanoi|Tehran|Hong Kong|Kuala Lumpur|Singapore|Riyadh|Baghdad|Dubai|Abu Dhabi|Doha|Kuwait City|Muscat|Jeddah|Mecca=Makkah|Medina|Ankara|Tel Aviv|Jerusalem|Amman|Beirut|Damascus|Kabul|Islamabad|Kathmandu|Colombo|Thimphu|Yangon=Rangoon|Phnom Penh|Vientiane|Taipei|Kaohsiung|Busan=Pusan|Incheon|Pyongyang|Ulaanbaatar|Almaty|Astana|Tashkent|Samarkand|Bishkek|Dushanbe|Ashgabat|Baku|Tbilisi|Yerevan|Kyoto|Yokohama|Nagoya|Sapporo|Fukuoka|Kobe|Hiroshima|Nara|Wuhan|Chengdu|Xi'an|Tianjin|Nanjing|Hangzhou|Suzhou|Macau=Macao|Harbin|Kunming|Lhasa|Pune|Ahmedabad|Jaipur|Lucknow|Surat|Kanpur|Varanasi|Agra|Goa|Kochi=Cochin|Chittagong|Peshawar|Faisalabad|Mashhad|Isfahan|Shiraz|Tabriz|Basra|Erbil|Aleppo|Cebu|Davao|Surabaya|Bandung|Bali|Yogyakarta|Medan|Penang=George Town|Malacca=Melaka|Chiang Mai|Phuket|Pattaya|Da Nang|Hue|Mandalay|Kandy|Malé|Manama|Sana'a=Sanaa|Bukhara`,
      },
      {
        name: "Indian cities",
        difficulty: "medium",
        answers: `Mumbai=Bombay|Delhi=New Delhi|Bengaluru=Bangalore|Hyderabad|Ahmedabad|Chennai=Madras|Kolkata=Calcutta|Surat|Pune=Poona|Jaipur|Lucknow|Kanpur|Nagpur|Indore|Thane|Bhopal|Visakhapatnam=Vizag|Patna|Vadodara=Baroda|Ghaziabad|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Varanasi=Benares=Banaras|Srinagar|Aurangabad=Chhatrapati Sambhajinagar|Dhanbad|Amritsar|Navi Mumbai|Prayagraj=Allahabad|Ranchi|Howrah|Coimbatore|Jabalpur|Gwalior|Vijayawada|Jodhpur|Madurai|Raipur|Kota|Guwahati|Chandigarh|Solapur|Mysuru=Mysore|Tiruchirappalli=Trichy|Bareilly|Aligarh|Gurugram=Gurgaon|Noida|Thiruvananthapuram=Trivandrum|Kochi=Cochin|Kozhikode=Calicut|Bhubaneswar|Cuttack|Dehradun|Shimla|Manali|Udaipur|Ajmer|Pushkar|Bikaner|Jaisalmer|Mangaluru=Mangalore|Hubballi=Hubli|Belagavi=Belgaum|Panaji=Panjim|Margao|Puducherry=Pondicherry|Shillong|Imphal|Aizawl|Kohima|Itanagar|Agartala|Gangtok|Darjeeling|Siliguri|Jammu|Leh|Rishikesh|Haridwar|Nainital|Mathura|Vrindavan|Ayodhya|Gorakhpur|Jamshedpur|Bokaro|Durgapur|Asansol|Warangal|Tirupati|Nellore|Guntur|Salem|Vellore|Erode|Tirunelveli|Thrissur|Kollam|Alappuzha=Alleppey|Jalandhar|Patiala|Bathinda|Rohtak|Panipat|Karnal|Ambala|Jhansi|Gaya|Bhagalpur|Muzaffarpur|Silchar|Dibrugarh|Kolhapur|Sangli|Nanded|Amravati|Akola|Ujjain|Sagar|Bilaspur|Bhilai|Rourkela|Sambalpur|Puri|Kurnool|Kakinada|Rajahmundry|Bhavnagar|Jamnagar|Gandhinagar|Anand|Bharuch|Porbandar|Dwarka|Somnath|Mount Abu|Ooty=Udhagamandalam|Kodaikanal|Munnar|Hampi`,
      },
      {
        name: "UK cities and towns",
        slug: "uk-cities",
        difficulty: "medium",
        answers: `London|Birmingham|Manchester|Liverpool|Leeds|Sheffield|Bristol|Newcastle=Newcastle upon Tyne|Nottingham|Leicester|Coventry|Bradford|Hull=Kingston upon Hull|Stoke-on-Trent=Stoke|Wolverhampton|Plymouth|Derby|Southampton|Portsmouth|Brighton|Reading|Milton Keynes|Northampton|Luton|Norwich|Swindon|Oxford|Cambridge|York|Bath|Exeter|Canterbury|Chester|Durham|Lincoln|Peterborough|Ipswich|Colchester|Chelmsford|Gloucester|Worcester|Hereford|Salisbury|Winchester|Lancaster|Preston|Blackpool|Bolton|Wigan|Stockport|Sunderland|Middlesbrough|Carlisle|Wakefield|Huddersfield|Doncaster|Rotherham|Barnsley|Bournemouth|Poole|Southend-on-Sea=Southend|Dover|Folkestone|Maidstone|Guildford|Watford|St Albans=Saint Albans|Cheltenham|Torquay|Truro|Penzance|Scarborough|Harrogate|Whitby|Glasgow|Edinburgh|Aberdeen|Dundee|Inverness|Stirling|Perth|St Andrews|Cardiff|Swansea|Newport|Wrexham|Bangor|St Davids|Belfast|Derry=Londonderry|Armagh|Lisburn|Newry`,
      },
      {
        name: "Canadian cities",
        difficulty: "hard",
        answers: `Toronto|Montreal=Montréal|Vancouver|Calgary|Edmonton|Ottawa|Winnipeg|Quebec City=Québec City|Hamilton|Kitchener|London|Victoria|Halifax|Oshawa|Windsor|Saskatoon|Regina|St. Catharines|Sherbrooke|Barrie|Kelowna|Abbotsford|Kingston|Sudbury|Saguenay|Trois-Rivières=Trois Rivieres|Guelph|Moncton|Brantford|Saint John|Thunder Bay|Peterborough|Lethbridge|Nanaimo|Kamloops|Red Deer|Fredericton|Charlottetown|St. John's=Saint Johns|Whitehorse|Yellowknife|Iqaluit|Mississauga|Brampton|Surrey|Burnaby|Richmond|Markham|Vaughan|Gatineau|Laval|Longueuil|Waterloo|Niagara Falls|Banff|Jasper|Whistler|Prince George|Fort McMurray|Medicine Hat|Sault Ste. Marie=Sault Ste Marie|North Bay|Timmins|Sydney|Corner Brook|Churchill`,
      },
      {
        name: "Australian and New Zealand cities",
        slug: "anz-cities",
        difficulty: "hard",
        answers: `Sydney|Melbourne|Brisbane|Perth|Adelaide|Gold Coast|Canberra|Newcastle|Wollongong|Hobart|Geelong|Townsville|Cairns|Darwin|Toowoomba|Ballarat|Bendigo|Launceston|Mackay|Rockhampton|Bunbury|Bundaberg|Wagga Wagga|Mildura|Albury|Alice Springs|Broome|Kalgoorlie|Port Macquarie|Byron Bay|Sunshine Coast|Fremantle|Auckland|Wellington|Christchurch|Hamilton|Tauranga|Dunedin|Palmerston North|Napier|Nelson|Rotorua|New Plymouth|Whangarei|Invercargill|Whanganui|Gisborne|Queenstown|Timaru|Hastings`,
      },
      {
        name: "Latin American cities",
        difficulty: "medium",
        answers: `Mexico City|São Paulo=Sao Paulo|Buenos Aires|Rio de Janeiro=Rio|Lima|Bogotá=Bogota|Santiago|Caracas|Guadalajara|Monterrey|Belo Horizonte|Brasília=Brasilia|Salvador|Fortaleza|Recife|Porto Alegre|Curitiba|Manaus|Medellín=Medellin|Cali|Cartagena|Barranquilla|Quito|Guayaquil|La Paz|Santa Cruz|Sucre|Asunción=Asuncion|Montevideo|Córdoba|Rosario|Mendoza|Valparaíso=Valparaiso|Havana|Santo Domingo|San Juan|Panama City|San José|Managua|Tegucigalpa|San Salvador|Guatemala City|Tijuana|Cancún=Cancun|Puebla|Acapulco|Oaxaca|Mérida=Merida|León|Cusco=Cuzco|Arequipa|Florianópolis=Florianopolis|Ushuaia|Punta del Este|Maracaibo|Kingston|Port-au-Prince|Belmopan|Paramaribo|Georgetown|Bariloche|Mar del Plata|Tulum|Puerto Vallarta|Cabo San Lucas|Veracruz|Antigua Guatemala`,
      },
      {
        name: "Japanese cities",
        difficulty: "hard",
        answers: `Tokyo|Yokohama|Osaka|Nagoya|Sapporo|Fukuoka|Kobe|Kawasaki|Kyoto|Saitama|Hiroshima|Sendai|Chiba|Kitakyushu|Sakai|Niigata|Hamamatsu|Kumamoto|Sagamihara|Shizuoka|Okayama|Kagoshima|Hachioji|Utsunomiya|Matsuyama|Kanazawa|Nagasaki|Nara|Naha|Kochi|Takamatsu|Toyama|Gifu|Wakayama|Nagano|Aomori|Akita|Morioka|Fukushima|Kofu|Tsu|Otsu|Matsue|Tottori|Tokushima|Yamaguchi|Oita|Miyazaki|Saga|Hakodate|Asahikawa|Nikko|Kamakura|Himeji|Hakone|Takayama|Ise|Beppu|Otaru|Matsumoto|Kurashiki|Okinawa`,
      },
      {
        name: "Chinese cities",
        difficulty: "hard",
        answers: `Shanghai|Beijing=Peking|Chongqing|Tianjin|Guangzhou=Canton|Shenzhen|Chengdu|Wuhan|Nanjing=Nanking|Xi'an=Xian|Hangzhou|Shenyang|Harbin|Suzhou|Qingdao=Tsingtao|Dalian|Zhengzhou|Jinan|Changsha|Kunming|Changchun|Ürümqi=Urumqi|Shantou|Hefei|Shijiazhuang|Ningbo|Taiyuan|Nanning|Xiamen=Amoy|Fuzhou|Wuxi|Dongguan|Foshan|Nanchang|Guiyang|Lanzhou|Hohhot|Lhasa|Xining|Yinchuan|Haikou|Sanya|Zhuhai|Guilin|Luoyang|Kaifeng|Datong|Yangzhou|Hong Kong|Macau=Macao|Kashgar|Lijiang|Dunhuang|Tangshan|Baotou|Wenzhou|Yantai|Zibo|Huizhou|Zhongshan`,
      },
    ],
  },
  {
    name: "States & Regions",
    slug: "states-regions",
    icon: "map",
    description: "The provinces, states and regions that make up nations.",
    topics: [
      { name: "US states", difficulty: "easy", answers: US_STATES.map((s) => s.state).join("|") },
      { name: "US state capitals", difficulty: "hard", answers: US_STATES.map((s) => s.capital).join("|") },
      {
        name: "Indian states and union territories",
        slug: "indian-states",
        difficulty: "medium",
        answers: `Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chhattisgarh|Goa|Gujarat|Haryana|Himachal Pradesh|Jharkhand|Karnataka|Kerala|Madhya Pradesh=MP|Maharashtra|Manipur|Meghalaya|Mizoram|Nagaland|Odisha=Orissa|Punjab|Rajasthan|Sikkim|Tamil Nadu|Telangana|Tripura|Uttar Pradesh=UP|Uttarakhand=Uttaranchal|West Bengal|Andaman and Nicobar Islands=Andaman and Nicobar|Chandigarh|Dadra and Nagar Haveli and Daman and Diu=Daman and Diu=Dadra and Nagar Haveli|Delhi=NCT of Delhi|Jammu and Kashmir=Kashmir|Ladakh|Lakshadweep|Puducherry=Pondicherry`,
      },
      {
        name: "Canadian provinces and territories",
        slug: "canadian-provinces",
        difficulty: "medium",
        answers: `Ontario|Quebec=Québec|British Columbia=BC|Alberta|Manitoba|Saskatchewan|Nova Scotia|New Brunswick|Newfoundland and Labrador=Newfoundland|Prince Edward Island=PEI|Yukon|Northwest Territories|Nunavut`,
      },
      {
        name: "Mexican states",
        difficulty: "hard",
        answers: `Aguascalientes|Baja California|Baja California Sur|Campeche|Chiapas|Chihuahua|Coahuila|Colima|Durango|Guanajuato|Guerrero|Hidalgo|Jalisco|México=State of Mexico=Estado de Mexico|Michoacán=Michoacan|Morelos|Nayarit|Nuevo León=Nuevo Leon|Oaxaca|Puebla|Querétaro=Queretaro|Quintana Roo|San Luis Potosí=San Luis Potosi|Sinaloa|Sonora|Tabasco|Tamaulipas|Tlaxcala|Veracruz|Yucatán=Yucatan|Zacatecas|Mexico City=Ciudad de Mexico=CDMX`,
      },
      {
        name: "Brazilian states",
        difficulty: "hard",
        answers: `Acre|Alagoas|Amapá=Amapa|Amazonas|Bahia|Ceará=Ceara|Espírito Santo=Espirito Santo|Goiás=Goias|Maranhão=Maranhao|Mato Grosso|Mato Grosso do Sul|Minas Gerais|Pará=Para|Paraíba=Paraiba|Paraná=Parana|Pernambuco|Piauí=Piaui|Rio de Janeiro|Rio Grande do Norte|Rio Grande do Sul|Rondônia=Rondonia|Roraima|Santa Catarina|São Paulo=Sao Paulo|Sergipe|Tocantins|Federal District=Distrito Federal`,
      },
      {
        name: "German states",
        difficulty: "hard",
        answers: `Baden-Württemberg=Baden-Wurttemberg|Bavaria=Bayern|Berlin|Brandenburg|Bremen|Hamburg|Hesse=Hessen|Lower Saxony=Niedersachsen|Mecklenburg-Vorpommern=Mecklenburg-Western Pomerania|North Rhine-Westphalia=Nordrhein-Westfalen=NRW|Rhineland-Palatinate=Rheinland-Pfalz|Saarland|Saxony=Sachsen|Saxony-Anhalt=Sachsen-Anhalt|Schleswig-Holstein|Thuringia=Thüringen`,
      },
      {
        name: "Japanese prefectures",
        difficulty: "hard",
        answers: `Hokkaido|Aomori|Iwate|Miyagi|Akita|Yamagata|Fukushima|Ibaraki|Tochigi|Gunma|Saitama|Chiba|Tokyo|Kanagawa|Niigata|Toyama|Ishikawa|Fukui|Yamanashi|Nagano|Gifu|Shizuoka|Aichi|Mie|Shiga|Kyoto|Osaka|Hyogo|Nara|Wakayama|Tottori|Shimane|Okayama|Hiroshima|Yamaguchi|Tokushima|Kagawa|Ehime|Kochi|Fukuoka|Saga|Nagasaki|Kumamoto|Oita|Miyazaki|Kagoshima|Okinawa`,
      },
      {
        name: "Chinese provinces and regions",
        slug: "chinese-provinces",
        difficulty: "hard",
        answers: `Anhui|Fujian|Gansu|Guangdong|Guizhou|Hainan|Hebei|Heilongjiang|Henan|Hubei|Hunan|Jiangsu|Jiangxi|Jilin|Liaoning|Qinghai|Shaanxi|Shandong|Shanxi|Sichuan=Szechuan|Yunnan|Zhejiang|Guangxi|Inner Mongolia|Ningxia|Tibet=Xizang|Xinjiang|Beijing|Chongqing|Shanghai|Tianjin|Hong Kong|Macau=Macao`,
      },
      {
        name: "Italian regions",
        difficulty: "hard",
        answers: `Abruzzo|Aosta Valley=Valle d'Aosta|Apulia=Puglia|Basilicata|Calabria|Campania|Emilia-Romagna|Friuli-Venezia Giulia=Friuli|Lazio|Liguria|Lombardy=Lombardia|Marche=Le Marche|Molise|Piedmont=Piemonte|Sardinia=Sardegna|Sicily=Sicilia|Trentino-Alto Adige=Trentino=South Tyrol|Tuscany=Toscana|Umbria|Veneto`,
      },
      {
        name: "Spanish autonomous communities",
        slug: "spanish-regions",
        prompt: "Name as many regions (autonomous communities) of Spain as you can",
        difficulty: "hard",
        answers: `Andalusia=Andalucía|Aragon=Aragón|Asturias|Balearic Islands=Baleares|Basque Country=País Vasco=Euskadi|Canary Islands=Canarias|Cantabria|Castile and León=Castilla y Leon|Castilla-La Mancha=Castile-La Mancha|Catalonia=Cataluña=Catalunya|Extremadura|Galicia|La Rioja=Rioja|Community of Madrid=Madrid|Region of Murcia=Murcia|Navarre=Navarra|Valencian Community=Valencia|Ceuta|Melilla`,
      },
      {
        name: "English counties",
        difficulty: "hard",
        answers: `Bedfordshire|Berkshire|Bristol|Buckinghamshire|Cambridgeshire|Cheshire|City of London|Cornwall|Cumbria|Derbyshire|Devon|Dorset|Durham=County Durham|East Riding of Yorkshire=East Yorkshire|East Sussex|Essex|Gloucestershire|Greater London|Greater Manchester|Hampshire|Herefordshire|Hertfordshire|Isle of Wight|Kent|Lancashire|Leicestershire|Lincolnshire|Merseyside|Norfolk|North Yorkshire|Northamptonshire|Northumberland|Nottinghamshire|Oxfordshire|Rutland|Shropshire|Somerset|South Yorkshire|Staffordshire|Suffolk|Surrey|Tyne and Wear|Warwickshire|West Midlands|West Sussex|West Yorkshire|Wiltshire|Worcestershire`,
      },
    ],
  },
  {
    name: "Natural Wonders",
    slug: "natural-wonders",
    icon: "mountain",
    description: "Rivers, peaks, seas and islands of planet Earth.",
    topics: [
      {
        name: "Rivers",
        difficulty: "medium",
        answers: `Nile|Amazon|Yangtze=Chang Jiang|Mississippi|Yenisei|Yellow River=Huang He|Ob|Paraná=Parana|Congo|Amur|Lena|Mekong|Mackenzie|Niger|Murray|Volga|Missouri|Danube|Rhine|Thames|Seine|Loire|Rhône=Rhone|Elbe|Oder|Vistula|Dnieper|Don|Ural|Po|Tiber|Ebro|Tagus=Tajo|Douro|Shannon|Severn|Trent|Tyne|Clyde|Ganges=Ganga|Indus|Brahmaputra|Yamuna|Godavari|Krishna|Narmada|Kaveri=Cauvery|Tigris|Euphrates|Jordan|Irrawaddy|Salween|Chao Phraya|Pearl River|Zambezi|Limpopo|Orange|Okavango|Senegal|Colorado|Columbia|Rio Grande|Ohio|Hudson|Potomac|Delaware|Tennessee|Arkansas|Red River|Snake|Yukon|St. Lawrence=Saint Lawrence|Fraser|Orinoco|Magdalena|São Francisco|Uruguay|Darling|Volta|Amu Darya|Syr Darya|Irtysh|Kolyma|Pechora|Dniester|Neva|Meuse=Maas|Moselle|Main|Garonne|Dordogne|Arno|Liffey|Avon|Mersey|Humber|Hooghly|Sutlej|Ravi|Chenab|Jhelum|Mahanadi|Sabarmati|Han River|Tumen|Rufiji|Ubangi|Kasai|Blue Nile|White Nile|Shire|Sacramento|Platte|Wabash|Cumberland|Susquehanna|Chattahoochee|Gila|Sava|Drava|Morava|Tisza|Inn|Aare`,
      },
      {
        name: "Mountains",
        prompt: "Name as many individual mountains as you can",
        difficulty: "medium",
        answers: `Mount Everest=Everest|K2|Kangchenjunga|Lhotse|Makalu|Cho Oyu|Dhaulagiri|Manaslu|Nanga Parbat|Annapurna|Gasherbrum|Broad Peak|Shishapangma|Nanda Devi|Kamet|Mount Kailash=Kailash|Aconcagua|Denali=Mount McKinley|Mount Kilimanjaro=Kilimanjaro|Mount Elbrus=Elbrus|Vinson Massif=Mount Vinson|Puncak Jaya=Carstensz Pyramid|Mont Blanc|Matterhorn|Eiger|Jungfrau|Mönch|Monte Rosa|Grossglockner|Zugspitze|Mount Olympus=Olympus|Mount Etna=Etna|Mount Vesuvius=Vesuvius|Stromboli|Ben Nevis|Snowdon=Yr Wyddfa|Scafell Pike|Mount Fuji=Fuji|Mount Rainier=Rainier|Mount St. Helens=Mount Saint Helens|Mount Hood|Mount Shasta|Mount Whitney|Pikes Peak|Mount Rushmore|Mount Washington|Mount Logan|Mount Robson|Chimborazo|Cotopaxi|Huascarán|Ojos del Salado|Mount Kenya|Mount Stanley|Ras Dashen|Mount Cook=Aoraki|Mount Kosciuszko=Kosciuszko|Mauna Kea|Mauna Loa|Mount Ararat=Ararat|Mount Sinai|Mount Kinabalu=Kinabalu|Mount Damavand=Damavand|Table Mountain|Mount Erebus|Popocatépetl=Popocatepetl|Pico de Orizaba=Citlaltépetl|Fitz Roy|Cerro Torre|Mount Tambora|Krakatoa|Mount Pinatubo|Mount Kazbek|Musala|Triglav|Mount Teide=Teide|Mount Athos|Mount Elbert|Half Dome|El Capitan|Mount Cameroon|Mount Meru|Mount Hermon|Mount Taranaki|Ruapehu|Sugarloaf Mountain=Pão de Açúcar|Ama Dablam|Kirkjufell|Mount Toubkal=Toubkal`,
      },
      {
        name: "Mountain ranges",
        difficulty: "medium",
        answers: `Himalayas|Andes|Rocky Mountains=Rockies|Alps|Appalachian Mountains=Appalachians|Ural Mountains=Urals|Atlas Mountains|Karakoram|Hindu Kush|Pyrenees|Carpathian Mountains=Carpathians|Caucasus Mountains=Caucasus|Sierra Nevada|Cascade Range=Cascades|Great Dividing Range|Tian Shan|Pamir Mountains=Pamirs|Altai Mountains=Altai|Apennines|Dolomites|Balkan Mountains|Dinaric Alps|Scandinavian Mountains|Zagros Mountains|Drakensberg|Rwenzori Mountains|Western Ghats|Eastern Ghats|Aravalli Range=Aravallis|Vindhya Range|Satpura Range|Brooks Range|Alaska Range|Coast Mountains|Sierra Madre|Ozarks|Adirondacks|Catskills|White Mountains|Blue Ridge Mountains|Smoky Mountains=Great Smoky Mountains|Black Hills|Teton Range=Tetons|Wasatch Range|Brecon Beacons|Cairngorms|Grampians|Pennines|Snowdonia|Jura Mountains|Vosges|Black Forest|Harz|Sudetes|Tatra Mountains=Tatras|Rhodope Mountains|Taurus Mountains|Elburz Mountains=Alborz|Kunlun Mountains|Qinling|Annamite Range|Southern Alps|Transantarctic Mountains|Ellsworth Mountains|Simien Mountains|Ahaggar Mountains=Hoggar|Tibesti Mountains|Ethiopian Highlands|Sierra Nevada de Santa Marta|Serra do Mar|Mackenzie Mountains|Laurentian Mountains|Olympic Mountains|Bitterroot Range|San Juan Mountains|Sangre de Cristo Mountains|Wicklow Mountains|Massif Central|Sierra Morena|Cantabrian Mountains`,
      },
      {
        name: "Lakes",
        difficulty: "hard",
        answers: `Caspian Sea|Lake Superior=Superior|Lake Victoria=Victoria|Lake Huron=Huron|Lake Michigan=Michigan|Lake Tanganyika=Tanganyika|Lake Baikal=Baikal|Great Bear Lake|Lake Malawi=Lake Nyasa|Great Slave Lake|Lake Erie=Erie|Lake Winnipeg|Lake Ontario=Ontario|Lake Ladoga|Lake Balkhash|Lake Vostok|Lake Onega|Lake Titicaca=Titicaca|Lake Nicaragua|Lake Athabasca|Lake Turkana|Reindeer Lake|Issyk-Kul|Lake Urmia|Lake Vänern=Vanern|Lake Chad|Aral Sea|Great Salt Lake|Lake Tahoe=Tahoe|Crater Lake|Lake Okeechobee|Lake Champlain|Lake Mead|Lake Powell|Lake of the Woods|Lake Louise|Loch Ness|Loch Lomond|Lough Neagh|Windermere|Lake Geneva=Lac Léman|Lake Constance=Bodensee|Lake Como=Como|Lake Garda=Garda|Lake Maggiore|Lake Lucerne|Lake Zurich|Lake Bled|Lake Balaton=Balaton|Lake Ohrid|Lake Saimaa|Dead Sea|Sea of Galilee=Lake Tiberias|Lake Van|Lake Toba|Tonlé Sap|Dal Lake|Chilika Lake|Pangong Tso|Wular Lake|Lake Taupō=Taupo|Lake Wakatipu|Lake Eyre=Kati Thanda|Lake Albert|Lake Edward|Lake Kivu|Lake Volta|Lake Kariba|Lake Nasser|Lake Tana|Lake Maracaibo|Lake Poopó|Lake Inari|Lake Peipus|Lake Qinghai|Poyang Lake|Dongting Lake|West Lake|Lake Biwa|Lake Nakuru|Lake Manyara|Lake Malaren=Mälaren|Lake Neusiedl|Lake Annecy|Lake Lugano`,
      },
      {
        name: "Deserts",
        difficulty: "hard",
        answers: `Sahara|Antarctic Desert|Arctic Desert|Arabian Desert|Gobi|Kalahari|Patagonian Desert|Great Victoria Desert|Syrian Desert|Great Basin Desert|Chihuahuan Desert|Great Sandy Desert|Karakum=Kara Kum|Gibson Desert|Sonoran Desert|Kyzylkum=Kyzyl Kum|Taklamakan|Thar Desert=Great Indian Desert|Mojave Desert=Mojave|Atacama|Namib|Danakil Desert|Simpson Desert|Tanami Desert|Strzelecki Desert|Rub' al Khali=Empty Quarter|Negev|Sinai Desert|Libyan Desert|Nubian Desert|Western Desert|Eastern Desert|Ogaden|Chalbi Desert|Dasht-e Kavir|Dasht-e Lut|Ordos Desert|Badain Jaran|Tengger Desert|Kumtag|Registan Desert|Cholistan Desert|Judean Desert|Wadi Rum|Black Rock Desert|Painted Desert|Red Desert|Great Salt Lake Desert|Owyhee Desert|Yuma Desert|Vizcaíno Desert|Sechura Desert|Monte Desert|La Guajira Desert|Tabernas Desert|Bardenas Reales|Little Sandy Desert|Pinnacles Desert|Lençóis Maranhenses|Tirari Desert|Sturt Stony Desert|Ténéré=Tenere`,
      },
      {
        name: "Islands",
        difficulty: "medium",
        answers: `Greenland|New Guinea|Borneo|Madagascar|Baffin Island|Sumatra|Honshu|Victoria Island|Great Britain|Ellesmere Island|Sulawesi=Celebes|South Island|Java|North Island|Luzon|Newfoundland|Cuba|Iceland|Mindanao|Ireland|Hokkaido|Hispaniola|Sakhalin|Banks Island|Sri Lanka|Tasmania|Devon Island|Tierra del Fuego|Kyushu|Shikoku|Hainan|Taiwan|Sicily|Sardinia|Corsica|Cyprus|Crete|Mallorca=Majorca|Menorca=Minorca|Ibiza|Malta|Gozo|Rhodes|Corfu|Santorini|Mykonos|Lesbos|Euboea|Gotland|Zealand|Funen|Bornholm|Isle of Man|Isle of Wight|Anglesey|Skye=Isle of Skye|Lewis and Harris|Orkney|Shetland|Jersey|Guernsey|Faroe Islands|Svalbard|Spitsbergen|Novaya Zemlya|Tenerife|Gran Canaria|Lanzarote|Fuerteventura|Madeira|Azores|Capri|Elba|Bali|Lombok|Komodo|Timor|Flores|Phuket|Langkawi|Penang|Singapore|Okinawa|Jeju|Zanzibar|Mauritius|Réunion|Seychelles|Socotra|Bermuda|Jamaica|Puerto Rico|Trinidad|Tobago|Barbados|Aruba|Curaçao|Bonaire|Martinique|Guadeloupe|Grenada|Antigua|Barbuda|Saint Lucia|Bahamas|Long Island|Manhattan|Staten Island|Nantucket|Martha's Vineyard|Kauai|Oahu|Maui|Molokai|Lanai|Hawaii=Big Island|Vancouver Island|Prince Edward Island|Cape Breton Island|Galápagos Islands=Galapagos|Easter Island=Rapa Nui|Tahiti|Bora Bora|Fiji|Samoa|Tonga|New Caledonia|Guam|Saipan|Palawan|Cebu|Bohol|Boracay|Andaman Islands|Nicobar Islands|Lakshadweep|Maldives|Kangaroo Island|Fraser Island=K'gari|Stewart Island|Christmas Island|Falkland Islands=Falklands=Malvinas|South Georgia|Ascension Island|Saint Helena=St Helena|Tristan da Cunha|Wrangel Island|Kodiak Island|Aleutian Islands`,
      },
      {
        name: "Seas and oceans",
        slug: "seas-and-oceans",
        difficulty: "medium",
        answers: `Pacific Ocean=Pacific|Atlantic Ocean=Atlantic|Indian Ocean=Indian|Arctic Ocean=Arctic|Southern Ocean=Antarctic Ocean|Mediterranean Sea=Mediterranean|Caribbean Sea=Caribbean|South China Sea|East China Sea|Bering Sea|Gulf of Mexico=Gulf of America|Sea of Okhotsk|Sea of Japan=East Sea|Hudson Bay|Andaman Sea|North Sea|Red Sea|Baltic Sea=Baltic|Black Sea|Caspian Sea|Arabian Sea|Bay of Bengal|Coral Sea|Tasman Sea|Philippine Sea|Yellow Sea|Barents Sea|Kara Sea|Laptev Sea|Norwegian Sea|Greenland Sea|Labrador Sea|Sargasso Sea|Aegean Sea|Adriatic Sea|Ionian Sea|Tyrrhenian Sea|Ligurian Sea|Balearic Sea|Alboran Sea|Sea of Marmara|Sea of Azov|Celtic Sea|Irish Sea|English Channel|Bay of Biscay|Persian Gulf=Arabian Gulf|Gulf of Oman|Gulf of Aden|Gulf of Thailand|Java Sea|Banda Sea|Arafura Sea|Timor Sea|Celebes Sea|Sulu Sea|Molucca Sea|Weddell Sea|Ross Sea|Amundsen Sea|Beaufort Sea|Chukchi Sea|East Siberian Sea|White Sea|Gulf of Bothnia|Gulf of Finland|Wadden Sea|Salish Sea|Gulf of California=Sea of Cortez|Gulf of Alaska|Gulf of Guinea|Mozambique Channel|Dead Sea|Sea of Galilee|Aral Sea|Scotia Sea|Bismarck Sea|Solomon Sea|Gulf of Carpentaria|Great Australian Bight|Gulf of Mannar|Laccadive Sea|Bay of Fundy|Gulf of St. Lawrence|Chesapeake Bay|Gulf of Maine|Sea of the Hebrides`,
      },
      {
        name: "Volcanoes",
        difficulty: "hard",
        answers: `Mount Vesuvius=Vesuvius|Mount Etna=Etna|Stromboli|Vulcano|Campi Flegrei|Mount Fuji=Fuji|Krakatoa=Krakatau|Mount Tambora=Tambora|Mount Merapi=Merapi|Mount Bromo=Bromo|Mount Agung=Agung|Mount Rinjani|Mount Pinatubo=Pinatubo|Mayon|Taal|Mount St. Helens=Mount Saint Helens|Mount Rainier|Mount Hood|Mount Shasta|Mount Baker|Lassen Peak|Mount Mazama|Yellowstone|Kīlauea=Kilauea|Mauna Loa|Mauna Kea|Haleakalā=Haleakala|Popocatépetl=Popocatepetl|Paricutín=Paricutin|Colima|Pico de Orizaba|Cotopaxi|Chimborazo|Tungurahua|Nevado del Ruiz|Villarrica|Osorno|Ojos del Salado|Llullaillaco|Mount Kilimanjaro=Kilimanjaro|Mount Nyiragongo=Nyiragongo|Nyamuragira|Ol Doinyo Lengai|Mount Cameroon|Erta Ale|Piton de la Fournaise|Mount Erebus=Erebus|Eyjafjallajökull=Eyjafjallajokull|Hekla|Katla|Grímsvötn|Askja|Laki|Fagradalsfjall|Mount Ararat=Ararat|Mount Damavand=Damavand|Mount Elbrus=Elbrus|Klyuchevskaya Sopka|Sakurajima|Mount Unzen|Mount Aso|Mount Ontake|White Island=Whakaari|Mount Ruapehu=Ruapehu|Mount Tongariro|Mount Ngauruhoe|Mount Taranaki|Rangitoto|Teide|Cumbre Vieja|Soufrière Hills|Mount Pelée|La Soufrière|Santorini|Nisyros|Mount Hekla|Barren Island|Novarupta|Mount Redoubt|Mount Spurr|Augustine Volcano|Mount Katmai|Hunga Tonga|Mount Sinabung|Semeru|Kelud|Anak Krakatau|Arenal|Poás|Irazú|Masaya|Fuego|Pacaya|Santa María|Changbaishan=Paektu Mountain`,
      },
      {
        name: "Waterfalls",
        difficulty: "hard",
        answers: `Niagara Falls=Niagara|Victoria Falls|Angel Falls=Kerepakupai Merú|Iguazu Falls=Iguaçu Falls=Iguassu|Yosemite Falls|Horseshoe Falls|American Falls|Bridal Veil Falls|Multnomah Falls|Havasu Falls|Lower Yellowstone Falls|Shoshone Falls|Snoqualmie Falls|Kaieteur Falls|Gocta Falls|Tugela Falls|Kalambo Falls|Murchison Falls|Blue Nile Falls|Ouzoud Falls|Augrabies Falls|Gullfoss|Dettifoss|Skógafoss=Skogafoss|Seljalandsfoss|Svartifoss|Goðafoss=Godafoss|Rhine Falls|Reichenbach Falls|Staubbach Falls|Krimml Waterfalls|Plitvice Falls|Krka Falls|Kjosfossen|Vøringsfossen|Seven Sisters|Mardalsfossen|Jog Falls|Dudhsagar Falls|Athirappilly Falls|Nohkalikai Falls|Hogenakkal Falls|Kempty Falls|Chitrakote Falls|Kunchikal Falls|Huangguoshu Waterfall|Detian Falls|Nachi Falls|Kegon Falls|Ban Gioc Falls|Erawan Falls|Kuang Si Falls|Tad Fane|Sutherland Falls|Huka Falls|Wallaman Falls|Jim Jim Falls|Wentworth Falls|Wailua Falls|Akaka Falls|Montmorency Falls|Takakkaw Falls|Della Falls|Basaseachic Falls|Hierve el Agua|Cascada de Agua Azul|Salto del Laja|Salto Grande|Caracol Falls|Hukou Waterfall|Langfoss|Powerscourt Waterfall|Aira Force|Pistyll Rhaeadr|Steall Falls|Burney Falls|Ruby Falls|Cumberland Falls|Taughannock Falls|Ramona Falls|Mooney Falls|Tahquamenon Falls|Palouse Falls`,
      },
      {
        name: "US national parks",
        difficulty: "hard",
        answers: `Acadia|American Samoa|Arches|Badlands|Big Bend|Biscayne|Black Canyon of the Gunnison|Bryce Canyon|Canyonlands|Capitol Reef|Carlsbad Caverns|Channel Islands|Congaree|Crater Lake|Cuyahoga Valley|Death Valley|Denali|Dry Tortugas|Everglades|Gates of the Arctic|Gateway Arch|Glacier|Glacier Bay|Grand Canyon|Grand Teton|Great Basin|Great Sand Dunes|Great Smoky Mountains=Smoky Mountains|Guadalupe Mountains|Haleakalā=Haleakala|Hawaii Volcanoes|Hot Springs|Indiana Dunes|Isle Royale|Joshua Tree|Katmai|Kenai Fjords|Kings Canyon|Kobuk Valley|Lake Clark|Lassen Volcanic|Mammoth Cave|Mesa Verde|Mount Rainier|New River Gorge|North Cascades|Olympic|Petrified Forest|Pinnacles|Redwood|Rocky Mountain|Saguaro|Sequoia|Shenandoah|Theodore Roosevelt|Virgin Islands|Voyageurs|White Sands|Wind Cave|Wrangell–St. Elias=Wrangell St Elias|Yellowstone|Yosemite|Zion`,
      },
    ],
  },
];
