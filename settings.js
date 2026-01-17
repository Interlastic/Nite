const WORKER = "https://api.niteapiworker.workers.dev";
let currentIndex = 0;
let GLOBAL_COMMANDS = [];

// Store global data to access across tabs
let GLOBAL_SETTINGS = {};
let GLOBAL_CHANNELS = [];
let GLOBAL_ROLES = [];
let SETTINGS_CONFIG = [];
let GLOBAL_EMOJIS = { custom: [], unicode: [] };

// Twemoji CDN helper - converts emoji to Twemoji image URL
function getTwemojiUrl(emoji) {
    const codePoint = [...emoji].map(c => c.codePointAt(0).toString(16)).join('-');
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoint}.png`;
}

// Clean emoji list organized by category
const UNICODE_EMOJIS = {
    "Smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐"],
    "People": ["😕", "😟", "🙁", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖"],
    "Gestures": ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
    "Hearts": ["❤", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
    "Animals": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐈", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊", "🐇", "🦝", "🦨", "🦡", "🦫", "🦦", "🦥", "🐁", "🐀", "🐿", "🦔"],
    "Food": ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "🫖", "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾", "🧊", "🥄", "🍴", "🍽", "🥣", "🥡", "🥢"],
    "Activities": ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸", "🥌", "🎿", "⛷", "🏂", "🪂", "🏋", "🤼", "🤸", "🤺", "⛹", "🤾", "🏌", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖", "🏵", "🎗", "🎫", "🎟", "🎪", "🤹", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻", "🎲", "♟", "🎯", "🎳", "🎮", "🎰", "🧩"],
    "Travel": ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍", "🛵", "🚲", "🛴", "🛹", "🛼", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "✈", "🛫", "🛬", "🛩", "💺", "🛰", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥", "🛳", "⛴", "🚢", "⚓", "🪝", "⛽", "🚧", "🚦", "🚥", "🚏", "🗺", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟", "🎡", "🎢", "🎠", "⛲", "⛱", "🏖", "🏝", "🏜", "🌋", "⛰", "🏔", "🗻", "🏕", "⛺", "🛖", "🏠", "🏡", "🏘", "🏚", "🏗", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛", "⛪", "🕌", "🕍", "🛕", "🕋", "⛩", "🛤", "🛣", "🗾", "🎑", "🏞", "🌅", "🌄", "🌠", "🎇", "🎆", "🌇", "🌆", "🏙", "🌃", "🌌", "🌉", "🌁"],
    "Objects": ["⌚", "📱", "📲", "💻", "⌨", "🖥", "🖨", "🖱", "🖲", "🕹", "🗜", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽", "🎞", "📞", "☎", "📟", "📠", "📺", "📻", "🎙", "🎚", "🎛", "🧭", "⏱", "⏲", "⏰", "🕰", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯", "🪔", "🧯", "🛢", "💸", "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖", "🪜", "🧰", "🪛", "🔧", "🔨", "⚒", "🛠", "⛏", "🪚", "🔩", "⚙", "🪤", "🧱", "⛓", "🧲", "🔫", "💣", "🧨", "🪓", "🔪", "🗡", "⚔", "🛡", "🚬", "⚰", "🪦", "⚱", "🏺", "🔮", "📿", "🧿", "💈", "⚗", "🔭", "🔬", "🕳", "🩹", "🩺", "💊", "💉", "🩸", "🧬", "🦠", "🧫", "🧪", "🌡", "🧹", "🪠", "🧺", "🧻", "🚽", "🚰", "🚿", "🛁", "🛀", "🧼", "🪥", "🪒", "🧽", "🪣", "🧴", "🛎", "🔑", "🗝", "🚪", "🪑", "🛋", "🛏", "🛌", "🧸", "🪆", "🖼", "🪞", "🪟", "🛍", "🛒", "🎁", "🎈", "🎏", "🎀", "🪄", "🪅", "🎊", "🎉", "🎎", "🏮", "🎐", "🧧", "✉", "📩", "📨", "📧", "💌", "📥", "📤", "📦", "🏷", "🪧", "📪", "📫", "📬", "📭", "📮", "📯", "📜", "📃", "📄", "📑", "🧾", "📊", "📈", "📉", "🗒", "🗓", "📆", "📅", "🗑", "📇", "🗃", "🗳", "🗄", "📋", "📁", "📂", "🗂", "🗞", "📰", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📚", "📖", "🔖", "🧷", "🔗", "📎", "🖇", "📐", "📏", "🧮", "📌", "📍", "✂", "🖊", "🖋", "✒", "🖌", "🖍", "📝", "✏", "🔍", "🔎", "🔏", "🔐", "🔒", "🔓"],
    "Symbols": ["❤", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮", "✝", "☪", "🕉", "☸", "✡", "🔯", "🕎", "☯", "☦", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛", "🉑", "☢", "☣", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷", "✴", "🆚", "💮", "🉐", "㊙", "㊗", "🈴", "🈵", "🈹", "🈲", "🅰", "🅱", "🆎", "🆑", "🅾", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕", "❓", "❔", "‼", "⁉", "🔅", "🔆", "〽", "⚠", "🚸", "🔱", "⚜", "🔰", "♻", "✅", "🈯", "💹", "❇", "✳", "❎", "🌐", "💠", "Ⓜ", "🌀", "💤", "🏧", "🚾", "♿", "🅿", "🛗", "🈳", "🈂", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧", "🚻", "🚮", "🎦", "📶", "🈁", "🔣", "ℹ", "🔤", "🔡", "🔠", "🆖", "🆗", "🆙", "🆒", "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣", "⏏", "▶", "⏸", "⏯", "⏹", "⏺", "⏭", "⏮", "⏩", "⏪", "⏫", "⏬", "◀", "🔼", "🔽", "➡", "⬅", "⬆", "⬇", "↗", "↘", "↙", "↖", "↕", "↔", "↪", "↩", "⤴", "⤵", "🔀", "🔁", "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖", "🟰", "♾", "💲", "💱", "™", "©", "®", "👁‍🗨", "🔚", "🔙", "🔛", "🔝", "🔜", "〰", "➰", "➿", "✔", "☑", "🔘", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🔺", "🔻", "🔸", "🔹", "🔶", "🔷", "🔳", "🔲", "▪", "▫", "◾", "◽", "◼", "◻", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛", "⬜", "🟫", "🔈", "🔇", "🔉", "🔊", "🔔", "🔕", "📣", "📢", "💬", "💭", "🗯", "♠", "♣", "♥", "♦", "🃏", "🎴", "🀄", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕜", "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦", "🕧"],
    "Flags": ["🏳", "🏴", "🏴‍☠️", "🏁", "🚩", "🎌", "🏳️‍🌈", "🏳️‍⚧️"]
};

// Lightweight emoji keyword search (common emojis only - keeps bundle small)
const EMOJI_KEYWORDS = {
    "😀": "grin smile happy", "😃": "smile happy joy", "😄": "smile happy laugh", "😁": "grin beam", "😆": "laugh lol xd",
    "😅": "sweat nervous awkward", "🤣": "rofl lmao rolling", "😂": "joy laugh cry tears lol", "🙂": "smile slight", "🙃": "upside down",
    "😉": "wink flirt", "😊": "blush happy smile", "😇": "angel innocent halo", "🥰": "love hearts adore", "😍": "love heart eyes",
    "🤩": "star struck excited wow", "😘": "kiss love blow", "😗": "kiss", "😚": "kiss blush", "😙": "kiss smile",
    "😋": "yum delicious tasty tongue", "😛": "tongue playful", "😜": "wink tongue crazy", "🤪": "zany crazy wild goofy",
    "😝": "tongue squint", "🤑": "money rich dollar", "🤗": "hug hugging", "🤭": "giggle oops hand", "🤫": "shush quiet secret",
    "🤔": "thinking hmm think", "🤐": "zipper mouth shut secret", "🤨": "raised eyebrow skeptical", "😐": "neutral meh",
    "😑": "expressionless blank", "😶": "silent no mouth", "😏": "smirk suggestive flirt", "😒": "unamused annoyed meh",
    "🙄": "eye roll whatever annoyed", "😬": "grimace awkward cringe", "🤥": "lying pinocchio", "😌": "relieved peaceful calm",
    "😔": "sad pensive sorry", "😪": "sleepy tired", "🤤": "drool yum delicious", "😴": "sleep zzz tired", "😷": "mask sick",
    "🤒": "thermometer sick fever", "🤕": "bandage hurt injured", "🤢": "nauseous sick gross", "🤮": "vomit puke sick",
    "🤧": "sneeze sick cold", "🥵": "hot sweating heat", "🥶": "cold freezing ice", "🥴": "woozy drunk dizzy", "😵": "dizzy dead",
    "🤯": "mindblown exploding shocked wow", "🤠": "cowboy yeehaw", "🥳": "party celebrate birthday", "🥸": "disguise incognito",
    "😎": "cool sunglasses", "🤓": "nerd glasses geek", "🧐": "monocle fancy", "😕": "confused sad", "😟": "worried concerned",
    "🙁": "sad frown", "😮": "surprised open mouth wow", "😯": "hushed surprised", "😲": "astonished shocked wow",
    "😳": "flushed embarrassed blush", "🥺": "pleading puppy eyes please", "😦": "frown open", "😧": "anguished",
    "😨": "fearful scared", "😰": "anxious sweat", "😥": "sad relieved", "😢": "cry sad tear", "😭": "sob crying loud tears",
    "😱": "scream scared fear horror", "😖": "confounded", "😣": "persevering", "😞": "disappointed sad",
    "😓": "downcast sweat", "😩": "weary tired", "😫": "tired face", "🥱": "yawn sleepy bored", "😤": "triumph huff angry",
    "😡": "angry pouting mad", "😠": "angry", "🤬": "cursing swearing symbols", "😈": "devil smiling evil", "👿": "devil angry",
    "💀": "skull dead death skeleton", "💩": "poop poo shit", "🤡": "clown", "👹": "ogre", "👺": "goblin", "👻": "ghost boo",
    "👽": "alien ufo", "👾": "alien monster space invader", "🤖": "robot bot",
    "👋": "wave hi hello bye", "🤚": "raised back hand", "🖐": "hand fingers five", "✋": "raised hand stop high five",
    "🖖": "vulcan spock", "👌": "ok okay perfect", "🤌": "pinched fingers italian", "🤏": "pinch small tiny",
    "✌": "peace victory", "🤞": "fingers crossed luck", "🤟": "love you sign", "🤘": "rock on metal horns",
    "🤙": "call me shaka", "👈": "point left", "👉": "point right", "👆": "point up", "🖕": "middle finger fuck",
    "👇": "point down", "👍": "thumbs up like yes good", "👎": "thumbs down dislike no bad", "✊": "fist",
    "👊": "punch fist bump", "🤛": "left fist", "🤜": "right fist", "👏": "clap applause", "🙌": "raised hands celebrate",
    "👐": "open hands", "🤲": "palms up", "🤝": "handshake deal", "🙏": "pray please thank you namaste",
    "❤": "red heart love", "🧡": "orange heart", "💛": "yellow heart", "💚": "green heart", "💙": "blue heart",
    "💜": "purple heart", "🖤": "black heart", "🤍": "white heart", "🤎": "brown heart", "💔": "broken heart",
    "💕": "two hearts", "💞": "revolving hearts", "💓": "beating heart", "💗": "growing heart", "💖": "sparkling heart",
    "💘": "heart arrow cupid", "💝": "heart ribbon gift", "💟": "heart decoration",
    "🐶": "dog puppy", "🐱": "cat kitty", "🐭": "mouse", "🐹": "hamster", "🐰": "rabbit bunny", "🦊": "fox",
    "🐻": "bear", "🐼": "panda", "🐨": "koala", "🐯": "tiger", "🦁": "lion", "🐮": "cow", "🐷": "pig",
    "🐸": "frog", "🐵": "monkey", "🐔": "chicken", "🐧": "penguin", "🐦": "bird", "🦆": "duck", "🦅": "eagle",
    "🦉": "owl", "🐺": "wolf", "🐴": "horse", "🦄": "unicorn", "🐝": "bee honey", "🦋": "butterfly",
    "🐢": "turtle tortoise", "🐍": "snake", "🐙": "octopus", "🦀": "crab", "🐟": "fish", "🐬": "dolphin",
    "🐳": "whale", "🦈": "shark", "🐘": "elephant",
    "🍏": "apple green", "🍎": "apple red", "🍊": "orange tangerine", "🍋": "lemon", "🍌": "banana", "🍉": "watermelon",
    "🍇": "grapes", "🍓": "strawberry", "🍑": "peach butt", "🍍": "pineapple", "🥑": "avocado", "🍆": "eggplant",
    "🌶": "pepper hot spicy", "🥕": "carrot", "🌽": "corn", "🍔": "burger hamburger", "🍟": "fries", "🍕": "pizza",
    "🌭": "hot dog", "🌮": "taco", "🌯": "burrito", "🍣": "sushi", "🍦": "ice cream", "🍩": "donut doughnut",
    "🍪": "cookie", "🎂": "birthday cake", "🍰": "cake slice", "🍫": "chocolate", "🍬": "candy", "🍭": "lollipop",
    "☕": "coffee", "🍵": "tea", "🍺": "beer", "🍻": "beers cheers", "🍷": "wine", "🍸": "cocktail martini",
    "⚽": "soccer football", "🏀": "basketball", "🏈": "football american", "⚾": "baseball", "🎾": "tennis",
    "🏆": "trophy winner", "🥇": "gold medal first", "🥈": "silver medal second", "🥉": "bronze medal third",
    "🎮": "video game controller", "🎲": "dice game", "🎯": "bullseye target dart",
    "🔥": "fire hot lit", "💧": "water drop", "⭐": "star", "🌟": "glowing star sparkle", "✨": "sparkles magic",
    "💫": "dizzy star", "🌈": "rainbow", "☀": "sun sunny", "🌙": "moon crescent", "⚡": "lightning bolt zap",
    "❄": "snowflake cold winter", "💨": "wind dash", "💥": "boom explosion", "💯": "100 hundred perfect",
    "✅": "check mark yes done", "❌": "cross x no wrong", "❓": "question", "❗": "exclamation",
    "🎉": "party popper celebrate tada", "🎊": "confetti", "🎁": "gift present", "🎈": "balloon"
};


// --- UTILS ---
function setCookie(n, v) { document.cookie = n + "=" + v + ";path=/;max-age=604800"; }
function getCookie(n) { return (document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)')) || [])[2]; }

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Page Transition: Fade in from black
    setTimeout(() => {
        const overlay = document.getElementById('transition-overlay');
        if (overlay) overlay.classList.remove('active');
    }, 100); // Small delay to ensure render

    const token = getCookie("auth_token");
    if (!token) { window.location.href = "index.html"; return; }

    const user = getCookie("auth_user");
    if (user) document.getElementById('lbl-btn-username').innerText = user;

    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get('id');
    const serverName = urlParams.get('name');
    const serverIcon = urlParams.get('icon');
    const serverWidth = urlParams.get('width'); // Get the width passed from previous page
    const serverHeight = urlParams.get('height'); // Get height for position calc

    // Render Static Card Header if data exists
    if (serverName && serverIcon) {
        renderStaticFloatingCard(serverName, serverIcon, serverWidth, serverHeight);
    }

    if (serverId) {
        document.getElementById('lbl-server-id').innerText = serverId;
        initSettingsFlow(serverId, token);
    } else {
        alert("No ID provided");
        window.location.href = "index.html";
    }
});

function renderStaticFloatingCard(serverName, serverIcon, serverWidth, serverHeight) {
    // --- CONTAINER ---
    const switcherContainer = document.createElement('div');
    switcherContainer.className = 'switcher-container';
    switcherContainer.style.position = 'fixed';
    switcherContainer.style.zIndex = '2000'; // Above everything

    // --- MAIN CARD ---
    const floatCard = document.createElement('div');
    floatCard.className = 'server-card';
    // Reset styles for use inside container
    floatCard.style.margin = '0';
    floatCard.style.cursor = 'pointer'; // Now clickable
    floatCard.style.pointerEvents = 'auto'; // Enable clicks
    floatCard.style.animation = 'none';
    floatCard.style.filter = 'none';
    floatCard.style.webkitFilter = 'none';

    // Apply width/scale to the CARD, but position applies to CONTAINER
    floatCard.style.width = serverWidth ? (serverWidth + 'px') : '120px';
    floatCard.style.transform = 'scale(0.6)';
    floatCard.style.transformOrigin = 'top left'; // Important for scale to position correctly
    if (window.innerWidth <= 768) floatCard.style.transformOrigin = 'bottom left'; // Mobile

    floatCard.innerHTML = `
        <img src="${decodeURIComponent(serverIcon)}" class="server-avatar" style="filter:blur(0); animation:none;">
        <span>${decodeURIComponent(serverName)}</span>
    `;

    // --- SWITCHER GRID (Hidden by default) ---
    const grid = document.createElement('div');
    grid.className = 'switcher-grid';
    grid.innerHTML = '<p style="color:#aaa; font-size:0.8rem; text-align:center;">Loading servers...</p>';

    switcherContainer.appendChild(floatCard);
    switcherContainer.appendChild(grid);

    // --- POSITIONING ---
    switcherContainer.style.left = '20px';
    if (window.innerWidth <= 768) {
        // Mobile: Bottom Left
        const h = serverHeight ? parseFloat(serverHeight) : 80;
        const topPos = window.innerHeight - 20 - (h * 0.6);
        switcherContainer.style.top = topPos + 'px';
    } else {
        // Desktop: Top Left
        switcherContainer.style.top = '20px';
    }

    // --- INTERACTIONS ---
    let isMobile = window.innerWidth <= 768;

    floatCard.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMobile) {
            // Mobile: Tap 1 -> Open, Tap 2 -> Home
            if (switcherContainer.classList.contains('active')) {
                window.location.href = "index.html";
            } else {
                switcherContainer.classList.add('active');
                fetchServersForGrid(grid); // Load servers on open
            }
        } else {
            // Desktop: Click -> Home
            window.location.href = "index.html";
        }
    });

    // Desktop Hover Logic
    if (!isMobile) {
        switcherContainer.addEventListener('mouseenter', () => {
            fetchServersForGrid(grid);
        });
    }

    // Close on outside click (Mobile)
    document.addEventListener('click', (e) => {
        if (!switcherContainer.contains(e.target)) {
            switcherContainer.classList.remove('active');
        }
    });

    document.body.appendChild(switcherContainer);

    // Hide Sidebar Header Text provided by template logic
    const headerDiv = document.querySelector('.sidebar-header');
    if (headerDiv) headerDiv.style.visibility = 'hidden';
}

// --- API FLOW ---
async function initSettingsFlow(serverId, token) {
    try {
        // 1. Fetch Config
        const configRes = await fetch('settings_config.json');
        if (!configRes.ok) throw new Error("Failed to load settings configuration.");
        SETTINGS_CONFIG = await configRes.json();

        // 2. Trigger Bot
        await fetch(`${WORKER}/trigger-settings?serverid=${serverId}`, { headers: { "Authorization": token } });

        // 3. Poll for Data
        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            let res = await fetch(`${WORKER}/check-settings?t=${Date.now()}`, { headers: { "Authorization": token }, cache: "no-store" });

            if (res.status === 200) {
                const data = await res.json();
                GLOBAL_CHANNELS = data.channels || [];
                GLOBAL_ROLES = data.roles || [];
                GLOBAL_SETTINGS = data.settings || {};
                GLOBAL_SETTINGS = data.settings || {};
                GLOBAL_COMMANDS = data.commands || [];
                // Parse Emojis
                if (data.emojis) {
                    GLOBAL_EMOJIS.custom = data.emojis.custom || [];
                }
                GLOBAL_EMOJIS.unicode = UNICODE_EMOJIS;

                document.getElementById('loading-text').classList.add('hide');

                // Sync enabled bools from actual message arrays (bot uses messages !== false for enabled state)
                // This ensures website matches Discord dashboard behavior
                GLOBAL_SETTINGS.welcome_enabled_bool = GLOBAL_SETTINGS.welcome_messages !== false;
                GLOBAL_SETTINGS.goodbye_enabled_bool = GLOBAL_SETTINGS.goodbye_messages !== false;

                // 4. Render Interface
                renderInterface();
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        document.getElementById('loading-text').innerText = "Bot timed out.";
    } catch (e) {
        document.getElementById('loading-text').innerText = "Error: " + e.message;
    }
}

// --- RENDER LOGIC ---

function renderInterface() {
    renderTabs();
    initInputRestrictions(); // Apply restrictions to all inputs with data-only
    const firstTab = SETTINGS_CONFIG[0];
    if (firstTab) {
        // Set first tab as active
        const btn = document.querySelector(`.nav-item[data-target="${firstTab.id}"]`);
        if (btn) {
            btn.classList.add('active');
            moveGlider(btn);
        }
        document.getElementById(firstTab.id).classList.add('active');
    }
}

// Initialize input restrictions on all elements with data-only attribute
function initInputRestrictions() {
    document.querySelectorAll('[data-only]').forEach(el => {
        applyInputRestriction(el, el.dataset.only);
    });
}

function renderTabs() {
    const navContainer = document.querySelector('.nav-menu');
    const contentViewport = document.querySelector('.content-viewport');

    // Clear existing placeholders (except glider)
    // Keep sidebar header, etc? standard structure in HTML is:
    // .nav-menu > glider, btn, btn

    // We will rebuild the nav items.
    const glider = document.getElementById('nav-glider');
    navContainer.innerHTML = '';
    navContainer.appendChild(glider);

    // Clear content viewport (except loading text if we want to keep it generic, but easier to wipe)
    // Actually, save the loading text if needed, but it should be hidden by now.
    contentViewport.innerHTML = '<p id="loading-text" style="text-align:center; margin-top:50px; color:#aaa; display:none;">Loading Configuration...</p>';

    SETTINGS_CONFIG.forEach((tab, index) => {
        // 1. Create Nav Button
        const btn = document.createElement('button');
        btn.className = 'nav-item';
        btn.innerText = tab.name;
        btn.dataset.target = tab.id;
        btn.onclick = function () { switchTab(this, tab.id); };
        navContainer.appendChild(btn);

        // 2. Create Tab Pane
        const pane = document.createElement('div');
        pane.id = tab.id;
        pane.className = 'tab-pane';
        // Render settings inside pane
        pane.innerHTML = renderSettingsList(tab.settings);
        contentViewport.appendChild(pane);
    });
}

function renderSettingsList(settingsList) {
    let html = '';
    settingsList.forEach(item => {
        switch (item.type) {
            case 'header':
                html += `<h2>${item.text}${createHelpIcon(item.help)}</h2>`;
                break;
            case 'text':
                html += `<p style="${item.style || ''}">${item.text}</p>`;
                break;
            case 'title':
                html += `<div class="section-title">${item.text}${createHelpIcon(item.help)}</div>`;
                break;
            case 'switch':
                html += createToggle(item.key, item.label, item.sublabel, toBoolean(GLOBAL_SETTINGS[item.key]), item.help);
                break;
            case 'select':
                html += createSelect(item.key, item.label, item.options, GLOBAL_SETTINGS[item.key] || item.default, item.help);
                break;
            case 'textarea':
                let val = GLOBAL_SETTINGS[item.key];
                if (Array.isArray(val) && item.join) {
                    val = val.join(item.join);
                } else if (typeof val !== 'string') {
                    val = item.default || "";
                }
                html += createTextarea(item.key, item.label, item.placeholder, val, item.help, item.only, item.maxLength);
                break;
            case 'channelPick':
                html += createChannelSelect(item.key, item.label, GLOBAL_SETTINGS[item.key], item.help);
                break;
            case 'dict':
                html += createDict(item.key, item.label, GLOBAL_SETTINGS[item.key] || {}, item.keyPlaceholder, item.valuePlaceholder, item.help, item.keyOnly, item.valueOnly);
                break;
            case 'namedContentList':
                html += createNamedContentList(item.key, item.label, GLOBAL_SETTINGS[item.key] || [], item.help);
                break;
            case 'commandList':
                html += renderCommandList();
                break;
            case 'supportChannelList':
                html += renderSupportChannelList(item.key);
                break;
            case 'embedMaker':
                html += createEmbedMakerButton(item.key, item.label, item.buttonText, item.help);
                break;
            default:
                console.warn("Unknown setting type:", item.type);
        }
    });
    return html;
}

// --- SPECIAL RENDERERS ---

function renderCommandList() {
    if (GLOBAL_COMMANDS.length === 0) {
        return `<p style="color:#72767d;">No commands found or bot failed to send list.</p>`;
    }
    let html = `<div class="commands-grid">`;
    GLOBAL_COMMANDS.forEach(cmd => {
        const key = `${cmd.name}_enabled`;
        const isEnabled = GLOBAL_SETTINGS[key] === undefined || toBoolean(GLOBAL_SETTINGS[key]);
        html += `
        <div class="command-card" style="display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <span style="font-weight:bold; color:#fff; font-family:monospace; font-size:1.1rem;">/${cmd.name}</span>
                <label class="switch">
                    <input type="checkbox" id="${key}" ${isEnabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
            <span style="font-size:0.8rem; color:#b9bbbe; line-height:1.3;">${cmd.description}</span>
        </div>`;
    });
    html += `</div>`;
    return html;
}

function renderSupportChannelList(key) {
    const forums = GLOBAL_CHANNELS.filter(c => c.type === '15' || c.type === '13' || c.type === 'forum');
    if (forums.length === 0) {
        return `<p style="color:#72767d; font-style:italic;">No Forum channels found.</p>`;
    }
    let html = `<div class="commands-grid">`;
    const selected = GLOBAL_SETTINGS[key] || [];
    forums.forEach(c => {
        const isChecked = selected.includes(c.id);
        html += `
        <div class="command-card">
            <span># ${c.name}</span>
            <label class="switch">
                <input type="checkbox" class="support-channel-chk" data-setting-key="${key}" value="${c.id}" ${isChecked ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>`;
    });
    html += `</div>`;
    return html;
}

// --- HELPER COMPONENT GENERATORS ---

// Normalize value to boolean (handles Python "True"/"False" strings)
function toBoolean(val) {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === '1';
    }
    return Boolean(val);
}

// Escape special characters for HTML attributes
function escapeForHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Input restriction patterns
const INPUT_RESTRICTIONS = {
    emoji: {
        pattern: /^[\p{Emoji}\p{Emoji_Component}\s]*$/u,
        filter: (val) => val.replace(/[^\p{Emoji}\p{Emoji_Component}\s]/gu, '')
    },
    numbers: {
        pattern: /^[0-9]*$/,
        filter: (val) => val.replace(/[^0-9]/g, '')
    },
    letters: {
        pattern: /^[a-zA-Z]*$/,
        filter: (val) => val.replace(/[^a-zA-Z]/g, '')
    }
};

// Apply input restriction on an element
function applyInputRestriction(inputEl, restrictionType) {
    if (!restrictionType || !INPUT_RESTRICTIONS[restrictionType]) return;

    const restriction = INPUT_RESTRICTIONS[restrictionType];
    inputEl.addEventListener('input', function (e) {
        const filtered = restriction.filter(this.value);
        if (filtered !== this.value) {
            this.value = filtered;
        }
    });
}

// Help Icon Generator - creates actual HTML tooltip for clickable links
function createHelpIcon(helpText) {
    if (!helpText) return '';
    // Convert URLs to clickable links
    const linkifiedText = escapeForHtml(helpText).replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    // Convert \n to actual line breaks
    const formattedText = linkifiedText.replace(/\\n/g, '<br>');
    return `<span class="help-icon-wrapper"><span class="help-icon">?</span><span class="help-tooltip">${formattedText}</span></span>`;
}

function createToggle(id, label, sublabel, checked, help) {
    return `
    <div class="toggle-wrapper">
        <div class="toggle-label-group">
            <span class="form-label" style="margin:0;">${label}${createHelpIcon(help)}</span>
            ${sublabel ? `<span class="form-sublabel" style="margin:0;">${sublabel}</span>` : ''}
        </div>
        <label class="switch">
            <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
            <span class="slider"></span>
        </label>
    </div>`;
}

function createSelect(id, label, options, selectedVal, help) {
    let opts = options.map(o => `<option value="${o.val}" ${String(o.val) === String(selectedVal) ? 'selected' : ''}>${o.txt}</option>`).join('');
    return `
    <div class="form-group">
        <label class="form-label">${label}${createHelpIcon(help)}</label>
        <select id="${id}" class="styled-select">${opts}</select>
    </div>`;
}

function createTextarea(id, label, placeholder, value, help, only, maxLength) {
    const onlyAttr = only ? `data-only="${only}"` : '';
    const maxLenAttr = maxLength ? `maxlength="${maxLength}"` : '';
    const charCount = maxLength ? `<div class="char-count" style="text-align:right; font-size:0.8rem; color:#aaa; margin-top:4px;"><span id="${id}-count">${value ? value.length : 0}</span>/${maxLength}</div>` : '';

    // Add event listener for character count update if maxLength is present
    setTimeout(() => {
        if (maxLength) {
            const el = document.getElementById(id);
            const countEl = document.getElementById(`${id}-count`);
            if (el && countEl) {
                el.addEventListener('input', () => {
                    countEl.innerText = el.value.length;
                });
            }
        }
    }, 0);

    return `
    <div class="form-group">
        <label class="form-label">${label}${createHelpIcon(help)}</label>
        <textarea id="${id}" class="styled-textarea" placeholder="${escapeForHtml(placeholder)}" ${onlyAttr} ${maxLenAttr}>${escapeForHtml(value)}</textarea>
        ${charCount}
    </div>`;
}

function createChannelSelect(id, label, selectedId, help) {
    const targetId = selectedId ? String(selectedId) : "";
    const channels = GLOBAL_CHANNELS.filter(c =>
        String(c.type) === '0' ||
        String(c.type) === 'text' ||
        String(c.type) === '5' ||
        String(c.type) === 'news'
    );
    const found = channels.find(c => String(c.id) === targetId);

    let opts = `<option value="">-- None --</option>`;
    if (targetId && !found) {
        opts += `<option value="${targetId}" selected>Unknown Channel (${targetId})</option>`;
    }
    opts += channels.map(c => {
        const cId = String(c.id);
        const isSelected = cId === targetId;
        return `<option value="${cId}" ${isSelected ? 'selected' : ''}># ${c.name}</option>`;
    }).join('');

    return `
    <div class="form-group">
        <label class="form-label">${label}${createHelpIcon(help)}</label>
        <select id="${id}" class="styled-select">
            ${opts}
        </select>
    </div>`;
}

