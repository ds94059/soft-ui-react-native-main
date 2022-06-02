import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { ColorPicker, TriangleColorPicker, fromHsv } from 'react-native-color-picker';

import { Block, Button, Image, Text, Switch } from '../components';
import { useData, useTheme, useTranslation } from '../hooks';
let count = 0;
let timer: NodeJS.Timeout;
let autoId: NodeJS.Timeout;

const IP_ADDR = 'http://192.168.112.70:5000/color/';

const Bike = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [oldColor, setOldColor] = useState("#FFFFFF");
    const [autoMode, setAutoMode] = useState(false);

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);


    useEffect(() => {
        if (isFocused) {
            //setColor('#ff00f0');
        }
    }, [isFocused])

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
                fetch(IP_ADDR + color.slice(1))
                    .then((response) => {
                        return response.json();
                    }).then((json) => {
                        console.log(json.status);
                    })
            } catch (error) {
                console.error(error);
            }
        }, 200);
    }

    const switchMode = (auto: boolean) => {
        setAutoMode(auto);
        if (auto) {
            autoId = setInterval(() => {
                try {
                    fetch(IP_ADDR)
                        .then((response) => {
                            return response.json();
                        }).then((json) => {
                            console.log(json.status);
                        })
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
                                    {t('device.bike.title')}
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

                        <Block width={"100%"} height={500}>
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
                </Block>
            </Block >
        </Block >
    );
};

export default Bike;