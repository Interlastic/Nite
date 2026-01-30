const WORKER = "https://api.niteapiworker.workers.dev";
let currentIndex = 0;
let GLOBAL_COMMANDS = [];

let GLOBAL_SETTINGS = {};
let GLOBAL_CHANNELS = [];
let GLOBAL_ROLES = [];
let SETTINGS_CONFIG = [];
let GLOBAL_EMOJIS = { custom: [], unicode: [] };
window.GLOBAL_EMOJIS = GLOBAL_EMOJIS;

function getTwemojiUrl(emoji) {
    const codePoint = [...emoji].map(c => c.codePointAt(0).toString(16)).join('-');
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoint}.png`;
}

function getCommandKey(name) {
    if (!name) return "";
    let k = name.trim().replace(/\s+/g, '.');
    return k;
}

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
window.EMOJI_KEYWORDS = EMOJI_KEYWORDS;

function setCookie(n, v) { document.cookie = n + "=" + v + ";path=/;max-age=604800"; }
function getCookie(n) { return (document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)')) || [])[2]; }

let isDirty = false;

function markDirty() {
    if (window.innerWidth > 900) {
        const popup = document.getElementById('unsaved-popup');
        if (popup && !popup.classList.contains('show')) {
            popup.classList.add('show');
            popup.classList.remove('hide');
        }
    }
    isDirty = true;
}

function hideDirtyPopup() {
    const popup = document.getElementById('unsaved-popup');
    if (popup && popup.classList.contains('show')) {
        popup.classList.remove('show');
        popup.classList.add('hide');
    }
    isDirty = false;
}

function cancelChanges() {

    renderInterface();
    hideDirtyPopup();
}

document.addEventListener('DOMContentLoaded', () => {

    setTimeout(() => {
        const overlay = document.getElementById('transition-overlay');
        if (overlay) overlay.classList.remove('active');
    }, 100);

    const token = getCookie("auth_token");
    if (!token) { window.location.href = "index.html"; return; }

    const user = getCookie("auth_user");
    if (user) document.getElementById('lbl-btn-username').innerText = user;

    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get('id');
    const serverName = urlParams.get('name');
    const serverIcon = urlParams.get('icon');
    const serverWidth = urlParams.get('width');
    const serverHeight = urlParams.get('height');

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

    const switcherContainer = document.createElement('div');
    switcherContainer.className = 'switcher-container';
    switcherContainer.style.position = 'fixed';
    switcherContainer.style.zIndex = '2000';

    const floatCard = document.createElement('div');
    floatCard.className = 'server-card';

    floatCard.style.margin = '0';
    floatCard.style.cursor = 'pointer';
    floatCard.style.pointerEvents = 'auto';
    floatCard.style.animation = 'none';
    floatCard.style.filter = 'none';
    floatCard.style.webkitFilter = 'none';

    floatCard.style.width = serverWidth ? (serverWidth + 'px') : '120px';
    floatCard.style.transform = 'scale(0.6)';
    floatCard.style.transformOrigin = 'top left';
    if (window.innerWidth <= 768) floatCard.style.transformOrigin = 'bottom left';

    floatCard.innerHTML = `
        <img src="${decodeURIComponent(serverIcon)}" class="server-avatar" style="filter:blur(0); animation:none;">
        <span>${decodeURIComponent(serverName)}</span>
    `;

    const grid = document.createElement('div');
    grid.className = 'switcher-grid';
    grid.innerHTML = '<p style="color:#aaa; font-size:0.8rem; text-align:center;">Loading servers...</p>';

    switcherContainer.appendChild(floatCard);
    switcherContainer.appendChild(grid);

    switcherContainer.style.left = '20px';
    if (window.innerWidth <= 768) {

        const h = serverHeight ? parseFloat(serverHeight) : 80;
        const topPos = window.innerHeight - 20 - (h * 0.6);
        switcherContainer.style.top = topPos + 'px';
    } else {

        switcherContainer.style.top = '20px';
    }

    let isMobile = window.innerWidth <= 768;

    floatCard.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMobile) {

            if (switcherContainer.classList.contains('active')) {
                window.location.href = "index.html";
            } else {
                switcherContainer.classList.add('active');
                fetchServersForGrid(grid);
            }
        } else {

            window.location.href = "index.html";
        }
    });

    if (!isMobile) {
        switcherContainer.addEventListener('mouseenter', () => {
            fetchServersForGrid(grid);
        });
    }

    document.addEventListener('click', (e) => {
        if (!switcherContainer.contains(e.target)) {
            switcherContainer.classList.remove('active');
        }
    });

    document.body.appendChild(switcherContainer);

    const headerDiv = document.querySelector('.sidebar-header');
    if (headerDiv) headerDiv.style.visibility = 'hidden';
}

async function initSettingsFlow(serverId, token) {
    try {

        const configRes = await fetch('settings_config.json');
        if (!configRes.ok) throw new Error("Failed to load settings configuration.");
        SETTINGS_CONFIG = await configRes.json();

        await fetch(`${WORKER}/trigger-settings?serverid=${serverId}`, { headers: { "Authorization": token } });

        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            let res = await fetch(`${WORKER}/check-settings?t=${Date.now()}`, { headers: { "Authorization": token }, cache: "no-store" });

            if (res.status === 200) {
                const data = await res.json();
                GLOBAL_CHANNELS = data.channels || [];
                GLOBAL_ROLES = data.roles || [];
                GLOBAL_SETTINGS = data.settings || {};
                const permissions = data.permissions || {};
                Object.assign(GLOBAL_SETTINGS, permissions);
                GLOBAL_COMMANDS = data.commands || [];

                if (data.emojis) {
                    GLOBAL_EMOJIS.custom = data.emojis.custom || [];
                }
                GLOBAL_EMOJIS.unicode = UNICODE_EMOJIS;

                document.getElementById('loading-text').classList.add('hide');

                if (GLOBAL_SETTINGS.welcome_enabled_bool === undefined) {
                    GLOBAL_SETTINGS.welcome_enabled_bool = GLOBAL_SETTINGS.welcome_messages !== false;
                }
                if (GLOBAL_SETTINGS.goodbye_enabled_bool === undefined) {
                    GLOBAL_SETTINGS.goodbye_enabled_bool = GLOBAL_SETTINGS.goodbye_messages !== false;
                }

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

function renderInterface() {
    renderTabs();
    initInputRestrictions();

    const viewport = document.querySelector('.content-viewport');
    if (viewport) {
        viewport.addEventListener('input', markDirty);
        viewport.addEventListener('change', markDirty);
    }

    const firstTab = SETTINGS_CONFIG[0];
    if (firstTab) {

        const btn = document.querySelector(`.nav-item[data-target="${firstTab.id}"]`);
        if (btn) {
            btn.classList.add('active');
            moveGlider(btn);
        }
        document.getElementById(firstTab.id).classList.add('active');
    }
}

function initInputRestrictions() {
    document.querySelectorAll('[data-only]').forEach(el => {
        applyInputRestriction(el, el.dataset.only);
    });
}

function renderTabs() {
    const navContainer = document.querySelector('.nav-menu');
    const contentViewport = document.querySelector('.content-viewport');

    const glider = document.getElementById('nav-glider');
    navContainer.innerHTML = '';
    navContainer.appendChild(glider);

    contentViewport.innerHTML = '<p id="loading-text" style="text-align:center; margin-top:50px; color:#aaa; display:none;">Loading Configuration...</p>';

    SETTINGS_CONFIG.forEach((tab, index) => {

        const btn = document.createElement('button');
        btn.className = 'nav-item';
        btn.innerText = tab.name;
        btn.dataset.target = tab.id;
        btn.onclick = function () { switchTab(this, tab.id); };
        navContainer.appendChild(btn);

        const pane = document.createElement('div');
        pane.id = tab.id;
        pane.className = 'tab-pane';

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
            case 'chatbotList':
                html += renderChatbotList(item.key);
                break;
            default:
                console.warn("Unknown setting type:", item.type);
        }
    });
    return html;
}

function renderCommandList() {
    if (GLOBAL_COMMANDS.length === 0) {
        return `<p style="color:#72767d;">No commands found or bot failed to send list.</p>`;
    }

    const root = { children: {} };

    GLOBAL_COMMANDS.forEach(cmd => {
        const parts = cmd.name.trim().split(/\s+/);
        let current = root;
        parts.forEach((part, index) => {
            if (!current.children[part]) {
                current.children[part] = { children: {} };
            }
            current = current.children[part];

            if (index === parts.length - 1) {
                current.command = cmd;
            }
        });
    });

    const topLevelLeaves = [];
    const topLevelGroups = [];

    Object.keys(root.children).sort().forEach(key => {
        const node = root.children[key];

        if (Object.keys(node.children).length > 0) {
            topLevelGroups.push({ key, node });
        } else {

            if (node.command) {
                topLevelLeaves.push(node.command);
            }
        }
    });

    let html = '';

    if (topLevelLeaves.length > 0) {
        html += `<div class="commands-grid" style="width:100%;">`;
        topLevelLeaves.forEach(cmd => {
            html += renderCommandCard(cmd);
        });
        html += `</div>`;
    }

    if (topLevelGroups.length > 0) {
        html += `<div class="command-groups-container" style="display:flex; flex-direction:column; gap:8px; margin-top:20px; width:100%;">`;
        topLevelGroups.forEach(({ key, node }) => {
            html += renderCommandGroup(key, node);
        });
        html += `</div>`;
    }

    return html;
}

function renderCommandCard(cmd) {
    const baseKey = getCommandKey(cmd.name);
    const permKey = `${cmd.name.trim()}_permissions`;
    const oldKey = `${baseKey}_enabled`;

    let isEnabled = true;
    let rawPerms = (GLOBAL_SETTINGS.permissions && GLOBAL_SETTINGS.permissions[permKey])
        ? GLOBAL_SETTINGS.permissions[permKey]
        : GLOBAL_SETTINGS[permKey];

    if (rawPerms !== undefined) {
        isEnabled = toBoolean(rawPerms.enabled);
    } else if (GLOBAL_SETTINGS[oldKey] !== undefined) {
        isEnabled = toBoolean(GLOBAL_SETTINGS[oldKey]);
    }

    return `
    <div class="command-card" style="display:flex; flex-direction:column; align-items:flex-start; gap:8px; width:100%;">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
            <span style="font-weight:bold; color:#fff; font-family:monospace; font-size:1.1rem;">/${escapeForHtml(cmd.name)}</span>
            <div class="command-controls">
                <button class="command-settings-btn" onclick="openCommandSettings('${cmd.name}')" title="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
                <label class="switch">
                    <input type="checkbox" id="${oldKey}" ${isEnabled ? 'checked' : ''} onchange="markDirty()">
                    <span class="slider"></span>
                </label>
            </div>
        </div>
        <span style="font-size:0.8rem; color:#b9bbbe; line-height:1.3;">${escapeForHtml(cmd.description)}</span>
    </div>`;
}

function openCommandSettings(cmdName) {
    const permKey = `${cmdName.trim()}_permissions`;
    const baseKey = getCommandKey(cmdName);
    const oldKey = `${baseKey}_enabled`;

    // Robustly retrieve settings. Bots use spaces for permissions keys and dots for enabled keys.
    // Also, permissions are often nested under a 'permissions' object in settings.
    let rawSettings = (GLOBAL_SETTINGS.permissions && GLOBAL_SETTINGS.permissions[permKey])
        ? GLOBAL_SETTINGS.permissions[permKey]
        : GLOBAL_SETTINGS[permKey];

    if (typeof rawSettings === 'string') {
        try { rawSettings = JSON.parse(rawSettings); } catch (e) { rawSettings = {}; }
    }
    rawSettings = rawSettings || {};

    const toggle = document.getElementById(oldKey);
    const settings = {
        roles: Array.isArray(rawSettings.roles) ? rawSettings.roles : [],
        permissions: Array.isArray(rawSettings.permissions) ? rawSettings.permissions : [],
        enabled: toggle ? toggle.checked : (rawSettings.enabled !== undefined ? toBoolean(rawSettings.enabled) : true)
    };

    const validPermissions = [
        "administrator", "manage_guild", "manage_roles", "manage_channels",
        "manage_messages", "manage_webhooks", "manage_nicknames",
        "send_messages", "create_polls", "mention_everyone",
        "view_audit_log", "kick_members", "ban_members"
    ];

    const overlay = document.createElement('div');
    overlay.id = 'command-settings-modal';
    overlay.className = 'modal show';
    overlay.style.zIndex = '10001';

    let rolesHtml = GLOBAL_ROLES.map(role => `
        <label class="checkbox-item" style="display:flex; align-items:center; gap:8px; margin-bottom:5px; cursor:pointer;">
            <input type="checkbox" class="role-chk" value="${role.id}" ${settings.roles.includes(role.id) ? 'checked' : ''}>
            <span style="color:${role.color ? '#' + role.color.toString(16).padStart(6, '0') : '#fff'}">${escapeForHtml(role.name)}</span>
        </label>
    `).join('');

    let permsHtml = validPermissions.map(perm => `
        <label class="checkbox-item" style="display:flex; align-items:center; gap:8px; margin-bottom:5px; cursor:pointer;">
            <input type="checkbox" class="perm-chk" value="${perm}" ${settings.permissions.includes(perm) ? 'checked' : ''}>
            <span>${perm.replace(/_/g, ' ')}</span>
        </label>
    `).join('');

    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close-btn" onclick="closeCommandSettings()">&times;</span>
            <h3>Settings for /${cmdName}</h3>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <div>
                    <label class="form-label">Required Roles</label>
                    <div style="max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px;">
                        ${rolesHtml || '<p style="color:#72767d; font-size:0.8rem;">No roles available.</p>'}
                    </div>
                    <p style="font-size: 0.75rem; color: #72767d; margin-top:5px;">User must have AT LEAST ONE role (if any selected).</p>
                </div>
                <div>
                    <label class="form-label">Required Permissions</label>
                    <div style="max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px;">
                        ${permsHtml}
                    </div>
                    <p style="font-size: 0.75rem; color: #72767d; margin-top:5px;">User must have ALL selected permissions.</p>
                </div>
            </div>

            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
                <button type="button" class="dict-add-btn" style="background:#4f545c; width:auto;" onclick="closeCommandSettings()">Cancel</button>
                <button type="button" class="dict-add-btn" style="background:#3ba55c; width:auto;" onclick="saveCommandSettings('${cmdName}')">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.onclick = (e) => { if (e.target === overlay) closeCommandSettings(); };
}

function closeCommandSettings() {
    const modal = document.getElementById('command-settings-modal');
    if (modal) modal.remove();
}

function saveCommandSettings(cmdName) {
    const modal = document.getElementById('command-settings-modal');
    if (!modal) return;

    const roleChks = modal.querySelectorAll('.role-chk:checked');
    const permChks = modal.querySelectorAll('.perm-chk:checked');

    const permKey = `${cmdName.trim()}_permissions`;
    const baseKey = getCommandKey(cmdName);
    const toggle = document.getElementById(`${baseKey}_enabled`);

    const newPermData = {
        roles: Array.from(roleChks).map(c => c.value),
        permissions: Array.from(permChks).map(c => c.value),
        enabled: toggle ? toggle.checked : true
    };

    // Store in both places to satisfy all possible lookup logic
    if (!GLOBAL_SETTINGS.permissions) GLOBAL_SETTINGS.permissions = {};
    GLOBAL_SETTINGS.permissions[permKey] = newPermData;
    GLOBAL_SETTINGS[permKey] = newPermData;

    closeCommandSettings();
    markDirty();
}

function renderCommandGroup(groupName, node, prefix = "") {
    const fullPath = prefix ? prefix + " " + groupName : groupName;
    let innerHtml = '';

    if (node.command) {
        innerHtml += renderCommandCard(node.command);
    }

    const childKeys = Object.keys(node.children).sort();
    if (childKeys.length > 0) {

        if (node.command) {
            innerHtml += `<div style="height:10px;"></div>`;
        }

        childKeys.forEach(childKey => {
            const childNode = node.children[childKey];
            const hasGrandChildren = Object.keys(childNode.children).length > 0;

            if (hasGrandChildren) {

                innerHtml += renderCommandGroup(childKey, childNode, fullPath);
            } else if (childNode.command) {

                innerHtml += renderCommandCard(childNode.command);
            }
        });
    }

    const count = (node.command ? 1 : 0) + Object.keys(node.children).length;

    return `
    <details class="command-group" ${node.command ? '' : ''}> 
        <summary class="command-group-header">
            <div class="summary-inner">
                <span style="flex-grow: 1;">/${escapeForHtml(groupName)}</span>
                <button type="button" class="command-settings-btn" onclick="event.preventDefault(); openGroupSettings('${fullPath}')" title="Group Settings" style="margin-right: 10px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            </div>
        </summary>
        <div class="command-group-content">
            ${innerHtml}
        </div>
    </details>`;
}

function openGroupSettings(fullPath) {
    // Find all commands that fall under this path
    const relatedCommands = GLOBAL_COMMANDS.filter(cmd => cmd.name === fullPath || cmd.name.startsWith(fullPath + ' '));
    const sampleCmd = relatedCommands[0];
    const permKey = sampleCmd ? `${sampleCmd.name.trim()}_permissions` : '';
    const baseKey = sampleCmd ? getCommandKey(sampleCmd.name) : '';

    let rawSettings = (sampleCmd && GLOBAL_SETTINGS.permissions && GLOBAL_SETTINGS.permissions[permKey])
        ? GLOBAL_SETTINGS.permissions[permKey]
        : ((sampleCmd && GLOBAL_SETTINGS[permKey]) ? GLOBAL_SETTINGS[permKey] : { roles: [], permissions: [], enabled: true });

    if (typeof rawSettings === 'string') {
        try { rawSettings = JSON.parse(rawSettings); } catch (e) { rawSettings = {}; }
    }
    rawSettings = rawSettings || {};

    const settings = {
        roles: Array.isArray(rawSettings.roles) ? rawSettings.roles : [],
        permissions: Array.isArray(rawSettings.permissions) ? rawSettings.permissions : [],
        enabled: rawSettings.enabled !== undefined ? toBoolean(rawSettings.enabled) : true
    };

    const validPermissions = [
        "administrator", "manage_guild", "manage_roles", "manage_channels",
        "manage_messages", "manage_webhooks", "manage_nicknames",
        "send_messages", "create_polls", "mention_everyone",
        "view_audit_log", "kick_members", "ban_members"
    ];

    const overlay = document.createElement('div');
    overlay.id = 'group-settings-modal';
    overlay.className = 'modal show';
    overlay.style.zIndex = '10001';

    let rolesHtml = GLOBAL_ROLES.map(role => `
        <label class="checkbox-item" style="display:flex; align-items:center; gap:8px; margin-bottom:5px; cursor:pointer;">
            <input type="checkbox" class="role-chk" value="${role.id}" ${settings.roles.includes(role.id) ? 'checked' : ''}>
            <span style="color:${role.color ? '#' + role.color.toString(16).padStart(6, '0') : '#fff'}">${escapeForHtml(role.name)}</span>
        </label>
    `).join('');

    let permsHtml = validPermissions.map(perm => `
        <label class="checkbox-item" style="display:flex; align-items:center; gap:8px; margin-bottom:5px; cursor:pointer;">
            <input type="checkbox" class="perm-chk" value="${perm}" ${settings.permissions.includes(perm) ? 'checked' : ''}>
            <span>${perm.replace(/_/g, ' ')}</span>
        </label>
    `).join('');

    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close-btn" onclick="closeGroupSettings()">&times;</span>
            <div style="margin-bottom: 25px;">
                <h2 style="margin: 0 0 5px 0; font-size: 1.6rem; font-weight: 800; text-transform: uppercase;">Bulk Update</h2>
                <p style="color: #ccc; margin: 0; font-size: 1.1rem;">This will apply to EVERY command under <span style="font-family: monospace; background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 3px;">/${fullPath}</span></p>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <div>
                    <label class="form-label">Required Roles</label>
                    <div style="max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px;">
                        ${rolesHtml || '<p style="color:#72767d; font-size:0.8rem;">No roles available.</p>'}
                    </div>
                </div>
                <div>
                    <label class="form-label">Required Permissions</label>
                    <div style="max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px;">
                        ${permsHtml}
                    </div>
                </div>
            </div>

            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
                <button type="button" class="dict-add-btn" style="background:#4f545c; width:auto;" onclick="closeGroupSettings()">Cancel</button>
                <button type="button" class="dict-add-btn" style="background:#ed4245; width:auto;" onclick="saveGroupSettings('${fullPath}')">Apply to All</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.onclick = (e) => { if (e.target === overlay) closeGroupSettings(); };
}

function closeGroupSettings() {
    const modal = document.getElementById('group-settings-modal');
    if (modal) modal.remove();
}

function saveGroupSettings(groupName) {
    const modal = document.getElementById('group-settings-modal');
    if (!modal) return;

    const roleChks = modal.querySelectorAll('.role-chk:checked');
    const permChks = modal.querySelectorAll('.perm-chk:checked');

    const roles = Array.from(roleChks).map(c => c.value);
    const perms = Array.from(permChks).map(c => c.value);

    // Apply to all commands starting with this group name
    GLOBAL_COMMANDS.forEach(cmd => {
        if (cmd.name === groupName || cmd.name.startsWith(groupName + ' ')) {
            const permKey = `${cmd.name.trim()}_permissions`;
            const baseKey = getCommandKey(cmd.name);
            const oldKey = `${baseKey}_enabled`;
            const cBox = document.getElementById(oldKey);

            const newPermData = {
                roles: [...roles],
                permissions: [...perms],
                enabled: cBox ? cBox.checked : true
            };

            if (!GLOBAL_SETTINGS.permissions) GLOBAL_SETTINGS.permissions = {};
            GLOBAL_SETTINGS.permissions[permKey] = newPermData;
            GLOBAL_SETTINGS[permKey] = newPermData; // Duplicate for backup
        }
    });

    closeGroupSettings();
    markDirty();
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

function toBoolean(val) {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === '1';
    }
    return Boolean(val);
}

function escapeForHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

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

function createHelpIcon(helpText) {
    if (!helpText) return '';

    const linkifiedText = escapeForHtml(helpText).replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

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
        <button type="button" class="dict-add-btn" style="clear:both;" onclick="addDictRow('${id}', '${escapeForHtml(keyPh)}', '${escapeForHtml(valPh)}', '${keyOnlyAttr}', '${valOnlyAttr}')">
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            </button>
        </div>
    </div>`;
}

