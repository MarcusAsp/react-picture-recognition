import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function Results({prediction, resetAllHandler}) {
    
	if (!prediction) return <View style={styles.container}><ActivityIndicator /></View>;

	const resetPrediction = () => {
		resetAllHandler()
	}

	return <View style={styles.container}><Text>{prediction[0].className}</Text>
		<TouchableOpacity style={styles.pictureButton} onPress={resetPrediction}>
			<Text style={styles.btnText}>{`<-`}</Text>
	</TouchableOpacity>
	</View>
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
		justifyContent: 'center',
	},
	pictureButton: {
		borderRadius: 50,
		backgroundColor: '#000',
		alignItems: 'center',
		justifyContent: 'center',
		justifySelf: 'flex-end',
		aspectRatio: 1,
		width: 50,
		marginTop: 50,
	},
	btnText: {
		color: "#fff"
	}
});
