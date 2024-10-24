---
title: "Unlocking the Power of GGUF Models Locally with Ollama"
description: "Harnessing the Power of GGUF Models Locally with Ollama: A Personal Journey"
pubDate: "Oct 24 2024"
heroImage: "/images/blog-gguf.jpg"
---

# Unlocking the Power of GGUF Models Locally with Ollama: A Personal Journey

G'day mates! Today, I want to share my experience diving into the world of large language models (LLMs) and how you can run **GGUF models** locally using **Ollama**. If you're like me and have been keen to harness AI capabilities without relying on cloud services, this guide is for you.

## Why GGUF and Ollama?

First off, let's talk about **GGUF** (GPT-Generated Unified Format). It's quickly become the go-to standard for running LLMs on personal machines. With an ever-growing collection of GGUF models available on Hugging Face—thanks to legends like **TheBloke** and many other contributors—it's never been easier to get started.

Then there's **Ollama**, a fantastic tool based on `llama.cpp` that simplifies running these models locally. Combining GGUF models with Ollama allows you to leverage powerful AI models without the need for hefty cloud-based solutions.

## The Game Changer: Running GGUF Models Directly from Hugging Face via Ollama

In the past, running GGUF models with Ollama involved downloading the models manually and setting up Modelfiles. But now, Ollama has introduced a brilliant feature that lets you run any GGUF model available on Hugging Face directly, without the need for manual downloads or Modelfiles. This has been a game-changer in simplifying the workflow.

### How It Works

At the time of writing, there are over 45,000 public GGUF checkpoints on the Hugging Face Hub that you can run with a single `ollama run` command. Here's how you can do it.

### Step 1: Install Ollama

If you haven't installed Ollama yet, you can do so by following the instructions on their [GitHub repository](https://github.com/ollama/ollama).

For macOS users with Homebrew:

```bash
brew install ollama/tap/ollama
```

For other platforms, please refer to the [installation guide](https://github.com/ollama/ollama/blob/main/docs/install.md).

### Step 2: Running a GGUF Model Directly from Hugging Face

To run a GGUF model directly from Hugging Face, use the following command:

```bash
ollama run hf.co/{username}/{repository}
```

For example, to run the **Llama-3.2-1B-Instruct-GGUF** model:

```bash
ollama run hf.co/bartowski/Llama-3.2-1B-Instruct-GGUF
```

This command tells Ollama to fetch the model directly from Hugging Face, download it if necessary, and then run it. No need to manually download files or set up Modelfiles!

### Examples of Models You Can Try

Here are some models you can try running directly:

```bash
ollama run hf.co/bartowski/Llama-3.2-1B-Instruct-GGUF
ollama run hf.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF
ollama run hf.co/arcee-ai/SuperNova-Medius-GGUF
ollama run hf.co/bartowski/Humanish-LLama3-8B-Instruct-GGUF
```

### Custom Quantization

By default, Ollama uses the `Q4_K_M` quantization scheme when it's present inside the model repository. If not, it picks a reasonable default. However, you can specify a different quantization scheme directly in the command:

```bash
ollama run hf.co/{username}/{repository}:{quantization}
```

For example:

```bash
ollama run hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF:IQ3_M
ollama run hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF:Q8_0

# Quantization names are case-insensitive
ollama run hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF:iq3_m

# You can also use the full filename as a tag
ollama run hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF:Llama-3.2-3B-Instruct-IQ3_M.gguf
```

### Custom Chat Template and Parameters

If you want to customize the chat template or sampling parameters, you can create files named `template`, `system`, or `params` in the model repository on Hugging Face. However, for most users, the default settings work just fine.

### References

- [Ollama Documentation](https://github.com/ollama/ollama/blob/main/docs/README.md)
- [Hugging Face GGUF Documentation](https://huggingface.co/docs/hub/en/gguf)

## The Traditional Method: Downloading GGUF Models Manually

While running models directly from Hugging Face is incredibly convenient, you might still want to download models manually in certain scenarios—like if you need to modify them or use custom Modelfiles for advanced configurations.

### Step 1: Install the Hugging Face CLI

First, ensure you have the Hugging Face CLI installed:

```bash
pip install huggingface_hub
```

### Step 2: Download a GGUF Model

Not all models are available in GGUF format, so you need to ensure you're downloading the correct files.

#### Checking the Model Files on Hugging Face

1. **Visit the Model's Page**: Go to the Hugging Face page of the model you're interested in, such as **huihui-ai/Llama-3.2-3B-Instruct** or **TheBloke/MistralLite-7B-GGUF**.

2. **Navigate to "Files and Versions"**:

   - Look for files ending with `.gguf`. These are the ones compatible with Ollama.
   - Avoid files like `.safetensors` or `.bin`, as they require conversion.

#### Downloading the GGUF Model

Once you've identified the correct GGUF file, download it using the Hugging Face CLI:

```bash
huggingface-cli download \
  TheBloke/MistralLite-7B-GGUF \
  mistrallite.Q4_K_M.gguf \
  --local-dir downloads
```

**Note**: Be sure to specify the exact GGUF file to avoid downloading incompatible formats.

### Step 3: Creating a Modelfile

After downloading, create a `Modelfile` to point Ollama to your local model:

```bash
# Modelfile
FROM ./downloads/mistrallite.Q4_K_M.gguf
```

### Step 4: Building the Model with Ollama

Build the model using:

```bash
ollama create mistrallite -f Modelfile
```

### Step 5: Running the Model

Now, you can run the model:

```bash
ollama run mistrallite "What is Kubernetes?"
```

You should receive an informative response, like:

```plaintext
Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It helps organizations manage complex workloads and services.
```

## Handling Models in Other Formats

If the model you want isn't available in GGUF format and only provides `.safetensors` or `.bin` files, you have a couple of options:

1. **Search for a GGUF Version**: Often, someone else has converted the model and shared it under a different repository.

2. **Convert the Model Yourself**: This can be a bit of a process and may require additional tools like `transformers` and `gguf-converter`.

Personally, I prefer to find a GGUF version to save time.

## Cleaning Up: Managing Your Models

Over time, you might accumulate several models and want to tidy up.

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
ollama create mycoder -f custom-coder.modelfile
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

Running GGUF models locally with Ollama has been a game-changer for me. With the new ability to run models directly from Hugging Face, it's never been easier to experiment and develop with powerful AI models right on your own machine.

I hope this guide helps you on your journey. Feel free to share your experiences or ask questions—I'm always keen to chat about this stuff!

Cheers!
