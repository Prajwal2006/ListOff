import type { CategorySeed } from "@/lib/seed/types";

export const technology: CategorySeed[] = [
  {
    name: "Programming",
    slug: "programming",
    icon: "code",
    description: "Languages, frameworks, databases and developer tools.",
    topics: [
      {
        name: "Programming languages",
        difficulty: "medium",
        answers: `Python|JavaScript=JS|TypeScript=TS|Java|C|C++=CPP|C#=C Sharp=CSharp|Go=Golang|Rust|Swift|Kotlin|Objective-C|Ruby|PHP|Perl|R|MATLAB|Julia|Scala|Haskell|Erlang|Elixir|Clojure|F#=F Sharp|OCaml|Lisp|Common Lisp|Scheme|Racket|Prolog|Fortran|COBOL|Pascal|Delphi|Ada|BASIC|Visual Basic=VB|VB.NET|Assembly=ASM|Lua|Dart|Groovy|Shell=Bash|PowerShell|SQL|PL/SQL|T-SQL|Smalltalk|Simula|ALGOL|APL|Forth|Logo|Scratch|Zig|Nim|Crystal|V|D|Elm|PureScript|ReasonML|CoffeeScript|Hack|Solidity|Vyper|Move|Mojo|Carbon|Gleam|Odin|Raku|Tcl|AWK|Sed|Haxe|ActionScript|ABAP|Apex|RPG|SAS|Stata|Wolfram Language=Mathematica|Verilog|VHDL|Chapel|Coq|Agda|Idris|Lean|Standard ML=SML|Eiffel|Modula-2|Oberon|Bourne shell|Zsh|Fish|Batch|AutoHotkey|GDScript|HLSL|GLSL|CUDA|OpenCL|WebAssembly=Wasm|Brainfuck|Malbolge|Whitespace|LOLCODE|Befunge|Q#|Ballerina|Pony|Red|Rebol|Io|Factor|J|K|Kdb|Ladder logic|LabVIEW|Simulink|Processing|Arduino|MicroPython|Jython|IronPython|Cython|Starlark|Nix|Dhall|Jsonnet|CUE|Bicep|HCL`,
      },
      {
        name: "Programming frameworks and libraries",
        slug: "frameworks",
        difficulty: "medium",
        answers: `React|Angular|AngularJS|Vue=Vue.js|Svelte|SvelteKit|Next.js=Nextjs|Nuxt=Nuxt.js|Remix|Astro|Gatsby|SolidJS=Solid|Qwik|Preact|Ember.js=Ember|Backbone.js=Backbone|jQuery|Alpine.js|htmx|Lit|Express=Express.js|NestJS|Fastify|Koa|Hapi|Hono|Meteor|Node.js=Node|Deno|Bun|Django|Flask|FastAPI|Pyramid|Tornado|Ruby on Rails=Rails|Sinatra|Laravel|Symfony|CodeIgniter|CakePHP|Yii|Spring|Spring Boot|Hibernate|Quarkus|Micronaut|Struts|Play Framework|ASP.NET|ASP.NET Core|Blazor|Entity Framework|.NET=Dotnet|Xamarin|MAUI|Phoenix|Gin|Echo|Fiber|Actix|Axum|Rocket|Tauri|Electron|Flutter|React Native|Ionic|Cordova|NativeScript|SwiftUI|UIKit|Jetpack Compose|Qt|GTK|wxWidgets|Tkinter|PyQt|Kivy|Unity|Unreal Engine|Godot|Pygame|Phaser|Three.js|Babylon.js|D3.js=D3|Chart.js|Tailwind CSS=Tailwind|Bootstrap|Bulma|Foundation|Material UI=MUI|Chakra UI|shadcn/ui=shadcn|Ant Design|Redux|MobX|Zustand|Recoil|Jotai|RxJS|TanStack Query=React Query|Apollo|GraphQL|Relay|tRPC|Prisma|Drizzle|Sequelize|TypeORM|Mongoose|SQLAlchemy|Pandas|NumPy|SciPy|Matplotlib|Seaborn|Plotly|scikit-learn=sklearn|TensorFlow|PyTorch|Keras|JAX|Hugging Face Transformers=Transformers|LangChain|LlamaIndex|OpenCV|spaCy|NLTK|XGBoost|LightGBM|Spark=Apache Spark|Hadoop|Kafka|Airflow|Dask|Ray|Streamlit|Gradio|Jest|Vitest|Mocha|Cypress|Playwright|Selenium|Puppeteer|JUnit|pytest|RSpec|Webpack|Vite|Rollup|Parcel|esbuild|Turbopack|Babel|ESLint|Prettier|Storybook|Lodash|Moment.js|Axios|Socket.IO|Pinia|Vuex|Mantine|Framer Motion|GSAP|Ktor|Vapor|Sails.js|Strapi|Payload|Sanity|Contentful|WordPress|Drupal|Joomla|Shopify Liquid|Jekyll|Hugo|Eleventy|Docusaurus|Expo`,
      },
      {
        name: "Databases",
        difficulty: "hard",
        answers: `PostgreSQL=Postgres|MySQL|MariaDB|SQLite|Oracle Database=Oracle|Microsoft SQL Server=SQL Server=MSSQL|IBM Db2=DB2|MongoDB|Redis|Cassandra|Couchbase|CouchDB|DynamoDB|Firestore|Firebase Realtime Database=Firebase|Elasticsearch|OpenSearch|Solr|Neo4j|ArangoDB|OrientDB|Amazon Neptune|JanusGraph|InfluxDB|TimescaleDB|Prometheus|ClickHouse|Snowflake|BigQuery|Redshift|Databricks|Apache Hive=Hive|HBase|Apache Druid|Apache Pinot|DuckDB|CockroachDB|YugabyteDB|TiDB|Spanner|Aurora|Cosmos DB|Supabase|Neon|PlanetScale|Turso|libSQL|FaunaDB|SurrealDB|RethinkDB|Memcached|Valkey|KeyDB|Dragonfly|etcd|ZooKeeper|Consul|LevelDB|RocksDB|Berkeley DB|LMDB|Realm|H2|HSQLDB|Derby|Firebird|Informix|Sybase|Teradata|Vertica|Greenplum|Netezza|SAP HANA|Microsoft Access=Access|FileMaker|dBase|FoxPro|Pinecone|Weaviate|Milvus|Qdrant|Chroma|pgvector|Riak|Aerospike|ScyllaDB|Voldemort|Bigtable|Azure SQL|RDS|Cloud SQL|Xata|EdgeDB|Dgraph|TigerGraph|QuestDB|Materialize|RisingWave|SingleStore=MemSQL|VoltDB|NuoDB|Percona Server|Amazon DocumentDB|Azure Table Storage`,
      },
      {
        name: "Operating systems",
        difficulty: "medium",
        answers: `Windows|Windows 11|Windows 10|Windows 8|Windows 7|Windows Vista|Windows XP|Windows 2000|Windows ME|Windows 98|Windows 95|Windows 3.1|Windows NT|Windows Server|MS-DOS=DOS|macOS=Mac OS X=OS X|Classic Mac OS|iOS|iPadOS|watchOS|tvOS|visionOS|Android|Linux|Ubuntu|Debian|Fedora|Red Hat Enterprise Linux=RHEL|CentOS|Rocky Linux|AlmaLinux|Arch Linux=Arch|Manjaro|Linux Mint|elementary OS|Pop!_OS=Pop OS|Kali Linux|Gentoo|Slackware|openSUSE|SUSE Linux|Zorin OS|Alpine Linux|NixOS|Void Linux|Raspberry Pi OS=Raspbian|Tails|Qubes OS|ChromeOS=Chrome OS|ChromeOS Flex|Fuchsia|HarmonyOS|KaiOS|Tizen|webOS|Symbian|BlackBerry OS|BlackBerry 10|Windows Phone|Windows Mobile|Palm OS|Bada|Firefox OS|Sailfish OS|Ubuntu Touch|LineageOS|GrapheneOS|CalyxOS|/e/OS|FreeBSD|OpenBSD|NetBSD|DragonFly BSD|Solaris|OpenSolaris|illumos|AIX|HP-UX|IRIX|Unix|z/OS|OS/2|BeOS|Haiku|AmigaOS|RISC OS|Plan 9|Minix|QNX|VxWorks|FreeRTOS|Zephyr|RTOS|ReactOS|TempleOS|SerenityOS|Redox|Xbox OS|PlayStation OS|Horizon OS|CP/M|GEM|NeXTSTEP|Darwin|Wear OS|Fire OS|Android TV|Google TV|Roku OS|SteamOS|Pixel OS|One UI|MIUI|HyperOS|ColorOS|OxygenOS|EMUI|Kubuntu|Xubuntu|Lubuntu|Deepin|MX Linux|Puppy Linux|Endeavour OS|Garuda Linux`,
      },
      {
        name: "Web browsers",
        difficulty: "hard",
        answers: `Google Chrome=Chrome|Mozilla Firefox=Firefox|Safari|Microsoft Edge=Edge|Internet Explorer=IE|Opera|Opera GX|Brave|Vivaldi|Chromium|Tor Browser=Tor|Arc|Samsung Internet|UC Browser|DuckDuckGo Browser|Yandex Browser|Maxthon|Netscape Navigator=Netscape|Mosaic|Lynx|Konqueror|Epiphany=GNOME Web|Pale Moon|Waterfox|LibreWolf|Floorp|Zen Browser|SeaMonkey|Midori|Falkon|Otter Browser|Puffin|Dolphin|Kiwi Browser|Ecosia|Opera Mini|Firefox Focus|Silk|QQ Browser|360 Secure Browser|Sogou|Whale|Comet|Dia|Ladybird|Orion|Sidekick|Avast Secure Browser|Epic Privacy Browser|Ghost Browser|Mullvad Browser|Cốc Cốc=Coc Coc|Line Browser|Camino|Flock|RockMelt|Lunascape|Sleipnir|K-Meleon|Galeon|Amaya|WorldWideWeb=Nexus|Cello|ViolaWWW|Arachne`,
      },
      {
        name: "Code editors and IDEs",
        slug: "code-editors",
        difficulty: "hard",
        answers: `Visual Studio Code=VS Code=VSCode|Visual Studio|IntelliJ IDEA=IntelliJ|PyCharm|WebStorm|PhpStorm|GoLand|CLion|Rider|RubyMine|DataGrip|RustRover|Fleet|Android Studio|Xcode|Eclipse|NetBeans|Vim|Neovim|Emacs|Nano|Sublime Text|Atom|Notepad++|Notepad|Brackets|Cursor|Windsurf|Zed|Nova|BBEdit|TextMate|Kate|Gedit|Geany|Code::Blocks|Dev-C++|Qt Creator|KDevelop|Spyder|Jupyter Notebook=Jupyter|JupyterLab|Google Colab=Colab|RStudio|Thonny|IDLE|BlueJ|Arduino IDE|Replit|CodeSandbox|StackBlitz|Glitch|CodePen|JSFiddle|GitHub Codespaces=Codespaces|Gitpod|Cloud9|Helix|Kakoune|Micro|Lapce|Pulsar|Komodo|Light Table|Aptana|Dreamweaver|FrontPage|Coda|Espresso|UltraEdit|EditPlus|TextPad|PSPad|Vi|Ed|Acme|Pico|Turbo Pascal|Turbo C|Borland C++|Delphi IDE|Lazarus|Xojo|MonoDevelop|SharpDevelop|JDeveloper|JCreator|Zend Studio|Wing IDE|Eric|Mu|Positron|Trae|Kiro`,
      },
      {
        name: "File extensions",
        prompt: "Name as many file extensions as you can",
        difficulty: "hard",
        answers: `.txt=txt|.pdf=pdf|.doc=doc|.docx=docx|.xls=xls|.xlsx=xlsx|.ppt=ppt|.pptx=pptx|.csv=csv|.json=json|.xml=xml|.html=html|.htm=htm|.css=css|.js=js|.ts=ts|.jsx=jsx|.tsx=tsx|.py=py|.java=java|.class=class|.jar=jar|.c=c|.cpp=cpp|.h=h|.cs=cs|.go=go|.rs=rs|.rb=rb|.php=php|.swift=swift|.kt=kt|.sql=sql|.sh=sh|.bat=bat|.ps1=ps1|.exe=exe|.msi=msi|.dll=dll|.so=so|.dmg=dmg|.app=app|.apk=apk|.ipa=ipa|.deb=deb|.rpm=rpm|.iso=iso|.img=img|.zip=zip|.rar=rar|.7z=7z|.tar=tar|.gz=gz|.tgz=tgz|.bz2=bz2|.xz=xz|.jpg=jpg|.jpeg=jpeg|.png=png|.gif=gif|.bmp=bmp|.tiff=tiff|.svg=svg|.webp=webp|.avif=avif|.heic=heic|.ico=ico|.psd=psd|.ai=ai|.eps=eps|.raw=raw|.mp3=mp3|.wav=wav|.flac=flac|.aac=aac|.ogg=ogg|.m4a=m4a|.wma=wma|.mid=midi|.mp4=mp4|.mov=mov|.avi=avi|.mkv=mkv|.wmv=wmv|.flv=flv|.webm=webm|.m4v=m4v|.md=md|.rtf=rtf|.odt=odt|.ods=ods|.odp=odp|.epub=epub|.mobi=mobi|.yaml=yaml|.yml=yml|.toml=toml|.ini=ini|.cfg=cfg|.env=env|.log=log|.lock=lock|.db=db|.sqlite=sqlite|.bak=bak|.tmp=tmp|.ttf=ttf|.otf=otf|.woff=woff|.woff2=woff2|.ics=ics|.vcf=vcf|.eml=eml|.msg=msg|.torrent=torrent|.ipynb=ipynb|.r=r|.m=m|.pl=pl|.lua=lua|.dart=dart|.vue=vue|.svelte=svelte|.scss=scss|.sass=sass|.less=less|.wasm=wasm|.obj=obj|.stl=stl|.fbx=fbx|.blend=blend|.dwg=dwg|.dxf=dxf|.gltf=gltf|.glb=glb|.ova=ova|.vmdk=vmdk|.key=key|.pem=pem|.crt=crt|.pfx=pfx|.sig=sig|.asc=asc|.gpg=gpg|.pkg=pkg|.cab=cab|.sys=sys|.drv=drv|.lnk=lnk|.url=url|.swf=swf|.fla=fla|.xcf=xcf|.indd=indd|.sketch=sketch|.fig=fig|.xd=xd|.pages=pages|.numbers=numbers|.dat=dat|.bin=bin|.cue=cue|.srt=srt|.vtt=vtt|.ass=ass|.m3u=m3u|.pls=pls`,
      },
      {
        name: "Git commands",
        prompt: "Name as many git commands as you can",
        difficulty: "hard",
        answers: `git init=init|git clone=clone|git add=add|git commit=commit|git push=push|git pull=pull|git fetch=fetch|git merge=merge|git rebase=rebase|git branch=branch|git checkout=checkout|git switch=switch|git restore=restore|git status=status|git log=log|git diff=diff|git show=show|git stash=stash|git reset=reset|git revert=revert|git tag=tag|git remote=remote|git cherry-pick=cherry-pick|git blame=blame|git bisect=bisect|git config=config|git rm=rm|git mv=mv|git clean=clean|git reflog=reflog|git worktree=worktree|git submodule=submodule|git archive=archive|git describe=describe|git grep=grep|git shortlog=shortlog|git notes=notes|git gc=gc|git fsck=fsck|git prune=prune|git am=am|git apply=apply|git format-patch=format-patch|git request-pull=request-pull|git sparse-checkout=sparse-checkout|git ls-files=ls-files|git ls-remote=ls-remote|git ls-tree=ls-tree|git cat-file=cat-file|git rev-parse=rev-parse|git rev-list=rev-list|git range-diff=range-diff|git maintenance=maintenance|git help=help|git version=version|git bundle=bundle|git filter-branch=filter-branch|git mergetool=mergetool|git difftool=difftool|git instaweb=instaweb|git gui=gui|gitk|git daemon=daemon|git count-objects=count-objects|git hash-object=hash-object|git update-index=update-index|git symbolic-ref=symbolic-ref|git update-ref=update-ref|git for-each-ref=for-each-ref|git verify-commit=verify-commit|git rerere=rerere|git citool=citool|git send-email=send-email|git svn=svn`,
      },
      {
        name: "HTML tags",
        prompt: "Name as many HTML tags as you can",
        difficulty: "hard",
        answers: `html|head|body|title|meta|link|script|style|base|noscript|div|span|p|a|img|br|hr|h1|h2|h3|h4|h5|h6|ul|ol|li|dl|dt|dd|table|thead|tbody|tfoot|tr|th|td|caption|colgroup|col|form|input|button|label|select|option|optgroup|textarea|fieldset|legend|datalist|output|progress|meter|header|footer|nav|main|section|article|aside|figure|figcaption|details|summary|dialog|template|slot|canvas|svg|video|audio|source|track|picture|iframe|embed|object|param|map|area|strong|em|b|i|u|s|small|mark|sub|sup|code|pre|kbd|samp|var|blockquote|q|cite|abbr|address|time|del|ins|bdi|bdo|wbr|ruby|rt|rp|data|search|menu|hgroup|center|font|marquee|blink|frame|frameset|noframes|applet|big|strike|tt|acronym`,
      },
    ],
  },
  {
    name: "Tech & Internet",
    slug: "tech-internet",
    icon: "cpu",
    description: "Companies, gadgets, apps and the web.",
    topics: [
      {
        name: "Technology companies",
        difficulty: "easy",
        answers: `Apple|Microsoft|Google=Alphabet|Amazon|Meta=Facebook|Netflix|Tesla|Nvidia|Intel|AMD|IBM|Oracle|Salesforce|Adobe|Cisco|Qualcomm|Broadcom|Texas Instruments|Micron|Samsung|Sony|LG|Panasonic|Toshiba|Hitachi|Fujitsu|NEC|Sharp|Canon|Nikon|Huawei|Xiaomi|Lenovo|Alibaba|Tencent|Baidu|ByteDance|JD.com|Meituan|Pinduoduo=PDD|NetEase|DJI|BYD|TSMC|ASML|ARM|SAP|Siemens|Philips|Nokia|Ericsson|Spotify|Shopify|Uber|Lyft|Airbnb|DoorDash|Instacart|PayPal|Stripe|Block=Square|Visa|Mastercard|Twitter=X|Snap=Snapchat|Pinterest|Reddit|LinkedIn|Dropbox|Box|Zoom|Slack|Atlassian|GitHub|GitLab|Twilio|Cloudflare|Datadog|Snowflake|Palantir|ServiceNow|Workday|Intuit|Autodesk|VMware|Dell|HP|Hewlett Packard Enterprise=HPE|Asus|Acer|MSI|Razer|Logitech|Western Digital|Seagate|SanDisk|Kingston|Corsair|OpenAI|Anthropic|DeepMind|Mistral|Hugging Face|Perplexity|xAI|Scale AI|Databricks|SpaceX|Infosys|Tata Consultancy Services=TCS|Wipro|HCLTech=HCL|Tech Mahindra|Zoho|Flipkart|Paytm|Ola|Swiggy|Zomato|Byju's|Razorpay|PhonePe|Reliance Jio=Jio|Freshworks|Rakuten|SoftBank|Kakao|Naver|Grab|Sea Limited|Gojek|Mercado Libre|Booking.com|Expedia|eBay|Etsy|Wayfair|Zillow|Roku|Electronic Arts=EA|Activision Blizzard|Nintendo|Ubisoft|Epic Games|Valve|Roblox|Unity|Rockstar Games|Take-Two|Garmin|GoPro|Fitbit|Peloton|Sonos|Bose|Dyson|Motorola|BlackBerry|HTC|OnePlus|Oppo|Vivo|Realme|Nothing|Fairphone|Yahoo|AOL|Mozilla|Wikipedia|Craigslist|Discord|Telegram|WhatsApp|Signal|Duolingo|Canva|Figma|Notion|Airtable|Asana|Trello|Miro|Grammarly|Coinbase|Binance|Robinhood|Revolut|Klarna|Wise`,
      },
      {
        name: "Social media platforms",
        difficulty: "easy",
        answers: `Facebook|Instagram|Twitter=X|TikTok|Snapchat|YouTube|LinkedIn|Pinterest|Reddit|Tumblr|WhatsApp|Telegram|Signal|WeChat|Weibo|Douyin|QQ|LINE|KakaoTalk|Viber|Discord|Twitch|Kick|Threads|Bluesky|Mastodon|Truth Social|Gab|Parler|BeReal|Clubhouse|Quora|Medium|Substack|Flickr|Vimeo|Dailymotion|DeviantArt|Behance|Dribbble|ArtStation|Goodreads|Letterboxd|Yelp|Tripadvisor|Nextdoor|Meetup|MySpace|Friendster|Orkut|Google+|Vine|Periscope|Hi5|Bebo|Xanga|LiveJournal|MeWe|Ello|Peach|Path|Yik Yak|Whisper|Kik|Tinder|Bumble|Hinge|Grindr|OkCupid|Match.com|Strava|Untappd|Steam Community|Xbox Live|PlayStation Network|Roblox|VK=VKontakte|Odnoklassniki|Taringa|Xiaohongshu=RedNote|Bilibili|Kuaishou|Zhihu|Douban|Mixi|Moj|ShareChat|Koo|Josh|Roposo|Chingari|Lemon8|Likee|Triller|Byte|Dubsmash|Musical.ly|Pixiv|Weverse|Patreon|OnlyFans|Ko-fi|Cameo|Kwai|Imgur|9GAG|4chan|Stack Overflow|Hacker News|Product Hunt|Slashdot|Digg|Delicious|StumbleUpon|Foursquare|Swarm`,
      },
      {
        name: "Smartphone brands",
        difficulty: "medium",
        answers: `Apple=iPhone|Samsung|Google Pixel=Pixel|Huawei|Xiaomi|Redmi|Poco|Oppo|Vivo|OnePlus|Realme|Motorola|Nokia|Sony=Sony Xperia|LG|HTC|BlackBerry|Honor|Nothing|Asus|Lenovo|ZTE|Nubia|Red Magic|Tecno|Infinix|Itel|Meizu|Sharp|Kyocera|Fairphone|CAT|Alcatel|TCL|Micromax|Lava|Karbonn|Intex|iQOO|Coolpad|LeEco|Gionee|Panasonic|Palm|Essential|Microsoft Lumia=Lumia|Siemens|Ericsson|Sony Ericsson|Sagem|Vertu|Ulefone|Doogee|Oukitel|Blackview|Umidigi|Cubot|Wiko|BLU|Hisense|Leica|Light|Punkt|Solana Saga|Teracube|Volla|Pinephone|Librem|Jolla|Yota|Kodak|Vodafone|BQ|Elephone`,
      },
      {
        name: "Computer hardware",
        prompt: "Name as many computer hardware components and peripherals as you can",
        difficulty: "medium",
        answers: `CPU=Processor|GPU=Graphics card|Motherboard|RAM=Memory|Hard drive=HDD|Solid-state drive=SSD|NVMe drive|Power supply=PSU|Computer case|Cooling fan|Heat sink|Liquid cooler=AIO|Thermal paste|Monitor|Keyboard|Mouse|Trackpad=Touchpad|Trackball|Webcam|Microphone|Speakers|Headphones|Headset|Printer|Scanner|Plotter|Projector|Router|Modem|Network card=NIC|Wi-Fi adapter|Bluetooth adapter|Sound card|Capture card|Optical drive|DVD drive|Blu-ray drive|Floppy drive|USB flash drive=USB stick|External hard drive|Memory card|SD card|Card reader|USB hub|Docking station|KVM switch|Graphics tablet=Drawing tablet|Stylus|Joystick|Gamepad=Controller|Steering wheel|VR headset|UPS|Surge protector|Server|Rack|NAS|Switch|Firewall|BIOS chip|CMOS battery|Chipset|PCIe slot|Expansion card|Riser cable|SATA cable|HDMI cable|DisplayPort cable|Ethernet cable|USB-C cable|Thunderbolt|Touchscreen|Barcode scanner|Fingerprint reader|Smart card reader|Tensor processing unit=TPU|NPU|FPGA|ASIC|Mainframe|Supercomputer|Laptop|Desktop|Tablet|All-in-one|Mini PC|Raspberry Pi|Arduino|Microcontroller|Cache|ROM|EEPROM|Flash memory|Optane|Tape drive|Zip drive|Punch card|Light pen|Numeric keypad|Macro pad|Stream Deck|Mouse pad|Wrist rest|Monitor arm|Laptop stand|Cooling pad|Fan controller|RGB controller|Front panel|I/O shield|Backplate`,
      },
      {
        name: "Websites",
        prompt: "Name as many famous websites as you can",
        difficulty: "easy",
        answers: `Google|YouTube|Facebook|Wikipedia|Amazon|Instagram|Twitter=X|Reddit|LinkedIn|Netflix|Yahoo|Bing|Baidu|DuckDuckGo|eBay|Craigslist|Etsy|AliExpress|Alibaba|Walmart|Target|Best Buy|IKEA|Flipkart|Myntra|Meesho|Snapdeal|Nykaa|Zomato|Swiggy|Paytm|IRCTC|MakeMyTrip|Naukri|Shaadi.com|Cricbuzz|ESPNcricinfo=Cricinfo|ESPN|BBC|CNN|The New York Times=NYTimes|The Guardian|Fox News|Al Jazeera|Reuters|Bloomberg|Forbes|BuzzFeed|HuffPost|Vox|The Verge|TechCrunch|Wired|Engadget|IGN|GameSpot|Kotaku|Polygon|Twitch|Discord|Spotify|SoundCloud|Bandcamp|Pandora|Shazam|Genius|IMDb|Rotten Tomatoes|Metacritic|Letterboxd|Goodreads|Quora|Stack Overflow|GitHub|GitLab|Medium|Substack|WordPress|Blogger|Tumblr|Pinterest|Flickr|Imgur|9GAG|Know Your Meme|Urban Dictionary|Dictionary.com|Merriam-Webster|Thesaurus.com|Duolingo|Khan Academy|Coursera|Udemy|edX|Chegg|Quizlet|Brainly|WolframAlpha|Gmail|Outlook|Hotmail|Proton Mail|Dropbox|Google Drive|OneDrive|iCloud|WeTransfer|Zoom|Skype|PayPal|Venmo|Cash App|Booking.com|Airbnb|Expedia|Tripadvisor|Kayak|Skyscanner|Uber|Zillow|Yelp|Indeed|Glassdoor|Fiverr|Upwork|Canva|Figma|ChatGPT|Claude|Gemini|Perplexity|Character.AI|Midjourney|Hugging Face|Kaggle|Archive.org=Internet Archive|Wayback Machine|Project Gutenberg|Wikihow|Wikimedia Commons|Fandom|Roblox|Steam|Epic Games Store|Chess.com|Lichess|Wordle|Speedtest|Weather.com|AccuWeather|Google Maps|OpenStreetMap|Waze|Apple Maps|CNET|Mashable|Slate|Salon|Vice|Vogue|Cosmopolitan|National Geographic|NASA|WebMD|Mayo Clinic|Healthline|Allrecipes|Food Network|Tasty|Serious Eats|Hacker News|Product Hunt|Patreon|Kickstarter|Indiegogo|GoFundMe|Change.org|OnlyFans`,
      },
      {
        name: "Smartphone apps",
        prompt: "Name as many popular mobile apps as you can",
        difficulty: "easy",
        answers: `WhatsApp|Instagram|Facebook|Messenger|TikTok|Snapchat|YouTube|YouTube Music|Spotify|Netflix|Amazon|Amazon Prime Video|Disney+|Hulu|Twitter=X|Telegram|Signal|WeChat|LINE|Discord|Reddit|Pinterest|LinkedIn|Threads|BeReal|Tinder|Bumble|Hinge|Uber|Lyft|Ola|Rapido|Grab|Google Maps|Waze|Apple Maps|Citymapper|Gmail|Outlook|Google Drive|Dropbox|OneDrive|Google Photos|Google Translate|Google Lens|Chrome|Safari|Firefox|Zoom|Microsoft Teams|Slack|Skype|Google Meet|FaceTime|Notion|Evernote|Todoist|Trello|Calendar|Duolingo|Khan Academy|Kindle|Audible|Goodreads|Shazam|SoundCloud|Apple Music|Pandora|Deezer|Tidal|Gaana|JioSaavn|Wynk|Hotstar|JioCinema|SonyLIV|ZEE5|MX Player|Paytm|PhonePe|Google Pay=GPay|PayPal|Venmo|Cash App|Zelle|Revolut|Wise|Robinhood|Coinbase|Binance|Zerodha Kite|Groww|Swiggy|Zomato|Blinkit|Zepto|Instamart|BigBasket|Dunzo|DoorDash|Uber Eats|Grubhub|Deliveroo|Just Eat|Instacart|Flipkart|Myntra|Meesho|Nykaa|AliExpress|Shein|Temu|Wish|eBay|Etsy|Walmart|Target|IKEA|Airbnb|Booking.com|Expedia|MakeMyTrip|IRCTC|Tripadvisor|Yelp|OpenTable|Strava|Nike Run Club|MyFitnessPal|Fitbit|Headspace|Calm|Flo|Clue|CapCut|InShot|VSCO|Snapseed|Lightroom|Photoshop Express|Canva|PicsArt|Facetune|Lensa|ChatGPT|Claude|Gemini|Perplexity|Copilot|Character.AI|Replika|Truecaller|Shareit|Xender|CamScanner|Adobe Scan|Microsoft Office|Google Docs|Google Sheets|Pokémon Go|Candy Crush Saga|Subway Surfers|Clash of Clans|PUBG Mobile|Free Fire|Roblox|Minecraft|Among Us|Ludo King|Wordle|Chess.com|Twitch|Kick|Tumblr|Quora|Medium|Substack|Find My|Life360|1Password|Bitwarden|LastPass|Authy|Google Authenticator|NordVPN|ExpressVPN|Proton VPN`,
      },
      {
        name: "Car brands",
        difficulty: "easy",
        answers: `Toyota|Honda|Nissan|Mazda|Subaru|Mitsubishi|Suzuki|Lexus|Infiniti|Acura|Daihatsu|Isuzu|Ford|Chevrolet=Chevy|GMC|Cadillac|Buick|Lincoln|Chrysler|Dodge|Jeep|Ram|Tesla|Rivian|Lucid|Fisker|Polestar|Volkswagen=VW|Audi|BMW|Mercedes-Benz=Mercedes|Porsche|Opel|Mini|Smart|Maybach|Volvo|Saab|Peugeot|Citroën=Citroen|Renault|DS|Alpine|Bugatti|Fiat|Alfa Romeo|Lancia|Maserati|Ferrari|Lamborghini|Pagani|Abarth|Jaguar|Land Rover|Range Rover|Aston Martin|Bentley|Rolls-Royce|McLaren|Lotus|MG|Vauxhall|Morgan|Caterham|TVR|Rover|Triumph|Austin|Hyundai|Kia|Genesis|SsangYong=KGM|Daewoo|Tata Motors=Tata|Mahindra|Maruti Suzuki=Maruti|Hindustan Motors|Force Motors|BYD|Geely|Chery|Great Wall|Haval|NIO|XPeng|Li Auto|Zeekr|Hongqi|SAIC|Wuling|Changan|Dongfeng|GAC|Lynk & Co|Xiaomi|Seat|Cupra|Škoda=Skoda|Dacia|Lada|GAZ|UAZ|Koenigsegg|Rimac|Spyker|Hennessey|SSC|Saleen|Shelby|Pontiac|Oldsmobile|Plymouth|Mercury|Hummer|Saturn|DeLorean|Studebaker|Packard|AMC|Hudson|Proton|Perodua|VinFast|Holden|Scion|Datsun|Eagle|Imperial|Tatra|Trabant|Zastava|Togg|Ineos|Faraday Future|Canoo|Lordstown|Aptera|Ariel|Noble|Ginetta|Radical|Wiesmann|Gumpert|Apollo|Donkervoort|Pininfarina|Iso|De Tomaso`,
      },
    ],
  },
];
