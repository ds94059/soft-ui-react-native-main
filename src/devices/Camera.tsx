import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text, Modal } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';

// import Orientation from 'react-native-orientation';

import { VLCPlayer, VlCPlayerView } from 'react-native-vlc-media-player';

const cameraData = ['Camera1', 'Camera2'];
enum CAMERA_SRC {
    EV_PI = "rtsp://root:Jwell61791997@10.100.1.24:554/live1s1.sdp",
    RESTROOM = "rtsp://root:Jwell61791997@10.100.1.23:554/live1s1.sdp"
}


const Camera = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState("Camera1");
    const [selectedIdx, setIndex] = useState(0);
    const [cameraSrc, setCameraSrc] = useState(CAMERA_SRC.EV_PI);

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);

    const setCamera = (index: number) => {
        if (index == 0)
            setCameraSrc(CAMERA_SRC.EV_PI);
        else
            setCameraSrc(CAMERA_SRC.RESTROOM);
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
                    <VlCPlayerView
                        videoAspectRatio="16:9"
                        url={cameraSrc}
                        style={{ align: "center", width: 400, height: 300, marginBottom: sizes.m, textColor: '#ffffff' }}
                    />
                </Block>

            </Image>
            <Modal visible={showModal} onRequestClose={() => setModal(false)}>
                <FlatList
                    keyExtractor={(index) => `${index}`}
                    data={cameraData}
                    renderItem={({ item, index }) => (
                        <Button
                            marginBottom={sizes.sm}
                            onPress={() => {
                                setQuantity(item);
                                setModal(false);
                                setIndex(index);
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