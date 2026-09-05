import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type OrderItem = {
  name: string;
  quantity: number;
  size: "small" | "medium" | "large" | "unknown";
  customizations: string[];
};

type FoodOrder = {
  intent: "create_order" | "modify_order" | "cancel_order" | "unknown";
  items: OrderItem[];
};

type OrderResponse = {
  result: FoodOrder;
  nextAction:
  | "place_order"
  | "ask_clarification"
  | "unsupported_request";
};

export default function HomeScreen() {
  const [prompt, setPrompt] = useState(
    "What is the weather today?"
  );

  const [result, setResult] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrder = async () => {
    try {
      setLoading(true);
      setResult(null);
      setError(null);

      if (!prompt.trim()) {
        setError("Please enter an order.");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/api/order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data: OrderResponse = await response.json();

      setResult(data);
    } catch (error) {
      console.error("Order request failed:", error);

      setError(
        "Unable to analyze the order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const getActionMessage = () => {
    if (!result) {
      return "";
    }

    switch (result.nextAction) {
      case "place_order":
        return "✅ Order looks good! Ready to place your order.";

      case "ask_clarification":
        return "⚠️ More information is needed to complete your order.";

      case "unsupported_request":
        return "ℹ️ This assistant only handles food orders.";

      default:
        return "";
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Experiment 02 — Structured AI
      </Text>

      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter your food order"
        multiline
        style={styles.input}
      />

      <Button
        title="Analyze Order"
        onPress={handleOrder}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          style={styles.loader}
        />
      )}
      {error && (
        <View style={styles.error}>
          <Text style={styles.errorText}>
            ❌ {error}
          </Text>
        </View>
      )}

      {result && (
        <View style={styles.result}>
          <Text style={styles.heading}>Structured Result</Text>

          <Text>
            Intent: {result.result.intent}
          </Text>

          {result.result.items.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text>Name: {item.name}</Text>
              <Text>Quantity: {item.quantity}</Text>
              <Text>Size: {item.size}</Text>

              <Text>
                Customizations:{" "}
                {item.customizations.length > 0
                  ? item.customizations.join(", ")
                  : "None"}
              </Text>
            </View>
          ))}

          <Text style={styles.action}>
            {getActionMessage()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: "top",
  },

  loader: {
    marginTop: 24,
  },

  result: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  item: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  // action: {
  //   marginTop: 16,
  //   fontWeight: "700",
  // },
  action: {
    marginTop: 16,
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },

  errorText: {
    fontSize: 16,
    fontWeight: "600",
  },
});