// --- DICT TYPE ---
function createDict(id, label, dictData, keyPlaceholder, valuePlaceholder, help, keyOnly, valueOnly) {
    const keyPh = keyPlaceholder || 'Key';
    const valPh = valuePlaceholder || 'Value';
    const keyOnlyAttr = keyOnly || '';
    const valOnlyAttr = valueOnly || '';

    let rowsHtml = '';
    const entries = Object.entries(dictData || {});
    entries.forEach(([key, value], idx) => {
        rowsHtml += createDictRow(id, idx, key, value, keyPh, valPh, keyOnlyAttr, valOnlyAttr);
    });

    return `
    <div class="form-group dict-container" data-dict-id="${id}" data-key-only="${keyOnlyAttr}" data-value-only="${valOnlyAttr}">
        <label class="form-label">${label}${createHelpIcon(help)}</label>
        <div class="dict-rows" id="dict-rows-${id}">
            ${rowsHtml}
        </div>
        <button type="button" class="dict-add-btn" onclick="addDictRow('${id}', '${escapeForHtml(keyPh)}', '${escapeForHtml(valPh)}', '${keyOnlyAttr}', '${valOnlyAttr}')">
            + Add
        </button>
    </div>`;
}

function createDictRow(dictId, idx, keyVal, valueVal, keyPh, valPh, keyOnly, valueOnly) {
    const keyOnlyAttr = keyOnly ? `data-only="${keyOnly}"` : '';
    const valOnlyAttr = valueOnly ? `data-only="${valueOnly}"` : '';
    return `
    <div class="dict-row" data-row-idx="${idx}">
        <button type="button" class="dict-remove-btn" onclick="removeDictRow(this)">−</button>
        <div class="dict-key-wrapper">
             <input type="text" class="styled-input dict-key" placeholder="${escapeForHtml(keyPh)}" value="${escapeForHtml(keyVal)}" ${keyOnlyAttr}>
        </div>
        <div class="dict-value-wrapper">
            <textarea class="styled-textarea dict-value" placeholder="${escapeForHtml(valPh)}" ${valOnlyAttr}>${escapeForHtml(valueVal)}</textarea>
            <button type="button" class="emoji-btn" onclick="openEmojiPicker(this)" title="Add emoji">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            </button>
        </div>
    </div>`;
}

