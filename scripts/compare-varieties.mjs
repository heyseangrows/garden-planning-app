import { listCrops } from '@cropgraph/core';

// All Premier Seeds Direct varieties (manually compiled from the sweep)
const psd = [
  // ARTICHOKE
  {crop:"Artichoke", variety:"Gros Vert de Laon", psd:"Artichoke - Gros Vert de Laon"},
  {crop:"Artichoke", variety:"Italian Green Globe", psd:"Artichoke Italian Green Globe"},
  // ASPARAGUS
  {crop:"Asparagus", variety:"Connovers Colossal", psd:"Asparagus Connovers Colossal"},
  {crop:"Asparagus", variety:"Mary Washington", psd:"Asparagus Mary Washington"},
  {crop:"Asparagus", variety:"Precoce D'Argentuil", psd:"Asparagus Precoce D'Argentuil"},
  {crop:"Asparagus", variety:"UC 72", psd:"Asparagus UC 72"},
  {crop:"Asparagus", variety:"UC 157 F2", psd:"Asparagus UC 157 F2"},
  // AUBERGINE
  {crop:"Aubergine", variety:"Black Beauty", psd:"Aubergine Egg Plant Black Beauty"},
  {crop:"Aubergine", variety:"Listada De Gandia", psd:"Aubergine Listada De Gandia"},
  {crop:"Aubergine", variety:"White Casper", psd:"Aubergine White Casper"},
  {crop:"Aubergine", variety:"Turkish Orange", psd:"Aubergine Turkish Orange"},
  {crop:"Aubergine", variety:"Long Purple", psd:"Aubergine Long Purple"},
  {crop:"Aubergine", variety:"Little Fingers", psd:"Aubergine Little Fingers"},
  {crop:"Aubergine", variety:"Violetta Di Firenze", psd:"Italian Aubergine Violetta Di Firenze"},
  {crop:"Aubergine", variety:"Purple Knight F1", psd:"Aubergine Purple Knight F1"},
  {crop:"Aubergine", variety:"Knight Mix F1", psd:"Aubergine 'Knight Mix' F1"},
  {crop:"Aubergine", variety:"White Knight F1", psd:"Aubergine White Knight F1"},
  {crop:"Aubergine", variety:"Green Knight F1", psd:"Aubergine Green Knight F1"},
  // BEAN
  {crop:"Bean", variety:"Cobra", psd:"Climbing French Bean Cobra"},
  {crop:"Bean", variety:"Masterpiece Green", psd:"Broad Bean Masterpiece Green"},
  {crop:"Bean", variety:"Slenderette", psd:"Dwarf French Bean Slenderette"},
  {crop:"Bean", variety:"Moonlight", psd:"Runner Bean Moonlight"},
  {crop:"Bean", variety:"Safari", psd:"Dwarf French Bean Safari"},
  {crop:"Bean", variety:"Lady Di", psd:"Runner Bean Lady Di"},
  {crop:"Bean", variety:"Grano Violetto", psd:"Broad Bean Grano Violetto Winter Hardy"},
  {crop:"Bean", variety:"Firestorm", psd:"Runner Bean Firestorm"},
  {crop:"Bean", variety:"Lingua Di Fuoco 2", psd:"Climbing Borlotto Bean Lingua Di Fuoco 2"},
  {crop:"Bean", variety:"Sutton Dwarf", psd:"Dwarf Broad Bean Sutton Dwarf"},
  {crop:"Bean", variety:"Polestar", psd:"Runner Bean Polestar Stringless"},
  {crop:"Bean", variety:"White Lady", psd:"Runner Bean White Lady"},
  {crop:"Bean", variety:"Scarlet Emperor", psd:"Runner Bean Scarlet Emperor"},
  {crop:"Bean", variety:"Blauhilde", psd:"Climbing French Purple Bean Blauhilde"},
  {crop:"Bean", variety:"Pink Karmazyn", psd:"Broad Bean Pink Karmazyn"},
  {crop:"Bean", variety:"Enorma", psd:"Runner Bean Enorma Exhibition"},
  {crop:"Bean", variety:"Lingua Di Fuoco", psd:"Dwarf Italian Borlotto Bean Lingua Di Fuoco"},
  {crop:"Bean", variety:"Painted Lady", psd:"Runner Bean Painted Lady"},
  {crop:"Bean", variety:"A Cosse Violette", psd:"French Climbing Bean A Cosse Violette"},
  {crop:"Bean", variety:"Blue Lake", psd:"Climbing French Bean Blue Lake"},
  {crop:"Bean", variety:"Ferrari", psd:"Dwarf Kenyan Bean Ferrari"},
  {crop:"Bean", variety:"Kentucky Wonder Wax", psd:"Climbing Yellow Bean Kentucky Wonder Wax"},
  {crop:"Bean", variety:"Bergold", psd:"Dwarf Yellow French Bean Bergold"},
  {crop:"Bean", variety:"Tendergreen", psd:"Dwarf French Bean Tendergreen"},
  {crop:"Bean", variety:"Aquadulce Claudia", psd:"Broad Bean Aquadulce Claudia"},
  {crop:"Bean", variety:"Witkiem", psd:"Broad Bean Witkiem"},
  {crop:"Bean", variety:"Marvel of Venice", psd:"Italian Climbing Bean Marvel of Venice"},
  {crop:"Bean", variety:"Hestia", psd:"Dwarf Runner Bean Hestia"},
  {crop:"Bean", variety:"Armstrong", psd:"Runner Bean Armstrong"},
  {crop:"Bean", variety:"Lima O Del Papa", psd:"Bean Lima O Del Papa"},
  {crop:"Bean", variety:"Neckargold", psd:"Climbing Golden Yellow Bean Neckargold"},
  {crop:"Bean", variety:"Un Metro Ramp", psd:"Bean Yard Long-Un Metro Ramp"},
  {crop:"Bean", variety:"Helda", psd:"Climbing Bean Helda"},
  {crop:"Bean", variety:"Kentucky Wonder", psd:"Climbing Pole Bean Kentucky Wonder"},
  {crop:"Bean", variety:"Sunset", psd:"Runner Bean Sunset"},
  {crop:"Bean", variety:"Harrison", psd:"Dwarf Bean – Harrison"},
  {crop:"Bean", variety:"1500 Year Cave Bean", psd:"Bean 1500 Year Cave Bean"},
  {crop:"Bean", variety:"Yin Yang", psd:"Bean Yin Yang"},
  {crop:"Bean", variety:"Benchmaster", psd:"Runner Bean 'Benchmaster'"},
  {crop:"Bean", variety:"Cocco Bianco", psd:"Dwarf Bean Cocco Bianco"},
  // BEETROOT
  {crop:"Beetroot", variety:"Boltardy", psd:"Beetroot Boltardy"},
  {crop:"Beetroot", variety:"Detroit Dark Red", psd:"Beetroot Detroit Dark Red"},
  {crop:"Beetroot", variety:"Burpees Golden", psd:"Beetroot Burpees Golden"},
  {crop:"Beetroot", variety:"Bull's Blood", psd:"Beetroot Bull's Blood"},
  {crop:"Beetroot", variety:"Lutz Green Leaf", psd:"Winter Beetroot Lutz Green Leaf Red Stem"},
  {crop:"Beetroot", variety:"Rainbow Mix", psd:"Beetroot Rainbow Mix"},
  {crop:"Beetroot", variety:"Golden Boldor F1", psd:"Beetroot Golden Boldor F1"},
  {crop:"Beetroot", variety:"Cylindra", psd:"Beetroot Cylindra"},
  {crop:"Beetroot", variety:"Albino White", psd:"Beetroot Albino White"},
  {crop:"Beetroot", variety:"Chioggia", psd:"Beetroot Chioggia"},
  // BROCCOLI
  {crop:"Broccoli", variety:"Rudolph Extra Early", psd:"Broccoli Sprouting Rudolph Extra Early"},
  {crop:"Broccoli", variety:"Purple Early Sprouting", psd:"Broccoli Purple Early Sprouting"},
  {crop:"Broccoli", variety:"Stromboli F1", psd:"Broccoli Stromboli F1"},
  {crop:"Broccoli", variety:"Summer Purple", psd:"Broccoli Sprouting Summer Purple"},
  {crop:"Broccoli", variety:"Calabrese Green", psd:"Broccoli Sprouting Calabrese Green"},
  {crop:"Broccoli", variety:"Marathon F1", psd:"Broccoli Marathon F1"},
  {crop:"Broccoli", variety:"Quarantino Riccio", psd:"Broccoletto Quarantino Riccio"},
  {crop:"Broccoli", variety:"De Ciccio Heirloom", psd:"Broccoli De Ciccio Heirloom"},
  {crop:"Broccoli", variety:"Monclano F1", psd:"Broccoli Monclano F1"},
  {crop:"Broccoli", variety:"Tenderette F1", psd:"Broccoli Tenderette F1"},
  {crop:"Broccoli", variety:"Claret F1", psd:"Sprouting Broccoli Claret F1"},
  {crop:"Broccoli", variety:"Santee F1", psd:"Broccoli Sprouting Santee F1"},
  // BRUSSELS SPROUTS
  {crop:"Brussels Sprouts", variety:"Brilliant F1", psd:"Brussels Sprout Brilliant F1"},
  {crop:"Brussels Sprouts", variety:"Trafalgar F1", psd:"Brussels Sprout Trafalgar F1"},
  {crop:"Brussels Sprouts", variety:"Long Island Improved", psd:"Brussels Sprout Long Island Improved"},
  {crop:"Brussels Sprouts", variety:"Evesham Special", psd:"Brussels Sprout Evesham Special"},
  {crop:"Brussels Sprouts", variety:"Red Bull", psd:"Brussels Sprout Red Bull"},
  {crop:"Brussels Sprouts", variety:"Darkmar 21", psd:"Brussels Sprout Darkmar 21"},
  {crop:"Brussels Sprouts", variety:"Cryptus F1", psd:"Brussels Sprout Cryptus F1"},
  // CABBAGE
  {crop:"Cabbage", variety:"Durham Early", psd:"Cabbage Durham Early Spring Greens"},
  {crop:"Cabbage", variety:"Greyhound", psd:"Cabbage Greyhound"},
  {crop:"Cabbage", variety:"Winter Tundra F1", psd:"Cabbage Winter Tundra F1"},
  {crop:"Cabbage", variety:"Caraflex F1", psd:"Cabbage Caraflex F1"},
  {crop:"Cabbage", variety:"Savoy Perfection", psd:"Cabbage Savoy Perfection"},
  {crop:"Cabbage", variety:"Mammoth Red Rock", psd:"Cabbage Mammoth Red Rock"},
  {crop:"Cabbage", variety:"Primo II", psd:"Cabbage Primo (II)"},
  {crop:"Cabbage", variety:"Red Acre", psd:"Cabbage Red Acre"},
  {crop:"Cabbage", variety:"Copenhagen Market", psd:"Cabbage Copenhagen Market"},
  {crop:"Cabbage", variety:"Cordesa F1", psd:"Cabbage Cordesa F1"},
  {crop:"Cabbage", variety:"Brunswick Heirloom", psd:"Cabbage Brunswick Heirloom"},
  {crop:"Cabbage", variety:"Golden Acre", psd:"Cabbage Golden Acre"},
  {crop:"Cabbage", variety:"Kilazol", psd:"Cabbage Kilazol"},
  {crop:"Cabbage", variety:"Savoy Di Verona", psd:"Cabbage Savoy Di Verona"},
  {crop:"Cabbage", variety:"Rococo F1", psd:"Cabbage Rococo F1"},
  {crop:"Cabbage", variety:"Earliest of All", psd:"Cabbage Earliest of All"},
  {crop:"Cabbage", variety:"Elisa F1", psd:"Cabbage Elisa F1"},
  {crop:"Cabbage", variety:"Rovite F1", psd:"Cabbage Rovite F1"},
  {crop:"Cabbage", variety:"Red Kalibos", psd:"Cabbage Red Kalibos"},
  {crop:"Cabbage", variety:"Japanese Saku Saku", psd:"Cabbage Japanese Saku Saku"},
  {crop:"Cabbage", variety:"Red Drumhead", psd:"Cabbage Red Drumhead"},
  // PAK CHOI (under cabbage on PSD but separate in cropgraph)
  {crop:"Pak Choi", variety:"White Stem", psd:"Cabbage Pak Choi White Stem"},
  {crop:"Pak Choi", variety:"Red F1", psd:"Cabbage Pak Choi Red F1"},
  {crop:"Pak Choi", variety:"Green Stem", psd:"Cabbage Pak Choi Green Stem"},
  // CHINESE CABBAGE
  {crop:"Chinese Cabbage", variety:"Wong Bok", psd:"Cabbage Wong Bok"},
  {crop:"Chinese Cabbage", variety:"Michihili", psd:"Cabbage Chinese Michihili"},
  {crop:"Chinese Cabbage", variety:"Scarvita F1", psd:"Cabbage Chinese Scarvita F1"},
  // CAPE GOOSEBERRY
  {crop:"Cape Gooseberry", variety:"Physalis Peruviana", psd:"Cape Gooseberry (Physalis Peruviana)"},
  // CARROT
  {crop:"Carrot", variety:"Resistafly", psd:"Carrot Resistafly"},
  {crop:"Carrot", variety:"Maestro F1", psd:"Carrot Maestro F1"},
  {crop:"Carrot", variety:"Amsterdam Forcing", psd:"Carrot Amsterdam Forcing Early"},
  {crop:"Carrot", variety:"Autumn King", psd:"Carrot Autumn King Pelleted"},
  {crop:"Carrot", variety:"Early Nantes 2", psd:"Carrot Early Nantes 2"},
  {crop:"Carrot", variety:"Royal Chantenay", psd:"Carrot Royal Chantenay"},
  {crop:"Carrot", variety:"Sweet Candle F1", psd:"Carrot Sweet Candle F1"},
  {crop:"Carrot", variety:"Solar Yellow", psd:"Carrot Solar Yellow"},
  {crop:"Carrot", variety:"Touchon", psd:"Carrot Touchon"},
  {crop:"Carrot", variety:"Tendersweet", psd:"Carrot Tendersweet"},
  {crop:"Carrot", variety:"Purple Dragon F1", psd:"Carrot Purple Dragon F1"},
  {crop:"Carrot", variety:"Berlicum", psd:"Carrot Berlicum"},
  {crop:"Carrot", variety:"Bangor F1", psd:"Carrot Bangor F1"},
  {crop:"Carrot", variety:"Atomic Red", psd:"Carrot Atomic Red"},
  {crop:"Carrot", variety:"Purple Sun F1", psd:"Carrot Purple Sun F1"},
  {crop:"Carrot", variety:"Flyaway F1", psd:"Carrot Flyaway F1"},
  {crop:"Carrot", variety:"Parisian Paris Market", psd:"Carrot Parisian Paris Market"},
  {crop:"Carrot", variety:"Little Finger", psd:"Carrot Little Finger (Miniature)"},
  {crop:"Carrot", variety:"Rainbow Mix F1", psd:"Carrot Rainbow Mix F1"},
  {crop:"Carrot", variety:"Eskimo F1", psd:"Carrot Eskimo F1"},
  {crop:"Carrot", variety:"Scarlet Nantes", psd:"Carrot Scarlet Nantes"},
  {crop:"Carrot", variety:"Lunar White", psd:"Carrot Lunar White"},
  {crop:"Carrot", variety:"Deep Purple F1", psd:"Carrot Deep Purple F1"},
  {crop:"Carrot", variety:"Cosmic Purple", psd:"Carrot Cosmic Purple"},
  {crop:"Carrot", variety:"Purple Haze F1", psd:"Carrot Purple Haze Hybrid F1"},
  {crop:"Carrot", variety:"Red Sun F1", psd:"Carrot Red Sun F1"},
  {crop:"Carrot", variety:"Short 'n' Sweet", psd:"Carrot Short 'n' Sweet"},
  {crop:"Carrot", variety:"Yellowstone", psd:"Carrot Yellowstone"},
  {crop:"Carrot", variety:"Imperator", psd:"Carrot Imperator"},
  {crop:"Carrot", variety:"Yellow Moon F1", psd:"Carrot Yellow Moon F1"},
  {crop:"Carrot", variety:"White Satin F1", psd:"Carrot White Satin F1"},
  // CAULIFLOWER
  {crop:"Cauliflower", variety:"Igloo", psd:"Cauliflower Igloo (Summer)"},
  {crop:"Cauliflower", variety:"Clapton F1", psd:"Cauliflower Clapton F1"},
  {crop:"Cauliflower", variety:"Di Sicilia Violetto", psd:"Cauliflower Di Sicilia Violetto"},
  {crop:"Cauliflower", variety:"Romanesco Ottobrino", psd:"Italian Cauliflower Romanesco Ottobrino"},
  {crop:"Cauliflower", variety:"All Year Round", psd:"Cauliflower 'All Year Round'"},
  {crop:"Cauliflower", variety:"Candid Charm F1", psd:"Cauliflower Candid Charm F1"},
  {crop:"Cauliflower", variety:"White Excel F1", psd:"Cauliflower White Excel F1"},
  {crop:"Cauliflower", variety:"Multi-headed F1", psd:"Cauliflower Multi-headed F1"},
  {crop:"Cauliflower", variety:"Cartesio F1", psd:"Cauliflower – Cartesio F1"},
  {crop:"Cauliflower", variety:"Sprouting Murasaki", psd:"Cauliflower Sprouting Murasaki"},
  {crop:"Cauliflower", variety:"Baby F1", psd:"Cauliflower 'Baby' F1"},
  {crop:"Cauliflower", variety:"Sprouting Fioretto", psd:"Cauliflower Sprouting Fioretto"},
  // CELERIAC
  {crop:"Celeriac", variety:"Giant Prague", psd:"Celeriac Giant Prague"},
  {crop:"Celeriac", variety:"Brilliant", psd:"Celeriac Brilliant"},
  // CELERY
  {crop:"Celery", variety:"Golden Self Blanching", psd:"Celery Golden Self Blanching"},
  {crop:"Celery", variety:"Utah 52-70", psd:"Celery Utah 52-70"},
  {crop:"Celery", variety:"Peppermint Stick", psd:"Celery Peppermint Stick"},
  {crop:"Celery", variety:"Victoria F1", psd:"Celery Victoria F1"},
  // CELTUCE
  {crop:"Celtuce", variety:"Stem Lettuce", psd:"Celtuce – Stem Lettuce"},
  // CHICORY
  {crop:"Chicory", variety:"Red Ball Averto", psd:"Chicory Red Ball Averto"},
  {crop:"Chicory", variety:"Di Bruxelles", psd:"Chicory Di Bruxelles"},
  {crop:"Chicory", variety:"Pink", psd:"Chicory Pink"},

  // COURGETTE
  {crop:"Courgette", variety:"Ambassador F1", psd:"Courgette Ambassador F1"},
  {crop:"Courgette", variety:"Black Beauty", psd:"Courgette Black Beauty"},
  {crop:"Courgette", variety:"Yellow Golden", psd:"Courgette Yellow Golden"},
  {crop:"Courgette", variety:"Defender F1", psd:"Courgette Defender F1"},
  {crop:"Courgette", variety:"Bianca Di Trieste", psd:"Italian Courgette Bianca Di Trieste"},
  {crop:"Courgette", variety:"Romanesco", psd:"Italian Courgette Romanesco"},
  {crop:"Courgette", variety:"Golden Zebra F1", psd:"Courgette – Zucchini Golden Zebra F1"},
  {crop:"Courgette", variety:"D'Albenga", psd:"Climbing Italian Squash/Courgette D'Albenga"},
  {crop:"Courgette", variety:"Banana Song F1", psd:"Courgette Banana Song F1"},
  {crop:"Courgette", variety:"Green Bush", psd:"Courgette Green Bush"},
  {crop:"Courgette", variety:"Striato D'Italia", psd:"Courgette Striato D'Italia"},
  {crop:"Courgette", variety:"Atena Polka F1", psd:"Courgette Atena Polka F1"},
  {crop:"Courgette", variety:"Eight Ball", psd:"Courgette – Zucchini Eight Ball"},
  {crop:"Courgette", variety:"Verde Di Milano", psd:"Italian Courgette Verde Di Milano"},
  {crop:"Courgette", variety:"Tondo Chiaro Di Nizza", psd:"Italian Courgette Tondo Chiaro Di Nizza"},
  {crop:"Courgette", variety:"Spineless Beauty F1", psd:"Courgette F1 Spineless Beauty"},
  {crop:"Courgette", variety:"Midas F1", psd:"Courgette Midas F1"},
  {crop:"Courgette", variety:"Midnight F1", psd:"Courgette Midnight F1"},
  {crop:"Courgette", variety:"Sebring F1", psd:"Courgette Sebring F1"},
  {crop:"Courgette", variety:"One Ball F1", psd:"Courgette 'One Ball' F1"},
  // CUCUMBER
  {crop:"Cucumber", variety:"Femspot Improved F1", psd:"Cucumber Femspot Improved F1"},
  {crop:"Cucumber", variety:"La Diva F1", psd:"Cucumber La Diva F1"},
  {crop:"Cucumber", variety:"Carmen F1", psd:"Cucumber Carmen F1"},
  {crop:"Cucumber", variety:"Beth Alpha F1", psd:"Cucumber Beth Alpha F1"},
  {crop:"Cucumber", variety:"Mini Munch F1", psd:"Cucumber Mini Munch F1"},
  {crop:"Cucumber", variety:"Spacemaster 80", psd:"Cucumber Spacemaster 80"},
  {crop:"Cucumber", variety:"Passandra F1", psd:"Cucumber Passandra F1"},
  {crop:"Cucumber", variety:"Telegraph", psd:"Cucumber Telegraph (Greenhouse)"},
  {crop:"Cucumber", variety:"Picolino F1", psd:"Cucumber Picolino F1"},
  {crop:"Cucumber", variety:"Crystal Apple", psd:"Cucumber Crystal Apple"},
  {crop:"Cucumber", variety:"Crystal Lemon", psd:"Cucumber Crystal Lemon"},
  {crop:"Cucumber", variety:"Armenian Yard Long", psd:"Cucumber Armenian Yard Long"},
  {crop:"Cucumber", variety:"Euphya F1", psd:"Cucumber Euphya F1"},
  {crop:"Cucumber", variety:"Early Spring Burpless F1", psd:"Cucumber Early Spring Burpless F1"},
  {crop:"Cucumber", variety:"Party Time F1", psd:"Cucumber Party Time F1"},
  {crop:"Cucumber", variety:"Dragon Egg", psd:"Cucumber Dragon Egg"},
  {crop:"Cucumber", variety:"White Wonder", psd:"Cucumber White Wonder Bianco Lungo"},
  {crop:"Cucumber", variety:"Delistar F1", psd:"Cucumber Delistar F1"},
  {crop:"Cucumber", variety:"Quick Snack F1", psd:"Cucumber Quick Snack F1"},
  {crop:"Cucumber", variety:"White Pickle Mini", psd:"Cucumber White Pickle Mini"},
  {crop:"Cucumber", variety:"Merlin F1", psd:"Cucumber Merlin F1"},
  {crop:"Cucumber", variety:"Honey Plus F1", psd:"Cucumber Honey Plus F1"},
  {crop:"Cucumber", variety:"Green Apple", psd:"Cucumber Green Apple"},
  // GARLIC
  {crop:"Garlic", variety:"Germidour", psd:"Garlic Germidour"},
  {crop:"Garlic", variety:"Messidrome", psd:"Garlic Messidrome"},
  {crop:"Garlic", variety:"Morado", psd:"Garlic Morado"},
  {crop:"Garlic", variety:"Elephant", psd:"Garlic Elephant"},
  // GOJI
  {crop:"Goji", variety:"Lycium Barbarum", psd:"Goji Berry – Lycium Barbarum"},
  // GREEN MANURE (not typically in veg garden planner but checking)
  // KALE
  {crop:"Kale", variety:"Black Tuscan", psd:"Kale Black Tuscan (Borecole Nero Di Toscana)"},
  {crop:"Kale", variety:"Red Russian", psd:"Kale Red Russian"},
  {crop:"Kale", variety:"Borecole Scarlet", psd:"Kale Borecole Scarlet"},
  {crop:"Kale", variety:"Borecole Siberian", psd:"Kale Borecole Siberian"},
  {crop:"Kale", variety:"Dwarf Green Curled", psd:"Kale Borecole Dwarf Green Curled"},
  {crop:"Kale", variety:"Cavalo Nero Raven F1", psd:"Kale/Cavalo Nero Raven F1"},
  {crop:"Kale", variety:"Midnight Sun", psd:"Kale Midnight Sun"},
  {crop:"Kale", variety:"Westlandse", psd:"Kale Westlandse"},
  {crop:"Kale", variety:"Emerald Ice", psd:"Kale Emerald Ice"},
  {crop:"Kale", variety:"Red Ruble", psd:"Kale Red Ruble"},
  {crop:"Kale", variety:"Eden F1", psd:"Kale Eden F1"},
  // KOHLRABI
  {crop:"Kohlrabi", variety:"Purple Vienna", psd:"Kohlrabi Purple Vienna"},
  {crop:"Kohlrabi", variety:"Superschmelz", psd:"Kohlrabi Superschmelz"},
  {crop:"Kohlrabi", variety:"Delicacy Purple", psd:"Kohlrabi Delicacy Purple"},
  // LEEK
  {crop:"Leek", variety:"Musselburgh", psd:"Leek – Musselburgh"},
  {crop:"Leek", variety:"Blue De Solaise", psd:"Leek Heirloom Blue De Solaise"},
  {crop:"Leek", variety:"Bulgarian Giant", psd:"Leek – Bulgarian Giant"},
  {crop:"Leek", variety:"Giant D'Inverno", psd:"Leek Giant D'Inverno"},
  {crop:"Leek", variety:"Carentan 2", psd:"Italian Leek Carentan 2"},
  {crop:"Leek", variety:"Jolant", psd:"Leek Jolant"},
  // LETTUCE
  {crop:"Lettuce", variety:"Mesclun Mix", psd:"Lettuce Mixed Leaf Mesclun Mix"},
  {crop:"Lettuce", variety:"Little Gem", psd:"Lettuce Little Gem"},
  {crop:"Lettuce", variety:"Parris Island Cos", psd:"Lettuce Romaine Parris Island Cos"},
  {crop:"Lettuce", variety:"Tom Thumb", psd:"Lettuce Tom Thumb"},
  {crop:"Lettuce", variety:"Lolla Rossa", psd:"Lettuce Lolla Rossa"},
  {crop:"Lettuce", variety:"Webbs Wonderful", psd:"Lettuce Crisphead Webbs Wonderful"},
  {crop:"Lettuce", variety:"Iceberg", psd:"Lettuce Crisphead – Iceberg"},
  {crop:"Lettuce", variety:"Marvel of 4 Seasons", psd:"Lettuce Heirloom Marvel of 4 Seasons"},
  {crop:"Lettuce", variety:"Saladin", psd:"Lettuce – Saladin Iceburg Type"},
  {crop:"Lettuce", variety:"Black Seeded Simpson", psd:"Lettuce Black Seeded Simpson"},
  {crop:"Lettuce", variety:"Red Romaine COS", psd:"Lettuce RED Romaine COS"},
  {crop:"Lettuce", variety:"Red Velvet", psd:"Lettuce Heirloom Red Velvet"},
  {crop:"Lettuce", variety:"Salad Bowl Red", psd:"Lettuce Salad Bowl Red"},
  {crop:"Lettuce", variety:"Red Oakleaf", psd:"Lettuce – Red Oakleaf"},
  {crop:"Lettuce", variety:"Dark Roden", psd:"Lettuce – Dark Roden"},
  {crop:"Lettuce", variety:"Red Cimmaron Romaine", psd:"Lettuce Red Cimmaron Romaine"},
  {crop:"Lettuce", variety:"Apache", psd:"Lettuce Apache"},
  {crop:"Lettuce", variety:"Great Lakes 118", psd:"Lettuce Great Lakes 118"},
  {crop:"Lettuce", variety:"Gourmet Looseleaf Cutting Mix", psd:"Lettuce Gourmet Looseleaf Cutting Mix"},
  {crop:"Lettuce", variety:"Rubagio", psd:"Lettuce Rubagio"},
  {crop:"Lettuce", variety:"Verdagio", psd:"Lettuce – Verdagio"},
  {crop:"Lettuce", variety:"Curly Mix", psd:"Lettuce Curly Mix"},
  {crop:"Lettuce", variety:"Classio", psd:"Lettuce – Classio"},
  {crop:"Lettuce", variety:"Crispy Mix", psd:"Lettuce Crispy Mix"},
  {crop:"Lettuce", variety:"Maravilla de Verano", psd:"Lettuce 'Maravilla de Verano'"},
  // MELON
  {crop:"Melon", variety:"Hales Best Jumbo", psd:"Melon Cantaloupe Hales Best Jumbo"},
  {crop:"Melon", variety:"Honeydew", psd:"Melon Honeydew"},
  {crop:"Melon", variety:"Di Charentais", psd:"Melon Cantaloupe Di Charentais"},
  {crop:"Melon", variety:"Hearts of Gold", psd:"Melon Cantaloupe Hearts of Gold"},
  {crop:"Melon", variety:"Malaga F1", psd:"Melon Malaga F1"},
  {crop:"Melon", variety:"Ananas", psd:"Melon Ananas"},
  {crop:"Melon", variety:"Orange Flesh Temptation", psd:"Melon Honeydew Orange Flesh Temptation"},
  {crop:"Melon", variety:"Queen Annes", psd:"Melon Queen Annes"},
  // MUSTARD
  {crop:"Mustard", variety:"Tatsoi", psd:"Mustard Tatsoi"},
  {crop:"Mustard", variety:"Wasabina", psd:"Mustard Wasabina"},
  {crop:"Mustard", variety:"Mizuna", psd:"Mustard Mizuna"},
  {crop:"Mustard", variety:"Mizuna Red Streaked", psd:"Mustard Mizuna Red Streaked"},
  {crop:"Mustard", variety:"Tatsoi Red F1", psd:"Mustard Tatsoi Red F1"},
  {crop:"Mustard", variety:"Mibuna", psd:"Mustard Mibuna"},
  {crop:"Mustard", variety:"Red Frills", psd:"Mustard Red Frills"},
  {crop:"Mustard", variety:"Red Giant", psd:"Mustard Red Giant"},
  {crop:"Mustard", variety:"Red Dragon", psd:"Mustard Red Dragon"},
  {crop:"Mustard", variety:"Red Lion", psd:"Mustard Red Lion"},
  {crop:"Mustard", variety:"Red Carpet", psd:"Mustard Red Carpet"},
  {crop:"Mustard", variety:"Mizuna Red Baron Plus F1", psd:"Mustard – Mizuna Red Baron Plus F1"},
  // OKRA
  {crop:"Okra", variety:"Clemson Spineless", psd:"Okra Clemson Spineless"},
  {crop:"Okra", variety:"Blondy", psd:"Okra Blondy"},
];

