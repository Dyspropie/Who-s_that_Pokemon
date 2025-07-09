@echo off
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo.
echo ✅ Setup complete!
echo ▶️ To start the game, run:
echo python pokemon.py