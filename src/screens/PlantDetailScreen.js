import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function PlantDetailScreen({ route }) {
	const { plant } = route.params;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>
				{plant.common_name || plant.scientific_name}
			</Text>
			{plant.image_url && (
				<Image source={{ uri: plant.image_url }} style={styles.image} />
			)}
			<Text>Nombre científico: {plant.scientific_name}</Text>
			<Text>Familia: {plant.family_common_name || "Desconocida"}</Text>
			<Text>Género: {plant.genus || "Desconocido"}</Text>

			{plant.duration && <Text>Ciclo de vida: {plant.duration}</Text>}
			{plant.specifications?.maximum_height?.cm && (
				<Text>Altura máx.: {plant.specifications.maximum_height.cm} cm</Text>
			)}
			{plant.flower_color && <Text>Color de flor: {plant.flower_color}</Text>}
			{plant.distribution?.native?.length > 0 && (
				<Text>Distribución nativa: {plant.distribution.native.join(", ")}</Text>
			)}
			{plant.flowering_months && (
				<Text>Época de floración: {plant.flowering_months}</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, marginTop: 20 },
	title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
	image: { width: "100%", height: 250, marginVertical: 20, borderRadius: 10 },
});
