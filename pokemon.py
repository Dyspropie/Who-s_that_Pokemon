import requests
import random
import os
import ascii_magic

# Score
SCORE = 0

#Defining getting random pokemon id function
def get_random_pokemon(difficulty):
    if difficulty == "easy":
        max_id = 151
    elif difficulty == "medium":
        max_id = 251
    else:
        max_id = 898  # all gens

    pokemon_id = random.randint(1, max_id)
    url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        name = data["name"]
        image_url = data["sprites"]["front_default"]
        return name, image_url
    else:
        return None, None
    
# Pokemon in Ascii art
def display_ascii_image(image_url):
    try:
        art = ascii_magic.AsciiArt.from_url(image_url)
        ascii_image = art.to_ascii(columns=60)
        print(ascii_image)
    except Exception as e:
        print("Error displaying ASCII image:", e)


# Main game code
def game(difficulty):
    global SCORE
    name, image_url = get_random_pokemon(difficulty)
    if not name or not image_url:
        print("Couldnt load Pokemon")
        return
    
    os.system("cls" if os.name == "nt" else "clear")
    print("Who's That Pokemon?\n")
    display_ascii_image(image_url)

    guess = input("\nYour Guess: ").strip().lower()
    if guess == name.lower():
        print(f"Correct! It's {name.capitalize()}! (+10)")
        SCORE += 10
    else:
        print(f"Nope! It's {name.capitalize()}! (+0)")

    print(f"Total Score: {SCORE}")

# Difficulty 
def select_difficulty():
    while True:
        level = input("Select difficulty (easy / medium / hard): ").strip().lower()
        if level in ["easy", "medium", "hard"]:
            return level
        print("Invalid input. Try again.")

# Main
def main():
    print("🎮 Welcome to 'Who's That Pokémon?' (CLI Edition)")
    difficulty = select_difficulty()
    while True:
            game(difficulty)
            again = input("\n🔁 Play Again? (y/n): ").strip().lower()
            if again != 'y':
                print("\n👋 Thanks for playing! Final Score:", SCORE)
                break

            
if __name__ == "__main__":
    main()