function addDictRow(dictId, keyPh, valPh, keyOnly, valueOnly) {
    const container = document.getElementById(`dict-rows-${dictId}`);
    const idx = container.querySelectorAll('.dict-row').length;
    const rowHtml = createDictRow(dictId, idx, '', '', keyPh, valPh, keyOnly, valueOnly);
    container.insertAdjacentHTML('beforeend', rowHtml);
    // Apply restrictions to new inputs
    const newRow = container.lastElementChild;
    if (keyOnly) applyInputRestriction(newRow.querySelector('.dict-key'), keyOnly);
    if (valueOnly) applyInputRestriction(newRow.querySelector('.dict-value'), valueOnly);
}

function removeDictRow(btn) {
    const row = btn.closest('.dict-row');
    if (row) row.remove();
}

// --- NAMED CONTENT LIST TYPE ---
function createNamedContentList(id, label, dataList, help) {
    // Limit to 5
    const MAX_ITEMS = 5;
    const currentCount = Array.isArray(dataList) ? dataList.length : 0;

    let rowsHtml = '';
    if (Array.isArray(dataList)) {
        dataList.forEach((item, idx) => {
            rowsHtml += createNamedContentListRow(idx, item.name || '', item.description || '', item.skill || '');
        });
    }

    const isMaxed = currentCount >= MAX_ITEMS;

    return `
    <div class="form-group ncl-container" data-ncl-id="${id}">
        <label class="form-label">${label}${createHelpIcon(help)} <span style="font-size:0.8rem; color:#aaa; font-weight:normal;">(Max 5)</span></label>
        <div class="ncl-rows" id="ncl-rows-${id}">
            ${rowsHtml}
        </div>
        <button type="button" class="dict-add-btn" id="btn-add-${id}" onclick="addNamedContentListRow('${id}')" ${isMaxed ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            + Add Item
        </button>
    </div>`;
}

