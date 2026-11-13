import type { CategorySeed } from "@/lib/seed/types";

export const oddsAndEnds: CategorySeed[] = [
  {
    name: "Odds & Ends",
    slug: "odds-and-ends",
    icon: "shapes",
    description: "Pizza toppings, knots, sauces and other trivia drawers.",
    topics: [
      {
        name: "Olympic host cities",
        prompt: "Name as many cities that have hosted the Olympic Games as you can",
        difficulty: "hard",
        answers: `Athens|Paris|St. Louis|London|Stockholm|Antwerp|Chamonix|Amsterdam|St. Moritz|Lake Placid|Los Angeles|Garmisch-Partenkirchen|Berlin|Oslo|Helsinki|Cortina d'Ampezzo|Melbourne|Squaw Valley|Rome|Innsbruck|Tokyo|Grenoble|Mexico City|Sapporo|Munich|Montreal|Moscow|Sarajevo|Calgary|Seoul|Albertville|Barcelona|Lillehammer|Atlanta|Nagano|Sydney|Salt Lake City|Turin|Beijing|Vancouver|Sochi|Rio de Janeiro|Pyeongchang|Milan|Brisbane`,
      },
      {
        name: "Pizza toppings",
        difficulty: "easy",
        answers: `Pepperoni|Cheese|Mozzarella|Mushrooms|Onions|Red onion|Sausage|Italian sausage|Bacon|Ham|Pineapple|Olives|Black olives|Green olives|Green peppers=Bell peppers|Red peppers|Jalapeños=Jalapenos|Chicken|BBQ chicken|Tandoori chicken|Paneer|Ground beef|Meatballs|Salami|Prosciutto|Chorizo|Anchovies|Tuna|Shrimp=Prawns|Clams|Spinach|Tomatoes|Sun-dried tomatoes|Cherry tomatoes|Basil|Oregano|Garlic|Roasted garlic|Arugula=Rocket|Artichoke hearts|Sweetcorn=Corn|Broccoli|Zucchini|Eggplant|Potato|Egg|Feta|Goat cheese|Ricotta|Parmesan|Gorgonzola|Cheddar|Provolone|Pesto|Hot honey|Chili flakes|Truffle oil|Capers|Banana peppers|Pepperoncini|Caramelized onions|Figs|Pear|Walnuts|Pine nuts|Buffalo chicken|Pulled pork|Canadian bacon|Nduja|Soppressata|Capicola|Speck|Mortadella|Kebab meat|Gyro meat|Smoked salmon|Squid|Mussels|Mascarpone|Burrata|Stracciatella|Ranch|BBQ sauce|Alfredo sauce|Marinara|Kimchi|Bulgogi|Peri peri`,
      },
      {
        name: "Sandwiches",
        prompt: "Name as many kinds of sandwich as you can",
        difficulty: "medium",
        answers: `BLT|Club sandwich|Grilled cheese|Reuben|Cuban sandwich=Cubano|Philly cheesesteak=Cheesesteak|Hamburger=Burger|Cheeseburger|Hot dog|Sub=Submarine sandwich|Hoagie|Hero|Po' boy|Muffuletta|Banh mi|Panini|Croque monsieur|Croque madame|Monte Cristo|French dip|Sloppy Joe|Patty melt|Tuna melt|Egg salad sandwich|Chicken salad sandwich|Tuna sandwich|Ham sandwich|Ham and cheese|Turkey sandwich|Peanut butter and jelly=PB&J|Fluffernutter|Ice cream sandwich|Lobster roll|Crab cake sandwich|Fish finger sandwich|Fish sandwich|Chicken sandwich|Fried chicken sandwich|Pulled pork sandwich|Meatball sub|Italian sub|Caprese sandwich|Falafel wrap|Gyro|Shawarma|Doner kebab|Wrap|Burrito|Quesadilla|Torta|Cemita|Bocadillo|Tramezzino|Piadina|Smørrebrød|Open sandwich|Bacon butty|Chip butty|Sausage sandwich|Egg McMuffin|Breakfast sandwich|Bagel and lox|Pastrami on rye|Corned beef sandwich|Roast beef sandwich|Beef on weck|Dagwood|Spiedie|Bauru|Chivito|Choripán|Medianoche|Elvis sandwich|Katsu sando|Tamago sando|Fruit sando|Vada pav|Bombay sandwich|Dabeli|Bun maska|Kathi roll|Frankie|Cucumber sandwich|Watercress sandwich|Ploughman's|Coronation chicken sandwich|Prawn mayo|Cheese and pickle|Marmite sandwich|Vegemite sandwich|Toastie|Jaffle|Bunny chow|Gatsby|Arepa|Pambazo|Pita pocket|Sabich|Pan bagnat|Jambon-beurre|Francesinha|Bifana|Prego|Leberkäse roll|Fischbrötchen|Zapiekanka|Tavuk döner|Kumpir|Slider|Rou jia mo`,
      },
      {
        name: "Sauces and condiments",
        difficulty: "medium",
        answers: `Ketchup|Mayonnaise=Mayo|Mustard|Dijon mustard|Honey mustard|BBQ sauce=Barbecue sauce|Hot sauce|Sriracha|Tabasco|Soy sauce|Teriyaki sauce|Hoisin sauce|Oyster sauce|Fish sauce|Sweet chili sauce|Worcestershire sauce|Ranch|Blue cheese dressing|Thousand Island|Caesar dressing|Vinaigrette|Balsamic vinegar|Vinegar|Malt vinegar|Salsa|Pico de gallo|Guacamole|Hummus|Tahini|Tzatziki|Pesto|Marinara|Alfredo|Béchamel|Hollandaise|Béarnaise|Velouté|Espagnole|Gravy|Mint sauce|Cranberry sauce|Apple sauce|Horseradish|Wasabi|Pickled ginger|Relish|Piccalilli|Chutney|Mango chutney|Mint chutney|Tamarind chutney|Coriander chutney|Coconut chutney|Achaar=Pickle|Raita|Chimichurri|Aioli|Romesco|Harissa|Peri-peri|Gochujang|Doenjang|Ssamjang|Kewpie mayo|Ponzu|Tonkatsu sauce|Yum yum sauce|Sambal|Sambal oelek|Chili oil|Chili crisp|XO sauce|Black bean sauce|Plum sauce|Duck sauce|Satay sauce=Peanut sauce|Nuoc cham|Brown sauce|HP Sauce|Salad cream|Tartar sauce|Cocktail sauce|Marie Rose sauce|Remoulade|Comeback sauce|Buffalo sauce|Enchilada sauce|Mole|Adobo|Salsa verde|Tomatillo salsa|Chipotle mayo|Sweet and sour sauce|Garlic sauce|Toum|Zhoug|Muhammara|Baba ghanoush|Shito|Suya spice|Mumbo sauce|Steak sauce|A1|Maple syrup|Honey|Jam|Marmalade|Nutella|Peanut butter|Butter|Ghee|Marmite|Vegemite|Golden syrup|Chocolate sauce|Caramel sauce|Butterscotch sauce|Custard|Whipped cream`,
      },
      {
        name: "Breakfast cereals",
        difficulty: "medium",
        answers: `Corn Flakes=Cornflakes|Frosted Flakes=Frosties|Rice Krispies=Rice Bubbles|Cheerios|Honey Nut Cheerios|Froot Loops=Fruit Loops|Lucky Charms|Cinnamon Toast Crunch|Cap'n Crunch|Cocoa Puffs|Cocoa Pops=Coco Pops|Trix|Kix|Golden Grahams|Honey Smacks=Honey Monster Puffs|Apple Jacks|Raisin Bran|All-Bran|Bran Flakes|Special K|Shreddies|Shredded Wheat|Weetabix|Weet-Bix|Crunchy Nut|Fruit 'n Fibre|Alpen|Muesli|Granola|Oatmeal=Porridge|Quaker Oats|Grape-Nuts|Life|Chex|Rice Chex|Corn Chex|Wheaties|Total|Fiber One|Kashi|Honey Bunches of Oats|Reese's Puffs|Count Chocula|Franken Berry|Boo Berry|Cookie Crisp|Golden Crisp|Corn Pops|Krave|Cinnamon Life|Honeycomb|Fruity Pebbles|Cocoa Pebbles|Oreo O's|Waffle Crisp|French Toast Crunch|Mini-Wheats=Frosted Mini-Wheats|Crispix|Cracklin' Oat Bran|Smorz|Chocos|Ready Brek|Puffed Wheat|Sugar Puffs|Nesquik cereal|Lion cereal|Curiously Cinnamon|Clusters|Oat Clusters|Cream of Wheat|Malt-O-Meal|Grits|Poha|Upma|Daliya|Wheat flakes`,
      },
      {
        name: "Famous dogs",
        prompt: "Name as many famous dogs (real or fictional) as you can",
        difficulty: "medium",
        answers: `Snoopy|Scooby-Doo|Lassie|Pluto|Goofy|Clifford|Odie|Toto|Rin Tin Tin|Beethoven|Marley|Hachiko=Hachi|Balto|Laika|Gromit|Brian Griffin|Santa's Little Helper|Krypto|Ace the Bat-Hound|Bolt|Dug|Slinky Dog|Lady|Tramp|Pongo|Perdita|Copper|Max|Spot|Blue|Bluey|Bingo|Chase|Marshall|Skye|Rubble|Rocky|Zuma|Everest|Courage|Droopy|Spike|Muttley|Astro|Scrappy-Doo|Dogmeat|K-9|Fang|Fluffy|Snowy|Gnasher|Pudsey|Bullseye|Old Yeller|Benji|Hooch|Air Bud|Shiloh|Hound Dog|Wishbone|Eddie|Comet|Nana|Pilot|Jip|Buck|White Fang|Lad|Greyfriars Bobby|Bobbie the Wonder Dog|Smoky|Sergeant Stubby|Bo|Sunny|Millie|Buddy|Major|Commander|Checkers|Fala|Barney|Boo|Grumpy|Doug the Pug|Tuna|Jiff|Mishka|Doge|Kabosu|Cheems|Togo|Sirius|Bandit|Gidget|Duke|Chance|Shadow|Sassy|Hercules|Einstein|Dodger|Rita|Jock|Trusty|Bruno|Dinky|Ralph|Patrasche|Pickles|Wellard`,
      },
      {
        name: "Knots",
        prompt: "Name as many knots as you can",
        difficulty: "hard",
        answers: `Square knot=Reef knot|Granny knot|Bowline|Clove hitch|Half hitch|Two half hitches|Figure-eight knot=Figure eight|Overhand knot|Slip knot|Sheet bend|Double sheet bend|Fisherman's knot|Double fisherman's knot|Surgeon's knot|Taut-line hitch|Trucker's hitch|Timber hitch|Rolling hitch|Cow hitch=Girth hitch|Prusik knot=Prusik|Alpine butterfly knot|Running bowline|Bowline on a bight|Sheepshank|Cat's paw|Monkey's fist|Hangman's knot=Noose|Constrictor knot|Carrick bend|Zeppelin bend|Water knot|Blood knot|Improved clinch knot|Palomar knot|Uni knot|Albright knot|Trilene knot|Dropper loop|Nail knot|Turle knot|Figure-eight loop|Double figure-eight|Klemheist knot|Munter hitch|Mule hitch|Marlinspike hitch|Highwayman's hitch|Halter hitch|Lark's head|Buntline hitch|Anchor bend|Midshipman's hitch|Icicle hitch|Pile hitch|Round turn and two half hitches|Heaving line knot|Stopper knot|Ashley stopper knot|Wall knot|Crown knot|Diamond knot|Matthew Walker knot|Turk's head|Chinese button knot|Lanyard knot|Celtic knot|Windsor knot|Half-Windsor knot|Four-in-hand knot|Pratt knot|Eldredge knot|Trinity knot|Bow knot=Shoelace knot|Ian knot|Thief knot|Adjustable grip hitch|Farrimond friction hitch|Dolly knot|Square lashing|Diagonal lashing|Shear lashing|Tripod lashing|Gordian knot`,
      },
      {
        name: "Salads",
        prompt: "Name as many kinds of salad as you can",
        difficulty: "medium",
        answers: `Caesar salad|Greek salad|Garden salad|Caprese salad|Cobb salad|Waldorf salad|Niçoise salad=Nicoise salad|Chef salad|Potato salad|Pasta salad|Macaroni salad|Coleslaw|Egg salad|Chicken salad|Tuna salad|Fruit salad|Tabbouleh|Fattoush|Panzanella|Wedge salad|Taco salad|Kale salad|Spinach salad|Quinoa salad|Couscous salad|Bean salad|Three-bean salad|Lentil salad|Chickpea salad|Cucumber salad|Tomato salad|Beet salad|Carrot salad|Shirazi salad|Israeli salad|Kachumber|Raita|Koshimbir|Sprout salad|Chana chaat|Som tam=Papaya salad|Larb|Yum woon sen|Gado-gado|Rojak|Urap|Ensalada rusa=Olivier salad|Vinegret|Herring under a fur coat|Shopska salad|Horiatiki|Insalata mista|Insalata di mare|Seafood salad|Crab salad|Shrimp salad|Ceviche|Poke bowl|Seaweed salad|Wakame salad|Kani salad|Oriental salad|Chinese chicken salad|Asian slaw|Buddha bowl|Grain bowl|Burrata salad|Arugula salad|Mesclun|Frisée salad|Salade lyonnaise|Watergate salad|Ambrosia|Jello salad|Snickers salad|Seven-layer salad|Broccoli salad|Cauliflower salad|Corn salad|Mexican street corn salad|Elote salad|Watermelon feta salad|Avocado salad|Mango salad|Pomegranate salad|Citrus salad|Orange salad|Fennel salad|Celery salad|Apple salad|Pear salad|Grilled chicken salad|Steak salad|Taco bowl|Antipasto salad|Muffuletta salad|Kosambari|Tossed salad|Green salad|Side salad|House salad|Mixed salad`,
      },
    ],
  },
];