function addDictRow(dictId, keyPh, valPh, keyOnly, valueOnly) {
    const container = document.getElementById(`dict-rows-${dictId}`);
    const idx = container.querySelectorAll('.dict-row').length;
    const rowHtml = createDictRow(dictId, idx, '', '', keyPh, valPh, keyOnly, valueOnly);
    container.insertAdjacentHTML('beforeend', rowHtml);

    const newRow = container.lastElementChild;
    if (keyOnly) applyInputRestriction(newRow.querySelector('.dict-key'), keyOnly);
    if (valueOnly) applyInputRestriction(newRow.querySelector('.dict-value'), valueOnly);
    markDirty();
}

function removeDictRow(btn) {
    const row = btn.closest('.dict-row');
    if (row) row.remove();
    markDirty();
}

function createNamedContentList(id, label, dataList, help) {
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

    checkNamedContentListLimit(id);
    markDirty();
}

function removeNamedContentListRow(btn) {
    const row = btn.closest('.ncl-row');
    const container = row.closest('.ncl-container');
    const id = container.getAttribute('data-ncl-id');

    if (row) row.remove();
    checkNamedContentListLimit(id);
    markDirty();
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
    const isWelcome = key === 'welcome_message';
    const modalTitle = isWelcome ? 'Welcome Messages' : 'Goodbye Messages';

    const validInteractions = isWelcome
        ? ['bot_joined', 'member_joined', 'member_returned']
        : ['bot_left', 'member_left'];

    const interactionLabels = {
        'bot_joined': 'Bot Joined',
        'bot_left': 'Bot Left',
        'member_joined': 'Member Joined',
        'member_left': 'Member Left',
        'member_returned': 'Member Returned'
    };

    const retention = GLOBAL_SETTINGS.member_history_retention_days || 30;
    const allDefs = GLOBAL_SETTINGS.welcome_goodbye_definitions || {};
    const allInts = GLOBAL_SETTINGS.welcome_goodbye_interactions || {};

    let loadedDefinitions = [];
    Object.keys(allDefs).forEach(defId => {
        const intTypes = allInts[defId] || [];
        const belongsToMode = intTypes.some(type => validInteractions.includes(type));
        if (belongsToMode) {
            loadedDefinitions.push({
                id: defId,
                ...allDefs[defId],
                interactions: intTypes
            });
        }
    });

    if (loadedDefinitions.length === 0 && GLOBAL_SETTINGS[key]) {
        const legacy = GLOBAL_SETTINGS[key];
        if (legacy.content || (legacy.embeds && legacy.embeds.length > 0)) {

            const allIds = Object.keys(allDefs).map(id => parseInt(id)).filter(id => !isNaN(id));
            const nextId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;

            loadedDefinitions.push({
                id: String(nextId),
                content: legacy.content || '',
                embeds: legacy.embeds || [],
                username: legacy.username,
                avatar_url: legacy.avatar_url,
                interactions: isWelcome ? ['member_joined'] : ['member_left']
            });

            GLOBAL_SETTINGS.welcome_goodbye_definitions = GLOBAL_SETTINGS.welcome_goodbye_definitions || {};
            GLOBAL_SETTINGS.welcome_goodbye_interactions = GLOBAL_SETTINGS.welcome_goodbye_interactions || {};
            GLOBAL_SETTINGS.welcome_goodbye_definitions[String(nextId)] = loadedDefinitions[0];
            GLOBAL_SETTINGS.welcome_goodbye_interactions[String(nextId)] = loadedDefinitions[0].interactions;
        }
    }

    let editorData = {
        definitions: loadedDefinitions,
        retention_days: retention
    };

    const overlay = document.createElement('div');
    overlay.id = 'multi-embed-modal';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'width: 95%; max-width: 900px; max-height: 90vh; background: #36393f; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden;';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #2f3136; border-bottom: 1px solid #202225;';
    header.innerHTML = `
        <h3 style="margin: 0; color: #fff;">${modalTitle}</h3>
        <div style="display: flex; gap: 10px;">
            <button id="save-all-defs" style="padding: 8px 16px; background: #3ba55c; color: #fff; border:none; border-radius: 4px; cursor: pointer; font-weight: 500;">Save All</button>
            <button id="cancel-all-defs" style="padding: 8px 16px; background: #4f545c; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
        </div>
    `;

    const content = document.createElement('div');
    content.id = 'definitions-content';
    content.style.cssText = 'flex: 1; overflow-y: auto; padding: 20px;';

    modal.appendChild(header);
    modal.appendChild(content);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.dataset.editorKey = key;
    overlay.dataset.editorData = JSON.stringify(editorData);

    refreshDefinitionsList();

    document.getElementById('save-all-defs').onclick = () => saveAllDefinitions(key);
    document.getElementById('cancel-all-defs').onclick = () => closeMultiEmbedModal();
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMultiEmbedModal(); });
}

