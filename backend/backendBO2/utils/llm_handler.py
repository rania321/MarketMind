from llama_cpp import Llama
import os

def load_llama_model():
    model_path = os.path.join(os.path.dirname(__file__), "../models/strategy-llama.gguf")
    return Llama(
        model_path=model_path,
        n_ctx=2048,
        n_threads=4,
        verbose=False
    )

alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

def format_alpaca_prompt(form_data, strategy_type):
    instruction = "Generate a complete marketing strategy plan for the following company"
    input_str = (
        f"Industry: {form_data['industry']} | "
        f"Target Customer: {form_data['target_customer']} | "
        f"Age: {form_data['customer_age'].replace(' ans', '').replace('+', 'plus')} | "
        f"Budget: €{form_data['marketing_budget']} | "
        f"Trends: {form_data['trend']} | "
        f"Strategy: {strategy_type}"
    )
    return alpaca_prompt.format(instruction, input_str, "")

def parse_llm_response(text):
    sections = {
        'OBJECTIVES': [],
        'STRATEGY': [],
        'TACTICAL_EXECUTION': [],
        'BUDGET': [],
        'KPIS': [],
        'TIMELINE': []
    }
    
    current_section = None
    for line in text.split('\n'):
        line = line.strip()
        if line.startswith('[') and line.endswith(']'):
            current_section = line[1:-1].replace(" ", "_").upper()
        elif current_section and current_section in sections:
            if line: 
                sections[current_section].append(line)
    
    return {k: v for k, v in sections.items() if v}

def generate_llm_strategy(form_data, strategy_type):
    try:
        llm = load_llama_model()
        prompt = format_alpaca_prompt(form_data, strategy_type)
        
        response = llm.create_completion(
            prompt=prompt,
            max_tokens=1000,
            temperature=0.7,
            stop=["</s>", "###", "[END]"],
            echo=False
        )
        
        return parse_llm_response(response['choices'][0]['text'])
    
    except Exception as e:
        print(f"LLM Error: {str(e)}")
        return {"error": "Strategy generation failed"}