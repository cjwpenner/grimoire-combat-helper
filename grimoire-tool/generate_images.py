import os
import json
import time
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

# Initialize Gemini Client
client = genai.Client(api_key=api_key)

GRIMOIRE_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "grimoire-web", "public", "grimoire.json")
CLI_JSON_PATH = os.path.join(os.path.dirname(__file__), "grimoire", "grimoire.json")
IMAGE_DIR = os.path.join(os.path.dirname(__file__), "..", "grimoire-web", "public", "images")

# Ensure image directory exists
os.makedirs(IMAGE_DIR, exist_ok=True)

def generate_image(monster):
    prompt = (
        f"A hyper-detailed, biological field-guide illustration of a fantasy creature: "
        f"{monster['name']} ({monster.get('size', 'medium')} {monster.get('type', 'beast')}). "
        "Setting: High fantasy Dungeons and Dragons. "
        "CRITICAL INSTRUCTIONS: The creature MUST be situated in a rich, detailed, natural environment or dungeon background. NO plain white or transparent backgrounds. NO studio backdrops. NO humans. NO adventurers. NO modern elements. NO corporate suits. NO vehicles. "
        "NO text, NO words, NO letters, NO typography, NO watermarks. "
        "The art style should be dark, gritty, cinematic, and fully illustrate the monster in its habitat."
    )
    
    print(f"Generating image for {monster['name']}...")
    try:
        result = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=prompt,
            config=dict(
                number_of_images=1,
                output_mime_type="image/jpeg",
                aspect_ratio="1:1"
            )
        )
        
        image_bytes = result.generated_images[0].image.image_bytes
        
        filename = f"monster_{monster['id']}.jpg"
        filepath = os.path.join(IMAGE_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(image_bytes)
            
        print(f"  -> Saved {filename}")
        return f"images/{filename}"
    except Exception as e:
        print(f"  -> Error generating image for {monster['name']}: {e}")
        return None

def main():
    # Load JSON
    with open(GRIMOIRE_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    monsters = data.get("monsters", [])
    
    count = 0
    max_images = 1000
    
    for monster in monsters:
        if count >= max_images:
            break
            
        if not monster.get("has_image"):
            url = generate_image(monster)
            if url:
                monster["has_image"] = True
                monster["image_url"] = url
                count += 1
                
                # Save progress after each successful image
                with open(GRIMOIRE_JSON_PATH, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=4)
                
                # Also update CLI json to keep them in sync
                with open(CLI_JSON_PATH, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=4)
                    
            # Tiny sleep to avoid aggressive rate limiting
            time.sleep(2)
            
    print(f"Successfully generated {count} images.")

if __name__ == "__main__":
    main()