function closeMultiEmbedModal() {
    const modal = document.getElementById('multi-embed-modal');
    if (modal) modal.remove();
}

function refreshDefinitionsList() {
    const modal = document.getElementById('multi-embed-modal');
    if (!modal) return;
    const data = JSON.parse(modal.dataset.editorData);
    const contentDiv = document.getElementById('definitions-content');
    const key = modal.dataset.editorKey;

    const isWelcome = key === 'welcome_message';
    const validInteractions = isWelcome
        ? ['bot_joined', 'member_joined', 'member_returned']
        : ['bot_left', 'member_left'];
    const interactionLabels = {
        'bot_joined': 'Bot Joined',
        'bot_left': 'Bot Left',
        'member_joined': 'Member Joined',
        'member_left': 'Member Left',
        'member_returned': 'Member Returned'
    };

    let html = '';
    data.definitions.forEach((def, index) => {
        html += createDefinitionEditorSimple(def, index, validInteractions, interactionLabels);
    });

    html += `<button type="button" class="dict-add-btn" onclick="addNewDefinition()" style="margin-bottom: 20px;">+ Add Another Message</button>`;
    html += `
    <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; margin-top: 10px;">
        <label style="display: block; color: #b9bbbe; font-weight: 600; margin-bottom: 8px;">Member History Retention</label>
        <p style="font-size: 0.85rem; color: #72767d; margin-bottom: 10px;">Members who left more than this many days ago won't trigger 'member returned' messages</p>
        <div style="display: flex; align-items: center; gap: 15px;">
            <input type="range" id="retention-slider" class="styled-slider" min="30" max="120" step="10" value="${data.retention_days}" 
                   oninput="document.getElementById('retention-value').textContent = this.value">
            <span id="retention-value" style="min-width: 40px; color: #fff; font-weight: 600;">${data.retention_days}</span>
            <span style="color: #72767d; font-size: 0.85rem;">days</span>
        </div>
    </div>`;

    contentDiv.innerHTML = html;
}