function createNamedContentListRow(idx, name, desc, content) {
    const nameLimit = 100;
    const descLimit = 100;
    const contentLimit = 10000;

    return `
    <div class="ncl-row" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 10px; position: relative;">
        <button type="button" class="dict-remove-btn" onclick="removeNamedContentListRow(this)" style="position: absolute; right: 10px; top: 10px;">−</button>
        
        <div style="margin-bottom: 8px;">
            <label style="font-size: 0.8rem; color: #ccc;">Name</label>
            <input type="text" class="styled-input ncl-name" placeholder="Name" value="${escapeForHtml(name)}" maxlength="${nameLimit}">
        </div>
        
        <div style="margin-bottom: 8px;">
            <label style="font-size: 0.8rem; color: #ccc;">Description</label>
            <input type="text" class="styled-input ncl-desc" placeholder="Description" value="${escapeForHtml(desc)}" maxlength="${descLimit}">
        </div>

        <div>
            <label style="font-size: 0.8rem; color: #ccc;">Content (Skill)</label>
            <textarea class="styled-textarea ncl-content" placeholder="Content..." maxlength="${contentLimit}" style="min-height: 80px;">${escapeForHtml(content)}</textarea>
        </div>
    </div>`;
}

function addNamedContentListRow(id) {
    const container = document.getElementById(`ncl-rows-${id}`);
    const rows = container.querySelectorAll('.ncl-row');
    if (rows.length >= 5) return;

    const rowHtml = createNamedContentListRow(rows.length, '', '', '');
    container.insertAdjacentHTML('beforeend', rowHtml);

    // Update button state
    checkNamedContentListLimit(id);
}

