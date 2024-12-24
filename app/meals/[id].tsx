// app/meals/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../lib/supabase";

type Meal = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  preparation_time: number;
  calories: number;
  price: number;
  ingredients: string[];
};

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMealDetails();
  }, [id]);

  const fetchMealDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("meals")
        .select("*")
        .eq("id", id)
        .single();

      if (supabaseError) throw supabaseError;
      if (!data) throw new Error("Meal not found");

      setMeal(data as Meal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!meal) return;

    try {
      await Share.share({
        message: `Check out ${meal.name} - ${meal.description}`,
        title: meal.name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !meal) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {error || "Meal not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMealDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Image
        source={{ uri: meal.image_url }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.category}>{meal.category}</Text>
            <Text style={styles.name}>{meal.name}</Text>
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>${meal.price.toFixed(2)}</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Preparation Time</Text>
            <Text style={styles.infoValue}>{meal.preparation_time} mins</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Calories</Text>
            <Text style={styles.infoValue}>{meal.calories} cal</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{meal.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {meal.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  image: {
    width: Dimensions.get("window").width,
    height: 300,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  category: {
    fontSize: 14,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  shareButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ecc71",
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  ingredientItem: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  bullet: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