function toggleInteractionSwitch(cb) {
    const modal = document.getElementById('multi-embed-modal');
    const data = JSON.parse(modal.dataset.editorData);
    const defIndex = parseInt(cb.dataset.defIndex);
    const interaction = cb.dataset.interaction;

    if (cb.checked) {
        data.definitions.forEach((def, idx) => {
            if (idx === defIndex) {
                if (!def.interactions) def.interactions = [];
                if (!def.interactions.includes(interaction)) def.interactions.push(interaction);
            } else if (def.interactions) {
                def.interactions = def.interactions.filter(i => i !== interaction);
            }
        });
    } else {
        if (data.definitions[defIndex].interactions) {
            data.definitions[defIndex].interactions = data.definitions[defIndex].interactions.filter(i => i !== interaction);
        }
    }

    modal.dataset.editorData = JSON.stringify(data);
    refreshDefinitionsList();
}

function addNewDefinition() {
    const modal = document.getElementById('multi-embed-modal');
    const data = JSON.parse(modal.dataset.editorData);

    const existingDefs = GLOBAL_SETTINGS.welcome_goodbye_definitions || {};
    const existingIds = Object.keys(existingDefs).map(id => parseInt(id)).filter(id => !isNaN(id));
    const currentEditorIds = data.definitions.map(d => parseInt(d.id)).filter(id => !isNaN(id));
    const allIds = [...existingIds, ...currentEditorIds];
    const nextId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;

    const newDef = { id: String(nextId), content: '', interactions: [] };
    data.definitions.push(newDef);
    modal.dataset.editorData = JSON.stringify(data);
    refreshDefinitionsList();
}

