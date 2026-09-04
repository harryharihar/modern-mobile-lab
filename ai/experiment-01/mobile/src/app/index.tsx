import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import Markdown from "@ronradtke/react-native-markdown-display";

const API_URL = "http://localhost:3000";

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const result = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
        }),
      });

      if (!result.ok) {
        const data = await result.json();

        throw new Error(data.error || "AI request failed");
      }

      if (!result.body) {
        throw new Error("Streaming is not supported");
      }

      const reader = result.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");

        buffer = events.pop() || "";

        for (const event of events) {
          if (!event.startsWith("data: ")) {
            continue;
          }

          const data = event.replace("data: ", "");

          if (data === "[DONE]") {
            continue;
          }

          const chunk = JSON.parse(data);

          console.log("FRONTEND CHUNK:", chunk);

          setResponse((current) => current + chunk);
        }
      }
    } catch (error) {
      console.error("AI request failed:", error);

      setResponse(
        error instanceof Error
          ? error.message
          : "Unable to get a response from the AI."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.brand}>Modern Mobile Lab</Text>

          <Text style={styles.title}>AI Playground</Text>

          <Text style={styles.subtitle}>Ask an AI model anything</Text>

          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Ask something..."
            placeholderTextColor="#888888"
            multiline
            style={styles.input}
          />

          <Pressable
            onPress={askAI}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Ask AI</Text>
            )}
          </Pressable>

          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>AI Response</Text>

            <Markdown>
              {response || "Your AI response will appear here."}
            </Markdown>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  content: {
    flex: 1,
    padding: 24,
  },

  brand: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },

  title: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: "700",
    color: "#111111",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
    color: "#666666",
  },

  input: {
    minHeight: 140,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    fontSize: 16,
    color: "#111111",
    textAlignVertical: "top",
  },

  button: {
    minHeight: 52,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  responseContainer: {
    marginTop: 32,
  },

  responseTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },

  response: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
  },
});
