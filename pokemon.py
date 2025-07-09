import requests
import random
import os
import ascii_magic

#Defining getting random pokemon id function
def get_random_pokemon():
    pokemon_id = random.randint(1, 151)
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
def game():
    name, image_url = get_random_pokemon()
    if not name or not image_url:
        print("Couldnt load Pokemon")
        return
    
    os.system("cls" if os.name == "nt" else "clear")
    print("Who's That Pokemon?\n")
    display_ascii_image(image_url)

    guess = input("\nYour Guess: ").strip().lower()
    if guess == name.lower():
        print(f"Correct! It's {name.capitalize()}!")
    else:
        print(f"Nope! It was {name.capitalize()}.")


if __name__ == "__main__":
    game()