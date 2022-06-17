import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text, Switch } from '../components';
import { useData, useTheme, useTranslation } from '../hooks';
import webSocket from "socket.io-client"

const iconSize = 130;

const endPoint = "http://20.219.220.110:5000";
const socket = webSocket(endPoint);
const macList = ['47B74C7E7C31', 'C522F405D062'];

const Bike = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [color, setColor] = useState("#000000")

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);


    useEffect(() => {
        if (isFocused) {
            initSocket();

        }
        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            console.log('killed');
        }
    }, [isFocused])

    const initSocket = () => {
        console.log('init websocket');
        socket.connect();

        for (let i = 0; i < macList.length; i++) {
            socket.on(`evpi/${macList[i]}/sensors`, data => {
                // console.log(`evpi/${macList[i]}/sensors: `, data)
                const object = JSON.parse(data.color_led)
                // console.log(data.color_led)
                setColor(object.color);
            })
        }
    }

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
                        source={assets.background}
                    >
                        <Block row align='center' flex={0} justify='space-between'>
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
                                    {t('device.bike.title')}
                                </Text>
                            </Button>
                        </Block>
                        <Block row marginVertical={sizes.s}>
                            <Block card align="center" marginHorizontal={sizes.s}>
                                <Button onPress={() => navigation.navigate('BikeLED')}>
                                    <Image source={require('../assets/images/led.png')} width={iconSize} height={iconSize} color={color} />
                                </Button>
                            </Block>
                            <Block card align="center" marginHorizontal={sizes.s}>
                                <Button onPress={() => navigation.navigate('BikeDashboard')}>
                                    <Image source={require('../assets/images/dashboard.png')} width={iconSize} height={iconSize} />
                                </Button>
                            </Block>
                        </Block>
                        <Block row marginVertical={sizes.s}>
                            <Block card marginHorizontal={sizes.s} align="center">
                                <Button onPress={() => navigation.navigate('Camera')}>
                                    <Image source={require('../assets/images/video_camera.png')} width={iconSize} height={iconSize} />
                                </Button>
                            </Block>
                            {/* <Block card marginHorizontal={sizes.s} align="center">
                                <Button>
                                    <Image source={require('../assets/images/led.png')} width={iconSize} height={iconSize} />
                                </Button>
                            </Block> */}
                        </Block>

                    </Image>
                </Block>
            </Block >
        </Block >
    );
};

export default Bike;