function removeNamedContentListRow(btn) {
    const row = btn.closest('.ncl-row');
    const container = row.closest('.ncl-container');
    const id = container.getAttribute('data-ncl-id');

    if (row) row.remove();
    checkNamedContentListLimit(id);
}

function checkNamedContentListLimit(id) {
    const container = document.getElementById(`ncl-rows-${id}`);
    const btn = document.getElementById(`btn-add-${id}`);
    const count = container.querySelectorAll('.ncl-row').length;

    if (count >= 5) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
}

// --- EMBED MAKER ---
function createEmbedMakerButton(key, label, buttonText, help) {
    const hasEmbed = GLOBAL_SETTINGS[key] && Object.keys(GLOBAL_SETTINGS[key]).length > 0;
    const statusText = hasEmbed ? '✓ Embed configured' : 'No embed set';
    const statusColor = hasEmbed ? '#3ba55c' : '#72767d';

    return `
    <div class="form-group embed-maker-group" data-embed-key="${key}">
        <label class="form-label">${label}${createHelpIcon(help)}</label>
        <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" class="dict-add-btn" onclick="openEmbedMaker('${key}')" style="margin: 0;">
                ${buttonText || 'Edit Embed'}
            </button>
            <span class="embed-status" id="embed-status-${key}" style="font-size: 0.85rem; color: ${statusColor};">${statusText}</span>
            ${hasEmbed ? `<button type="button" class="dict-remove-btn" onclick="clearEmbed('${key}')" style="position: static; width: 24px; height: 24px; font-size: 16px;" title="Remove embed">−</button>` : ''}
        </div>
    </div>`;
}

