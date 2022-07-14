import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { ColorPicker, TriangleColorPicker, fromHsv } from 'react-native-color-picker';
import * as RNFS from 'react-native-fs';

import { Block, Button, Image, Text, Switch, Modal } from '../components';
import { useData, useTheme, useTranslation } from '../hooks';
import { WheelPicker } from "react-native-wheel-picker-android";

import { socket, selectMac } from './Bike'

let count = 0;
let timer: NodeJS.Timeout;
let autoId: NodeJS.Timeout;

const quantityData = ['front', 'front left', 'front right', 'eye left', 'eye right'];
const wheelPickerData = ["IDLE", "FILL", "WIPE", "BLINK", "BREATH", "SCROLL", "INIT", "BRAKE"];
enum COLOR_MODE {
    IDLE,
    FILL_ALL,
    COLOR_WIPE,
    COLOR_BLINK,
    COLOR_BREATH,
    SNAKE_SCROLL,
    INIT_STEERING,
    ENABLE_BRAKE,
};

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

    const [mode, setMode] = useState(0);

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        initSocket();
        initAuto();

        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);


    useEffect(() => {
        if (isFocused) {
        }
    }, [isFocused])

    const initSocket = () => {
        console.log('init websocket');
        if (!socket.connected)
            socket.connect();
        console.log(socket.connected);
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
            return;

        clearTimeout(timer);
        timer = setTimeout(() => {
            console.log('Change stopped');
            publishData(color);
        }, 200);
    }

    const switchMode = (auto: boolean) => {
        setAutoMode(auto);
        writeAuto(auto);
        if (auto) {
            autoId = setInterval(() => {
                try {
                    const R = Number((Math.random() * 255).toFixed(0))
                    const G = Number((Math.random() * 255).toFixed(0))
                    const B = Number((Math.random() * 255).toFixed(0))
                    const msg = {
                        mac: selectMac,
                        topic: "led_strips",
                        msg: {
                            target: quantity,
                            mode: mode,
                            color: [R, G, B]
                        }
                    }
                    socket.emit('evpi', JSON.stringify(msg));
                    console.log(JSON.stringify(msg));

                } catch (error) {
                    console.error(error);
                }
            }, 3000);
        }
        else
            clearInterval(autoId);
    }

    const publishData = (color: string) => {
        try {
            if (color == "")
                return;
            const R = parseInt(color.slice(1, 3), 16);
            const G = parseInt(color.slice(3, 5), 16);
            const B = parseInt(color.slice(5, 7), 16);

            const msg = {
                mac: selectMac,
                topic: "led_strips",
                msg: {
                    target: quantity,
                    mode: mode,
                    color: [R, G, B]
                }
            }

            socket.emit('evpi', JSON.stringify(msg));
            console.log(JSON.stringify(msg));
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Block safe marginTop={sizes.md}>
            <Block
                // scroll
                // paddingHorizontal={sizes.s}
                // showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: sizes.padding }}>
                <Block padding={sizes.sm} flex={1} white>
                    {/* <Image
                        background
                        resizeMode="cover"
                        padding={sizes.sm}
                        paddingBottom={sizes.l}
                        radius={sizes.cardRadius}
                        source={assets.background}
                    > */}
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
                                color={colors.gray}
                                source={assets.arrow}
                                transform={[{ rotate: '180deg' }]}
                            />
                            <Text p marginLeft={sizes.s}>
                                {t('device.bike.led.title')}
                            </Text>
                        </Button>
                    </Block>

                    <Block row >
                        <Block marginHorizontal={sizes.s}>
                            <Button
                                row
                                gradient={gradients.dark}
                                onPress={() => setModal(true)}

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
                        {/* <Block row justify='space-around' align='center' marginHorizontal={sizes.m} marginTop={sizes.m}>
                                <Button >
                                    <Image
                                        source={assets.arrow}
                                        color={colors.white}
                                        transform={[{ rotate: '180deg' }]}
                                        width={10}
                                    />
                                </Button>
                                <Text white>
                                    Mode
                                </Text>
                                <Button >
                                    <Image
                                        source={assets.arrow}
                                        color={colors.white}
                                        width={10}
                                    />
                                </Button>
                            </Block> */}
                        <Block marginHorizontal={sizes.s}>
                            <WheelPicker
                                style={{ width: '100%', height: '150%' }}
                                selectedItemTextFontFamily=''
                                itemTextFontFamily=''
                                selectedItem={mode}
                                data={wheelPickerData}
                                onItemSelected={(index) => { setMode(index); }}
                            />
                        </Block>
                    </Block>

                </Block>
                <Block flex={3} padding={sizes.sm}>
                    <Block width={"100%"} flex={10}>
                        <TriangleColorPicker
                            onColorSelected={(color) => alert(`Color selected: ${color}`)}
                            onColorChange={(color) => setColor(fromHsv(color))}
                            style={{ flex: 1 }}
                        />
                    </Block>
                    <Block marginTop={sizes.m} align='center'>
                        <Button
                            gradient={gradients.dark}
                            width={'30%'}
                            onPress={() => { publishData(oldColor) }}
                        >
                            <Text white bold transform="uppercase" >
                                Set
                            </Text>
                        </Button>
                    </Block>

                    <Block align="center" marginTop={sizes.l}>
                        <Text bold size={20} transform="uppercase">{oldColor}</Text>
                    </Block>
                    <Block justify="center" marginTop={sizes.s} row>
                        <Text bold size={20} transform="uppercase" marginHorizontal={sizes.s}>
                            R: {parseInt(oldColor.slice(1, 3), 16)}
                        </Text>
                        <Text bold size={20} transform="uppercase" marginHorizontal={sizes.s}>
                            G: {parseInt(oldColor.slice(3, 5), 16)}
                        </Text>
                        <Text bold size={20} transform="uppercase" marginHorizontal={sizes.s}>
                            B: {parseInt(oldColor.slice(5, 7), 16)}
                        </Text>
                    </Block>
                    {/* </Image> */}
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