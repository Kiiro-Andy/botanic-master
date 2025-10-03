import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FavoriteProvider } from "./services/FavoriteContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import PlantDetailScreen from "./src/screens/PlantDetailScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<FavoriteProvider>
			<NavigationContainer>
				<Stack.Navigator>
					<Stack.Screen name="Login" component={LoginScreen} />
					<Stack.Screen name="Home" component={HomeScreen} />
					<Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
					<Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
				</Stack.Navigator>
			</NavigationContainer>
		</FavoriteProvider>
	);
}