function openEmbedMaker(key) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'embed-maker-modal';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `;

    // Modal container
    const modal = document.createElement('div');
    modal.style.cssText = `
        width: 95%;
        max-width: 1200px;
        height: 90%;
        background: #36393f;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #2f3136;
        border-bottom: 1px solid #202225;
    `;
    header.innerHTML = `
        <h3 style="margin: 0; color: #fff;">Embed Editor</h3>
        <div style="display: flex; gap: 10px;">
            <button id="embed-save-btn" style="padding: 8px 16px; background: #3ba55c; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Save Embed</button>
            <button id="embed-cancel-btn" style="padding: 8px 16px; background: #4f545c; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
        </div>
    `;

    // Iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'embed-maker-iframe';
    iframe.src = 'embed_maker.html';
    iframe.style.cssText = `
        flex: 1;
        width: 100%;
        border: none;
    `;

    modal.appendChild(header);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Store key for save
    overlay.dataset.embedKey = key;

    // Load existing embed data into iframe when ready
    iframe.onload = function () {
        const existingEmbed = GLOBAL_SETTINGS[key];
        if (existingEmbed && iframe.contentWindow.loadEmbedData) {
            iframe.contentWindow.loadEmbedData(existingEmbed);
        }
    };

    // Event handlers
    document.getElementById('embed-save-btn').onclick = function () {
        saveEmbedFromModal(key);
    };

    document.getElementById('embed-cancel-btn').onclick = function () {
        closeEmbedMaker();
    };

    // Close on escape
    overlay.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeEmbedMaker();
    });
}

function closeEmbedMaker() {
    const modal = document.getElementById('embed-maker-modal');
    if (modal) modal.remove();
}

function saveEmbedFromModal(key) {
    const iframe = document.getElementById('embed-maker-iframe');
    if (iframe && iframe.contentWindow.getEmbedData) {
        const embedData = iframe.contentWindow.getEmbedData();
        GLOBAL_SETTINGS[key] = embedData;

        // Update status display
        const statusEl = document.getElementById(`embed-status-${key}`);
        if (statusEl) {
            const hasEmbed = embedData && Object.keys(embedData).length > 0;
            statusEl.textContent = hasEmbed ? '✓ Embed configured' : 'No embed set';
            statusEl.style.color = hasEmbed ? '#3ba55c' : '#72767d';
        }

        closeEmbedMaker();
    } else {
        alert('Could not retrieve embed data. Please try again.');
    }
}

function clearEmbed(key) {
    if (confirm('Remove this embed?')) {
        GLOBAL_SETTINGS[key] = null;
        // Re-render the embed maker group
        const group = document.querySelector(`.embed-maker-group[data-embed-key="${key}"]`);
        if (group) {
            const statusEl = group.querySelector('.embed-status');
            if (statusEl) {
                statusEl.textContent = 'No embed set';
                statusEl.style.color = '#72767d';
            }
            // Remove the remove button
            const removeBtn = group.querySelector('.dict-remove-btn');
            if (removeBtn) removeBtn.remove();
        }
    }
}

// --- NAVIGATION ---
function switchTab(btn, targetId) {
    const allBtns = Array.from(document.querySelectorAll('.nav-item'));
    const newIndex = allBtns.indexOf(btn);
    if (newIndex === currentIndex) return;

    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    moveGlider(btn);

    const currentTab = document.querySelector('.tab-pane.active');
    const nextTab = document.getElementById(targetId);

    if (currentTab && nextTab) animateContent(currentTab, nextTab, currentIndex, newIndex);
    currentIndex = newIndex;
}

function moveGlider(targetBtn) {
    const glider = document.getElementById('nav-glider');
    if (glider) {
        glider.style.opacity = '1';
        glider.style.top = targetBtn.offsetTop + 'px';
        glider.style.height = targetBtn.offsetHeight + 'px';
    }
}

function animateContent(oldTab, newTab, oldIdx, newIdx) {
    oldTab.classList.remove('active'); oldTab.classList.add('animating');
    newTab.classList.add('active'); newTab.classList.add('animating');

    if (newIdx > oldIdx) { oldTab.classList.add('slide-out-up'); newTab.classList.add('slide-in-up'); }
    else { oldTab.classList.add('slide-out-down'); newTab.classList.add('slide-in-down'); }

    setTimeout(() => {
        oldTab.classList.remove('animating', 'slide-out-up', 'slide-out-down', 'active');
        newTab.classList.remove('animating', 'slide-in-up', 'slide-in-down');
        newTab.classList.add('active');
    }, 400);
}

// --- SAVE FUNCTION ---
async function saveChanges() {
    const btn = document.getElementById('btn-save-changes');
    const status = document.getElementById('save-status');
    const serverId = document.getElementById('lbl-server-id').textContent.trim(); // Use textContent as innerText relies on visibility
    const token = getCookie("auth_token");

    if (!serverId || serverId === "Loading...") return;

    btn.disabled = true;
    btn.innerText = "Saving...";
    status.innerText = "Collecting data...";
    status.style.color = "#aaa";

    try {
        let payload = {};

        // 1. Iterate through Config to Collect Data
        SETTINGS_CONFIG.forEach(tab => {
            tab.settings.forEach(item => {
                if (item.type === 'header' || item.type === 'text' || item.type === 'title') return;

                const el = document.getElementById(item.key);

                if (item.type === 'switch') {
                    if (el) payload[item.key] = el.checked;
                }
                else if (item.type === 'select') {
                    if (el) {
                        // Some logic for integers vs strings? 
                        // Original code used parseInt for specific fields. 
                        // Let's try to detect if options val is int-like or string.
                        // For now, save as string, unless we want to map back to int.
                        // But for generic, string is safer unless we specify "valuetype".
                        // Original: regenerate_mode (int), ping_state (int).
                        // We can guess: if value is numeric string, maybe save as int? 
                        // Or just save as is, Python backend probably handles type coercion or expected logic.
                        // Let's emulate original behavior: specific keys = int.

                        const val = el.value;
                        if (['regenerate_mode', 'ping_state'].includes(item.key)) {
                            payload[item.key] = parseInt(val);
                        } else {
                            payload[item.key] = val;
                        }
                    }
                }
                else if (item.type === 'textarea') {
                    if (el) {
                        const val = el.value;
                        if (item.join) {
                            // Split and clean
                            payload[item.key] = val.split(item.join.trim()).map(s => s.trim()).filter(s => s.length > 0);
                        } else {
                            payload[item.key] = val;
                        }
                    }
                }
                else if (item.type === 'channelPick') {
                    if (el) {
                        const val = el.value;
                        payload[item.key] = val ? val : null;
                    }
                }
                else if (item.type === 'commandList') {
                    // Iterate commands
                    GLOBAL_COMMANDS.forEach(cmd => {
                        const k = `${cmd.name}_enabled`;
                        const cBox = document.getElementById(k);
                        if (cBox) {
                            payload[k] = cBox.checked;
                        }
                    });
                }
                else if (item.type === 'supportChannelList') {
                    const chks = document.querySelectorAll(`.support-channel-chk[data-setting-key="${item.key}"]:checked`);
                    payload[item.key] = Array.from(chks).map(cb => cb.value);
                }
                else if (item.type === 'dict') {
                    const container = document.querySelector(`.dict-container[data-dict-id="${item.key}"]`);
                    if (container) {
                        const rows = container.querySelectorAll('.dict-row');
                        const dictObj = {};
                        rows.forEach(row => {
                            const keyInput = row.querySelector('.dict-key');
                            const valInput = row.querySelector('.dict-value');
                            if (keyInput && valInput && keyInput.value.trim()) {
                                dictObj[keyInput.value.trim()] = valInput.value;
                            }
                        });
                        payload[item.key] = dictObj;
                    }
                }
                else if (item.type === 'namedContentList') {
                    const container = document.querySelector(`.ncl-container[data-ncl-id="${item.key}"]`);
                    if (container) {
                        const rows = container.querySelectorAll('.ncl-row');
                        const list = [];
                        rows.forEach(row => {
                            const name = row.querySelector('.ncl-name').value;
                            const desc = row.querySelector('.ncl-desc').value;
                            const content = row.querySelector('.ncl-content').value;

                            // Only add if at least name is present? Or allow empty? 
                            // Let's allow partials, but ideally name is key.
                            if (name || desc || content) {
                                list.push({
                                    name: name,
                                    description: desc,
                                    skill: content
                                });
                            }
                        });
                        payload[item.key] = list;
                    }
                }
                else if (item.type === 'embedMaker') {
                    // Embed data is stored in GLOBAL_SETTINGS by the modal
                    if (GLOBAL_SETTINGS[item.key]) {
                        payload[item.key] = GLOBAL_SETTINGS[item.key];
                    }
                }
            });
        });

        // --- HARDCODED FIXES FOR WELCOME/GOODBYE ---
        // Backend expects 'welcome_messages' to be an Array (if enabled) or False (if disabled).
        // It does not use 'welcome_enabled_bool'.
        if (payload.welcome_enabled_bool === false) {
            payload.welcome_messages = false;
        }
        delete payload.welcome_enabled_bool;

        if (payload.goodbye_enabled_bool === false) {
            payload.goodbye_messages = false;
        }
        delete payload.goodbye_enabled_bool;

        // Ensure they are arrays if not false
        if (payload.welcome_messages && !Array.isArray(payload.welcome_messages)) {
            // Fallback if generic splitter failed (though it shouldn't)
            if (typeof payload.welcome_messages === 'string') {
                payload.welcome_messages = payload.welcome_messages.split('|').map(s => s.trim()).filter(s => s.length > 0);
            }
        }
        if (payload.goodbye_messages && !Array.isArray(payload.goodbye_messages)) {
            if (typeof payload.goodbye_messages === 'string') {
                payload.goodbye_messages = payload.goodbye_messages.split('|').map(s => s.trim()).filter(s => s.length > 0);
            }
        }

        // --- SEND TO WORKER ---
        status.innerText = "Sending to Bot...";

        const bodyData = {
            serverid: serverId,
            settings: payload
        };

        // Debug: log what we're sending
        console.log("Sending payload:", JSON.stringify(bodyData, null, 2));

        const response = await fetch(`${WORKER}/update-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            status.innerText = "Saved Successfully!";
            status.style.color = "#4fdc7b"; // Green

            // Update Global Settings
            Object.assign(GLOBAL_SETTINGS, payload);
        } else {
            throw new Error("Worker rejected update");
        }

    } catch (e) {
        console.error(e);
        status.innerText = "Save Failed: " + e.message;
        status.style.color = "#ed4245"; // Red
    } finally {
        btn.disabled = false;
        btn.innerText = "Save Changes";
    }
}

