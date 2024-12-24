// app/meals/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
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

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ["all", "Breakfast", "Lunch", "Dinner"];

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from("meals").select("*");

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setMeals(data as Meal[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeals();
    setRefreshing(false);
  };

  const renderMealCard = ({ item }: { item: Meal }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/meals/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.mealImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.mealName}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.mealPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.mealInfo}>
          <Text style={styles.mealTime}>🕒 {item.preparation_time} mins</Text>
          <Text style={styles.mealCalories}>🔥 {item.calories} cal</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMeals}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
          style={styles.picker}
        >
          {categories.map((category) => (
            <Picker.Item
              key={category}
              label={category === "all" ? "All Categories" : category}
              value={category}
            />
          ))}
        </Picker>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMealCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No meals found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    margin: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 50,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealImage: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryText: {
    color: "#2e7d32",
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    color: "#666",
    marginBottom: 8,
  },
  mealPrice: {
    fontSize: 16,
    color: "#2ecc71",
    fontWeight: "bold",
    marginBottom: 8,
  },
  mealInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealTime: {
    color: "#666",
  },
  mealCalories: {
    color: "#666",
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
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