function removeDefinition(index) {
    showDeleteConfirmation(() => {
        const modal = document.getElementById('multi-embed-modal');
        const data = JSON.parse(modal.dataset.editorData);
        data.definitions.splice(index, 1);
        modal.dataset.editorData = JSON.stringify(data);
        refreshDefinitionsList();
    });
}

function showDeleteConfirmation(onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-modal-overlay';
    overlay.innerHTML = `
        <div class="confirm-modal-content">
            <div class="confirm-modal-header">Delete Message?</div>
            <div class="confirm-modal-body">Are you sure you want to delete this message definition? This action cannot be undone.</div>
            <div class="confirm-modal-footer">
                <button class="confirm-btn-cancel">Cancel</button>
                <button class="confirm-btn-delete">Delete</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    const close = () => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 150); };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.confirm-btn-cancel').onclick = close;
    overlay.querySelector('.confirm-btn-delete').onclick = () => { onConfirm(); close(); };
}

function createDefinitionEditorSimple(def, index, validInteractions, interactionLabels) {
    const content = def.content || '';
    const hasEmbed = def.embeds && def.embeds.length > 0;
    const hasMessage = content.trim().length > 0 || hasEmbed;
    const interactions = def.interactions || [];

    let switches = '';
    validInteractions.forEach(intType => {
        const isOn = interactions.includes(intType);
        switches += `
        <label class="interaction-switch">
            <span>${interactionLabels[intType]}</span>
            <label class="switch" style="margin-left: 8px;">
                <input type="checkbox" class="interaction-toggle" data-def-index="${index}" data-interaction="${intType}" ${isOn ? 'checked' : ''} onchange="toggleInteractionSwitch(this)">
                <span class="slider"></span>
            </label>
        </label>`;
    });

    let preview = hasMessage ? content.substring(0, 60) + (content.length > 60 ? '...' : '') : 'No message configured';
    if (hasEmbed) preview += (content ? ' + ' : '') + 'Embed';

    return `
    <div class="definition-editor-card" data-def-index="${index}" style="background: #2f3136; border: 1px solid #202225; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="margin: 0; color: #fff;">Definition ${index + 1}</h4>
            <button type="button" class="chatbot-delete-btn" onclick="removeDefinition(${index})" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
        <div class="form-group">
            <button type="button" class="dict-add-btn" onclick="openEmbedEditorForDef(${index})" style="margin: 0; width: 100%;">Configure Message</button>
            <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.15); border-radius: 4px; font-size: 0.85rem; color: ${hasMessage ? '#dcddde' : '#72767d'}; font-style: ${hasMessage ? 'normal' : 'italic'};">
                ${escapeForHtml(preview)}
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Triggers On:</label>
            <div class="interaction-switches-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">${switches}</div>
        </div>
    </div>`;
}

function openEmbedEditorForDef(defIndex) {
    const modal = document.getElementById('multi-embed-modal');
    const data = JSON.parse(modal.dataset.editorData);
    const def = data.definitions[defIndex];

    const overlay = document.createElement('div');
    overlay.id = 'nested-embed-editor';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 11000; display: flex; align-items: center; justify-content: center;';

    const container = document.createElement('div');
    container.style.cssText = 'width: 95%; max-width: 1200px; height: 90%; background: #36393f; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden;';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #2f3136; border-bottom: 1px solid #202225;';
    header.innerHTML = '<h3 style="margin: 0; color: #fff;">Embed Editor</h3><div style="display: flex; gap: 10px;"><button id="save-nested-embed" class="dict-add-btn">Save Embed</button><button id="cancel-nested-embed" style="padding: 8px 16px; background: #4f545c; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Cancel</button></div>';

    const iframe = document.createElement('iframe');
    iframe.src = 'embed_maker.html';
    iframe.style.cssText = 'flex: 1; width: 100%; border: none;';
    container.append(header, iframe);
    overlay.append(container);
    document.body.appendChild(overlay);

    iframe.onload = () => {
        if (iframe.contentWindow.loadEmbedData) {
            iframe.contentWindow.loadEmbedData({ username: def.username, avatar_url: def.avatar_url, content: def.content, embeds: def.embeds });
        }
    };
    document.getElementById('save-nested-embed').onclick = () => {
        if (iframe.contentWindow.getEmbedData) {
            const embedData = iframe.contentWindow.getEmbedData();
            def.content = embedData.content || '';
            def.username = embedData.username;
            def.avatar_url = embedData.avatar_url;
            def.embeds = embedData.embeds || [];
            modal.dataset.editorData = JSON.stringify(data);
            refreshDefinitionsList();
        }
        overlay.remove();
    };
    document.getElementById('cancel-nested-embed').onclick = () => overlay.remove();
}

function saveAllDefinitions(key) {
    const modal = document.getElementById('multi-embed-modal');
    const data = JSON.parse(modal.dataset.editorData);
    const isWelcome = key === 'welcome_message';
    const currentValidInteractions = isWelcome ? ['bot_joined', 'member_joined', 'member_returned'] : ['bot_left', 'member_left'];

    if (!GLOBAL_SETTINGS.welcome_goodbye_definitions) GLOBAL_SETTINGS.welcome_goodbye_definitions = {};
    if (!GLOBAL_SETTINGS.welcome_goodbye_interactions) GLOBAL_SETTINGS.welcome_goodbye_interactions = {};

    Object.keys(GLOBAL_SETTINGS.welcome_goodbye_interactions).forEach(defId => {
        const ints = GLOBAL_SETTINGS.welcome_goodbye_interactions[defId] || [];
        if (ints.some(i => currentValidInteractions.includes(i))) {
            delete GLOBAL_SETTINGS.welcome_goodbye_interactions[defId];
            delete GLOBAL_SETTINGS.welcome_goodbye_definitions[defId];
        }
    });

    data.definitions.forEach(def => {
        if ((def.interactions && def.interactions.length > 0) || def.content || (def.embeds && def.embeds.length > 0)) {
            GLOBAL_SETTINGS.welcome_goodbye_definitions[def.id] = { content: def.content, username: def.username, avatar_url: def.avatar_url, embeds: def.embeds || [] };
            GLOBAL_SETTINGS.welcome_goodbye_interactions[def.id] = def.interactions || [];
        }
    });

    const slider = document.getElementById('retention-slider');
    if (slider) GLOBAL_SETTINGS.member_history_retention_days = parseInt(slider.value);

    const statusEl = document.getElementById(`embed-status-${key}`);
    if (statusEl) {
        statusEl.textContent = data.definitions.length > 0 ? `✓ ${data.definitions.length} definition${data.definitions.length > 1 ? 's' : ''} configured` : 'No definitions set';
        statusEl.style.color = data.definitions.length > 0 ? '#3ba55c' : '#72767d';
    }
    closeMultiEmbedModal();
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

        const group = document.querySelector(`.embed-maker-group[data-embed-key="${key}"]`);
        if (group) {
            const statusEl = group.querySelector('.embed-status');
            if (statusEl) {
                statusEl.textContent = 'No embed set';
                statusEl.style.color = '#72767d';
            }

            const removeBtn = group.querySelector('.dict-remove-btn');
            if (removeBtn) removeBtn.remove();
        }
    }
}

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

async function saveChanges() {
    const sidebarBtn = document.getElementById('btn-save-changes');
    const popupBtn = document.getElementById('btn-popup-save');
    const status = document.getElementById('save-status');
    const serverId = document.getElementById('lbl-server-id').textContent.trim();
    const token = getCookie("auth_token");

    if (!serverId || serverId === "Loading...") return;

    if (sidebarBtn) {
        sidebarBtn.disabled = true;
        sidebarBtn.innerText = "Saving...";
    }
    if (popupBtn) {
        popupBtn.disabled = true;
        popupBtn.innerText = "Saving...";
    }

    status.innerText = "Collecting data...";
    status.style.color = "#aaa";

    try {
        let settingsPayload = {};
        let permissionsPayload = {};

        SETTINGS_CONFIG.forEach(tab => {
            tab.settings.forEach(item => {
                const targetPayload = (item.type === 'commandList') ? permissionsPayload : settingsPayload;

                if (item.type === 'header' || item.type === 'text' || item.type === 'title') return;

                const el = document.getElementById(item.key);

                if (item.type === 'switch') {
                    if (el) targetPayload[item.key] = el.checked;
                }
                else if (item.type === 'select') {
                    if (el) {
                        const val = el.value;
                        if (['regenerate_mode', 'ping_state'].includes(item.key)) {
                            targetPayload[item.key] = parseInt(val);
                        } else {
                            targetPayload[item.key] = val;
                        }
                    }
                }
                else if (item.type === 'textarea') {
                    if (el) {
                        const val = el.value;
                        if (item.join) {
                            targetPayload[item.key] = val.split(item.join.trim()).map(s => s.trim()).filter(s => s.length > 0);
                        } else {
                            targetPayload[item.key] = val;
                        }
                    }
                }
                else if (item.type === 'channelPick') {
                    if (el) {
                        const val = el.value;
                        targetPayload[item.key] = val ? val : null;
                    }
                }
                else if (item.type === 'commandList') {
                    GLOBAL_COMMANDS.forEach(cmd => {
                        const permKey = `${cmd.name.trim()}_permissions`;
                        const baseKey = getCommandKey(cmd.name);
                        const oldKey = `${baseKey}_enabled`;
                        const cBox = document.getElementById(oldKey);

                        if (cBox) {
                            let rawPerms = (GLOBAL_SETTINGS.permissions && GLOBAL_SETTINGS.permissions[permKey])
                                ? GLOBAL_SETTINGS.permissions[permKey]
                                : (GLOBAL_SETTINGS[permKey] || { roles: [], permissions: [], enabled: true });
                            if (typeof rawPerms === 'string') {
                                try { rawPerms = JSON.parse(rawPerms); } catch (e) { rawPerms = { roles: [], permissions: [], enabled: true }; }
                            }

                            const newPermData = {
                                roles: Array.isArray(rawPerms.roles) ? rawPerms.roles : [],
                                permissions: Array.isArray(rawPerms.permissions) ? rawPerms.permissions : [],
                                enabled: cBox.checked
                            };

                            permissionsPayload[permKey] = newPermData;
                            // Also update the old key in settingsPayload for backward compatibility/redundancy
                            settingsPayload[oldKey] = cBox.checked;
                        }
                    });
                }
                else if (item.type === 'supportChannelList') {
                    const chks = document.querySelectorAll(`.support-channel-chk[data-setting-key="${item.key}"]:checked`);
                    targetPayload[item.key] = Array.from(chks).map(cb => cb.value);
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
                        targetPayload[item.key] = dictObj;
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

                            if (name || desc || content) {
                                list.push({
                                    name: name,
                                    description: desc,
                                    skill: content
                                });
                            }
                        });
                        targetPayload[item.key] = list;
                    }
                }
                else if (item.type === 'embedMaker') {
                    if (GLOBAL_SETTINGS[item.key]) {
                        targetPayload[item.key] = GLOBAL_SETTINGS[item.key];
                    }
                }
                else if (item.type === 'chatbotList') {
                    const existingChatbots = GLOBAL_SETTINGS[item.key] || {};
                    const allChatbots = { ...existingChatbots };
                    Object.entries(PENDING_CHATBOTS).forEach(([tempId, botData]) => {
                        allChatbots[tempId] = { ...botData, _pending: true };
                    });
                    targetPayload[item.key] = allChatbots;

                    const sharedMemoryEl = document.getElementById('chatbot_shared_memory');
                    const autoReplyEl = document.getElementById('chatbot_auto_reply_on_name');
                    const historyModeEl = document.getElementById('chatbot_history_mode');

                    targetPayload.chatbot_config = {
                        shared_memory: sharedMemoryEl ? sharedMemoryEl.checked : false,
                        auto_reply_on_name: autoReplyEl ? autoReplyEl.checked : false,
                        history_mode: historyModeEl ? historyModeEl.value : 'ai_only'
                    };
                }
                else if (item.type === 'slider') {
                    const el = document.getElementById(item.key);
                    if (el) {
                        targetPayload[item.key] = parseInt(el.value);
                    }
                }
                else if (item.type === 'interactionDefinitions') {
                    const defKey = item.key;
                    const intKey = item.interactionsKey;
                    if (GLOBAL_SETTINGS[defKey]) targetPayload[defKey] = GLOBAL_SETTINGS[defKey];
                    if (GLOBAL_SETTINGS[intKey]) targetPayload[intKey] = GLOBAL_SETTINGS[intKey];
                }
            });
        });

        if (GLOBAL_SETTINGS.welcome_goodbye_definitions) {
            settingsPayload.welcome_goodbye_definitions = GLOBAL_SETTINGS.welcome_goodbye_definitions;
        }
        if (GLOBAL_SETTINGS.welcome_goodbye_interactions) {
            settingsPayload.welcome_goodbye_interactions = GLOBAL_SETTINGS.welcome_goodbye_interactions;
        }
        if (GLOBAL_SETTINGS.member_history_retention_days) {
            settingsPayload.member_history_retention_days = GLOBAL_SETTINGS.member_history_retention_days;
        }

        const welcomeEnabled = settingsPayload.welcome_enabled_bool !== undefined ? settingsPayload.welcome_enabled_bool : GLOBAL_SETTINGS.welcome_enabled_bool;
        const goodbyeEnabled = settingsPayload.goodbye_enabled_bool !== undefined ? settingsPayload.goodbye_enabled_bool : GLOBAL_SETTINGS.goodbye_enabled_bool;

        if (welcomeEnabled === false) {
            settingsPayload.welcome_messages = false;
            settingsPayload.welcome_enabled = false;
        } else {
            settingsPayload.welcome_enabled = true;
            if (GLOBAL_SETTINGS.welcome_messages === false) {
                settingsPayload.welcome_messages = [];
            } else if (GLOBAL_SETTINGS.welcome_messages) {
                settingsPayload.welcome_messages = GLOBAL_SETTINGS.welcome_messages;
            }
        }

        if (goodbyeEnabled === false) {
            settingsPayload.goodbye_messages = false;
            settingsPayload.goodbye_enabled = false;
        } else {
            settingsPayload.goodbye_enabled = true;
            if (GLOBAL_SETTINGS.goodbye_messages === false) {
                settingsPayload.goodbye_messages = [];
            } else if (GLOBAL_SETTINGS.goodbye_messages) {
                settingsPayload.goodbye_messages = GLOBAL_SETTINGS.goodbye_messages;
            }
        }

        if (settingsPayload.welcome_messages && !Array.isArray(settingsPayload.welcome_messages)) {
            if (typeof settingsPayload.welcome_messages === 'string') {
                settingsPayload.welcome_messages = settingsPayload.welcome_messages.split('|').map(s => s.trim()).filter(s => s.length > 0);
            }
        }
        if (settingsPayload.goodbye_messages && !Array.isArray(settingsPayload.goodbye_messages)) {
            if (typeof settingsPayload.goodbye_messages === 'string') {
                settingsPayload.goodbye_messages = settingsPayload.goodbye_messages.split('|').map(s => s.trim()).filter(s => s.length > 0);
            }
        }

        status.innerText = "Sending to Bot...";
        // Merge permissions into settings for better bot compatibility, while keeping the separate key as well
        const mergedSettings = { ...settingsPayload, ...permissionsPayload };
        const bodyData = { serverid: serverId, settings: mergedSettings, permissions: permissionsPayload };

        const response = await fetch(`${WORKER}/update-settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            status.innerText = "Saved Successfully!";
            status.style.color = "#4fdc7b";
            Object.assign(GLOBAL_SETTINGS, settingsPayload, permissionsPayload);
            PENDING_CHATBOTS = {};
            refreshChatbotGrid();
            hideDirtyPopup();
        } else {
            throw new Error("Worker rejected update");
        }
    } catch (e) {
        console.error(e);
        status.innerText = "Save Failed: " + e.message;
        status.style.color = "#ed4245";
    } finally {
        if (sidebarBtn) {
            sidebarBtn.disabled = false;
            sidebarBtn.innerText = "Save Changes";
        }
        if (popupBtn) {
            popupBtn.disabled = false;
            popupBtn.innerText = "Save Changes";
        }
    }
}

