import os
from gtts import gTTS

output_dir = r"C:\Users\cbotc\.gemini\antigravity-ide\scratch\kwan-ai\kwan-flutter\web\assets\audio"
os.makedirs(output_dir, exist_ok=True)

phrases = [
    # Twi (Ghana)
    {"file": "akwaaba.mp3", "text": "Ah kwah bah", "lang": "en", "tld": "co.gh"},
    {"file": "tesokakra.mp3", "text": "Teh soh kah krah", "lang": "en", "tld": "co.gh"},
    {"file": "etisen.mp3", "text": "Eh tee sehn", "lang": "en", "tld": "co.gh"},
    {"file": "medaase.mp3", "text": "Meh dah ah seh", "lang": "en", "tld": "co.gh"},
    # Yoruba (Nigeria)
    {"file": "ekaabo.mp3", "text": "Eh kah boh", "lang": "yo", "tld": "com"},
    {"file": "eseun.mp3", "text": "Eh sheh oon", "lang": "yo", "tld": "com"},
    {"file": "bawoni.mp3", "text": "Bah woh nee", "lang": "yo", "tld": "com"},
    # Hausa (Northern Nigeria & Niger)
    {"file": "sannudazuwa.mp3", "text": "Sah noo dah zoo wah", "lang": "ha", "tld": "com"},
    {"file": "nagode.mp3", "text": "Nah goh deh", "lang": "ha", "tld": "com"},
    # Igbo (Eastern Nigeria)
    {"file": "nnoo.mp3", "text": "Nnoh oh", "lang": "ig", "tld": "com"},
    {"file": "daalu.mp3", "text": "Dah loo", "lang": "ig", "tld": "com"},
    # West African Pidgin (Nigeria & Ghana)
    {"file": "howbody.mp3", "text": "How boh dee", "lang": "en", "tld": "com.ng"},
    {"file": "nowahala.mp3", "text": "Noh wah hah lah", "lang": "en", "tld": "com.ng"},
]

print("Re-generating clean native audio MP3 assets (without hyphenation)...")

for p in phrases:
    filepath = os.path.join(output_dir, p["file"])
    try:
        if "tld" in p:
            tts = gTTS(text=p["text"], lang=p["lang"], tld=p["tld"], slow=False)
        else:
            tts = gTTS(text=p["text"], lang=p["lang"], slow=False)
        tts.save(filepath)
        print(f"Generated {p['file']}")
    except Exception as e:
        try:
            tts = gTTS(text=p["text"], lang="en", slow=False)
            tts.save(filepath)
            print(f"Fallback generated {p['file']}")
        except Exception as ex:
            print(f"Error {p['file']}: {ex}")

print("Audio asset generation complete!")
