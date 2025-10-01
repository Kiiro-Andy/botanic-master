import { useFavorites } from "./FavoriteContext";
import { FlatList, TouchableOpacity, Text, View } from "react-native";

function FavoritesScreen({ navigation }) {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return <Text style={{ textAlign: "center", marginTop: 20 }}>No tienes favoritos aún 🌱</Text>;
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("PlantDetail", { plant: item })}
        >
          <View style={{ padding: 15, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 18 }}>{item.common_name || item.scientific_name}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
