import {styles} from './styles/styles';
import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { Camera, CameraType } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated'
// import * as faceapi from '@vladmandic/face-api';


export default function App() {
  const [faceDetected, setFaceDetected] = useState(false);
  const  [permission, requestPermission] = Camera.useCameraPermissions();
  const [expresion, setExpresion] = useState('Neutral');

 

  
  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  
  function handleFacesDetected({faces}) {
    const face = faces[0];
    if (face) {
      const {size, origin} = face.bounds;

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      };
      
      setFaceDetected(true);

      if (face.smilingProbability >= 0.5) {
        setExpresion('Contento'); 
      }  
  
      if (face.yawAngle < -10 || face.yawAngle > 10) {
        setExpresion('Sorprendido');
      }   
  
      
      if ((-25 < face.yawAngle < -20 || 20 < face.yawAngle < 25) && 
      face.openEyeProbability > 0.8 &&
      face.smilingProbability < 0.3 &&
      face.rightEyeCornerPosition.y > face.leftEyeCornerPosition.y)
      {   
        setExpresion('Asustado');  
      }
        
      if (face.openEyeProbability < 0.2 && face.openMouthProbability > 0.8) {
         setExpresion('Asqueado');
      }
  
      if (face.rollAngle < -30 || face.rollAngle > 30) {   
         setExpresion('Enfadado');
      }
  
      if (face.yawAngle < -20)  {
         setExpresion('Triste'); 
      } 
    } else {
      setExpresion('Neutral'); 
    }

  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      {translateX: faceValues.value.x},
      {translateY: faceValues.value.y},
    ],
    borderColor: faceDetected ? '#00FF00' : '#FF0000',
    borderWidth: faceDetected ? 4 : 0,

  
  }))

  useEffect(( ) => {
    // console.log(faceapi.nets)
    // ChargeModels()

    requestPermission()
  }, [])

  // const ChargeModels = async () => {
  //   const a = await faceapi.nets.faceExpressionNet.loadFromUri('./models')
  //   console.log(a)
  // }

  if (!permission?.granted) {
    return;  
  }

  return (
    <View style={styles.container}>
     

      {
        faceDetected && <Animated.View style={[animatedStyle]}>
        {faceDetected && (
          <>
            <Text style={styles.emotionText}>{expresion} </Text>
          </>
        )}
      </Animated.View>
      }
      <Camera style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.accurate ,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}

          
      />


    </View>
  );
}
