import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { ColorPicker, TriangleColorPicker, fromHsv } from 'react-native-color-picker';
import * as RNFS from 'react-native-fs';

import { Block, Button, Image, Text, Switch, Modal } from '../components';
import { useData, useTheme, useTranslation } from '../hooks';
import webSocket from "socket.io-client"

let count = 0;
let timer: NodeJS.Timeout;
let autoId: NodeJS.Timeout;

const endPoint = "http://20.219.220.110:5000";
const socket = webSocket(endPoint);

const quantityData = ['front', 'back'];

const BikeLED = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [oldColor, setOldColor] = useState("#FFFFFF");
    const [autoMode, setAutoMode] = useState(false);

    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState(quantityData[0]);
    const [selectedIdx, setIndex] = useState(0);

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        initSocket();
        initAuto();

        return () => {
            StatusBar.setBarStyle('dark-content');
            // socket.disconnect();
        };
    }, []);


    useEffect(() => {
        if (isFocused) {
            //setColor('#ff00f0');
        }
    }, [isFocused])

    const initSocket = () => {
        console.log('init websocket');
        socket.connect();
    }

    const initAuto = async () => {
        // const path = '/storage/emulated/0/Download/data.json';
        const path = RNFS.DocumentDirectoryPath + '/auto.json';
        const exist = await RNFS.exists(path);
        if (exist) {
            RNFS.readFile(path, 'ascii')
                .then((res) => {
                    const data = JSON.parse(res);
                    setAutoMode(data);
                })
                .catch((err) => {
                    console.log(err.message, err.code);
                });
        }
        else {
            const data = false;
            RNFS.writeFile(path, JSON.stringify(data), 'utf8')
                .then((success) => {
                    console.log('FILE WRITTEN!');
                })
                .catch((err) => {
                    console.log(err.message);
                });
        }
    }

    const writeAuto = (auto: boolean) => {
        const path = RNFS.DocumentDirectoryPath + '/auto.json';

        RNFS.writeFile(path, JSON.stringify(auto), 'utf8')
            .then((success) => {
                console.log('FILE WRITTEN!');
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    const rgbToHex = (r: number, g: number, b: number) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }


    const setColor = (color: string) => {
        if (oldColor == color)
            return
        setOldColor(color);
        console.log(color);

        if (autoMode)
            return

        clearTimeout(timer);
        timer = setTimeout(() => {
            console.log('Change stopped');
            try {
                if (color == "")
                    return;
                const msg = {
                    topic: "color_led",
                    msg: {
                        target: quantity,
                        color: color
                    }
                }
                socket.emit('set_data', JSON.stringify(msg));
                console.log(JSON.stringify(msg))
            } catch (error) {
                console.error(error);
            }
        }, 200);
    }

    const switchMode = (auto: boolean) => {
        setAutoMode(auto);
        writeAuto(auto);
        if (auto) {
            autoId = setInterval(() => {
                try {
                    let r = Number((Math.random() * 255).toFixed(0))
                    let g = Number((Math.random() * 255).toFixed(0))
                    let b = Number((Math.random() * 255).toFixed(0))
                    const msg = {
                        topic: "color_led",
                        msg: {
                            target: quantity,
                            color: rgbToHex(r, g, b)
                        }
                    }
                    socket.emit('set_data', JSON.stringify(msg));
                    console.log(JSON.stringify(msg));

                } catch (error) {
                    console.error(error);
                }
            }, 3000);
        }
        else
            clearInterval(autoId);
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
                                    {t('device.bike.led.title')}
                                </Text>
                            </Button>
                            <Button
                                row
                                white
                                paddingHorizontal={sizes.s}
                                onPress={() => { switchMode(!autoMode) }}
                            >
                                <Text p paddingHorizontal={sizes.s}>
                                    Auto Mode
                                </Text>
                                <Switch
                                    checked={autoMode}
                                    onPress={() => { switchMode(!autoMode) }}
                                />
                            </Button>
                        </Block>

                        <Block>
                            <Button
                                row
                                gradient={gradients.dark}
                                onPress={() => setModal(true)}
                                marginHorizontal={sizes.m}
                                marginTop={sizes.sm}>
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

                        <Block width={"100%"} height={450}>
                            <TriangleColorPicker
                                onColorSelected={(color) => alert(`Color selected: ${color}`)}
                                onColorChange={(color) => setColor(fromHsv(color))}
                                style={{ flex: 1 }}
                            />
                        </Block>
                        <Block align="center" marginTop={sizes.m}>
                            <Text bold size={20} white transform="uppercase">{oldColor}</Text>
                        </Block>
                        <Block justify="center" marginTop={sizes.sm} row>
                            <Text bold size={20} white transform="uppercase" marginHorizontal={sizes.s}>
                                R: {parseInt(oldColor.slice(1, 3), 16)}
                            </Text>
                            <Text bold size={20} white transform="uppercase" marginHorizontal={sizes.s}>
                                G: {parseInt(oldColor.slice(3, 5), 16)}
                            </Text>
                            <Text bold size={20} white transform="uppercase" marginHorizontal={sizes.s}>
                                B: {parseInt(oldColor.slice(5, 7), 16)}
                            </Text>
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

export default BikeLED;