function saveEmbedFromModal(key) {
    const iframe = document.getElementById('embed-maker-iframe');
    if (iframe && iframe.contentWindow.getEmbedData) {
        const embedData = iframe.contentWindow.getEmbedData();
        GLOBAL_SETTINGS[key] = embedData;
        const statusEl = document.getElementById(`embed-status-${key}`);
        if (statusEl) {
            const hasEmbed = embedData && Object.keys(embedData).length > 0;
            statusEl.textContent = hasEmbed ? '✓ Embed configured' : 'No embed set';
            statusEl.style.color = hasEmbed ? '#3ba55c' : '#72767d';
        }
        closeEmbedMaker();
        markDirty();
    }
}

function clearEmbed(key) {
    if (confirm('Remove this embed?')) {
        GLOBAL_SETTINGS[key] = null;
        const group = document.querySelector(`.embed-maker-group[data-embed-key="${key}"]`);
        if (group) {
            const statusEl = group.querySelector('.embed-status');
            if (statusEl) {
                statusEl.textContent = 'No embed set';
                statusEl.style.color = '#72767d';
            }
            const removeBtn = group.querySelector('.dict-remove-btn');
            if (removeBtn) removeBtn.remove();
        }
        markDirty();
    }
}

function closeEmbedMaker() {
    const modal = document.getElementById('embed-maker-modal');
    if (modal) modal.remove();
}

