# Experiment 01 — Mobile AI / LLM Integration

Part of the Modern Mobile Lab — AI Series.

## Overview

This experiment demonstrates how to integrate an LLM into a React Native application using a secure backend architecture.

The application will:

- Accept a user prompt from React Native
- Send the prompt to a backend
- Authenticate with the OpenAI API from the backend
- Use the GPT-5.6 model
- Return an AI-generated response
- Stream the response progressively to React Native
- Render the response in the mobile UI

## Architecture

React Native
      |
      v
   AI Service
      |
      v
   HTTP API
      |
      v
Express Backend
      |
      v
OpenAI Responses API
      |
      v
   GPT-5.6
      |
      v
Streaming Response
      |
      v
React Native UI

## Topics Covered

- OpenAI API setup
- OpenAI projects
- API keys
- API security
- Input and output tokens
- Model selection
- GPT-5.6
- Responses API
- Backend architecture
- LLM streaming
- React Native streaming
- Progressive UI updates
- Markdown rendering
- Streaming performance optimization

## YouTube

This experiment is demonstrated on the Modern Mobile Lab YouTube channel.

## Status

In progress
