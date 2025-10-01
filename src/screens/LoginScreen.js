import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { auth } from "../../services/firebase";
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
} from "firebase/auth";

export default function LoginScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const login = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			navigation.replace("Home");
		} catch (error) {
			console.log("Error login:", error);
		}
	};

	const register = async () => {
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			navigation.replace("Home");
		} catch (error) {
			console.log("Error registro:", error);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>
			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				style={styles.input}
			/>
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				style={styles.input}
			/>
			<Button title="Ingresar" onPress={login} />
			<Button title="Registrarse" onPress={register} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", padding: 20 },
	title: { fontSize: 22, marginBottom: 20, textAlign: "center" },
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
	},
});
