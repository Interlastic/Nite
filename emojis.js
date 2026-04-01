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

window.UNICODE_EMOJIS = UNICODE_EMOJIS;
window.EMOJI_KEYWORDS = EMOJI_KEYWORDS;
window.GLOBAL_EMOJIS = window.GLOBAL_EMOJIS || { custom: [], unicode: UNICODE_EMOJIS };

function getTwemojiUrl(emoji) {
    const codePoint = [...emoji].map(c => c.codePointAt(0).toString(16)).join('-');
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoint}.png`;
}
window.getTwemojiUrl = getTwemojiUrl;