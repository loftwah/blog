---
title: "Build a Powerful Product Catalog Explorer with LangChain, Ollama, and Gradio"
description: "Learn how to create an interactive RAG system that combines vector search with direct data analysis to answer natural language queries about product data."
pubDate: "Mar 08 2025"
heroImage: "/images/python-docker-uv.png"
---

In this article, I'll guide you through creating an interactive Product Catalog Explorer using Python, LangChain, Ollama, and Gradio. This system leverages a hybrid approach called Retrieval-Augmented Generation (RAG), combining vector search capabilities with direct data analysis to answer questions about products naturally and accurately.

Imagine easily answering queries such as:

- **"What's the cheapest laptop available?"**
- **"List highly-rated products currently on sale."**

Let's explore how this is done step-by-step.

## Project Overview

The [langchain-csv](https://github.com/loftwah/langchain-csv) project provides two intuitive interfaces:

- **Gradio Web Interface:** An easy-to-use, interactive web app.
- **Command-Line Interface (CLI):** A colourful terminal application.

Both interfaces share a Retrieval-Augmented Generation (RAG) backend, enhanced by direct data analysis for handling precise numerical and comparative queries effectively.

## Technologies Used

Our tech stack includes:

- **Python:** Core language for developing the project.
- **uv:** A modern package manager for Python environments.
- **LangChain:** Framework for building RAG pipelines.
- **Ollama:** Facilitates running local LLMs.
- **FAISS:** Provides efficient vector similarity searches.
- **Pandas:** Enables robust data manipulation and analysis.
- **Gradio:** Powers the interactive web interface.
- **Colorama:** Adds color-coded outputs in terminal interfaces.

## Quick Setup

Follow these steps to get the system running:

```bash
# Clone the repository
git clone https://github.com/loftwah/langchain-csv.git
cd langchain-csv

# Set up dependencies
uv venv
uv pip install langchain langchain_community langchain_ollama faiss-cpu colorama gradio pandas

# Ensure Ollama is running and pull required models
ollama pull llama3.2

# Launch the Gradio web interface
uv run gradio_demo.py
```

You can also explore the command-line demo for a different interactive experience:

```bash
uv run cli_demo.py
```

## Data: The Product Catalog

Our explorer uses product data from a CSV file. The sample `products.csv` includes:

- **Basic Information:** Name, price, description, category, brand, and rating.
- **Extended Data:** Stock availability, release dates, discounts, and product features.

This detailed dataset enables comprehensive queries ranging from basic product lookups to advanced analytics.

## How the RAG System Operates

Here's a step-by-step breakdown of the Retrieval-Augmented Generation (RAG) system:

### 1. Loading CSV Data with LangChain

Each CSV row is converted into a LangChain-compatible document:

```python
def load_csv_data(csv_file):
    from langchain_community.document_loaders import CSVLoader

    loader = CSVLoader(csv_file)
    documents = loader.load()
    return documents
```

## 2. Generating Vector Embeddings

Use Ollama to create semantic embeddings from product descriptions, enabling efficient queries:

```python
from langchain_ollama import OllamaEmbeddings

def create_embeddings(documents, model="llama3.2"):
    embeddings = OllamaEmbeddings(model=model)
    vector_store = FAISS.from_documents(documents, embeddings)
    return vector_store
```

## 3. Implementing the QA Chain

LangChain creates a retrieval-based QA chain:

```python
from langchain.chains import RetrievalQA

def setup_qa_chain(vector_store, model="llama3.2"):
    retriever = vector_store.as_retriever()

    qa_chain = RetrievalQA.from_chain_type(
        retriever=retriever,
        chain_type="stuff",
        llm=OllamaLLM(model=model),
        return_source_documents=True
    )
    return qa_chain
```

## 4. Hybrid Query Processing: Direct Data Analysis

For precise or numeric queries, direct analysis with Pandas ensures accuracy:

```python
def direct_data_analysis(query, df):
    query_lower = query.lower()

    if "cheapest" in query_lower:
        product = df.loc[df['price'].idxmin()]
        return f"The cheapest product is {product['name']} at ${product['price']}."

    # Additional specific handlers for price, stock, or other metrics...

    return None
```

This combination of semantic search and direct analysis provides fast and accurate answers.

## User Interfaces

### Gradio Web Interface

The Gradio interface offers an intuitive, web-based experience:

```python
import gradio as gr

with gr.Interface(
    fn=process_query,
    inputs="text",
    outputs="text",
    title="Product Catalog Explorer",
    description="Ask questions about our product catalog in natural language!"
) as demo:
    demo.launch()
```

### CLI Interface with Colorama

For command-line enthusiasts, we've added a colorful interactive CLI:

```python
from colorama import Fore, Style

print(Fore.GREEN + "Welcome to Product Explorer!" + Style.RESET_ALL)
# Interactive prompts and formatted responses here
```

## Why Use This Approach?

The strength of this system lies in its hybrid nature:

- **Flexible Queries:** Handles open-ended questions seamlessly.
- **Precision Queries:** Accurately manages numeric and comparative data.
- **Efficiency:** Rapid response times through vector embeddings and local models.

This method gives you the power of advanced AI-driven queries combined with traditional data precision.

## Dive Deeper and Customize

Check out the full project on [GitHub](https://github.com/loftwah/langchain-csv) for a deeper dive. It's structured to be modular, allowing you to extend and adapt it to your unique needs.

Give the repository a ⭐️ if you find it useful, and feel free to fork it, enhance it, and contribute your own improvements!

## Final Thoughts

By combining LangChain, Ollama, Gradio, and Pandas, we've created a versatile, user-friendly system perfect for exploring product catalogs with natural language.

Whether you're building customer-facing tools or internal analytics, this approach provides an excellent foundation to get started.

If you found this helpful, I'd appreciate a star on the [GitHub repository](https://github.com/loftwah/langchain-csv).
