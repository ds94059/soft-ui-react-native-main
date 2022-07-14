import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text, Modal } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';

// import Orientation from 'react-native-orientation';

import { VLCPlayer, VlCPlayerView } from 'react-native-vlc-media-player';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const quantityData = ["EV_PI", "RESTROOM", "MAINDOOR"];
enum CAMERA_SRC {
    EV_PI = "rtsp://root:Jwell61791997@10.100.1.24:554/live1s1.sdp",
    RESTROOM = "rtsp://root:Jwell61791997@10.100.1.23:554/live1s1.sdp",
    MAINDOOR = "rtsp://root:Jwell61791997@10.100.1.22:554/live1s1.sdp",
}



const Camera = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState("MAINDOOR");
    const [cameraSrc, setCameraSrc] = useState(CAMERA_SRC.MAINDOOR);

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);

    const openLink = async () => {
        try {
            const url = 'https://4524-39-11-62-4.ngrok.io'
            if (await InAppBrowser.isAvailable()) {
                const result = await InAppBrowser.open(url, {
                    // iOS Properties
                    dismissButtonStyle: 'cancel',
                    preferredBarTintColor: '#453AA4',
                    preferredControlTintColor: 'white',
                    readerMode: false,
                    animated: true,
                    modalPresentationStyle: 'fullScreen',
                    modalTransitionStyle: 'coverVertical',
                    modalEnabled: true,
                    enableBarCollapsing: false,
                    // Android Properties
                    showTitle: true,
                    toolbarColor: '#6200EE',
                    secondaryToolbarColor: 'black',
                    navigationBarColor: 'black',
                    navigationBarDividerColor: 'white',
                    enableUrlBarHiding: true,
                    enableDefaultShare: true,
                    forceCloseOnRedirection: false,
                    // Specify full animation resource identifier(package:anim/name)
                    // or only resource name(in case of animation bundled with app).
                    animations: {
                        startEnter: 'slide_in_right',
                        startExit: 'slide_out_left',
                        endEnter: 'slide_in_left',
                        endExit: 'slide_out_right'
                    },
                    headers: {
                        'my-custom-header': 'my custom header value'
                    }
                })
                alert(JSON.stringify(result))
            }
            else Linking.openURL(url)
        } catch (error: any) {
            alert(error.message)
        }
    }

    const setCamera = (index: number) => {
        if (index == 0)
            setCameraSrc(CAMERA_SRC.EV_PI);
        else
            setCameraSrc(CAMERA_SRC.MAINDOOR);
    }

    return (
        <Block safe marginTop={sizes.md} >
            <Image
                style={{ flex: 1 }}
                background
                resizeMode="cover"
                padding={sizes.sm}
                paddingBottom={sizes.l}
                radius={sizes.cardRadius}
                source={assets.background}
            >
                <Button
                    row
                    flex={0}
                    justify="flex-start"
                    onPress={() => navigation.goBack()}>
                    <Image
                        radius={0}
                        width={10}
                        height={18}
                        color={colors.white}
                        source={assets.arrow}
                        transform={[{ rotate: '180deg' }]}
                    />
                    <Text p white marginLeft={sizes.s}>
                        {t('device.camera.title')}
                    </Text>
                </Button>
                <Block align='center' justify='center' >
                    <Button
                        row
                        gradient={gradients.dark}
                        onPress={() => setModal(true)}
                        marginHorizontal={sizes.m}
                        marginBottom={sizes.s}>
                        <Block
                            row
                            align="center"
                            justify="space-between"
                            paddingHorizontal={sizes.sm}>
                            <Text white bold marginRight={sizes.sm}>
                                {quantity}
                            </Text>
                            <Image
                                source={assets.arrow}
                                color={colors.white}
                                transform={[{ rotate: '90deg' }]}
                            />
                        </Block>
                    </Button>

                    <Button onPress={openLink} color={colors.white} marginVertical={sizes.s}>
                        <Text transform='uppercase' bold marginHorizontal={sizes.s}>
                            open camera
                        </Text>
                    </Button>
                    {/* <VlCPlayerView
                        videoAspectRatio="16:9"
                        url={cameraSrc}
                        style={{ align: "center", width: 400, height: 300, marginBottom: sizes.m, textColor: '#ffffff' }}
                    /> */}
                </Block>

            </Image>
            <Modal visible={showModal} onRequestClose={() => setModal(false)}>
                <FlatList
                    keyExtractor={(index) => `${index}`}
                    data={quantityData}
                    renderItem={({ item, index }) => (
                        <Button
                            marginBottom={sizes.sm}
                            onPress={() => {
                                setQuantity(item);
                                setModal(false);
                                setCamera(index);
                            }}>
                            <Text p white semibold>
                                {item}
                            </Text>
                        </Button>
                    )}
                />
            </Modal>
        </Block >
    );
};

export default Camera;