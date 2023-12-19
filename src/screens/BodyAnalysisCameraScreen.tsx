import { Camera, CameraCapturedPicture, CameraType, ImageType } from 'expo-camera';
import { Image } from 'expo-image'
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Button, IconButton, MD3Colors, Text } from 'react-native-paper'
import { styles } from "../styles/globalStyles";
import { uploadToFirebase } from '../firebase/firebase-config';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectAuthState } from '../features/auth';
import { setUserState } from '../features/user/slice';
import { selectUserState } from '../features/user';
import { updateUserInfo } from '../features/user/thunk';

const nextSideMap = {
    front: 'side',
    side: 'back',
    back: 'front'
}


export const BodyAnalysisCameraScreen = ({ route, navigation }) => {
    const dispatch = useAppDispatch();
    const { side } = route.params;
    const windowWidth = Dimensions.get('window').width;
    const cameraWidth = windowWidth * 0.9;
    const cameraHeight = cameraWidth * (4 / 3);
    const [countdown, setCountdown] = useState(5);
    const [showCountDown, setShowCountdown] = useState(false);
    const countdownTimer = useRef(null);
    const { uid } = useAppSelector(selectAuthState);
    const { photos } = useAppSelector(selectUserState);


    const [type, setType] = useState(CameraType.front);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const cameraRef = useRef<Camera>(null);
    const takePictureTimeout = useRef(null);
    const [takenPicture, setTakenPicture] = useState<CameraCapturedPicture>();

    const takePicture = () => {
        setCountdown(5);
        setShowCountdown(true);
        takePictureTimeout.current = setTimeout(async () => {
            const picture = await cameraRef.current.takePictureAsync({
                quality: 0.75,
                scale: 0.6,
                imageType: ImageType.jpg,
            });
            setTakenPicture(picture);
            setShowCountdown(false);
        }, 5000)
    }

    useEffect(() => {
        if (countdown >= 5) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = setInterval(() => setCountdown((v) => v - 1), 1000);
        }
        if (countdown === 0) {
            clearInterval(countdownTimer.current);
        }
    }, [countdown]);

    useEffect(() => {
        if (!!takenPicture) {
            clearTimeout(takePictureTimeout.current);
        }
    }, [takenPicture])

    const handlePictureUpload = async () => {
        try {
            const uploadResponse: any = await uploadToFirebase(takenPicture.uri, `${uid}_${side}_${Date.now().toFixed()}`, (currentUploadStatus) => { console.log({ currentUploadStatus }) })
            const newPhotos = [...photos, uploadResponse.downloadUrl ]
            dispatch(setUserState({photos: newPhotos}));
            dispatch(updateUserInfo({photos: newPhotos}));
            navigation.navigate('BodyAnalysisPictureScreen', { side: nextSideMap[side] })
        } catch (error) {
            console.error(error.message)
        }
    }


    if (!permission) {
        // Camera permissions are still loading
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button mode='contained' onPress={requestPermission} >grant permission</Button>
            </View>
        );
    }

    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }
    if (!takenPicture) {
        return (
            <View style={localStyles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>{`Take a picture of your ${side}`}</Text>
                </View>
                <View style={{ ...localStyles.cameraContainer, width: cameraWidth, height: cameraHeight }}>
                    <Camera useCamera2Api autoFocus ref={cameraRef} style={localStyles.camera} type={type}>
                        <View style={localStyles.buttonContainer}>
                            <IconButton size={26} icon="camera-flip-outline" iconColor={MD3Colors.secondary10} onPress={toggleCameraType} />
                        </View>
                    </Camera>
                </View>
                {showCountDown
                    ? <Text style={localStyles.countdownTimer}>{countdown}</Text>
                    : <IconButton size={60} style={{ marginTop: 16 }} icon="camera" onPress={takePicture} />
                }
            </View >
        );
    }

    return (
        <View style={localStyles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>{`Take a picture of your ${side}`}</Text>
            </View>
            <View style={{ ...localStyles.cameraContainer, width: cameraWidth, height: cameraHeight }}>
                <Image contentFit='contain' source={takenPicture.uri} style={localStyles.camera} />
            </View>
            <View style={localStyles.buttonsRow}>
                <Button icon='cancel' mode='contained-tonal' buttonColor='red' style={{ marginRight: 16 }} onPress={() => setTakenPicture(null)}>Decline</Button>
                <Button icon='check' mode='contained-tonal' buttonColor='green' style={{ marginLeft: 16 }} onPress={handlePictureUpload}>Accept</Button>
            </View>
        </View >
    );
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 56,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: "100%"
    },
    cameraContainer: {
        width: "100%",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: 'hidden'
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignSelf: "flex-start",
        width: '100%',
        position: 'absolute',
        bottom: 0,
        justifyContent: 'flex-end'
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    sizeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    galleryContainer: {
        flexDirection: 'row',
    },

    galleryImage: {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        width: 50,
        height: (50 * (4 / 3)),
        margin: 10
    },
    bodyImage: {
        flex: 1,
        height: '60%',
        width: 'auto'
    },
    buttonsRow: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    countdownTimer: {
        textAlign: 'center',
        fontSize: 40,
        fontWeight: 'bold',
        marginTop: 30
    }
})