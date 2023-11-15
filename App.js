import { Camera, CameraType } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

// * TensorFlow
import * as tf from '@tensorflow/tfjs';
import {fetch, decodeJpeg} from "@tensorflow/tfjs-react-native";
import * as mobilenet from '@tensorflow-models/mobilenet';
import Results from './components/results';

export default function App() {
	const cameraRef = useRef(null);
	const [permission, requestPermission] = Camera.useCameraPermissions();
	const [model, setTFModel] = useState(false);
	const [tfPrediction, setPrediction] = useState(false);
	const [photoTaken, setPhotoTaken] = useState(false);

	useEffect(() => {
		(async () => {
			if (!permission) requestPermission();

			// Load mobilenet.
			await tf.ready();
			setTFModel( await mobilenet.load({
    		version: 2,
    		alpha: 1.00,
  		}) );
		})();
	}, [])

	if (!permission || !permission.granted) {
		return <Text>Missing camera access</Text>
	}

	if (!model) {
		return <View style={styles.textContainer}><Text>Loading model...</Text></View>
	}

	const takePicture = async () => {

		setPhotoTaken(true)

		if (cameraRef.current) {
			const photo = await cameraRef.current.takePictureAsync();
			convertToUint8Array(photo.uri);
		}
	}

	const convertToUint8Array = async (localImgPath) => {
		console.log('Getting image...');
		try {
			const response = await fetch(localImgPath, {}, { isBinary: true });
      const imageDataArrayBuffer = await response.arrayBuffer();
      const imageData = new Uint8Array(imageDataArrayBuffer);
      const imageTensor = decodeJpeg(imageData);

      sendToAPI(imageTensor);
    } catch (error) {
      console.log('Error reading file:', error);
    }
	}

	const sendToAPI = async (imageTensor) => {
		console.log('Making predictions...');
		try {
			const prediction = await model.classify(imageTensor);

			if (prediction && prediction.length > 0) {
				setPrediction(prediction);
			} else {
				console.log('No prediction data recieved');
			}
			
		} catch (error) {
			console.error('API error:', error)
			throw error
		}
	}

	const resetAll = () => {
		setPrediction(false)
		setPhotoTaken(false)
	}

	return (
		<View style={styles.container}>
			{!photoTaken ? <Camera style={styles.camera} type={CameraType.back} ref={cameraRef}>
				<TouchableOpacity style={styles.pictureButton} onPress={takePicture}>
				</TouchableOpacity>
			</Camera> :
				<Results prediction={tfPrediction} resetAllHandler={resetAll} />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	camera: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	pictureButton: {
		borderRadius: 50,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
		aspectRatio: 1,
		width: 50,
		marginBottom: 40,
	},
	textContainer: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
