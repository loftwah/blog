---
title: 'Unlocking the Power of GGUF Models Locally'
description: 'Unlocking the Power of GGUF Models Locally with Ollama: A Personal Journey'
pubDate: 'Oct 24 2024'
heroImage: '/images/blog-gguf.jpg'
---

# Unlocking the Power of GGUF Models Locally with Ollama: A Personal Journey

G'day mates! Today, I want to share my experience diving into the world of large language models (LLMs) and how you can run **GGUF models** locally using **Ollama**. If you're like me and have been keen to harness AI capabilities without relying on cloud services, this guide is for you.

## Why GGUF and Ollama?

First off, let's talk about **GGUF** (GPT-Generated Unified Format). It's quickly become the go-to standard for running LLMs on personal machines. With an ever-growing collection of GGUF models available on Hugging Face—thanks to legends like **TheBloke**—it's never been easier to get started.

Then there's **Ollama**, a fantastic tool that simplifies running these models locally. Combining GGUF models with Ollama allows you to leverage powerful AI models without the need for hefty cloud-based solutions.

## Getting Started: Installing the Hugging Face CLI

Before we can dive into downloading models, we'll need the Hugging Face command-line interface (CLI). It's straightforward:

```bash
pip install huggingface_hub
```

This will set you up with the necessary tools to interact with Hugging Face repositories directly from your terminal.

## Downloading a GGUF Model

Now, here's where the rubber meets the road. Not all models are created equal, and we need to ensure we're grabbing ones compatible with Ollama. Specifically, we're after models in the **.gguf** format.

### Checking the Model Files on Hugging Face

1. **Visit the Model's Page**: Head over to Hugging Face and find a model that piques your interest. For example, **huihui-ai/Llama-3.2-3B-Instruct** or **TheBloke/MistralLite-7B-GGUF** are great choices.

2. **Navigate to "Files and Versions"**:

   - Don't just skim the Model Card; it often only provides general info.
   - Look for files ending with `.gguf`. These are the ones we need.

   For instance, you might see:

   ```plaintext
   mistrallite.Q4_K_M.gguf 4.37 GB
   ```

   Avoid files like:

   ```plaintext
   model-00001-of-00002.safetensors    4.97 GB
   model-00002-of-00002.safetensors    2.25 GB
   ```

   The `.safetensors` or `.bin` files aren't compatible with Ollama without conversion, which can be a headache.

### Downloading the GGUF Model

Once you've found the right file, it's time to download. Let's use **TheBloke/MistralLite-7B-GGUF** as our example:

```bash
huggingface-cli download \
  TheBloke/MistralLite-7B-GGUF \
  mistrallite.Q4_K_M.gguf \
  --local-dir downloads
```

**Heads up**: Make sure you specify the exact GGUF file to avoid pulling down incompatible formats. This file is a hefty 4GB+, so maybe grab a cuppa while it downloads.

## Creating a Modelfile

With the model downloaded, we need to tell Ollama where to find it. Create a file named `Modelfile` with the following content:

```bash
# Modelfile
FROM ./downloads/mistrallite.Q4_K_M.gguf
```

This simple directive points Ollama to the GGUF model we've just downloaded.

## Building the Model with Ollama

Now, let's get Ollama to recognise and prepare the model:

```bash
ollama create mistrallite -f Modelfile
```

This command builds the model so it's ready to use.

## Running the Model

Moment of truth! Let's see if it all works:

```bash
ollama run mistrallite "What is Grafana?"
```

You should receive an informative response, something along the lines of:

```plaintext
Grafana is an open-source platform for monitoring and observability. It allows users to query, visualise, and understand metrics from various data sources.
```

Isn't it brilliant to have this power right on your own machine?

## Handling Models in Other Formats

Now, I ran into this myself: sometimes the model you want isn't available in GGUF format. If you only see `.safetensors` or `.bin` files, you've got a couple of options:

1. **Search for a GGUF Version**: Often, someone else has converted the model and shared it under a different repository.

2. **Convert the Model Yourself**: This can be a bit of a process and may require additional tools like `transformers` and `gguf-converter`.

Personally, I prefer to hunt down a GGUF version to save time.

## Cleaning Up: Managing Your Models