// Now check each PSD variety against cropgraph
const allCrops = listCrops();
const cropNames = new Set(allCrops.map(c => c.commonName.toLowerCase()));
const cropSlugs = new Set(allCrops.map(c => c.slug.toLowerCase()));

// For each unique crop type, find matching cropgraph entries
console.log("=== ANALYSIS: PSD varieties matched to cropgraph ===\n");

// Build a lookup: PSD variety name parts -> cropgraph entries
for (const item of psd) {
  const varLower = item.variety.toLowerCase();
  const cropLower = item.crop.toLowerCase();
  
  // Search cropgraph for entries containing both the crop type and variety
  const matches = allCrops.filter(c => {
    const name = c.commonName.toLowerCase();
    const slug = c.slug.toLowerCase();
    // Match if cropgraph entry contains the variety name or vice versa
    // Also check the crop type is correct
    return (name.includes(varLower) || varLower.includes(name) ||
            name.includes(cropLower)) &&
           (name.includes(cropLower) || slug.includes(cropLower.replace(/\s+/g, '-')));
  });
  
  // Also try partial matching - check if any cropgraph entry matches the variety
  const broadMatches = allCrops.filter(c => {
    const name = c.commonName.toLowerCase();
    // Split variety into words and check
    const words = varLower.split(/\s+/).filter(w => w.length > 3);
    const cropWords = cropLower.split(/\s+/).filter(w => w.length > 3);
    const matchWords = words.filter(w => name.includes(w)).length;
    const matchCrop = cropWords.filter(w => name.includes(w) || c.slug.includes(w)).length;
    return matchWords >= 1 && matchCrop >= 1;
  });
  
  const inCropgraph = matches.length > 0 || broadMatches.length > 0;
  
  if (inCropgraph) {
    console.log(`✓ ${item.psd}`);
    if (matches.length > 0) {
      console.log(`  → cropgraph match: ${matches.map(c => c.commonName + ' [' + c.slug + ']').join(', ')}`);
    } else if (broadMatches.length > 0) {
      console.log(`  → broad match: ${broadMatches.map(c => c.commonName + ' [' + c.slug + ']').join(', ')}`);
    }
  }
}

console.log(`\nTotal PSD varieties checked: ${psd.length}`);
console.log(`Total with cropgraph matches: ${psd.filter(item => {
  const varLower = item.variety.toLowerCase();
  const cropLower = item.crop.toLowerCase();
  const broadMatches = allCrops.filter(c => {
    const name = c.commonName.toLowerCase();
    const words = varLower.split(/\s+/).filter(w => w.length > 3);
    const cropWords = cropLower.split(/\s+/).filter(w => w.length > 3);
    const matchWords = words.filter(w => name.includes(w)).length;
    const matchCrop = cropWords.filter(w => name.includes(w) || c.slug.includes(w)).length;
    return matchWords >= 1 && matchCrop >= 1;
  });
  return broadMatches.length > 0;
}).length}`);

