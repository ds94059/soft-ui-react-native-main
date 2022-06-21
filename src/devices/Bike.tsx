import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text, Switch, Modal } from '../components';
import { useData, useTheme, useTranslation } from '../hooks';
import webSocket from "socket.io-client"

const iconSize = 130;

export const endPoint = "http://20.219.220.110:5000";
// export const endPoint = "http://10.100.1.45:5000"
// export const endPoint = "http://192.168.47.70:5000"

export const socket = webSocket(endPoint);
export const macList = ['47B74C7E7C31', 'FD3962C2D421', 'DB50AD1A2C93'];
export let selectMac = macList[0];

const Bike = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [color, setColor] = useState("#000000");

    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState(macList[0]);
    const [selectedIdx, setIndex] = useState(0);

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        selectMac = macList[0];
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
            console.log('killed');
        }
    }, [isFocused])

    const initSocket = () => {
        console.log('init websocket');
        if (!socket.connected)
            socket.connect();
        console.log(socket.connected);

        for (let i = 0; i < macList.length; i++) {
            socket.on(`evpi/${macList[i]}/sensors`, data => {
                // console.log(`evpi/${macList[i]}/sensors: `, data)
                if (data.color_led) {
                    const R = data.color_led[2];
                    const G = data.color_led[3];
                    const B = data.color_led[4];
                    setColor(rgbToHex(R, G, B));
                }
            })
        }
    }

    const rgbToHex = (r: number, g: number, b: number) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    return (
        <Block safe marginTop={sizes.md}>
            <Block
                scroll
                // paddingHorizontal={sizes.s}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: sizes.padding }}>

                <Block row align='center' flex={0} justify='space-between' white padding={sizes.sm}>
                    <Button
                        row
                        flex={0}
                        justify="flex-start"
                        onPress={() => navigation.goBack()}>
                        <Image
                            radius={0}
                            width={10}
                            height={18}
                            color={colors.gray}
                            source={assets.arrow}
                            transform={[{ rotate: '180deg' }]}
                        />
                        <Text p marginLeft={sizes.s}>
                            {t('device.bike.title')}
                        </Text>
                    </Button>
                </Block>


                <Block flex={0}
                    padding={sizes.sm}

                >
                    {/* <Image
                        background
                        resizeMode="cover"
                        padding={sizes.sm}
                        paddingBottom={sizes.l}
                        radius={sizes.cardRadius}
                        source={assets.background}
                    > */}
                    <Block marginVertical={sizes.s} paddingHorizontal={sizes.s}>
                        <Button
                            row
                            gradient={gradients.dark}
                            onPress={() => setModal(true)}
                        >
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

                    {/* </Image> */}
                    <Modal visible={showModal} onRequestClose={() => setModal(false)}>
                        <FlatList
                            keyExtractor={(index) => `${index}`}
                            data={macList}
                            renderItem={({ item, index }) => (
                                <Button
                                    marginBottom={sizes.sm}
                                    onPress={() => {
                                        setQuantity(item);
                                        selectMac = item;
                                        setModal(false);
                                        setIndex(index);
                                    }}>
                                    <Text p white semibold>
                                        {item}
                                    </Text>
                                </Button>
                            )}
                        />
                    </Modal>
                </Block>
            </Block >
        </Block >
    );
};

export default Bike;