Over time, you might accumulate a few models and want to tidy up.

### Listing Installed Models

```bash
ollama list
```

### Removing Models

To remove all models:

```bash
ollama list | awk 'NR>1 {print $1}' | xargs ollama rm
```

Or, to remove specific models (e.g., those containing 'llama'):

```bash
ollama list | awk 'NR>1 {print $1}' | grep 'llama' | xargs ollama rm
```

This helps keep your system lean and avoids clutter.

## Building Custom Models for Code Reviews

One of the coolest things I've done is create a custom model for code reviews. Here's how you can do it too.

### Setting Up a Custom Model

Create a file named `custom-coder.modelfile`:

```bash
# custom-coder.modelfile
FROM codellama  # Use CodeLlama as the base model

PARAMETER temperature 0.7  # Adjusts creativity
PARAMETER top_p 0.9        # Controls diversity
PARAMETER top_k 40         # Limits the number of tokens to consider

SYSTEM """
You're a senior developer tasked with code reviews:
1. Explain why code works or might break.
2. Identify potential performance issues.
3. Suggest improvements with example code.
"""
```

### Building and Running Your Custom Model

Build the model:

```bash
ollama create mycoder -f ./custom-coder.modelfile
```

Now, you can use it to review code:

```bash
git diff HEAD~1 | ollama run mycoder "Review these changes:"
```

This pipes your recent Git changes into the model for analysis. It's like having a senior dev looking over your shoulder!

## Enhancing Your Workflow with Shell Integration

To make things even smoother, you can set up shell aliases and functions.

### Creating Aliases

Add these to your `.bashrc` or `.zshrc`:

```bash
alias oc='ollama run codellama'
alias om='ollama run mistral'
```

### Dynamic Model Loading Function

Here's a nifty function to load models on the fly:

```bash
model() {
    local model_name="$1"
    shift
    if ! ollama list | grep -q "$model_name"; then
        echo "Model $model_name not found. Downloading..."
        ollama pull "$model_name"
    fi
    ollama run "$model_name" "$@"
}
```

Now, you can use it like so:

```bash
model codellama "Explain this Python code:"
```

## Advanced Techniques: Model Chaining

You can get creative by chaining models together for more complex tasks.

### Example: Code Analysis and Simplification

```bash
cat complex.py | \
    ollama run codellama "Analyze this code:" | \
    ollama run mistral "Explain this in layman's terms."
```

This takes a complex piece of code, analyses it, and then simplifies the explanation.

### Example: Code Generation and Review

```bash
ollama run codellama "Write a Redis cache wrapper in Python." | \
    ollama run mycoder "Review this code."
```

Generate code and immediately have it reviewed by your custom model.

## Keeping an Eye on Resources

Running these models can be resource-intensive. Here's how to manage that.

### Monitoring GPU Usage

If you've got a GPU, monitor its memory usage:

```bash
watch -n 1 'nvidia-smi | grep MiB'
```

### Checking Disk Space

See how much space your models are taking:

```bash
du -sh ~/.ollama
```

### Limiting GPU Memory Usage

You can limit the GPU memory if needed:

```bash
ollama run model --gpu memory_limit=4096
```

Adjust the `memory_limit` based on your GPU's capacity.

## Choosing the Right Model for Your Hardware

Not all of us have monster rigs, so pick models that suit your setup:

- **8GB VRAM GPU**: Models like **mistral** or **codellama** work well.
- **12GB VRAM GPU**: You can handle larger models like **wizard-math**.
- **24GB+ VRAM GPU**: Go wild with models like **llama2:70b**.

It's all about balancing performance with capability.

## Troubleshooting: Quick Fixes

Sometimes things go pear-shaped. Here's how to get back on track:

```bash
# Kill any stuck processes
pkill ollama

# Restart the Ollama server
ollama serve

# Full reset (you'll need to re-download models after this)
rm -rf ~/.ollama
```

Use that last command cautiously; it's a nuclear option.

## Wrapping Up

Running GGUF models locally with Ollama has been a game-changer for me. It empowers you to experiment, develop, and leverage AI models without the constraints of cloud services or hefty fees.

I hope this guide helps you on your journey. Feel free to share your experiences or ask questions—I'm always keen to chat about this stuff!

Cheers!
