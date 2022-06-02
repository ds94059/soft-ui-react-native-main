import React, { useCallback, useEffect, useRef } from 'react';
import { Linking, StatusBar, View } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';

// import { VLCPlayer, VlCPlayerView } from 'react-native-vlc-media-player';
// import Orientation from 'react-native-orientation';

// import Video from 'react-native-video'

const Camera = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);

    let vlcplayer = useRef();
    return (
        <Block safe marginTop={sizes.md}>
            <Block
                scroll
                paddingHorizontal={sizes.s}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: sizes.padding }}>
                <Block flex={0}>

                    <Image
                        background
                        resizeMode="cover"
                        padding={sizes.sm}
                        paddingBottom={sizes.l}
                        radius={sizes.cardRadius}
                        source={assets.background}>
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
                                {t('device.door.title')}
                            </Text>
                        </Button>
                        <Block align='center'>
                            {/* <VLCPlayer
                                videoAspectRatio="16:9"
                                source={{ uri: "rtsp://root:Jwell61791997@10.100.1.24:554/live1s1.sdp" }}
                                style={{ align: "center", width: 400, height: 400 }}
                            /> */}
                            {/* <Video
                                source={{ uri: "file:///Users/user/Downloads/rtsp-camera/filename.mp4" }}   // Can be a URL or a local file.
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                }}
                            /> */}
                        </Block>
                        <Block flex={0} align="center">
                            <Block row marginVertical={sizes.m}>
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    marginHorizontal={sizes.l}
                                    color="rgba(255,255,255,0.2)"
                                    outlined={String(colors.white)}>
                                    <Ionicons
                                        size={18}
                                        name="remove"
                                        color={colors.white}
                                    />
                                </Button>
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    marginHorizontal={sizes.l}
                                    color="rgba(255,255,255,0.2)"
                                    outlined={String(colors.white)}>
                                    <Ionicons
                                        size={18}
                                        name="add"
                                        color={colors.white}
                                    />
                                </Button>
                            </Block>
                        </Block>
                    </Image>
                </Block>
            </Block>
        </Block>
    );
};

export default Camera;