function handleAuthClick() { openLogout(); }
function logout() { document.cookie = "auth_token=;path=/;max-age=0"; window.location.href = "index.html"; }
function openLogout() { document.getElementById('loginbtn').classList.add('expanded'); document.getElementById('logOutContainer').classList.add('active'); }
function closeLogout() { document.getElementById('loginbtn').classList.remove('expanded'); document.getElementById('logOutContainer').classList.remove('active'); }
function goBack() { window.location.href = "index.html"; }

// --- SWITCHER HELPER (Identical to before) ---
let cachedServers = null;
async function fetchServersForGrid(gridEl) {
    if (cachedServers) {
        renderSwitcherGrid(gridEl, cachedServers);
        return;
    }

    const token = getCookie("auth_token");
    try {
        let res = await fetch(`${WORKER}/check?t=${Date.now()}`, { headers: { "Authorization": token }, cache: "no-store" });
        if (res.status === 200) {
            const data = await res.json();
            cachedServers = data.servers || [];
            renderSwitcherGrid(gridEl, cachedServers);
        } else {
            gridEl.innerHTML = '<p style="color:#ed4245; padding:5px;">Failed to load.</p>';
        }
    } catch (e) {
        gridEl.innerHTML = '<p style="color:#ed4245; padding:5px;">Error loading.</p>';
    }
}

