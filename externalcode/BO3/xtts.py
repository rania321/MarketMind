import torch
from TTS.tts.configs.xtts_config import XttsConfig, XttsAudioConfig, XttsArgs
from TTS.config.shared_configs import BaseDatasetConfig

torch.serialization.add_safe_globals({
    XttsConfig,
    XttsAudioConfig,
    XttsArgs,
    BaseDatasetConfig
})

import pycountry
import gradio as gr
from TTS.api import TTS

# Load XTTS v2
tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=True, gpu=False)

available_speakers = list(tts.synthesizer.tts_model.speaker_manager.name_to_id)
print("Speakers:", available_speakers)

tone_categories = {
    "Energetic": [
        "Daisy Studious", "Gracie Wise", "Tammy Grit", "Nova Hogarth", "Alexandra Hisakawa", "Lilya Stainthorpe"
    ],
    "Professional": [
        "Claribel Dervla", "Alison Dietlinde", "Sofia Hellen", "Henriette Usha", "Ige Behringer", "Marcos Rudaski"
    ],
    "Warm / Calm": [
        "Annmarie Nele", "Tammie Ema", "Brenda Stern", "Maja Ruoho", "Zofija Kendrick", "Chandra MacFarland"
    ],
    "Strong / Authoritative": [
        "Andrew Chipper", "Viktor Eka", "Damien Black", "Craig Gutsy", "Wulf Carlevaro", "Eugenio Mataracı"
    ],
    "Dramatic / Intense": [
        "Kazuhiko Atallah", "Torcull Diarmuid", "Viktor Menelaos", "Zacharie Aimilios", "Ludvig Milivoj"
    ],
    "Friendly / Approachable": [
        "Ana Florence", "Gitta Nikolina", "Suad Qasim", "Rosemary Okafor", "Filip Traverse"
    ]
}
# Use the proper methods to get speaker and language info
# Safely get speakers from the config if present
available_speakers = list(tts.synthesizer.tts_model.speaker_manager.name_to_id)
print("Speakers:", available_speakers)
# Create a mapping from full name to code
language_name_to_code = {
    pycountry.languages.get(alpha_2=lang).name: lang
    for lang in tts.languages
    if pycountry.languages.get(alpha_2=lang)  # Ensure the code is valid
}
available_languages = list(language_name_to_code.keys())

# Inference
def tts_infer(text, speaker, language_name):
    language = language_name_to_code[language_name]
    output_path = "output.wav"
    tts.tts_to_file(
        text=text,
        speaker=speaker,
        language=language,
        file_path=output_path,
    )
    return output_path

# Gradio UI
# Update speaker dropdown
def update_speakers(tone):
    return gr.update(choices=tone_categories[tone], value=tone_categories[tone][0])


# Build UI with Blocks
with gr.Blocks(title="XTTS Multilingual TTS") as demo:
    gr.Markdown("# 🌍 XTTS v2: Multilingual TTS Generator")
    with gr.Row():
        text_input = gr.Textbox(label="Enter text to speak", lines=3)
    with gr.Row():
        tone_input = gr.Dropdown(label="Select Tone", choices=list(tone_categories.keys()), value="Energetic")
        speaker_input = gr.Dropdown(label="Select Voice", choices=tone_categories["Energetic"], value=tone_categories["Energetic"][0])
        language_input = gr.Dropdown(label="Select Language", choices=available_languages, value="English")

    generate_button = gr.Button("Generate Audio")
    audio_output = gr.Audio(label="Generated Audio")

    tone_input.change(fn=update_speakers, inputs=tone_input, outputs=speaker_input)
    generate_button.click(fn=tts_infer, inputs=[text_input, speaker_input, language_input], outputs=audio_output)


if __name__ == "__main__":
    demo.launch()