function handleAuthClick() { openLogout(); }
function logout() { document.cookie = "auth_token=;path=/;max-age=0"; window.location.href = "index.html"; }
function openLogout() { document.getElementById('loginbtn').classList.add('expanded'); document.getElementById('logOutContainer').classList.add('active'); }
function closeLogout() { document.getElementById('loginbtn').classList.remove('expanded'); document.getElementById('logOutContainer').classList.remove('active'); }
function goBack() { window.location.href = "index.html"; }

let cachedServers = null;
async function fetchServersForGrid(gridEl) {
    if (cachedServers) { renderSwitcherGrid(gridEl, cachedServers); return; }
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
    } catch (e) { gridEl.innerHTML = '<p style="color:#ed4245; padding:5px;">Error loading.</p>'; }
}

function renderSwitcherGrid(el, list) {
    const urlParams = new URLSearchParams(window.location.search);
    const currId = urlParams.get('id');
    const currName = urlParams.get('name');
    const currIcon = urlParams.get('icon');
    const others = (list || []).filter(s => s.id !== currId);
    const currentServer = { id: currId, name: currName, picture_url: currIcon, type: 'current' };
    const homeCard = { name: "Homepage", picture_url: "https://cdn-icons-png.flaticon.com/512/25/25694.png", type: 'special', action: "window.location.href='index.html'" };
    const addCard = { name: "Add to server", picture_url: "https://cdn.discordapp.com/avatars/1371513819104415804/9e038eeb716c24ece29276422b52cc80.webp?size=320", type: 'special', action: "window.location.href='https://discord.com/oauth2/authorize?client_id=1371513819104415804&permissions=2815042428980240&integration_type=0&scope=bot+applications.commands'" };
    const fullList = [currentServer, ...others, homeCard, addCard];
    const defaultIcon = "https://cdn.discordapp.com/embed/avatars/0.png";

    el.innerHTML = fullList.map((s, i) => {
        const isCurrent = s.type === 'current';
        const isSpecial = s.type === 'special';
        const safeName = s.name ? decodeURIComponent(s.name).replace(/"/g, '&quot;') : "Unknown";
        const safeIcon = (s.picture_url || defaultIcon).replace(/"/g, '&quot;');
        let clickAction = isCurrent ? "window.location.href='index.html'" : (isSpecial ? s.action : `window.location.href='manage.html?${new URLSearchParams({ ...Object.fromEntries(urlParams), id: s.id, name: s.name, icon: s.picture_url || defaultIcon }).toString()}'`);
        let cardStyle = `cursor:pointer; width:100%; box-sizing:border-box; ${isCurrent ? 'border: 1px solid #5865F2;' : ''}`;
        let imgStyle = s.name === 'Add to server' ? 'background-color: #5865F2; padding: 2px;' : (s.name === 'Homepage' ? 'background-color: #ffffff; padding: 4px; border-radius: 50%;' : '');
        return `<div class="server-card ${i > 0 ? 'server-card-pop' : ''}" onclick="${clickAction}" style="${cardStyle} ${i > 0 ? `animation-delay: ${i * 0.05}s;` : ''}"><img src="${safeIcon}" class="server-avatar" style="${imgStyle}"><span>${safeName}</span></div>`;
    }).join('');
}

let PENDING_CHATBOTS = {};
function renderChatbotList(key) {
    const chatbots = GLOBAL_SETTINGS[key] || {};
    let cards = Object.entries(chatbots).map(([id, data]) => createChatbotCard(id, data)).join('') + Object.entries(PENDING_CHATBOTS).map(([id, data]) => createChatbotCard(id, data, true)).join('');
    return `<div class="chatbot-list-container" data-chatbot-key="${key}"><div class="chatbot-grid" id="chatbot-grid-${key}">${cards || '<p style="color:#72767d; font-style:italic;">No chatbots configured yet.</p>'}</div><button type="button" class="dict-add-btn" onclick="openChatbotModal()" style="margin-top: 15px;">+ Create Chatbot</button></div>`;
}

function createChatbotCard(roleId, botData, isPending = false) {
    const name = escapeForHtml(botData.name || 'Unnamed Bot');
    const prompt = escapeForHtml((botData.system_prompt || '').substring(0, 100));
    const avatarUrl = botData.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png';
    return `<div class="chatbot-card" data-role-id="${roleId}" data-pending="${isPending}"><div class="chatbot-card-header"><img src="${avatarUrl}" class="chatbot-avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'"><div class="chatbot-info"><div class="chatbot-name">${name} ${botData.nsfw ? '<span class="nsfw-badge">18+</span>' : ''} ${isPending ? '<span class="new-badge">NEW</span>' : ''}</div>${isPending ? '' : `<span class="role-id">Role ID: ${roleId}</span>`}</div><div class="chatbot-actions"><button type="button" class="chatbot-edit-btn" onclick="openChatbotModal('${roleId}', ${isPending})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button><button type="button" class="chatbot-delete-btn" onclick="deleteChatbot('${roleId}', ${isPending})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div></div><div class="chatbot-prompt">${prompt}${prompt.length >= 100 ? '...' : ''}</div></div>`;
}

function openChatbotModal(roleId = null, isPending = false) {
    const editing = roleId !== null;
    const data = editing ? (isPending ? PENDING_CHATBOTS[roleId] : (GLOBAL_SETTINGS.chatbots || {})[roleId]) : {};
    const overlay = document.createElement('div');
    overlay.id = 'chatbot-modal'; overlay.className = 'modal show';
    overlay.innerHTML = `<div class="modal-content" style="max-width: 500px;"><span class="close-btn" onclick="closeChatbotModal()">&times;</span><h3>${editing ? 'Edit' : 'Create'} Chatbot</h3><div class="form-group"><label class="form-label">Bot Name</label><input type="text" id="chatbot-name" class="styled-input" value="${escapeForHtml(data.name || '')}" maxlength="50"></div><div class="form-group"><label class="form-label">System Prompt</label><textarea id="chatbot-prompt" class="styled-textarea" style="min-height:120px;" maxlength="4000">${escapeForHtml(data.system_prompt || '')}</textarea><div class="char-count"><span id="chatbot-prompt-count">${(data.system_prompt || '').length}</span>/4000</div></div><div class="form-group"><label class="form-label">Avatar URL (optional)</label><input type="text" id="chatbot-avatar" class="styled-input" value="${escapeForHtml(data.avatar_url || '')}"></div><div class="toggle-wrapper"><div class="toggle-label-group"><span class="form-label">NSFW Mode</span><span class="form-sublabel">Bypass restrictions (18+ channels only)</span></div><label class="switch"><input type="checkbox" id="chatbot-nsfw" ${data.nsfw ? 'checked' : ''}><span class="slider"></span></label></div><div style="display:flex; gap:10px; justify-content:flex-end;"><button type="button" class="dict-add-btn" style="background:#4f545c; width:auto;" onclick="closeChatbotModal()">Cancel</button><button type="button" class="dict-add-btn" style="background:#3ba55c; width:auto;" onclick="saveChatbot('${roleId || ''}', ${isPending})">${editing ? 'Save' : 'Create'}</button></div></div>`;
    document.body.appendChild(overlay);
    document.getElementById('chatbot-prompt').oninput = function () { document.getElementById('chatbot-prompt-count').textContent = this.value.length; };
    overlay.onclick = (e) => { if (e.target === overlay) closeChatbotModal(); };
}

function closeChatbotModal() { const m = document.getElementById('chatbot-modal'); if (m) m.remove(); }

function saveChatbot(id, pending) {
    const name = document.getElementById('chatbot-name').value.trim();
    const prompt = document.getElementById('chatbot-prompt').value.trim();
    const avatar = document.getElementById('chatbot-avatar').value.trim();
    const nsfw = document.getElementById('chatbot-nsfw').checked;
    if (!name || !prompt) { alert('Name and prompt required'); return; }
    const bot = { name, system_prompt: prompt, nsfw };
    if (avatar) bot.avatar_url = avatar;
    if (id) { if (pending) PENDING_CHATBOTS[id] = bot; else { if (!GLOBAL_SETTINGS.chatbots) GLOBAL_SETTINGS.chatbots = {}; GLOBAL_SETTINGS.chatbots[id] = bot; } }
    else { PENDING_CHATBOTS['new_' + Date.now()] = { ...bot, _pending: true }; }
    closeChatbotModal(); refreshChatbotGrid();
    markDirty();
}

function deleteChatbot(id, pending) {
    if (!confirm(pending ? 'Remove pending chatbot?' : 'Delete chatbot?')) return;
    if (pending) delete PENDING_CHATBOTS[id]; else if (GLOBAL_SETTINGS.chatbots) delete GLOBAL_SETTINGS.chatbots[id];
    refreshChatbotGrid();
    markDirty();
}

function refreshChatbotGrid() {
    const c = document.querySelector('.chatbot-list-container'); if (!c) return;
    const key = c.dataset.chatbotKey;
    const grid = document.getElementById(`chatbot-grid-${key}`);
    const cards = Object.entries(GLOBAL_SETTINGS[key] || {}).map(([id, d]) => createChatbotCard(id, d)).join('') + Object.entries(PENDING_CHATBOTS).map(([id, d]) => createChatbotCard(id, d, true)).join('');
    if (grid) grid.innerHTML = cards || '<p style="color:#72767d; font-style:italic;">No chatbots configured yet.</p>';
}

let currentEmojiTarget = null; let emojiModal = null;
function openEmojiPicker(btn) { currentEmojiTarget = btn.previousElementSibling; if (!emojiModal) createEmojiModal(); renderEmojiContent(); emojiModal.classList.add('show'); }
function createEmojiModal() {
    emojiModal = document.createElement('div'); emojiModal.id = 'emoji-modal'; emojiModal.className = 'modal';
    emojiModal.innerHTML = `<div class="modal-content emoji-modal-content"><span class="close-btn" onclick="closeEmojiModal()">&times;</span><h3>Select Emoji</h3><input type="text" id="emoji-search" class="styled-input" placeholder="Search emojis..."><div id="emoji-grid-container" class="emoji-grid-container"></div></div>`;
    document.body.appendChild(emojiModal);
    document.getElementById('emoji-search').oninput = (e) => renderEmojiContent(e.target.value.toLowerCase());
    emojiModal.onclick = (e) => { if (e.target === emojiModal) closeEmojiModal(); };
}
function closeEmojiModal() { if (emojiModal) emojiModal.classList.remove('show'); currentEmojiTarget = null; const s = document.getElementById('emoji-search'); if (s) s.value = ""; }
function renderEmojiContent(filter = "") {
    const c = document.getElementById('emoji-grid-container'); if (!c) return;
    let html = "";
    const custom = GLOBAL_EMOJIS.custom.filter(e => !filter || e.name.toLowerCase().includes(filter));
    if (custom.length) {
        html += `<div class="emoji-category-title">Server Emojis</div><div class="emoji-grid">`;
        custom.forEach(e => { html += `<div class="emoji-item" onclick="insertEmoji('${e.animated ? '<a:' : '<:'}${e.name}:${e.id}>')"><img src="${e.url}" title="${e.name}"></div>`; });
        html += `</div>`;
    }
    for (const [cat, emojis] of Object.entries(UNICODE_EMOJIS)) {
        let filtered = emojis.filter(e => !filter || (EMOJI_KEYWORDS[e] || "").toLowerCase().includes(filter));
        if (!filtered.length) continue;
        html += `<div class="emoji-category-title">${cat}</div><div class="emoji-grid">`;
        filtered.forEach(e => { html += `<div class="emoji-item" onclick="insertEmoji('${e}')"><img src="${getTwemojiUrl(e)}" alt="${e}" onerror="this.outerHTML='${e}'"></div>`; });
        html += `</div>`;
    }
    c.innerHTML = html || `<p style="color:#aaa; text-align:center; margin-top:20px;">No emojis match your search.</p>`;
}
function insertEmoji(val) {
    if (currentEmojiTarget) {
        const s = currentEmojiTarget.selectionStart, e = currentEmojiTarget.selectionEnd, t = currentEmojiTarget.value;
        currentEmojiTarget.value = t.substring(0, s) + val + t.substring(e);
        currentEmojiTarget.selectionStart = currentEmojiTarget.selectionEnd = s + val.length;
        currentEmojiTarget.focus(); currentEmojiTarget.dispatchEvent(new Event('input'));
    }
    closeEmojiModal();
}

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