function renderSwitcherGrid(el, list) {
    if (!list) list = [];
    const urlParams = new URLSearchParams(window.location.search);
    const currId = urlParams.get('id');
    const currName = urlParams.get('name');
    const currIcon = urlParams.get('icon');
    const others = list.filter(s => s.id !== currId);

    const currentServer = {
        id: currId,
        name: currName,
        picture_url: currIcon,
        isCurrent: true,
        type: 'current'
    };

    const homeCard = {
        name: "Homepage",
        picture_url: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
        type: 'special',
        action: "window.location.href='index.html'"
    };

    const addCard = {
        name: "Add to server",
        picture_url: "https://cdn.discordapp.com/avatars/1371513819104415804/9e038eeb716c24ece29276422b52cc80.webp?size=320",
        type: 'special',
        action: "window.location.href='https://discord.com/oauth2/authorize?client_id=1371513819104415804&permissions=2815042428980240&integration_type=0&scope=bot+applications.commands'"
    };

    const fullList = [currentServer, ...others, homeCard, addCard];
    const defaultIcon = "https://cdn.discordapp.com/embed/avatars/0.png";

    el.innerHTML = fullList.map((s, i) => {
        const isCurrent = s.type === 'current';
        const isSpecial = s.type === 'special';

        const safeName = s.name ? decodeURIComponent(s.name).replace(/"/g, '&quot;') : "Unknown";
        let safeIcon = s.picture_url || defaultIcon;
        safeIcon = decodeURIComponent(safeIcon).replace(/"/g, '&quot;');

        let clickAction = "";
        let cardStyle = "cursor:pointer; width:100%; box-sizing:border-box;";

        if (isCurrent) {
            clickAction = "window.location.href='index.html'";
            cardStyle += "border: 1px solid #5865F2;";
            cardStyle += "filter: none !important; animation: none !important;";
        } else if (isSpecial) {
            clickAction = s.action;
        } else {
            const params = new URLSearchParams(window.location.search);
            params.set('id', s.id);
            params.set('name', s.name);
            params.set('icon', s.picture_url || defaultIcon);
            const dest = `manage.html?${params.toString()}`;
            clickAction = `window.location.href='${dest}'`;
        }

        const delay = i * 0.05;
        const popClass = i > 0 ? 'server-card-pop' : '';
        let imgStyle = "";

        if (s.name === 'Add to server') {
            imgStyle = 'background-color: #5865F2; padding: 2px;';
        } else if (s.name === 'Homepage') {
            imgStyle = 'background-color: #ffffff; padding: 4px; border-radius: 50%;';
        }

        if (isCurrent) {
            imgStyle += ' filter: none !important; -webkit-filter: none !important; animation: none !important;';
        }

        return `
        <div class="server-card ${popClass}" 
             onclick="${clickAction}"
             style="${cardStyle} ${i > 0 ? `animation-delay: ${delay}s;` : ''}">
            <img src="${safeIcon}" class="server-avatar" style="${imgStyle}">
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; max-width:100%;">${safeName}</span>
        </div>`;
    }).join('');
}// --- EMOJI PICKER ---
let currentEmojiTarget = null;
let emojiModal = null;

function openEmojiPicker(btn) {
    currentEmojiTarget = btn.previousElementSibling; // The textarea
    if (!emojiModal) {
        createEmojiModal();
    }
    renderEmojiContent();
    emojiModal.classList.add('show');
}

function createEmojiModal() {
    emojiModal = document.createElement('div');
    emojiModal.id = 'emoji-modal';
    emojiModal.className = 'modal';
    emojiModal.innerHTML = `
        <div class="modal-content emoji-modal-content">
            <span class="close-btn" onclick="closeEmojiModal()">&times;</span>
            <h3 id="modalTitle">Select Emoji</h3>
            <input type="text" id="emoji-search" class="styled-input" placeholder="Search emojis..." style="margin-bottom:15px;">
            <div id="emoji-grid-container" class="emoji-grid-container">
                <!-- Content injected here -->
            </div>
        </div>
    `;
    document.body.appendChild(emojiModal);

    // Search listener
    document.getElementById('emoji-search').addEventListener('input', (e) => {
        renderEmojiContent(e.target.value.toLowerCase());
    });

    emojiModal.addEventListener('click', (e) => {
        if (e.target === emojiModal) closeEmojiModal();
    });
}

function closeEmojiModal() {
    if (emojiModal) emojiModal.classList.remove('show');
    currentEmojiTarget = null;
    const search = document.getElementById('emoji-search');
    if (search) search.value = "";
}

function renderEmojiContent(filter = "") {
    const container = document.getElementById('emoji-grid-container');
    if (!container) return;

    let html = "";

    // 1. Custom Emojis (Server Emojis) - flexible search: underscores as spaces, any word order
    const customFiltered = GLOBAL_EMOJIS.custom.filter(e => {
        if (filter === "") return true;
        // Normalize: replace underscores with spaces for matching
        const emojiName = e.name.toLowerCase().replace(/_/g, ' ');
        const searchTerms = filter.replace(/_/g, ' ').split(' ').filter(t => t);
        // All search terms must be present in emoji name (any order)
        return searchTerms.every(term => emojiName.includes(term));
    });
    if (customFiltered.length > 0) {
        html += `<div class="emoji-category-title">Server Emojis</div>`;
        html += `<div class="emoji-grid">`;
        customFiltered.forEach(e => {
            const format = e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`;
            const content = e.url ? `<img src="${e.url}" title="${e.name}" alt="${e.name}">` : `<span>${e.name}</span>`;
            html += `<div class="emoji-item" onclick="insertEmoji('${format}')">${content}</div>`;
        });
        html += `</div>`;
    }

    // 2. Unicode Emojis with Twemoji - organized by category
    for (const [category, emojis] of Object.entries(UNICODE_EMOJIS)) {
        // Filter emojis based on keyword search
        let filteredEmojis = emojis;
        if (filter !== "") {
            filteredEmojis = emojis.filter(emoji => {
                const keywords = EMOJI_KEYWORDS[emoji] || "";
                return keywords.toLowerCase().includes(filter) || category.toLowerCase().includes(filter);
            });
            if (filteredEmojis.length === 0) continue; // Skip empty categories
        }

        html += `<div class="emoji-category-title">${category}</div>`;
        html += `<div class="emoji-grid">`;
        filteredEmojis.forEach(emoji => {
            const twemojiUrl = getTwemojiUrl(emoji);
            html += `<div class="emoji-item" onclick="insertEmoji('${emoji}')"><img src="${twemojiUrl}" alt="${emoji}" onerror="this.outerHTML='${emoji}'"></div>`;
        });
        html += `</div>`;
    }

    if (filter !== "" && customFiltered.length === 0 && html.indexOf("emoji-grid") === -1) {
        html += `<p style="color:#aaa; font-size:0.9rem; text-align:center; margin-top:20px;">No emojis match your search.</p>`;
    }

    container.innerHTML = html;
}

function insertEmoji(val) {
    if (currentEmojiTarget) {
        // Insert at cursor position
        const start = currentEmojiTarget.selectionStart;
        const end = currentEmojiTarget.selectionEnd;
        const text = currentEmojiTarget.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        currentEmojiTarget.value = before + val + after;
        currentEmojiTarget.selectionStart = currentEmojiTarget.selectionEnd = start + val.length;
        currentEmojiTarget.focus();
        // Trigger input event for auto-resize or save check
        currentEmojiTarget.dispatchEvent(new Event('input'));
    }
    closeEmojiModal();
}
