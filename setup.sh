#!/bin/bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo
echo "✅ Setup complete!"
echo "▶️ To start the game, run:"
echo "python pokemon.py"