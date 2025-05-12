from TTS.api import TTS
import os


# Initialize TTS with Jenny model
tts = TTS(model_name="tts_models/en/jenny/jenny", progress_bar=True, gpu=False)

# Create output directory if it doesn't exist
os.makedirs("outputs", exist_ok=True)

# Ask for input
text = input("Enter the text you want to convert to speech:\n> ")

# Set output path
output_path = "outputs/output.wav"

# Run TTS
tts.tts_to_file(text=text, file_path=output_path)

print(f"\n✅ Audio generated and saved to {output_path}")

# Play audio (Windows only, optional)
try:
    import winsound
    print("🔊 Playing audio...")
    winsound.PlaySound(output_path, winsound.SND_FILENAME)
except Exception as e:
    print("Audio playback skipped. You can manually play the file.")
