import requests
import random
import os
import time
import ascii_magic
import pygame

# Score
SCORE = 0

# --- Audio Function ---
def play_audio():
    try:
        pygame.mixer.init()
        pygame.mixer.music.load("whos_that_pokemon.mp3")
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            continue  # wait for audio to finish
    except Exception as e:
        print("🎵 (Audio failed or missing):", e)
    
# Pokemon in Ascii art
def display_ascii_image(image_url):
    try:
        art = ascii_magic.AsciiArt.from_url(image_url)
        ascii_image = art.to_ascii(columns=60)
        print(ascii_image)
    except Exception as e:
        print("Error displaying ASCII image:", e)

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

# Main game code
def game(difficulty):
    global SCORE
    name, image_url = get_random_pokemon(difficulty)
    if not name or not image_url:
        print("⚠️ Couldn't load Pokémon.")
        return

    os.system("cls" if os.name == "nt" else "clear")
    print("🎵 Playing Sound...")
    play_audio()

    print("\n🕵️ Who's That Pokémon?\n")
    display_ascii_image(image_url)

    start_time = time.time()
    guess = input("\nYour Guess: ").strip().lower()
    end_time = time.time()

    time_taken = round(end_time - start_time, 2)
    print(f"\n⏱️ Time Taken: {time_taken} seconds")

    if guess == name.lower():
        base_score = 10
        speed_bonus = max(5 - time_taken, 0)  # Max +5
        round_score = int(base_score + speed_bonus)
        print(f"🎉 Correct! It’s {name.capitalize()}! (+{round_score} points)")
        SCORE += round_score
    else:
        print(f"❌ Nope! It was {name.capitalize()}.")

    print(f"🏆 Total Score: {SCORE}")

# Difficulty 
def select_difficulty():
    while True:
        level = input("Select difficulty (easy / medium / hard): ").strip().lower()
        if level in ["easy", "medium", "hard"]:
            return level
        print("❌ Invalid input. Try again.")

# Main loop
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