import ollama
import database_utils 

MODEL_NAME = 'llama3.2'
PROMPT = None

response = ollama.generate(
    model='llama3.2',
    prompt='Reply with one word, what color is the sky?'
)

print(response['response'])
